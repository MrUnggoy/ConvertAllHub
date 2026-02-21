from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from enum import Enum

class ConversionStatus(str, Enum):
    SUCCESS = "success"
    ERROR = "error"
    PROCESSING = "processing"
    QUEUED = "queued"

class ConversionResponse(BaseModel):
    status: ConversionStatus
    result_url: Optional[str] = None
    task_id: Optional[str] = None
    metadata: Dict[str, Any] = {}
    error_message: Optional[str] = None
    processing_time: Optional[float] = None

class BatchConversionResponse(BaseModel):
    batch_id: str
    total_files: int
    completed: int
    failed: int
    results: List[ConversionResponse]
    zip_url: Optional[str] = None

class ProcessingOptions(BaseModel):
    output_format: str
    quality: Optional[int] = 80
    client_side: Optional[bool] = False
    pro_mode: Optional[bool] = False
    batch_id: Optional[str] = None

class FileMetadata(BaseModel):
    name: str
    size: int
    type: str
    hash: Optional[str] = None

class ConversionRequest(BaseModel):
    file_metadata: FileMetadata
    options: ProcessingOptions
    user_id: Optional[str] = None