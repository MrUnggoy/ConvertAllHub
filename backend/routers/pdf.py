from fastapi import APIRouter, UploadFile, File, HTTPException, Form, BackgroundTasks
from typing import Optional, List
import time
import uuid
import asyncio
import hashlib

from models.conversion_models import ConversionResponse, ConversionStatus, ProcessingOptions, BatchConversionResponse
from services.pdf_processor import PDFProcessor
from services.storage import get_storage_service
from services.cache import cache_service
from services.batch_processor import batch_processor

router = APIRouter()

@router.post("/to-image", response_model=ConversionResponse)
async def pdf_to_image(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    output_format: str = Form("png"),
    quality: Optional[int] = Form(80),
    dpi: Optional[int] = Form(150),
    pages: Optional[str] = Form(None)  # e.g., "1,3,5-7"
):
    """Convert PDF pages to images (real implementation)"""
    
    # Validate file type
    if not file.content_type or "pdf" not in file.content_type.lower():
        raise HTTPException(status_code=400, detail="File must be a PDF")
    
    # Validate parameters
    if output_format not in ['png', 'jpg', 'webp']:
        raise HTTPException(status_code=400, detail="Output format must be png, jpg, or webp")
    
    if not (50 <= dpi <= 600):
        raise HTTPException(status_code=400, detail="DPI must be between 50 and 600")
    
    processing_start = time.time()
    task_id = str(uuid.uuid4())
    
    try:
        # Read file data
        file_data = await file.read()
        file_hash = hashlib.sha256(file_data).hexdigest()
        
        # Parse page selection
        page_list = None
        if pages:
            page_list = []
            for part in pages.split(','):
                if '-' in part:
                    start, end = map(int, part.split('-'))
                    page_list.extend(range(start, end + 1))
                else:
                    page_list.append(int(part))
        
        # Check cache first
        cache_params = {
            'operation': 'pdf_to_image',
            'output_format': output_format,
            'quality': quality,
            'dpi': dpi,
            'pages': pages
        }
        
        cached_result = await cache_service.get_conversion_result(file_hash, cache_params)
        if cached_result:
            return ConversionResponse(**cached_result)
        
        # Process PDF to images
        image_results = await PDFProcessor.pdf_to_images(
            pdf_data=file_data,
            output_format=output_format,
            dpi=dpi,
            quality=quality,
            pages=page_list
        )
        
        # Upload images to storage
        storage_service = get_storage_service()
        uploaded_urls = []
        
        for image_data, filename in image_results:
            content_type = f"image/{output_format}"
            url = await storage_service.upload_file(image_data, filename, content_type)
            uploaded_urls.append(url)
        
        processing_time = time.time() - processing_start
        
        # Prepare response
        result_url = uploaded_urls[0] if len(uploaded_urls) == 1 else None
        
        response_data = {
            'status': ConversionStatus.SUCCESS,
            'result_url': result_url,
            'task_id': task_id,
            'metadata': {
                'input_filename': file.filename,
                'input_size': len(file_data),
                'output_format': output_format,
                'quality': quality,
                'dpi': dpi,
                'pages_converted': len(image_results),
                'output_urls': uploaded_urls,
                'processing_method': 'server_side'
            },
            'processing_time': processing_time
        }
        
        # Cache the result
        background_tasks.add_task(
            cache_service.set_conversion_result,
            file_hash,
            cache_params,
            response_data
        )
        
        return ConversionResponse(**response_data)
        
    except Exception as e:
        processing_time = time.time() - processing_start
        return ConversionResponse(
            status=ConversionStatus.ERROR,
            task_id=task_id,
            error_message=f"PDF conversion failed: {str(e)}",
            processing_time=processing_time
        )

