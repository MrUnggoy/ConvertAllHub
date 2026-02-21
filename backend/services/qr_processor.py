import io
import zipfile
from typing import Dict, Any, Optional, List, Tuple
import qrcode
from qrcode.image.styledpil import StyledPilImage
from qrcode.image.styles.moduledrawers import RoundedModuleDrawer, CircleModuleDrawer, SquareModuleDrawer
from qrcode.image.styles.colorfills import SolidFillColorMask
from PIL import Image, ImageDraw, ImageFont
import logging
import base64
import json

logger = logging.getLogger(__name__)

class QRProcessor:
    """Service for QR code generation and decoding"""
    
    @staticmethod
    def generate_qr_code(
        content: str,
        output_format: str = "png",
        size: int = 256,
        error_correction: str = "M",
        border: int = 4,
        fill_color: str = "black",
        back_color: str = "white",
        style: str = "square"
    ) -> Tuple[bytes, Dict[str, Any]]:
        """Generate QR code from text or URL"""
        try:
            # Map error correction levels
            error_correction_map = {
                "L": qrcode.constants.ERROR_CORRECT_L,  # ~7%
                "M": qrcode.constants.ERROR_CORRECT_M,  # ~15%
                "Q": qrcode.constants.ERROR_CORRECT_Q,  # ~25%
                "H": qrcode.constants.ERROR_CORRECT_H   # ~30%
            }
            
            error_level = error_correction_map.get(error_correction, qrcode.constants.ERROR_CORRECT_M)
            
            # Create QR code instance
            qr = qrcode.QRCode(
                version=1,  # Auto-determine version
                error_correction=error_level,
                box_size=10,
                border=border,
            )
            
            qr.add_data(content)
            qr.make(fit=True)
            
            # Generate image based on style
            if style == "rounded":
                img = qr.make_image(
                    image_factory=StyledPilImage,
                    module_drawer=RoundedModuleDrawer(),
                    fill_color=fill_color,
                    back_color=back_color
                )
            elif style == "circle":
                img = qr.make_image(
                    image_factory=StyledPilImage,
                    module_drawer=CircleModuleDrawer(),
                    fill_color=fill_color,
                    back_color=back_color
                )
            else:  # square (default)
                img = qr.make_image(
                    fill_color=fill_color,
                    back_color=back_color
                )
            
            # Resize to requested size
            img = img.resize((size, size), Image.Resampling.LANCZOS)
            
            # Convert to bytes
            output_buffer = io.BytesIO()
            
            if output_format.lower() == "png":
                img.save(output_buffer, format="PNG", optimize=True)
            elif output_format.lower() == "jpg" or output_format.lower() == "jpeg":
                # Convert to RGB for JPEG
                if img.mode in ('RGBA', 'LA', 'P'):
                    rgb_img = Image.new('RGB', img.size, back_color)
                    rgb_img.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
                    img = rgb_img
                img.save(output_buffer, format="JPEG", quality=95, optimize=True)
            elif output_format.lower() == "webp":
                img.save(output_buffer, format="WebP", quality=95, optimize=True)
            elif output_format.lower() == "svg":
                # For SVG, we need to use a different approach
                from qrcode.image.svg import SvgPathImage
                qr_svg = qrcode.QRCode(
                    version=1,
                    error_correction=error_level,
                    box_size=size//25,  # Adjust box size for SVG
                    border=border,
                )
                qr_svg.add_data(content)
                qr_svg.make(fit=True)
                
                svg_img = qr_svg.make_image(image_factory=SvgPathImage)
                svg_content = svg_img.to_string(encoding='unicode')
                output_buffer.write(svg_content.encode('utf-8'))
            else:
                raise ValueError(f"Unsupported output format: {output_format}")
            
            output_buffer.seek(0)
            qr_data = output_buffer.getvalue()
            
            # Detect content type
            content_type = "text"
            if content.startswith(("http://", "https://")):
                content_type = "url"
            elif content.startswith("mailto:"):
                content_type = "email"
            elif content.startswith("tel:"):
                content_type = "phone"
            elif content.startswith("wifi:"):
                content_type = "wifi"
            elif content.startswith("geo:"):
                content_type = "location"
            
            metadata = {
                "content_preview": content[:100] + "..." if len(content) > 100 else content,
                "content_length": len(content),
                "content_type": content_type,
                "output_format": output_format,
                "size": f"{size}x{size}",
                "error_correction": error_correction,
                "border": border,
                "qr_version": qr.version,
                "data_modules": qr.modules_count,
                "style": style,
                "colors": {
                    "fill": fill_color,
                    "background": back_color
                },
                "file_size": len(qr_data)
            }
            
            logger.info(f"Generated QR code: {len(content)} chars -> {len(qr_data)} bytes")
            return qr_data, metadata
            
        except Exception as e:
            logger.error(f"QR code generation failed: {e}")
            raise
    
    @staticmethod
    def decode_qr_code(image_data: bytes) -> Tuple[List[str], Dict[str, Any]]:
        """Decode QR code(s) from image"""
        try:
            # Try to import pyzbar for QR decoding
            try:
                from pyzbar import pyzbar
                from pyzbar.pyzbar import ZBarSymbol
            except ImportError:
                raise ImportError("pyzbar library is required for QR code decoding. Install with: pip install pyzbar")
            
            # Open image
            image = Image.open(io.BytesIO(image_data))
            
            # Convert to RGB if necessary
            if image.mode not in ('RGB', 'L'):
                image = image.convert('RGB')
            
            # Decode QR codes
            decoded_objects = pyzbar.decode(image, symbols=[ZBarSymbol.QRCODE])
            
            if not decoded_objects:
                # Try with different image processing
                # Convert to grayscale and enhance contrast
                gray_image = image.convert('L')
                enhanced_image = gray_image.point(lambda x: 0 if x < 128 else 255, '1')
                decoded_objects = pyzbar.decode(enhanced_image, symbols=[ZBarSymbol.QRCODE])
            
            decoded_contents = []
            qr_details = []
            
            for obj in decoded_objects:
                try:
                    content = obj.data.decode('utf-8')
                    decoded_contents.append(content)
                    
                    # Analyze content type
                    content_type = "text"
                    if content.startswith(("http://", "https://")):
                        content_type = "url"
                    elif content.startswith("mailto:"):
                        content_type = "email"
                    elif content.startswith("tel:"):
                        content_type = "phone"
                    elif content.startswith("wifi:"):
                        content_type = "wifi"
                    elif content.startswith("geo:"):
                        content_type = "location"
                    
                    qr_details.append({
                        "content": content,
                        "content_type": content_type,
                        "content_length": len(content),
                        "position": {
                            "left": obj.rect.left,
                            "top": obj.rect.top,
                            "width": obj.rect.width,
                            "height": obj.rect.height
                        },
                        "polygon": [(point.x, point.y) for point in obj.polygon],
                        "quality": obj.quality if hasattr(obj, 'quality') else None
                    })
                    
                except UnicodeDecodeError:
                    # Try other encodings
                    for encoding in ['latin-1', 'cp1252', 'iso-8859-1']:
                        try:
                            content = obj.data.decode(encoding)
                            decoded_contents.append(content)
                            qr_details.append({
                                "content": content,
                                "content_type": "binary",
                                "encoding": encoding,
                                "content_length": len(content)
                            })
                            break
                        except UnicodeDecodeError:
                            continue
                    else:
                        # If all encodings fail, store as base64
                        content = base64.b64encode(obj.data).decode('ascii')
                        decoded_contents.append(f"base64:{content}")
                        qr_details.append({
                            "content": f"base64:{content}",
                            "content_type": "binary",
                            "encoding": "base64",
                            "original_length": len(obj.data)
                        })
            
            metadata = {
                "qr_codes_found": len(decoded_objects),
                "image_size": image.size,
                "image_mode": image.mode,
                "qr_details": qr_details,
                "success": len(decoded_objects) > 0
            }
            
            if decoded_contents:
                logger.info(f"Decoded {len(decoded_contents)} QR code(s) from image")
            else:
                logger.warning("No QR codes found in image")
            
            return decoded_contents, metadata
            
        except Exception as e:
            logger.error(f"QR code decoding failed: {e}")
            raise
    
    @staticmethod
    def batch_generate_qr_codes(
        content_list: List[str],
        output_format: str = "png",
        size: int = 256,
        error_correction: str = "M",
        border: int = 4,
        naming_pattern: str = "qr_{index}"
    ) -> Tuple[bytes, Dict[str, Any]]:
        """Generate multiple QR codes and return as ZIP archive"""
        try:
            if len(content_list) > 1000:
                raise ValueError("Maximum 1000 QR codes per batch")
            
            zip_buffer = io.BytesIO()
            successful_codes = 0
            failed_codes = 0
            file_list = []
            
            with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
                for i, content in enumerate(content_list):
                    try:
                        # Generate QR code
                        qr_data, qr_metadata = QRProcessor.generate_qr_code(
                            content,
                            output_format=output_format,
                            size=size,
                            error_correction=error_correction,
                            border=border
                        )
                        
                        # Create filename
                        filename = naming_pattern.format(
                            index=i+1,
                            content=content[:20].replace('/', '_').replace('\\', '_')
                        )
                        filename = f"{filename}.{output_format}"
                        
                        # Add to ZIP
                        zip_file.writestr(filename, qr_data)
                        file_list.append({
                            "filename": filename,
                            "content_preview": content[:50] + "..." if len(content) > 50 else content,
                            "size": len(qr_data),
                            "success": True
                        })
                        successful_codes += 1
                        
                    except Exception as e:
                        logger.warning(f"Failed to generate QR code {i+1}: {e}")
                        failed_codes += 1
                        file_list.append({
                            "filename": f"failed_{i+1}.txt",
                            "content_preview": content[:50] + "..." if len(content) > 50 else content,
                            "error": str(e),
                            "success": False
                        })
                
                # Add summary file
                summary = {
                    "total_requested": len(content_list),
                    "successful": successful_codes,
                    "failed": failed_codes,
                    "settings": {
                        "output_format": output_format,
                        "size": size,
                        "error_correction": error_correction,
                        "border": border
                    },
                    "files": file_list
                }
                
                zip_file.writestr("batch_summary.json", json.dumps(summary, indent=2))
            
            zip_buffer.seek(0)
            zip_data = zip_buffer.getvalue()
            
            metadata = {
                "total_qr_codes": len(content_list),
                "successful_codes": successful_codes,
                "failed_codes": failed_codes,
                "output_format": output_format,
                "size": f"{size}x{size}",
                "error_correction": error_correction,
                "archive_size": len(zip_data),
                "files_in_archive": len(file_list) + 1,  # +1 for summary
                "naming_pattern": naming_pattern
            }
            
            logger.info(f"Generated batch of {successful_codes}/{len(content_list)} QR codes")
            return zip_data, metadata
            
        except Exception as e:
            logger.error(f"Batch QR code generation failed: {e}")
            raise
    
    @staticmethod
    def create_vcard_qr(
        name: str,
        phone: Optional[str] = None,
        email: Optional[str] = None,
        organization: Optional[str] = None,
        url: Optional[str] = None,
        **kwargs
    ) -> Tuple[bytes, Dict[str, Any]]:
        """Generate QR code for vCard (contact information)"""
        try:
            # Build vCard content
            vcard_lines = ["BEGIN:VCARD", "VERSION:3.0"]
            
            vcard_lines.append(f"FN:{name}")
            
            if phone:
                vcard_lines.append(f"TEL:{phone}")
            
            if email:
                vcard_lines.append(f"EMAIL:{email}")
            
            if organization:
                vcard_lines.append(f"ORG:{organization}")
            
            if url:
                vcard_lines.append(f"URL:{url}")
            
            vcard_lines.append("END:VCARD")
            vcard_content = "\n".join(vcard_lines)
            
            # Generate QR code
            qr_data, qr_metadata = QRProcessor.generate_qr_code(
                vcard_content,
                **kwargs
            )
            
            # Update metadata
            qr_metadata.update({
                "content_type": "vcard",
                "vcard_fields": {
                    "name": name,
                    "phone": phone,
                    "email": email,
                    "organization": organization,
                    "url": url
                }
            })
            
            logger.info(f"Generated vCard QR code for {name}")
            return qr_data, qr_metadata
            
        except Exception as e:
            logger.error(f"vCard QR code generation failed: {e}")
            raise
    
    @staticmethod
    def create_wifi_qr(
        ssid: str,
        password: str,
        security: str = "WPA",
        hidden: bool = False,
        **kwargs
    ) -> Tuple[bytes, Dict[str, Any]]:
        """Generate QR code for WiFi connection"""
        try:
            # Build WiFi QR content
            wifi_content = f"WIFI:T:{security};S:{ssid};P:{password};H:{'true' if hidden else 'false'};;"
            
            # Generate QR code
            qr_data, qr_metadata = QRProcessor.generate_qr_code(
                wifi_content,
                **kwargs
            )
            
            # Update metadata
            qr_metadata.update({
                "content_type": "wifi",
                "wifi_config": {
                    "ssid": ssid,
                    "security": security,
                    "hidden": hidden,
                    "has_password": bool(password)
                }
            })
            
            logger.info(f"Generated WiFi QR code for network: {ssid}")
            return qr_data, qr_metadata
            
        except Exception as e:
            logger.error(f"WiFi QR code generation failed: {e}")
            raise