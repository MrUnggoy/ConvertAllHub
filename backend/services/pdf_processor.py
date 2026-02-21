import io
import tempfile
from typing import List, Dict, Any, Optional, Tuple
from pathlib import Path
import PyPDF2
from pdf2image import convert_from_bytes
from PIL import Image
import logging

logger = logging.getLogger(__name__)

class PDFProcessor:
    """Server-side PDF processing service"""
    
    @staticmethod
    async def pdf_to_images(
        pdf_data: bytes,
        output_format: str = 'png',
        dpi: int = 150,
        quality: int = 90,
        pages: Optional[List[int]] = None
    ) -> List[Tuple[bytes, str]]:
        """Convert PDF pages to images"""
        try:
            # Convert PDF to PIL Images
            images = convert_from_bytes(
                pdf_data,
                dpi=dpi,
                first_page=pages[0] if pages else None,
                last_page=pages[-1] if pages else None
            )
            
            results = []
            page_indices = pages if pages else list(range(1, len(images) + 1))
            
            for i, (image, page_num) in enumerate(zip(images, page_indices)):
                # Convert PIL Image to bytes
                img_buffer = io.BytesIO()
                
                if output_format.lower() == 'jpg':
                    # Convert RGBA to RGB for JPEG
                    if image.mode in ('RGBA', 'LA', 'P'):
                        rgb_image = Image.new('RGB', image.size, (255, 255, 255))
                        rgb_image.paste(image, mask=image.split()[-1] if image.mode == 'RGBA' else None)
                        image = rgb_image
                    
                    image.save(img_buffer, format='JPEG', quality=quality, optimize=True)
                    filename = f"page_{page_num}.jpg"
                    
                elif output_format.lower() == 'webp':
                    image.save(img_buffer, format='WebP', quality=quality, optimize=True)
                    filename = f"page_{page_num}.webp"
                    
                else:  # PNG
                    image.save(img_buffer, format='PNG', optimize=True)
                    filename = f"page_{page_num}.png"
                
                img_buffer.seek(0)
                results.append((img_buffer.getvalue(), filename))
            
            logger.info(f"Converted {len(results)} PDF pages to {output_format.upper()}")
            return results
            
        except Exception as e:
            logger.error(f"PDF to images conversion failed: {e}")
            raise
    
    @staticmethod
    async def extract_text(pdf_data: bytes, pages: Optional[List[int]] = None) -> Dict[str, Any]:
        """Extract text from PDF"""
        try:
            pdf_reader = PyPDF2.PdfReader(io.BytesIO(pdf_data))
            total_pages = len(pdf_reader.pages)
            
            # Determine which pages to process
            if pages:
                page_indices = [p - 1 for p in pages if 0 < p <= total_pages]  # Convert to 0-based
            else:
                page_indices = list(range(total_pages))
            
            extracted_text = []
            word_count = 0
            char_count = 0
            
            for page_idx in page_indices:
                try:
                    page = pdf_reader.pages[page_idx]
                    page_text = page.extract_text()
                    
                    if page_text.strip():
                        page_content = f"--- Page {page_idx + 1} ---\n{page_text}\n"
                        extracted_text.append(page_content)
                        
                        # Count words and characters
                        words = page_text.split()
                        word_count += len(words)
                        char_count += len(page_text)
                        
                except Exception as e:
                    logger.warning(f"Failed to extract text from page {page_idx + 1}: {e}")
                    continue
            
            full_text = "\n".join(extracted_text)
            
            return {
                'text': full_text,
                'pages_processed': len(page_indices),
                'total_pages': total_pages,
                'word_count': word_count,
                'character_count': char_count,
                'has_text': len(full_text.strip()) > 0
            }
            
        except Exception as e:
            logger.error(f"PDF text extraction failed: {e}")
            raise
    
    @staticmethod
    async def get_pdf_info(pdf_data: bytes) -> Dict[str, Any]:
        """Get PDF metadata and information"""
        try:
            pdf_reader = PyPDF2.PdfReader(io.BytesIO(pdf_data))
            
            # Basic info
            info = {
                'page_count': len(pdf_reader.pages),
                'file_size': len(pdf_data),
                'encrypted': pdf_reader.is_encrypted
            }
            
            # Metadata
            if pdf_reader.metadata:
                metadata = pdf_reader.metadata
                info.update({
                    'title': metadata.get('/Title', ''),
                    'author': metadata.get('/Author', ''),
                    'subject': metadata.get('/Subject', ''),
                    'creator': metadata.get('/Creator', ''),
                    'producer': metadata.get('/Producer', ''),
                    'creation_date': str(metadata.get('/CreationDate', '')),
                    'modification_date': str(metadata.get('/ModDate', ''))
                })
            
            # Page dimensions (first page)
            if len(pdf_reader.pages) > 0:
                first_page = pdf_reader.pages[0]
                mediabox = first_page.mediabox
                info.update({
                    'page_width': float(mediabox.width),
                    'page_height': float(mediabox.height),
                    'page_size': f"{float(mediabox.width)} x {float(mediabox.height)} pts"
                })
            
            return info
            
        except Exception as e:
            logger.error(f"Failed to get PDF info: {e}")
            raise
    
    @staticmethod
    async def merge_pdfs(pdf_files: List[bytes]) -> bytes:
        """Merge multiple PDFs into one"""
        try:
            merger = PyPDF2.PdfMerger()
            
            for pdf_data in pdf_files:
                pdf_reader = PyPDF2.PdfReader(io.BytesIO(pdf_data))
                merger.append(pdf_reader)
            
            output_buffer = io.BytesIO()
            merger.write(output_buffer)
            merger.close()
            
            output_buffer.seek(0)
            merged_pdf = output_buffer.getvalue()
            
            logger.info(f"Merged {len(pdf_files)} PDFs into single file")
            return merged_pdf
            
        except Exception as e:
            logger.error(f"PDF merge failed: {e}")
            raise
    
    @staticmethod
    async def split_pdf(pdf_data: bytes, page_ranges: List[Tuple[int, int]]) -> List[bytes]:
        """Split PDF into multiple files based on page ranges"""
        try:
            pdf_reader = PyPDF2.PdfReader(io.BytesIO(pdf_data))
            total_pages = len(pdf_reader.pages)
            
            results = []
            
            for start_page, end_page in page_ranges:
                # Validate page range
                start_idx = max(0, start_page - 1)  # Convert to 0-based
                end_idx = min(total_pages - 1, end_page - 1)
                
                if start_idx > end_idx:
                    continue
                
                # Create new PDF with specified pages
                writer = PyPDF2.PdfWriter()
                
                for page_idx in range(start_idx, end_idx + 1):
                    writer.add_page(pdf_reader.pages[page_idx])
                
                # Write to buffer
                output_buffer = io.BytesIO()
                writer.write(output_buffer)
                output_buffer.seek(0)
                
                results.append(output_buffer.getvalue())
            
            logger.info(f"Split PDF into {len(results)} files")
            return results
            
        except Exception as e:
            logger.error(f"PDF split failed: {e}")
            raise