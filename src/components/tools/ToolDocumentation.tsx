import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ToolDefinition } from '@/tools/registry'
import { HelpCircle, FileText, Lightbulb, Info } from 'lucide-react'

interface ToolDocumentationProps {
  tool: ToolDefinition
}

// Documentation data for each tool
const toolDocumentation: Record<string, {
  instructions: string[]
  useCases: string[]
  tips: string[]
  faqs: Array<{ question: string; answer: string }>
  fileSizeLimit?: string
  howItWorks: string
}> = {
  'pdf-merger': {
    instructions: [
      'Click the upload area or drag and drop multiple PDF files',
      'Use the arrow buttons to reorder files in your desired sequence',
      'Click "Merge PDFs" to combine all files into one document',
      'Download your merged PDF file'
    ],
    useCases: [
      'Combine multiple invoices or receipts into a single file',
      'Merge chapters of a document into one complete PDF',
      'Consolidate scanned pages into a single document',
      'Create a portfolio by combining multiple PDF documents'
    ],
    tips: [
      'Files are merged in the order shown - use arrow buttons to reorder',
      'All processing happens in your browser for maximum privacy',
      'No file size limits - merge as many PDFs as your browser can handle',
      'Original files remain unchanged on your device'
    ],
    faqs: [
      {
        question: 'Is there a limit to how many PDFs I can merge?',
        answer: 'There is no hard limit, but very large files or many files may slow down processing depending on your device\'s memory.'
      },
      {
        question: 'Will the quality of my PDFs be affected?',
        answer: 'No, PDFs are merged without any compression or quality loss. The output maintains the exact quality of your input files.'
      },
      {
        question: 'Can I merge password-protected PDFs?',
        answer: 'Currently, password-protected PDFs cannot be merged. Please remove the password protection first.'
      }
    ],
    howItWorks: 'The PDF Merger uses pdf-lib to read each PDF file, extract all pages, and combine them into a new PDF document. All processing happens entirely in your browser using JavaScript - no files are uploaded to any server.'
  },
  'pdf-text-extract': {
    instructions: [
      'Upload a PDF file by clicking the upload area or dragging and dropping',
      'Wait for the text extraction to complete',
      'Review the extracted text in the preview area',
      'Click "Download Text" to save as a .txt file or copy to clipboard'
    ],
    useCases: [
      'Extract text from PDF documents for editing',
      'Convert PDF content to plain text for analysis',
      'Copy text from PDFs that don\'t allow text selection',
      'Extract data from PDF reports for further processing'
    ],
    tips: [
      'Works best with text-based PDFs (not scanned images)',
      'Formatting may not be preserved in the extracted text',
      'For scanned PDFs, consider using an OCR tool first',
      'Large PDFs may take longer to process'
    ],
    faqs: [
      {
        question: 'Can this extract text from scanned PDFs?',
        answer: 'No, this tool works with text-based PDFs only. Scanned PDFs require OCR (Optical Character Recognition) which is not currently supported.'
      },
      {
        question: 'Will formatting be preserved?',
        answer: 'Basic paragraph structure is preserved, but complex formatting like tables, columns, and special layouts may not be maintained.'
      },
      {
        question: 'What about PDFs with images?',
        answer: 'Only text content is extracted. Images, charts, and graphics are not included in the output.'
      }
    ],
    howItWorks: 'The tool uses PDF.js to parse the PDF file structure and extract text content from each page. Text is then combined and formatted for download or copying. All processing is done client-side in your browser.'
  },
  'pdf-splitter': {
    instructions: [
      'Upload a PDF file to split',
      'Preview all pages with thumbnails',
      'Select individual pages by clicking checkboxes or enter page ranges (e.g., "1-5, 8, 10-12")',
      'Click "Split PDF" to create separate files',
      'Download individual files or all files as a ZIP archive'
    ],
    useCases: [
      'Extract specific pages from a large document',
      'Separate chapters or sections of a PDF',
      'Remove unwanted pages from a document',
      'Create individual files from a multi-page scan'
    ],
    tips: [
      'Use page ranges for faster selection: "1-10" selects pages 1 through 10',
      'Combine ranges and individual pages: "1-5, 8, 10-12"',
      'For many pages, use the ZIP download option',
      'Page numbers start at 1 (not 0)'
    ],
    faqs: [
      {
        question: 'What\'s the maximum file size I can split?',
        answer: 'There\'s no hard limit, but very large PDFs (over 100MB) may be slow to process depending on your device\'s memory and processing power.'
      },
      {
        question: 'Can I split password-protected PDFs?',
        answer: 'No, you must remove password protection before splitting. This is a security feature to prevent unauthorized access.'
      },
      {
        question: 'How do I download multiple split files?',
        answer: 'If you split into multiple files, you\'ll get a "Download All as ZIP" button that packages all files into a single ZIP archive for easy downloading.'
      }
    ],
    fileSizeLimit: 'No hard limit, but files over 100MB may be slow to process',
    howItWorks: 'The PDF Splitter uses pdf-lib to load your PDF, render page thumbnails using PDF.js, and extract selected pages into new PDF documents. All processing happens in your browser - your files never leave your device.'
  },
  'document-to-pdf': {
    instructions: [
      'Upload a document file (TXT, HTML, DOCX, DOC, or image)',
      'Preview the document content',
      'Adjust any conversion settings if available',
      'Click "Convert to PDF" to generate the PDF',
      'Download your converted PDF file'
    ],
    useCases: [
      'Convert Word documents to PDF for universal compatibility',
      'Create PDFs from text files for professional sharing',
      'Convert images to PDF format',
      'Generate PDFs from HTML content'
    ],
    tips: [
      'For best results with DOCX files, use simple formatting',
      'Complex Word features may not convert perfectly',
      'Images are embedded at their original resolution',
      'Text files are converted with standard formatting'
    ],
    faqs: [
      {
        question: 'Which document formats are supported?',
        answer: 'Currently supports TXT, HTML, DOCX, DOC, JPG, PNG, WEBP, and GIF files.'
      },
      {
        question: 'Will my Word document formatting be preserved?',
        answer: 'Basic formatting like bold, italic, headings, and paragraphs are preserved. Complex features like tables, charts, and advanced layouts may not convert perfectly.'
      },
      {
        question: 'Can I convert multiple documents at once?',
        answer: 'Currently, you can convert one document at a time. For multiple files, convert them individually and then use the PDF Merger tool.'
      }
    ],
    howItWorks: 'The converter uses different libraries depending on the input format: mammoth.js for DOCX files, canvas API for images, and jsPDF for PDF generation. All conversion happens client-side in your browser.'
  },
  'image-converter': {
    instructions: [
      'Upload an image file (JPG, PNG, GIF, WEBP, or BMP)',
      'Select your desired output format',
      'Adjust quality settings if needed',
      'Click "Convert" to process the image',
      'Download your converted image'
    ],
    useCases: [
      'Convert PNG images to JPG for smaller file sizes',
      'Convert JPG to PNG for transparency support',
      'Convert images to modern WebP format for web use',
      'Batch convert images to a consistent format'
    ],
    tips: [
      'WebP format offers the best compression with good quality',
      'Use PNG for images that need transparency',
      'JPG is best for photographs without transparency',
      'Higher quality settings result in larger file sizes'
    ],
    faqs: [
      {
        question: 'What\'s the difference between JPG and PNG?',
        answer: 'JPG is better for photographs and offers smaller file sizes but doesn\'t support transparency. PNG supports transparency and is better for graphics, logos, and images with text.'
      },
      {
        question: 'Should I use WebP format?',
        answer: 'WebP offers excellent compression and quality, making it ideal for web use. However, some older software may not support it.'
      },
      {
        question: 'Will converting reduce image quality?',
        answer: 'Quality depends on the format and settings. Converting from JPG to PNG won\'t improve quality. Converting to JPG or WebP with high quality settings maintains good visual quality.'
      }
    ],
    howItWorks: 'The converter uses the HTML5 Canvas API to read your image, process it, and export it in the desired format. All conversion happens in your browser using JavaScript - no server uploads required.'
  },
  'background-remover': {
    instructions: [
      'Upload an image (JPG, PNG, or WEBP)',
      'Wait for AI processing to remove the background',
      'Preview the result with transparent background',
      'Download the image as PNG with transparency'
    ],
    useCases: [
      'Remove backgrounds from product photos for e-commerce',
      'Create profile pictures with transparent backgrounds',
      'Prepare images for graphic design projects',
      'Extract subjects from photos for presentations'
    ],
    tips: [
      'Works best with clear subjects and distinct backgrounds',
      'Images with high contrast between subject and background give better results',
      'Output is always PNG format to preserve transparency',
      'Processing may take a few seconds depending on image size'
    ],
    faqs: [
      {
        question: 'How accurate is the background removal?',
        answer: 'The AI model works well for most images with clear subjects. Complex backgrounds or subjects with fine details (like hair) may require manual refinement.'
      },
      {
        question: 'Can I remove backgrounds from multiple images?',
        answer: 'Currently, you can process one image at a time. Process each image individually for best results.'
      },
      {
        question: 'Is this really done in my browser?',
        answer: 'Yes! The AI model runs entirely in your browser using TensorFlow.js. Your images never leave your device.'
      }
    ],
    fileSizeLimit: 'Recommended maximum: 10MB for optimal performance',
    howItWorks: 'The tool uses a pre-trained AI model (running via TensorFlow.js) to identify the subject and background in your image. It then creates a mask to separate them and outputs a PNG with a transparent background. All processing happens client-side.'
  },
  'image-compressor': {
    instructions: [
      'Upload an image file (JPG, PNG, WEBP, or GIF)',
      'Adjust the quality slider to control compression level',
      'Preview the compressed image and see size reduction',
      'Compare original and compressed versions side-by-side',
      'Download the compressed image'
    ],
    useCases: [
      'Reduce image file sizes for faster website loading',
      'Compress images for email attachments',
      'Optimize photos for social media uploads',
      'Reduce storage space used by image collections'
    ],
    tips: [
      'Quality 80-85 offers the best balance of size and visual quality',
      'For web use, aim for under 200KB per image',
      'PNG compression is less effective than JPG for photographs',
      'Use the comparison view to ensure quality is acceptable'
    ],
    faqs: [
      {
        question: 'How much can I compress an image?',
        answer: 'Compression depends on the original image and format. Typically, you can reduce file size by 50-80% while maintaining good visual quality at 80-85 quality setting.'
      },
      {
        question: 'Will compression reduce image dimensions?',
        answer: 'No, compression reduces file size without changing image dimensions (width and height). The image will look the same size but use less storage space.'
      },
      {
        question: 'What quality setting should I use?',
        answer: 'For most uses, quality 80-85 is recommended. Use 90+ for professional photography, 70-80 for web images, and 60-70 for thumbnails or previews.'
      }
    ],
    fileSizeLimit: 'Recommended maximum: 25MB for optimal performance',
    howItWorks: 'The compressor uses the HTML5 Canvas API to decode your image, re-encode it with the specified quality level, and output the compressed result. Different compression algorithms are used for JPG, PNG, and WebP formats. All processing is done in your browser.'
  }
}

