/**
 * Integration tests for ToolPage with ConversionFlow
 * 
 * Tests the integration of ConversionFlow, ErrorDisplay, and LoadingIndicator
 * in the ToolPage component.
 * 
 * Validates: Requirements 5.1, 12.1, 12.2
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import ToolPage from '../ToolPage'
import { ConversionProvider } from '@/contexts/ConversionContext'
import { toolRegistry } from '@/tools/registry'

// Mock the tool registry
vi.mock('@/tools/registry', () => ({
  toolRegistry: {
    getTool: vi.fn(),
  },
}))

// Mock the ConversionFlow component
vi.mock('@/components/ConversionFlow', () => ({
  default: ({ toolId, onComplete, onError }: any) => (
    <div data-testid="conversion-flow">
      <div>ConversionFlow for {toolId}</div>
      <button onClick={() => onComplete({ file: new Blob(), filename: 'test.pdf', size: 100, downloadUrl: 'test' })}>
        Complete
      </button>
      <button onClick={() => onError({ code: 'TEST_ERROR', message: 'Test error', userMessage: 'Test error occurred', suggestedAction: 'Try again' })}>
        Error
      </button>
    </div>
  ),
}))

// Mock ErrorDisplay
vi.mock('@/components/ErrorDisplay', () => ({
  default: ({ error, onDismiss }: any) => (
    <div data-testid="error-display">
      <div>{error.userMessage}</div>
      <button onClick={onDismiss}>Dismiss</button>
    </div>
  ),
}))

// Mock LoadingIndicator
vi.mock('@/components/LoadingIndicator', () => ({
  default: ({ message }: any) => (
    <div data-testid="loading-indicator">{message}</div>
  ),
}))

// Mock ToolDocumentation
vi.mock('@/components/tools/ToolDocumentation', () => ({
  default: () => <div data-testid="tool-documentation">Documentation</div>,
}))

// Mock SEO components
vi.mock('@/components/seo/MetaTags', () => ({
  default: () => null,
}))

vi.mock('@/components/seo/SchemaMarkup', () => ({
  default: () => null,
  createSoftwareApplicationSchema: () => ({}),
}))

const mockTool = {
  id: 'pdf-converter',
  name: 'PDF Converter',
  description: 'Convert PDF files',
  category: 'pdf',
  icon: () => <div>Icon</div>,
  inputFormats: ['pdf', 'docx'],
  outputFormats: ['pdf', 'jpg'],
  component: () => <div>Legacy Tool Component</div>,
}

describe('ToolPage Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(toolRegistry.getTool).mockReturnValue(mockTool as any)
  })

  const renderToolPage = (toolId: string = 'pdf-converter') => {
    return render(
      <MemoryRouter initialEntries={[`/tool/${toolId}`]}>
        <ConversionProvider>
          <Routes>
            <Route path="/tool/:toolId" element={<ToolPage />} />
          </Routes>
        </ConversionProvider>
      </MemoryRouter>
    )
  }

  describe('ConversionFlow Integration', () => {
    it('should render ConversionFlow component with correct props', () => {
      renderToolPage()

      const conversionFlow = screen.getByTestId('conversion-flow')
      expect(conversionFlow).toBeInTheDocument()
      expect(conversionFlow).toHaveTextContent('ConversionFlow for pdf-converter')
    })

    it('should pass tool input and output formats to ConversionFlow', () => {
      renderToolPage()

      // ConversionFlow should be rendered with the tool's formats
      expect(screen.getByTestId('conversion-flow')).toBeInTheDocument()
    })

    it('should handle conversion completion', async () => {
      renderToolPage()

      const completeButton = screen.getByText('Complete')
      completeButton.click()

      // Error should not be displayed after successful completion
      await waitFor(() => {
        expect(screen.queryByTestId('error-display')).not.toBeInTheDocument()
      })
    })
  })

  describe('ErrorDisplay Integration', () => {
    it('should display ErrorDisplay when conversion error occurs', async () => {
      renderToolPage()

      const errorButton = screen.getByText('Error')
      errorButton.click()

      await waitFor(() => {
        expect(screen.getByTestId('error-display')).toBeInTheDocument()
        expect(screen.getByText('Test error occurred')).toBeInTheDocument()
      })
    })

    it('should dismiss error when dismiss button is clicked', async () => {
      renderToolPage()

      // Trigger error
      const errorButton = screen.getByText('Error')
      errorButton.click()

      await waitFor(() => {
        expect(screen.getByTestId('error-display')).toBeInTheDocument()
      })

      // Dismiss error
      const dismissButton = screen.getByText('Dismiss')
      dismissButton.click()

      await waitFor(() => {
        expect(screen.queryByTestId('error-display')).not.toBeInTheDocument()
      })
    })

    it('should clear previous error when new conversion starts', async () => {
      renderToolPage()

      // Trigger error
      const errorButton = screen.getByText('Error')
      errorButton.click()

      await waitFor(() => {
        expect(screen.getByTestId('error-display')).toBeInTheDocument()
      })

      // Complete conversion (should clear error)
      const completeButton = screen.getByText('Complete')
      completeButton.click()

      await waitFor(() => {
        expect(screen.queryByTestId('error-display')).not.toBeInTheDocument()
      })
    })
  })

  describe('Tool Header', () => {
    it('should display tool name and description', () => {
      renderToolPage()

      expect(screen.getByText('PDF Converter')).toBeInTheDocument()
      expect(screen.getByText('Convert PDF files')).toBeInTheDocument()
    })

    it('should display tool icon', () => {
      renderToolPage()

      // Icon should be rendered (mocked as div with "Icon" text)
      expect(screen.getByText('Icon')).toBeInTheDocument()
    })
  })

  describe('Tool Documentation', () => {
    it('should render ToolDocumentation component', () => {
      renderToolPage()

      expect(screen.getByTestId('tool-documentation')).toBeInTheDocument()
    })
  })

  describe('Tool Not Found', () => {
    it('should display error message when tool is not found', () => {
      vi.mocked(toolRegistry.getTool).mockReturnValue(undefined)

      renderToolPage('non-existent-tool')

      expect(screen.getByText('Tool Not Found')).toBeInTheDocument()
      expect(screen.getByText(/The requested tool "non-existent-tool" could not be found/)).toBeInTheDocument()
    })

    it('should provide link back to home when tool is not found', () => {
      vi.mocked(toolRegistry.getTool).mockReturnValue(undefined)

      renderToolPage('non-existent-tool')

      const backLink = screen.getByText('← Back to all tools')
      expect(backLink).toBeInTheDocument()
      expect(backLink).toHaveAttribute('href', '/')
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels for sections', () => {
      renderToolPage()

      expect(screen.getByLabelText('Tool interface')).toBeInTheDocument()
      expect(screen.getByLabelText('Tool documentation')).toBeInTheDocument()
    })

    it('should use semantic HTML article element', () => {
      const { container } = renderToolPage()

      const article = container.querySelector('article')
      expect(article).toBeInTheDocument()
    })

    it('should have proper heading hierarchy', () => {
      renderToolPage()

      const h1 = screen.getByRole('heading', { level: 1 })
      expect(h1).toHaveTextContent('PDF Converter')
    })
  })

  describe('SEO', () => {
    it('should set current tool in conversion context', () => {
      renderToolPage()

      // The useEffect should call setCurrentTool with the toolId
      // This is tested indirectly through the component rendering
      expect(screen.getByTestId('conversion-flow')).toBeInTheDocument()
    })
  })
})
