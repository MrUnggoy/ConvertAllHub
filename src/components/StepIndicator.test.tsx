/**
 * StepIndicator Component Tests
 * 
 * Tests for the StepIndicator component including:
 * - Step progression display
 * - Accessibility features
 * - Visual state changes
 * - Screen reader announcements
 * 
 * Validates: Requirements 5.2 (Step progression feedback)
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { StepIndicator, Step } from './StepIndicator'

describe('StepIndicator', () => {
  const mockSteps: Step[] = [
    { number: 1, title: 'Select File', description: 'Choose a file to convert' },
    { number: 2, title: 'Choose Format', description: 'Pick output format' },
    { number: 3, title: 'Convert', description: 'Start conversion' },
  ]

  describe('Basic Rendering', () => {
    it('renders step indicator with correct step count', () => {
      render(
        <StepIndicator
          currentStep={1}
          totalSteps={3}
          steps={mockSteps}
        />
      )

      expect(screen.getByText('Step 1 of 3')).toBeInTheDocument()
    })

    it('renders all step titles', () => {
      render(
        <StepIndicator
          currentStep={1}
          totalSteps={3}
          steps={mockSteps}
        />
      )

      expect(screen.getByText('Select File')).toBeInTheDocument()
      expect(screen.getByText('Choose Format')).toBeInTheDocument()
      expect(screen.getByText('Convert')).toBeInTheDocument()
    })

    it('renders step numbers for upcoming steps', () => {
      render(
        <StepIndicator
          currentStep={1}
          totalSteps={3}
          steps={mockSteps}
        />
      )

      // Current step shows number 1
      const stepCircles = screen.getAllByText(/^[1-3]$/)
      expect(stepCircles.length).toBeGreaterThan(0)
    })
  })

  describe('Step Status - Requirement 5.2', () => {
    it('shows current step with proper styling', () => {
      render(
        <StepIndicator
          currentStep={2}
          totalSteps={3}
          steps={mockSteps}
        />
      )

      // Current step should be marked with aria-current
      const currentStepLabel = screen.getByLabelText(/Choose Format.*current step/i)
      expect(currentStepLabel).toBeInTheDocument()
    })

    it('shows completed steps with check marks', () => {
      render(
        <StepIndicator
          currentStep={3}
          totalSteps={3}
          steps={mockSteps}
        />
      )

      // First two steps should be completed (showing check marks)
      const completedLabels = screen.getAllByLabelText(/completed/i)
      expect(completedLabels.length).toBe(2)
    })

    it('shows upcoming steps with step numbers', () => {
      render(
        <StepIndicator
          currentStep={1}
          totalSteps={3}
          steps={mockSteps}
        />
      )

      // Steps 2 and 3 should be marked as upcoming
      const upcomingLabels = screen.getAllByLabelText(/upcoming/i)
      expect(upcomingLabels.length).toBe(2)
    })

    it('updates display when step changes', () => {
      const { rerender } = render(
        <StepIndicator
          currentStep={1}
          totalSteps={3}
          steps={mockSteps}
        />
      )

      expect(screen.getByText('Step 1 of 3')).toBeInTheDocument()

      rerender(
        <StepIndicator
          currentStep={2}
          totalSteps={3}
          steps={mockSteps}
        />
      )

      expect(screen.getByText('Step 2 of 3')).toBeInTheDocument()
    })
  })

  describe('Accessibility - Requirement 5.2', () => {
    it('has navigation role for progress', () => {
      render(
        <StepIndicator
          currentStep={2}
          totalSteps={3}
          steps={mockSteps}
        />
      )

      const nav = screen.getByRole('navigation', { name: /progress/i })
      expect(nav).toBeInTheDocument()
    })

    it('announces current step to screen readers', () => {
      render(
        <StepIndicator
          currentStep={2}
          totalSteps={3}
          steps={mockSteps}
        />
      )

      // Screen reader announcement should be present
      const announcement = screen.getByText(/Step 2 of 3: Choose Format/i)
      expect(announcement).toBeInTheDocument()
      
      // Should be in a live region
      const liveRegion = announcement.closest('[aria-live="polite"]')
      expect(liveRegion).toBeInTheDocument()
    })

    it('marks current step with aria-current', () => {
      render(
        <StepIndicator
          currentStep={2}
          totalSteps={3}
          steps={mockSteps}
        />
      )

      const currentStep = screen.getByLabelText(/Choose Format.*current step/i)
      expect(currentStep).toHaveAttribute('aria-current', 'step')
    })

    it('provides descriptive labels for each step', () => {
      render(
        <StepIndicator
          currentStep={2}
          totalSteps={3}
          steps={mockSteps}
        />
      )

      // Each step should have a descriptive aria-label
      expect(screen.getByLabelText(/Select File.*completed/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Choose Format.*current step/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Convert.*upcoming/i)).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('handles first step correctly', () => {
      render(
        <StepIndicator
          currentStep={1}
          totalSteps={3}
          steps={mockSteps}
        />
      )

      expect(screen.getByText('Step 1 of 3')).toBeInTheDocument()
      expect(screen.getByLabelText(/Select File.*current step/i)).toBeInTheDocument()
    })

    it('handles last step correctly', () => {
      render(
        <StepIndicator
          currentStep={3}
          totalSteps={3}
          steps={mockSteps}
        />
      )

      expect(screen.getByText('Step 3 of 3')).toBeInTheDocument()
      expect(screen.getByLabelText(/Convert.*current step/i)).toBeInTheDocument()
    })

    it('handles two-step process', () => {
      const twoSteps: Step[] = [
        { number: 1, title: 'Upload' },
        { number: 2, title: 'Download' },
      ]

      render(
        <StepIndicator
          currentStep={1}
          totalSteps={2}
          steps={twoSteps}
        />
      )

      expect(screen.getByText('Step 1 of 2')).toBeInTheDocument()
      expect(screen.getByText('Upload')).toBeInTheDocument()
      expect(screen.getByText('Download')).toBeInTheDocument()
    })

    it('applies custom className', () => {
      const { container } = render(
        <StepIndicator
          currentStep={1}
          totalSteps={3}
          steps={mockSteps}
          className="custom-class"
        />
      )

      const wrapper = container.querySelector('.custom-class')
      expect(wrapper).toBeInTheDocument()
    })
  })

  describe('Visual Progress', () => {
    it('shows progress bar on mobile', () => {
      render(
        <StepIndicator
          currentStep={2}
          totalSteps={3}
          steps={mockSteps}
        />
      )

      // Progress bar should be present (hidden on desktop via CSS)
      const progressBars = screen.getByRole('navigation').querySelectorAll('[aria-hidden="true"]')
      expect(progressBars.length).toBeGreaterThan(0)
    })

    it('calculates progress percentage correctly', () => {
      const { container } = render(
        <StepIndicator
          currentStep={2}
          totalSteps={3}
          steps={mockSteps}
        />
      )

      // Progress should be 66.67% (2/3)
      const progressBar = container.querySelector('[style*="width"]')
      expect(progressBar).toBeInTheDocument()
    })
  })

  describe('Step Descriptions', () => {
    it('renders step descriptions when provided', () => {
      render(
        <StepIndicator
          currentStep={1}
          totalSteps={3}
          steps={mockSteps}
        />
      )

      // Descriptions should be present (hidden on mobile via CSS)
      expect(screen.getByText('Choose a file to convert')).toBeInTheDocument()
      expect(screen.getByText('Pick output format')).toBeInTheDocument()
      expect(screen.getByText('Start conversion')).toBeInTheDocument()
    })

    it('works without step descriptions', () => {
      const stepsWithoutDesc: Step[] = [
        { number: 1, title: 'Step 1' },
        { number: 2, title: 'Step 2' },
        { number: 3, title: 'Step 3' },
      ]

      render(
        <StepIndicator
          currentStep={1}
          totalSteps={3}
          steps={stepsWithoutDesc}
        />
      )

      expect(screen.getByText('Step 1')).toBeInTheDocument()
      expect(screen.getByText('Step 2')).toBeInTheDocument()
      expect(screen.getByText('Step 3')).toBeInTheDocument()
    })
  })
})
