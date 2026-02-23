/**
 * StepIndicator Component
 * 
 * Shows current step in the conversion flow (1/3, 2/3, 3/3).
 * Validates: Requirements 5.2 (Step progression feedback)
 * 
 * Features:
 * - Visual progress indicator with step numbers
 * - Accessible step announcements for screen readers
 * - Clear visual distinction between completed, current, and upcoming steps
 * - Responsive design for mobile and desktop
 * - Smooth transitions between steps
 * 
 * @example
 * <StepIndicator 
 *   currentStep={2} 
 *   totalSteps={3}
 *   steps={[
 *     { number: 1, title: 'Select File' },
 *     { number: 2, title: 'Choose Format' },
 *     { number: 3, title: 'Convert' }
 *   ]}
 * />
 */

import React from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface Step {
  /** Step number (1-based) */
  number: number
  /** Step title/label */
  title: string
  /** Optional description */
  description?: string
}

export interface StepIndicatorProps {
  /** Current active step (1-based) */
  currentStep: number
  /** Total number of steps */
  totalSteps: number
  /** Array of step configurations */
  steps: Step[]
  /** Additional CSS classes */
  className?: string
}

/**
 * StepIndicator Component
 * 
 * Displays a visual progress indicator showing the user's position
 * in a multi-step process. Provides clear visual feedback and
 * accessible announcements for screen readers.
 */
export const StepIndicator: React.FC<StepIndicatorProps> = ({
  currentStep,
  totalSteps,
  steps,
  className,
}) => {
  // Validate props
  if (currentStep < 1 || currentStep > totalSteps) {
    console.warn(`StepIndicator: currentStep (${currentStep}) is out of range (1-${totalSteps})`)
  }

  if (steps.length !== totalSteps) {
    console.warn(`StepIndicator: steps array length (${steps.length}) does not match totalSteps (${totalSteps})`)
  }

  // Determine step status
  const getStepStatus = (stepNumber: number): 'completed' | 'current' | 'upcoming' => {
    if (stepNumber < currentStep) return 'completed'
    if (stepNumber === currentStep) return 'current'
    return 'upcoming'
  }

  return (
    <div
      className={cn('w-full', className)}
      role="navigation"
      aria-label="Progress"
    >
      {/* Screen reader announcement */}
      <div
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        Step {currentStep} of {totalSteps}: {steps[currentStep - 1]?.title}
      </div>

      {/* Step counter text */}
      <div className="text-center mb-6">
        <p className="text-sm font-medium text-secondary">
          Step {currentStep} of {totalSteps}
        </p>
      </div>

      {/* Visual step indicators */}
      <div className="flex items-center justify-between max-w-2xl mx-auto">
        {steps.map((step, index) => {
          const status = getStepStatus(step.number)
          const isLast = index === steps.length - 1

          return (
            <React.Fragment key={step.number}>
              {/* Step circle and label */}
              <div className="flex flex-col items-center flex-1">
                {/* Step circle */}
                <div
                  className={cn(
                    'relative flex items-center justify-center',
                    'w-10 h-10 rounded-full',
                    'transition-all duration-300 ease-out',
                    'font-semibold text-sm',
                    // Completed step styling
                    status === 'completed' && [
                      'bg-gradient-to-r from-primary-500 to-secondary-500',
                      'text-white',
                      'shadow-md',
                    ],
                    // Current step styling
                    status === 'current' && [
                      'bg-gradient-to-r from-primary-500 to-secondary-500',
                      'text-white',
                      'shadow-lg',
                      'ring-4 ring-primary-100',
                      'scale-110',
                    ],
                    // Upcoming step styling
                    status === 'upcoming' && [
                      'bg-neutral-200',
                      'text-neutral-500',
                    ]
                  )}
                  aria-current={status === 'current' ? 'step' : undefined}
                  aria-label={`${step.title}, ${status === 'completed' ? 'completed' : status === 'current' ? 'current step' : 'upcoming'}`}
                >
                  {status === 'completed' ? (
                    <Check className="w-5 h-5" aria-hidden="true" />
                  ) : (
                    <span>{step.number}</span>
                  )}
                </div>

                {/* Step label */}
                <div className="mt-3 text-center">
                  <p
                    className={cn(
                      'text-xs sm:text-sm font-medium transition-colors duration-300',
                      status === 'completed' && 'text-primary-700',
                      status === 'current' && 'text-primary-700 font-semibold',
                      status === 'upcoming' && 'text-neutral-500'
                    )}
                  >
                    {step.title}
                  </p>
                  {step.description && (
                    <p className="text-xs text-secondary mt-1 hidden sm:block">
                      {step.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Connector line between steps */}
              {!isLast && (
                <div
                  className="flex-1 h-0.5 mx-2 mb-8 transition-all duration-300"
                  style={{
                    background:
                      step.number < currentStep
                        ? 'linear-gradient(to right, var(--color-primary-500), var(--color-secondary-500))'
                        : 'var(--color-neutral-200)',
                  }}
                  aria-hidden="true"
                />
              )}
            </React.Fragment>
          )
        })}
      </div>

      {/* Progress bar (mobile-friendly alternative) */}
      <div className="mt-6 sm:hidden">
        <div className="relative h-2 bg-neutral-200 rounded-full overflow-hidden">
          <div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary-500 to-secondary-500 transition-all duration-500 ease-out"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            aria-hidden="true"
          />
        </div>
      </div>
    </div>
  )
}

export default StepIndicator
