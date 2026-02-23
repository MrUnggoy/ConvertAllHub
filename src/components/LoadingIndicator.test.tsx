/**
 * LoadingIndicator Component Tests
 * 
 * Tests for the LoadingIndicator component including:
 * - Delay timing (1-second delay before display)
 * - Different indicator types (spinner, skeleton, progress)
 * - Accessibility features (ARIA attributes, screen reader announcements)
 * - Size variations
 * - Progress bar functionality
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import { LoadingIndicator } from './LoadingIndicator'

describe('LoadingIndicator', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Delay Timing (Requirement 9.5)', () => {
    it('does not display immediately', () => {
      render(<LoadingIndicator type="spinner" message="Loading..." />)
      
      // Should not be visible immediately
      expect(screen.queryByRole('status')).not.toBeInTheDocument()
    })

    it('displays after 1 second delay by default', async () => {
      render(<LoadingIndicator type="spinner" message="Loading..." />)
      
      // Fast-forward time by 1 second
      act(() => {
        vi.advanceTimersByTime(1000)
      })
      
      // Should now be visible
      await waitFor(() => {
        expect(screen.getByRole('status')).toBeInTheDocument()
      })
    })

    it('respects custom delay prop', async () => {
      render(<LoadingIndicator type="spinner" message="Loading..." delay={500} />)
      
      // Should not be visible at 400ms
      act(() => {
        vi.advanceTimersByTime(400)
      })
      expect(screen.queryByRole('status')).not.toBeInTheDocument()
      
      // Should be visible at 500ms
      act(() => {
        vi.advanceTimersByTime(100)
      })
      await waitFor(() => {
        expect(screen.getByRole('status')).toBeInTheDocument()
      })
    })

    it('cleans up timer on unmount', () => {
      const { unmount } = render(<LoadingIndicator type="spinner" />)
      
      // Unmount before delay completes
      unmount()
      
      // Advance timers - should not throw error
      vi.advanceTimersByTime(1000)
    })
  })

  describe('Spinner Type', () => {
    it('renders spinner with message', async () => {
      render(<LoadingIndicator type="spinner" message="Loading data..." />)
      
      // Advance timers to skip delay
      act(() => {
        vi.advanceTimersByTime(1000)
      })
      
      await waitFor(() => {
        expect(screen.getByRole('status')).toBeInTheDocument()
        expect(screen.getByText('Loading data...')).toBeInTheDocument()
      })
    })

    it('renders spinner without message', async () => {
      render(<LoadingIndicator type="spinner" />)
      
      // Advance timers to skip delay
      act(() => {
        vi.advanceTimersByTime(1000)
      })
      
      await waitFor(() => {
        expect(screen.getByRole('status')).toBeInTheDocument()
        // Should have default screen reader text
        expect(screen.getByText('Loading, please wait...')).toBeInTheDocument()
      })
    })

    it('applies correct size classes', async () => {
      const { rerender } = render(<LoadingIndicator type="spinner" size="small" />)
      act(() => {
        vi.advanceTimersByTime(1000)
      })
      
      await waitFor(() => {
        const spinner = screen.getByRole('status').querySelector('svg')
        expect(spinner?.classList.contains('h-4')).toBe(true)
      })
      
      rerender(<LoadingIndicator type="spinner" size="large" />)
      await waitFor(() => {
        const spinner = screen.getByRole('status').querySelector('svg')
        expect(spinner?.classList.contains('h-12')).toBe(true)
      })
    })
  })

  describe('Skeleton Type', () => {
    it('renders skeleton structure', async () => {
      render(<LoadingIndicator type="skeleton" />)
      
      // Advance timers to skip delay
      act(() => {
        vi.advanceTimersByTime(1000)
      })
      
      await waitFor(() => {
        const status = screen.getByRole('status')
        expect(status).toBeInTheDocument()
        
        // Check for skeleton elements with loading-skeleton class
        const skeletons = status.querySelectorAll('.loading-skeleton')
        expect(skeletons.length).toBeGreaterThan(0)
      })
    })

    it('renders skeleton with message', async () => {
      render(<LoadingIndicator type="skeleton" message="Loading content..." />)
      
      // Advance timers to skip delay
      act(() => {
        vi.advanceTimersByTime(1000)
      })
      
      await waitFor(() => {
        expect(screen.getByText('Loading content...')).toBeInTheDocument()
      })
    })

    it('applies correct size classes', async () => {
      const { rerender } = render(<LoadingIndicator type="skeleton" size="small" />)
      act(() => {
        vi.advanceTimersByTime(1000)
      })
      
      await waitFor(() => {
        const container = screen.getByRole('status').querySelector('.h-20')
        expect(container).toBeInTheDocument()
      })
      
      rerender(<LoadingIndicator type="skeleton" size="large" />)
      await waitFor(() => {
        const container = screen.getByRole('status').querySelector('.h-60')
        expect(container).toBeInTheDocument()
      })
    })
  })

  describe('Progress Type', () => {
    it('renders progress bar with percentage', async () => {
      render(<LoadingIndicator type="progress" progress={45} />)
      
      // Advance timers to skip delay
      act(() => {
        vi.advanceTimersByTime(1000)
      })
      
      await waitFor(() => {
        expect(screen.getByRole('status')).toBeInTheDocument()
        expect(screen.getByText('45%')).toBeInTheDocument()
      })
    })

    it('renders progress bar with message', async () => {
      render(<LoadingIndicator type="progress" progress={60} message="Converting file..." />)
      
      // Advance timers to skip delay
      act(() => {
        vi.advanceTimersByTime(1000)
      })
      
      await waitFor(() => {
        expect(screen.getByText('Converting file...')).toBeInTheDocument()
        expect(screen.getByText('60%')).toBeInTheDocument()
      })
    })

    it('clamps progress to 0-100 range', async () => {
      const { rerender } = render(<LoadingIndicator type="progress" progress={-10} />)
      act(() => {
        vi.advanceTimersByTime(1000)
      })
      
      await waitFor(() => {
        expect(screen.getByText('0%')).toBeInTheDocument()
      })
      
      rerender(<LoadingIndicator type="progress" progress={150} />)
      await waitFor(() => {
        expect(screen.getByText('100%')).toBeInTheDocument()
      })
    })

    it('applies correct width to progress bar', async () => {
      render(<LoadingIndicator type="progress" progress={75} />)
      act(() => {
        vi.advanceTimersByTime(1000)
      })
      
      await waitFor(() => {
        const progressBar = screen.getByRole('status').querySelector('.bg-gradient-primary')
        expect(progressBar).toHaveStyle({ width: '75%' })
      })
    })
  })

  describe('Accessibility (Requirements 8.2, 8.4)', () => {
    it('has role="status" for all types', async () => {
      const { rerender } = render(<LoadingIndicator type="spinner" />)
      
      // Advance timers to skip delay
      act(() => {
        vi.advanceTimersByTime(1000)
      })
      
      await waitFor(() => {
        expect(screen.getByRole('status')).toBeInTheDocument()
      })
      
      rerender(<LoadingIndicator type="skeleton" />)
      await waitFor(() => {
        expect(screen.getByRole('status')).toBeInTheDocument()
      })
      
      rerender(<LoadingIndicator type="progress" progress={50} />)
      await waitFor(() => {
        expect(screen.getByRole('status')).toBeInTheDocument()
      })
    })

    it('has aria-live="polite" for screen reader announcements', async () => {
      render(<LoadingIndicator type="spinner" />)
      
      // Advance timers to skip delay
      act(() => {
        vi.advanceTimersByTime(1000)
      })
      
      await waitFor(() => {
        const status = screen.getByRole('status')
        expect(status).toHaveAttribute('aria-live', 'polite')
      })
    })

    it('has aria-busy="true" during loading', async () => {
      render(<LoadingIndicator type="spinner" />)
      
      // Advance timers to skip delay
      act(() => {
        vi.advanceTimersByTime(1000)
      })
      
      await waitFor(() => {
        const status = screen.getByRole('status')
        expect(status).toHaveAttribute('aria-busy', 'true')
      })
    })

    it('provides screen reader text for spinner', async () => {
      render(<LoadingIndicator type="spinner" message="Loading data..." />)
      
      // Advance timers to skip delay
      act(() => {
        vi.advanceTimersByTime(1000)
      })
      
      await waitFor(() => {
        // Check for sr-only text
        expect(screen.getByText('Loading data...')).toBeInTheDocument()
      })
    })

    it('provides screen reader text for progress', async () => {
      render(<LoadingIndicator type="progress" progress={45} message="Converting" />)
      
      // Advance timers to skip delay
      act(() => {
        vi.advanceTimersByTime(1000)
      })
      
      await waitFor(() => {
        // Check for screen reader announcement with percentage
        const srText = screen.getByText(/Converting, 45 percent complete/)
        expect(srText).toBeInTheDocument()
      })
    })

    it('hides decorative elements from screen readers', async () => {
      render(<LoadingIndicator type="spinner" />)
      
      // Advance timers to skip delay
      act(() => {
        vi.advanceTimersByTime(1000)
      })
      
      await waitFor(() => {
        const spinner = screen.getByRole('status').querySelector('svg')
        expect(spinner).toHaveAttribute('aria-hidden', 'true')
      })
    })
  })

  describe('Animation', () => {
    it('applies fade-in animation class', async () => {
      render(<LoadingIndicator type="spinner" />)
      
      // Advance timers to skip delay
      act(() => {
        vi.advanceTimersByTime(1000)
      })
      
      await waitFor(() => {
        const status = screen.getByRole('status')
        expect(status.className).toContain('animate-fade-in')
      })
    })

    it('applies spin animation to spinner', async () => {
      render(<LoadingIndicator type="spinner" />)
      
      // Advance timers to skip delay
      act(() => {
        vi.advanceTimersByTime(1000)
      })
      
      await waitFor(() => {
        const spinner = screen.getByRole('status').querySelector('svg')
        expect(spinner?.classList.contains('animate-spin')).toBe(true)
      })
    })
  })

  describe('Custom Styling', () => {
    it('applies custom className', async () => {
      render(<LoadingIndicator type="spinner" className="custom-class" />)
      
      // Advance timers to skip delay
      act(() => {
        vi.advanceTimersByTime(1000)
      })
      
      await waitFor(() => {
        const status = screen.getByRole('status')
        expect(status.className).toContain('custom-class')
      })
    })
  })
})
