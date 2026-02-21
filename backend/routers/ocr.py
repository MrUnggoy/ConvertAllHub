from fastapi import APIRouter, UploadFile, File, HTTPException, Form
from typing import Optional, List
import time
import uuid
import asyncio

from models.conversion_models import ConversionResponse, ConversionStatus

router = APIRouter()

@router.post("/extract-text", response_model=ConversionResponse)
async def extract_text_ocr(
    file: UploadFile = File(...),
    language: str = Form("en"),
    output_format: str = Form("txt"),
    preserve_layout: Optional[bool] = Form(False)
):
    """Extract text from images using OCR (dummy implementation)"""
    
    # Validate file type
    allowed_types = ["image/", "application/pdf"]
    if not file.content_type or not any(file.content_type.startswith(t) for t in allowed_types):
        raise HTTPException(status_code=400, detail="File must be an image or PDF")
    
    processing_start = time.time()
    task_id = str(uuid.uuid4())
    
    # Simulate OCR processing (longer for OCR)
    await asyncio.sleep(2.5)
    
    processing_time = time.time() - processing_start
    
    return ConversionResponse(
        status=ConversionStatus.SUCCESS,
        result_url=f"https://dummy-storage.com/converted/{task_id}.{output_format}",
        task_id=task_id,
        metadata={
            "input_filename": file.filename,
            "language": language,
            "output_format": output_format,
            "preserve_layout": preserve_layout,
            "confidence_score": 0.92,  # Dummy confidence
            "text_blocks_found": 15,
            "words_extracted": 234,
            "processing_engine": "tesseract",
            "pages_processed": 1 if file.content_type.startswith("image/") else 3
        },
        processing_time=processing_time
    )

@router.post("/extract-tables", response_model=ConversionResponse)
async def extract_tables(
    file: UploadFile = File(...),
    output_format: str = Form("csv"),
    detect_headers: Optional[bool] = Form(True)
):
    """Extract tables from documents using OCR (dummy implementation)"""
    
    allowed_types = ["image/", "application/pdf"]
    if not file.content_type or not any(file.content_type.startswith(t) for t in allowed_types):
        raise HTTPException(status_code=400, detail="File must be an image or PDF")
    
    processing_start = time.time()
    task_id = str(uuid.uuid4())
    
    await asyncio.sleep(3.0)
    
    processing_time = time.time() - processing_start
    
    return ConversionResponse(
        status=ConversionStatus.SUCCESS,
        result_url=f"https://dummy-storage.com/converted/{task_id}.{output_format}",
        task_id=task_id,
        metadata={
            "input_filename": file.filename,
            "output_format": output_format,
            "detect_headers": detect_headers,
            "tables_found": 2,
            "total_rows": 45,
            "total_columns": 6,
            "confidence_score": 0.88,
            "processing_engine": "table_transformer"
        },
        processing_time=processing_time
    )

@router.post("/handwriting", response_model=ConversionResponse)
async def extract_handwriting(
    file: UploadFile = File(...),
    language: str = Form("en"),
    output_format: str = Form("txt")
):
    """Extract handwritten text using specialized OCR (dummy implementation)"""
    
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    processing_start = time.time()
    task_id = str(uuid.uuid4())
    
    # Handwriting OCR takes longer
    await asyncio.sleep(4.0)
    
    processing_time = time.time() - processing_start
    
    return ConversionResponse(
        status=ConversionStatus.SUCCESS,
        result_url=f"https://dummy-storage.com/converted/{task_id}.{output_format}",
        task_id=task_id,
        metadata={
            "input_filename": file.filename,
            "language": language,
            "output_format": output_format,
            "confidence_score": 0.78,  # Lower confidence for handwriting
            "words_extracted": 156,
            "processing_engine": "handwriting_ocr",
            "difficulty_level": "medium",
            "legibility_score": 0.82
        },
        processing_time=processing_time
    )