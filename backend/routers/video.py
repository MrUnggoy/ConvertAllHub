from fastapi import APIRouter, UploadFile, File, HTTPException, Form
from typing import Optional
import time
import uuid
import asyncio

from models.conversion_models import ConversionResponse, ConversionStatus
from services.video_processor import VideoProcessor
from services.storage import StorageService

router = APIRouter()
video_processor = VideoProcessor()
storage_service = StorageService()

@router.post("/convert", response_model=ConversionResponse)
async def convert_video_format(
    file: UploadFile = File(...),
    output_format: str = Form("mp4"),
    quality: Optional[str] = Form("medium"),
    resolution: Optional[str] = Form(None),
    fps: Optional[int] = Form(None),
    video_codec: Optional[str] = Form(None),
    audio_codec: Optional[str] = Form(None)
):
    """Convert video between formats using FFmpeg"""
    
    if not file.content_type or not file.content_type.startswith("video/"):
        raise HTTPException(status_code=400, detail="File must be a video file")
    
    # Validate output format
    supported_formats = ['mp4', 'webm', 'avi', 'mov', 'mkv']
    if output_format.lower() not in supported_formats:
        raise HTTPException(status_code=400, detail=f"Unsupported output format. Supported: {', '.join(supported_formats)}")
    
    # Validate quality
    if quality not in ['low', 'medium', 'high']:
        raise HTTPException(status_code=400, detail="Quality must be 'low', 'medium', or 'high'")
    
    processing_start = time.time()
    task_id = str(uuid.uuid4())
    
    try:
        # Read file data
        file_data = await file.read()
        
        # Convert video
        converted_data, metadata = await video_processor.convert_format(
            file_data,
            output_format,
            quality=quality,
            resolution=resolution,
            fps=fps,
            video_codec=video_codec,
            audio_codec=audio_codec,
            task_id=task_id,
            filename=file.filename
        )
        
        # Store converted video
        filename = f"{task_id}.{output_format}"
        result_url = await storage_service.store_file(converted_data, filename)
        
        processing_time = time.time() - processing_start
        
        # Update metadata with input info
        metadata.update({
            "input_filename": file.filename,
            "task_id": task_id,
            "file_size_mb": round(len(converted_data) / (1024 * 1024), 2)
        })
        
        return ConversionResponse(
            status=ConversionStatus.SUCCESS,
            result_url=result_url,
            task_id=task_id,
            metadata=metadata,
            processing_time=processing_time
        )
        
    except Exception as e:
        processing_time = time.time() - processing_start
        return ConversionResponse(
            status=ConversionStatus.ERROR,
            task_id=task_id,
            error_message=str(e),
            processing_time=processing_time
        )

@router.post("/compress", response_model=ConversionResponse)
async def compress_video(
    file: UploadFile = File(...),
    compression_level: str = Form("medium"),
    target_size_mb: Optional[int] = Form(None),
    max_resolution: Optional[str] = Form(None),
    max_bitrate: Optional[str] = Form(None)
):
    """Compress video file using FFmpeg"""
    
    if not file.content_type or not file.content_type.startswith("video/"):
        raise HTTPException(status_code=400, detail="File must be a video file")
    
    # Validate compression level
    if compression_level not in ['low', 'medium', 'high']:
        raise HTTPException(status_code=400, detail="Compression level must be 'low', 'medium', or 'high'")
    
    processing_start = time.time()
    task_id = str(uuid.uuid4())
    
    try:
        # Read file data
        file_data = await file.read()
        
        # Compress video
        compressed_data, metadata = await video_processor.compress_video(
            file_data,
            compression_level=compression_level,
            target_size_mb=target_size_mb,
            max_resolution=max_resolution,
            max_bitrate=max_bitrate
        )
        
        # Store compressed video
        filename = f"{task_id}.mp4"
        result_url = await storage_service.store_file(compressed_data, filename)
        
        processing_time = time.time() - processing_start
        
        # Update metadata with input info
        metadata.update({
            "input_filename": file.filename,
            "task_id": task_id
        })
        
        return ConversionResponse(
            status=ConversionStatus.SUCCESS,
            result_url=result_url,
            task_id=task_id,
            metadata=metadata,
            processing_time=processing_time
        )
        
    except Exception as e:
        processing_time = time.time() - processing_start
        return ConversionResponse(
            status=ConversionStatus.ERROR,
            task_id=task_id,
            error_message=str(e),
            processing_time=processing_time
        )

