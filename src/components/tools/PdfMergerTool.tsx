import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ToolDefinition } from '@/tools/registry'
import { FileText, Upload, Download, X, ArrowUp, ArrowDown, CheckCircle2 } from 'lucide-react'
import { PDFDocument } from 'pdf-lib'

interface PdfMergerToolProps {
  tool: ToolDefinition
}

interface PdfFile {
  id: string
  file: File
  name: string
  size: string
}

export default function PdfMergerTool({ tool }: PdfMergerToolProps) {
  const [pdfFiles, setPdfFiles] = useState<PdfFile[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [mergedPdfUrl, setMergedPdfUrl] = useState<string | null>(null)

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      const newPdfFiles: PdfFile[] = []
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        if (file.type === 'application/pdf') {
          newPdfFiles.push({
            id: Date.now() + i + '',
            file,
            name: file.name,
            size: formatFileSize(file.size)
          })
        }
      }
      
      setPdfFiles(prev => [...prev, ...newPdfFiles])
    }
    event.target.value = '' // Reset input
  }

  const removeFile = (id: string) => {
    setPdfFiles(prev => prev.filter(f => f.id !== id))
  }

  const moveFile = (id: string, direction: 'up' | 'down') => {
    setPdfFiles(prev => {
      const index = prev.findIndex(f => f.id === id)
      if (index === -1) return prev
      
      const newIndex = direction === 'up' ? index - 1 : index + 1
      if (newIndex < 0 || newIndex >= prev.length) return prev
      
      const newFiles = [...prev]
      const [movedFile] = newFiles.splice(index, 1)
      newFiles.splice(newIndex, 0, movedFile)
      return newFiles
    })
  }

  const mergePdfs = async () => {
    if (pdfFiles.length < 2) return
    
    setIsProcessing(true)
    
    try {
      const mergedPdf = await PDFDocument.create()
      
      for (const pdfFile of pdfFiles) {
        const arrayBuffer = await pdfFile.file.arrayBuffer()
        const pdf = await PDFDocument.load(arrayBuffer)
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices())
        copiedPages.forEach((page) => mergedPdf.addPage(page))
      }
      
      const pdfBytes = await mergedPdf.save()
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      
      setMergedPdfUrl(url)
    } catch (error) {
      console.error('Error merging PDFs:', error)
      alert('Error merging PDFs. Please make sure all files are valid PDF documents.')
    } finally {
      setIsProcessing(false)
    }
  }

  const downloadMergedPdf = () => {
    if (mergedPdfUrl) {
      const a = document.createElement('a')
      a.href = mergedPdfUrl
      a.download = 'merged-document.pdf'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    }
  }

  const resetTool = () => {
    setPdfFiles([])
    setMergedPdfUrl(null)
    if (mergedPdfUrl) {
      URL.revokeObjectURL(mergedPdfUrl)
    }
  }

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
          <CardTitle className="text-lg">Select PDF Files</CardTitle>
          <CardDescription>
            Choose multiple PDF files to merge. Files will be merged in the order shown below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-4 text-gray-500" />
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Click to upload</span> PDF files
                  </p>
                  <p className="text-xs text-gray-500">PDF files only</p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  multiple
                  accept=".pdf,application/pdf"
                  onChange={handleFileUpload}
                />
              </label>
            </div>
            
            {pdfFiles.length > 0 && (
              <div className="text-sm text-gray-600">
                {pdfFiles.length} file{pdfFiles.length !== 1 ? 's' : ''} selected
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* File List */}
      {pdfFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Files to Merge</CardTitle>
            <CardDescription>
              Drag to reorder or use the arrow buttons. Files will be merged in this order.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {pdfFiles.map((pdfFile, index) => (
                <div
                  key={pdfFile.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-red-600" />
                    <div>
                      <div className="font-medium text-sm">{pdfFile.name}</div>
                      <div className="text-xs text-gray-500">{pdfFile.size}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => moveFile(pdfFile.id, 'up')}
                      disabled={index === 0}
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => moveFile(pdfFile.id, 'down')}
                      disabled={index === pdfFiles.length - 1}
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeFile(pdfFile.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Merge Controls */}
      {pdfFiles.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={mergePdfs}
                disabled={pdfFiles.length < 2 || isProcessing}
                className="flex-1"
              >
                {isProcessing ? 'Merging PDFs...' : `Merge ${pdfFiles.length} PDFs`}
              </Button>
              
              <Button
                variant="outline"
                onClick={resetTool}
                disabled={isProcessing}
              >
                Clear All
              </Button>
            </div>
            
            {pdfFiles.length < 2 && (
              <p className="text-sm text-gray-500 mt-2">
                Select at least 2 PDF files to merge
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Download Result */}
      {mergedPdfUrl && (
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle className="text-lg text-green-600 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 animate-bounce" />
              Merge Complete!
            </CardTitle>
            <CardDescription>
              Your PDFs have been successfully merged into a single document.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={downloadMergedPdf} className="w-full sm:w-auto">
              <Download className="h-4 w-4 mr-2" />
              Download Merged PDF
            </Button>
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
            <p>All PDF processing happens in your browser. Your files never leave your device.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}