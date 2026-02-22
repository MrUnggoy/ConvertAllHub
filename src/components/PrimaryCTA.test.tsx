/**
 * PrimaryCTA Component Tests
 * 
 * Tests for accessibility, styling, and functionality requirements.
 * Validates: Requirements 2.2, 2.4, 3.3, 3.4, 8.5, 11.4, 11.5
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Upload, Download } from 'lucide-react'
import { PrimaryCTA } from './PrimaryCTA'

describe('PrimaryCTA Component', () => {
  describe('Basic Rendering', () => {
    it('renders with text prop', () => {
      render(<PrimaryCTA text="Click Me" />)
      expect(screen.getByRole('button', { name: 'Click Me' })).toBeInTheDocument()
    })

    it('renders with children instead of text prop', () => {
      render(<PrimaryCTA>Click Me</PrimaryCTA>)
      expect(screen.getByRole('button', { name: 'Click Me' })).toBeInTheDocument()
    })

    it('renders with custom aria-label', () => {
      render(<PrimaryCTA text="Upload" ariaLabel="Upload your file" />)
      expect(screen.getByRole('button', { name: 'Upload your file' })).toBeInTheDocument()
    })
  })

  describe('Variants - Requirement 2.4 (Visual Distinction)', () => {
    it('renders primary variant with gradient background', () => {
      render(<PrimaryCTA text="Primary" variant="primary" />)
      const button = screen.getByRole('button')
      
      // Check for gradient classes
      expect(button.className).toContain('bg-gradient-to-r')
      expect(button.className).toContain('from-primary-500')
      expect(button.className).toContain('to-secondary-500')
    })

    it('renders secondary variant with outline style', () => {
      render(<PrimaryCTA text="Secondary" variant="secondary" />)
      const button = screen.getByRole('button')
      
      // Check for outline classes
      expect(button.className).toContain('border-2')
      expect(button.className).toContain('border-primary-500')
      expect(button.className).toContain('bg-transparent')
    })

    it('primary and secondary variants have different visual properties', () => {
      const { rerender } = render(<PrimaryCTA text="Test" variant="primary" />)
      const primaryButton = screen.getByRole('button')
      const primaryClasses = primaryButton.className

      rerender(<PrimaryCTA text="Test" variant="secondary" />)
      const secondaryButton = screen.getByRole('button')
      const secondaryClasses = secondaryButton.className

      // Verify they have different styling
      expect(primaryClasses).not.toBe(secondaryClasses)
      expect(primaryClasses).toContain('bg-gradient-to-r')
      expect(secondaryClasses).toContain('border-2')
    })
  })

  describe('Sizes - Requirement 3.4 (44x44px Minimum Touch Target)', () => {
    it('small size meets 44x44px minimum', () => {
      render(<PrimaryCTA text="Small" size="small" />)
      const button = screen.getByRole('button')
      
      expect(button.className).toContain('min-h-[44px]')
      expect(button.className).toContain('min-w-[44px]')
    })

    it('medium size exceeds minimum', () => {
      render(<PrimaryCTA text="Medium" size="medium" />)
      const button = screen.getByRole('button')
      
      expect(button.className).toContain('min-h-[48px]')
      expect(button.className).toContain('min-w-[48px]')
    })

    it('large size exceeds minimum', () => {
      render(<PrimaryCTA text="Large" size="large" />)
      const button = screen.getByRole('button')
      
      expect(button.className).toContain('min-h-[56px]')
      expect(button.className).toContain('min-w-[56px]')
    })
  })

  describe('Icon Support', () => {
    it('renders with icon', () => {
      render(<PrimaryCTA text="Upload" icon={Upload} />)
      const button = screen.getByRole('button')
      
      // Icon should be present
      const icon = button.querySelector('svg')
      expect(icon).toBeInTheDocument()
      expect(icon).toHaveAttribute('aria-hidden', 'true')
    })

    it('does not render icon when loading', () => {
      render(<PrimaryCTA text="Upload" icon={Upload} loading={true} />)
      const button = screen.getByRole('button')
      
      // Should have spinner, not the upload icon
      const icons = button.querySelectorAll('svg')
      expect(icons.length).toBe(1) // Only spinner
    })
  })

  describe('Loading State', () => {
    it('shows loading spinner when loading', () => {
      render(<PrimaryCTA text="Loading" loading={true} />)
      const button = screen.getByRole('button')
      
      // Check for spinner
      const spinner = button.querySelector('svg')
      expect(spinner).toBeInTheDocument()
      expect(spinner?.classList.contains('animate-spin')).toBe(true)
    })

    it('sets aria-busy when loading', () => {
      render(<PrimaryCTA text="Loading" loading={true} />)
      const button = screen.getByRole('button')
      
      expect(button).toHaveAttribute('aria-busy', 'true')
    })

    it('disables button when loading', () => {
      render(<PrimaryCTA text="Loading" loading={true} />)
      const button = screen.getByRole('button')
      
      expect(button).toBeDisabled()
    })
  })

  describe('Disabled State', () => {
    it('disables button when disabled prop is true', () => {
      render(<PrimaryCTA text="Disabled" disabled={true} />)
      const button = screen.getByRole('button')
      
      expect(button).toBeDisabled()
    })

    it('applies disabled styling', () => {
      render(<PrimaryCTA text="Disabled" disabled={true} />)
      const button = screen.getByRole('button')
      
      expect(button.className).toContain('disabled:opacity-50')
      expect(button.className).toContain('disabled:cursor-not-allowed')
    })
  })

  describe('Accessibility - Requirement 8.5 (Focus Indicators)', () => {
    it('has focus-visible styles', () => {
      render(<PrimaryCTA text="Focus Test" />)
      const button = screen.getByRole('button')
      
      // Check for focus indicator classes
      expect(button.className).toContain('focus-visible:outline-none')
      expect(button.className).toContain('focus-visible:ring-2')
      expect(button.className).toContain('focus-visible:ring-offset-2')
      expect(button.className).toContain('focus-visible:ring-primary-500')
    })

    it('is keyboard accessible', async () => {
      const handleClick = vi.fn()
      render(<PrimaryCTA text="Keyboard Test" onClick={handleClick} />)
      
      const button = screen.getByRole('button')
      button.focus()
      
      expect(button).toHaveFocus()
    })
  })

  describe('Interactive States - Requirement 11.5 (Hover and Active States)', () => {
    it('has hover state styles for primary variant', () => {
      render(<PrimaryCTA text="Hover" variant="primary" />)
      const button = screen.getByRole('button')
      
      expect(button.className).toContain('hover:shadow-lg')
      expect(button.className).toContain('hover:-translate-y-0.5')
    })

    it('has hover state styles for secondary variant', () => {
      render(<PrimaryCTA text="Hover" variant="secondary" />)
      const button = screen.getByRole('button')
      
      expect(button.className).toContain('hover:bg-primary-50')
      expect(button.className).toContain('hover:shadow-md')
    })

    it('has active state styles', () => {
      render(<PrimaryCTA text="Active" />)
      const button = screen.getByRole('button')
      
      expect(button.className).toContain('active:scale-[0.98]')
      expect(button.className).toContain('active:translate-y-0')
    })
  })

  describe('Click Handling', () => {
    it('calls onClick handler when clicked', async () => {
      const handleClick = vi.fn()
      const user = userEvent.setup()
      
      render(<PrimaryCTA text="Click Me" onClick={handleClick} />)
      const button = screen.getByRole('button')
      
      await user.click(button)
      
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('does not call onClick when disabled', async () => {
      const handleClick = vi.fn()
      const user = userEvent.setup()
      
      render(<PrimaryCTA text="Click Me" onClick={handleClick} disabled={true} />)
      const button = screen.getByRole('button')
      
      await user.click(button)
      
      expect(handleClick).not.toHaveBeenCalled()
    })

    it('does not call onClick when loading', async () => {
      const handleClick = vi.fn()
      const user = userEvent.setup()
      
      render(<PrimaryCTA text="Click Me" onClick={handleClick} loading={true} />)
      const button = screen.getByRole('button')
      
      await user.click(button)
      
      expect(handleClick).not.toHaveBeenCalled()
    })
  })

  describe('Custom Styling - Requirement 11.4 (Consistent Styling)', () => {
    it('accepts custom className', () => {
      render(<PrimaryCTA text="Custom" className="custom-class" />)
      const button = screen.getByRole('button')
      
      expect(button.className).toContain('custom-class')
    })

    it('maintains base styling with custom className', () => {
      render(<PrimaryCTA text="Custom" className="custom-class" />)
      const button = screen.getByRole('button')
      
      // Should still have base classes
      expect(button.className).toContain('inline-flex')
      expect(button.className).toContain('items-center')
      expect(button.className).toContain('justify-center')
    })
  })

  describe('Contrast Requirements - Requirement 2.2', () => {
    it('primary variant uses high contrast colors', () => {
      render(<PrimaryCTA text="Contrast" variant="primary" />)
      const button = screen.getByRole('button')
      
      // Primary uses white text on gradient background
      expect(button.className).toContain('text-white')
      expect(button.className).toContain('bg-gradient-to-r')
    })

    it('secondary variant uses high contrast colors', () => {
      render(<PrimaryCTA text="Contrast" variant="secondary" />)
      const button = screen.getByRole('button')
      
      // Secondary uses dark text on light/transparent background
      expect(button.className).toContain('text-primary-700')
      expect(button.className).toContain('border-primary-500')
    })
  })

  describe('Touch Optimization', () => {
    it('has touch-manipulation class', () => {
      render(<PrimaryCTA text="Touch" />)
      const button = screen.getByRole('button')
      
      expect(button.className).toContain('touch-manipulation')
    })

    it('prevents text selection', () => {
      render(<PrimaryCTA text="No Select" />)
      const button = screen.getByRole('button')
      
      expect(button.className).toContain('select-none')
    })
  })
})
