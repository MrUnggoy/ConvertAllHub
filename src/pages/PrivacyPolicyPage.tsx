import { Shield, Lock, Eye, Server, Database, FileCheck } from 'lucide-react'
import MetaTags from '@/components/seo/MetaTags'

export default function PrivacyPolicyPage() {
  return (
    <article className="max-w-4xl mx-auto space-y-8">
      {/* SEO Meta Tags */}
      <MetaTags
        title="Privacy Policy - ConvertAll Hub"
        description="Learn how ConvertAll Hub protects your privacy with 100% client-side file processing. No uploads, no tracking, no data collection."
        canonicalUrl={typeof window !== 'undefined' ? `${window.location.origin}/privacy` : 'https://convertall.hub/privacy'}
        type="website"
      />

      {/* Header */}
      <header className="text-center space-y-4">
        <div className="flex justify-center">
          <Shield className="h-16 w-16 text-primary" aria-hidden="true" />
        </div>
        <h1 className="text-4xl font-bold">Privacy Policy</h1>
        <p className="text-lg text-muted-foreground">
          Your privacy is our top priority. Learn how we protect your data.
        </p>
        <p className="text-sm text-muted-foreground">
          Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </header>

      {/* Key Privacy Features */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="p-6 border rounded-lg space-y-3">
          <Lock className="h-8 w-8 text-green-600" aria-hidden="true" />
          <h3 className="font-semibold">100% Client-Side</h3>
          <p className="text-sm text-muted-foreground">
            All file processing happens in your browser. Your files never leave your device.
          </p>
        </div>
        
        <div className="p-6 border rounded-lg space-y-3">
          <Server className="h-8 w-8 text-blue-600" aria-hidden="true" />
          <h3 className="font-semibold">No Server Uploads</h3>
          <p className="text-sm text-muted-foreground">
            We don't have servers to store your files. Everything stays on your computer.
          </p>
        </div>
        
        <div className="p-6 border rounded-lg space-y-3">
          <Eye className="h-8 w-8 text-purple-600" aria-hidden="true" />
          <h3 className="font-semibold">No Tracking</h3>
          <p className="text-sm text-muted-foreground">
            We don't track what files you convert or collect any personal data.
          </p>
        </div>
      </div>

      {/* Detailed Policy */}
      <div className="prose prose-gray dark:prose-invert max-w-none space-y-8">
        <section>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <FileCheck className="h-6 w-6" aria-hidden="true" />
            How We Process Your Files
          </h2>
          <p>
            ConvertAll Hub is built with privacy as the foundation. When you use our tools:
          </p>
          <ul>
            <li>
              <strong>Files stay on your device:</strong> All file conversions are performed entirely in your web browser using JavaScript. 
              Your files are never uploaded to our servers or any third-party servers.
            </li>
            <li>
              <strong>No file storage:</strong> We do not store, save, or retain any files you process. Once you close your browser tab, 
              all data is immediately cleared from memory.
            </li>
            <li>
              <strong>No file access:</strong> We cannot see, access, or retrieve your files. The conversion process happens entirely 
              on your local machine.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Database className="h-6 w-6" aria-hidden="true" />
            Data We Collect
          </h2>
          <p>
            We believe in radical transparency. Here's exactly what data we collect:
          </p>
          
          <h3 className="text-xl font-semibold mt-6">What We DO Collect:</h3>
          <ul>
            <li>
              <strong>Basic analytics:</strong> We use privacy-friendly analytics to understand which tools are most popular 
              and how users navigate our site. This helps us improve the service.
            </li>
            <li>
              <strong>Technical information:</strong> Browser type, device type, and screen resolution to optimize the user experience.
            </li>
            <li>
              <strong>Error logs:</strong> Anonymous error reports to help us fix bugs and improve stability.
            </li>
          </ul>

          <h3 className="text-xl font-semibold mt-6">What We DO NOT Collect:</h3>
          <ul>
            <li>File names, file contents, or any information about the files you convert</li>
            <li>Personal information (name, email, address, phone number)</li>
            <li>IP addresses or precise location data</li>
            <li>Browsing history or activity on other websites</li>
            <li>Any data that could identify you personally</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold">Third-Party Services</h2>
          <p>
            We use minimal third-party services, and none of them have access to your files:
          </p>
          <ul>
            <li>
              <strong>Hosting:</strong> Our website is hosted on secure servers with HTTPS encryption. The hosting provider 
              only sees standard web traffic logs (page requests, timestamps) but never your file data.
            </li>
            <li>
              <strong>Analytics:</strong> We use privacy-focused analytics that don't track individual users or collect personal data.
            </li>
            <li>
              <strong>CDN:</strong> Static assets (JavaScript, CSS, fonts) are served through a Content Delivery Network for faster loading. 
              The CDN does not process or access your files.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold">Security Measures</h2>
          <p>
            We implement industry-standard security practices:
          </p>
          <ul>
            <li>
              <strong>HTTPS encryption:</strong> All connections to our website use HTTPS encryption to protect data in transit.
            </li>
            <li>
              <strong>No authentication required:</strong> We don't require accounts or logins, eliminating the risk of password breaches.
            </li>
            <li>
              <strong>Client-side processing:</strong> By processing files in your browser, we eliminate server-side security risks.
            </li>
            <li>
              <strong>Regular updates:</strong> We keep our dependencies and libraries up-to-date to patch security vulnerabilities.
            </li>
            <li>
              <strong>Content Security Policy:</strong> We implement strict CSP headers to prevent cross-site scripting attacks.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold">Your Rights</h2>
          <p>
            Since we don't collect personal data or store your files, there's nothing to delete or export. However, you have the right to:
          </p>
          <ul>
            <li>Use our service without creating an account</li>
            <li>Clear your browser cache and local storage at any time</li>
            <li>Block analytics cookies through your browser settings</li>
            <li>Request information about our data practices</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold">Cookies and Local Storage</h2>
          <p>
            We use minimal cookies and local storage:
          </p>
          <ul>
            <li>
              <strong>Essential cookies:</strong> Required for the website to function (theme preferences, language settings)
            </li>
            <li>
              <strong>Analytics cookies:</strong> Optional cookies for understanding site usage (can be disabled)
            </li>
            <li>
              <strong>No tracking cookies:</strong> We do not use cookies for advertising or cross-site tracking
            </li>
          </ul>
          <p>
            You can disable cookies in your browser settings, though some features may not work properly.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold">Children's Privacy</h2>
          <p>
            Our service is available to users of all ages. Since we don't collect personal information, 
            we don't knowingly collect data from children under 13. Parents can feel confident that their 
            children's files and data remain private when using our tools.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold">Changes to This Policy</h2>
          <p>
            We may update this privacy policy from time to time. Any changes will be posted on this page with 
            an updated "Last updated" date. We encourage you to review this policy periodically.
          </p>
          <p>
            If we make significant changes that affect how we handle your data, we will notify users through 
            a prominent notice on our website.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold">Contact Us</h2>
          <p>
            If you have questions about this privacy policy or our data practices, please contact us:
          </p>
          <ul>
            <li>Email: privacy@convertall.hub</li>
            <li>Website: https://convertall.hub</li>
          </ul>
        </section>

        <section className="border-t pt-6">
          <h2 className="text-2xl font-bold">Our Privacy Commitment</h2>
          <p className="text-lg font-medium">
            We built ConvertAll Hub because we believe file conversion should be private, secure, and accessible to everyone. 
            Your trust is important to us, and we're committed to maintaining the highest standards of privacy protection.
          </p>
          <p className="text-muted-foreground">
            <strong>Bottom line:</strong> Your files are yours. We never see them, store them, or share them. Period.
          </p>
        </section>
      </div>
    </article>
  )
}
