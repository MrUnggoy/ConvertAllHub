import { useState, useCallback, useRef } from 'react'
import { FileText, Download, Upload, Scissors, Loader2, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import * as pdfjsLib from 'pdfjs-dist'
import { PDFDocument } from 'pdf-lib'
import JSZip from 'jszip'
import { validateFile } from '@/utils/error-handling'
import { useErrorHandler } from '@/hooks/useErrorHandler'
import ErrorNotification from '@/components/ErrorNotification'

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/5.4.296/pdf.worker.min.js`

interface PagePreview {
  pageNumber: number
  thumbnail: string
  selected: boolean
}

export default function PdfSplitterTool() {
  const [file, setFile] = useState<File | null>(null)
  const [pages, setPages] = useState<PagePreview[]>([])
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set())
  const [pageRanges, setPageRanges] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const { error, handleError, clearError } = useErrorHandler()
  const [success, setSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = useCallback(async (selectedFile: File) => {
    clearError()
    setSuccess(false)
    setPages([])
    setSelectedPages(new Set())
    setPageRanges('')

    // Validate file type and size
    const validation = validateFile(selectedFile, ['pdf'], 50 * 1024 * 1024) // 50MB max
    if (!validation.valid) {
      handleError(new Error(validation.message), 'PDF validation', selectedFile.name, selectedFile.size)
      return
    }

    setFile(selectedFile)
    setIsLoading(true)

    try {
      // Load PDF with pdfjs-dist
      const arrayBuffer = await selectedFile.arrayBuffer()
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer })
      const pdf = await loadingTask.promise

      const totalPages = pdf.numPages
      const previews: PagePreview[] = []

      // Generate thumbnails for all pages
      for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
        const page = await pdf.getPage(pageNum)
        const viewport = page.getViewport({ scale: 0.5 })
        
        const canvas = document.createElement('canvas')
        const context = canvas.getContext('2d')
        if (!context) continue

        canvas.width = viewport.width
        canvas.height = viewport.height

        await page.render({
          canvasContext: context,
          viewport: viewport
        }).promise

        previews.push({
          pageNumber: pageNum,
          thumbnail: canvas.toDataURL(),
          selected: false
        })
      }

      setPages(previews)
    } catch (err) {
      handleError(err, 'PDF loading', selectedFile.name, selectedFile.size)
    } finally {
      setIsLoading(false)
    }
  }, [handleError, clearError])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      handleFileSelect(selectedFile)
    }
  }

  const togglePageSelection = (pageNumber: number) => {
    const newSelected = new Set(selectedPages)
    if (newSelected.has(pageNumber)) {
      newSelected.delete(pageNumber)
    } else {
      newSelected.add(pageNumber)
    }
    setSelectedPages(newSelected)
  }

  const selectAllPages = () => {
    const allPages = new Set(pages.map(p => p.pageNumber))
    setSelectedPages(allPages)
  }

  const deselectAllPages = () => {
    setSelectedPages(new Set())
  }

  const parsePageRanges = (rangeString: string): number[] => {
    const pageNumbers = new Set<number>()
    const parts = rangeString.split(',').map(s => s.trim())

    for (const part of parts) {
      if (part.includes('-')) {
        const [start, end] = part.split('-').map(s => parseInt(s.trim()))
        if (!isNaN(start) && !isNaN(end) && start <= end) {
          for (let i = start; i <= end; i++) {
            if (i >= 1 && i <= pages.length) {
              pageNumbers.add(i)
            }
          }
        }
      } else {
        const pageNum = parseInt(part)
        if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= pages.length) {
          pageNumbers.add(pageNum)
        }
      }
    }

    return Array.from(pageNumbers).sort((a, b) => a - b)
  }

  const applyPageRanges = () => {
    if (!pageRanges.trim()) return
    
    const parsedPages = parsePageRanges(pageRanges)
    setSelectedPages(new Set(parsedPages))
  }

  const handleSplit = async () => {
    if (!file || selectedPages.size === 0) return

    setIsProcessing(true)
    setProgress(0)
    clearError()
    setSuccess(false)

    try {
      const arrayBuffer = await file.arrayBuffer()
      const pdfDoc = await PDFDocument.load(arrayBuffer)
      const selectedPagesArray = Array.from(selectedPages).sort((a, b) => a - b)

      if (selectedPagesArray.length === 1) {
        // Single page - download directly
        const newPdf = await PDFDocument.create()
        const [copiedPage] = await newPdf.copyPages(pdfDoc, [selectedPagesArray[0] - 1])
        newPdf.addPage(copiedPage)

        const pdfBytes = await newPdf.save()
        const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' })
        const url = URL.createObjectURL(blob)
        
        const link = document.createElement('a')
        link.href = url
        link.download = `${file.name.replace('.pdf', '')}_page_${selectedPagesArray[0]}.pdf`
        link.click()
        
        URL.revokeObjectURL(url)
        setProgress(100)
        setSuccess(true)
      } else {
        // Multiple pages - create ZIP
        const zip = new JSZip()

        for (let i = 0; i < selectedPagesArray.length; i++) {
          const pageNum = selectedPagesArray[i]
          const newPdf = await PDFDocument.create()
          const [copiedPage] = await newPdf.copyPages(pdfDoc, [pageNum - 1])
          newPdf.addPage(copiedPage)

          const pdfBytes = await newPdf.save()
          zip.file(`page_${pageNum}.pdf`, pdfBytes as any)

          setProgress(Math.round(((i + 1) / selectedPagesArray.length) * 100))
        }

        const zipBlob = await zip.generateAsync({ type: 'blob' })
        const url = URL.createObjectURL(zipBlob)
        
        const link = document.createElement('a')
        link.href = url
        link.download = `${file.name.replace('.pdf', '')}_split.zip`
        link.click()
        
        URL.revokeObjectURL(url)
        setSuccess(true)
      }
    } catch (err) {
      handleError(err, 'PDF splitting', file?.name, file?.size)
    } finally {
      setIsProcessing(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Scissors className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold">PDF Splitter</h1>
        </div>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Split PDF documents into separate files by selecting individual pages or page ranges. 
          All processing happens in your browser - your files never leave your device.
        </p>
        <div className="flex justify-center gap-2 mt-4">
          <Badge variant="secondary">🔒 100% Private</Badge>
          <Badge variant="secondary">⚡ Client-Side</Badge>
          <Badge variant="secondary">📄 No Upload</Badge>
        </div>
      </div>

      {/* File Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload PDF
          </CardTitle>
          <CardDescription>
            Select a PDF file to split into separate pages
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleFileChange}
              className="hidden"
              id="pdf-upload"
            />
            <label htmlFor="pdf-upload" className="cursor-pointer">
              <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium">Click to upload PDF</p>
              <p className="text-sm text-gray-500 mt-1">or drag and drop</p>
            </label>
          </div>
          
          {file && (
            <div className="mt-4 flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm text-gray-600">{formatFileSize(file.size)} • {pages.length} pages</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setFile(null)
                  setPages([])
                  setSelectedPages(new Set())
                  clearError()
                  setSuccess(false)
                  if (fileInputRef.current) {
                    fileInputRef.current.value = ''
                  }
                }}
              >
                Remove
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <p className="text-gray-600">Loading PDF pages...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <ErrorNotification
          message={error}
          onDismiss={clearError}
          onRetry={() => {
            clearError()
            if (fileInputRef.current) {
              fileInputRef.current.click()
            }
          }}
        />
      )}

      {/* Success Message */}
      {success && (
        <Alert className="bg-green-50 border-green-200 animate-fade-in">
          <CheckCircle2 className="h-4 w-4 text-green-600 animate-bounce" />
          <AlertDescription className="text-green-800">
            PDF split successfully! Your download should start automatically.
          </AlertDescription>
        </Alert>
      )}

      {/* Page Selection Controls */}
      {pages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Select Pages</CardTitle>
            <CardDescription>
              Choose individual pages or enter page ranges (e.g., "1-5, 8, 10-12")
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={selectAllPages}>
                Select All
              </Button>
              <Button variant="outline" size="sm" onClick={deselectAllPages}>
                Deselect All
              </Button>
              <div className="ml-auto text-sm text-gray-600">
                {selectedPages.size} of {pages.length} pages selected
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="page-ranges">Page Ranges</Label>
              <div className="flex gap-2">
                <Input
                  id="page-ranges"
                  placeholder="e.g., 1-5, 8, 10-12"
                  value={pageRanges}
                  onChange={(e) => setPageRanges(e.target.value)}
                />
                <Button onClick={applyPageRanges} variant="secondary">
                  Apply
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Page Preview Grid */}
      {pages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Page Previews</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {pages.map((page) => (
                <div
                  key={page.pageNumber}
                  className={`relative border-2 rounded-lg p-2 cursor-pointer transition-all ${
                    selectedPages.has(page.pageNumber)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => togglePageSelection(page.pageNumber)}
                >
                  <div className="absolute top-3 left-3 z-10">
                    <Checkbox
                      checked={selectedPages.has(page.pageNumber)}
                      onCheckedChange={() => togglePageSelection(page.pageNumber)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  <img
                    src={page.thumbnail}
                    alt={`Page ${page.pageNumber}`}
                    className="w-full h-auto rounded"
                  />
                  <p className="text-center text-sm font-medium mt-2">
                    Page {page.pageNumber}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Processing Progress */}
      {isProcessing && (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center justify-center space-x-2">
              <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
              <span className="font-medium">Splitting PDF...</span>
            </div>
            <Progress value={progress} className="w-full" />
            <p className="text-center text-sm text-gray-600">{progress}% complete</p>
          </CardContent>
        </Card>
      )}

      {/* Split Button */}
      {pages.length > 0 && (
        <div className="flex justify-center">
          <Button
            onClick={handleSplit}
            disabled={selectedPages.size === 0 || isProcessing}
            size="lg"
            className="px-8"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Splitting...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Split & Download {selectedPages.size > 1 ? `(${selectedPages.size} pages)` : ''}
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  )
}
