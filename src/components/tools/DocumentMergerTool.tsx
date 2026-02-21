import { useState, useCallback } from 'react'
import { FileText, Download, Upload, Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { useConversion } from '@/contexts/ConversionContext'

interface DocumentFile {
  file: File
  id: string
  format: 'pdf' | 'docx'
}

export default function DocumentMergerTool() {
  const [documents, setDocuments] = useState<DocumentFile[]>([])
  const [outputFormat, setOutputFormat] = useState<'pdf' | 'docx'>('pdf')
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<any>(null)
  
  const { clearFiles } = useConversion()

  const handleFileSelect = useCallback((selectedFiles: File[]) => {
    const newDocuments: DocumentFile[] = selectedFiles.map(file => {
      let format: 'pdf' | 'docx' = 'pdf'
      
      if (file.type.includes('pdf')) {
        format = 'pdf'
      } else if (file.type.includes('wordprocessingml')) {
        format = 'docx'
      }
      
      return {
        file,
        id: Math.random().toString(36).substr(2, 9),
        format
      }
    })
    
    setDocuments(prev => [...prev, ...newDocuments])
    clearFiles()
  }, [clearFiles])

  const handleMerge = async () => {
    if (documents.length < 2) return

    setIsProcessing(true)
    setError(null)
    
    try {
      const formData = new FormData()
      documents.forEach(doc => {
        formData.append('files', doc.file)
      })
      formData.append('output_format', outputFormat)

      const response = await fetch('/api/documents/merge', {
        method: 'POST',
        body: formData
      })
      
      const data = await response.json()
      
      if (data.status === 'success') {
        setResult(data)
      } else {
        setError(data.error_message || 'Merge failed')
      }
    } catch (error) {
      setError('Network error occurred')
    } finally {
      setIsProcessing(false)
    }
  }

  const removeDocument = (id: string) => {
    setDocuments(documents.filter(doc => doc.id !== id))
    clearFiles()
  }

  const moveDocument = (id: string, direction: 'up' | 'down') => {
    const currentIndex = documents.findIndex(doc => doc.id === id)
    if (currentIndex === -1) return

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    if (newIndex < 0 || newIndex >= documents.length) return

    const newDocuments = [...documents]
    const [movedDoc] = newDocuments.splice(currentIndex, 1)
    newDocuments.splice(newIndex, 0, movedDoc)
    setDocuments(newDocuments)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getTotalSize = () => {
    return documents.reduce((total, doc) => total + doc.file.size, 0)
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 mb-4">
          <FileText className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold">Document Merger</h1>
        </div>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Merge multiple PDF and DOCX documents into a single file. Arrange documents in your preferred order before merging.
        </p>
        <div className="flex justify-center gap-2 mt-4">
          <Badge variant="secondary">📄 PDF + DOCX</Badge>
          <Badge variant="secondary">🔄 Custom Order</Badge>
          <Badge variant="secondary">⚡ Fast Merge</Badge>
        </div>
      </div>

      {/* Output Format Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Output Settings</CardTitle>
          <CardDescription>
            Choose the format for your merged document
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="output-format">Output Format</Label>
              <Select value={outputFormat} onValueChange={(value: 'pdf' | 'docx') => setOutputFormat(value)}>
                <SelectTrigger id="output-format">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF - Universal format, preserves layout</SelectItem>
                  <SelectItem value="docx">DOCX - Editable Word document</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {outputFormat === 'pdf' && (
              <Alert>
                <AlertDescription>
                  All documents will be converted to PDF format and merged. This preserves the original layout and formatting.
                </AlertDescription>
              </Alert>
            )}
            
            {outputFormat === 'docx' && (
              <Alert>
                <AlertDescription>
                  Documents will be merged into a single DOCX file. PDF documents will be converted to text format.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* File Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Add Documents
          </CardTitle>
          <CardDescription>
            Upload PDF and DOCX files to merge (2-10 files, max 100MB total)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <input
              type="file"
              accept=".pdf,.docx"
              multiple
              onChange={(e) => {
                const selectedFiles = Array.from(e.target.files || [])
                if (selectedFiles.length > 0) {
                  handleFileSelect(selectedFiles)
                }
              }}
              className="hidden"
              id="file-upload-merge"
            />
            <label htmlFor="file-upload-merge" className="cursor-pointer">
              <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium">Click to upload or drag and drop</p>
              <p className="text-sm text-gray-500">PDF and DOCX files (2-10 files, max 50MB each)</p>
            </label>
          </div>
          
          {documents.length > 0 && (
            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Documents to Merge ({documents.length})</h3>
                <div className="text-sm text-gray-500">
                  Total size: {formatFileSize(getTotalSize())}
                </div>
              </div>
              
              <div className="space-y-2">
                {documents.map((doc, index) => (
                  <div key={doc.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-gray-500 min-w-[2rem]">
                      {index + 1}.
                    </div>
                    
                    <FileText className="h-5 w-5 text-blue-600 flex-shrink-0" />
                    
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{doc.file.name}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>{formatFileSize(doc.file.size)}</span>
                        <Badge variant="outline" className="text-xs">
                          {doc.format.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => moveDocument(doc.id, 'up')}
                        disabled={index === 0}
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => moveDocument(doc.id, 'down')}
                        disabled={index === documents.length - 1}
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeDocument(doc.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              
              {getTotalSize() > 100 * 1024 * 1024 && (
                <Alert variant="destructive">
                  <AlertDescription>
                    Total file size exceeds 100MB limit. Please remove some files or use smaller documents.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Conversion Progress */}
      {isProcessing && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full" />
              <span>Merging documents...</span>
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
              Merge Complete
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div>
                  <p className="font-medium">Your merged document is ready!</p>
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
                  <p>Files merged: {result.metadata.files_merged}</p>
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

      {/* Merge Button */}
      <div className="flex justify-center">
        <Button
          onClick={handleMerge}
          disabled={documents.length < 2 || isProcessing || getTotalSize() > 100 * 1024 * 1024}
          size="lg"
          className="px-8"
        >
          {isProcessing ? (
            <>
              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
              Merging...
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              Merge {documents.length} Documents
            </>
          )}
        </Button>
      </div>
    </div>
  )
}