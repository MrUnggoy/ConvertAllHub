import { useState, useCallback } from 'react'
import { FileText, Download, Upload, Scissors, Info, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useConversion } from '@/contexts/ConversionContext'

interface PageRange {
  id: string
  start: number
  end: number
  name: string
}

interface DocumentInfo {
  format: string
  page_count?: number
  file_size: number
}

export default function DocumentSplitterTool() {
  const [file, setFile] = useState<File | null>(null)
  const [splitMethod, setSplitMethod] = useState<'pages' | 'sections'>('pages')
  const [pageRanges, setPageRanges] = useState<PageRange[]>([
    { id: '1', start: 1, end: 1, name: 'Part 1' }
  ])
  const [documentInfo, setDocumentInfo] = useState<DocumentInfo | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<any>(null)
  
  const { clearFiles } = useConversion()

  const handleFileSelect = useCallback(async (selectedFiles: File[]) => {
    if (selectedFiles.length > 0) {
      const selectedFile = selectedFiles[0]
      setFile(selectedFile)
      clearFiles()
      
      // Analyze document
      await analyzeDocument(selectedFile)
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
          
          // Auto-adjust page ranges based on document
          if (data.metadata.document_info.page_count) {
            const totalPages = data.metadata.document_info.page_count
            setPageRanges([
              { id: '1', start: 1, end: Math.ceil(totalPages / 2), name: 'First Half' },
              { id: '2', start: Math.ceil(totalPages / 2) + 1, end: totalPages, name: 'Second Half' }
            ])
          }
        }
      }
    } catch (error) {
      console.error('Failed to analyze document:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleSplit = async () => {
    if (!file) return

    setIsProcessing(true)
    setError(null)
    
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('split_method', splitMethod)
      
      if (splitMethod === 'pages') {
        const splitParams = {
          page_ranges: pageRanges.map(range => [range.start, range.end])
        }
        formData.append('split_params', JSON.stringify(splitParams))
      } else {
        // For sections splitting
        const splitParams = { method: 'sections' }
        formData.append('split_params', JSON.stringify(splitParams))
      }

      const response = await fetch('/api/documents/split', {
        method: 'POST',
        body: formData
      })
      
      const data = await response.json()
      
      if (data.status === 'success') {
        setResult(data)
      } else {
        setError(data.error_message || 'Split failed')
      }
    } catch (error) {
      setError('Network error occurred')
    } finally {
      setIsProcessing(false)
    }
  }

  const addPageRange = () => {
    const lastRange = pageRanges[pageRanges.length - 1]
    const newStart = lastRange ? lastRange.end + 1 : 1
    const newRange: PageRange = {
      id: Math.random().toString(36).substr(2, 9),
      start: newStart,
      end: newStart,
      name: `Part ${pageRanges.length + 1}`
    }
    setPageRanges([...pageRanges, newRange])
  }

  const removePageRange = (id: string) => {
    if (pageRanges.length > 1) {
      setPageRanges(pageRanges.filter(range => range.id !== id))
    }
  }

  const updatePageRange = (id: string, field: keyof PageRange, value: string | number) => {
    setPageRanges(pageRanges.map(range => 
      range.id === id ? { ...range, [field]: value } : range
    ))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const validatePageRanges = () => {
    if (!documentInfo?.page_count) return true
    
    return pageRanges.every(range => 
      range.start >= 1 && 
      range.end <= documentInfo.page_count! && 
      range.start <= range.end
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Scissors className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold">Document Splitter</h1>
        </div>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Split PDF and DOCX documents into multiple files by page ranges or sections. Perfect for extracting specific chapters or parts.
        </p>
        <div className="flex justify-center gap-2 mt-4">
          <Badge variant="secondary">📄 PDF + DOCX</Badge>
          <Badge variant="secondary">✂️ Custom Ranges</Badge>
          <Badge variant="secondary">🎯 Precise Control</Badge>
        </div>
      </div>

      {/* File Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Document
          </CardTitle>
          <CardDescription>
            Upload a PDF or DOCX document to split (max 50MB)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <input
              type="file"
              accept=".pdf,.docx"
              onChange={(e) => {
                const selectedFiles = Array.from(e.target.files || [])
                if (selectedFiles.length > 0) {
                  handleFileSelect(selectedFiles)
                }
              }}
              className="hidden"
              id="file-upload-split"
            />
            <label htmlFor="file-upload-split" className="cursor-pointer">
              <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium">Click to upload or drag and drop</p>
              <p className="text-sm text-gray-500">PDF or DOCX files (max 50MB)</p>
            </label>
          </div>
          
          {file && (
            <div className="mt-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
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
                  onClick={() => {
                    setFile(null)
                    setDocumentInfo(null)
                    clearFiles()
                  }}
                >
                  Remove
                </Button>
              </div>
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
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Format</p>
                <p className="text-lg font-semibold">{documentInfo.format}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">File Size</p>
                <p className="text-lg font-semibold">{formatFileSize(documentInfo.file_size)}</p>
              </div>
              {documentInfo.page_count && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Pages</p>
                  <p className="text-lg font-semibold">{documentInfo.page_count}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Split Method Selection */}
      {file && (
        <Tabs value={splitMethod} onValueChange={(value: string) => setSplitMethod(value as 'pages' | 'sections')} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="pages">Split by Pages</TabsTrigger>
            <TabsTrigger value="sections" disabled={!file?.name.endsWith('.docx')}>
              Split by Sections
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pages" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Page Range Configuration</CardTitle>
                <CardDescription>
                  Define the page ranges for splitting. Each range will create a separate document.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {pageRanges.map((range) => (
                  <div key={range.id} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor={`name-${range.id}`}>Part Name</Label>
                        <Input
                          id={`name-${range.id}`}
                          value={range.name}
                          onChange={(e) => updatePageRange(range.id, 'name', e.target.value)}
                          placeholder="Part name"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`start-${range.id}`}>Start Page</Label>
                        <Input
                          id={`start-${range.id}`}
                          type="number"
                          min="1"
                          max={documentInfo?.page_count || 999}
                          value={range.start}
                          onChange={(e) => updatePageRange(range.id, 'start', parseInt(e.target.value) || 1)}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`end-${range.id}`}>End Page</Label>
                        <Input
                          id={`end-${range.id}`}
                          type="number"
                          min="1"
                          max={documentInfo?.page_count || 999}
                          value={range.end}
                          onChange={(e) => updatePageRange(range.id, 'end', parseInt(e.target.value) || 1)}
                        />
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removePageRange(range.id)}
                      disabled={pageRanges.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                
                <Button
                  variant="outline"
                  onClick={addPageRange}
                  className="w-full"
                  disabled={pageRanges.length >= 10}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Page Range
                </Button>
                
                {!validatePageRanges() && (
                  <Alert variant="destructive">
                    <AlertDescription>
                      Please ensure all page ranges are valid and within the document's page count.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sections" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Section-based Splitting</CardTitle>
                <CardDescription>
                  Split DOCX documents by headings and sections automatically.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    This method will automatically detect headings in your DOCX document and create separate files for each section.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Conversion Progress */}
      {isProcessing && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full" />
              <span>Splitting document...</span>
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
              Split Complete
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="font-medium">Your document has been split successfully!</p>
                <p className="text-sm text-gray-600">
                  Processing time: {result.processing_time?.toFixed(2)}s
                </p>
                {result.metadata?.files_created && (
                  <p className="text-sm text-gray-600">
                    Created {result.metadata.files_created} files
                  </p>
                )}
              </div>
              
              {result.metadata?.output_urls && (
                <div className="space-y-2">
                  <h4 className="font-medium">Download Split Files:</h4>
                  {result.metadata.output_urls.map((url: string, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">
                        {pageRanges[index]?.name || `Part ${index + 1}`}
                      </span>
                      <Button size="sm" onClick={() => window.open(url, '_blank')}>
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Split Button */}
      <div className="flex justify-center">
        <Button
          onClick={handleSplit}
          disabled={!file || isProcessing || !validatePageRanges()}
          size="lg"
          className="px-8"
        >
          {isProcessing ? (
            <>
              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
              Splitting...
            </>
          ) : (
            <>
              <Scissors className="h-4 w-4 mr-2" />
              Split Document
            </>
          )}
        </Button>
      </div>
    </div>
  )
}