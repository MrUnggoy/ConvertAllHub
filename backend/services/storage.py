import os
import uuid
import hashlib
from typing import Optional, BinaryIO
from pathlib import Path
import boto3
from botocore.exceptions import ClientError
import aiofiles
import logging

logger = logging.getLogger(__name__)

class StorageService:
    """Abstract storage service interface"""
    
    async def upload_file(self, file_data: bytes, filename: str, content_type: str) -> str:
        """Upload file and return public URL"""
        raise NotImplementedError
    
    async def delete_file(self, file_url: str) -> bool:
        """Delete file by URL"""
        raise NotImplementedError
    
    def get_file_hash(self, file_data: bytes) -> str:
        """Generate hash for file deduplication"""
        return hashlib.sha256(file_data).hexdigest()

class LocalStorageService(StorageService):
    """Local file storage for development"""
    
    def __init__(self, upload_dir: str = "uploads", base_url: str = "http://localhost:8000"):
        self.upload_dir = Path(upload_dir)
        self.upload_dir.mkdir(exist_ok=True)
        self.base_url = base_url.rstrip('/')
        
    async def upload_file(self, file_data: bytes, filename: str, content_type: str) -> str:
        """Save file locally and return URL"""
        try:
            # Generate unique filename
            file_id = str(uuid.uuid4())
            file_extension = Path(filename).suffix
            unique_filename = f"{file_id}{file_extension}"
            file_path = self.upload_dir / unique_filename
            
            # Save file
            async with aiofiles.open(file_path, 'wb') as f:
                await f.write(file_data)
            
            # Return public URL
            return f"{self.base_url}/uploads/{unique_filename}"
            
        except Exception as e:
            logger.error(f"Failed to upload file locally: {e}")
            raise
    
    async def delete_file(self, file_url: str) -> bool:
        """Delete local file"""
        try:
            filename = file_url.split('/')[-1]
            file_path = self.upload_dir / filename
            
            if file_path.exists():
                file_path.unlink()
                return True
            return False
            
        except Exception as e:
            logger.error(f"Failed to delete local file: {e}")
            return False

class S3StorageService(StorageService):
    """AWS S3 or S3-compatible storage (Cloudflare R2)"""
    
    def __init__(self, bucket_name: str, region: str = "auto", endpoint_url: Optional[str] = None):
        self.bucket_name = bucket_name
        self.s3_client = boto3.client(
            's3',
            region_name=region,
            endpoint_url=endpoint_url,
            aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
            aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY')
        )
        
    async def upload_file(self, file_data: bytes, filename: str, content_type: str) -> str:
        """Upload to S3 and return public URL"""
        try:
            # Generate unique key
            file_id = str(uuid.uuid4())
            file_extension = Path(filename).suffix
            s3_key = f"conversions/{file_id}{file_extension}"
            
            # Upload to S3
            self.s3_client.put_object(
                Bucket=self.bucket_name,
                Key=s3_key,
                Body=file_data,
                ContentType=content_type,
                CacheControl='max-age=31536000'  # 1 year cache
            )
            
            # Return public URL
            if os.getenv('CLOUDFLARE_R2_DOMAIN'):
                return f"https://{os.getenv('CLOUDFLARE_R2_DOMAIN')}/{s3_key}"
            else:
                return f"https://{self.bucket_name}.s3.amazonaws.com/{s3_key}"
                
        except ClientError as e:
            logger.error(f"Failed to upload to S3: {e}")
            raise
    
    async def delete_file(self, file_url: str) -> bool:
        """Delete from S3"""
        try:
            # Extract S3 key from URL
            s3_key = file_url.split('/')[-2] + '/' + file_url.split('/')[-1]
            
            self.s3_client.delete_object(
                Bucket=self.bucket_name,
                Key=s3_key
            )
            return True
            
        except ClientError as e:
            logger.error(f"Failed to delete from S3: {e}")
            return False

# Storage service factory
def get_storage_service() -> StorageService:
    """Get configured storage service"""
    storage_type = os.getenv('STORAGE_TYPE', 'local')
    
    if storage_type == 's3':
        return S3StorageService(
            bucket_name=os.getenv('S3_BUCKET_NAME', 'convertall-files'),
            region=os.getenv('S3_REGION', 'us-east-1'),
            endpoint_url=os.getenv('S3_ENDPOINT_URL')  # For Cloudflare R2
        )
    else:
        return LocalStorageService(
            upload_dir=os.getenv('UPLOAD_DIR', 'uploads'),
            base_url=os.getenv('BASE_URL', 'http://localhost:8000')
        )