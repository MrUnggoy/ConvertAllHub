/**
 * ConversionFlow Component Examples
 * 
 * Interactive examples demonstrating various use cases of the ConversionFlow component.
 */

import React, { useState } from 'react'
import ConversionFlow, { ConversionFlowResult } from './ConversionFlow'
import { ConversionError } from './ErrorDisplay'
import { ConversionProvider } from '@/contexts/ConversionContext'

export default function ConversionFlowExamples() {
  return (
    <ConversionProvider>
      <div className="space-y-16 p-8 max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">ConversionFlow Examples</h1>
        
        <Example1_BasicPDFConverter />
        <Example2_ImageConverter />
        <Example3_DocumentConverter />
        <Example4_CustomSizeLimit />
        <Example5_WithResultDisplay />
      </div>
    </ConversionProvider>
  )
}

// Example 1: Basic PDF Converter
function Example1_BasicPDFConverter() {
  const handleComplete = (result: ConversionFlowResult) => {
    console.log('PDF conversion complete:', result)
    alert(`Conversion complete! File: ${result.filename}`)
  }

  const handleError = (error: ConversionError) => {
    console.error('PDF conversion error:', error)
  }

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold mb-2">Example 1: Basic PDF Converter</h2>
        <p className="text-neutral-600">
          Simple PDF to image converter with standard settings.
        </p>
      </div>
      
      <div className="border-2 border-neutral-200 rounded-lg p-6 bg-white">
        <ConversionFlow
          toolId="pdf-converter"
          inputFormats={['pdf']}
          outputFormats={['jpg', 'png', 'webp']}
          onComplete={handleComplete}
          onError={handleError}
        />
      </div>
      
      <details className="text-sm">
        <summary className="cursor-pointer font-medium">View Code</summary>
        <pre className="mt-2 p-4 bg-neutral-100 rounded overflow-x-auto">
{`<ConversionFlow
  toolId="pdf-converter"
  inputFormats={['pdf']}
  outputFormats={['jpg', 'png', 'webp']}
  onComplete={handleComplete}
  onError={handleError}
/>`}
        </pre>
      </details>
    </section>
  )
}

// Example 2: Image Converter
function Example2_ImageConverter() {
  const handleComplete = (result: ConversionFlowResult) => {
    console.log('Image conversion complete:', result)
  }

  const handleError = (error: ConversionError) => {
    console.error('Image conversion error:', error)
  }

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold mb-2">Example 2: Image Converter</h2>
        <p className="text-neutral-600">
          Convert between multiple image formats with various input types.
        </p>
      </div>
      
      <div className="border-2 border-neutral-200 rounded-lg p-6 bg-white">
        <ConversionFlow
          toolId="image-converter"
          inputFormats={['jpg', 'png', 'gif', 'webp', 'bmp']}
          outputFormats={['jpg', 'png', 'webp', 'gif']}
          onComplete={handleComplete}
          onError={handleError}
        />
      </div>
      
      <details className="text-sm">
        <summary className="cursor-pointer font-medium">View Code</summary>
        <pre className="mt-2 p-4 bg-neutral-100 rounded overflow-x-auto">
{`<ConversionFlow
  toolId="image-converter"
  inputFormats={['jpg', 'png', 'gif', 'webp', 'bmp']}
  outputFormats={['jpg', 'png', 'webp', 'gif']}
  onComplete={handleComplete}
  onError={handleError}
/>`}
        </pre>
      </details>
    </section>
  )
}

// Example 3: Document Converter
function Example3_DocumentConverter() {
  const handleComplete = (result: ConversionFlowResult) => {
    console.log('Document conversion complete:', result)
  }

  const handleError = (error: ConversionError) => {
    console.error('Document conversion error:', error)
  }

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold mb-2">Example 3: Document Converter</h2>
        <p className="text-neutral-600">
          Convert documents between different formats (DOCX, PDF, TXT).
        </p>
      </div>
      
      <div className="border-2 border-neutral-200 rounded-lg p-6 bg-white">
        <ConversionFlow
          toolId="document-converter"
          inputFormats={['docx', 'doc', 'odt', 'rtf']}
          outputFormats={['pdf', 'txt', 'docx']}
          onComplete={handleComplete}
          onError={handleError}
        />
      </div>
      
      <details className="text-sm">
        <summary className="cursor-pointer font-medium">View Code</summary>
        <pre className="mt-2 p-4 bg-neutral-100 rounded overflow-x-auto">
{`<ConversionFlow
  toolId="document-converter"
  inputFormats={['docx', 'doc', 'odt', 'rtf']}
  outputFormats={['pdf', 'txt', 'docx']}
  onComplete={handleComplete}
  onError={handleError}
/>`}
        </pre>
      </details>
    </section>
  )
}

