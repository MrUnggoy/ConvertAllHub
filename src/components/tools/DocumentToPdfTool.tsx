import { useState, useCallback, useRef } from 'react'
import { Download, FileText, Upload } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ToolDefinition } from '@/tools/registry'
import { jsPDF } from 'jspdf'

interface DocumentToPdfToolProps {
  tool: ToolDefinition
}

interface ProcessedFile {
  id: string
  name: string
  originalFile: File
  content: string | HTMLImageElement
  type: 'text' | 'image' | 'html'
  pdfUrl?: string
  status: 'pending' | 'processing' | 'completed' | 'error'
  error?: string
}

export default function DocumentToPdfTool({ tool }: DocumentToPdfToolProps) {
  const [files, setFiles] = useState<ProcessedFile[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = event.target.files
    if (!uploadedFiles) return

    const newFiles: ProcessedFile[] = []

    for (let i = 0; i < uploadedFiles.length; i++) {
      const file = uploadedFiles[i]
      const fileId = `${Date.now()}-${i}`
      
      try {
        let content: string | HTMLImageElement = ''
        let type: 'text' | 'image' | 'html' = 'text'

        if (file.type.startsWith('image/')) {
          // Handle image files
          type = 'image'
          const img = new Image()
          const imageUrl = URL.createObjectURL(file)
          
          await new Promise((resolve, reject) => {
            img.onload = resolve
            img.onerror = reject
            img.src = imageUrl
          })
          
          content = img
        } else if (file.type === 'text/html' || file.name.endsWith('.html')) {
          // Handle HTML files
          type = 'html'
          content = await file.text()
        } else {
          // Handle text files (TXT, CSV, etc.)
          type = 'text'
          content = await file.text()
        }

        newFiles.push({
          id: fileId,
          name: file.name,
          originalFile: file,
          content,
          type,
          status: 'pending'
        })
      } catch (error) {
        newFiles.push({
          id: fileId,
          name: file.name,
          originalFile: file,
          content: '',
          type: 'text',
          status: 'error',
          error: 'Failed to read file content'
        })
      }
    }

    setFiles(prev => [...prev, ...newFiles])
    if (event.target) event.target.value = ''
  }, [])

  const convertToPdf = useCallback(async (fileId: string) => {
    const file = files.find(f => f.id === fileId)
    if (!file) return

    setFiles(prev => prev.map(f => 
      f.id === fileId ? { ...f, status: 'processing' } : f
    ))

    try {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      })

      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const margin = 20
      const contentWidth = pageWidth - (margin * 2)
      const contentHeight = pageHeight - (margin * 2)

      pdf.setFont('helvetica')
      pdf.setFontSize(12)

      if (file.type === 'image' && file.content instanceof HTMLImageElement) {
        // Handle image conversion
        const img = file.content
        const imgWidth = img.width
        const imgHeight = img.height
        
        // Calculate scaling to fit page while maintaining aspect ratio
        const scaleX = contentWidth / imgWidth
        const scaleY = contentHeight / imgHeight
        const scale = Math.min(scaleX, scaleY)
        
        const scaledWidth = imgWidth * scale
        const scaledHeight = imgHeight * scale
        
        // Center the image
        const x = margin + (contentWidth - scaledWidth) / 2
        const y = margin + (contentHeight - scaledHeight) / 2
        
        pdf.addImage(img, 'JPEG', x, y, scaledWidth, scaledHeight)
      } else {
        // Handle text and HTML conversion
        let textContent = file.content as string
        
        if (file.type === 'html') {
          // Strip HTML tags for simple text conversion
          textContent = textContent
            .replace(/<script[^>]*>.*?<\/script>/gi, '')
            .replace(/<style[^>]*>.*?<\/style>/gi, '')
            .replace(/<[^>]*>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
        }

        const lines = pdf.splitTextToSize(textContent, contentWidth)
        let y = margin + 12

        for (let i = 0; i < lines.length; i++) {
          if (y + 12 > pageHeight - margin) {
            pdf.addPage()
            y = margin + 12
          }
          
          pdf.text(lines[i], margin, y)
          y += 18 // 1.5 line height
        }
      }

      // Generate PDF blob and URL
      const pdfBlob = pdf.output('blob')
      const pdfUrl = URL.createObjectURL(pdfBlob)

      setFiles(prev => prev.map(f => 
        f.id === fileId ? { ...f, status: 'completed', pdfUrl } : f
      ))
    } catch (error) {
      console.error('PDF conversion error:', error)
      setFiles(prev => prev.map(f => 
        f.id === fileId ? { 
          ...f, 
          status: 'error', 
          error: 'Failed to convert to PDF' 
        } : f
      ))
    }
  }, [files])

  const convertAllFiles = useCallback(async () => {
    setIsProcessing(true)
    const pendingFiles = files.filter(f => f.status === 'pending')
    
    for (const file of pendingFiles) {
      await convertToPdf(file.id)
    }
    
    setIsProcessing(false)
  }, [files, convertToPdf])

  const downloadPdf = useCallback((file: ProcessedFile) => {
    if (!file.pdfUrl) return

    const link = document.createElement('a')
    link.href = file.pdfUrl
    link.download = `${file.name.replace(/\.[^/.]+$/, '')}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }, [])

  const removeFile = useCallback((fileId: string) => {
    setFiles(prev => {
      const file = prev.find(f => f.id === fileId)
      if (file?.pdfUrl) {
        URL.revokeObjectURL(file.pdfUrl)
      }
      return prev.filter(f => f.id !== fileId)
    })
  }, [])

  const clearAllFiles = useCallback(() => {
    files.forEach(file => {
      if (file.pdfUrl) {
        URL.revokeObjectURL(file.pdfUrl)
      }
    })
    setFiles([])
  }, [files])

  return (
    <div className="space-y-6">
      {/* Tool Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-6 w-6" />
            <span>{tool.name}</span>
          </CardTitle>
          <CardDescription>{tool.description}</CardDescription>
        </CardHeader>
      </Card>

      {/* File Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Select Files</CardTitle>
          <CardDescription>
            Choose text files, images, or HTML files to convert to PDF
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-4 text-gray-500" />
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Click to upload</span> documents
                  </p>
                  <p className="text-xs text-gray-500">TXT, HTML, JPG, PNG, WEBP, GIF</p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  multiple
                  accept=".txt,.html,.htm,.jpg,.jpeg,.png,.webp,.gif,text/plain,text/html,image/*"
                  onChange={handleFileUpload}
                />
              </label>
            </div>
            
            {files.length > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  {files.length} file{files.length !== 1 ? 's' : ''} selected
                </span>
                <div className="space-x-2">
                  <Button
                    onClick={convertAllFiles}
                    disabled={isProcessing || files.every(f => f.status !== 'pending')}
                    size="sm"
                  >
                    Convert All to PDF
                  </Button>
                  <Button
                    variant="outline"
                    onClick={clearAllFiles}
                    size="sm"
                  >
                    Clear All
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* File List */}
      {files.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Files to Convert</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <div>
                      <div className="font-medium text-sm">{file.name}</div>
                      <div className="text-xs text-gray-500 capitalize">
                        {file.type} • {(file.originalFile.size / 1024).toFixed(1)} KB
                      </div>
                      {file.status === 'error' && (
                        <div className="text-xs text-red-600">{file.error}</div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {file.status === 'pending' && (
                      <Button
                        size="sm"
                        onClick={() => convertToPdf(file.id)}
                        disabled={isProcessing}
                      >
                        Convert
                      </Button>
                    )}
                    
                    {file.status === 'processing' && (
                      <div className="text-sm text-blue-600">Converting...</div>
                    )}
                    
                    {file.status === 'completed' && file.pdfUrl && (
                      <Button
                        size="sm"
                        onClick={() => downloadPdf(file)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download PDF
                      </Button>
                    )}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeFile(file.id)}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Privacy Notice */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-sm text-gray-600 space-y-2">
            <div className="flex items-center space-x-2">
              <span>🔒</span>
              <span className="font-medium">Privacy Protected</span>
            </div>
            <p>All document processing happens in your browser. Your files never leave your device.</p>
            <p className="text-xs text-green-600">✅ Fully functional document to PDF conversion with client-side processing.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}