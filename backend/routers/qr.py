from fastapi import APIRouter, UploadFile, File, HTTPException, Form, Body
from typing import Optional, List
import time
import uuid
import asyncio

from models.conversion_models import ConversionResponse, ConversionStatus
from services.qr_processor import QRProcessor
from services.storage import StorageService

router = APIRouter()
qr_processor = QRProcessor()
storage_service = StorageService()

@router.post("/generate", response_model=ConversionResponse)
async def generate_qr_code(
    content: str = Body(..., embed=True),
    output_format: str = Form("png"),
    size: Optional[int] = Form(256),
    error_correction: Optional[str] = Form("M"),  # L, M, Q, H
    border: Optional[int] = Form(4),
    fill_color: Optional[str] = Form("black"),
    back_color: Optional[str] = Form("white"),
    style: Optional[str] = Form("square")  # square, rounded, circle
):
    """Generate QR code from text or URL"""
    
    if not content or len(content.strip()) == 0:
        raise HTTPException(status_code=400, detail="Content cannot be empty")
    
    # Validate parameters
    if len(content) > 4296:  # QR code maximum capacity
        raise HTTPException(status_code=400, detail="Content too long for QR code (max 4296 characters)")
    
    if error_correction not in ["L", "M", "Q", "H"]:
        raise HTTPException(status_code=400, detail="Error correction must be L, M, Q, or H")
    
    if output_format.lower() not in ["png", "jpg", "jpeg", "webp", "svg"]:
        raise HTTPException(status_code=400, detail="Supported formats: PNG, JPG, WebP, SVG")
    
    if size < 32 or size > 2048:
        raise HTTPException(status_code=400, detail="Size must be between 32 and 2048 pixels")
    
    if style not in ["square", "rounded", "circle"]:
        raise HTTPException(status_code=400, detail="Style must be square, rounded, or circle")
    
    processing_start = time.time()
    task_id = str(uuid.uuid4())
    
    try:
        # Generate QR code
        qr_data, metadata = qr_processor.generate_qr_code(
            content,
            output_format=output_format,
            size=size,
            error_correction=error_correction,
            border=border,
            fill_color=fill_color,
            back_color=back_color,
            style=style
        )
        
        # Store QR code
        filename = f"{task_id}.{output_format}"
        result_url = await storage_service.store_file(qr_data, filename)
        
        processing_time = time.time() - processing_start
        
        # Update metadata
        metadata.update({
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

@router.post("/decode", response_model=ConversionResponse)
async def decode_qr_code(
    file: UploadFile = File(...),
    output_format: str = Form("txt")
):
    """Decode QR code(s) from image"""
    
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    if output_format.lower() not in ["txt", "json"]:
        raise HTTPException(status_code=400, detail="Output format must be 'txt' or 'json'")
    
    processing_start = time.time()
    task_id = str(uuid.uuid4())
    
    try:
        # Read image data
        image_data = await file.read()
        
        # Decode QR codes
        decoded_contents, metadata = qr_processor.decode_qr_code(image_data)
        
        if not decoded_contents:
            raise HTTPException(status_code=404, detail="No QR codes found in the image")
        
        # Format output
        if output_format.lower() == "json":
            import json
            output_data = {
                "decoded_qr_codes": decoded_contents,
                "metadata": metadata
            }
            file_content = json.dumps(output_data, indent=2).encode('utf-8')
        else:  # txt
            lines = ["DECODED QR CODES", "=" * 50]
            for i, content in enumerate(decoded_contents, 1):
                lines.append(f"\nQR Code {i}:")
                lines.append(content)
            file_content = '\n'.join(lines).encode('utf-8')
        
        # Store decoded content
        filename = f"{task_id}.{output_format}"
        result_url = await storage_service.store_file(file_content, filename)
        
        processing_time = time.time() - processing_start
        
        # Update metadata
        metadata.update({
            "input_filename": file.filename,
            "task_id": task_id,
            "output_format": output_format,
            "decoded_contents": decoded_contents[:3] if len(decoded_contents) > 3 else decoded_contents,  # Limit for response size
            "file_size": len(file_content)
        })
        
        return ConversionResponse(
            status=ConversionStatus.SUCCESS,
            result_url=result_url,
            task_id=task_id,
            metadata=metadata,
            processing_time=processing_time
        )
        
    except HTTPException:
        raise
    except Exception as e:
        processing_time = time.time() - processing_start
        return ConversionResponse(
            status=ConversionStatus.ERROR,
            task_id=task_id,
            error_message=str(e),
            processing_time=processing_time
        )

@router.post("/batch-generate", response_model=ConversionResponse)
async def batch_generate_qr_codes(
    content_list: List[str] = Body(...),
    output_format: str = Form("png"),
    size: Optional[int] = Form(256),
    error_correction: Optional[str] = Form("M"),
    border: Optional[int] = Form(4),
    naming_pattern: Optional[str] = Form("qr_{index}")
):
    """Generate multiple QR codes and return as ZIP archive"""
    
    if not content_list or len(content_list) == 0:
        raise HTTPException(status_code=400, detail="Content list cannot be empty")
    
    if len(content_list) > 1000:
        raise HTTPException(status_code=400, detail="Maximum 1000 QR codes per batch")
    
    # Validate parameters
    if error_correction not in ["L", "M", "Q", "H"]:
        raise HTTPException(status_code=400, detail="Error correction must be L, M, Q, or H")
    
    if output_format.lower() not in ["png", "jpg", "jpeg", "webp"]:
        raise HTTPException(status_code=400, detail="Supported formats for batch: PNG, JPG, WebP")
    
    if size < 32 or size > 2048:
        raise HTTPException(status_code=400, detail="Size must be between 32 and 2048 pixels")
    
    processing_start = time.time()
    task_id = str(uuid.uuid4())
    
    try:
        # Generate batch of QR codes
        zip_data, metadata = qr_processor.batch_generate_qr_codes(
            content_list,
            output_format=output_format,
            size=size,
            error_correction=error_correction,
            border=border,
            naming_pattern=naming_pattern
        )
        
        # Store ZIP file
        filename = f"{task_id}_qr_batch.zip"
        result_url = await storage_service.store_file(zip_data, filename)
        
        processing_time = time.time() - processing_start
        
        # Update metadata
        metadata.update({
            "task_id": task_id,
            "batch_id": task_id
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
        )@rou
ter.post("/generate-vcard", response_model=ConversionResponse)
async def generate_vcard_qr(
    name: str = Form(...),
    phone: Optional[str] = Form(None),
    email: Optional[str] = Form(None),
    organization: Optional[str] = Form(None),
    url: Optional[str] = Form(None),
    output_format: str = Form("png"),
    size: Optional[int] = Form(256),
    error_correction: Optional[str] = Form("M")
):
    """Generate QR code for vCard (contact information)"""
    
    if not name or not name.strip():
        raise HTTPException(status_code=400, detail="Name is required for vCard")
    
    # Validate at least one contact method
    if not any([phone, email, organization, url]):
        raise HTTPException(status_code=400, detail="At least one contact method (phone, email, organization, or URL) is required")
    
    processing_start = time.time()
    task_id = str(uuid.uuid4())
    
    try:
        # Generate vCard QR code
        qr_data, metadata = qr_processor.create_vcard_qr(
            name=name,
            phone=phone,
            email=email,
            organization=organization,
            url=url,
            output_format=output_format,
            size=size,
            error_correction=error_correction
        )
        
        # Store QR code
        filename = f"{task_id}_vcard.{output_format}"
        result_url = await storage_service.store_file(qr_data, filename)
        
        processing_time = time.time() - processing_start
        
        # Update metadata
        metadata.update({
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

@router.post("/generate-wifi", response_model=ConversionResponse)
async def generate_wifi_qr(
    ssid: str = Form(...),
    password: str = Form(...),
    security: str = Form("WPA"),  # WPA, WEP, nopass
    hidden: Optional[bool] = Form(False),
    output_format: str = Form("png"),
    size: Optional[int] = Form(256),
    error_correction: Optional[str] = Form("M")
):
    """Generate QR code for WiFi connection"""
    
    if not ssid or not ssid.strip():
        raise HTTPException(status_code=400, detail="SSID is required")
    
    if security not in ["WPA", "WEP", "nopass"]:
        raise HTTPException(status_code=400, detail="Security must be WPA, WEP, or nopass")
    
    if security != "nopass" and (not password or not password.strip()):
        raise HTTPException(status_code=400, detail="Password is required for WPA/WEP networks")
    
    processing_start = time.time()
    task_id = str(uuid.uuid4())
    
    try:
        # Generate WiFi QR code
        qr_data, metadata = qr_processor.create_wifi_qr(
            ssid=ssid,
            password=password if security != "nopass" else "",
            security=security,
            hidden=hidden,
            output_format=output_format,
            size=size,
            error_correction=error_correction
        )
        
        # Store QR code
        filename = f"{task_id}_wifi.{output_format}"
        result_url = await storage_service.store_file(qr_data, filename)
        
        processing_time = time.time() - processing_start
        
        # Update metadata
        metadata.update({
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