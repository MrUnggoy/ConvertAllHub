import io
from typing import Tuple, Dict, Any, Optional
from PIL import Image, ImageEnhance, ImageFilter
import logging

logger = logging.getLogger(__name__)

class ImageProcessor:
    """Server-side image processing service"""
    
    @staticmethod
    async def convert_format(
        image_data: bytes,
        output_format: str,
        quality: int = 90,
        resize: Optional[Tuple[int, int]] = None,
        maintain_aspect_ratio: bool = True
    ) -> Tuple[bytes, str]:
        """Convert image format and optionally resize"""
        try:
            # Open image
            image = Image.open(io.BytesIO(image_data))
            
            # Handle transparency for JPEG
            if output_format.upper() == 'JPEG' and image.mode in ('RGBA', 'LA', 'P'):
                # Create white background
                rgb_image = Image.new('RGB', image.size, (255, 255, 255))
                if image.mode == 'P':
                    image = image.convert('RGBA')
                rgb_image.paste(image, mask=image.split()[-1] if image.mode == 'RGBA' else None)
                image = rgb_image
            
            # Resize if requested
            if resize:
                if maintain_aspect_ratio:
                    image.thumbnail(resize, Image.Resampling.LANCZOS)
                else:
                    image = image.resize(resize, Image.Resampling.LANCZOS)
            
            # Convert to output format
            output_buffer = io.BytesIO()
            
            if output_format.upper() == 'JPEG':
                image.save(output_buffer, format='JPEG', quality=quality, optimize=True)
                filename = 'converted.jpg'
            elif output_format.upper() == 'WEBP':
                image.save(output_buffer, format='WebP', quality=quality, optimize=True)
                filename = 'converted.webp'
            elif output_format.upper() == 'PNG':
                image.save(output_buffer, format='PNG', optimize=True)
                filename = 'converted.png'
            elif output_format.upper() == 'GIF':
                # Convert to palette mode for GIF
                if image.mode != 'P':
                    image = image.convert('P', palette=Image.ADAPTIVE)
                image.save(output_buffer, format='GIF', optimize=True)
                filename = 'converted.gif'
            else:
                raise ValueError(f"Unsupported output format: {output_format}")
            
            output_buffer.seek(0)
            result_data = output_buffer.getvalue()
            
            logger.info(f"Converted image to {output_format.upper()}, size: {len(result_data)} bytes")
            return result_data, filename
            
        except Exception as e:
            logger.error(f"Image format conversion failed: {e}")
            raise
    
    @staticmethod
    async def compress_image(
        image_data: bytes,
        quality: int = 80,
        max_width: Optional[int] = None,
        max_height: Optional[int] = None
    ) -> Tuple[bytes, Dict[str, Any]]:
        """Compress image with quality and size constraints"""
        try:
            image = Image.open(io.BytesIO(image_data))
            original_size = len(image_data)
            original_dimensions = image.size
            
            # Resize if max dimensions specified
            if max_width or max_height:
                max_size = (
                    max_width or image.width,
                    max_height or image.height
                )
                image.thumbnail(max_size, Image.Resampling.LANCZOS)
            
            # Compress based on original format or convert to JPEG for better compression
            output_buffer = io.BytesIO()
            
            if image.format == 'PNG' and quality < 95:
                # Convert PNG to JPEG for better compression
                if image.mode in ('RGBA', 'LA', 'P'):
                    rgb_image = Image.new('RGB', image.size, (255, 255, 255))
                    if image.mode == 'P':
                        image = image.convert('RGBA')
                    rgb_image.paste(image, mask=image.split()[-1] if image.mode == 'RGBA' else None)
                    image = rgb_image
                
                image.save(output_buffer, format='JPEG', quality=quality, optimize=True)
                filename = 'compressed.jpg'
            else:
                # Keep original format
                format_name = image.format or 'PNG'
                if format_name == 'JPEG':
                    image.save(output_buffer, format='JPEG', quality=quality, optimize=True)
                    filename = 'compressed.jpg'
                else:
                    image.save(output_buffer, format=format_name, optimize=True)
                    filename = f'compressed.{format_name.lower()}'
            
            output_buffer.seek(0)
            compressed_data = output_buffer.getvalue()
            compressed_size = len(compressed_data)
            
            compression_ratio = ((original_size - compressed_size) / original_size) * 100
            
            stats = {
                'original_size': original_size,
                'compressed_size': compressed_size,
                'compression_ratio': round(compression_ratio, 1),
                'original_dimensions': original_dimensions,
                'final_dimensions': image.size,
                'quality': quality
            }
            
            logger.info(f"Compressed image: {compression_ratio:.1f}% reduction")
            return compressed_data, stats
            
        except Exception as e:
            logger.error(f"Image compression failed: {e}")
            raise
    
    @staticmethod
    async def enhance_image(
        image_data: bytes,
        brightness: float = 1.0,
        contrast: float = 1.0,
        saturation: float = 1.0,
        sharpness: float = 1.0
    ) -> bytes:
        """Enhance image with brightness, contrast, saturation, and sharpness"""
        try:
            image = Image.open(io.BytesIO(image_data))
            
            # Apply enhancements
            if brightness != 1.0:
                enhancer = ImageEnhance.Brightness(image)
                image = enhancer.enhance(brightness)
            
            if contrast != 1.0:
                enhancer = ImageEnhance.Contrast(image)
                image = enhancer.enhance(contrast)
            
            if saturation != 1.0:
                enhancer = ImageEnhance.Color(image)
                image = enhancer.enhance(saturation)
            
            if sharpness != 1.0:
                enhancer = ImageEnhance.Sharpness(image)
                image = enhancer.enhance(sharpness)
            
            # Save enhanced image
            output_buffer = io.BytesIO()
            format_name = image.format or 'PNG'
            image.save(output_buffer, format=format_name, quality=95, optimize=True)
            
            output_buffer.seek(0)
            enhanced_data = output_buffer.getvalue()
            
            logger.info("Enhanced image with custom settings")
            return enhanced_data
            
        except Exception as e:
            logger.error(f"Image enhancement failed: {e}")
            raise
    
    @staticmethod
    async def apply_filter(image_data: bytes, filter_type: str) -> bytes:
        """Apply various filters to image"""
        try:
            image = Image.open(io.BytesIO(image_data))
            
            # Apply filter based on type
            if filter_type == 'blur':
                image = image.filter(ImageFilter.BLUR)
            elif filter_type == 'sharpen':
                image = image.filter(ImageFilter.SHARPEN)
            elif filter_type == 'edge_enhance':
                image = image.filter(ImageFilter.EDGE_ENHANCE)
            elif filter_type == 'emboss':
                image = image.filter(ImageFilter.EMBOSS)
            elif filter_type == 'grayscale':
                image = image.convert('L').convert('RGB')
            elif filter_type == 'sepia':
                # Convert to grayscale first
                grayscale = image.convert('L')
                # Apply sepia tone
                sepia = Image.new('RGB', image.size)
                pixels = sepia.load()
                gray_pixels = grayscale.load()
                
                for i in range(image.width):
                    for j in range(image.height):
                        gray = gray_pixels[i, j]
                        # Sepia formula
                        r = min(255, int(gray * 1.2))
                        g = min(255, int(gray * 1.0))
                        b = min(255, int(gray * 0.8))
                        pixels[i, j] = (r, g, b)
                
                image = sepia
            else:
                raise ValueError(f"Unsupported filter type: {filter_type}")
            
            # Save filtered image
            output_buffer = io.BytesIO()
            format_name = image.format or 'PNG'
            image.save(output_buffer, format=format_name, quality=95, optimize=True)
            
            output_buffer.seek(0)
            filtered_data = output_buffer.getvalue()
            
            logger.info(f"Applied {filter_type} filter to image")
            return filtered_data
            
        except Exception as e:
            logger.error(f"Image filter application failed: {e}")
            raise
    
    @staticmethod
    async def get_image_info(image_data: bytes) -> Dict[str, Any]:
        """Get image metadata and information"""
        try:
            image = Image.open(io.BytesIO(image_data))
            
            info = {
                'format': image.format,
                'mode': image.mode,
                'size': image.size,
                'width': image.width,
                'height': image.height,
                'file_size': len(image_data),
                'has_transparency': image.mode in ('RGBA', 'LA') or 'transparency' in image.info
            }
            
            # Add EXIF data if available
            if hasattr(image, '_getexif') and image._getexif():
                info['has_exif'] = True
            else:
                info['has_exif'] = False
            
            return info
            
        except Exception as e:
            logger.error(f"Failed to get image info: {e}")
            raise