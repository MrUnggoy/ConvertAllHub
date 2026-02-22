/**
 * LoadingIndicator Component Examples
 * 
 * Demonstrates all variations and use cases of the LoadingIndicator component.
 */

import React, { useState, useEffect } from 'react'
import { LoadingIndicator } from './LoadingIndicator'

export const LoadingIndicatorExamples: React.FC = () => {
  const [progress, setProgress] = useState(0)

  // Simulate progress for demo
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 0
        return prev + 5
      })
    }, 500)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-12">
      <div>
        <h1 className="text-h1 mb-4">LoadingIndicator Component</h1>
        <p className="text-body text-secondary">
          Provides feedback during loading states with three types: spinner, skeleton, and progress.
          Features a 1-second delay to prevent flash for fast operations.
        </p>
      </div>

      {/* Spinner Type */}
      <section className="space-y-6">
        <div>
          <h2 className="text-h2 mb-2">Spinner Type</h2>
          <p className="text-body text-secondary mb-4">
            For indeterminate loading operations (expected to complete in less than 1 second).
          </p>
        </div>

        <div className="space-y-8">
          {/* Small Spinner */}
          <div className="p-6 border border-neutral-200 rounded-lg">
            <h3 className="text-h4 mb-4">Small Spinner</h3>
            <LoadingIndicator 
              type="spinner" 
              size="small" 
              message="Loading..."
              delay={0}
            />
          </div>

          {/* Medium Spinner */}
          <div className="p-6 border border-neutral-200 rounded-lg">
            <h3 className="text-h4 mb-4">Medium Spinner (Default)</h3>
            <LoadingIndicator 
              type="spinner" 
              size="medium" 
              message="Fetching data..."
              delay={0}
            />
          </div>

          {/* Large Spinner */}
          <div className="p-6 border border-neutral-200 rounded-lg">
            <h3 className="text-h4 mb-4">Large Spinner</h3>
            <LoadingIndicator 
              type="spinner" 
              size="large" 
              message="Processing your request..."
              delay={0}
            />
          </div>

          {/* Spinner without message */}
          <div className="p-6 border border-neutral-200 rounded-lg">
            <h3 className="text-h4 mb-4">Spinner Without Message</h3>
            <LoadingIndicator 
              type="spinner" 
              size="medium"
              delay={0}
            />
          </div>
        </div>
      </section>

      {/* Skeleton Type */}
      <section className="space-y-6">
        <div>
          <h2 className="text-h2 mb-2">Skeleton Type</h2>
          <p className="text-body text-secondary mb-4">
            For content loading that shows the layout structure while data is being fetched.
          </p>
        </div>

        <div className="space-y-8">
          {/* Small Skeleton */}
          <div className="p-6 border border-neutral-200 rounded-lg">
            <h3 className="text-h4 mb-4">Small Skeleton</h3>
            <LoadingIndicator 
              type="skeleton" 
              size="small"
              delay={0}
            />
          </div>

          {/* Medium Skeleton */}
          <div className="p-6 border border-neutral-200 rounded-lg">
            <h3 className="text-h4 mb-4">Medium Skeleton (Default)</h3>
            <LoadingIndicator 
              type="skeleton" 
              size="medium"
              delay={0}
            />
          </div>

          {/* Large Skeleton */}
          <div className="p-6 border border-neutral-200 rounded-lg">
            <h3 className="text-h4 mb-4">Large Skeleton</h3>
            <LoadingIndicator 
              type="skeleton" 
              size="large"
              delay={0}
            />
          </div>

          {/* Skeleton with message */}
          <div className="p-6 border border-neutral-200 rounded-lg">
            <h3 className="text-h4 mb-4">Skeleton With Message</h3>
            <LoadingIndicator 
              type="skeleton" 
              size="medium" 
              message="Loading article content..."
              delay={0}
            />
          </div>
        </div>
      </section>

      {/* Progress Type */}
      <section className="space-y-6">
        <div>
          <h2 className="text-h2 mb-2">Progress Type</h2>
          <p className="text-body text-secondary mb-4">
            For determinate operations like file conversions where progress can be tracked.
          </p>
        </div>

        <div className="space-y-8">
          {/* Progress at 0% */}
          <div className="p-6 border border-neutral-200 rounded-lg">
            <h3 className="text-h4 mb-4">Progress - Starting (0%)</h3>
            <LoadingIndicator 
              type="progress" 
              progress={0} 
              message="Initializing conversion..."
              delay={0}
            />
          </div>

          {/* Progress at 25% */}
          <div className="p-6 border border-neutral-200 rounded-lg">
            <h3 className="text-h4 mb-4">Progress - In Progress (25%)</h3>
            <LoadingIndicator 
              type="progress" 
              progress={25} 
              message="Converting file..."
              delay={0}
            />
          </div>

          {/* Progress at 50% */}
          <div className="p-6 border border-neutral-200 rounded-lg">
            <h3 className="text-h4 mb-4">Progress - Halfway (50%)</h3>
            <LoadingIndicator 
              type="progress" 
              progress={50} 
              message="Processing..."
              delay={0}
            />
          </div>

          {/* Progress at 75% */}
          <div className="p-6 border border-neutral-200 rounded-lg">
            <h3 className="text-h4 mb-4">Progress - Almost Done (75%)</h3>
            <LoadingIndicator 
              type="progress" 
              progress={75} 
              message="Finalizing..."
              delay={0}
            />
          </div>

          {/* Progress at 100% */}
          <div className="p-6 border border-neutral-200 rounded-lg">
            <h3 className="text-h4 mb-4">Progress - Complete (100%)</h3>
            <LoadingIndicator 
              type="progress" 
              progress={100} 
              message="Conversion complete!"
              delay={0}
            />
          </div>

          {/* Animated Progress */}
          <div className="p-6 border border-neutral-200 rounded-lg">
            <h3 className="text-h4 mb-4">Animated Progress (Live Demo)</h3>
            <LoadingIndicator 
              type="progress" 
              progress={progress} 
              message="Converting your file..."
              delay={0}
            />
          </div>
        </div>
      </section>

      {/* Delay Demonstration */}
      <section className="space-y-6">
        <div>
          <h2 className="text-h2 mb-2">Delay Feature</h2>
          <p className="text-body text-secondary mb-4">
            By default, the loading indicator waits 1 second before appearing to prevent
            flash for fast operations. This improves perceived performance.
          </p>
        </div>

        <div className="space-y-8">
          {/* With default delay */}
          <div className="p-6 border border-neutral-200 rounded-lg">
            <h3 className="text-h4 mb-4">With Default Delay (1000ms)</h3>
            <p className="text-body-sm text-secondary mb-4">
              This indicator will appear after 1 second. Refresh the page to see the delay.
            </p>
            <LoadingIndicator 
              type="spinner" 
              size="medium" 
              message="This appears after 1 second..."
            />
          </div>

          {/* With custom delay */}
          <div className="p-6 border border-neutral-200 rounded-lg">
            <h3 className="text-h4 mb-4">With Custom Delay (2000ms)</h3>
            <p className="text-body-sm text-secondary mb-4">
              This indicator will appear after 2 seconds. Refresh the page to see the delay.
            </p>
            <LoadingIndicator 
              type="spinner" 
              size="medium" 
              message="This appears after 2 seconds..."
              delay={2000}
            />
          </div>

          {/* No delay */}
          <div className="p-6 border border-neutral-200 rounded-lg">
            <h3 className="text-h4 mb-4">No Delay (0ms)</h3>
            <p className="text-body-sm text-secondary mb-4">
              This indicator appears immediately (used in examples above).
            </p>
            <LoadingIndicator 
              type="spinner" 
              size="medium" 
              message="This appears immediately"
              delay={0}
            />
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="space-y-6">
        <div>
          <h2 className="text-h2 mb-2">Common Use Cases</h2>
          <p className="text-body text-secondary mb-4">
            Examples of when to use each type of loading indicator.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Spinner use case */}
          <div className="p-6 border border-neutral-200 rounded-lg">
            <h3 className="text-h4 mb-2">Spinner</h3>
            <ul className="text-body-sm text-secondary space-y-2 mb-4">
              <li>• API requests</li>
              <li>• Form submissions</li>
              <li>• Quick operations</li>
              <li>• Button loading states</li>
            </ul>
            <LoadingIndicator 
              type="spinner" 
              size="small" 
              message="Submitting..."
              delay={0}
            />
          </div>

          {/* Skeleton use case */}
          <div className="p-6 border border-neutral-200 rounded-lg">
            <h3 className="text-h4 mb-2">Skeleton</h3>
            <ul className="text-body-sm text-secondary space-y-2 mb-4">
              <li>• Page content loading</li>
              <li>• List items loading</li>
              <li>• Card layouts loading</li>
              <li>• Initial page render</li>
            </ul>
            <LoadingIndicator 
              type="skeleton" 
              size="small"
              delay={0}
            />
          </div>

          {/* Progress use case */}
          <div className="p-6 border border-neutral-200 rounded-lg">
            <h3 className="text-h4 mb-2">Progress</h3>
            <ul className="text-body-sm text-secondary space-y-2 mb-4">
              <li>• File uploads</li>
              <li>• File conversions</li>
              <li>• Multi-step processes</li>
              <li>• Long operations</li>
            </ul>
            <LoadingIndicator 
              type="progress" 
              progress={progress}
              delay={0}
            />
          </div>
        </div>
      </section>

      {/* Accessibility Notes */}
      <section className="p-6 bg-info-50 border border-info-200 rounded-lg">
        <h2 className="text-h3 mb-2">Accessibility Features</h2>
        <ul className="text-body space-y-2">
          <li>
            <strong>Screen Reader Support:</strong> All indicators include proper ARIA attributes
            (role="status", aria-live="polite", aria-busy="true")
          </li>
          <li>
            <strong>Hidden Text:</strong> Screen reader-only text provides context about the loading state
          </li>
          <li>
            <strong>Progress Announcements:</strong> Progress type announces percentage completion
          </li>
          <li>
            <strong>Reduced Motion:</strong> Respects prefers-reduced-motion user preference
          </li>
        </ul>
      </section>
    </div>
  )
}

export default LoadingIndicatorExamples
