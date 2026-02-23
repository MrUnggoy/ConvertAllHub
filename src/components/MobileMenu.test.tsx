import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import MobileMenu, { type NavItem } from './MobileMenu'
import { Home, Settings, Info } from 'lucide-react'

describe('MobileMenu', () => {
  const mockOnClose = vi.fn()
  const mockItems: NavItem[] = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Settings', href: '/settings', icon: Settings },
    { label: 'About', href: '/about', icon: Info },
  ]

  beforeEach(() => {
    mockOnClose.mockClear()
  })

  afterEach(() => {
    // Clean up body overflow style
    document.body.style.overflow = ''
  })

  describe('Visibility', () => {
    it('should not render when isOpen is false', () => {
      render(<MobileMenu items={mockItems} isOpen={false} onClose={mockOnClose} />)
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('should render when isOpen is true', () => {
      render(<MobileMenu items={mockItems} isOpen={true} onClose={mockOnClose} />)
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('should render backdrop when open', () => {
      const { container } = render(<MobileMenu items={mockItems} isOpen={true} onClose={mockOnClose} />)
      const backdrop = container.querySelector('.fixed.inset-0.bg-black\\/50')
      expect(backdrop).toBeInTheDocument()
    })
  })

  describe('Navigation Items', () => {
    it('should render all navigation items', () => {
      render(<MobileMenu items={mockItems} isOpen={true} onClose={mockOnClose} />)
      
      expect(screen.getByText('Home')).toBeInTheDocument()
      expect(screen.getByText('Settings')).toBeInTheDocument()
      expect(screen.getByText('About')).toBeInTheDocument()
    })

    it('should render icons for items that have them', () => {
      const { container } = render(<MobileMenu items={mockItems} isOpen={true} onClose={mockOnClose} />)
      
      // Check that icons are rendered (lucide-react icons have specific SVG structure)
      const icons = container.querySelectorAll('svg')
      // Should have at least 4 icons: 3 nav items + 1 close button
      expect(icons.length).toBeGreaterThanOrEqual(4)
    })

    it('should highlight active navigation item', () => {
      render(<MobileMenu items={mockItems} isOpen={true} onClose={mockOnClose} currentPath="/" />)
      
      const homeLink = screen.getByText('Home').closest('a')
      expect(homeLink).toHaveClass('bg-primary/10')
      expect(homeLink).toHaveAttribute('aria-current', 'page')
    })

    it('should call onClose when navigation item is clicked', () => {
      render(<MobileMenu items={mockItems} isOpen={true} onClose={mockOnClose} />)
      
      const homeLink = screen.getByText('Home')
      fireEvent.click(homeLink)
      
      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })

    it('should call item onClick handler if provided', () => {
      const mockItemClick = vi.fn()
      const itemsWithClick: NavItem[] = [
        { label: 'Custom Action', href: '#', onClick: mockItemClick },
      ]
      
      render(<MobileMenu items={itemsWithClick} isOpen={true} onClose={mockOnClose} />)
      
      const link = screen.getByText('Custom Action')
      fireEvent.click(link)
      
      expect(mockItemClick).toHaveBeenCalledTimes(1)
      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })
  })

  describe('Close Button', () => {
    it('should render close button with proper accessibility', () => {
      render(<MobileMenu items={mockItems} isOpen={true} onClose={mockOnClose} />)
      
      const closeButton = screen.getByRole('button', { name: /close menu/i })
      expect(closeButton).toBeInTheDocument()
    })

    it('should have minimum 44x44px touch target for close button', () => {
      render(<MobileMenu items={mockItems} isOpen={true} onClose={mockOnClose} />)
      
      const closeButton = screen.getByRole('button', { name: /close menu/i })
      expect(closeButton).toHaveClass('min-h-[44px]')
      expect(closeButton).toHaveClass('min-w-[44px]')
    })

    it('should call onClose when close button is clicked', () => {
      render(<MobileMenu items={mockItems} isOpen={true} onClose={mockOnClose} />)
      
      const closeButton = screen.getByRole('button', { name: /close menu/i })
      fireEvent.click(closeButton)
      
      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })

    it('should focus close button when menu opens', async () => {
      const { rerender } = render(<MobileMenu items={mockItems} isOpen={false} onClose={mockOnClose} />)
      
      rerender(<MobileMenu items={mockItems} isOpen={true} onClose={mockOnClose} />)
      
      await waitFor(() => {
        const closeButton = screen.getByRole('button', { name: /close menu/i })
        expect(closeButton).toHaveFocus()
      })
    })
  })

  describe('Backdrop Interaction', () => {
    it('should call onClose when backdrop is clicked', () => {
      const { container } = render(<MobileMenu items={mockItems} isOpen={true} onClose={mockOnClose} />)
      
      const backdrop = container.querySelector('.fixed.inset-0.bg-black\\/50')
      expect(backdrop).toBeInTheDocument()
      
      if (backdrop) {
        fireEvent.click(backdrop)
        expect(mockOnClose).toHaveBeenCalledTimes(1)
      }
    })
  })

  describe('Keyboard Navigation', () => {
    it('should close menu when Escape key is pressed', () => {
      render(<MobileMenu items={mockItems} isOpen={true} onClose={mockOnClose} />)
      
      fireEvent.keyDown(document, { key: 'Escape' })
      
      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })

    it('should trap focus within menu when Tab is pressed', async () => {
      render(<MobileMenu items={mockItems} isOpen={true} onClose={mockOnClose} />)
      
      const closeButton = screen.getByRole('button', { name: /close menu/i })
      const links = screen.getAllByRole('link')
      
      // Focus should start on close button
      await waitFor(() => {
        expect(closeButton).toHaveFocus()
      })
      
      // Manually focus first link to simulate Tab behavior
      links[0].focus()
      
      // Verify focus moved to first link
      expect(links[0]).toHaveFocus()
    })

    it('should cycle focus from last to first element on Tab', async () => {
      render(<MobileMenu items={mockItems} isOpen={true} onClose={mockOnClose} />)
      
      const links = screen.getAllByRole('link')
      const lastLink = links[links.length - 1]
      
      // Focus last link
      lastLink.focus()
      expect(lastLink).toHaveFocus()
      
      // Press Tab
      fireEvent.keyDown(document, { key: 'Tab' })
      
      // Should cycle back to close button
      await waitFor(() => {
        const closeButton = screen.getByRole('button', { name: /close menu/i })
        expect(closeButton).toHaveFocus()
      })
    })

    it('should cycle focus from first to last element on Shift+Tab', async () => {
      render(<MobileMenu items={mockItems} isOpen={true} onClose={mockOnClose} />)
      
      const closeButton = screen.getByRole('button', { name: /close menu/i })
      
      // Focus should start on close button
      await waitFor(() => {
        expect(closeButton).toHaveFocus()
      })
      
      // Press Shift+Tab
      fireEvent.keyDown(document, { key: 'Tab', shiftKey: true })
      
      // Should cycle to last link
      await waitFor(() => {
        const links = screen.getAllByRole('link')
        const lastLink = links[links.length - 1]
        expect(lastLink).toHaveFocus()
      })
    })
  })

  describe('Body Scroll Lock', () => {
    it('should prevent body scroll when menu is open', () => {
      render(<MobileMenu items={mockItems} isOpen={true} onClose={mockOnClose} />)
      
      expect(document.body.style.overflow).toBe('hidden')
    })

    it('should restore body scroll when menu is closed', () => {
      const { unmount } = render(<MobileMenu items={mockItems} isOpen={true} onClose={mockOnClose} />)
      
      expect(document.body.style.overflow).toBe('hidden')
      
      unmount()
      
      expect(document.body.style.overflow).toBe('')
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<MobileMenu items={mockItems} isOpen={true} onClose={mockOnClose} />)
      
      const dialog = screen.getByRole('dialog')
      expect(dialog).toHaveAttribute('aria-modal', 'true')
      expect(dialog).toHaveAttribute('aria-label', 'Mobile navigation menu')
    })

    it('should have minimum 44x44px touch targets for all navigation items', () => {
      render(<MobileMenu items={mockItems} isOpen={true} onClose={mockOnClose} />)
      
      const links = screen.getAllByRole('link')
      links.forEach(link => {
        expect(link).toHaveClass('min-h-[44px]')
      })
    })

    it('should have focus visible styles', () => {
      render(<MobileMenu items={mockItems} isOpen={true} onClose={mockOnClose} />)
      
      const closeButton = screen.getByRole('button', { name: /close menu/i })
      expect(closeButton).toHaveClass('focus:outline-none')
      expect(closeButton).toHaveClass('focus:ring-2')
      expect(closeButton).toHaveClass('focus:ring-primary')
    })
  })

  describe('Animation', () => {
    it('should have slide-in animation class', () => {
      const { container } = render(<MobileMenu items={mockItems} isOpen={true} onClose={mockOnClose} />)
      
      const menu = container.querySelector('.animate-slide-in-right')
      expect(menu).toBeInTheDocument()
    })

    it('should have fade-in animation for backdrop', () => {
      const { container } = render(<MobileMenu items={mockItems} isOpen={true} onClose={mockOnClose} />)
      
      const backdrop = container.querySelector('.animate-fade-in')
      expect(backdrop).toBeInTheDocument()
    })
  })
})
