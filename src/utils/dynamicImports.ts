/**
 * Dynamic Import Utilities
 * 
 * This module provides utilities for dynamically importing heavy libraries
 * only when they are needed, improving initial bundle size and First Contentful Paint.
 * 
 * Benefits:
 * - Reduces initial JavaScript bundle size
 * - Improves Time to Interactive (TTI)
 * - Better Core Web Vitals scores
 * - Libraries are cached after first load
 */

/**
 * Dynamically imports the PDF.js library for PDF processing
 * Only loaded when a PDF tool is actually used
 */
export async function loadPdfJs() {
  const pdfjs = await import('pdfjs-dist')
  
  // Configure worker
  const pdfjsWorker = await import('pdfjs-dist/build/pdf.worker.mjs?url')
  pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker.default
  
  return pdfjs
}

/**
 * Dynamically imports pdf-lib for PDF manipulation
 * Only loaded when PDF creation/editing tools are used
 */
export async function loadPdfLib() {
  const { PDFDocument, rgb, StandardFonts } = await import('pdf-lib')
  return { PDFDocument, rgb, StandardFonts }
}

/**
 * Dynamically imports jsPDF for PDF generation
 * Only loaded when document-to-PDF conversion is used
 */
export async function loadJsPdf() {
  const { jsPDF } = await import('jspdf')
  return jsPDF
}

/**
 * Dynamically imports JSZip for ZIP file handling
 * Only loaded when multi-file operations are used
 */
export async function loadJsZip() {
  const JSZip = await import('jszip')
  return JSZip.default
}

/**
 * Dynamically imports Mammoth for DOCX processing
 * Only loaded when document conversion tools are used
 */
export async function loadMammoth() {
  const mammoth = await import('mammoth')
  return mammoth
}

/**
 * Dynamically imports the background removal library
 * This is a very heavy library (~10MB) and should only be loaded when needed
 * 
 * Note: Currently using a placeholder. When implementing actual background removal,
 * uncomment the import below:
 */
export async function loadBackgroundRemoval() {
  // Uncomment when ready to use the actual library:
  // const { removeBackground } = await import('@imgly/background-removal')
  // return { removeBackground }
  
  // Placeholder implementation
  return {
    removeBackground: async (imageBlob: Blob): Promise<Blob> => {
      // This is a placeholder - actual implementation would use @imgly/background-removal
      console.warn('Background removal library not yet integrated')
      return imageBlob
    }
  }
}

/**
 * Preload a library in the background (optional optimization)
 * Use this to preload libraries that are likely to be needed soon
 * 
 * @example
 * // Preload PDF library when user hovers over a PDF tool
 * onMouseEnter={() => preloadLibrary(loadPdfJs)}
 */
export function preloadLibrary(loader: () => Promise<any>) {
  // Use requestIdleCallback if available, otherwise use setTimeout
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => loader())
  } else {
    setTimeout(() => loader(), 1)
  }
}
