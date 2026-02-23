import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Layout from '../Layout'
import Navigation from '../Navigation'

// Mock ToolCategoryNav to simplify testing
vi.mock('../ToolCategoryNav', () => ({
  default: () => <div data-testid="tool-category-nav">Tool Category Nav</div>
}))

describe('Layout Integration', () => {
  beforeEach(() => {
    // Reset scroll position
    window.scrollY = 0
  })

  it('renders Navigation component', () => {
    render(
      <BrowserRouter>
        <Layout>
          <div>Test Content</div>
        </Layout>
      </BrowserRouter>
    )

    expect(screen.getByRole('navigation')).toBeInTheDocument()
    expect(screen.getByText('ConvertAll Hub')).toBeInTheDocument()
  })

  it('renders children content', () => {
    render(
      <BrowserRouter>
        <Layout>
          <div>Test Content</div>
        </Layout>
      </BrowserRouter>
    )

    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })

  it('renders ToolCategoryNav', () => {
    render(
      <BrowserRouter>
        <Layout>
          <div>Test Content</div>
        </Layout>
      </BrowserRouter>
    )

    expect(screen.getByTestId('tool-category-nav')).toBeInTheDocument()
  })

  it('navigation works across all pages', () => {
    render(
      <BrowserRouter>
        <Layout>
          <div>Test Content</div>
        </Layout>
      </BrowserRouter>
    )

    // Check that navigation links are present
    const homeLink = screen.getAllByText('Home')[0]
    expect(homeLink).toBeInTheDocument()
    expect(homeLink.closest('a')).toHaveAttribute('href', '/')
  })
})

describe('Navigation Sticky Header', () => {
  beforeEach(() => {
    window.scrollY = 0
  })

  it('applies sticky positioning to navigation', () => {
    render(
      <BrowserRouter>
        <Navigation />
      </BrowserRouter>
    )

    const nav = screen.getByRole('navigation')
    expect(nav).toHaveClass('sticky')
    expect(nav).toHaveClass('top-0')
  })

  it('adds shadow when scrolled', async () => {
    render(
      <BrowserRouter>
        <Navigation />
      </BrowserRouter>
    )

    const nav = screen.getByRole('navigation')
    
    // Initially no shadow
    expect(nav).not.toHaveClass('shadow-md')

    // Simulate scroll
    Object.defineProperty(window, 'scrollY', { value: 100, writable: true })
    fireEvent.scroll(window)

    await waitFor(() => {
      expect(nav).toHaveClass('shadow-md')
    })
  })

  it('removes shadow when scrolled back to top', async () => {
    render(
      <BrowserRouter>
        <Navigation />
      </BrowserRouter>
    )

    const nav = screen.getByRole('navigation')

    // Scroll down
    Object.defineProperty(window, 'scrollY', { value: 100, writable: true })
    fireEvent.scroll(window)

    await waitFor(() => {
      expect(nav).toHaveClass('shadow-md')
    })

    // Scroll back to top
    Object.defineProperty(window, 'scrollY', { value: 0, writable: true })
    fireEvent.scroll(window)

    await waitFor(() => {
      expect(nav).not.toHaveClass('shadow-md')
    })
  })
})

describe('Navigation Mobile Menu Integration', () => {
  it('opens mobile menu when hamburger is clicked', async () => {
    render(
      <BrowserRouter>
        <Navigation />
      </BrowserRouter>
    )

    const menuButton = screen.getByRole('button', { name: /toggle menu/i })
    fireEvent.click(menuButton)

    await waitFor(() => {
      expect(screen.getByRole('dialog', { name: /mobile navigation menu/i })).toBeInTheDocument()
    })
  })

  it('closes mobile menu when close button is clicked', async () => {
    render(
      <BrowserRouter>
        <Navigation />
      </BrowserRouter>
    )

    // Open menu
    const menuButton = screen.getByRole('button', { name: /toggle menu/i })
    fireEvent.click(menuButton)

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    // Close menu
    const closeButton = screen.getByRole('button', { name: /close menu/i })
    fireEvent.click(closeButton)

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })

  it('displays navigation items in mobile menu', async () => {
    render(
      <BrowserRouter>
        <Navigation />
      </BrowserRouter>
    )

    const menuButton = screen.getByRole('button', { name: /toggle menu/i })
    fireEvent.click(menuButton)

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    // Check for navigation items
    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveTextContent('Home')
    expect(dialog).toHaveTextContent('About')
    expect(dialog).toHaveTextContent('Privacy')
    expect(dialog).toHaveTextContent('Settings')
  })
})

describe('Navigation Current Page Highlighting', () => {
  it('highlights home link when on home page', () => {
    // Mock useLocation to return home path
    render(
      <BrowserRouter>
        <Navigation />
      </BrowserRouter>
    )

    const homeLinks = screen.getAllByText('Home')
    const desktopHomeLink = homeLinks.find(link => 
      link.closest('a')?.classList.contains('text-primary')
    )
    
    expect(desktopHomeLink).toBeTruthy()
  })

  it('logo always links to homepage', () => {
    render(
      <BrowserRouter>
        <Navigation />
      </BrowserRouter>
    )

    const logoLink = screen.getByLabelText(/ConvertAll Hub - Home/i)
    expect(logoLink).toHaveAttribute('href', '/')
  })
})

describe('Navigation Accessibility', () => {
  it('has proper ARIA labels', () => {
    render(
      <BrowserRouter>
        <Navigation />
      </BrowserRouter>
    )

    expect(screen.getByRole('navigation')).toBeInTheDocument()
    expect(screen.getByLabelText(/ConvertAll Hub - Home/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Settings/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Toggle menu/i)).toBeInTheDocument()
  })

  it('sets aria-current on active page', () => {
    render(
      <BrowserRouter>
        <Navigation />
      </BrowserRouter>
    )

    const homeLinks = screen.getAllByText('Home')
    const desktopHomeLink = homeLinks.find(link => 
      link.closest('a')?.getAttribute('aria-current') === 'page'
    )
    
    expect(desktopHomeLink).toBeTruthy()
  })

  it('sets aria-expanded on mobile menu button', () => {
    render(
      <BrowserRouter>
        <Navigation />
      </BrowserRouter>
    )

    const menuButton = screen.getByRole('button', { name: /toggle menu/i })
    expect(menuButton).toHaveAttribute('aria-expanded', 'false')

    fireEvent.click(menuButton)
    expect(menuButton).toHaveAttribute('aria-expanded', 'true')
  })
})
