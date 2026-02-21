import asyncio
import uuid
import time
import zipfile
import io
from typing import List, Dict, Any, Optional, Tuple
from fastapi import UploadFile
import hashlib

from models.conversion_models import ConversionResponse, ConversionStatus, BatchConversionResponse
from services.storage import get_storage_service
from services.cache import cache_service

class BatchProcessor:
    """Service for handling batch file processing operations"""
    
    def __init__(self):
        self.active_batches: Dict[str, Dict[str, Any]] = {}
        self.storage_service = get_storage_service()
    
    async def create_batch(self, files: List[UploadFile], operation: str, options: Dict[str, Any]) -> str:
        """Create a new batch processing job"""
        batch_id = str(uuid.uuid4())
        
        # Validate batch size limits
        if len(files) > 50:  # Max 50 files per batch
            raise ValueError("Maximum 50 files allowed per batch")
        
        total_size = 0
        file_metadata = []
        
        for file in files:
            file_data = await file.read()
            file_size = len(file_data)
            total_size += file_size
            
            # Reset file position for later processing
            await file.seek(0)
            
            file_metadata.append({
                'filename': file.filename,
                'size': file_size,
                'content_type': file.content_type,
                'hash': hashlib.sha256(file_data).hexdigest()
            })
        
        # Check total size limit (500MB for batch)
        if total_size > 500 * 1024 * 1024:
            raise ValueError("Total batch size exceeds 500MB limit")
        
        # Store batch information
        self.active_batches[batch_id] = {
            'id': batch_id,
            'operation': operation,
            'options': options,
            'files': file_metadata,
            'total_files': len(files),
            'completed': 0,
            'failed': 0,
            'results': [],
            'status': 'queued',
            'created_at': time.time(),
            'total_size': total_size
        }
        
        return batch_id
    
    async def process_batch(self, batch_id: str, files: List[UploadFile], processor_func) -> BatchConversionResponse:
        """Process all files in a batch"""
        if batch_id not in self.active_batches:
            raise ValueError(f"Batch {batch_id} not found")
        
        batch_info = self.active_batches[batch_id]
        batch_info['status'] = 'processing'
        
        results = []
        completed = 0
        failed = 0
        
        # Process files concurrently (with limit)
        semaphore = asyncio.Semaphore(3)  # Max 3 concurrent conversions
        
        async def process_single_file(file: UploadFile, index: int) -> ConversionResponse:
            async with semaphore:
                try:
                    # Call the specific processor function
                    result = await processor_func(file, batch_info['options'])
                    
                    # Update batch progress
                    nonlocal completed
                    completed += 1
                    batch_info['completed'] = completed
                    
                    return result
                    
                except Exception as e:
                    nonlocal failed
                    failed += 1
                    batch_info['failed'] = failed
                    
                    return ConversionResponse(
                        status=ConversionStatus.ERROR,
                        task_id=f"{batch_id}_{index}",
                        error_message=str(e),
                        metadata={'filename': file.filename}
                    )
        
        # Process all files
        tasks = [process_single_file(file, i) for i, file in enumerate(files)]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Handle any exceptions
        processed_results = []
        for i, result in enumerate(results):
            if isinstance(result, Exception):
                failed += 1
                processed_results.append(ConversionResponse(
                    status=ConversionStatus.ERROR,
                    task_id=f"{batch_id}_{i}",
                    error_message=str(result),
                    metadata={'filename': files[i].filename}
                ))
            else:
                processed_results.append(result)
        
        # Update final batch status
        batch_info['results'] = [r.dict() for r in processed_results]
        batch_info['completed'] = completed
        batch_info['failed'] = failed
        batch_info['status'] = 'completed'
        
        # Create ZIP archive for successful results
        zip_url = None
        successful_results = [r for r in processed_results if r.status == ConversionStatus.SUCCESS and r.result_url]
        
        if successful_results:
            zip_url = await self._create_batch_zip(batch_id, successful_results)
        
        return BatchConversionResponse(
            batch_id=batch_id,
            total_files=len(files),
            completed=completed,
            failed=failed,
            results=processed_results,
            zip_url=zip_url
        )
    
    async def _create_batch_zip(self, batch_id: str, results: List[ConversionResponse]) -> str:
        """Create a ZIP archive containing all successful conversion results"""
        zip_buffer = io.BytesIO()
        
        with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
            for i, result in enumerate(results):
                if result.result_url:
                    try:
                        # Download the converted file
                        file_data = await self._download_file(result.result_url)
                        
                        # Determine filename
                        original_name = result.metadata.get('input_filename', f'file_{i}')
                        name_without_ext = original_name.rsplit('.', 1)[0]
                        output_format = result.metadata.get('output_format', 'bin')
                        filename = f"{name_without_ext}.{output_format}"
                        
                        # Add to ZIP
                        zip_file.writestr(filename, file_data)
                        
                    except Exception as e:
                        # Add error file if download fails
                        error_content = f"Error downloading {result.result_url}: {str(e)}"
                        zip_file.writestr(f"error_{i}.txt", error_content)
        
        zip_buffer.seek(0)
        zip_data = zip_buffer.getvalue()
        
        # Upload ZIP to storage
        zip_filename = f"batch_{batch_id}.zip"
        zip_url = await self.storage_service.upload_file(
            zip_data, zip_filename, "application/zip"
        )
        
        return zip_url
    
    async def _download_file(self, url: str) -> bytes:
        """Download file from URL (implementation depends on storage service)"""
        # This would typically use the storage service to download
        # For now, return empty bytes as placeholder
        return b""
    
    def get_batch_status(self, batch_id: str) -> Optional[Dict[str, Any]]:
        """Get current status of a batch"""
        return self.active_batches.get(batch_id)
    
    def cleanup_old_batches(self, max_age_hours: int = 24):
        """Clean up old batch records"""
        current_time = time.time()
        cutoff_time = current_time - (max_age_hours * 3600)
        
        expired_batches = [
            batch_id for batch_id, batch_info in self.active_batches.items()
            if batch_info['created_at'] < cutoff_time
        ]
        
        for batch_id in expired_batches:
            del self.active_batches[batch_id]
        
        return len(expired_batches)

# Global batch processor instance
batch_processor = BatchProcessor()