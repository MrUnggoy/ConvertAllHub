import { useCallback, useState, useRef, useEffect } from 'react'
import { Upload, X, File, AlertCircle, CheckCircle, Package } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useConversion } from '@/contexts/ConversionContext'
import { useResponsive } from '@/hooks/useResponsive'
import { ToolDefinition } from '@/tools/registry'
import { Button } from '@/components/ui/button'
import MobileFileUpload from '@/components/MobileFileUpload'

interface FileUploadProps {
  tool: ToolDefinition
  onFilesAdded?: (files: File[]) => void
  maxFiles?: number
  maxSizeBytes?: number
  className?: string
}

interface FileValidationResult {
  isValid: boolean
  error?: string
}

export default function FileUpload({ 
  tool, 
  onFilesAdded, 
  maxFiles = 10, 
  maxSizeBytes = 50 * 1024 * 1024, // 50MB default
  className 
}: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const { isMobile } = useResponsive()

  const fileInputRef = useRef<HTMLInputElement>(null)
  const { addFile, state, setBatchMode } = useConversion()

  // Check if tool supports batch processing
  const supportsBatch = ['pdf-to-image', 'pdf-text-extract', 'image-converter', 'background-removal'].includes(tool.id)

  // Use mobile version on mobile devices
  if (isMobile) {
    return (
      <MobileFileUpload
        tool={tool}
        onFilesAdded={onFilesAdded}
        maxFiles={maxFiles}
        maxSizeBytes={maxSizeBytes}
        className={className}
      />
    )
  }

  // Validate file against tool requirements
  const validateFile = useCallback((file: File): FileValidationResult => {
    // Check file size
    if (file.size > maxSizeBytes) {
      return {
        isValid: false,
        error: `File size (${(file.size / 1024 / 1024).toFixed(1)}MB) exceeds maximum allowed size (${(maxSizeBytes / 1024 / 1024).toFixed(1)}MB)`
      }
    }

    // Check file type against tool's input formats
    const fileExtension = file.name.split('.').pop()?.toLowerCase()
    const mimeType = file.type.toLowerCase()
    
    const isValidFormat = tool.inputFormats.some(format => {
      const formatLower = format.toLowerCase()
      
      // Check by extension
      if (fileExtension === formatLower) return true
      
      // Check by MIME type patterns
      if (formatLower === 'pdf' && mimeType.includes('pdf')) return true
      if (formatLower === 'jpg' && (mimeType.includes('jpeg') || mimeType.includes('jpg'))) return true
      if (formatLower === 'png' && mimeType.includes('png')) return true
      if (formatLower === 'gif' && mimeType.includes('gif')) return true
      if (formatLower === 'webp' && mimeType.includes('webp')) return true
      if (formatLower === 'mp3' && mimeType.includes('mp3')) return true
      if (formatLower === 'wav' && mimeType.includes('wav')) return true
      if (formatLower === 'mp4' && mimeType.includes('mp4')) return true
      if (formatLower === 'avi' && mimeType.includes('avi')) return true
      if (formatLower === 'txt' && mimeType.includes('text')) return true
      if (formatLower === 'docx' && mimeType.includes('document')) return true
      
      return false
    })

    if (!isValidFormat) {
      return {
        isValid: false,
        error: `File type not supported. Supported formats: ${tool.inputFormats.join(', ')}`
      }
    }

    return { isValid: true }
  }, [tool.inputFormats, maxSizeBytes])

  // Handle file processing
  const processFiles = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files)
    
    // Check max files limit
    if (state.files.length + fileArray.length > maxFiles) {
      alert(`Maximum ${maxFiles} files allowed`)
      return
    }

    const validFiles: File[] = []
    const errors: string[] = []

    fileArray.forEach(file => {
      const validation = validateFile(file)
      if (validation.isValid) {
        validFiles.push(file)
      } else {
        errors.push(`${file.name}: ${validation.error}`)
      }
    })

    // Show errors if any
    if (errors.length > 0) {
      alert(`File validation errors:\n${errors.join('\n')}`)
    }

    // Add valid files
    validFiles.forEach(file => {
      addFile(file, tool.id)
    })

    // Callback for parent component
    if (onFilesAdded && validFiles.length > 0) {
      onFilesAdded(validFiles)
    }
  }, [validateFile, addFile, tool.id, maxFiles, state.files.length, onFilesAdded])

  // Drag and drop handlers
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)

    const files = e.dataTransfer.files
    if (files.length > 0) {
      processFiles(files)
    }
  }, [processFiles])

  // File input handler
  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      processFiles(files)
    }
    // Reset input value to allow selecting the same file again
    e.target.value = ''
  }, [processFiles])

  // Clipboard paste handler
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items
      if (!items) return

      const files: File[] = []
      
      for (let i = 0; i < items.length; i++) {
        const item = items[i]
        
        // Handle image paste
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile()
          if (file) {
            files.push(file)
          }
        }
        
        // Handle text paste (for text tools)
        if (item.type === 'text/plain' && tool.inputFormats.includes('TEXT')) {
          item.getAsString((text) => {
            // Create a blob and convert to File
            const blob = new Blob([text], { type: 'text/plain' })
            const file = blob as File
            // Add file properties
            Object.defineProperty(file, 'name', { value: 'pasted-text.txt', writable: false })
            Object.defineProperty(file, 'lastModified', { value: Date.now(), writable: false })
            processFiles([file])
          })
        }
      }

      if (files.length > 0) {
        processFiles(files)
      }
    }

    document.addEventListener('paste', handlePaste)
    return () => document.removeEventListener('paste', handlePaste)
  }, [processFiles, tool.inputFormats])

  // Click to upload
  const handleClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Upload Zone */}
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
          isDragOver 
            ? "border-primary bg-primary/5" 
            : "border-muted-foreground/25 hover:border-primary/50 hover:bg-accent/50"
        )}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={tool.inputFormats.map(format => {
            // Convert format to accept attribute
            if (format.toLowerCase() === 'pdf') return '.pdf'
            if (format.toLowerCase() === 'jpg') return '.jpg,.jpeg'
            if (format.toLowerCase() === 'png') return '.png'
            if (format.toLowerCase() === 'gif') return '.gif'
            if (format.toLowerCase() === 'webp') return '.webp'
            if (format.toLowerCase() === 'mp3') return '.mp3'
            if (format.toLowerCase() === 'wav') return '.wav'
            if (format.toLowerCase() === 'mp4') return '.mp4'
            if (format.toLowerCase() === 'avi') return '.avi'
            if (format.toLowerCase() === 'txt') return '.txt'
            if (format.toLowerCase() === 'docx') return '.docx'
            return `.${format.toLowerCase()}`
          }).join(',')}
          onChange={handleFileInput}
          className="hidden"
        />
        
        <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        
        <div className="space-y-2">
          <p className="text-lg font-medium">
            {isDragOver ? 'Drop files here' : 'Drop files here or click to browse'}
          </p>
          <p className="text-sm text-muted-foreground">
            Supports: {tool.inputFormats.join(', ')}
          </p>
          <p className="text-xs text-muted-foreground">
            Max {maxFiles} files, {(maxSizeBytes / 1024 / 1024).toFixed(0)}MB per file
          </p>
          {tool.inputFormats.includes('TEXT') && (
            <p className="text-xs text-muted-foreground">
              💡 You can also paste text or images directly (Ctrl+V)
            </p>
          )}
        </div>
      </div>

      {/* Batch Mode Toggle */}
      {supportsBatch && state.files.length >= 2 && (
        <div className="flex items-center justify-between p-3 bg-accent/50 rounded-lg">
          <div className="flex items-center space-x-2">
            <Package className="h-4 w-4" />
            <span className="text-sm font-medium">Batch Processing Mode</span>
          </div>
          <Button
            variant={state.batchMode ? "default" : "outline"}
            size="sm"
            onClick={() => setBatchMode(!state.batchMode)}
          >
            {state.batchMode ? 'Enabled' : 'Enable'}
          </Button>
        </div>
      )}

      {/* File List */}
      {state.files.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Uploaded Files ({state.files.length})</h4>
            {state.batchMode && (
              <span className="text-xs text-muted-foreground bg-primary/10 px-2 py-1 rounded">
                Batch Mode
              </span>
            )}
          </div>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {state.files.map((file) => (
              <FileItem key={file.id} file={file} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Individual file item component
interface FileItemProps {
  file: {
    id: string
    name: string
    size: number
    status: 'pending' | 'uploading' | 'processing' | 'completed' | 'error'
    progress: number
    error?: string
  }
}

function FileItem({ file }: FileItemProps) {
  const { removeFile } = useConversion()

  const getStatusIcon = () => {
    switch (file.status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case 'processing':
      case 'uploading':
        return (
          <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        )
      default:
        return <File className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getStatusText = () => {
    switch (file.status) {
      case 'uploading':
        return `Uploading... ${file.progress}%`
      case 'processing':
        return `Processing... ${file.progress}%`
      case 'completed':
        return 'Completed'
      case 'error':
        return file.error || 'Error'
      default:
        return 'Ready'
    }
  }

  return (
    <div className="flex items-center space-x-3 p-3 bg-card border rounded-lg">
      {getStatusIcon()}
      
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{file.name}</p>
        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
          <span>{(file.size / 1024 / 1024).toFixed(1)} MB</span>
          <span>•</span>
          <span>{getStatusText()}</span>
        </div>
        
        {(file.status === 'uploading' || file.status === 'processing') && (
          <div className="w-full bg-muted rounded-full h-1 mt-1">
            <div 
              className="bg-primary h-1 rounded-full transition-all duration-300"
              style={{ width: `${file.progress}%` }}
            />
          </div>
        )}
      </div>
      
      <button
        onClick={() => removeFile(file.id)}
        className="p-1 hover:bg-accent rounded-sm"
        disabled={file.status === 'processing'}
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}