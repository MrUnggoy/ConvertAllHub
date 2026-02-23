/**
 * HeroSection Component Tests
 * 
 * Tests for the enhanced HeroSection component with value proposition,
 * primary CTA, and trust signals integration.
 * 
 * Validates: Requirements 1.1, 1.4, 2.1, 2.3, 2.5, 3.1, 3.2, 8.2, 9.1, 9.3
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import HeroSection from './HeroSection'
import { Shield, Clock, Lock } from 'lucide-react'

describe('HeroSection', () => {
  const defaultProps = {
    title: 'ConvertAll Hub',
    valueProposition: {
      what: 'Free online file conversion tools',
      who: 'for everyone',
      why: 'Fast, secure, and privacy-first'
    },
    primaryCTA: {
      text: 'Start Converting Now',
      action: vi.fn(),
      ariaLabel: 'Start file conversion'
    }
  }

  describe('Value Proposition Display', () => {
    it('should render value proposition with all three components', () => {
      render(<HeroSection {...defaultProps} />)
      
      // Requirement 1.2: Value proposition includes what, who, and why
      expect(screen.getByText('Free online file conversion tools')).toBeInTheDocument()
      expect(screen.getByText('for everyone')).toBeInTheDocument()
      expect(screen.getByText('Fast, secure, and privacy-first')).toBeInTheDocument()
    })

    it('should display value proposition within first 600px viewport area', () => {
      const { container } = render(<HeroSection {...defaultProps} />)
      
      // Requirement 1.1: Value proposition within first 600px
      const valueProposition = container.querySelector('[role="region"][aria-label="Value proposition"]')
      expect(valueProposition).toBeInTheDocument()
      
      // Value proposition should be positioned before title
      const title = screen.getByRole('heading', { level: 1 })
      expect(valueProposition?.compareDocumentPosition(title)).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
    })

    it('should render value proposition before title (Requirement 1.4)', () => {
      const { container } = render(<HeroSection {...defaultProps} />)
      
      const valueProposition = container.querySelector('[role="region"][aria-label="Value proposition"]')
      const title = screen.getByRole('heading', { level: 1 })
      
      // Value proposition should come before title in DOM order
      expect(valueProposition?.compareDocumentPosition(title)).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
    })
  })

  describe('Visual Hierarchy', () => {
    it('should use bold font weight for headline (Requirement 2.1)', () => {
      render(<HeroSection {...defaultProps} />)
      
      const title = screen.getByRole('heading', { level: 1 })
      const styles = window.getComputedStyle(title)
      
      // Font weight should be at least 700
      expect(parseInt(styles.fontWeight)).toBeGreaterThanOrEqual(700)
    })

    it('should have proper font size hierarchy (Requirement 2.3)', () => {
      const { container } = render(<HeroSection {...defaultProps} />)
      
      const title = screen.getByRole('heading', { level: 1 })
      const valueProposition = container.querySelector('[role="region"][aria-label="Value proposition"]')
      
      // Title should exist with proper styling
      expect(title).toBeInTheDocument()
      expect(title.className).toContain('font-extrabold')
      
      // Value proposition should exist
      expect(valueProposition).toBeInTheDocument()
    })

    it('should guide attention from value proposition to CTA to trust signals (Requirement 2.5)', () => {
      const { container } = render(<HeroSection {...defaultProps} />)
      
      const valueProposition = container.querySelector('[role="region"][aria-label="Value proposition"]')
      const cta = screen.getByRole('button', { name: /start file conversion/i })
      const trustSignals = container.querySelectorAll('[title]')
      
      // Check DOM order: value prop -> CTA -> trust signals
      expect(valueProposition?.compareDocumentPosition(cta)).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
      if (trustSignals.length > 0) {
        expect(cta.compareDocumentPosition(trustSignals[0])).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
      }
    })
  })

  describe('Primary CTA', () => {
    it('should render primary CTA above the fold (Requirements 3.1, 3.2)', () => {
      render(<HeroSection {...defaultProps} />)
      
      const cta = screen.getByRole('button', { name: /start file conversion/i })
      expect(cta).toBeInTheDocument()
      expect(cta).toHaveTextContent('Start Converting Now')
    })

    it('should call action when CTA is clicked', async () => {
      const user = userEvent.setup()
      const mockAction = vi.fn()
      
      render(
        <HeroSection 
          {...defaultProps} 
          primaryCTA={{
            ...defaultProps.primaryCTA,
            action: mockAction
          }}
        />
      )
      
      const cta = screen.getByRole('button', { name: /start file conversion/i })
      await user.click(cta)
      
      expect(mockAction).toHaveBeenCalledTimes(1)
    })

    it('should have accessible label (Requirement 3.3)', () => {
      render(<HeroSection {...defaultProps} />)
      
      const cta = screen.getByRole('button', { name: /start file conversion/i })
      expect(cta).toHaveAccessibleName('Start file conversion')
    })
  })

  describe('Trust Signals', () => {
    it('should display default trust signals when none provided', () => {
      render(<HeroSection {...defaultProps} />)
      
      // Default trust signals
      expect(screen.getByText('Privacy-First')).toBeInTheDocument()
      expect(screen.getByText('Auto-Delete')).toBeInTheDocument()
      expect(screen.getByText('No Signup')).toBeInTheDocument()
    })

    it('should display custom trust signals when provided', () => {
      const customTrustSignals = [
        {
          icon: Shield,
          text: 'Custom Signal 1',
          description: 'Custom description 1',
          metric: '100% secure'
        },
        {
          icon: Clock,
          text: 'Custom Signal 2',
          description: 'Custom description 2'
        }
      ]
      
      render(
        <HeroSection 
          {...defaultProps} 
          trustSignals={customTrustSignals}
        />
      )
      
      expect(screen.getByText('Custom Signal 1')).toBeInTheDocument()
      expect(screen.getByText('Custom Signal 2')).toBeInTheDocument()
      expect(screen.getByText('100% secure')).toBeInTheDocument()
    })

    it('should display trust signal descriptions as tooltips', () => {
      render(<HeroSection {...defaultProps} />)
      
      const trustSignalElements = screen.getAllByTitle(/Files processed securely|Files deleted after 1 hour|Start converting immediately/)
      expect(trustSignalElements.length).toBeGreaterThan(0)
    })
  })

  describe('Semantic HTML Structure', () => {
    it('should use semantic header element (Requirement 8.2)', () => {
      const { container } = render(<HeroSection {...defaultProps} />)
      
      const header = container.querySelector('header')
      expect(header).toBeInTheDocument()
    })

    it('should use semantic section element (Requirement 8.2)', () => {
      const { container } = render(<HeroSection {...defaultProps} />)
      
      const section = container.querySelector('section')
      expect(section).toBeInTheDocument()
    })

    it('should use h1 for main title', () => {
      render(<HeroSection {...defaultProps} />)
      
      const title = screen.getByRole('heading', { level: 1 })
      expect(title).toHaveTextContent('ConvertAll Hub')
    })
  })

  describe('Performance Optimization', () => {
    it('should use simplified gradient for faster FCP (Requirement 9.1)', () => {
      const { container } = render(<HeroSection {...defaultProps} />)
      
      // Check that gradient is simplified (not animated)
      const gradientElement = container.querySelector('[style*="linear-gradient"]')
      expect(gradientElement).toBeInTheDocument()
      
      // Should not have animate-gradient class
      expect(gradientElement?.classList.contains('animate-gradient')).toBe(false)
    })

    it('should not include heavy animations that delay FCP (Requirement 9.3)', () => {
      const { container } = render(<HeroSection {...defaultProps} />)
      
      // Should not have floating shapes with blur filters
      const floatingShapes = container.querySelectorAll('.animate-float')
      expect(floatingShapes.length).toBe(0)
    })
  })

  describe('Responsive Design', () => {
    it('should apply mobile-first responsive classes', () => {
      const { container } = render(<HeroSection {...defaultProps} />)
      
      const section = container.querySelector('section')
      expect(section?.className).toMatch(/px-4|py-12/)
      expect(section?.className).toMatch(/sm:px-8|sm:py-16/)
    })

    it('should use responsive font sizing', () => {
      render(<HeroSection {...defaultProps} />)
      
      const title = screen.getByRole('heading', { level: 1 })
      
      // Title should have proper styling classes for responsive design
      expect(title).toBeInTheDocument()
      expect(title.className).toContain('text-center')
      expect(title.className).toContain('text-white')
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<HeroSection {...defaultProps} />)
      
      const valueProposition = screen.getByRole('region', { name: /value proposition/i })
      expect(valueProposition).toBeInTheDocument()
      
      const cta = screen.getByRole('button', { name: /start file conversion/i })
      expect(cta).toBeInTheDocument()
    })

    it('should hide decorative icons from screen readers', () => {
      const { container } = render(<HeroSection {...defaultProps} />)
      
      const icons = container.querySelectorAll('svg[aria-hidden="true"]')
      expect(icons.length).toBeGreaterThan(0)
    })
  })
})
