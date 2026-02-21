from fastapi import APIRouter, UploadFile, File, HTTPException, Form, BackgroundTasks
from typing import Optional, List, Dict, Any
import time
import uuid
import hashlib
import json

from models.conversion_models import ConversionResponse, ConversionStatus, BatchConversionResponse
from services.document_processor import DocumentProcessor
from services.storage import get_storage_service
from services.cache import cache_service

router = APIRouter()

@router.post("/pdf-to-docx", response_model=ConversionResponse)
async def pdf_to_docx(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    preserve_formatting: bool = Form(True),
    extract_images: bool = Form(False)
):
    """Convert PDF to DOCX format"""
    
    if not file.content_type or "pdf" not in file.content_type.lower():
        raise HTTPException(status_code=400, detail="File must be a PDF")
    
    processing_start = time.time()
    task_id = str(uuid.uuid4())
    
    try:
        # Read file data
        file_data = await file.read()
        file_hash = hashlib.sha256(file_data).hexdigest()
        
        # Check cache
        cache_params = {
            'operation': 'pdf_to_docx',
            'preserve_formatting': preserve_formatting,
            'extract_images': extract_images
        }
        
        cached_result = await cache_service.get_conversion_result(file_hash, cache_params)
        if cached_result:
            return ConversionResponse(**cached_result)
        
        # Convert PDF to DOCX
        docx_data = await DocumentProcessor.pdf_to_docx(
            pdf_data=file_data,
            preserve_formatting=preserve_formatting,
            extract_images=extract_images
        )
        
        # Upload to storage
        storage_service = get_storage_service()
        filename = f"converted_{task_id}.docx"
        result_url = await storage_service.upload_file(
            docx_data, filename, "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        )
        
        processing_time = time.time() - processing_start
        
        response_data = {
            'status': ConversionStatus.SUCCESS,
            'result_url': result_url,
            'task_id': task_id,
            'metadata': {
                'input_filename': file.filename,
                'input_size': len(file_data),
                'output_size': len(docx_data),
                'output_format': 'docx',
                'preserve_formatting': preserve_formatting,
                'extract_images': extract_images,
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
            error_message=f"PDF to DOCX conversion failed: {str(e)}",
            processing_time=processing_time
        )

@router.post("/docx-to-pdf", response_model=ConversionResponse)
async def docx_to_pdf(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...)
):
    """Convert DOCX to PDF format"""
    
    if not file.content_type or "wordprocessingml" not in file.content_type.lower():
        raise HTTPException(status_code=400, detail="File must be a DOCX document")
    
    processing_start = time.time()
    task_id = str(uuid.uuid4())
    
    try:
        # Read file data
        file_data = await file.read()
        file_hash = hashlib.sha256(file_data).hexdigest()
        
        # Check cache
        cache_params = {'operation': 'docx_to_pdf'}
        
        cached_result = await cache_service.get_conversion_result(file_hash, cache_params)
        if cached_result:
            return ConversionResponse(**cached_result)
        
        # Convert DOCX to PDF
        pdf_data = await DocumentProcessor.docx_to_pdf(file_data)
        
        # Upload to storage
        storage_service = get_storage_service()
        filename = f"converted_{task_id}.pdf"
        result_url = await storage_service.upload_file(
            pdf_data, filename, "application/pdf"
        )
        
        processing_time = time.time() - processing_start
        
        response_data = {
            'status': ConversionStatus.SUCCESS,
            'result_url': result_url,
            'task_id': task_id,
            'metadata': {
                'input_filename': file.filename,
                'input_size': len(file_data),
                'output_size': len(pdf_data),
                'output_format': 'pdf',
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
            error_message=f"DOCX to PDF conversion failed: {str(e)}",
            processing_time=processing_time
        )

@router.post("/xlsx-to-csv", response_model=ConversionResponse)
async def xlsx_to_csv(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...)
):
    """Convert XLSX to CSV format"""
    
    if not file.content_type or "spreadsheetml" not in file.content_type.lower():
        raise HTTPException(status_code=400, detail="File must be an XLSX spreadsheet")
    
    processing_start = time.time()
    task_id = str(uuid.uuid4())
    
    try:
        # Read file data
        file_data = await file.read()
        file_hash = hashlib.sha256(file_data).hexdigest()
        
        # Check cache
        cache_params = {'operation': 'xlsx_to_csv'}
        
        cached_result = await cache_service.get_conversion_result(file_hash, cache_params)
        if cached_result:
            return ConversionResponse(**cached_result)
        
        # Convert XLSX to CSV
        csv_data = await DocumentProcessor.xlsx_to_csv(file_data)
        
        # Upload to storage
        storage_service = get_storage_service()
        filename = f"converted_{task_id}.csv"
        result_url = await storage_service.upload_file(
            csv_data, filename, "text/csv"
        )
        
        processing_time = time.time() - processing_start
        
        response_data = {
            'status': ConversionStatus.SUCCESS,
            'result_url': result_url,
            'task_id': task_id,
            'metadata': {
                'input_filename': file.filename,
                'input_size': len(file_data),
                'output_size': len(csv_data),
                'output_format': 'csv',
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
            error_message=f"XLSX to CSV conversion failed: {str(e)}",
            processing_time=processing_time
        )

@router.post("/merge", response_model=ConversionResponse)
async def merge_documents(
    background_tasks: BackgroundTasks,
    files: List[UploadFile] = File(...),
    output_format: str = Form("pdf")
):
    """Merge multiple documents into one"""
    
    if len(files) < 2:
        raise HTTPException(status_code=400, detail="At least 2 documents required for merging")
    
    if len(files) > 10:
        raise HTTPException(status_code=400, detail="Maximum 10 documents allowed for merging")
    
    if output_format not in ['pdf', 'docx']:
        raise HTTPException(status_code=400, detail="Output format must be pdf or docx")
    
    processing_start = time.time()
    task_id = str(uuid.uuid4())
    
    try:
        # Read and validate all files
        documents = []
        total_size = 0
        
        for file in files:
            file_data = await file.read()
            total_size += len(file_data)
            
            # Determine file format
            if file.content_type:
                if "pdf" in file.content_type.lower():
                    doc_format = "pdf"
                elif "wordprocessingml" in file.content_type.lower():
                    doc_format = "docx"
                else:
                    raise HTTPException(
                        status_code=400, 
                        detail=f"Unsupported file type: {file.filename}"
                    )
            else:
                # Fallback to file extension
                if file.filename.lower().endswith('.pdf'):
                    doc_format = "pdf"
                elif file.filename.lower().endswith('.docx'):
                    doc_format = "docx"
                else:
                    raise HTTPException(
                        status_code=400, 
                        detail=f"Cannot determine file type: {file.filename}"
                    )
            
            documents.append((file_data, doc_format))
        
        # Check total size limit
        if total_size > 100 * 1024 * 1024:  # 100MB
            raise HTTPException(status_code=400, detail="Total file size exceeds 100MB limit")
        
        # Create cache key
        combined_hash = hashlib.sha256(b''.join([doc[0] for doc in documents])).hexdigest()
        cache_params = {
            'operation': 'merge_documents',
            'output_format': output_format,
            'file_count': len(files)
        }
        
        cached_result = await cache_service.get_conversion_result(combined_hash, cache_params)
        if cached_result:
            return ConversionResponse(**cached_result)
        
        # Merge documents
        merged_data = await DocumentProcessor.merge_documents(documents, output_format)
        
        # Upload merged document
        storage_service = get_storage_service()
        filename = f"merged_{task_id}.{output_format}"
        content_type = "application/pdf" if output_format == "pdf" else "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        
        result_url = await storage_service.upload_file(
            merged_data, filename, content_type
        )
        
        processing_time = time.time() - processing_start
        
        response_data = {
            'status': ConversionStatus.SUCCESS,
            'result_url': result_url,
            'task_id': task_id,
            'metadata': {
                'input_files': [f.filename for f in files],
                'total_input_size': total_size,
                'output_size': len(merged_data),
                'output_format': output_format,
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
            error_message=f"Document merge failed: {str(e)}",
            processing_time=processing_time
        )

@router.post("/split", response_model=ConversionResponse)
async def split_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    split_method: str = Form("pages"),
    split_params: str = Form(...)  # JSON string with split parameters
):
    """Split document based on various criteria"""
    
    processing_start = time.time()
    task_id = str(uuid.uuid4())
    
    try:
        # Parse split parameters
        try:
            params = json.loads(split_params)
        except json.JSONDecodeError:
            raise HTTPException(status_code=400, detail="Invalid split_params JSON")
        
        # Read file data
        file_data = await file.read()
        
        # Determine file format
        if file.content_type:
            if "pdf" in file.content_type.lower():
                doc_format = "pdf"
            elif "wordprocessingml" in file.content_type.lower():
                doc_format = "docx"
            else:
                raise HTTPException(status_code=400, detail="Unsupported file type for splitting")
        else:
            raise HTTPException(status_code=400, detail="Cannot determine file type")
        
        # Check cache
        file_hash = hashlib.sha256(file_data).hexdigest()
        cache_params = {
            'operation': 'split_document',
            'split_method': split_method,
            'split_params': split_params
        }
        
        cached_result = await cache_service.get_conversion_result(file_hash, cache_params)
        if cached_result:
            return ConversionResponse(**cached_result)
        
        # Split document
        split_documents = await DocumentProcessor.split_document(
            file_data, doc_format, split_method, params
        )
        
        # Upload split documents
        storage_service = get_storage_service()
        uploaded_urls = []
        
        content_type = "application/pdf" if doc_format == "pdf" else "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        
        for i, doc_data in enumerate(split_documents):
            filename = f"split_{task_id}_part_{i+1}.{doc_format}"
            url = await storage_service.upload_file(doc_data, filename, content_type)
            uploaded_urls.append(url)
        
        processing_time = time.time() - processing_start
        
        response_data = {
            'status': ConversionStatus.SUCCESS,
            'result_url': uploaded_urls[0] if len(uploaded_urls) == 1 else None,
            'task_id': task_id,
            'metadata': {
                'input_filename': file.filename,
                'input_size': len(file_data),
                'split_method': split_method,
                'files_created': len(split_documents),
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
            error_message=f"Document split failed: {str(e)}",
            processing_time=processing_time
        )

@router.post("/info", response_model=ConversionResponse)
async def get_document_info(
    file: UploadFile = File(...)
):
    """Get comprehensive document information"""
    
    processing_start = time.time()
    task_id = str(uuid.uuid4())
    
    try:
        # Read file data
        file_data = await file.read()
        
        # Determine file format
        if file.content_type:
            if "pdf" in file.content_type.lower():
                doc_format = "pdf"
            elif "wordprocessingml" in file.content_type.lower():
                doc_format = "docx"
            elif "spreadsheetml" in file.content_type.lower():
                doc_format = "xlsx"
            else:
                doc_format = "unknown"
        else:
            # Fallback to file extension
            if file.filename.lower().endswith('.pdf'):
                doc_format = "pdf"
            elif file.filename.lower().endswith('.docx'):
                doc_format = "docx"
            elif file.filename.lower().endswith('.xlsx'):
                doc_format = "xlsx"
            else:
                doc_format = "unknown"
        
        # Get document information
        doc_info = await DocumentProcessor.get_document_info(file_data, doc_format)
        
        processing_time = time.time() - processing_start
        
        return ConversionResponse(
            status=ConversionStatus.SUCCESS,
            task_id=task_id,
            metadata={
                'input_filename': file.filename,
                'document_info': doc_info,
                'processing_method': 'server_side'
            },
            processing_time=processing_time
        )
        
    except Exception as e:
        processing_time = time.time() - processing_start
        return ConversionResponse(
            status=ConversionStatus.ERROR,
            task_id=task_id,
            error_message=f"Document info extraction failed: {str(e)}",
            processing_time=processing_time
        )

@router.post("/convert", response_model=ConversionResponse)
async def convert_document_format(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    output_format: str = Form(...),
    options: str = Form("{}")  # JSON string with conversion options
):
    """Universal document format converter"""
    
    processing_start = time.time()
    task_id = str(uuid.uuid4())
    
    try:
        # Parse options
        try:
            conversion_options = json.loads(options)
        except json.JSONDecodeError:
            conversion_options = {}
        
        # Read file data
        file_data = await file.read()
        
        # Determine input format
        if file.content_type:
            if "pdf" in file.content_type.lower():
                input_format = "pdf"
            elif "wordprocessingml" in file.content_type.lower():
                input_format = "docx"
            elif "spreadsheetml" in file.content_type.lower():
                input_format = "xlsx"
            else:
                raise HTTPException(status_code=400, detail="Unsupported input file type")
        else:
            raise HTTPException(status_code=400, detail="Cannot determine input file type")
        
        # Validate output format
        if output_format not in ['pdf', 'docx', 'csv']:
            raise HTTPException(status_code=400, detail="Unsupported output format")
        
        # Check cache
        file_hash = hashlib.sha256(file_data).hexdigest()
        cache_params = {
            'operation': 'convert_document',
            'input_format': input_format,
            'output_format': output_format,
            'options': options
        }
        
        cached_result = await cache_service.get_conversion_result(file_hash, cache_params)
        if cached_result:
            return ConversionResponse(**cached_result)
        
        # Convert document
        converted_data = await DocumentProcessor.convert_document_format(
            file_data, input_format, output_format, conversion_options
        )
        
        # Upload converted document
        storage_service = get_storage_service()
        filename = f"converted_{task_id}.{output_format}"
        
        # Set appropriate content type
        content_types = {
            'pdf': 'application/pdf',
            'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'csv': 'text/csv'
        }
        content_type = content_types.get(output_format, 'application/octet-stream')
        
        result_url = await storage_service.upload_file(
            converted_data, filename, content_type
        )
        
        processing_time = time.time() - processing_start
        
        response_data = {
            'status': ConversionStatus.SUCCESS,
            'result_url': result_url,
            'task_id': task_id,
            'metadata': {
                'input_filename': file.filename,
                'input_format': input_format,
                'input_size': len(file_data),
                'output_format': output_format,
                'output_size': len(converted_data),
                'conversion_options': conversion_options,
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
            error_message=f"Document conversion failed: {str(e)}",
            processing_time=processing_time
        )