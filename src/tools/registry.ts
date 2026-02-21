import { LucideIcon, FileText, Image, Eye } from 'lucide-react'
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
      id: 'document-to-pdf',
      name: 'Document to PDF',
      category: 'pdf',
      description: 'Convert text files, images, and HTML to PDF format',
      inputFormats: ['TXT', 'HTML', 'JPG', 'PNG', 'WEBP', 'GIF'],
      outputFormats: ['PDF'],
      clientSideSupported: true,
      proFeatures: ['Batch conversion', 'Custom formatting', 'Advanced layouts'],
      icon: FileText,
      component: lazy(() => import('@/components/PlaceholderTool'))
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

    // Coming soon - these will be added as they're completed:
    // - Document to PDF converter
    // - PDF splitter
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