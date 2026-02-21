import { ConversionResult, ProcessingOptions } from '@/contexts/ConversionContext'

export interface ApiResponse<T = any> {
  status: 'success' | 'error' | 'processing'
  result_url?: string
  task_id?: string
  metadata?: Record<string, any>
  error_message?: string
  processing_time?: number
  data?: T
}

export interface BatchApiResponse {
  batch_id: string
  total_files: number
  completed: number
  failed: number
  results: ApiResponse[]
  zip_url?: string
}

export interface BatchProgress {
  batch_id: string
  status: 'queued' | 'processing' | 'completed' | 'error'
  total_files: number
  completed: number
  failed: number
  progress_percentage: number
}

export interface UploadProgress {
  loaded: number
  total: number
  percentage: number
}

export class ApiService {
  private static readonly BASE_URL = 'http://localhost:8000/api'
  private static readonly TIMEOUT = 30000 // 30 seconds

  static async uploadFile(
    file: File,
    toolCategory: string,
    endpoint: string,
    options: ProcessingOptions,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<ApiResponse> {
    const formData = new FormData()
    formData.append('file', file)
    
    // Add processing options to form data
    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value.toString())
      }
    })

    const url = `${this.BASE_URL}/${toolCategory}/${endpoint}`

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()

      // Set up progress tracking
      if (onProgress) {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const progress: UploadProgress = {
              loaded: event.loaded,
              total: event.total,
              percentage: Math.round((event.loaded / event.total) * 100)
            }
            onProgress(progress)
          }
        })
      }

      // Set up response handling
      xhr.addEventListener('load', () => {
        try {
          const response: ApiResponse = JSON.parse(xhr.responseText)
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(response)
          } else {
            reject(new Error(response.error_message || `HTTP ${xhr.status}`))
          }
        } catch (error) {
          reject(new Error('Invalid response format'))
        }
      })

      xhr.addEventListener('error', () => {
        reject(new Error('Network error occurred'))
      })

      xhr.addEventListener('timeout', () => {
        reject(new Error('Request timed out'))
      })

      // Configure and send request
      xhr.open('POST', url)
      xhr.timeout = this.TIMEOUT
      xhr.send(formData)
    })
  }

  static async getConversionStatus(taskId: string): Promise<ApiResponse> {
    const response = await fetch(`${this.BASE_URL}/pdf/status/${taskId}`)
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    return response.json()
  }

  static async convertPdfToImage(
    file: File,
    options: { output_format?: string; quality?: number; dpi?: number } = {},
    onProgress?: (progress: UploadProgress) => void
  ): Promise<ApiResponse> {
    return this.uploadFile(file, 'pdf', 'to-image', {
      outputFormat: options.output_format || 'png',
      quality: options.quality || 80,
      ...options
    }, onProgress)
  }

  static async extractTextFromPdf(
    file: File,
    options: { output_format?: string; include_formatting?: boolean } = {},
    onProgress?: (progress: UploadProgress) => void
  ): Promise<ApiResponse> {
    return this.uploadFile(file, 'pdf', 'extract-text', {
      outputFormat: options.output_format || 'txt',
      ...options
    }, onProgress)
  }

  static async convertImageFormat(
    file: File,
    options: { output_format?: string; quality?: number; resize_width?: number; resize_height?: number } = {},
    onProgress?: (progress: UploadProgress) => void
  ): Promise<ApiResponse> {
    return this.uploadFile(file, 'image', 'convert', {
      outputFormat: options.output_format || 'png',
      quality: options.quality || 80,
      ...options
    }, onProgress)
  }

  static async removeBackground(
    file: File,
    options: { model?: string; alpha_matting?: boolean } = {},
    onProgress?: (progress: UploadProgress) => void
  ): Promise<ApiResponse> {
    return this.uploadFile(file, 'image', 'remove-background', {
      outputFormat: 'png',
      ...options
    }, onProgress)
  }

  static async convertAudio(
    file: File,
    options: { output_format?: string; bitrate?: number; sample_rate?: number } = {},
    onProgress?: (progress: UploadProgress) => void
  ): Promise<ApiResponse> {
    return this.uploadFile(file, 'audio', 'convert', {
      outputFormat: options.output_format || 'mp3',
      ...options
    }, onProgress)
  }

  static async convertVideo(
    file: File,
    options: { output_format?: string; quality?: string; resolution?: string; fps?: number } = {},
    onProgress?: (progress: UploadProgress) => void
  ): Promise<ApiResponse> {
    const processOptions: ProcessingOptions = {
      outputFormat: options.output_format || 'mp4'
    }
    
    // Add other options that match ProcessingOptions interface
    if (options.fps) processOptions.quality = options.fps
    
    return this.uploadFile(file, 'video', 'convert', processOptions, onProgress)
  }

  static async extractTextOCR(
    file: File,
    options: { language?: string; output_format?: string; preserve_layout?: boolean } = {},
    onProgress?: (progress: UploadProgress) => void
  ): Promise<ApiResponse> {
    return this.uploadFile(file, 'ocr', 'extract-text', {
      outputFormat: options.output_format || 'txt',
      ...options
    }, onProgress)
  }

  static async generateQRCode(
    content: string,
    options: { output_format?: string; size?: number; error_correction?: string; border?: number } = {}
  ): Promise<ApiResponse> {
    const response = await fetch(`${this.BASE_URL}/qr/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content,
        output_format: options.output_format || 'png',
        size: options.size || 256,
        error_correction: options.error_correction || 'M',
        border: options.border || 4
      })
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    return response.json()
  }

  static async decodeQRCode(
    file: File,
    options: { output_format?: string } = {},
    onProgress?: (progress: UploadProgress) => void
  ): Promise<ApiResponse> {
    return this.uploadFile(file, 'qr', 'decode', {
      outputFormat: options.output_format || 'txt'
    }, onProgress)
  }

  // Utility method to convert API response to ConversionResult
  static apiResponseToConversionResult(response: ApiResponse): ConversionResult {
    return {
      outputUrl: response.result_url || '',
      outputSize: response.metadata?.compressed_size_bytes || response.metadata?.output_size || 0,
      outputType: response.metadata?.output_format || 'unknown',
      processingTime: response.processing_time || 0,
      metadata: response.metadata || {}
    }
  }

  // Batch processing methods
  static async batchUploadFiles(
    files: File[],
    toolCategory: string,
    endpoint: string,
    options: ProcessingOptions,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<BatchApiResponse> {
    const formData = new FormData()
    
    // Add all files
    files.forEach(file => {
      formData.append('files', file)
    })
    
    // Add processing options
    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value.toString())
      }
    })

    const url = `${this.BASE_URL}/${toolCategory}/batch/${endpoint}`

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()

      if (onProgress) {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const progress: UploadProgress = {
              loaded: event.loaded,
              total: event.total,
              percentage: Math.round((event.loaded / event.total) * 100)
            }
            onProgress(progress)
          }
        })
      }

      xhr.addEventListener('load', () => {
        try {
          const response: BatchApiResponse = JSON.parse(xhr.responseText)
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(response)
          } else {
            reject(new Error(`HTTP ${xhr.status}`))
          }
        } catch (error) {
          reject(new Error('Invalid response format'))
        }
      })

      xhr.addEventListener('error', () => {
        reject(new Error('Network error occurred'))
      })

      xhr.addEventListener('timeout', () => {
        reject(new Error('Request timed out'))
      })

      xhr.open('POST', url)
      xhr.timeout = 300000 // 5 minutes for batch processing
      xhr.send(formData)
    })
  }

  static async getBatchStatus(batchId: string, toolCategory: string): Promise<BatchProgress> {
    const response = await fetch(`${this.BASE_URL}/${toolCategory}/batch/status/${batchId}`)
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    return response.json()
  }

  // Batch conversion methods
  static async batchConvertPdfToImage(
    files: File[],
    options: { output_format?: string; quality?: number; dpi?: number } = {},
    onProgress?: (progress: UploadProgress) => void
  ): Promise<BatchApiResponse> {
    return this.batchUploadFiles(files, 'pdf', 'to-image', {
      outputFormat: options.output_format || 'png',
      quality: options.quality || 80,
      ...options
    }, onProgress)
  }

  static async batchExtractTextFromPdf(
    files: File[],
    options: { output_format?: string } = {},
    onProgress?: (progress: UploadProgress) => void
  ): Promise<BatchApiResponse> {
    return this.batchUploadFiles(files, 'pdf', 'extract-text', {
      outputFormat: options.output_format || 'txt'
    }, onProgress)
  }

  static async batchConvertImages(
    files: File[],
    options: { output_format?: string; quality?: number; resize_width?: number; resize_height?: number } = {},
    onProgress?: (progress: UploadProgress) => void
  ): Promise<BatchApiResponse> {
    return this.batchUploadFiles(files, 'image', 'convert', {
      outputFormat: options.output_format || 'png',
      quality: options.quality || 80,
      ...options
    }, onProgress)
  }

  static async batchRemoveBackground(
    files: File[],
    options: { model?: string; alpha_matting?: boolean } = {},
    onProgress?: (progress: UploadProgress) => void
  ): Promise<BatchApiResponse> {
    return this.batchUploadFiles(files, 'image', 'remove-background', {
      outputFormat: 'png',
      ...options
    }, onProgress)
  }

  // Health check
  static async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.BASE_URL.replace('/api', '')}/health`)
      return response.ok
    } catch {
      return false
    }
  }
}