@router.post("/extract-text", response_model=ConversionResponse)
async def extract_text_from_pdf(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    output_format: str = Form("txt"),
    pages: Optional[str] = Form(None)
):
    """Extract text from PDF (real implementation)"""
    
    if not file.content_type or "pdf" not in file.content_type.lower():
        raise HTTPException(status_code=400, detail="File must be a PDF")
    
    if output_format not in ['txt', 'json']:
        raise HTTPException(status_code=400, detail="Output format must be txt or json")
    
    processing_start = time.time()
    task_id = str(uuid.uuid4())
    
    try:
        # Read file data
        file_data = await file.read()
        file_hash = hashlib.sha256(file_data).hexdigest()
        
        # Parse page selection
        page_list = None
        if pages:
            page_list = []
            for part in pages.split(','):
                if '-' in part:
                    start, end = map(int, part.split('-'))
                    page_list.extend(range(start, end + 1))
                else:
                    page_list.append(int(part))
        
        # Check cache
        cache_params = {
            'operation': 'extract_text',
            'output_format': output_format,
            'pages': pages
        }
        
        cached_result = await cache_service.get_conversion_result(file_hash, cache_params)
        if cached_result:
            return ConversionResponse(**cached_result)
        
        # Extract text
        text_result = await PDFProcessor.extract_text(
            pdf_data=file_data,
            pages=page_list
        )
        
        # Create output file
        if output_format == 'json':
            import json
            output_content = json.dumps(text_result, indent=2).encode('utf-8')
            filename = f"extracted_text_{task_id}.json"
            content_type = "application/json"
        else:
            output_content = text_result['text'].encode('utf-8')
            filename = f"extracted_text_{task_id}.txt"
            content_type = "text/plain"
        
        # Upload to storage
        storage_service = get_storage_service()
        result_url = await storage_service.upload_file(
            output_content, filename, content_type
        )
        
        processing_time = time.time() - processing_start
        
        response_data = {
            'status': ConversionStatus.SUCCESS,
            'result_url': result_url,
            'task_id': task_id,
            'metadata': {
                'input_filename': file.filename,
                'output_format': output_format,
                'pages_processed': text_result['pages_processed'],
                'total_pages': text_result['total_pages'],
                'word_count': text_result['word_count'],
                'character_count': text_result['character_count'],
                'has_text': text_result['has_text'],
                'processing_method': 'server_side'
            },
            'processing_time': processing_time
        }
        
        # Cache the result
        background_tasks.add_task(
            cache_service.set_conversion_result,
            file_hash,
            cache_params,
            response_data
        )
        
        return ConversionResponse(**response_data)
        
    except Exception as e:
        processing_time = time.time() - processing_start
        return ConversionResponse(
            status=ConversionStatus.ERROR,
            task_id=task_id,
            error_message=f"Text extraction failed: {str(e)}",
            processing_time=processing_time
        )

@router.get("/status/{task_id}")
async def get_conversion_status(task_id: str):
    """Get conversion status (dummy implementation)"""
    
    # Simulate different statuses based on task_id
    if "error" in task_id:
        return ConversionResponse(
            status=ConversionStatus.ERROR,
            task_id=task_id,
            error_message="Dummy error: File processing failed"
        )
    elif "processing" in task_id:
        return ConversionResponse(
            status=ConversionStatus.PROCESSING,
            task_id=task_id,
            metadata={"progress": 65}
        )
    else:
        return ConversionResponse(
            status=ConversionStatus.SUCCESS,
            task_id=task_id,
            result_url=f"https://dummy-storage.com/converted/{task_id}.pdf"
        )

