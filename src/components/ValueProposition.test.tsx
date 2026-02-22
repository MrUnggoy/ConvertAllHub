import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import ValueProposition from './ValueProposition'

describe('ValueProposition', () => {
  const defaultProps = {
    what: 'Free online file conversion tools',
    who: 'for everyone',
    why: 'Fast, secure, private'
  }

  it('renders all three value proposition elements', () => {
    render(<ValueProposition {...defaultProps} />)
    
    expect(screen.getByText('Free online file conversion tools')).toBeInTheDocument()
    expect(screen.getByText('for everyone')).toBeInTheDocument()
    expect(screen.getByText('Fast, secure, private')).toBeInTheDocument()
  })

  it('has proper ARIA role for accessibility', () => {
    const { container } = render(<ValueProposition {...defaultProps} />)
    
    const region = container.querySelector('[role="region"]')
    expect(region).toBeInTheDocument()
    expect(region).toHaveAttribute('aria-label', 'Value proposition')
  })

  it('applies custom className when provided', () => {
    const { container } = render(
      <ValueProposition {...defaultProps} className="custom-class" />
    )
    
    const region = container.querySelector('[role="region"]')
    expect(region).toHaveClass('custom-class')
  })

  it('uses responsive typography with clamp for mobile and desktop', () => {
    render(<ValueProposition {...defaultProps} />)
    
    const whatElement = screen.getByText('Free online file conversion tools')
    
    // Check that fontSize is set (clamp function)
    expect(whatElement).toHaveStyle({ fontSize: 'clamp(1.25rem, 2vw, 1.5rem)' })
  })

  it('renders with proper font weights', () => {
    render(<ValueProposition {...defaultProps} />)
    
    const whatElement = screen.getByText('Free online file conversion tools')
    expect(whatElement).toHaveStyle({ fontWeight: 600 })
  })

  it('handles empty strings gracefully', () => {
    render(<ValueProposition what="" who="" why="" />)
    
    // Component should still render without crashing
    const region = screen.getByRole('region')
    expect(region).toBeInTheDocument()
  })

  it('renders within first 600px viewport height requirement', () => {
    const { container } = render(<ValueProposition {...defaultProps} />)
    
    const region = container.querySelector('[role="region"]')
    const rect = region?.getBoundingClientRect()
    
    // Component should be compact enough to fit in hero section
    expect(rect?.height).toBeLessThan(200) // Reasonable height for value prop
  })

  it('maintains text hierarchy with different font sizes', () => {
    render(<ValueProposition {...defaultProps} />)
    
    const whatElement = screen.getByText('Free online file conversion tools')
    const whoElement = screen.getByText('for everyone')
    const whyElement = screen.getByText('Fast, secure, private')
    
    // What should have largest font size
    expect(whatElement).toHaveStyle({ fontSize: 'clamp(1.25rem, 2vw, 1.5rem)' })
    // Who should have medium font size
    expect(whoElement).toHaveStyle({ fontSize: 'clamp(1rem, 1.5vw, 1.125rem)' })
    // Why should have smallest font size
    expect(whyElement).toHaveStyle({ fontSize: 'clamp(0.875rem, 1.25vw, 1rem)' })
  })
})
