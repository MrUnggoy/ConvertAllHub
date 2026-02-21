# ConvertAll Hub Backend API

FastAPI backend for the ConvertAll Hub file conversion platform.

## Features

- **Modular Router Structure**: Separate routers for each conversion type
- **Dummy Endpoints**: Placeholder implementations for all conversion tools
- **File Upload Support**: Basic file upload and validation
- **Authentication**: Placeholder user authentication and API key support
- **CORS Enabled**: Ready for frontend integration
- **Auto-generated Docs**: FastAPI automatic API documentation

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user info
- `POST /api/auth/register` - User registration
- `POST /api/auth/upgrade` - Upgrade to Pro

### PDF Tools
- `POST /api/pdf/to-image` - Convert PDF to images
- `POST /api/pdf/extract-text` - Extract text from PDF
- `GET /api/pdf/status/{task_id}` - Get conversion status

### Image Tools
- `POST /api/image/convert` - Convert image formats
- `POST /api/image/remove-background` - AI background removal
- `POST /api/image/compress` - Compress images

### Audio Tools
- `POST /api/audio/convert` - Convert audio formats
- `POST /api/audio/extract-from-video` - Extract audio from video
- `POST /api/audio/enhance` - Enhance audio quality

### Video Tools
- `POST /api/video/convert` - Convert video formats
- `POST /api/video/compress` - Compress videos
- `POST /api/video/thumbnail` - Generate thumbnails

### Text Tools
- `POST /api/text/format` - Format and transform text
- `POST /api/text/convert-markdown` - Convert Markdown
- `POST /api/text/word-count` - Text analysis

### OCR Tools
- `POST /api/ocr/extract-text` - Extract text from images
- `POST /api/ocr/extract-tables` - Extract tables
- `POST /api/ocr/handwriting` - Handwriting recognition

### QR Tools
- `POST /api/qr/generate` - Generate QR codes
- `POST /api/qr/decode` - Decode QR codes
- `POST /api/qr/batch-generate` - Batch QR generation

## Installation

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Run the development server:
```bash
python main.py
```

The API will be available at `http://localhost:8000`

## API Documentation

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Development Notes

This is a dummy implementation with placeholder endpoints. In production:

- Replace dummy processing with real conversion libraries
- Implement proper file storage (S3, R2, etc.)
- Add real authentication and user management
- Implement proper error handling and logging
- Add rate limiting and quota enforcement
- Set up background task processing with Celery/Redis