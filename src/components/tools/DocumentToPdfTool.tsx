import { useState, useCallback, useRef } from 'react'
import { Download, FileText, Upload, AlertCircle, CheckCircle2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ToolDefinition } from '@/tools/registry'
import { jsPDF } from 'jspdf'
import mammoth from 'mammoth'

interface DocumentToPdfToolProps {
  tool: ToolDefinition
}

interface ProcessedFile {
  id: string
  name: string
  originalFile: File
  content: string | HTMLImageElement
  type: 'text' | 'image' | 'html' | 'docx'
  pdfUrl?: string
  status: 'pending' | 'processing' | 'completed' | 'error'
  error?: string
  warnings?: string[]
}

export default function DocumentToPdfTool({ tool }: DocumentToPdfToolProps) {
  const [files, setFiles] = useState<ProcessedFile[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [previewFile, setPreviewFile] = useState<ProcessedFile | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = event.target.files
    if (!uploadedFiles) return

    const newFiles: ProcessedFile[] = []

    for (let i = 0; i < uploadedFiles.length; i++) {
      const file = uploadedFiles[i]
      const fileId = `${Date.now()}-${i}`
      
      try {
        // Validate file type
        const isImage = file.type.startsWith('image/')
        const isDocx = file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
                       file.name.endsWith('.docx') || file.name.endsWith('.doc')
        const isHtml = file.type === 'text/html' || file.name.endsWith('.html') || file.name.endsWith('.htm')
        const isText = file.type.startsWith('text/') || file.name.endsWith('.txt')
        
        if (!isImage && !isDocx && !isHtml && !isText) {
          newFiles.push({
            id: fileId,
            name: file.name,
            originalFile: file,
            content: '',
            type: 'text',
            status: 'error',
            error: 'Invalid file format. Supported formats: TXT, HTML, DOCX, DOC, JPG, PNG, WEBP, GIF'
          })
          continue
        }

        let content: string | HTMLImageElement = ''
        let type: 'text' | 'image' | 'html' | 'docx' = 'text'

        if (isImage) {
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
        } else if (isDocx) {
          // Handle DOCX files
          type = 'docx'
          const arrayBuffer = await file.arrayBuffer()
          
          try {
            const result = await mammoth.convertToHtml({ arrayBuffer })
            content = result.value
            
            // Check if conversion produced empty content
            if (!content || content.trim().length === 0) {
              newFiles.push({
                id: fileId,
                name: file.name,
                originalFile: file,
                content: '',
                type: 'docx',
                status: 'error',
                error: 'Invalid Word document. The file may be corrupted or empty.'
              })
              continue
            }
            
            // Store warnings if any
            const warnings = result.messages
              .filter(m => m.type === 'warning')
              .map(m => m.message)
            
            newFiles.push({
              id: fileId,
              name: file.name,
              originalFile: file,
              content,
              type,
              status: 'pending',
              warnings: warnings.length > 0 ? warnings : undefined
            })
            continue
          } catch (docxError) {
            newFiles.push({
              id: fileId,
              name: file.name,
              originalFile: file,
              content: '',
              type: 'docx',
              status: 'error',
              error: 'Failed to parse Word document. The file may be corrupted or in an unsupported format.'
            })
            continue
          }
        } else if (isHtml) {
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
          error: error instanceof Error ? error.message : 'Failed to read file content'
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
      } else if (file.type === 'docx' || file.type === 'html') {
        // Handle DOCX (converted to HTML) and HTML conversion
        let htmlContent = file.content as string
        
        // Create a temporary div to parse HTML
        const tempDiv = document.createElement('div')
        tempDiv.innerHTML = htmlContent
        
        let y = margin + 12
        
        // Process HTML elements
        const processElement = (element: Element, indent: number = 0) => {
          const tagName = element.tagName.toLowerCase()
          const text = element.textContent?.trim() || ''
          
          if (!text) return
          
          // Handle headings
          if (tagName.match(/^h[1-6]$/)) {
            const level = parseInt(tagName[1])
            const fontSize = 20 - (level * 2)
            pdf.setFontSize(fontSize)
            pdf.setFont('helvetica', 'bold')
            
            const lines = pdf.splitTextToSize(text, contentWidth - indent)
            for (const line of lines) {
              if (y + fontSize > pageHeight - margin) {
                pdf.addPage()
                y = margin + 12
              }
              pdf.text(line, margin + indent, y)
              y += fontSize * 0.5
            }
            
            pdf.setFont('helvetica', 'normal')
            pdf.setFontSize(12)
            y += 6
          }
          // Handle paragraphs
          else if (tagName === 'p') {
            const isBold = element.querySelector('strong, b') !== null
            const isItalic = element.querySelector('em, i') !== null
            
            if (isBold && isItalic) pdf.setFont('helvetica', 'bolditalic')
            else if (isBold) pdf.setFont('helvetica', 'bold')
            else if (isItalic) pdf.setFont('helvetica', 'italic')
            
            const lines = pdf.splitTextToSize(text, contentWidth - indent)
            for (const line of lines) {
              if (y + 12 > pageHeight - margin) {
                pdf.addPage()
                y = margin + 12
              }
              pdf.text(line, margin + indent, y)
              y += 6
            }
            
            pdf.setFont('helvetica', 'normal')
            y += 6
          }
          // Handle list items
          else if (tagName === 'li') {
            const bullet = '• '
            const lines = pdf.splitTextToSize(bullet + text, contentWidth - indent - 5)
            for (const line of lines) {
              if (y + 12 > pageHeight - margin) {
                pdf.addPage()
                y = margin + 12
              }
              pdf.text(line, margin + indent + 5, y)
              y += 6
            }
          }
          // Handle images in DOCX
          else if (tagName === 'img') {
            const imgSrc = element.getAttribute('src')
            if (imgSrc && imgSrc.startsWith('data:image')) {
              try {
                const imgHeight = 50 // Fixed height for embedded images
                if (y + imgHeight > pageHeight - margin) {
                  pdf.addPage()
                  y = margin + 12
                }
                pdf.addImage(imgSrc, 'JPEG', margin + indent, y, contentWidth - indent, imgHeight)
                y += imgHeight + 6
              } catch (error) {
                console.error('Failed to add image:', error)
              }
            }
          }
        }
        
        // Process all child elements
        const processChildren = (parent: Element, indent: number = 0) => {
          for (const child of Array.from(parent.children)) {
            if (child.tagName.toLowerCase() === 'ul' || child.tagName.toLowerCase() === 'ol') {
              processChildren(child, indent + 5)
            } else {
              processElement(child, indent)
            }
          }
        }
        
        processChildren(tempDiv)
      } else {
        // Handle plain text conversion
        let textContent = file.content as string
        
        const lines = pdf.splitTextToSize(textContent, contentWidth)
        let y = margin + 12

        for (let i = 0; i < lines.length; i++) {
          if (y + 12 > pageHeight - margin) {
            pdf.addPage()
            y = margin + 12
          }
          
          pdf.text(lines[i], margin, y)
          y += 6
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
          error: error instanceof Error ? error.message : 'Failed to convert to PDF'
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

  const previewPdf = useCallback((file: ProcessedFile) => {
    if (!file.pdfUrl) return
    setPreviewFile(file)
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
            Choose text files, images, HTML files, or Word documents (.docx) to convert to PDF
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
                  <p className="text-xs text-gray-500">TXT, HTML, DOCX, DOC, JPG, PNG, WEBP, GIF</p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  multiple
                  accept=".txt,.html,.htm,.docx,.doc,.jpg,.jpeg,.png,.webp,.gif,text/plain,text/html,image/*,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword"
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
                      {file.warnings && file.warnings.length > 0 && (
                        <details className="text-xs text-amber-600 mt-1">
                          <summary className="flex items-center gap-1 cursor-pointer">
                            <AlertCircle className="h-3 w-3 flex-shrink-0" />
                            <span>Unsupported features detected ({file.warnings.length})</span>
                          </summary>
                          <ul className="mt-1 ml-4 list-disc space-y-1">
                            {file.warnings.slice(0, 5).map((warning, idx) => (
                              <li key={idx}>{warning}</li>
                            ))}
                            {file.warnings.length > 5 && (
                              <li>...and {file.warnings.length - 5} more</li>
                            )}
                          </ul>
                        </details>
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
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        <span className="text-sm text-blue-600">Converting...</span>
                      </div>
                    )}
                    
                    {file.status === 'completed' && file.pdfUrl && (
                      <>
                        <CheckCircle2 className="h-5 w-5 text-green-600 animate-bounce mr-2" />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => previewPdf(file)}
                          className="mr-2"
                        >
                          Preview
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => downloadPdf(file)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download PDF
                        </Button>
                      </>
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

      {/* Preview Modal */}
      {previewFile && previewFile.pdfUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-4xl max-h-[90vh] flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">PDF Preview: {previewFile.name}</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPreviewFile(null)}
              >
                Close
              </Button>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto">
              <iframe
                src={previewFile.pdfUrl}
                className="w-full h-[600px] border rounded"
                title="PDF Preview"
              />
              <div className="mt-4 flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setPreviewFile(null)}
                >
                  Close
                </Button>
                <Button
                  onClick={() => {
                    downloadPdf(previewFile)
                    setPreviewFile(null)
                  }}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Download className="h-4 w-4 mr-1" />
                  Download PDF
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
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