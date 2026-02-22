/**
 * PrimaryCTA Component Examples
 * 
 * Visual examples demonstrating all features and requirements.
 * This file can be imported into a page to verify the component works correctly.
 */

import { Upload, Download, ArrowRight, Check } from 'lucide-react'
import { PrimaryCTA } from './PrimaryCTA'

export function PrimaryCTAExamples() {
  return (
    <div className="p-8 space-y-12 bg-neutral-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">PrimaryCTA Component Examples</h1>

        {/* Variants - Requirement 2.4 */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Variants (Requirement 2.4)</h2>
          <p className="text-neutral-600 mb-4">
            Primary and secondary variants are visually distinct. Primary uses gradient,
            secondary uses outline style.
          </p>
          <div className="flex flex-wrap gap-4">
            <PrimaryCTA 
              text="Primary Variant" 
              variant="primary"
              ariaLabel="Primary call to action"
            />
            <PrimaryCTA 
              text="Secondary Variant" 
              variant="secondary"
              ariaLabel="Secondary call to action"
            />
          </div>
        </section>

        {/* Sizes - Requirement 3.4 (44x44px minimum) */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Sizes (Requirement 3.4)</h2>
          <p className="text-neutral-600 mb-4">
            All sizes meet the 44x44px minimum touch target requirement.
            Small: 44px, Medium: 48px, Large: 56px
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <PrimaryCTA 
              text="Small (44px)" 
              size="small"
              ariaLabel="Small button"
            />
            <PrimaryCTA 
              text="Medium (48px)" 
              size="medium"
              ariaLabel="Medium button"
            />
            <PrimaryCTA 
              text="Large (56px)" 
              size="large"
              ariaLabel="Large button"
            />
          </div>
        </section>

        {/* With Icons */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">With Icons</h2>
          <p className="text-neutral-600 mb-4">
            Icons enhance visual communication and are properly sized for each button size.
          </p>
          <div className="flex flex-wrap gap-4">
            <PrimaryCTA 
              text="Upload File" 
              icon={Upload}
              variant="primary"
              ariaLabel="Upload your file"
            />
            <PrimaryCTA 
              text="Download" 
              icon={Download}
              variant="secondary"
              ariaLabel="Download file"
            />
            <PrimaryCTA 
              text="Continue" 
              icon={ArrowRight}
              variant="primary"
              size="large"
              ariaLabel="Continue to next step"
            />
          </div>
        </section>

        {/* Loading States */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Loading States</h2>
          <p className="text-neutral-600 mb-4">
            Loading state shows spinner and disables interaction.
          </p>
          <div className="flex flex-wrap gap-4">
            <PrimaryCTA 
              text="Processing..." 
              loading={true}
              variant="primary"
              ariaLabel="Processing your request"
            />
            <PrimaryCTA 
              text="Loading..." 
              loading={true}
              variant="secondary"
              ariaLabel="Loading content"
            />
          </div>
        </section>

        {/* Disabled States */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Disabled States</h2>
          <p className="text-neutral-600 mb-4">
            Disabled buttons have reduced opacity and cannot be interacted with.
          </p>
          <div className="flex flex-wrap gap-4">
            <PrimaryCTA 
              text="Disabled Primary" 
              disabled={true}
              variant="primary"
              ariaLabel="Disabled primary button"
            />
            <PrimaryCTA 
              text="Disabled Secondary" 
              disabled={true}
              variant="secondary"
              ariaLabel="Disabled secondary button"
            />
          </div>
        </section>

        {/* Interactive States - Requirement 11.5 */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Interactive States (Requirement 11.5)</h2>
          <p className="text-neutral-600 mb-4">
            Hover over buttons to see lift effect. Click to see active state (scale down).
            Focus with keyboard (Tab) to see focus ring (Requirement 8.5).
          </p>
          <div className="flex flex-wrap gap-4">
            <PrimaryCTA 
              text="Hover Me" 
              variant="primary"
              onClick={() => alert('Clicked!')}
              ariaLabel="Hover and click demonstration"
            />
            <PrimaryCTA 
              text="Focus Me" 
              variant="secondary"
              onClick={() => alert('Clicked!')}
              ariaLabel="Focus and click demonstration"
            />
          </div>
        </section>

        {/* Contrast - Requirement 2.2 */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Contrast (Requirement 2.2)</h2>
          <p className="text-neutral-600 mb-4">
            All variants meet WCAG 4.5:1 contrast ratio requirements.
            Primary: White text on gradient. Secondary: Dark text on light background.
          </p>
          <div className="flex flex-wrap gap-4">
            <div className="p-4 bg-white rounded">
              <PrimaryCTA 
                text="High Contrast Primary" 
                variant="primary"
                ariaLabel="High contrast primary button"
              />
            </div>
            <div className="p-4 bg-neutral-100 rounded">
              <PrimaryCTA 
                text="High Contrast Secondary" 
                variant="secondary"
                ariaLabel="High contrast secondary button"
              />
            </div>
          </div>
        </section>

        {/* Real-world Examples */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Real-world Examples</h2>
          <p className="text-neutral-600 mb-4">
            Common use cases for conversion optimization.
          </p>
          <div className="space-y-6">
            {/* Hero CTA */}
            <div className="p-6 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg text-white">
              <h3 className="text-2xl font-bold mb-2">Convert Your Files Now</h3>
              <p className="mb-4 opacity-90">Fast, secure, and completely free</p>
              <PrimaryCTA 
                text="Start Converting" 
                icon={Upload}
                variant="primary"
                size="large"
                className="bg-white text-primary-700 hover:bg-neutral-50"
                ariaLabel="Start converting your files"
              />
            </div>

            {/* Tool Page CTA */}
            <div className="p-6 bg-white rounded-lg border-2 border-neutral-200">
              <h3 className="text-xl font-bold mb-2">PDF to Word Converter</h3>
              <p className="text-neutral-600 mb-4">Convert PDF documents to editable Word files</p>
              <div className="flex gap-3">
                <PrimaryCTA 
                  text="Choose File" 
                  icon={Upload}
                  variant="primary"
                  ariaLabel="Choose PDF file to convert"
                />
                <PrimaryCTA 
                  text="Learn More" 
                  variant="secondary"
                  ariaLabel="Learn more about PDF to Word conversion"
                />
              </div>
            </div>

            {/* Success State */}
            <div className="p-6 bg-success-50 rounded-lg border-2 border-success-200">
              <div className="flex items-center gap-2 mb-2">
                <Check className="text-success-600" />
                <h3 className="text-xl font-bold text-success-900">Conversion Complete!</h3>
              </div>
              <p className="text-success-700 mb-4">Your file is ready to download</p>
              <PrimaryCTA 
                text="Download File" 
                icon={Download}
                variant="primary"
                ariaLabel="Download converted file"
              />
            </div>
          </div>
        </section>

        {/* Accessibility Notes */}
        <section className="mb-12 p-6 bg-info-50 rounded-lg border-2 border-info-200">
          <h2 className="text-2xl font-semibold mb-4 text-info-900">Accessibility Features</h2>
          <ul className="space-y-2 text-info-800">
            <li>✓ <strong>Requirement 3.4:</strong> All sizes meet 44x44px minimum touch target</li>
            <li>✓ <strong>Requirement 2.2:</strong> 4.5:1 contrast ratio for all variants</li>
            <li>✓ <strong>Requirement 2.4:</strong> Primary and secondary visually distinct</li>
            <li>✓ <strong>Requirement 8.5:</strong> Visible focus indicators with 2px ring</li>
            <li>✓ <strong>Requirement 11.4:</strong> Consistent styling across all instances</li>
            <li>✓ <strong>Requirement 11.5:</strong> Hover and active states defined</li>
            <li>✓ Keyboard accessible (Tab to focus, Enter/Space to activate)</li>
            <li>✓ Screen reader support with aria-label and aria-busy</li>
            <li>✓ Touch-optimized with touch-manipulation</li>
          </ul>
        </section>
      </div>
    </div>
  )
}