@router.post("/thumbnail", response_model=ConversionResponse)
async def generate_thumbnail(
    file: UploadFile = File(...),
    timestamp: Optional[float] = Form(10.0),
    width: Optional[int] = Form(320),
    height: Optional[int] = Form(240),
    format: Optional[str] = Form("jpg")
):
    """Generate thumbnail from video using FFmpeg"""
    
    if not file.content_type or not file.content_type.startswith("video/"):
        raise HTTPException(status_code=400, detail="File must be a video file")
    
    # Validate format
    if format.lower() not in ['jpg', 'png', 'webp']:
        raise HTTPException(status_code=400, detail="Format must be 'jpg', 'png', or 'webp'")
    
    processing_start = time.time()
    task_id = str(uuid.uuid4())
    
    try:
        # Read file data
        file_data = await file.read()
        
        # Generate thumbnail
        thumbnail_data, metadata = await video_processor.generate_thumbnail(
            file_data,
            timestamp=timestamp,
            width=width,
            height=height,
            format=format
        )
        
        # Store thumbnail
        filename = f"{task_id}.{format}"
        result_url = await storage_service.store_file(thumbnail_data, filename)
        
        processing_time = time.time() - processing_start
        
        # Update metadata with input info
        metadata.update({
            "input_filename": file.filename,
            "task_id": task_id
        })
        
        return ConversionResponse(
            status=ConversionStatus.SUCCESS,
            result_url=result_url,
            task_id=task_id,
            metadata=metadata,
            processing_time=processing_time
        )
        
    except Exception as e:
        processing_time = time.time() - processing_start
        return ConversionResponse(
            status=ConversionStatus.ERROR,
            task_id=task_id,
            error_message=str(e),
            processing_time=processing_time
        )

@router.post("/extract-frames", response_model=ConversionResponse)
async def extract_frames(
    file: UploadFile = File(...),
    fps: Optional[float] = Form(1.0),
    start_time: Optional[float] = Form(None),
    duration: Optional[float] = Form(None),
    format: Optional[str] = Form("jpg")
):
    """Extract frames from video at specified intervals"""
    
    if not file.content_type or not file.content_type.startswith("video/"):
        raise HTTPException(status_code=400, detail="File must be a video file")
    
    # Validate format
    if format.lower() not in ['jpg', 'png', 'webp']:
        raise HTTPException(status_code=400, detail="Format must be 'jpg', 'png', or 'webp'")
    
    processing_start = time.time()
    task_id = str(uuid.uuid4())
    
    try:
        # Read file data
        file_data = await file.read()
        
        # Extract frames
        frames, metadata = await video_processor.extract_frames(
            file_data,
            fps=fps,
            start_time=start_time,
            duration=duration,
            format=format
        )
        
        # Store frames as ZIP archive
        import zipfile
        import io
        
        zip_buffer = io.BytesIO()
        with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
            for i, frame_data in enumerate(frames):
                frame_filename = f"frame_{i+1:04d}.{format}"
                zip_file.writestr(frame_filename, frame_data)
        
        zip_buffer.seek(0)
        zip_data = zip_buffer.getvalue()
        
        # Store ZIP file
        filename = f"{task_id}_frames.zip"
        result_url = await storage_service.store_file(zip_data, filename)
        
        processing_time = time.time() - processing_start
        
        # Update metadata with input info
        metadata.update({
            "input_filename": file.filename,
            "task_id": task_id,
            "zip_size": len(zip_data)
        })
        
        return ConversionResponse(
            status=ConversionStatus.SUCCESS,
            result_url=result_url,
            task_id=task_id,
            metadata=metadata,
            processing_time=processing_time
        )
        
    except Exception as e:
        processing_time = time.time() - processing_start
        return ConversionResponse(
            status=ConversionStatus.ERROR,
            task_id=task_id,
            error_message=str(e),
            processing_time=processing_time
        )

@router.post("/info", response_model=ConversionResponse)
async def get_video_info(file: UploadFile = File(...)):
    """Get video file metadata and information"""
    
    if not file.content_type or not file.content_type.startswith("video/"):
        raise HTTPException(status_code=400, detail="File must be a video file")
    
    processing_start = time.time()
    task_id = str(uuid.uuid4())
    
    try:
        # Read file data
        file_data = await file.read()
        
        # Get video info
        info = await video_processor.get_video_info(file_data)
        
        processing_time = time.time() - processing_start
        
        # Update info with input filename
        info.update({
            "input_filename": file.filename,
            "task_id": task_id
        })
        
        return ConversionResponse(
            status=ConversionStatus.SUCCESS,
            task_id=task_id,
            metadata=info,
            processing_time=processing_time
        )
        
    except Exception as e:
        processing_time = time.time() - processing_start
        return ConversionResponse(
            status=ConversionStatus.ERROR,
            task_id=task_id,
            error_message=str(e),
            processing_time=processing_time
        )