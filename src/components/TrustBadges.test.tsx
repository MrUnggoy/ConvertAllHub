import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import TrustBadges, { TrustBadge } from './TrustBadges'
import { Shield, Lock } from 'lucide-react'

// Mock IntersectionObserver
class MockIntersectionObserver {
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
}

global.IntersectionObserver = MockIntersectionObserver as any

describe('TrustBadges', () => {
  describe('Default Badges', () => {
    it('renders all 6 default badges', () => {
      render(<TrustBadges />)
      
      expect(screen.getByText('100% Free')).toBeInTheDocument()
      expect(screen.getByText('No Signup Required')).toBeInTheDocument()
      expect(screen.getByText('Privacy-First')).toBeInTheDocument()
      expect(screen.getByText('Auto-Delete')).toBeInTheDocument()
      expect(screen.getByText('Secure')).toBeInTheDocument()
      expect(screen.getByText('10,000+ Conversions')).toBeInTheDocument()
    })

    it('displays descriptions for default badges', () => {
      render(<TrustBadges />)
      
      expect(screen.getByText('No hidden costs, no credit card required')).toBeInTheDocument()
      expect(screen.getByText('Start converting immediately')).toBeInTheDocument()
      expect(screen.getByText('Files processed client-side when possible')).toBeInTheDocument()
      expect(screen.getByText('Files deleted after 1 hour')).toBeInTheDocument()
      expect(screen.getByText('256-bit encryption for uploads')).toBeInTheDocument()
      expect(screen.getByText('Trusted by users worldwide')).toBeInTheDocument()
    })
  })

  describe('Custom Badges', () => {
    it('renders custom badges when provided', () => {
      const customBadges: TrustBadge[] = [
        {
          icon: Shield,
          text: 'Custom Badge',
          description: 'Custom description',
          tooltip: 'Custom tooltip'
        }
      ]
      
      render(<TrustBadges badges={customBadges} />)
      
      expect(screen.getByText('Custom Badge')).toBeInTheDocument()
      expect(screen.getByText('Custom description')).toBeInTheDocument()
    })
  })

  describe('Metrics Display', () => {
    it('displays metrics when showMetrics is true', () => {
      render(<TrustBadges showMetrics={true} />)
      
      expect(screen.getByText('10,000+')).toBeInTheDocument()
      expect(screen.getByText('Files Converted')).toBeInTheDocument()
    })

    it('hides metrics when showMetrics is false', () => {
      render(<TrustBadges showMetrics={false} />)
      
      expect(screen.queryByText('Files Converted')).not.toBeInTheDocument()
    })

    it('displays custom metrics', () => {
      const badgesWithMetrics: TrustBadge[] = [
        {
          icon: Lock,
          text: 'Test Badge',
          description: 'Test description',
          metric: {
            value: '50,000+',
            label: 'Users Served'
          }
        }
      ]
      
      render(<TrustBadges badges={badgesWithMetrics} showMetrics={true} />)
      
      expect(screen.getByText('50,000+')).toBeInTheDocument()
      expect(screen.getByText('Users Served')).toBeInTheDocument()
    })
  })

  describe('Layout Options', () => {
    it('applies horizontal layout by default', () => {
      const { container } = render(<TrustBadges />)
      const wrapper = container.firstChild as HTMLElement
      
      expect(wrapper.className).toContain('flex')
    })

    it('applies grid layout when specified', () => {
      const { container } = render(<TrustBadges layout="grid" />)
      const wrapper = container.firstChild as HTMLElement
      
      expect(wrapper.className).toContain('grid')
    })

    it('applies compact layout when specified', () => {
      const { container } = render(<TrustBadges layout="compact" />)
      const wrapper = container.firstChild as HTMLElement
      
      expect(wrapper.className).toContain('flex-wrap')
      expect(wrapper.className).toContain('gap-3')
    })

    it('hides descriptions in compact layout', () => {
      render(<TrustBadges layout="compact" />)
      
      // Badge text should be visible
      expect(screen.getByText('100% Free')).toBeInTheDocument()
      
      // Descriptions should not be visible in compact mode
      expect(screen.queryByText('No hidden costs, no credit card required')).not.toBeInTheDocument()
    })
  })

  describe('Tooltips', () => {
    it('displays tooltip on hover', async () => {
      const user = userEvent.setup()
      render(<TrustBadges />)
      
      const badge = screen.getByText('100% Free').closest('div')
      expect(badge).toBeInTheDocument()
      
      if (badge) {
        await user.hover(badge)
        
        await waitFor(() => {
          expect(screen.getByText('All conversion tools are completely free to use with no limitations')).toBeInTheDocument()
        })
      }
    })

    it('hides tooltip on mouse leave', async () => {
      const user = userEvent.setup()
      render(<TrustBadges />)
      
      const badge = screen.getByText('100% Free').closest('div')
      expect(badge).toBeInTheDocument()
      
      if (badge) {
        await user.hover(badge)
        
        await waitFor(() => {
          expect(screen.getByText('All conversion tools are completely free to use with no limitations')).toBeInTheDocument()
        })
        
        await user.unhover(badge)
        
        await waitFor(() => {
          expect(screen.queryByText('All conversion tools are completely free to use with no limitations')).not.toBeInTheDocument()
        })
      }
    })

    it('renders tooltips for all badges with tooltip property', async () => {
      const user = userEvent.setup()
      render(<TrustBadges />)
      
      const badges = [
        { text: '100% Free', tooltip: 'All conversion tools are completely free to use with no limitations' },
        { text: 'No Signup Required', tooltip: 'No account creation needed - just upload and convert' },
        { text: 'Privacy-First', tooltip: 'Your privacy is our priority - we minimize data collection' },
        { text: 'Auto-Delete', tooltip: 'All uploaded files are automatically deleted from our servers after 1 hour' },
        { text: 'Secure', tooltip: 'All file transfers use industry-standard 256-bit encryption' },
        { text: '10,000+ Conversions', tooltip: 'Join thousands of satisfied users who trust our conversion tools' }
      ]
      
      for (const badge of badges) {
        const badgeElement = screen.getByText(badge.text).closest('div')
        expect(badgeElement).toBeInTheDocument()
        
        if (badgeElement) {
          await user.hover(badgeElement)
          
          await waitFor(() => {
            expect(screen.getByText(badge.tooltip)).toBeInTheDocument()
          })
          
          await user.unhover(badgeElement)
        }
      }
    })
  })

  describe('Accessibility', () => {
    it('includes aria-label for each badge', () => {
      const { container } = render(<TrustBadges />)
      const badges = container.querySelectorAll('[aria-label]')
      
      expect(badges.length).toBeGreaterThan(0)
    })

    it('uses tooltip as aria-label when available', () => {
      const customBadges: TrustBadge[] = [
        {
          icon: Shield,
          text: 'Test',
          description: 'Description',
          tooltip: 'Tooltip text'
        }
      ]
      
      render(<TrustBadges badges={customBadges} />)
      
      const badge = screen.getByLabelText('Tooltip text')
      expect(badge).toBeInTheDocument()
    })

    it('falls back to description for aria-label when no tooltip', () => {
      const customBadges: TrustBadge[] = [
        {
          icon: Shield,
          text: 'Test',
          description: 'Description text'
        }
      ]
      
      render(<TrustBadges badges={customBadges} />)
      
      const badge = screen.getByLabelText('Description text')
      expect(badge).toBeInTheDocument()
    })
  })

  describe('Responsive Design', () => {
    it('applies responsive grid classes in grid layout', () => {
      const { container } = render(<TrustBadges layout="grid" />)
      const wrapper = container.firstChild as HTMLElement
      
      expect(wrapper.className).toContain('grid-cols-2')
      expect(wrapper.className).toContain('md:grid-cols-3')
      expect(wrapper.className).toContain('lg:grid-cols-6')
    })

    it('applies responsive flex classes in horizontal layout', () => {
      const { container } = render(<TrustBadges layout="horizontal" />)
      const wrapper = container.firstChild as HTMLElement
      
      expect(wrapper.className).toContain('flex-col')
      expect(wrapper.className).toContain('sm:flex-row')
    })
  })

  describe('Animation', () => {
    it('applies staggered animation delays', () => {
      const { container } = render(<TrustBadges />)
      const badges = container.querySelectorAll('.group')
      
      badges.forEach((badge, index) => {
        const style = (badge as HTMLElement).style
        expect(style.animationDelay).toBe(`${index * 0.1}s`)
      })
    })

    it('applies animation fill mode', () => {
      const { container } = render(<TrustBadges />)
      const badges = container.querySelectorAll('.group')
      
      badges.forEach((badge) => {
        const style = (badge as HTMLElement).style
        expect(style.animationFillMode).toBe('both')
      })
    })
  })

  describe('Custom className', () => {
    it('applies custom className to container', () => {
      const { container } = render(<TrustBadges className="custom-class" />)
      const wrapper = container.firstChild as HTMLElement
      
      expect(wrapper.className).toContain('custom-class')
    })
  })
})