// Example 4: Custom Size Limit
function Example4_CustomSizeLimit() {
  const handleComplete = (result: ConversionFlowResult) => {
    console.log('Conversion complete:', result)
  }

  const handleError = (error: ConversionError) => {
    console.error('Conversion error:', error)
  }

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold mb-2">Example 4: Custom Size Limit</h2>
        <p className="text-neutral-600">
          Converter with a custom maximum file size of 10MB.
        </p>
      </div>
      
      <div className="border-2 border-neutral-200 rounded-lg p-6 bg-white">
        <ConversionFlow
          toolId="small-file-converter"
          inputFormats={['jpg', 'png']}
          outputFormats={['webp', 'jpg']}
          maxFileSize={10 * 1024 * 1024} // 10MB
          onComplete={handleComplete}
          onError={handleError}
        />
      </div>
      
      <details className="text-sm">
        <summary className="cursor-pointer font-medium">View Code</summary>
        <pre className="mt-2 p-4 bg-neutral-100 rounded overflow-x-auto">
{`<ConversionFlow
  toolId="small-file-converter"
  inputFormats={['jpg', 'png']}
  outputFormats={['webp', 'jpg']}
  maxFileSize={10 * 1024 * 1024} // 10MB
  onComplete={handleComplete}
  onError={handleError}
/>`}
        </pre>
      </details>
    </section>
  )
}

// Example 5: With Result Display
function Example5_WithResultDisplay() {
  const [result, setResult] = useState<ConversionFlowResult | null>(null)
  const [error, setError] = useState<ConversionError | null>(null)

  const handleComplete = (conversionResult: ConversionFlowResult) => {
    console.log('Conversion complete:', conversionResult)
    setResult(conversionResult)
    setError(null)
  }

  const handleError = (conversionError: ConversionError) => {
    console.error('Conversion error:', conversionError)
    setError(conversionError)
    setResult(null)
  }

  const handleReset = () => {
    setResult(null)
    setError(null)
  }

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold mb-2">Example 5: With Result Display</h2>
        <p className="text-neutral-600">
          Converter that displays the result details after completion.
        </p>
      </div>
      
      <div className="border-2 border-neutral-200 rounded-lg p-6 bg-white">
        <ConversionFlow
          toolId="result-display-converter"
          inputFormats={['pdf', 'docx']}
          outputFormats={['pdf', 'jpg', 'png']}
          onComplete={handleComplete}
          onError={handleError}
        />
        
        {/* Result Display */}
        {result && (
          <div className="mt-6 p-4 bg-green-50 border-2 border-green-500 rounded-lg">
            <h3 className="font-bold text-green-700 mb-2">Conversion Result</h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="font-medium">Filename:</dt>
                <dd className="text-neutral-700">{result.filename}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium">Size:</dt>
                <dd className="text-neutral-700">{(result.size / 1024).toFixed(2)} KB</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium">Download URL:</dt>
                <dd className="text-neutral-700 truncate max-w-xs">
                  {result.downloadUrl.substring(0, 50)}...
                </dd>
              </div>
            </dl>
            <button
              onClick={handleReset}
              className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Reset
            </button>
          </div>
        )}
        
        {/* Error Display */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 border-2 border-red-500 rounded-lg">
            <h3 className="font-bold text-red-700 mb-2">Conversion Error</h3>
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="font-medium">Code:</dt>
                <dd className="text-neutral-700">{error.code}</dd>
              </div>
              <div>
                <dt className="font-medium">Message:</dt>
                <dd className="text-neutral-700">{error.userMessage}</dd>
              </div>
              <div>
                <dt className="font-medium">Suggested Action:</dt>
                <dd className="text-neutral-700">{error.suggestedAction}</dd>
              </div>
            </dl>
            <button
              onClick={handleReset}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Reset
            </button>
          </div>
        )}
      </div>
      
      <details className="text-sm">
        <summary className="cursor-pointer font-medium">View Code</summary>
        <pre className="mt-2 p-4 bg-neutral-100 rounded overflow-x-auto">
{`const [result, setResult] = useState<ConversionFlowResult | null>(null)
const [error, setError] = useState<ConversionError | null>(null)

const handleComplete = (conversionResult: ConversionFlowResult) => {
  setResult(conversionResult)
  setError(null)
}

const handleError = (conversionError: ConversionError) => {
  setError(conversionError)
  setResult(null)
}

<ConversionFlow
  toolId="result-display-converter"
  inputFormats={['pdf', 'docx']}
  outputFormats={['pdf', 'jpg', 'png']}
  onComplete={handleComplete}
  onError={handleError}
/>

{result && (
  <div className="result-display">
    {/* Display result details */}
  </div>
)}

{error && (
  <div className="error-display">
    {/* Display error details */}
  </div>
)}`}
        </pre>
      </details>
    </section>
  )
}
