/**
 * InlineHelp Component Examples
 * 
 * This file demonstrates various usage patterns for the InlineHelp component.
 */

import { useState } from 'react'
import { InlineHelp } from './InlineHelp'

export function InlineHelpExamples() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedFormat, setSelectedFormat] = useState<string>('')

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-12">
      <div>
        <h1 className="text-h2 mb-2">InlineHelp Component Examples</h1>
        <p className="text-body text-secondary">
          Contextual help text for conversion flow steps
        </p>
      </div>

      {/* Example 1: Basic Collapsible Help */}
      <section className="space-y-4">
        <h2 className="text-h3">1. Basic Collapsible Help</h2>
        <p className="text-body-sm text-secondary">
          Default behavior with title and collapsible content
        </p>
        <InlineHelp
          id="basic-help"
          title="Need help selecting a file?"
          content="Click the upload area or drag and drop your file. Supported formats: PDF, DOCX, JPG, PNG. Maximum file size: 10MB."
        />
      </section>

      {/* Example 2: Always Expanded Help */}
      <section className="space-y-4">
        <h2 className="text-h3">2. Always Expanded Help</h2>
        <p className="text-body-sm text-secondary">
          Non-collapsible help that's always visible
        </p>
        <InlineHelp
          id="expanded-help"
          title="Important information"
          content="Your files are processed securely and automatically deleted after 1 hour. We never store or share your files with third parties."
          collapsible={false}
        />
      </section>

      {/* Example 3: Help Without Title */}
      <section className="space-y-4">
        <h2 className="text-h3">3. Help Without Title</h2>
        <p className="text-body-sm text-secondary">
          Simple help text without a title heading
        </p>
        <InlineHelp
          id="simple-help"
          content="This is a simple help message without a title. It's still collapsible by default."
        />
      </section>

      {/* Example 4: With Form Input (aria-describedby) */}
      <section className="space-y-4">
        <h2 className="text-h3">4. Associated with Form Input</h2>
        <p className="text-body-sm text-secondary">
          Help text properly associated with form elements using aria-describedby
        </p>
        <div className="space-y-3">
          <label
            htmlFor="file-input"
            className="block text-sm font-medium text-primary"
          >
            Select a file to convert
          </label>
          <input
            id="file-input"
            type="file"
            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
            aria-describedby="file-input-help"
            className="block w-full text-sm text-secondary
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-primary file:text-white
              hover:file:bg-primary-600
              cursor-pointer"
          />
          <InlineHelp
            id="file-input-help"
            title="Supported file types"
            content="We support PDF, Word documents (DOCX), images (JPG, PNG, GIF), and more. Files must be under 10MB in size."
          />
          {selectedFile && (
            <p className="text-sm text-success">
              Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
            </p>
          )}
        </div>
      </section>

      {/* Example 5: Multiple Help Sections in a Flow */}
      <section className="space-y-4">
        <h2 className="text-h3">5. Conversion Flow with Multiple Help Sections</h2>
        <p className="text-body-sm text-secondary">
          Multiple help sections guiding users through a multi-step process
        </p>
        <div className="space-y-6 p-6 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
          {/* Step 1 */}
          <div className="space-y-3">
            <h3 className="text-h4">Step 1: Select File</h3>
            <div className="p-4 border-2 border-dashed border-neutral-300 rounded-lg text-center">
              <p className="text-sm text-secondary">Drag and drop or click to upload</p>
            </div>
            <InlineHelp
              id="step1-help"
              title="File selection tips"
              content="Choose a file from your device. You can drag and drop it into the upload area or click to browse your files."
            />
          </div>

          {/* Step 2 */}
          <div className="space-y-3">
            <h3 className="text-h4">Step 2: Choose Format</h3>
            <select
              value={selectedFormat}
              onChange={(e) => setSelectedFormat(e.target.value)}
              aria-describedby="step2-help"
              className="w-full p-2 border-2 border-neutral-300 rounded-md"
            >
              <option value="">Select output format...</option>
              <option value="pdf">PDF</option>
              <option value="docx">Word (DOCX)</option>
              <option value="jpg">JPG Image</option>
              <option value="png">PNG Image</option>
            </select>
            <InlineHelp
              id="step2-help"
              title="Choosing the right format"
              content="PDF is best for documents you want to share. DOCX is ideal if you need to edit the file later. JPG and PNG work well for images."
            />
          </div>

          {/* Step 3 */}
          <div className="space-y-3">
            <h3 className="text-h4">Step 3: Convert</h3>
            <button
              aria-describedby="step3-help"
              className="w-full py-3 px-6 bg-gradient-primary text-white rounded-md font-semibold
                hover:shadow-lg transition-all duration-200"
            >
              Start Conversion
            </button>
            <InlineHelp
              id="step3-help"
              content="Click to start the conversion process. This usually takes 10-30 seconds depending on file size. You'll be able to download your converted file when it's ready."
              defaultCollapsed={false}
            />
          </div>
        </div>
      </section>

      {/* Example 6: Different Collapsed States */}
      <section className="space-y-4">
        <h2 className="text-h3">6. Different Initial States</h2>
        <p className="text-body-sm text-secondary">
          Help sections with different default collapsed states
        </p>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium mb-2">Collapsed by default (mobile-friendly):</p>
            <InlineHelp
              id="collapsed-default"
              title="Additional information"
              content="This help section is collapsed by default to save space on mobile devices. Users can expand it when they need help."
              defaultCollapsed={true}
            />
          </div>
          <div>
            <p className="text-sm font-medium mb-2">Expanded by default (important info):</p>
            <InlineHelp
              id="expanded-default"
              title="Important: Read before proceeding"
              content="This help section is expanded by default because it contains important information that users should see immediately."
              defaultCollapsed={false}
            />
          </div>
        </div>
      </section>

      {/* Example 7: Custom Styling */}
      <section className="space-y-4">
        <h2 className="text-h3">7. Custom Styling</h2>
        <p className="text-body-sm text-secondary">
          Help sections with custom CSS classes
        </p>
        <InlineHelp
          id="custom-styled"
          title="Custom styled help"
          content="This help section has custom styling applied through the className prop."
          className="shadow-lg"
        />
      </section>

      {/* Example 8: Real-world Conversion Scenario */}
      <section className="space-y-4">
        <h2 className="text-h3">8. Real-world Example: PDF to Word Converter</h2>
        <p className="text-body-sm text-secondary">
          Complete conversion interface with contextual help
        </p>
        <div className="p-6 bg-white dark:bg-neutral-900 rounded-lg shadow-md space-y-6">
          <div>
            <h3 className="text-h3 mb-2">PDF to Word Converter</h3>
            <p className="text-body-sm text-secondary">
              Convert your PDF documents to editable Word files
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Upload PDF File
              </label>
              <div className="p-8 border-2 border-dashed border-primary-300 rounded-lg text-center
                hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/10
                transition-colors cursor-pointer">
                <p className="text-sm text-secondary">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-tertiary mt-1">
                  PDF files up to 10MB
                </p>
              </div>
              <InlineHelp
                id="pdf-upload-help"
                title="PDF conversion tips"
                content="For best results, ensure your PDF is not password-protected and contains selectable text. Scanned PDFs may require OCR processing for accurate conversion."
              />
            </div>

            <InlineHelp
              id="privacy-notice"
              title="Your privacy is protected"
              content="All files are processed securely using 256-bit encryption. Your files are automatically deleted from our servers after 1 hour. We never access, store, or share your documents."
              collapsible={false}
            />

            <button
              className="w-full py-3 px-6 bg-gradient-primary text-white rounded-md font-semibold
                hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200
                disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              disabled
            >
              Convert to Word
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

export default InlineHelpExamples
