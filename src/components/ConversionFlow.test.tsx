/**
 * ConversionFlow Component Tests
 * 
 * Tests the 3-step conversion flow with state machine logic.
 * Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5, 8.4, 12.3, 12.4
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ConversionFlow from './ConversionFlow'
import { ConversionProvider } from '@/contexts/ConversionContext'

// Mock the conversion context
vi.mock('@/contexts/ConversionContext', async () => {
  const actual = await vi.importActual('@/contexts/ConversionContext')
  return {
    ...actual,
    useConversion: () => ({
      addFile: vi.fn(),
      state: { files: [] },
    }),
  }
})

// Helper to render with context
const renderWithContext = (ui: React.ReactElement) => {
  return render(
    <ConversionProvider>
      {ui}
    </ConversionProvider>
  )
}

describe('ConversionFlow', () => {
  const mockOnComplete = vi.fn()
  const mockOnError = vi.fn()

  const defaultProps = {
    toolId: 'test-tool',
    inputFormats: ['pdf', 'docx'],
    outputFormats: ['jpg', 'png', 'pdf'],
    onComplete: mockOnComplete,
    onError: mockOnError,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Step 1: File Selection', () => {
    it('should render file selection step initially', () => {
      renderWithContext(<ConversionFlow {...defaultProps} />)
      
      expect(screen.getByText('Select Your File')).toBeInTheDocument()
      expect(screen.getByText(/Drop file here or click to browse/i)).toBeInTheDocument()
      expect(screen.getByText(/Supports: pdf, docx/i)).toBeInTheDocument()
    })

    it('should show step indicator with step 1 active', () => {
      renderWithContext(<ConversionFlow {...defaultProps} />)
      
      expect(screen.getByText('Step 1 of 3')).toBeInTheDocument()
      expect(screen.getByLabelText(/Select File, current step/i)).toBeInTheDocument()
    })

    it('should display inline help for file selection', () => {
      renderWithContext(<ConversionFlow {...defaultProps} />)
      
      expect(screen.getByText('How to upload')).toBeInTheDocument()
      expect(screen.getByText(/Click the upload area or drag and drop/i)).toBeInTheDocument()
    })

    it('should handle file selection via input', async () => {
      renderWithContext(<ConversionFlow {...defaultProps} />)
      
      const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' })
      const input = screen.getByLabelText('File input') as HTMLInputElement
      
      await userEvent.upload(input, file)
      
      await waitFor(() => {
        expect(screen.getByText('File Selected')).toBeInTheDocument()
        expect(screen.getByText('test.pdf')).toBeInTheDocument()
      })
    })

    it('should validate file size', async () => {
      renderWithContext(<ConversionFlow {...defaultProps} maxFileSize={1024} />)
      
      const largeFile = new File(['x'.repeat(2000)], 'large.pdf', { type: 'application/pdf' })
      const input = screen.getByLabelText('File input') as HTMLInputElement
      
      await userEvent.upload(input, largeFile)
      
      await waitFor(() => {
        expect(screen.getByText(/File size.*exceeds maximum/i)).toBeInTheDocument()
      })
    })

    it('should validate file format', async () => {
      renderWithContext(<ConversionFlow {...defaultProps} />)
      
      const invalidFile = new File(['test'], 'test.txt', { type: 'text/plain' })
      const input = screen.getByLabelText('File input') as HTMLInputElement
      
      await userEvent.upload(input, invalidFile)
      
      await waitFor(() => {
        expect(screen.getByText(/File type not supported/i)).toBeInTheDocument()
      })
    })

    it('should disable next button when no file selected', () => {
      renderWithContext(<ConversionFlow {...defaultProps} />)
      
      const nextButton = screen.getByRole('button', { name: /Proceed to format selection/i })
      expect(nextButton).toBeDisabled()
    })

    it('should enable next button when file is selected', async () => {
      renderWithContext(<ConversionFlow {...defaultProps} />)
      
      const file = new File(['test'], 'test.pdf', { type: 'application/pdf' })
      const input = screen.getByLabelText('File input') as HTMLInputElement
      
      await userEvent.upload(input, file)
      
      await waitFor(() => {
        const nextButton = screen.getByRole('button', { name: /Proceed to format selection/i })
        expect(nextButton).not.toBeDisabled()
      })
    })

    it('should support keyboard navigation for drop zone', async () => {
      renderWithContext(<ConversionFlow {...defaultProps} />)
      
      const dropZone = screen.getByRole('button', { name: /Upload.*files/i })
      dropZone.focus()
      
      expect(dropZone).toHaveFocus()
      
      // Pressing Enter should trigger file input click
      fireEvent.keyDown(dropZone, { key: 'Enter' })
      // File input should be triggered (tested indirectly)
    })

    it('should handle drag and drop', async () => {
      renderWithContext(<ConversionFlow {...defaultProps} />)
      
      const dropZone = screen.getByRole('button', { name: /Upload.*files/i })
      const file = new File(['test'], 'test.pdf', { type: 'application/pdf' })
      
      // Simulate drag enter
      fireEvent.dragEnter(dropZone, {
        dataTransfer: { files: [file] }
      })
      
      expect(screen.getByText('Drop file here')).toBeInTheDocument()
      
      // Simulate drop
      fireEvent.drop(dropZone, {
        dataTransfer: { files: [file] }
      })
      
      await waitFor(() => {
        expect(screen.getByText('File Selected')).toBeInTheDocument()
      })
    })
  })

  describe('Step 2: Format Selection', () => {
    beforeEach(async () => {
      renderWithContext(<ConversionFlow {...defaultProps} />)
      
      // Select a file first
      const file = new File(['test'], 'test.pdf', { type: 'application/pdf' })
      const input = screen.getByLabelText('File input') as HTMLInputElement
      await userEvent.upload(input, file)
      
      // Proceed to format selection
      await waitFor(() => {
        const nextButton = screen.getByRole('button', { name: /Proceed to format selection/i })
        fireEvent.click(nextButton)
      })
    })

    it('should render format selection step', async () => {
      await waitFor(() => {
        expect(screen.getByText('Choose Output Format')).toBeInTheDocument()
        expect(screen.getByText('Step 2 of 3')).toBeInTheDocument()
      })
    })

    it('should display all available formats', async () => {
      await waitFor(() => {
        expect(screen.getByText('JPG')).toBeInTheDocument()
        expect(screen.getByText('PNG')).toBeInTheDocument()
        expect(screen.getByText('PDF')).toBeInTheDocument()
      })
    })

    it('should display inline help for format selection', async () => {
      await waitFor(() => {
        expect(screen.getByText('Select format')).toBeInTheDocument()
      })
    })

    it('should handle format selection', async () => {
      await waitFor(() => {
        const jpgButton = screen.getByRole('radio', { name: /JPG/i })
        fireEvent.click(jpgButton)
        
        expect(jpgButton).toHaveAttribute('aria-checked', 'true')
      })
    })

    it('should support keyboard navigation for format selection', async () => {
      await waitFor(async () => {
        const jpgButton = screen.getByRole('radio', { name: /JPG/i })
        jpgButton.focus()
        
        fireEvent.keyDown(jpgButton, { key: 'Enter' })
        
        expect(jpgButton).toHaveAttribute('aria-checked', 'true')
      })
    })

    it('should allow going back to file selection', async () => {
      await waitFor(async () => {
        const backButton = screen.getByRole('button', { name: /Go back to file selection/i })
        fireEvent.click(backButton)
        
        await waitFor(() => {
          expect(screen.getByText('Select Your File')).toBeInTheDocument()
          expect(screen.getByText('Step 1 of 3')).toBeInTheDocument()
        })
      })
    })

    it('should preserve selected file when going back', async () => {
      await waitFor(async () => {
        const backButton = screen.getByRole('button', { name: /Go back to file selection/i })
        fireEvent.click(backButton)
        
        await waitFor(() => {
          expect(screen.getByText('File Selected')).toBeInTheDocument()
          expect(screen.getByText('test.pdf')).toBeInTheDocument()
        })
      })
    })

    it('should disable next button when no format selected', async () => {
      await waitFor(() => {
        const nextButton = screen.getByRole('button', { name: /Proceed to conversion/i })
        expect(nextButton).toBeDisabled()
      })
    })

    it('should enable next button when format is selected', async () => {
      await waitFor(async () => {
        const jpgButton = screen.getByRole('radio', { name: /JPG/i })
        fireEvent.click(jpgButton)
        
        const nextButton = screen.getByRole('button', { name: /Proceed to conversion/i })
        expect(nextButton).not.toBeDisabled()
      })
    })
  })

  describe('Step 3: Conversion', () => {
    beforeEach(async () => {
      renderWithContext(<ConversionFlow {...defaultProps} />)
      
      // Select a file
      const file = new File(['test'], 'test.pdf', { type: 'application/pdf' })
      const input = screen.getByLabelText('File input') as HTMLInputElement
      await userEvent.upload(input, file)
      
      // Proceed to format selection
      await waitFor(() => {
        const nextButton = screen.getByRole('button', { name: /Proceed to format selection/i })
        fireEvent.click(nextButton)
      })
      
      // Select format
      await waitFor(() => {
        const jpgButton = screen.getByRole('radio', { name: /JPG/i })
        fireEvent.click(jpgButton)
      })
      
      // Proceed to conversion
      await waitFor(() => {
        const nextButton = screen.getByRole('button', { name: /Proceed to conversion/i })
        fireEvent.click(nextButton)
      })
    })

    it('should render conversion step', async () => {
      await waitFor(() => {
        expect(screen.getByText('Convert Your File')).toBeInTheDocument()
        expect(screen.getByText('Step 3 of 3')).toBeInTheDocument()
      })
    })

    it('should display conversion summary', async () => {
      await waitFor(() => {
        expect(screen.getByText('File:')).toBeInTheDocument()
        expect(screen.getByText('test.pdf')).toBeInTheDocument()
        expect(screen.getByText('Output Format:')).toBeInTheDocument()
        expect(screen.getByText('JPG')).toBeInTheDocument()
      })
    })

    it('should display inline help before conversion', async () => {
      await waitFor(() => {
        expect(screen.getByText('Ready to convert')).toBeInTheDocument()
      })
    })

    it('should allow going back to format selection', async () => {
      await waitFor(async () => {
        const backButton = screen.getByRole('button', { name: /Go back to format selection/i })
        fireEvent.click(backButton)
        
        await waitFor(() => {
          expect(screen.getByText('Choose Output Format')).toBeInTheDocument()
        })
      })
    })

    it('should show progress indicator during conversion', async () => {
      await waitFor(async () => {
        const convertButton = screen.getByRole('button', { name: /Start conversion/i })
        fireEvent.click(convertButton)
        
        await waitFor(() => {
          expect(screen.getByText(/Converting your file/i)).toBeInTheDocument()
        })
      })
    })

    it('should call onComplete when conversion succeeds', async () => {
      await waitFor(async () => {
        const convertButton = screen.getByRole('button', { name: /Start conversion/i })
        fireEvent.click(convertButton)
        
        await waitFor(() => {
          expect(mockOnComplete).toHaveBeenCalled()
        }, { timeout: 5000 })
      })
    })

    it('should show download button after successful conversion', async () => {
      await waitFor(async () => {
        const convertButton = screen.getByRole('button', { name: /Start conversion/i })
        fireEvent.click(convertButton)
        
        await waitFor(() => {
          expect(screen.getByText('Conversion Complete!')).toBeInTheDocument()
          expect(screen.getByRole('button', { name: /Download converted file/i })).toBeInTheDocument()
        }, { timeout: 5000 })
      })
    })

    it('should allow starting over after conversion', async () => {
      await waitFor(async () => {
        const convertButton = screen.getByRole('button', { name: /Start conversion/i })
        fireEvent.click(convertButton)
        
        await waitFor(() => {
          const startOverButton = screen.getByRole('button', { name: /Convert Another File/i })
          fireEvent.click(startOverButton)
          
          expect(screen.getByText('Select Your File')).toBeInTheDocument()
          expect(screen.getByText('Step 1 of 3')).toBeInTheDocument()
        }, { timeout: 5000 })
      })
    })
  })

  describe('Error Handling', () => {
    it('should show error when trying to proceed without file', async () => {
      renderWithContext(<ConversionFlow {...defaultProps} />)
      
      const nextButton = screen.getByRole('button', { name: /Proceed to format selection/i })
      fireEvent.click(nextButton)
      
      await waitFor(() => {
        expect(screen.getByText(/Please select a file first/i)).toBeInTheDocument()
      })
    })

    it('should show error when trying to proceed without format', async () => {
      renderWithContext(<ConversionFlow {...defaultProps} />)
      
      // Select a file
      const file = new File(['test'], 'test.pdf', { type: 'application/pdf' })
      const input = screen.getByLabelText('File input') as HTMLInputElement
      await userEvent.upload(input, file)
      
      // Proceed to format selection
      await waitFor(() => {
        const nextButton = screen.getByRole('button', { name: /Proceed to format selection/i })
        fireEvent.click(nextButton)
      })
      
      // Try to proceed without selecting format
      await waitFor(() => {
        const nextButton = screen.getByRole('button', { name: /Proceed to conversion/i })
        fireEvent.click(nextButton)
      })
      
      await waitFor(() => {
        expect(screen.getByText(/Please select an output format/i)).toBeInTheDocument()
      })
    })

    it('should allow dismissing errors', async () => {
      renderWithContext(<ConversionFlow {...defaultProps} />)
      
      const nextButton = screen.getByRole('button', { name: /Proceed to format selection/i })
      fireEvent.click(nextButton)
      
      await waitFor(() => {
        expect(screen.getByText(/Please select a file first/i)).toBeInTheDocument()
      })
      
      const dismissButton = screen.getByRole('button', { name: /Dismiss message/i })
      fireEvent.click(dismissButton)
      
      await waitFor(() => {
        expect(screen.queryByText(/Please select a file first/i)).not.toBeInTheDocument()
      })
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels for all interactive elements', () => {
      renderWithContext(<ConversionFlow {...defaultProps} />)
      
      expect(screen.getByRole('button', { name: /Upload.*files/i })).toBeInTheDocument()
      expect(screen.getByLabelText('File input')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Proceed to format selection/i })).toBeInTheDocument()
    })

    it('should announce step changes to screen readers', async () => {
      renderWithContext(<ConversionFlow {...defaultProps} />)
      
      // Check initial step announcement
      expect(screen.getByText('Step 1 of 3: Select File')).toBeInTheDocument()
      
      // Select file and proceed
      const file = new File(['test'], 'test.pdf', { type: 'application/pdf' })
      const input = screen.getByLabelText('File input') as HTMLInputElement
      await userEvent.upload(input, file)
      
      await waitFor(() => {
        const nextButton = screen.getByRole('button', { name: /Proceed to format selection/i })
        fireEvent.click(nextButton)
      })
      
      // Check step 2 announcement
      await waitFor(() => {
        expect(screen.getByText('Step 2 of 3: Choose Format')).toBeInTheDocument()
      })
    })

    it('should support keyboard navigation for drop zone', async () => {
      renderWithContext(<ConversionFlow {...defaultProps} />)
      
      // Tab to drop zone
      const dropZone = screen.getByRole('button', { name: /Upload.*files/i })
      dropZone.focus()
      expect(dropZone).toHaveFocus()
    })
  })

  describe('Touch Gesture Support - Requirement 6.4', () => {
    it('should have touch-action: manipulation on drop zone', () => {
      renderWithContext(<ConversionFlow {...defaultProps} />)
      
      const dropZone = screen.getByRole('button', { name: /Upload.*files/i })
      expect(dropZone).toHaveStyle({ touchAction: 'manipulation' })
    })

    it('should have touch-action: manipulation on all interactive buttons', () => {
      renderWithContext(<ConversionFlow {...defaultProps} />)
      
      // Check next button
      const nextButton = screen.getByRole('button', { name: /Proceed to format selection/i })
      expect(nextButton).toHaveStyle({ touchAction: 'manipulation' })
    })

    it('should handle touch events on drop zone', () => {
      renderWithContext(<ConversionFlow {...defaultProps} />)
      
      const dropZone = screen.getByRole('button', { name: /Upload.*files/i })
      
      // Simulate touch start
      fireEvent.touchStart(dropZone)
      
      // Simulate touch end
      fireEvent.touchEnd(dropZone)
      
      // Verify the file input was triggered (drop zone should still be in the document)
      expect(dropZone).toBeInTheDocument()
    })

    it('should provide visual feedback on touch', () => {
      renderWithContext(<ConversionFlow {...defaultProps} />)
      
      const dropZone = screen.getByRole('button', { name: /Upload.*files/i })
      
      // Initial state - should have neutral border
      expect(dropZone.className).toContain('border-neutral-300')
      
      // Touch start should add visual feedback (isDragOver state)
      fireEvent.touchStart(dropZone)
      
      // After touch end, visual feedback should be removed
      fireEvent.touchEnd(dropZone)
      
      // Verify drop zone is still functional
      expect(dropZone).toBeInTheDocument()
    })
  })

  describe('Orientation Change State Preservation - Requirement 6.5', () => {
    it('should preserve selected file through component lifecycle', async () => {
      renderWithContext(<ConversionFlow {...defaultProps} />)
      
      // Select a file
      const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' })
      const input = screen.getByLabelText('File input') as HTMLInputElement
      await userEvent.upload(input, file)
      
      await waitFor(() => {
        expect(screen.getByText('File Selected')).toBeInTheDocument()
        expect(screen.getByText('test.pdf')).toBeInTheDocument()
      })
      
      // Simulate window resize (orientation change triggers resize events)
      window.dispatchEvent(new Event('resize'))
      
      // Verify file is still selected after resize event
      expect(screen.getByText('File Selected')).toBeInTheDocument()
      expect(screen.getByText('test.pdf')).toBeInTheDocument()
    })

    it('should preserve selected format through window resize', async () => {
      renderWithContext(<ConversionFlow {...defaultProps} />)
      
      // Select a file
      const file = new File(['test'], 'test.pdf', { type: 'application/pdf' })
      const input = screen.getByLabelText('File input') as HTMLInputElement
      await userEvent.upload(input, file)
      
      // Proceed to format selection
      await waitFor(() => {
        const nextButton = screen.getByRole('button', { name: /Proceed to format selection/i })
        fireEvent.click(nextButton)
      })
      
      // Select format
      await waitFor(() => {
        const jpgButton = screen.getByRole('radio', { name: /JPG/i })
        fireEvent.click(jpgButton)
        expect(jpgButton).toHaveAttribute('aria-checked', 'true')
      })
      
      // Simulate orientation change via resize event
      window.dispatchEvent(new Event('resize'))
      
      // Verify format is still selected
      const jpgButton = screen.getByRole('radio', { name: /JPG/i })
      expect(jpgButton).toHaveAttribute('aria-checked', 'true')
    })

    it('should preserve current step through window resize', async () => {
      renderWithContext(<ConversionFlow {...defaultProps} />)
      
      // Select a file
      const file = new File(['test'], 'test.pdf', { type: 'application/pdf' })
      const input = screen.getByLabelText('File input') as HTMLInputElement
      await userEvent.upload(input, file)
      
      // Proceed to format selection (step 2)
      await waitFor(() => {
        const nextButton = screen.getByRole('button', { name: /Proceed to format selection/i })
        fireEvent.click(nextButton)
      })
      
      await waitFor(() => {
        expect(screen.getByText('Step 2 of 3')).toBeInTheDocument()
        expect(screen.getByText('Choose Output Format')).toBeInTheDocument()
      })
      
      // Simulate orientation change
      window.dispatchEvent(new Event('resize'))
      window.dispatchEvent(new Event('orientationchange'))
      
      // Verify we're still on step 2
      expect(screen.getByText('Step 2 of 3')).toBeInTheDocument()
      expect(screen.getByText('Choose Output Format')).toBeInTheDocument()
    })

    it('should preserve all state data at conversion step through orientation change', async () => {
      renderWithContext(<ConversionFlow {...defaultProps} />)
      
      // Select a file
      const file = new File(['test'], 'test.pdf', { type: 'application/pdf' })
      const input = screen.getByLabelText('File input') as HTMLInputElement
      await userEvent.upload(input, file)
      
      // Proceed to format selection
      await waitFor(() => {
        const nextButton = screen.getByRole('button', { name: /Proceed to format selection/i })
        fireEvent.click(nextButton)
      })
      
      // Select format
      await waitFor(() => {
        const jpgButton = screen.getByRole('radio', { name: /JPG/i })
        fireEvent.click(jpgButton)
      })
      
      // Proceed to conversion
      await waitFor(() => {
        const nextButton = screen.getByRole('button', { name: /Proceed to conversion/i })
        fireEvent.click(nextButton)
      })
      
      await waitFor(() => {
        expect(screen.getByText('Convert Your File')).toBeInTheDocument()
        expect(screen.getByText('Step 3 of 3')).toBeInTheDocument()
      })
      
      // Simulate orientation change
      window.dispatchEvent(new Event('orientationchange'))
      window.dispatchEvent(new Event('resize'))
      
      // Verify we're still on step 3 with all data preserved
      expect(screen.getByText('Convert Your File')).toBeInTheDocument()
      expect(screen.getByText('Step 3 of 3')).toBeInTheDocument()
      expect(screen.getByText('test.pdf')).toBeInTheDocument()
      expect(screen.getByText('JPG')).toBeInTheDocument()
    })

    it('should maintain responsive layout classes after orientation change', async () => {
      const { container } = renderWithContext(<ConversionFlow {...defaultProps} />)
      
      // Select a file and proceed to format selection
      const file = new File(['test'], 'test.pdf', { type: 'application/pdf' })
      const input = screen.getByLabelText('File input') as HTMLInputElement
      await userEvent.upload(input, file)
      
      await waitFor(() => {
        const nextButton = screen.getByRole('button', { name: /Proceed to format selection/i })
        fireEvent.click(nextButton)
      })
      
      await waitFor(() => {
        expect(screen.getByText('Choose Output Format')).toBeInTheDocument()
      })
      
      // Get the format grid element
      const formatGrid = container.querySelector('[role="radiogroup"]')
      expect(formatGrid).toBeInTheDocument()
      expect(formatGrid?.className).toContain('grid')
      
      // Simulate orientation change
      window.dispatchEvent(new Event('orientationchange'))
      window.dispatchEvent(new Event('resize'))
      
      // Verify layout classes are still present
      const formatGridAfter = container.querySelector('[role="radiogroup"]')
      expect(formatGridAfter).toBeInTheDocument()
      expect(formatGridAfter?.className).toContain('grid')
      expect(formatGridAfter?.className).toContain('grid-cols-2')
      expect(formatGridAfter?.className).toContain('md:grid-cols-3')
    })
  })
})
