/**
 * Unit Tests for ErrorDisplay Component
 * 
 * Tests error display functionality including:
 * - Severity levels (error, warning, info)
 * - Retry and dismiss functionality
 * - Collapsible technical details
 * - Auto-dismiss for info messages
 * - Accessibility features
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ErrorDisplay, { ConversionError } from './ErrorDisplay'

describe('ErrorDisplay Component', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  const mockError: ConversionError = {
    code: 'TEST_ERROR',
    message: 'Technical error message',
    userMessage: 'Something went wrong',
    suggestedAction: 'Please try again',
    technicalDetails: 'Stack trace: Error at line 42',
  }

  describe('Severity Levels', () => {
    it('renders error severity with correct styling', () => {
      render(
        <ErrorDisplay
          error={mockError}
          severity="error"
        />
      )

      const alert = screen.getByRole('alert')
      expect(alert).toHaveClass('bg-red-50')
      expect(alert).toHaveClass('border-red-200')
    })

    it('renders warning severity with correct styling', () => {
      render(
        <ErrorDisplay
          error={mockError}
          severity="warning"
        />
      )

      const alert = screen.getByRole('alert')
      expect(alert).toHaveClass('bg-amber-50')
      expect(alert).toHaveClass('border-amber-200')
    })

    it('renders info severity with correct styling', () => {
      render(
        <ErrorDisplay
          error={mockError}
          severity="info"
        />
      )

      const alert = screen.getByRole('alert')
      expect(alert).toHaveClass('bg-blue-50')
      expect(alert).toHaveClass('border-blue-200')
    })

    it('uses assertive aria-live for errors', () => {
      render(
        <ErrorDisplay
          error={mockError}
          severity="error"
        />
      )

      const alert = screen.getByRole('alert')
      expect(alert).toHaveAttribute('aria-live', 'assertive')
    })

    it('uses polite aria-live for warnings and info', () => {
      const { rerender } = render(
        <ErrorDisplay
          error={mockError}
          severity="warning"
        />
      )

      let alert = screen.getByRole('alert')
      expect(alert).toHaveAttribute('aria-live', 'polite')

      rerender(
        <ErrorDisplay
          error={mockError}
          severity="info"
        />
      )

      alert = screen.getByRole('alert')
      expect(alert).toHaveAttribute('aria-live', 'polite')
    })
  })

  describe('Error Content Display', () => {
    it('displays user-friendly message (Requirement 12.2)', () => {
      render(
        <ErrorDisplay
          error={mockError}
          severity="error"
        />
      )

      expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    })

    it('displays suggested action (Requirement 12.2)', () => {
      render(
        <ErrorDisplay
          error={mockError}
          severity="error"
        />
      )

      expect(screen.getByText(/Please try again/)).toBeInTheDocument()
      expect(screen.getByText(/Suggested action:/)).toBeInTheDocument()
    })

    it('does not display technical details by default', () => {
      render(
        <ErrorDisplay
          error={mockError}
          severity="error"
        />
      )

      expect(screen.queryByText(/Stack trace/)).not.toBeInTheDocument()
    })
  })

  describe('Retry Functionality', () => {
    it('renders retry button when onRetry is provided', () => {
      const onRetry = vi.fn()

      render(
        <ErrorDisplay
          error={mockError}
          severity="error"
          onRetry={onRetry}
        />
      )

      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument()
    })

    it('does not render retry button when onRetry is not provided', () => {
      render(
        <ErrorDisplay
          error={mockError}
          severity="error"
        />
      )

      expect(screen.queryByRole('button', { name: /retry/i })).not.toBeInTheDocument()
    })

    it('calls onRetry when retry button is clicked', async () => {
      const user = userEvent.setup({ delay: null })
      const onRetry = vi.fn()

      render(
        <ErrorDisplay
          error={mockError}
          severity="error"
          onRetry={onRetry}
        />
      )

      const retryButton = screen.getByRole('button', { name: /retry/i })
      await user.click(retryButton)

      expect(onRetry).toHaveBeenCalledTimes(1)
    })
  })

  describe('Dismiss Functionality', () => {
    it('renders dismiss button when onDismiss is provided', () => {
      const onDismiss = vi.fn()

      render(
        <ErrorDisplay
          error={mockError}
          severity="error"
          onDismiss={onDismiss}
        />
      )

      expect(screen.getByRole('button', { name: /dismiss/i })).toBeInTheDocument()
    })

    it('does not render dismiss button when onDismiss is not provided', () => {
      render(
        <ErrorDisplay
          error={mockError}
          severity="error"
        />
      )

      expect(screen.queryByRole('button', { name: /dismiss/i })).not.toBeInTheDocument()
    })

    it('calls onDismiss when dismiss button is clicked', async () => {
      const user = userEvent.setup({ delay: null })
      const onDismiss = vi.fn()

      render(
        <ErrorDisplay
          error={mockError}
          severity="error"
          onDismiss={onDismiss}
        />
      )

      const dismissButton = screen.getByRole('button', { name: /dismiss/i })
      await user.click(dismissButton)

      // Wait for animation
      vi.advanceTimersByTime(300)

      await waitFor(() => {
        expect(onDismiss).toHaveBeenCalledTimes(1)
      })
    })
  })

  describe('Collapsible Technical Details', () => {
    it('renders show details button when technical details exist', () => {
      render(
        <ErrorDisplay
          error={mockError}
          severity="error"
        />
      )

      expect(screen.getByRole('button', { name: /show details/i })).toBeInTheDocument()
    })

    it('does not render details button when no technical details', () => {
      const errorWithoutDetails: ConversionError = {
        ...mockError,
        technicalDetails: undefined,
      }

      render(
        <ErrorDisplay
          error={errorWithoutDetails}
          severity="error"
        />
      )

      expect(screen.queryByRole('button', { name: /show details/i })).not.toBeInTheDocument()
    })

    it('expands technical details when button is clicked', async () => {
      const user = userEvent.setup({ delay: null })

      render(
        <ErrorDisplay
          error={mockError}
          severity="error"
        />
      )

      const showButton = screen.getByRole('button', { name: /show details/i })
      expect(showButton).toHaveAttribute('aria-expanded', 'false')

      await user.click(showButton)

      expect(screen.getByText(/Stack trace/)).toBeInTheDocument()
      expect(screen.getByText(/Error Code: TEST_ERROR/)).toBeInTheDocument()
      expect(showButton).toHaveAttribute('aria-expanded', 'true')
      expect(screen.getByRole('button', { name: /hide details/i })).toBeInTheDocument()
    })

    it('collapses technical details when hide button is clicked', async () => {
      const user = userEvent.setup({ delay: null })

      render(
        <ErrorDisplay
          error={mockError}
          severity="error"
        />
      )

      // Expand
      const showButton = screen.getByRole('button', { name: /show details/i })
      await user.click(showButton)

      expect(screen.getByText(/Stack trace/)).toBeInTheDocument()

      // Collapse
      const hideButton = screen.getByRole('button', { name: /hide details/i })
      await user.click(hideButton)

      expect(screen.queryByText(/Stack trace/)).not.toBeInTheDocument()
      expect(hideButton).toHaveAttribute('aria-expanded', 'false')
    })
  })

  describe('Auto-dismiss for Info Messages', () => {
    it('auto-dismisses info messages after 5 seconds', async () => {
      const onDismiss = vi.fn()

      render(
        <ErrorDisplay
          error={mockError}
          severity="info"
          onDismiss={onDismiss}
        />
      )

      expect(onDismiss).not.toHaveBeenCalled()

      // Fast-forward 5 seconds + animation time
      vi.advanceTimersByTime(5300)

      await waitFor(() => {
        expect(onDismiss).toHaveBeenCalledTimes(1)
      })
    })

    it('does not auto-dismiss error messages', async () => {
      const onDismiss = vi.fn()

      render(
        <ErrorDisplay
          error={mockError}
          severity="error"
          onDismiss={onDismiss}
        />
      )

      vi.advanceTimersByTime(10000)

      await waitFor(() => {
        expect(onDismiss).not.toHaveBeenCalled()
      })
    })

    it('does not auto-dismiss warning messages', async () => {
      const onDismiss = vi.fn()

      render(
        <ErrorDisplay
          error={mockError}
          severity="warning"
          onDismiss={onDismiss}
        />
      )

      vi.advanceTimersByTime(10000)

      await waitFor(() => {
        expect(onDismiss).not.toHaveBeenCalled()
      })
    })

    it('does not auto-dismiss if onDismiss is not provided', async () => {
      render(
        <ErrorDisplay
          error={mockError}
          severity="info"
        />
      )

      // Should not throw error
      vi.advanceTimersByTime(10000)

      expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA role', () => {
      render(
        <ErrorDisplay
          error={mockError}
          severity="error"
        />
      )

      expect(screen.getByRole('alert')).toBeInTheDocument()
    })

    it('has aria-atomic attribute', () => {
      render(
        <ErrorDisplay
          error={mockError}
          severity="error"
        />
      )

      const alert = screen.getByRole('alert')
      expect(alert).toHaveAttribute('aria-atomic', 'true')
    })

    it('provides screen reader announcement', () => {
      render(
        <ErrorDisplay
          error={mockError}
          severity="error"
        />
      )

      const srText = screen.getByText(/Error: Something went wrong/i)
      expect(srText).toHaveClass('sr-only')
    })

    it('has accessible button labels', () => {
      const onRetry = vi.fn()
      const onDismiss = vi.fn()

      render(
        <ErrorDisplay
          error={mockError}
          severity="error"
          onRetry={onRetry}
          onDismiss={onDismiss}
        />
      )

      expect(screen.getByRole('button', { name: /retry operation/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /dismiss message/i })).toBeInTheDocument()
    })

    it('technical details section has proper aria-controls', async () => {
      const user = userEvent.setup({ delay: null })

      render(
        <ErrorDisplay
          error={mockError}
          severity="error"
        />
      )

      const toggleButton = screen.getByRole('button', { name: /show details/i })
      expect(toggleButton).toHaveAttribute('aria-controls', 'technical-details')

      await user.click(toggleButton)

      const detailsSection = screen.getByText(/Stack trace/).closest('div')
      expect(detailsSection).toHaveAttribute('id', 'technical-details')
    })
  })

  describe('Edge Cases', () => {
    it('handles error without technical details', () => {
      const simpleError: ConversionError = {
        code: 'SIMPLE_ERROR',
        message: 'Simple error',
        userMessage: 'An error occurred',
        suggestedAction: 'Try again',
      }

      render(
        <ErrorDisplay
          error={simpleError}
          severity="error"
        />
      )

      expect(screen.getByText('An error occurred')).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /show details/i })).not.toBeInTheDocument()
    })

    it('applies custom className', () => {
      render(
        <ErrorDisplay
          error={mockError}
          severity="error"
          className="custom-class"
        />
      )

      const alert = screen.getByRole('alert')
      expect(alert).toHaveClass('custom-class')
    })

    it('handles long error messages', () => {
      const longError: ConversionError = {
        code: 'LONG_ERROR',
        message: 'Technical message',
        userMessage: 'This is a very long error message that should wrap properly and not break the layout or cause any visual issues',
        suggestedAction: 'This is a very long suggested action that should also wrap properly and remain readable',
      }

      render(
        <ErrorDisplay
          error={longError}
          severity="error"
        />
      )

      expect(screen.getByText(longError.userMessage)).toBeInTheDocument()
      expect(screen.getByText(longError.suggestedAction)).toBeInTheDocument()
    })
  })

  describe('Unsupported File Type Error (Requirement 12.1)', () => {
    it('displays supported formats in error message', () => {
      const fileTypeError: ConversionError = {
        code: 'INVALID_FORMAT',
        message: 'Unsupported file type',
        userMessage: 'This file type is not supported',
        suggestedAction: 'Please use one of these formats: PDF, DOCX, TXT, JPG, PNG',
      }

      render(
        <ErrorDisplay
          error={fileTypeError}
          severity="error"
        />
      )

      expect(screen.getByText(/PDF, DOCX, TXT, JPG, PNG/)).toBeInTheDocument()
    })
  })
})
