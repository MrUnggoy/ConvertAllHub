export interface FileValidationOptions {
  maxSizeBytes?: number
  allowedTypes?: string[]
  allowedExtensions?: string[]
  minSizeBytes?: number
}

export interface FileValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

export class FileValidator {
  private static readonly DEFAULT_MAX_SIZE = 50 * 1024 * 1024 // 50MB
  private static readonly DEFAULT_MIN_SIZE = 1 // 1 byte

  static validate(file: File, options: FileValidationOptions = {}): FileValidationResult {
    const {
      maxSizeBytes = this.DEFAULT_MAX_SIZE,
      minSizeBytes = this.DEFAULT_MIN_SIZE,
      allowedTypes = [],
      allowedExtensions = []
    } = options

    const errors: string[] = []
    const warnings: string[] = []

    // Check file size
    if (file.size > maxSizeBytes) {
      errors.push(
        `File size (${this.formatFileSize(file.size)}) exceeds maximum allowed size (${this.formatFileSize(maxSizeBytes)})`
      )
    }

    if (file.size < minSizeBytes) {
      errors.push(
        `File size (${this.formatFileSize(file.size)}) is below minimum required size (${this.formatFileSize(minSizeBytes)})`
      )
    }

    // Check file type
    if (allowedTypes.length > 0) {
      const isValidType = allowedTypes.some(type => 
        file.type.toLowerCase().includes(type.toLowerCase())
      )
      
      if (!isValidType) {
        errors.push(`File type "${file.type}" is not supported. Allowed types: ${allowedTypes.join(', ')}`)
      }
    }

    // Check file extension
    if (allowedExtensions.length > 0) {
      const fileExtension = this.getFileExtension(file.name)
      const isValidExtension = allowedExtensions.some(ext => 
        ext.toLowerCase() === fileExtension.toLowerCase()
      )
      
      if (!isValidExtension) {
        errors.push(`File extension "${fileExtension}" is not supported. Allowed extensions: ${allowedExtensions.join(', ')}`)
      }
    }

    // Check for potential issues
    if (file.size === 0) {
      warnings.push('File appears to be empty')
    }

    if (file.name.length > 255) {
      warnings.push('File name is very long and may cause issues')
    }

    if (!/^[\w\-. ]+$/.test(file.name)) {
      warnings.push('File name contains special characters that may cause issues')
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }

  static validateMultiple(files: File[], options: FileValidationOptions = {}): {
    validFiles: File[]
    invalidFiles: { file: File; result: FileValidationResult }[]
    totalErrors: string[]
  } {
    const validFiles: File[] = []
    const invalidFiles: { file: File; result: FileValidationResult }[] = []
    const totalErrors: string[] = []

    // Check for duplicate files
    const fileNames = new Set<string>()
    const duplicates: string[] = []

    files.forEach(file => {
      if (fileNames.has(file.name)) {
        duplicates.push(file.name)
      } else {
        fileNames.add(file.name)
      }
    })

    if (duplicates.length > 0) {
      totalErrors.push(`Duplicate files detected: ${duplicates.join(', ')}`)
    }

    // Validate each file
    files.forEach(file => {
      const result = this.validate(file, options)
      
      if (result.isValid) {
        validFiles.push(file)
      } else {
        invalidFiles.push({ file, result })
      }
    })

    return {
      validFiles,
      invalidFiles,
      totalErrors
    }
  }

  static getFileExtension(filename: string): string {
    const parts = filename.split('.')
    return parts.length > 1 ? parts[parts.length - 1] : ''
  }

  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  static getMimeTypeFromExtension(extension: string): string {
    const mimeTypes: Record<string, string> = {
      // Images
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'webp': 'image/webp',
      'bmp': 'image/bmp',
      'tiff': 'image/tiff',
      'svg': 'image/svg+xml',
      
      // Documents
      'pdf': 'application/pdf',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'txt': 'text/plain',
      'rtf': 'application/rtf',
      'html': 'text/html',
      'htm': 'text/html',
      
      // Audio
      'mp3': 'audio/mpeg',
      'wav': 'audio/wav',
      'flac': 'audio/flac',
      'aac': 'audio/aac',
      'ogg': 'audio/ogg',
      'm4a': 'audio/mp4',
      
      // Video
      'mp4': 'video/mp4',
      'avi': 'video/x-msvideo',
      'mov': 'video/quicktime',
      'mkv': 'video/x-matroska',
      'webm': 'video/webm',
      'flv': 'video/x-flv',
      
      // Archives
      'zip': 'application/zip',
      'rar': 'application/vnd.rar',
      '7z': 'application/x-7z-compressed',
      'tar': 'application/x-tar',
      'gz': 'application/gzip'
    }
    
    return mimeTypes[extension.toLowerCase()] || 'application/octet-stream'
  }

  static isImageFile(file: File): boolean {
    return file.type.startsWith('image/') || 
           ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'tiff', 'svg'].includes(
             this.getFileExtension(file.name).toLowerCase()
           )
  }

  static isVideoFile(file: File): boolean {
    return file.type.startsWith('video/') || 
           ['mp4', 'avi', 'mov', 'mkv', 'webm', 'flv'].includes(
             this.getFileExtension(file.name).toLowerCase()
           )
  }

  static isAudioFile(file: File): boolean {
    return file.type.startsWith('audio/') || 
           ['mp3', 'wav', 'flac', 'aac', 'ogg', 'm4a'].includes(
             this.getFileExtension(file.name).toLowerCase()
           )
  }

  static isDocumentFile(file: File): boolean {
    return ['pdf', 'doc', 'docx', 'txt', 'rtf', 'html', 'htm'].includes(
      this.getFileExtension(file.name).toLowerCase()
    ) || file.type.includes('document') || file.type.includes('pdf') || file.type.includes('text')
  }
}