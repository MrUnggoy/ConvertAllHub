from fastapi import APIRouter, UploadFile, File, HTTPException, Form
from typing import Optional
import time
import uuid
import asyncio

from models.conversion_models import ConversionResponse, ConversionStatus
from services.audio_processor import AudioProcessor
from services.storage import StorageService

router = APIRouter()
audio_processor = AudioProcessor()
storage_service = StorageService()

@router.post("/convert", response_model=ConversionResponse)
async def convert_audio_format(
    file: UploadFile = File(...),
    output_format: str = Form("mp3"),
    bitrate: Optional[int] = Form(128),
    sample_rate: Optional[int] = Form(44100),
    channels: Optional[int] = Form(None)
):
    """Convert audio between formats using FFmpeg"""
    
    # Validate file type
    if not file.content_type or not file.content_type.startswith("audio/"):
        raise HTTPException(status_code=400, detail="File must be an audio file")
    
    # Validate output format
    supported_formats = ['mp3', 'wav', 'flac', 'aac', 'ogg']
    if output_format.lower() not in supported_formats:
        raise HTTPException(status_code=400, detail=f"Unsupported output format. Supported: {', '.join(supported_formats)}")
    
    processing_start = time.time()
    task_id = str(uuid.uuid4())
    
    try:
        # Read file data
        file_data = await file.read()
        
        # Process audio
        converted_data, metadata = await audio_processor.convert_format(
            file_data,
            output_format,
            bitrate=bitrate,
            sample_rate=sample_rate,
            channels=channels,
            task_id=task_id,
            filename=file.filename
        )
        
        # Store converted file
        filename = f"{task_id}.{output_format}"
        result_url = await storage_service.store_file(converted_data, filename)
        
        processing_time = time.time() - processing_start
        
        # Update metadata with input info
        metadata.update({
            "input_filename": file.filename,
            "input_format": file.content_type,
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

@router.post("/extract-from-video", response_model=ConversionResponse)
async def extract_audio_from_video(
    file: UploadFile = File(...),
    output_format: str = Form("mp3"),
    start_time: Optional[float] = Form(None),
    duration: Optional[float] = Form(None),
    bitrate: Optional[int] = Form(128)
):
    """Extract audio from video file using FFmpeg"""
    
    if not file.content_type or not file.content_type.startswith("video/"):
        raise HTTPException(status_code=400, detail="File must be a video file")
    
    # Validate output format
    supported_formats = ['mp3', 'wav', 'flac', 'aac']
    if output_format.lower() not in supported_formats:
        raise HTTPException(status_code=400, detail=f"Unsupported output format. Supported: {', '.join(supported_formats)}")
    
    processing_start = time.time()
    task_id = str(uuid.uuid4())
    
    try:
        # Read file data
        file_data = await file.read()
        
        # Extract audio from video
        audio_data, metadata = await audio_processor.extract_from_video(
            file_data,
            output_format,
            start_time=start_time,
            duration=duration,
            bitrate=bitrate
        )
        
        # Store extracted audio
        filename = f"{task_id}.{output_format}"
        result_url = await storage_service.store_file(audio_data, filename)
        
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

@router.post("/enhance", response_model=ConversionResponse)
async def enhance_audio(
    file: UploadFile = File(...),
    noise_reduction: Optional[bool] = Form(False),
    normalize: Optional[bool] = Form(True),
    bass_boost: Optional[int] = Form(0),
    treble_boost: Optional[int] = Form(0),
    volume: Optional[float] = Form(1.0)
):
    """Enhance audio quality using FFmpeg filters"""
    
    if not file.content_type or not file.content_type.startswith("audio/"):
        raise HTTPException(status_code=400, detail="File must be an audio file")
    
    processing_start = time.time()
    task_id = str(uuid.uuid4())
    
    try:
        # Read file data
        file_data = await file.read()
        
        # Enhance audio
        enhanced_data, metadata = await audio_processor.enhance_audio(
            file_data,
            noise_reduction=noise_reduction,
            normalize=normalize,
            bass_boost=bass_boost,
            treble_boost=treble_boost,
            volume=volume
        )
        
        # Store enhanced audio
        filename = f"{task_id}.wav"
        result_url = await storage_service.store_file(enhanced_data, filename)
        
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
        )@router.po
st("/info", response_model=ConversionResponse)
async def get_audio_info(file: UploadFile = File(...)):
    """Get audio file metadata and information"""
    
    if not file.content_type or not file.content_type.startswith("audio/"):
        raise HTTPException(status_code=400, detail="File must be an audio file")
    
    processing_start = time.time()
    task_id = str(uuid.uuid4())
    
    try:
        # Read file data
        file_data = await file.read()
        
        # Get audio info
        info = await audio_processor.get_audio_info(file_data)
        
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