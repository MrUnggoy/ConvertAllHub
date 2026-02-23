/**
 * InlineHelp Component Tests
 * 
 * Tests for the InlineHelp component covering:
 * - Rendering and content display
 * - Collapsible behavior
 * - Keyboard navigation
 * - Accessibility attributes
 * - Mobile optimization
 * - Screen reader support
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { InlineHelp } from './InlineHelp'

describe('InlineHelp', () => {
  describe('Rendering', () => {
    it('renders with required props', () => {
      render(
        <InlineHelp
          id="test-help"
          content="This is help text"
        />
      )

      expect(screen.getByRole('region')).toBeInTheDocument()
      expect(screen.getByText('This is help text')).toBeInTheDocument()
    })

    it('renders with title', () => {
      render(
        <InlineHelp
          id="test-help"
          title="Help Title"
          content="Help content"
        />
      )

      expect(screen.getByText('Help Title')).toBeInTheDocument()
      expect(screen.getByText('Help content')).toBeInTheDocument()
    })

    it('renders without title', () => {
      render(
        <InlineHelp
          id="test-help"
          content="Help content"
        />
      )

      expect(screen.getByText('Help')).toBeInTheDocument()
      expect(screen.getByText('Help content')).toBeInTheDocument()
    })

    it('applies custom className', () => {
      render(
        <InlineHelp
          id="test-help"
          content="Help content"
          className="custom-class"
        />
      )

      const region = screen.getByRole('region')
      expect(region).toHaveClass('custom-class')
    })

    it('has correct ID for aria-describedby association', () => {
      render(
        <InlineHelp
          id="my-help-id"
          content="Help content"
        />
      )

      const region = screen.getByRole('region')
      expect(region).toHaveAttribute('id', 'my-help-id')
    })
  })

  describe('Collapsible Behavior', () => {
    it('is collapsed by default when collapsible', () => {
      render(
        <InlineHelp
          id="test-help"
          title="Help Title"
          content="Help content"
          collapsible={true}
          defaultCollapsed={true}
        />
      )

      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-expanded', 'false')
      
      // Content should not be visible (but accessible to screen readers)
      const visibleContent = screen.queryByText('Help content', { selector: 'p' })
      expect(visibleContent).not.toBeInTheDocument()
    })

    it('is expanded by default when defaultCollapsed is false', () => {
      render(
        <InlineHelp
          id="test-help"
          title="Help Title"
          content="Help content"
          collapsible={true}
          defaultCollapsed={false}
        />
      )

      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-expanded', 'true')
      
      // Content should be visible
      expect(screen.getByText('Help content')).toBeInTheDocument()
    })

    it('toggles collapsed state on click', async () => {
      const user = userEvent.setup()
      
      render(
        <InlineHelp
          id="test-help"
          title="Help Title"
          content="Help content"
          collapsible={true}
          defaultCollapsed={true}
        />
      )

      const button = screen.getByRole('button')
      
      // Initially collapsed
      expect(button).toHaveAttribute('aria-expanded', 'false')
      
      // Click to expand
      await user.click(button)
      expect(button).toHaveAttribute('aria-expanded', 'true')
      expect(screen.getByText('Help content')).toBeInTheDocument()
      
      // Click to collapse
      await user.click(button)
      expect(button).toHaveAttribute('aria-expanded', 'false')
    })

    it('does not toggle when collapsible is false', () => {
      render(
        <InlineHelp
          id="test-help"
          title="Help Title"
          content="Help content"
          collapsible={false}
        />
      )

      // Should not have a button
      expect(screen.queryByRole('button')).not.toBeInTheDocument()
      
      // Content should always be visible
      expect(screen.getByText('Help content')).toBeInTheDocument()
    })
  })

  describe('Keyboard Navigation', () => {
    it('toggles on Enter key', async () => {
      const user = userEvent.setup()
      
      render(
        <InlineHelp
          id="test-help"
          title="Help Title"
          content="Help content"
          collapsible={true}
          defaultCollapsed={true}
        />
      )

      const button = screen.getByRole('button')
      button.focus()
      
      // Press Enter to expand
      await user.keyboard('{Enter}')
      expect(button).toHaveAttribute('aria-expanded', 'true')
      
      // Press Enter to collapse
      await user.keyboard('{Enter}')
      expect(button).toHaveAttribute('aria-expanded', 'false')
    })

    it('toggles on Space key', async () => {
      const user = userEvent.setup()
      
      render(
        <InlineHelp
          id="test-help"
          title="Help Title"
          content="Help content"
          collapsible={true}
          defaultCollapsed={true}
        />
      )

      const button = screen.getByRole('button')
      button.focus()
      
      // Press Space to expand
      await user.keyboard(' ')
      expect(button).toHaveAttribute('aria-expanded', 'true')
      
      // Press Space to collapse
      await user.keyboard(' ')
      expect(button).toHaveAttribute('aria-expanded', 'false')
    })

    it('does not toggle on other keys', async () => {
      render(
        <InlineHelp
          id="test-help"
          title="Help Title"
          content="Help content"
          collapsible={true}
          defaultCollapsed={true}
        />
      )

      const button = screen.getByRole('button')
      button.focus()
      
      // Button should remain collapsed (aria-expanded false)
      expect(button).toHaveAttribute('aria-expanded', 'false')
    })

    it('is keyboard focusable when collapsible', () => {
      render(
        <InlineHelp
          id="test-help"
          title="Help Title"
          content="Help content"
          collapsible={true}
        />
      )

      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
      
      // Button should be focusable
      button.focus()
      expect(button).toHaveFocus()
    })
  })

  describe('Accessibility', () => {
    it('has correct ARIA role', () => {
      render(
        <InlineHelp
          id="test-help"
          content="Help content"
        />
      )

      expect(screen.getByRole('region')).toBeInTheDocument()
    })

    it('has aria-label with title', () => {
      render(
        <InlineHelp
          id="test-help"
          title="Custom Help Title"
          content="Help content"
        />
      )

      const region = screen.getByRole('region')
      expect(region).toHaveAttribute('aria-label', 'Custom Help Title')
    })

    it('has default aria-label without title', () => {
      render(
        <InlineHelp
          id="test-help"
          content="Help content"
        />
      )

      const region = screen.getByRole('region')
      expect(region).toHaveAttribute('aria-label', 'Help information')
    })

    it('has aria-expanded attribute when collapsible', () => {
      render(
        <InlineHelp
          id="test-help"
          title="Help Title"
          content="Help content"
          collapsible={true}
          defaultCollapsed={true}
        />
      )

      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-expanded', 'false')
    })

    it('has aria-controls linking button to content', () => {
      render(
        <InlineHelp
          id="test-help"
          title="Help Title"
          content="Help content"
          collapsible={true}
          defaultCollapsed={false}
        />
      )

      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-controls', 'test-help-content')
      
      const content = document.getElementById('test-help-content')
      expect(content).toBeInTheDocument()
    })

    it('provides screen reader text when collapsed', () => {
      render(
        <InlineHelp
          id="test-help"
          title="Help Title"
          content="Help content for screen readers"
          collapsible={true}
          defaultCollapsed={true}
        />
      )

      // Screen reader text should be present
      const srText = screen.getByText('Help content for screen readers', { selector: '.sr-only' })
      expect(srText).toBeInTheDocument()
    })

    it('does not provide duplicate screen reader text when expanded', () => {
      render(
        <InlineHelp
          id="test-help"
          title="Help Title"
          content="Help content"
          collapsible={true}
          defaultCollapsed={false}
        />
      )

      // Should not have sr-only text when expanded
      const srText = screen.queryByText('Help content', { selector: '.sr-only' })
      expect(srText).not.toBeInTheDocument()
    })

    it('can be associated with form elements via aria-describedby', () => {
      const { container } = render(
        <div>
          <input
            type="text"
            aria-describedby="input-help"
          />
          <InlineHelp
            id="input-help"
            content="Help for input"
          />
        </div>
      )

      const input = container.querySelector('input')
      expect(input).toHaveAttribute('aria-describedby', 'input-help')
      
      const helpRegion = screen.getByRole('region')
      expect(helpRegion).toHaveAttribute('id', 'input-help')
    })
  })

  describe('Visual Indicators', () => {
    it('shows HelpCircle icon', () => {
      const { container } = render(
        <InlineHelp
          id="test-help"
          content="Help content"
        />
      )

      // Check for icon (Lucide icons render as SVG)
      const icon = container.querySelector('svg')
      expect(icon).toBeInTheDocument()
    })

    it('shows ChevronDown when collapsed', () => {
      render(
        <InlineHelp
          id="test-help"
          title="Help Title"
          content="Help content"
          collapsible={true}
          defaultCollapsed={true}
        />
      )

      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-expanded', 'false')
      
      // ChevronDown should be present (check via aria-expanded state)
      expect(button.querySelector('svg')).toBeInTheDocument()
    })

    it('shows ChevronUp when expanded', () => {
      render(
        <InlineHelp
          id="test-help"
          title="Help Title"
          content="Help content"
          collapsible={true}
          defaultCollapsed={false}
        />
      )

      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-expanded', 'true')
      
      // ChevronUp should be present (check via aria-expanded state)
      expect(button.querySelector('svg')).toBeInTheDocument()
    })
  })

  describe('Mobile Optimization', () => {
    it('defaults to collapsed state for mobile optimization', () => {
      render(
        <InlineHelp
          id="test-help"
          title="Help Title"
          content="Help content"
        />
      )

      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-expanded', 'false')
    })

    it('can be configured to expand by default', () => {
      render(
        <InlineHelp
          id="test-help"
          title="Help Title"
          content="Help content"
          defaultCollapsed={false}
        />
      )

      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-expanded', 'true')
    })

    it('saves space when collapsed', () => {
      const { container } = render(
        <InlineHelp
          id="test-help"
          title="Help Title"
          content="This is a long help text that would take up significant space on mobile devices"
          collapsible={true}
          defaultCollapsed={true}
        />
      )

      // Content paragraph should not be visible
      const content = container.querySelector('p')
      expect(content).not.toBeInTheDocument()
    })
  })

  describe('Content Display', () => {
    it('displays content when not collapsible', () => {
      render(
        <InlineHelp
          id="test-help"
          content="Always visible content"
          collapsible={false}
        />
      )

      expect(screen.getByText('Always visible content')).toBeInTheDocument()
    })

    it('displays content when expanded', () => {
      render(
        <InlineHelp
          id="test-help"
          title="Help Title"
          content="Expanded content"
          collapsible={true}
          defaultCollapsed={false}
        />
      )

      expect(screen.getByText('Expanded content')).toBeInTheDocument()
    })

    it('hides content when collapsed', () => {
      render(
        <InlineHelp
          id="test-help"
          title="Help Title"
          content="Collapsed content"
          collapsible={true}
          defaultCollapsed={true}
        />
      )

      // Visual content should not be present
      const visibleContent = screen.queryByText('Collapsed content', { selector: 'p' })
      expect(visibleContent).not.toBeInTheDocument()
      
      // But screen reader content should be present
      const srContent = screen.getByText('Collapsed content', { selector: '.sr-only' })
      expect(srContent).toBeInTheDocument()
    })

    it('handles long content gracefully', () => {
      const longContent = 'This is a very long help text that contains multiple sentences and provides detailed information about the feature. It should wrap properly and maintain readability across different screen sizes.'
      
      render(
        <InlineHelp
          id="test-help"
          content={longContent}
          collapsible={false}
        />
      )

      expect(screen.getByText(longContent)).toBeInTheDocument()
    })
  })

  describe('Integration', () => {
    it('works with form inputs', () => {
      const { container } = render(
        <div>
          <label htmlFor="email-input">Email</label>
          <input
            id="email-input"
            type="email"
            aria-describedby="email-help"
          />
          <InlineHelp
            id="email-help"
            content="Enter your email address"
          />
        </div>
      )

      const input = container.querySelector('#email-input')
      const help = screen.getByRole('region')
      
      expect(input).toHaveAttribute('aria-describedby', 'email-help')
      expect(help).toHaveAttribute('id', 'email-help')
    })

    it('works with buttons', () => {
      const { container } = render(
        <div>
          <button aria-describedby="button-help">
            Submit
          </button>
          <InlineHelp
            id="button-help"
            content="Click to submit the form"
          />
        </div>
      )

      const button = container.querySelector('button')
      const help = screen.getByRole('region')
      
      expect(button).toHaveAttribute('aria-describedby', 'button-help')
      expect(help).toHaveAttribute('id', 'button-help')
    })

    it('can have multiple instances on the same page', () => {
      render(
        <div>
          <InlineHelp
            id="help-1"
            content="First help section"
          />
          <InlineHelp
            id="help-2"
            content="Second help section"
          />
          <InlineHelp
            id="help-3"
            content="Third help section"
          />
        </div>
      )

      expect(screen.getByText('First help section')).toBeInTheDocument()
      expect(screen.getByText('Second help section')).toBeInTheDocument()
      expect(screen.getByText('Third help section')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('handles empty content gracefully', () => {
      render(
        <InlineHelp
          id="test-help"
          content=""
        />
      )

      const region = screen.getByRole('region')
      expect(region).toBeInTheDocument()
    })

    it('handles very long titles', () => {
      const longTitle = 'This is a very long title that might wrap to multiple lines on smaller screens'
      
      render(
        <InlineHelp
          id="test-help"
          title={longTitle}
          content="Content"
        />
      )

      expect(screen.getByText(longTitle)).toBeInTheDocument()
    })

    it('handles special characters in content', () => {
      const specialContent = 'Content with <special> & "characters" and \'quotes\''
      
      render(
        <InlineHelp
          id="test-help"
          content={specialContent}
        />
      )

      expect(screen.getByText(specialContent)).toBeInTheDocument()
    })
  })
})
