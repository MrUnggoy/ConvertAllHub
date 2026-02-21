declare module 'pdfjs-dist' {
  export interface PDFDocumentProxy {
    numPages: number
    getPage(pageNumber: number): Promise<PDFPageProxy>
  }

  export interface PDFPageProxy {
    getViewport(params: { scale: number }): PDFPageViewport
    render(params: { canvasContext: CanvasRenderingContext2D; viewport: PDFPageViewport }): { promise: Promise<void> }
    getTextContent(): Promise<{ items: Array<{ str: string }> }>
  }

  export interface PDFPageViewport {
    width: number
    height: number
  }

  export const GlobalWorkerOptions: {
    workerSrc: string
  }

  export function getDocument(params: { data: ArrayBuffer }): { promise: Promise<PDFDocumentProxy> }
}

declare module 'jszip' {
  export default class JSZip {
    file(name: string, data: Blob): void
    generateAsync(options: { type: 'blob' }): Promise<Blob>
  }
}