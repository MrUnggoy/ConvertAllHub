import { useState, useCallback } from 'react'
import { FileText, Download, Upload, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { useConversion } from '@/contexts/ConversionContext'

interface ConversionOptions {
  preserveFormatting: boolean
  extractImages: boolean
}

interface DocumentInfo {
  format: string
  file_size: number
  paragraph_count?: number
  table_count?: number
  word_count?: number
  character_count?: number
  metadata?: {
    title: string
    author: string
    created: string
    modified: string
  }
}

export default function DocxConverterTool() {
  const [files, setFiles] = useState<File[]>([])
  const [conversionType, setConversionType] = useState<'pdf-to-docx' | 'docx-to-pdf'>('pdf-to-docx')
  const [options, setOptions] = useState<ConversionOptions>({
    preserveFormatting: true,
    extractImages: false
  })
  const [documentInfo, setDocumentInfo] = useState<DocumentInfo | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<any>(null)
  
  const { clearFiles } = useConversion()

  const handleFileSelect = useCallback(async (selectedFiles: File[]) => {
    if (selectedFiles.length > 0) {
      const file = selectedFiles[0]
      setFiles([file])
      clearFiles()
      
      // Auto-detect conversion type based on file type
      if (file.type.includes('pdf')) {
        setConversionType('pdf-to-docx')
      } else if (file.type.includes('wordprocessingml')) {
        setConversionType('docx-to-pdf')
      }
      
      // Get document information
      await analyzeDocument(file)
    }
  }, [clearFiles])

  const analyzeDocument = async (file: File) => {
    setIsAnalyzing(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await fetch('/api/documents/info', {
        method: 'POST',
        body: formData
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.status === 'success') {
          setDocumentInfo(data.metadata.document_info)
        }
      }
    } catch (error) {
      console.error('Failed to analyze document:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleConvert = async () => {
    if (files.length === 0) return

    const file = files[0]
    setIsProcessing(true)
    
    try {
      const formData = new FormData()
      formData.append('file', file)

      let endpoint = ''
      if (conversionType === 'pdf-to-docx') {
        formData.append('preserve_formatting', options.preserveFormatting.toString())
        formData.append('extract_images', options.extractImages.toString())
        endpoint = '/api/documents/pdf-to-docx'
      } else {
        endpoint = '/api/documents/docx-to-pdf'
      }
      
      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData
      })
      
      const data = await response.json()
      
      if (data.status === 'success') {
        setResult(data)
      } else {
        setError(data.error_message || 'Conversion failed')
      }
    } catch (error) {
      setError('Network error occurred')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleRemoveFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index))
    setDocumentInfo(null)
    clearFiles()
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 mb-4">
          <FileText className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold">Document Converter</h1>
        </div>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Convert between PDF and DOCX formats with advanced options for formatting preservation and content extraction.
        </p>
        <div className="flex justify-center gap-2 mt-4">
          <Badge variant="secondary">🔒 Privacy-First</Badge>
          <Badge variant="secondary">⚡ Fast Processing</Badge>
          <Badge variant="secondary">🎯 High Quality</Badge>
        </div>
      </div>

      <Tabs value={conversionType} onValueChange={(value: string) => setConversionType(value as 'pdf-to-docx' | 'docx-to-pdf')} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pdf-to-docx">PDF to DOCX</TabsTrigger>
          <TabsTrigger value="docx-to-pdf">DOCX to PDF</TabsTrigger>
        </TabsList>

        <TabsContent value="pdf-to-docx" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>PDF to DOCX Conversion</CardTitle>
              <CardDescription>
                Convert PDF documents to editable DOCX format with text extraction and formatting preservation.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="preserve-formatting"
                    checked={options.preserveFormatting}
                    onCheckedChange={(checked: boolean) => 
                      setOptions(prev => ({ ...prev, preserveFormatting: checked }))
                    }
                  />
                  <Label htmlFor="preserve-formatting">Preserve original formatting</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="extract-images"
                    checked={options.extractImages}
                    onCheckedChange={(checked: boolean) => 
                      setOptions(prev => ({ ...prev, extractImages: checked }))
                    }
                  />
                  <Label htmlFor="extract-images">Extract embedded images</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="docx-to-pdf" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>DOCX to PDF Conversion</CardTitle>
              <CardDescription>
                Convert DOCX documents to PDF format with high-quality rendering and layout preservation.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  DOCX to PDF conversion preserves all formatting, images, and layout elements automatically.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* File Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Document
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <input
              type="file"
              accept={conversionType === 'pdf-to-docx' ? '.pdf' : '.docx'}
              onChange={(e) => {
                const selectedFiles = Array.from(e.target.files || [])
                if (selectedFiles.length > 0) {
                  handleFileSelect(selectedFiles)
                }
              }}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium">Click to upload or drag and drop</p>
              <p className="text-sm text-gray-500">
                {conversionType === 'pdf-to-docx' ? 'PDF files only' : 'DOCX files only'}
              </p>
            </label>
          </div>
          
          {files.length > 0 && (
            <div className="mt-4 space-y-2">
              {files.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">{file.name}</p>
                      <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveFile(index)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Document Information */}
      {documentInfo && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Document Information
              {isAnalyzing && <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full" />}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Format</p>
                <p className="text-lg font-semibold">{documentInfo.format}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">File Size</p>
                <p className="text-lg font-semibold">{formatFileSize(documentInfo.file_size)}</p>
              </div>
              {documentInfo.word_count && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Words</p>
                  <p className="text-lg font-semibold">{documentInfo.word_count.toLocaleString()}</p>
                </div>
              )}
              {documentInfo.paragraph_count && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Paragraphs</p>
                  <p className="text-lg font-semibold">{documentInfo.paragraph_count}</p>
                </div>
              )}
            </div>
            
            {documentInfo.metadata && (
              <div className="mt-4 pt-4 border-t">
                <h4 className="font-medium mb-2">Document Metadata</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  {documentInfo.metadata.title && (
                    <div>
                      <span className="font-medium">Title:</span> {documentInfo.metadata.title}
                    </div>
                  )}
                  {documentInfo.metadata.author && (
                    <div>
                      <span className="font-medium">Author:</span> {documentInfo.metadata.author}
                    </div>
                  )}
                  {documentInfo.metadata.created && (
                    <div>
                      <span className="font-medium">Created:</span> {new Date(documentInfo.metadata.created).toLocaleDateString()}
                    </div>
                  )}
                  {documentInfo.metadata.modified && (
                    <div>
                      <span className="font-medium">Modified:</span> {new Date(documentInfo.metadata.modified).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Conversion Progress */}
      {isProcessing && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full" />
              <span>Converting document...</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Result */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <Download className="h-5 w-5" />
              Conversion Complete
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div>
                  <p className="font-medium">Your document is ready!</p>
                  <p className="text-sm text-gray-600">
                    Processing time: {result.processing_time?.toFixed(2)}s
                  </p>
                </div>
                <Button onClick={() => window.open(result.result_url, '_blank')}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
              
              {result.metadata && (
                <div className="text-sm text-gray-600 space-y-1">
                  <p>Output format: {result.metadata.output_format?.toUpperCase()}</p>
                  {result.metadata.output_size && (
                    <p>Output size: {formatFileSize(result.metadata.output_size)}</p>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Convert Button */}
      <div className="flex justify-center">
        <Button
          onClick={handleConvert}
          disabled={files.length === 0 || isProcessing}
          size="lg"
          className="px-8"
        >
          {isProcessing ? (
            <>
              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
              Converting...
            </>
          ) : (
            <>
              <FileText className="h-4 w-4 mr-2" />
              Convert Document
            </>
          )}
        </Button>
      </div>
    </div>
  )
}