@router.post("/merge", response_model=ConversionResponse)
async def merge_pdfs(
    background_tasks: BackgroundTasks,
    files: List[UploadFile] = File(...)
):
    """Merge multiple PDF files into one"""
    
    if len(files) < 2:
        raise HTTPException(status_code=400, detail="At least 2 PDF files required for merging")
    
    if len(files) > 10:
        raise HTTPException(status_code=400, detail="Maximum 10 PDF files allowed for merging")
    
    processing_start = time.time()
    task_id = str(uuid.uuid4())
    
    try:
        # Validate all files are PDFs
        pdf_data_list = []
        total_size = 0
        
        for file in files:
            if not file.content_type or "pdf" not in file.content_type.lower():
                raise HTTPException(status_code=400, detail=f"File {file.filename} is not a PDF")
            
            file_data = await file.read()
            pdf_data_list.append(file_data)
            total_size += len(file_data)
        
        # Check total size limit (100MB for free users)
        if total_size > 100 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="Total file size exceeds 100MB limit")
        
        # Create cache key from all file hashes
        combined_hash = hashlib.sha256(b''.join(pdf_data_list)).hexdigest()
        cache_params = {'operation': 'merge_pdfs', 'file_count': len(files)}
        
        cached_result = await cache_service.get_conversion_result(combined_hash, cache_params)
        if cached_result:
            return ConversionResponse(**cached_result)
        
        # Merge PDFs
        merged_pdf = await PDFProcessor.merge_pdfs(pdf_data_list)
        
        # Upload merged PDF
        storage_service = get_storage_service()
        filename = f"merged_pdf_{task_id}.pdf"
        result_url = await storage_service.upload_file(
            merged_pdf, filename, "application/pdf"
        )
        
        processing_time = time.time() - processing_start
        
        response_data = {
            'status': ConversionStatus.SUCCESS,
            'result_url': result_url,
            'task_id': task_id,
            'metadata': {
                'input_files': [f.filename for f in files],
                'total_input_size': total_size,
                'output_size': len(merged_pdf),
                'files_merged': len(files),
                'processing_method': 'server_side'
            },
            'processing_time': processing_time
        }
        
        # Cache result
        background_tasks.add_task(
            cache_service.set_conversion_result,
            combined_hash,
            cache_params,
            response_data
        )
        
        return ConversionResponse(**response_data)
        
    except Exception as e:
        processing_time = time.time() - processing_start
        return ConversionResponse(
            status=ConversionStatus.ERROR,
            task_id=task_id,
            error_message=f"PDF merge failed: {str(e)}",
            processing_time=processing_time
        )

@router.post("/split", response_model=ConversionResponse)
async def split_pdf(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    page_ranges: str = Form(...)  # e.g., "1-3,5-7,10-12"
):
    """Split PDF into multiple files based on page ranges"""
    
    if not file.content_type or "pdf" not in file.content_type.lower():
        raise HTTPException(status_code=400, detail="File must be a PDF")
    
    processing_start = time.time()
    task_id = str(uuid.uuid4())
    
    try:
        # Parse page ranges
        ranges = []
        for range_str in page_ranges.split(','):
            range_str = range_str.strip()
            if '-' in range_str:
                start, end = map(int, range_str.split('-'))
                ranges.append((start, end))
            else:
                page_num = int(range_str)
                ranges.append((page_num, page_num))
        
        if len(ranges) > 20:
            raise HTTPException(status_code=400, detail="Maximum 20 page ranges allowed")
        
        # Read file
        file_data = await file.read()
        file_hash = hashlib.sha256(file_data).hexdigest()
        
        # Check cache
        cache_params = {
            'operation': 'split_pdf',
            'page_ranges': page_ranges
        }
        
        cached_result = await cache_service.get_conversion_result(file_hash, cache_params)
        if cached_result:
            return ConversionResponse(**cached_result)
        
        # Split PDF
        split_pdfs = await PDFProcessor.split_pdf(file_data, ranges)
        
        # Upload split PDFs
        storage_service = get_storage_service()
        uploaded_urls = []
        
        for i, pdf_data in enumerate(split_pdfs):
            filename = f"split_{task_id}_part_{i+1}.pdf"
            url = await storage_service.upload_file(
                pdf_data, filename, "application/pdf"
            )
            uploaded_urls.append(url)
        
        processing_time = time.time() - processing_start
        
        response_data = {
            'status': ConversionStatus.SUCCESS,
            'result_url': uploaded_urls[0] if len(uploaded_urls) == 1 else None,
            'task_id': task_id,
            'metadata': {
                'input_filename': file.filename,
                'input_size': len(file_data),
                'page_ranges': page_ranges,
                'files_created': len(split_pdfs),
                'output_urls': uploaded_urls,
                'processing_method': 'server_side'
            },
            'processing_time': processing_time
        }
        
        # Cache result
        background_tasks.add_task(
            cache_service.set_conversion_result,
            file_hash,
            cache_params,
            response_data
        )
        
        return ConversionResponse(**response_data)
        
    except Exception as e:
        processing_time = time.time() - processing_start
        return ConversionResponse(
            status=ConversionStatus.ERROR,
            task_id=task_id,
            error_message=f"PDF split failed: {str(e)}",
            processing_time=processing_time
        )

