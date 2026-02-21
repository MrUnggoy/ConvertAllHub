# ConvertAll Hub Design Document

## Overview

ConvertAll is a modular, scalable web platform offering multiple file conversion tools through a unified interface. The architecture supports both client-side and server-side processing, with monetization through ads and Pro subscriptions.

## Architecture

### High-Level System Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Gateway    │    │   Conversion    │
│   React + TS    │◄──►│   FastAPI        │◄──►│   Services      │
│   (Vite)        │    │                  │    │   (Microservices)│
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   CDN/Storage   │    │   Queue System   │    │   File Storage  │
│   Cloudflare    │    │   Redis/Celery   │    │   S3/R2         │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Technology Stack

**Frontend:**
- React 18 + TypeScript + Vite
- TailwindCSS + Shadcn/UI components
- React Router for tool navigation
- Axios for API communication
- Google AdSense integration

**Backend:**
- FastAPI (Python 3.11+)
- Celery workers for heavy processing
- Redis for queuing and caching
- PostgreSQL for analytics and Pro accounts

**Processing Libraries:**
- PDF: PyPDF2, LibreOffice CLI
- Images: Pillow, Sharp
- Background Removal: rembg, U²-Net
- Audio/Video: FFmpeg
- OCR: Tesseract, AWS Textract
- QR: qrcode.js, zxing.js

**Infrastructure:**
- Frontend: Cloudflare Pages/Vercel
- Backend: Render/Fly.io
- Storage: Cloudflare R2/AWS S3
- CDN: Cloudflare edge caching

## Components and Interfaces

### Frontend Architecture

#### 1. Tool Registry System
```typescript
interface ToolRegistry {
  tools: ToolDefinition[];
  getToolsByCategory(category: string): ToolDefinition[];
  registerTool(tool: ToolDefinition): void;
  getToolRoute(toolId: string): string;
}

interface ToolDefinition {
  id: string;
  name: string;
  category: 'pdf' | 'image' | 'audio' | 'video' | 'text' | 'ocr' | 'qr';
  description: string;
  inputFormats: string[];
  outputFormats: string[];
  clientSideSupported: boolean;
  proFeatures: string[];
  component: React.ComponentType;
}
```

#### 2. Universal File Processor
```typescript
interface FileProcessor {
  processFile(file: File, options: ProcessingOptions): Promise<ProcessingResult>;
  validateFile(file: File, allowedTypes: string[]): ValidationResult;
  getProcessingProgress(taskId: string): Promise<ProgressStatus>;
  cancelProcessing(taskId: string): Promise<void>;
}

interface ProcessingOptions {
  outputFormat: string;
  quality?: number;
  clientSide?: boolean;
  proMode?: boolean;
  batchId?: string;
}
```

#### 3. Conversion Components
```typescript
// Base conversion component interface
interface ConversionComponentProps {
  toolDefinition: ToolDefinition;
  onConversionComplete: (result: ProcessingResult) => void;
  onError: (error: ConversionError) => void;
  userTier: 'free' | 'pro';
}

// Specific tool components
const PDFConverter: React.FC<ConversionComponentProps>;
const ImageConverter: React.FC<ConversionComponentProps>;
const BackgroundRemover: React.FC<ConversionComponentProps>;
const AudioConverter: React.FC<ConversionComponentProps>;
const VideoConverter: React.FC<ConversionComponentProps>;
const TextFormatter: React.FC<ConversionComponentProps>;
const OCRExtractor: React.FC<ConversionComponentProps>;
const QRGenerator: React.FC<ConversionComponentProps>;
```

### Backend API Design

#### 1. Modular API Structure
```python
# FastAPI app structure
app/
├── main.py                 # FastAPI app initialization
├── routers/
│   ├── pdf.py             # PDF conversion endpoints
│   ├── image.py           # Image processing endpoints
│   ├── audio.py           # Audio conversion endpoints
│   ├── video.py           # Video processing endpoints
│   ├── text.py            # Text utilities endpoints
│   ├── ocr.py             # OCR processing endpoints
│   └── qr.py              # QR code endpoints
├── services/
│   ├── conversion_service.py
│   ├── file_service.py
│   └── storage_service.py
└── models/
    ├── conversion_models.py
    └── user_models.py
```

#### 2. API Response Format
```python
from pydantic import BaseModel
from typing import Optional, Dict, Any

class ConversionResponse(BaseModel):
    status: str  # "success" | "error" | "processing"
    result_url: Optional[str]
    task_id: Optional[str]
    metadata: Dict[str, Any]
    error_message: Optional[str]
    processing_time: Optional[float]

class BatchConversionResponse(BaseModel):
    batch_id: str
    total_files: int
    completed: int
    failed: int
    results: List[ConversionResponse]
    zip_url: Optional[str]
```

## Data Models

### File Processing Models

