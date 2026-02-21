import { useState, useCallback, useRef } from 'react'
import { Download, Image as ImageIcon, Zap, Sliders } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import FileUpload from '@/components/FileUpload'
import ConversionProgress from '@/components/ConversionProgress'

import ProUpgradeModal from '@/components/monetization/ProUpgradeModal'
import { useConversion } from '@/contexts/ConversionContext'
import { useAnalytics } from '@/hooks/useAnalytics'
import { ToolDefinition } from '@/tools/registry'
import JSZip from 'jszip'

interface ImageConverterToolProps {
  tool: ToolDefinition
}

interface ConversionSettings {
  format: 'png' | 'jpg' | 'webp' | 'gif'
  quality: number
  resize: boolean
  width?: number
  height?: number
  maintainAspectRatio: boolean
}

interface ConvertedImage {
  url: string
  name: string
  blob: Blob
  originalSize: number
  newSize: number
  compressionRatio: number
}

export default function ImageConverterTool({ tool }: ImageConverterToolProps) {
  const [settings, setSettings] = useState<ConversionSettings>({
    format: 'png',
    quality: 90,
    resize: false,
    maintainAspectRatio: true
  })
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [, setIsConverting] = useState(false)
  const [convertedImages, setConvertedImages] = useState<ConvertedImage[]>([])
  
  const { state, updateFileStatus, setFileResult, setFileError, clearFiles } = useConversion()
  const { trackConversionStarted, trackConversionCompleted, trackUpgradePromptShown } = useAnalytics()
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const handleFilesAdded = useCallback(async (files: File[]) => {
    const imageFiles = files.filter(file => file.type.startsWith('image/'))
    
    if (imageFiles.length === 0) {
      alert('Please select image files only')
      return
    }

    // Check for Pro features
    if (imageFiles.length > 5 && state.userTier === 'free') {
      setShowUpgradeModal(true)
      trackUpgradePromptShown('multiple_image_files', tool.id)
      return
    }

    // Start conversion for each image
    const results: ConvertedImage[] = []
    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i]
      trackConversionStarted(tool.id, file.type, file.size)
      const result = await convertImage(file, i)
      if (result) {
        results.push(result)
      }
    }
    
    setConvertedImages(results)
  }, [state.userTier, tool.id, trackConversionStarted, trackUpgradePromptShown])

  const convertImage = async (file: File, index: number): Promise<ConvertedImage | null> => {
    const fileId = `${Date.now()}-${index}-${Math.random().toString(36).substring(2, 9)}`
    
    try {
      setIsConverting(true)
      updateFileStatus(fileId, 'processing', 0)

      // Create image element
      const img = new Image()
      const imageLoadPromise = new Promise<void>((resolve, reject) => {
        img.onload = () => resolve()
        img.onerror = () => reject(new Error('Failed to load image'))
      })
      
      img.src = URL.createObjectURL(file)
      await imageLoadPromise

      updateFileStatus(fileId, 'processing', 30)

      // Calculate dimensions
      let { width, height } = img
      if (settings.resize && settings.width && settings.height) {
        if (settings.maintainAspectRatio) {
          const aspectRatio = width / height
          if (settings.width / settings.height > aspectRatio) {
            width = settings.height * aspectRatio
            height = settings.height
          } else {
            width = settings.width
            height = settings.width / aspectRatio
          }
        } else {
          width = settings.width
          height = settings.height
        }
      }

      // Create canvas
      const canvas = canvasRef.current || document.createElement('canvas')
      const ctx = canvas.getContext('2d')!
      canvas.width = width
      canvas.height = height

      updateFileStatus(fileId, 'processing', 60)

      // Draw image to canvas
      ctx.clearRect(0, 0, width, height)
      ctx.drawImage(img, 0, 0, width, height)

      updateFileStatus(fileId, 'processing', 80)

      // Convert to blob
      const blob = await new Promise<Blob>((resolve, reject) => {
        const callback = (blob: Blob | null) => {
          if (blob) resolve(blob)
          else reject(new Error('Failed to create blob'))
        }
        
        if (settings.format === 'jpg') {
          canvas.toBlob(callback, 'image/jpeg', settings.quality / 100)
        } else if (settings.format === 'webp') {
          canvas.toBlob(callback, 'image/webp', settings.quality / 100)
        } else if (settings.format === 'gif') {
          // For GIF, we'll use PNG as fallback since canvas doesn't support GIF encoding
          canvas.toBlob(callback, 'image/png')
        } else {
          canvas.toBlob(callback, 'image/png')
        }
      })

      if (blob) {
        const url = URL.createObjectURL(blob)
        const fileName = `${file.name.split('.')[0]}.${settings.format === 'gif' ? 'png' : settings.format}`
        const compressionRatio = ((file.size - blob.size) / file.size) * 100
        
        const convertedImage: ConvertedImage = {
          url,
          name: fileName,
          blob,
          originalSize: file.size,
          newSize: blob.size,
          compressionRatio: Math.max(0, compressionRatio)
        }

        updateFileStatus(fileId, 'processing', 100)

        // Create result
        const processingTime = Date.now() - parseInt(fileId.split('-')[0])
        const result = {
          outputUrl: url,
          outputSize: blob.size,
          outputType: settings.format,
          processingTime: processingTime / 1000,
          metadata: {
            original_format: file.type,
            original_size: file.size,
            new_size: blob.size,
            compression_ratio: compressionRatio,
            dimensions: `${width}x${height}`,
            quality: settings.quality,
            client_side: true
          }
        }

        setFileResult(fileId, result)
        trackConversionCompleted(tool.id, processingTime, true)

        // Clean up
        URL.revokeObjectURL(img.src)
        
        return convertedImage
      }

      return null

    } catch (error) {
      console.error('Image conversion error:', error)
      setFileError(fileId, `Conversion failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      trackConversionCompleted(tool.id, 0, false)
      return null
    } finally {
      setIsConverting(false)
    }
  }

  const handleDownload = async (_fileId: string, url: string) => {
    if (url === 'batch_download') {
      // Create ZIP file for multiple images
      const zip = new JSZip()
      
      convertedImages.forEach((image) => {
        zip.file(image.name, image.blob)
      })

      const zipBlob = await zip.generateAsync({ type: 'blob' })
      const zipUrl = URL.createObjectURL(zipBlob)
      
      const link = document.createElement('a')
      link.href = zipUrl
      link.download = `converted_images.zip`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      URL.revokeObjectURL(zipUrl)
    } else {
      // Single file download
      const link = document.createElement('a')
      link.href = url
      link.download = convertedImages.find(img => img.url === url)?.name || 'converted_image'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const handleRetry = (fileId: string) => {
    // Find the original file and retry conversion
    const file = state.files.find(f => f.id === fileId)?.file
    if (file) {
      convertImage(file, 0)
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="space-y-6">
      {/* Tool Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ImageIcon className="h-6 w-6" />
            <span>Image Format Converter</span>
            <div className="flex items-center space-x-1 text-green-600 text-sm">
              <Zap className="h-4 w-4" />
              <span>Client-side</span>
            </div>
          </CardTitle>
          <CardDescription>
            Convert images between different formats with quality control. Processing happens in your browser for complete privacy.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-sm mb-2">Supported Input Formats:</h4>
              <div className="flex flex-wrap gap-1">
                {['JPG', 'PNG', 'GIF', 'WEBP', 'BMP', 'TIFF'].map(format => (
                  <span key={format} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                    {format}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-medium text-sm mb-2">Output Formats:</h4>
              <div className="flex flex-wrap gap-1">
                {['PNG', 'JPG', 'WEBP', 'GIF'].map(format => (
                  <span key={format} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                    {format}
                  </span>
                ))}
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <span>✓ Privacy-first processing</span>
              <span>✓ Quality control</span>
              <span>✓ Batch conversion</span>
            </div>
            
            {state.files.length > 0 && (
              <Button variant="outline" size="sm" onClick={clearFiles}>
                Clear All
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Conversion Settings - Always Visible */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center space-x-2">
            <Sliders className="h-5 w-5" />
            <span>Conversion Settings</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Output Format */}
            <div>
              <label className="block text-sm font-medium mb-2">Output Format</label>
              <select
                value={settings.format}
                onChange={(e) => setSettings(prev => ({ ...prev, format: e.target.value as any }))}
                className="w-full p-2 border rounded-md"
              >
                <option value="png">PNG (Lossless, larger files)</option>
                <option value="jpg">JPG (Lossy, smaller files)</option>
                <option value="webp">WebP (Modern, best compression)</option>
                <option value="gif">GIF (Animation support)</option>
              </select>
            </div>

            {/* Quality */}
            {(settings.format === 'jpg' || settings.format === 'webp') && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  Quality: {settings.quality}%
                </label>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={settings.quality}
                  onChange={(e) => setSettings(prev => ({ ...prev, quality: parseInt(e.target.value) }))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Smaller file</span>
                  <span>Better quality</span>
                </div>
              </div>
            )}
          </div>

          {/* Resize Options */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="resize"
                checked={settings.resize}
                onChange={(e) => setSettings(prev => ({ ...prev, resize: e.target.checked }))}
              />
              <label htmlFor="resize" className="text-sm font-medium">
                Resize images (optional)
              </label>
            </div>

            {settings.resize && (
              <div className="grid grid-cols-2 gap-4 pl-6">
                <div>
                  <label className="block text-sm font-medium mb-1">Width (px)</label>
                  <input
                    type="number"
                    value={settings.width || ''}
                    onChange={(e) => setSettings(prev => ({ ...prev, width: parseInt(e.target.value) || undefined }))}
                    className="w-full p-2 border rounded-md"
                    placeholder="Auto"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Height (px)</label>
                  <input
                    type="number"
                    value={settings.height || ''}
                    onChange={(e) => setSettings(prev => ({ ...prev, height: parseInt(e.target.value) || undefined }))}
                    className="w-full p-2 border rounded-md"
                    placeholder="Auto"
                  />
                </div>
                <div className="col-span-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="aspectRatio"
                      checked={settings.maintainAspectRatio}
                      onChange={(e) => setSettings(prev => ({ ...prev, maintainAspectRatio: e.target.checked }))}
                    />
                    <label htmlFor="aspectRatio" className="text-sm">
                      Maintain aspect ratio
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* File Upload */}
      <FileUpload
        tool={tool}
        onFilesAdded={handleFilesAdded}
        maxFiles={state.userTier === 'pro' ? 20 : 5}
        maxSizeBytes={state.userTier === 'pro' ? 100 * 1024 * 1024 : 10 * 1024 * 1024}
      />



      {/* Conversion Progress */}
      {state.files.length > 0 && !state.batchMode && (
        <ConversionProgress
          onDownload={handleDownload}
          onRetry={handleRetry}
        />
      )}

      {/* Results Grid */}
      {convertedImages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ImageIcon className="h-5 w-5" />
              <span>Converted Images ({convertedImages.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {convertedImages.map((image, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="relative group">
                    <img
                      src={image.url}
                      alt={image.name}
                      className="w-full h-32 object-cover rounded border"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center">
                      <Button
                        size="sm"
                        onClick={() => handleDownload('single', image.url)}
                        className="bg-white text-black hover:bg-gray-100"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm font-medium truncate">{image.name}</p>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{formatFileSize(image.originalSize)}</span>
                      <span>→</span>
                      <span>{formatFileSize(image.newSize)}</span>
                    </div>
                    {image.compressionRatio > 0 && (
                      <p className="text-xs text-green-600">
                        {image.compressionRatio.toFixed(1)}% smaller
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {convertedImages.length > 1 && (
              <div className="mt-4 text-center">
                <Button onClick={() => handleDownload('batch', 'batch_download')}>
                  <Download className="h-4 w-4 mr-2" />
                  Download All as ZIP
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Hidden canvas for processing */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Pro Upgrade Modal */}
      <ProUpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        trigger="multiple_image_files"
        toolId={tool.id}
      />
    </div>
  )
}