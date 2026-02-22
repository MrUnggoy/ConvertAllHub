import { useState, useCallback, useRef } from 'react'
import { Download, Image as ImageIcon, Zap, Sliders, ArrowRight, X, CheckCircle2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import FileUpload from '@/components/FileUpload'
import { useConversion } from '@/contexts/ConversionContext'
import { useAnalytics } from '@/hooks/useAnalytics'
import { ToolDefinition } from '@/tools/registry'

interface ImageCompressorToolProps {
  tool: ToolDefinition
}

interface CompressedImage {
  original: {
    url: string
    size: number
    width: number
    height: number
  }
  compressed: {
    url: string
    blob: Blob
    size: number
  }
  fileName: string
  reductionPercentage: number
}

export default function ImageCompressorTool({ tool }: ImageCompressorToolProps) {
  const [quality, setQuality] = useState(80)
  const [isProcessing, setIsProcessing] = useState(false)
  const [compressedImage, setCompressedImage] = useState<CompressedImage | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showComparison, setShowComparison] = useState<'side-by-side' | 'slider'>('side-by-side')
  
  const { state } = useConversion()
  const { trackConversionStarted, trackConversionCompleted } = useAnalytics()
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const handleFilesAdded = useCallback(async (files: File[]) => {
    // Only process the first image for compression
    const imageFile = files[0]
    
    if (!imageFile) return

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!validTypes.includes(imageFile.type)) {
      setError('Invalid image file. Supported formats: JPG, PNG, WEBP, GIF.')
      return
    }

    setError(null)
    trackConversionStarted(tool.id, imageFile.type, imageFile.size)
    
    await compressImage(imageFile)
  }, [tool.id, trackConversionStarted, quality])

  const compressImage = async (file: File) => {
    try {
      setIsProcessing(true)
      setError(null)

      // Load the image
      const img = new Image()
      const imageLoadPromise = new Promise<void>((resolve, reject) => {
        img.onload = () => resolve()
        img.onerror = () => reject(new Error('Failed to load image'))
      })
      
      const originalUrl = URL.createObjectURL(file)
      img.src = originalUrl
      await imageLoadPromise

      // Get original dimensions
      const { width, height } = img

      // Create canvas and draw image
      const canvas = canvasRef.current || document.createElement('canvas')
      const ctx = canvas.getContext('2d')!
      canvas.width = width
      canvas.height = height

      ctx.clearRect(0, 0, width, height)
      ctx.drawImage(img, 0, 0, width, height)

      // Compress to blob
      const mimeType = file.type === 'image/png' ? 'image/png' : 'image/jpeg'
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob)
            else reject(new Error('Failed to compress image'))
          },
          mimeType,
          quality / 100
        )
      })

      const compressedUrl = URL.createObjectURL(blob)
      const reductionPercentage = ((file.size - blob.size) / file.size) * 100

      const result: CompressedImage = {
        original: {
          url: originalUrl,
          size: file.size,
          width,
          height
        },
        compressed: {
          url: compressedUrl,
          blob,
          size: blob.size
        },
        fileName: file.name,
        reductionPercentage: Math.max(0, reductionPercentage)
      }

      setCompressedImage(result)
      trackConversionCompleted(tool.id, 1, true)

    } catch (error) {
      console.error('Image compression error:', error)
      setError(`Compression failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      trackConversionCompleted(tool.id, 0, false)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleQualityChange = async (newQuality: number) => {
    setQuality(newQuality)
    
    // Re-compress if we have an image
    if (compressedImage) {
      // Find the original file from the URL
      const response = await fetch(compressedImage.original.url)
      const blob = await response.blob()
      const file = new File([blob], compressedImage.fileName, { type: blob.type })
      await compressImage(file)
    }
  }

  const handleDownload = () => {
    if (!compressedImage) return

    const link = document.createElement('a')
    link.href = compressedImage.compressed.url
    const extension = compressedImage.fileName.split('.').pop()
    link.download = `compressed_${compressedImage.fileName.replace(`.${extension}`, '')}.${extension}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleClear = () => {
    if (compressedImage) {
      URL.revokeObjectURL(compressedImage.original.url)
      URL.revokeObjectURL(compressedImage.compressed.url)
    }
    setCompressedImage(null)
    setError(null)
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
            <span>Image Compressor</span>
            <div className="flex items-center space-x-1 text-green-600 text-sm">
              <Zap className="h-4 w-4" />
              <span>Client-side</span>
            </div>
          </CardTitle>
          <CardDescription>
            Reduce image file size while maintaining visual quality. Processing happens in your browser for complete privacy.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-sm mb-2">Supported Formats:</h4>
              <div className="flex flex-wrap gap-1">
                {['JPG', 'PNG', 'WEBP', 'GIF'].map(format => (
                  <span key={format} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                    {format}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-medium text-sm mb-2">Features:</h4>
              <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                <span>✓ Quality control</span>
                <span>✓ Side-by-side comparison</span>
                <span>✓ Real-time preview</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quality Slider - Show when image is loaded */}
      {compressedImage && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center space-x-2">
              <Sliders className="h-5 w-5" />
              <span>Compression Settings</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium">
                  Quality: {quality}%
                </label>
                <span className="text-sm text-muted-foreground">
                  Estimated size: {formatFileSize(compressedImage.compressed.size)}
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={quality}
                onChange={(e) => handleQualityChange(parseInt(e.target.value))}
                className="w-full"
                disabled={isProcessing}
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Smaller file (lower quality)</span>
                <span>Larger file (higher quality)</span>
              </div>
            </div>

            {/* Size Comparison */}
            <div className="grid grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1">Original</p>
                <p className="text-lg font-semibold">{formatFileSize(compressedImage.original.size)}</p>
              </div>
              <div className="flex items-center justify-center">
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1">Compressed</p>
                <p className="text-lg font-semibold text-green-600">
                  {formatFileSize(compressedImage.compressed.size)}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  {compressedImage.reductionPercentage.toFixed(1)}% smaller
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* File Upload */}
      {!compressedImage && (
        <FileUpload
          tool={tool}
          onFilesAdded={handleFilesAdded}
          maxFiles={1}
          maxSizeBytes={state.userTier === 'pro' ? 50 * 1024 * 1024 : 10 * 1024 * 1024}
        />
      )}

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
              <X className="h-5 w-5 text-red-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-red-800">{error}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setError(null)}
                className="text-red-600 hover:text-red-700"
              >
                Dismiss
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {isProcessing && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              <p className="text-sm text-muted-foreground">Compressing image...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Image Comparison */}
      {compressedImage && !isProcessing && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <ImageIcon className="h-5 w-5" />
                <span>Comparison</span>
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Button
                  variant={showComparison === 'side-by-side' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setShowComparison('side-by-side')}
                >
                  Side by Side
                </Button>
                <Button
                  variant={showComparison === 'slider' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setShowComparison('slider')}
                >
                  Toggle
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {showComparison === 'side-by-side' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium">Original</h4>
                    <span className="text-xs text-muted-foreground">
                      {formatFileSize(compressedImage.original.size)}
                    </span>
                  </div>
                  <div className="border rounded-lg overflow-hidden bg-gray-50">
                    <img
                      src={compressedImage.original.url}
                      alt="Original"
                      className="w-full h-auto"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    {compressedImage.original.width} × {compressedImage.original.height}
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium">Compressed</h4>
                    <span className="text-xs text-green-600 font-medium">
                      {formatFileSize(compressedImage.compressed.size)}
                    </span>
                  </div>
                  <div className="border rounded-lg overflow-hidden bg-gray-50">
                    <img
                      src={compressedImage.compressed.url}
                      alt="Compressed"
                      className="w-full h-auto"
                    />
                  </div>
                  <p className="text-xs text-green-600 text-center font-medium">
                    {compressedImage.reductionPercentage.toFixed(1)}% smaller
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="border rounded-lg overflow-hidden bg-gray-50">
                  <img
                    src={compressedImage.compressed.url}
                    alt="Compressed"
                    className="w-full h-auto"
                  />
                </div>
                <div className="flex items-center justify-center space-x-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const img = document.querySelector('img[alt="Compressed"]') as HTMLImageElement
                      if (img) img.src = compressedImage.original.url
                    }}
                  >
                    Show Original
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const img = document.querySelector('img[alt="Compressed"]') as HTMLImageElement
                      if (img) img.src = compressedImage.compressed.url
                    }}
                  >
                    Show Compressed
                  </Button>
                </div>
              </div>
            )}

            {/* Success Indicator */}
            <div className="flex items-center justify-center space-x-2 text-green-600 animate-fade-in">
              <CheckCircle2 className="h-5 w-5 animate-bounce" />
              <span className="text-sm font-medium">Compression complete!</span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-center space-x-3 mt-4">
              <Button onClick={handleDownload} size="lg">
                <Download className="h-4 w-4 mr-2" />
                Download Compressed Image
              </Button>
              <Button onClick={handleClear} variant="outline" size="lg">
                <X className="h-4 w-4 mr-2" />
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Hidden canvas for processing */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  )
}