```typescript
interface ProcessingTask {
  id: string;
  userId?: string;
  inputFile: FileMetadata;
  outputFormat: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  options: ProcessingOptions;
  result?: ProcessingResult;
  error?: string;
  createdAt: Date;
  completedAt?: Date;
  expiresAt: Date;
}

interface FileMetadata {
  name: string;
  size: number;
  type: string;
  hash: string;
  uploadedAt: Date;
}

interface ProcessingResult {
  outputUrl: string;
  outputSize: number;
  outputType: string;
  processingTime: number;
  metadata: Record<string, any>;
}
```

### User and Subscription Models

```typescript
interface User {
  id: string;
  email?: string;
  tier: 'free' | 'pro';
  apiKey?: string;
  subscriptionId?: string;
  usageStats: UsageStats;
  createdAt: Date;
}

interface UsageStats {
  conversionsToday: number;
  conversionsThisMonth: number;
  totalConversions: number;
  lastConversion: Date;
}
```

## Error Handling

### Error Categories and Recovery

```typescript
enum ErrorType {
  VALIDATION_ERROR = 'validation_error',
  PROCESSING_ERROR = 'processing_error',
  QUOTA_EXCEEDED = 'quota_exceeded',
  UNSUPPORTED_FORMAT = 'unsupported_format',
  FILE_TOO_LARGE = 'file_too_large',
  SYSTEM_ERROR = 'system_error'
}

interface ErrorHandler {
  handleError(error: ConversionError): ErrorResponse;
  getRecoveryActions(errorType: ErrorType): RecoveryAction[];
  logError(error: ConversionError, context: ErrorContext): void;
}

interface RecoveryAction {
  type: 'retry' | 'upgrade' | 'alternative' | 'contact_support';
  message: string;
  actionUrl?: string;
}
```

## Testing Strategy

### Frontend Testing
- **Component Tests**: React Testing Library for UI components
- **Integration Tests**: End-to-end conversion workflows
- **Performance Tests**: File upload and processing performance
- **Cross-browser Tests**: Compatibility across major browsers

### Backend Testing
- **Unit Tests**: Individual conversion service testing
- **API Tests**: FastAPI endpoint testing with pytest
- **Load Tests**: Concurrent conversion handling
- **Integration Tests**: Full pipeline testing with real files

### Test Data Requirements
- Sample files for each supported format
- Large files for performance testing
- Corrupted files for error handling
- Edge cases (empty files, unusual formats)

## Performance Considerations

### Scalability Design
- **Horizontal Scaling**: Stateless API design for easy scaling
- **Queue Management**: Redis-based task queuing for heavy operations
- **Caching Strategy**: CDN caching for static assets and results
- **Database Optimization**: Indexed queries and connection pooling

### Client-Side Optimizations
- **Progressive Loading**: Lazy load conversion modules
- **File Streaming**: Chunk large file uploads
- **Memory Management**: Clean up blob URLs and canvas contexts
- **Offline Support**: Service worker for basic functionality

## Security and Privacy

### Data Protection
- **File Encryption**: Encrypt files at rest and in transit
- **Auto-Deletion**: Automatic file cleanup after 1 hour
- **Privacy Mode**: Client-side processing for sensitive files
- **Access Control**: Secure API endpoints with rate limiting

### Security Measures
- **Input Validation**: Strict file type and size validation
- **CORS Configuration**: Proper cross-origin resource sharing
- **API Security**: Authentication, rate limiting, and monitoring
- **Content Security**: CSP headers and XSS protection

## Monetization Integration

### Ad Integration
```typescript
interface AdManager {
  loadAds(placement: AdPlacement): void;
  showInterstitial(trigger: AdTrigger): void;
  trackConversion(conversionType: string): void;
}

enum AdPlacement {
  HEADER = 'header',
  SIDEBAR = 'sidebar',
  BETWEEN_TOOLS = 'between_tools',
  RESULT_PAGE = 'result_page'
}
```

### Subscription Management
```typescript
interface SubscriptionService {
  checkUserTier(userId: string): Promise<UserTier>;
  upgradeUser(userId: string, planId: string): Promise<SubscriptionResult>;
  trackUsage(userId: string, action: string): Promise<void>;
  enforceQuotas(userId: string, action: string): Promise<QuotaResult>;
}
```

## Deployment Architecture

### Production Environment
- **Frontend**: Cloudflare Pages with edge caching
- **API**: Multiple instances behind load balancer
- **Workers**: Celery workers on separate instances
- **Storage**: Distributed across multiple regions
- **Monitoring**: Application performance monitoring and logging

### Development Workflow
- **Local Development**: Docker Compose for full stack
- **Staging Environment**: Automated deployments from main branch
- **Production Deployment**: Blue-green deployment strategy
- **Rollback Strategy**: Automated rollback on health check failures