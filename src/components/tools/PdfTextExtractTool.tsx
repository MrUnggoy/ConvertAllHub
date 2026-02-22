import { useState, useCallback } from 'react'
import { Download, FileText, Copy, Zap, CheckCircle2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import FileUpload from '@/components/FileUpload'
import ConversionProgress from '@/components/ConversionProgress'

import { useConversion } from '@/contexts/ConversionContext'
import { useAnalytics } from '@/hooks/useAnalytics'
import { ToolDefinition } from '@/tools/registry'
import * as pdfjsLib from 'pdfjs-dist'

// Configure PDF.js worker - use local worker file
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.js',
  import.meta.url
).toString()

interface PdfTextExtractToolProps {
  tool: ToolDefinition
}

export default function PdfTextExtractTool({ tool }: PdfTextExtractToolProps) {
  const [extractedText, setExtractedText] = useState('')
  const [, setIsExtracting] = useState(false)
  const [textStats, setTextStats] = useState<{
    pages: number
    words: number
    characters: number
  } | null>(null)

  const { state, updateFileStatus, setFileResult, setFileError } = useConversion()
  const { trackConversionStarted, trackConversionCompleted } = useAnalytics()

  const handleFilesAdded = useCallback(async (files: File[]) => {
    const pdfFiles = files.filter(file => file.type === 'application/pdf')
    
    if (pdfFiles.length === 0) {
      alert('Please select PDF files only')
      return
    }

    // Process first PDF file
    const file = pdfFiles[0]
    trackConversionStarted(tool.id, file.type, file.size)
    await extractTextFromPdf(file)
  }, [tool.id, trackConversionStarted])

  const extractTextFromPdf = async (file: File) => {
    const fileId = `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`
    
    try {
      setIsExtracting(true)
      updateFileStatus(fileId, 'processing', 0)

      // Load PDF
      const arrayBuffer = await file.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
      
      const totalPages = pdf.numPages
      let fullText = ''
      
      // Extract text from each page
      for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
        const progress = Math.round((pageNum / totalPages) * 100)
        updateFileStatus(fileId, 'processing', progress)

        const page = await pdf.getPage(pageNum)
        const textContent = await page.getTextContent()
        
        // Combine text items
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ')
        
        if (pageText.trim()) {
          fullText += `--- Page ${pageNum} ---\n${pageText}\n\n`
        }
      }

      setExtractedText(fullText)
      
      // Calculate statistics
      const words = fullText.trim().split(/\s+/).length
      const characters = fullText.length
      setTextStats({
        pages: totalPages,
        words,
        characters
      })

      // Create downloadable text file
      const textBlob = new Blob([fullText], { type: 'text/plain' })
      const textUrl = URL.createObjectURL(textBlob)
      
      const processingTime = Date.now() - parseInt(fileId.split('-')[0])
      const result = {
        outputUrl: textUrl,
        outputSize: textBlob.size,
        outputType: 'txt',
        processingTime: processingTime / 1000,
        metadata: {
          pages_processed: totalPages,
          words_extracted: words,
          characters_extracted: characters,
          client_side: true
        }
      }

      setFileResult(fileId, result)
      trackConversionCompleted(tool.id, processingTime, true)

    } catch (error) {
      console.error('PDF text extraction error:', error)
      setFileError(fileId, `Text extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      trackConversionCompleted(tool.id, 0, false)
    } finally {
      setIsExtracting(false)
    }
  }

  const handleDownload = (_fileId: string, url: string) => {
    const link = document.createElement('a')
    link.href = url
    link.download = 'extracted_text.txt'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(extractedText)
      // You could add a toast notification here
      alert('Text copied to clipboard!')
    } catch (error) {
      console.error('Failed to copy text:', error)
      alert('Failed to copy text to clipboard')
    }
  }

  const handleRetry = (fileId: string) => {
    const file = state.files.find(f => f.id === fileId)?.file
    if (file) {
      extractTextFromPdf(file)
    }
  }

  return (
    <div className="space-y-6">
      {/* Tool Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-6 w-6" />
            <span>PDF Text Extractor</span>
            <div className="flex items-center space-x-1 text-green-600 text-sm">
              <Zap className="h-4 w-4" />
              <span>Client-side</span>
            </div>
          </CardTitle>
          <CardDescription>
            Extract all text content from PDF documents. Processing happens in your browser for complete privacy.
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <span>✓ Privacy-first processing</span>
            <span>✓ Preserves page structure</span>
            <span>✓ Instant extraction</span>
          </div>
        </CardContent>
      </Card>

      {/* File Upload */}
      <FileUpload
        tool={tool}
        onFilesAdded={handleFilesAdded}
        maxFiles={1}
        maxSizeBytes={25 * 1024 * 1024} // 25MB limit
      />



      {/* Conversion Progress */}
      {state.files.length > 0 && !state.batchMode && (
        <ConversionProgress
          onDownload={handleDownload}
          onRetry={handleRetry}
        />
      )}

      {/* Text Statistics */}
      {textStats && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Extraction Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">{textStats.pages}</div>
                <div className="text-sm text-muted-foreground">Pages</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{textStats.words.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Words</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">{textStats.characters.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Characters</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Extracted Text Display */}
      {extractedText && (
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600 animate-bounce" />
                <span>Extracted Text</span>
              </div>
              <div className="flex space-x-2">
                <Button size="sm" variant="outline" onClick={handleCopyText}>
                  <Copy className="h-4 w-4 mr-1" />
                  Copy
                </Button>
                <Button size="sm" onClick={() => handleDownload('text', URL.createObjectURL(new Blob([extractedText], { type: 'text/plain' })))}>
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-96 overflow-y-auto bg-gray-50 p-4 rounded-lg">
              <pre className="whitespace-pre-wrap text-sm font-mono">
                {extractedText}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}