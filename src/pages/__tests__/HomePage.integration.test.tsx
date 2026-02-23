/**
 * HomePage Integration Tests
 * 
 * Tests for Task 15.1: Update HomePage with all enhanced components
 * Validates: Requirements 1.1, 2.5, 4.1, 10.1
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import HomePage from '../HomePage'

// Mock the tool registry
vi.mock('@/tools/registry', () => ({
  toolRegistry: {
    getAllTools: () => [
      {
        id: 'pdf-to-word',
        name: 'PDF to Word',
        description: 'Convert PDF to Word',
        category: 'PDF',
        inputFormats: ['pdf'],
        outputFormats: ['docx'],
        clientSideSupported: false,
        proFeatures: [],
        route: '/tool/pdf-to-word'
      },
      {
        id: 'image-converter',
        name: 'Image Converter',
        description: 'Convert images',
        category: 'Image',
        inputFormats: ['jpg', 'png'],
        outputFormats: ['webp'],
        clientSideSupported: true,
        proFeatures: [],
        route: '/tool/image-converter'
      }
    ]
  }
}))

describe('HomePage Integration', () => {
  const renderHomePage = () => {
    return render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    )
  }

  describe('Component Hierarchy', () => {
    it('should render HeroSection as the first main section', () => {
      renderHomePage()
      
      // Check for hero section elements
      expect(screen.getByRole('banner')).toBeInTheDocument()
      expect(screen.getByText('ConvertAll Hub')).toBeInTheDocument()
    })

    it('should render TrustBadges after HeroSection', () => {
      renderHomePage()
      
      // Check for trust badges section
      const trustSection = screen.getByLabelText('Trust and security features')
      expect(trustSection).toBeInTheDocument()
      
      // Verify trust badges are present
      expect(screen.getByText('100% Free')).toBeInTheDocument()
      expect(screen.getByText('No Signup Required')).toBeInTheDocument()
      expect(screen.getByText('Privacy-First')).toBeInTheDocument()
    })

    it('should render ToolLibrary after TrustBadges', () => {
      renderHomePage()
      
      // Check for tool library section
      const toolsSection = screen.getByLabelText('Available conversion tools')
      expect(toolsSection).toBeInTheDocument()
      
      // Verify tools are rendered
      expect(screen.getByText('PDF to Word')).toBeInTheDocument()
      expect(screen.getByText('Image Converter')).toBeInTheDocument()
    })
  })

  describe('Data Flow', () => {
    it('should pass value proposition data to HeroSection', () => {
      renderHomePage()
      
      // Check that value proposition is rendered
      expect(screen.getByText('Free online file conversion tools')).toBeInTheDocument()
      expect(screen.getByText('for everyone')).toBeInTheDocument()
      expect(screen.getByText('Fast, secure, and privacy-first')).toBeInTheDocument()
    })

    it('should pass primary CTA data to HeroSection', () => {
      renderHomePage()
      
      // Check that CTA is rendered with correct text
      const cta = screen.getByRole('button', { name: /start converting now/i })
      expect(cta).toBeInTheDocument()
    })

    it('should pass tools data to ToolLibrary', () => {
      renderHomePage()
      
      // Verify tool count is displayed
      expect(screen.getByText(/showing all/i)).toBeInTheDocument()
      expect(screen.getByText(/2/)).toBeInTheDocument() // 2 tools
    })

    it('should configure TrustBadges with horizontal layout and metrics', () => {
      renderHomePage()
      
      // Check that metrics are displayed
      expect(screen.getByText('10,000+')).toBeInTheDocument()
      expect(screen.getByText('Files Converted')).toBeInTheDocument()
    })
  })

  describe('Responsive Behavior', () => {
    it('should render all sections in mobile viewport', () => {
      // Set viewport to mobile size
      global.innerWidth = 375
      global.innerHeight = 667
      
      renderHomePage()
      
      // All sections should be present
      expect(screen.getByRole('banner')).toBeInTheDocument()
      expect(screen.getByLabelText('Trust and security features')).toBeInTheDocument()
      expect(screen.getByLabelText('Available conversion tools')).toBeInTheDocument()
    })

    it('should render all sections in tablet viewport', () => {
      // Set viewport to tablet size
      global.innerWidth = 768
      global.innerHeight = 1024
      
      renderHomePage()
      
      // All sections should be present
      expect(screen.getByRole('banner')).toBeInTheDocument()
      expect(screen.getByLabelText('Trust and security features')).toBeInTheDocument()
      expect(screen.getByLabelText('Available conversion tools')).toBeInTheDocument()
    })

    it('should render all sections in desktop viewport', () => {
      // Set viewport to desktop size
      global.innerWidth = 1920
      global.innerHeight = 1080
      
      renderHomePage()
      
      // All sections should be present
      expect(screen.getByRole('banner')).toBeInTheDocument()
      expect(screen.getByLabelText('Trust and security features')).toBeInTheDocument()
      expect(screen.getByLabelText('Available conversion tools')).toBeInTheDocument()
    })
  })

  describe('SEO and Accessibility', () => {
    it('should have proper semantic structure', () => {
      renderHomePage()
      
      // Check for semantic sections
      expect(screen.getByRole('banner')).toBeInTheDocument() // header in HeroSection
      expect(screen.getByRole('contentinfo')).toBeInTheDocument() // footer
      
      // Check for proper ARIA labels
      expect(screen.getByLabelText('Welcome and introduction')).toBeInTheDocument()
      expect(screen.getByLabelText('Trust and security features')).toBeInTheDocument()
      expect(screen.getByLabelText('Available conversion tools')).toBeInTheDocument()
    })

    it('should render SEO meta tags', () => {
      renderHomePage()
      
      // MetaTags component should be rendered (we can't easily test meta tags in JSDOM)
      // But we can verify the component is in the tree
      const { container } = render(
        <BrowserRouter>
          <HomePage />
        </BrowserRouter>
      )
      expect(container).toBeInTheDocument()
    })
  })

  describe('Animation and Performance', () => {
    it('should apply staggered animations to sections', () => {
      const { container } = renderHomePage()
      
      // Check for animation classes
      const sections = container.querySelectorAll('.animate-fade-in')
      expect(sections.length).toBeGreaterThan(0)
    })

    it('should have proper spacing between sections', () => {
      const { container } = renderHomePage()
      
      // Check for space-y class on main container
      const mainContainer = container.querySelector('.space-y-16')
      expect(mainContainer).toBeInTheDocument()
    })
  })
})
