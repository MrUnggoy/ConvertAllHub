from fastapi import APIRouter, UploadFile, File, HTTPException, Form, BackgroundTasks
from typing import Optional, List, Dict, Any
import time
import uuid
import asyncio

from models.conversion_models import ConversionResponse, ConversionStatus, BatchConversionResponse
from services.batch_processor import batch_processor

router = APIRouter()

@router.post("/convert", response_model=ConversionResponse)
async def convert_image_format(
    file: UploadFile = File(...),
    output_format: str = Form("png"),
    quality: Optional[int] = Form(80),
    resize_width: Optional[int] = Form(None),
    resize_height: Optional[int] = Form(None)
):
    """Convert image between formats (dummy implementation)"""
    
    # Validate file type
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    processing_start = time.time()
    task_id = str(uuid.uuid4())
    
    # Simulate processing
    await asyncio.sleep(0.2)
    
    processing_time = time.time() - processing_start
    
    return ConversionResponse(
        status=ConversionStatus.SUCCESS,
        result_url=f"https://dummy-storage.com/converted/{task_id}.{output_format}",
        task_id=task_id,
        metadata={
            "input_filename": file.filename,
            "input_format": file.content_type,
            "output_format": output_format,
            "quality": quality,
            "original_size": "1920x1080",  # Dummy dimensions
            "output_size": f"{resize_width or 1920}x{resize_height or 1080}"
        },
        processing_time=processing_time
    )

@router.post("/remove-background", response_model=ConversionResponse)
async def remove_background(
    file: UploadFile = File(...),
    model: Optional[str] = Form("u2net"),
    alpha_matting: Optional[bool] = Form(False)
):
    """Remove background from image using AI (dummy implementation)"""
    
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    processing_start = time.time()
    task_id = str(uuid.uuid4())
    
    # Simulate AI processing (longer delay)
    await asyncio.sleep(1.0)
    
    processing_time = time.time() - processing_start
    
    return ConversionResponse(
        status=ConversionStatus.SUCCESS,
        result_url=f"https://dummy-storage.com/converted/{task_id}.png",
        task_id=task_id,
        metadata={
            "input_filename": file.filename,
            "model_used": model,
            "alpha_matting": alpha_matting,
            "confidence_score": 0.95,  # Dummy confidence
            "processing_method": "client_side_ai"
        },
        processing_time=processing_time
    )

@router.post("/compress", response_model=ConversionResponse)
async def compress_image(
    file: UploadFile = File(...),
    quality: int = Form(80),
    max_width: Optional[int] = Form(None),
    max_height: Optional[int] = Form(None)
):
    """Compress image file (dummy implementation)"""
    
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    processing_start = time.time()
    task_id = str(uuid.uuid4())
    
    await asyncio.sleep(0.3)
    
    processing_time = time.time() - processing_start
    
    # Simulate compression results
    original_size = 2500000  # 2.5MB dummy
    compressed_size = int(original_size * (quality / 100) * 0.7)
    
    return ConversionResponse(
        status=ConversionStatus.SUCCESS,
        result_url=f"https://dummy-storage.com/converted/{task_id}.jpg",
        task_id=task_id,
        metadata={
            "input_filename": file.filename,
            "quality": quality,
            "original_size_bytes": original_size,
            "compressed_size_bytes": compressed_size,
            "compression_ratio": f"{((original_size - compressed_size) / original_size * 100):.1f}%",
            "max_dimensions": f"{max_width or 'auto'}x{max_height or 'auto'}"
        },
        processing_time=processing_time
    )

@router.post("/batch/convert", response_model=BatchConversionResponse)
async def batch_convert_images(
    background_tasks: BackgroundTasks,
    files: List[UploadFile] = File(...),
    output_format: str = Form("png"),
    quality: Optional[int] = Form(80),
    resize_width: Optional[int] = Form(None),
    resize_height: Optional[int] = Form(None)
):
    """Convert multiple images in batch"""
    
    if len(files) > 30:
        raise HTTPException(status_code=400, detail="Maximum 30 images allowed per batch")
    
    # Validate all files are images
    for file in files:
        if not file.content_type or not file.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail=f"File {file.filename} is not an image")
    
    options = {
        'output_format': output_format,
        'quality': quality,
        'resize_width': resize_width,
        'resize_height': resize_height
    }
    
    batch_id = await batch_processor.create_batch(files, 'image_convert', options)
    
    async def image_processor(file: UploadFile, opts: Dict[str, Any]) -> ConversionResponse:
        await file.seek(0)
        return await convert_image_format(
            file=file,
            output_format=opts['output_format'],
            quality=opts['quality'],
            resize_width=opts['resize_width'],
            resize_height=opts['resize_height']
        )
    
    result = await batch_processor.process_batch(batch_id, files, image_processor)
    return result

@router.post("/batch/remove-background", response_model=BatchConversionResponse)
async def batch_remove_background(
    background_tasks: BackgroundTasks,
    files: List[UploadFile] = File(...),
    model: Optional[str] = Form("u2net"),
    alpha_matting: Optional[bool] = Form(False)
):
    """Remove background from multiple images in batch"""
    
    if len(files) > 10:  # Lower limit for AI processing
        raise HTTPException(status_code=400, detail="Maximum 10 images allowed for batch background removal")
    
    for file in files:
        if not file.content_type or not file.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail=f"File {file.filename} is not an image")
    
    options = {
        'model': model,
        'alpha_matting': alpha_matting
    }
    
    batch_id = await batch_processor.create_batch(files, 'remove_background', options)
    
    async def bg_processor(file: UploadFile, opts: Dict[str, Any]) -> ConversionResponse:
        await file.seek(0)
        return await remove_background(
            file=file,
            model=opts['model'],
            alpha_matting=opts['alpha_matting']
        )
    
    result = await batch_processor.process_batch(batch_id, files, bg_processor)
    return result

@router.get("/batch/status/{batch_id}")
async def get_image_batch_status(batch_id: str):
    """Get image batch processing status"""
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