@router.post("/batch/to-image", response_model=BatchConversionResponse)
async def batch_pdf_to_image(
    background_tasks: BackgroundTasks,
    files: List[UploadFile] = File(...),
    output_format: str = Form("png"),
    quality: Optional[int] = Form(80),
    dpi: Optional[int] = Form(150)
):
    """Convert multiple PDF files to images in batch"""
    
    # Validate batch size
    if len(files) > 20:
        raise HTTPException(status_code=400, detail="Maximum 20 PDF files allowed per batch")
    
    # Validate all files are PDFs
    for file in files:
        if not file.content_type or "pdf" not in file.content_type.lower():
            raise HTTPException(status_code=400, detail=f"File {file.filename} is not a PDF")
    
    # Create batch
    options = {
        'output_format': output_format,
        'quality': quality,
        'dpi': dpi
    }
    
    batch_id = await batch_processor.create_batch(files, 'pdf_to_image', options)
    
    # Define processor function
    async def pdf_processor(file: UploadFile, opts: Dict[str, Any]) -> ConversionResponse:
        # Reset file position
        await file.seek(0)
        
        # Use existing single file conversion logic
        return await pdf_to_image(
            background_tasks=background_tasks,
            file=file,
            output_format=opts['output_format'],
            quality=opts['quality'],
            dpi=opts['dpi']
        )
    
    # Process batch
    result = await batch_processor.process_batch(batch_id, files, pdf_processor)
    return result

@router.post("/batch/extract-text", response_model=BatchConversionResponse)
async def batch_extract_text(
    background_tasks: BackgroundTasks,
    files: List[UploadFile] = File(...),
    output_format: str = Form("txt")
):
    """Extract text from multiple PDF files in batch"""
    
    if len(files) > 20:
        raise HTTPException(status_code=400, detail="Maximum 20 PDF files allowed per batch")
    
    for file in files:
        if not file.content_type or "pdf" not in file.content_type.lower():
            raise HTTPException(status_code=400, detail=f"File {file.filename} is not a PDF")
    
    options = {'output_format': output_format}
    batch_id = await batch_processor.create_batch(files, 'extract_text', options)
    
    async def text_processor(file: UploadFile, opts: Dict[str, Any]) -> ConversionResponse:
        await file.seek(0)
        return await extract_text_from_pdf(
            background_tasks=background_tasks,
            file=file,
            output_format=opts['output_format']
        )
    
    result = await batch_processor.process_batch(batch_id, files, text_processor)
    return result

@router.get("/batch/status/{batch_id}")
async def get_batch_status(batch_id: str):
    """Get batch processing status"""
    batch_info = batch_processor.get_batch_status(batch_id)
    
    if not batch_info:
        raise HTTPException(status_code=404, detail="Batch not found")
    
    return {
        "batch_id": batch_id,
        "status": batch_info['status'],
        "total_files": batch_info['total_files'],
        "completed": batch_info['completed'],
        "failed": batch_info['failed'],
        "progress_percentage": int((batch_info['completed'] + batch_info['failed']) / batch_info['total_files'] * 100)
    }

@router.get("/info/{task_id}")
async def get_pdf_info(task_id: str):
    """Get PDF information and metadata"""
    # This would typically retrieve info from a database
    # For now, return a placeholder response
    return {
        "task_id": task_id,
        "status": "completed",
        "info": {
            "pages": 5,
            "size": "A4",
            "encrypted": False,
            "title": "Sample Document"
        }
    }

