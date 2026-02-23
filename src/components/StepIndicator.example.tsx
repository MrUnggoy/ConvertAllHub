/**
 * StepIndicator Component Examples
 * 
 * Demonstrates various use cases and configurations of the StepIndicator component.
 */

import { useState } from 'react'
import { StepIndicator, Step } from './StepIndicator'
import { PrimaryCTA } from './PrimaryCTA'

export default function StepIndicatorExamples() {
  const [currentStep, setCurrentStep] = useState(1)

  const conversionSteps: Step[] = [
    { 
      number: 1, 
      title: 'Select File',
      description: 'Choose a file to convert'
    },
    { 
      number: 2, 
      title: 'Choose Format',
      description: 'Pick your output format'
    },
    { 
      number: 3, 
      title: 'Convert',
      description: 'Start the conversion'
    },
  ]

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleReset = () => {
    setCurrentStep(1)
  }

  return (
    <div className="min-h-screen bg-neutral-50 p-8">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-primary mb-4">
            StepIndicator Component Examples
          </h1>
          <p className="text-lg text-secondary">
            Visual progress indicator for multi-step processes
          </p>
        </div>

        {/* Example 1: Interactive 3-Step Process */}
        <section className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-semibold mb-6">
            Interactive 3-Step Conversion Flow
          </h2>
          
          <StepIndicator
            currentStep={currentStep}
            totalSteps={3}
            steps={conversionSteps}
          />

          {/* Step Content */}
          <div className="mt-8 p-6 bg-neutral-50 rounded-lg min-h-[200px]">
            {currentStep === 1 && (
              <div>
                <h3 className="text-xl font-semibold mb-4">Step 1: Select File</h3>
                <p className="text-secondary mb-4">
                  Choose a file from your device to begin the conversion process.
                </p>
                <div className="border-2 border-dashed border-neutral-300 rounded-lg p-8 text-center">
                  <p className="text-neutral-500">Drag and drop a file here or click to browse</p>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div>
                <h3 className="text-xl font-semibold mb-4">Step 2: Choose Format</h3>
                <p className="text-secondary mb-4">
                  Select the output format for your converted file.
                </p>
                <div className="grid grid-cols-3 gap-4">
                  {['PDF', 'DOCX', 'TXT'].map((format) => (
                    <button
                      key={format}
                      className="p-4 border-2 border-neutral-300 rounded-lg hover:border-primary-500 transition-colors"
                    >
                      {format}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div>
                <h3 className="text-xl font-semibold mb-4">Step 3: Convert</h3>
                <p className="text-secondary mb-4">
                  Ready to convert your file. Click the button below to start.
                </p>
                <div className="text-center">
                  <PrimaryCTA
                    text="Start Conversion"
                    variant="primary"
                    size="large"
                    onClick={() => alert('Conversion started!')}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Navigation Controls */}
          <div className="mt-6 flex justify-between items-center">
            <PrimaryCTA
              text="Previous"
              variant="secondary"
              onClick={handlePrevious}
              disabled={currentStep === 1}
            />
            
            <PrimaryCTA
              text="Reset"
              variant="secondary"
              onClick={handleReset}
            />

            <PrimaryCTA
              text="Next"
              variant="primary"
              onClick={handleNext}
              disabled={currentStep === 3}
            />
          </div>
        </section>

        {/* Example 2: All Steps Completed */}
        <section className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-semibold mb-6">
            All Steps Completed
          </h2>
          
          <StepIndicator
            currentStep={3}
            totalSteps={3}
            steps={conversionSteps}
          />

          <div className="mt-6 p-4 bg-success-50 border border-success-200 rounded-lg">
            <p className="text-success-700 font-medium">
              ✓ All steps completed successfully!
            </p>
          </div>
        </section>

        {/* Example 3: Two-Step Process */}
        <section className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-semibold mb-6">
            Two-Step Process
          </h2>
          
          <StepIndicator
            currentStep={1}
            totalSteps={2}
            steps={[
              { number: 1, title: 'Upload', description: 'Upload your file' },
              { number: 2, title: 'Download', description: 'Get your result' },
            ]}
          />
        </section>

        {/* Example 4: Without Descriptions */}
        <section className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-semibold mb-6">
            Simple Steps (No Descriptions)
          </h2>
          
          <StepIndicator
            currentStep={2}
            totalSteps={3}
            steps={[
              { number: 1, title: 'Upload' },
              { number: 2, title: 'Process' },
              { number: 3, title: 'Download' },
            ]}
          />
        </section>

        {/* Example 5: Four-Step Process */}
        <section className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-semibold mb-6">
            Four-Step Process
          </h2>
          
          <StepIndicator
            currentStep={2}
            totalSteps={4}
            steps={[
              { number: 1, title: 'Select', description: 'Choose files' },
              { number: 2, title: 'Configure', description: 'Set options' },
              { number: 3, title: 'Process', description: 'Convert files' },
              { number: 4, title: 'Download', description: 'Get results' },
            ]}
          />
        </section>

        {/* Accessibility Notes */}
        <section className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-blue-900">
            Accessibility Features
          </h2>
          <ul className="space-y-2 text-blue-800">
            <li>✓ Screen reader announcements for current step</li>
            <li>✓ ARIA labels for each step status (completed, current, upcoming)</li>
            <li>✓ aria-current attribute on current step</li>
            <li>✓ Live region for step changes</li>
            <li>✓ Semantic navigation role</li>
            <li>✓ Visual indicators with sufficient color contrast</li>
          </ul>
        </section>

        {/* Usage Notes */}
        <section className="bg-neutral-100 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Usage Notes</h2>
          <div className="space-y-4 text-secondary">
            <div>
              <h3 className="font-semibold text-primary mb-2">When to Use</h3>
              <p>
                Use StepIndicator in multi-step processes like file conversion flows,
                form wizards, onboarding sequences, or checkout processes.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-primary mb-2">Best Practices</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>Keep step titles short and descriptive (2-3 words)</li>
                <li>Use 3-5 steps maximum for optimal user experience</li>
                <li>Provide clear descriptions for each step</li>
                <li>Update currentStep as user progresses</li>
                <li>Allow users to navigate back to previous steps when appropriate</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-primary mb-2">Mobile Considerations</h3>
              <p>
                The component automatically adapts to mobile screens with a simplified
                progress bar view and hidden descriptions for better space utilization.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
