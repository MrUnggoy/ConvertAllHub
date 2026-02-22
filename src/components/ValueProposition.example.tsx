/**
 * ValueProposition Component Examples
 * 
 * Demonstrates usage of the ValueProposition component
 * in different contexts.
 */

import ValueProposition from './ValueProposition'

export default function ValuePropositionExamples() {
  return (
    <div className="space-y-12 p-8">
      <section>
        <h2 className="text-2xl font-bold mb-4">Default Usage</h2>
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8">
          <ValueProposition
            what="Free online file conversion tools"
            who="for everyone"
            why="Fast, secure, private"
          />
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Alternative Messaging</h2>
        <div className="bg-gradient-to-r from-indigo-600 to-pink-600 rounded-lg p-8">
          <ValueProposition
            what="Professional document conversion"
            who="for businesses and individuals"
            why="No signup required, instant results"
          />
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Short and Concise</h2>
        <div className="bg-gradient-to-r from-purple-600 to-red-600 rounded-lg p-8">
          <ValueProposition
            what="Convert any file format"
            who="for free"
            why="100% secure and private"
          />
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">With Custom Styling</h2>
        <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-lg p-8">
          <ValueProposition
            what="Transform your files instantly"
            who="for professionals"
            why="No limits, no watermarks"
            className="max-w-2xl mx-auto"
          />
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Mobile Preview (320px)</h2>
        <div className="max-w-[320px] mx-auto bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6">
          <ValueProposition
            what="Free online file conversion tools"
            who="for everyone"
            why="Fast, secure, private"
          />
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Tablet Preview (768px)</h2>
        <div className="max-w-[768px] mx-auto bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8">
          <ValueProposition
            what="Free online file conversion tools"
            who="for everyone"
            why="Fast, secure, private"
          />
        </div>
      </section>
    </div>
  )
}
