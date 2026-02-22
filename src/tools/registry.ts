import { LucideIcon, FileText, Image, Eye, Scissors, Minimize2 } from 'lucide-react'
import { lazy, ComponentType } from 'react'

export interface ToolDefinition {
  id: string
  name: string
  category: 'pdf' | 'image' | 'audio' | 'video' | 'text' | 'ocr' | 'qr'
  description: string
  inputFormats: string[]
  outputFormats: string[]
  clientSideSupported: boolean
  proFeatures: string[]
  icon: LucideIcon
  component: ComponentType<any>
}

// Legacy interface for backward compatibility
export interface Tool extends Omit<ToolDefinition, 'inputFormats' | 'outputFormats' | 'clientSideSupported' | 'proFeatures' | 'component'> {
  supportedFormats: string[]
}

export interface ToolRegistry {
  tools: ToolDefinition[]
  getToolsByCategory(category: string): ToolDefinition[]
  registerTool(tool: ToolDefinition): void
  getToolRoute(toolId: string): string
}

class ConvertAllToolRegistry implements ToolRegistry {
  private toolsMap: Map<string, ToolDefinition> = new Map()
  
  constructor() {
    this.registerDefaultTools()
  }

  get tools(): ToolDefinition[] {
    return Array.from(this.toolsMap.values())
  }

  private registerDefaultTools() {
    // Only register tools that are actually working and ready for production

    // PDF tools - Working
    this.registerTool({
      id: 'pdf-merger',
      name: 'PDF Merger',
      category: 'pdf',
      description: 'Merge multiple PDF files into a single document',
      inputFormats: ['PDF'],
      outputFormats: ['PDF'],
      clientSideSupported: true,
      proFeatures: ['Unlimited files', 'Custom page order', 'Bookmarks preservation'],
      icon: FileText,
      component: lazy(() => import('@/components/tools/PdfMergerTool'))
    })

    this.registerTool({
      id: 'pdf-text-extract',
      name: 'PDF Text Extractor',
      category: 'pdf',
      description: 'Extract text content from PDF documents',
      inputFormats: ['PDF'],
      outputFormats: ['TXT'],
      clientSideSupported: true,
      proFeatures: ['OCR for scanned PDFs', 'Formatted output'],
      icon: FileText,
      component: lazy(() => import('@/components/tools/PdfTextExtractTool'))
    })

    this.registerTool({
      id: 'pdf-splitter',
      name: 'PDF Splitter',
      category: 'pdf',
      description: 'Split PDF documents into separate files by selecting pages or page ranges',
      inputFormats: ['PDF'],
      outputFormats: ['PDF', 'ZIP'],
      clientSideSupported: true,
      proFeatures: ['Batch splitting', 'Custom naming', 'Advanced page selection'],
      icon: Scissors,
      component: lazy(() => import('@/components/tools/PdfSplitterTool'))
    })

    this.registerTool({
      id: 'document-to-pdf',
      name: 'Document to PDF',
      category: 'pdf',
      description: 'Convert text files, images, HTML, and Word documents to PDF format',
      inputFormats: ['TXT', 'HTML', 'DOCX', 'DOC', 'JPG', 'PNG', 'WEBP', 'GIF'],
      outputFormats: ['PDF'],
      clientSideSupported: true,
      proFeatures: ['Batch conversion', 'Custom formatting', 'Advanced layouts'],
      icon: FileText,
      component: lazy(() => import('@/components/tools/DocumentToPdfTool'))
    })

    // Image tools - Working
    this.registerTool({
      id: 'image-converter',
      name: 'Image Format Converter',
      category: 'image',
      description: 'Convert between different image formats with quality control',
      inputFormats: ['JPG', 'PNG', 'GIF', 'WEBP', 'BMP'],
      outputFormats: ['JPG', 'PNG', 'WEBP'],
      clientSideSupported: true,
      proFeatures: ['Lossless compression', 'Custom quality settings', 'Batch processing'],
      icon: Image,
      component: lazy(() => import('@/components/tools/ImageConverterTool'))
    })

    this.registerTool({
      id: 'background-remover',
      name: 'AI Background Remover',
      category: 'image',
      description: 'Remove backgrounds from images using AI - completely client-side',
      inputFormats: ['JPG', 'PNG', 'WEBP'],
      outputFormats: ['PNG'],
      clientSideSupported: true,
      proFeatures: ['Higher accuracy', 'Batch processing', 'Manual refinement'],
      icon: Eye,
      component: lazy(() => import('@/components/tools/BackgroundRemovalTool'))
    })

    this.registerTool({
      id: 'image-compressor',
      name: 'Image Compressor',
      category: 'image',
      description: 'Reduce image file size while maintaining visual quality with adjustable compression',
      inputFormats: ['JPG', 'PNG', 'WEBP', 'GIF'],
      outputFormats: ['JPG', 'PNG', 'WEBP'],
      clientSideSupported: true,
      proFeatures: ['Batch compression', 'Advanced quality presets', 'Larger file support'],
      icon: Minimize2,
      component: lazy(() => import('@/components/tools/ImageCompressorTool'))
    })

    // Coming soon - these will be added as they're completed:
    // - Document to PDF converter
    // - Audio converter
    // - Video converter  
    // - Text formatter
    // - OCR text extractor
    // - QR code generator
  }

  registerTool(tool: ToolDefinition): void {
    this.toolsMap.set(tool.id, tool)
  }

  getTool(id: string): ToolDefinition | undefined {
    return this.toolsMap.get(id)
  }

  getAllTools(): ToolDefinition[] {
    return Array.from(this.toolsMap.values())
  }

  getToolsByCategory(category: string): ToolDefinition[] {
    return this.tools.filter(tool => tool.category === category)
  }

  getToolRoute(toolId: string): string {
    return `/tool/${toolId}`
  }

  // Legacy methods for backward compatibility
  register(tool: Tool): void {
    const toolDefinition: ToolDefinition = {
      ...tool,
      inputFormats: tool.supportedFormats,
      outputFormats: tool.supportedFormats,
      clientSideSupported: false,
      proFeatures: [],
      component: lazy(() => import('@/components/PlaceholderTool'))
    }
    this.registerTool(toolDefinition)
  }
}

export const toolRegistry = new ConvertAllToolRegistry()