export default function ToolDocumentation({ tool }: ToolDocumentationProps) {
  const docs = toolDocumentation[tool.id]

  if (!docs) {
    return null // No documentation available for this tool
  }

  return (
    <div className="space-y-6 mt-8">
      {/* How to Use */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>How to Use</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            {docs.instructions.map((instruction, index) => (
              <li key={index}>{instruction}</li>
            ))}
          </ol>
        </CardContent>
      </Card>

      {/* Supported Formats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Info className="h-5 w-5" />
            <span>Supported Formats</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <span className="font-medium text-gray-700">Input formats: </span>
              <span className="text-gray-600">{tool.inputFormats.join(', ')}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Output formats: </span>
              <span className="text-gray-600">{tool.outputFormats.join(', ')}</span>
            </div>
            {docs.fileSizeLimit && (
              <div>
                <span className="font-medium text-gray-700">File size limit: </span>
                <span className="text-gray-600">{docs.fileSizeLimit}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Use Cases */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Lightbulb className="h-5 w-5" />
            <span>Example Use Cases</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            {docs.useCases.map((useCase, index) => (
              <li key={index}>{useCase}</li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Tips for Best Results */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Lightbulb className="h-5 w-5" />
            <span>Tips for Best Results</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            {docs.tips.map((tip, index) => (
              <li key={index}>{tip}</li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* FAQ */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <HelpCircle className="h-5 w-5" />
            <span>Frequently Asked Questions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {docs.faqs.map((faq, index) => (
              <div key={index}>
                <h4 className="font-medium text-gray-900 mb-1">{faq.question}</h4>
                <p className="text-gray-600 text-sm">{faq.answer}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* How It Works */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Info className="h-5 w-5" />
            <span>How It Works</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700">{docs.howItWorks}</p>
        </CardContent>
      </Card>
    </div>
  )
}
