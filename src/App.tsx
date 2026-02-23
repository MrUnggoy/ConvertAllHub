import { Routes, Route } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { ConversionProvider } from './contexts/ConversionContext'
import Layout from './components/Layout'
import BrowserCompatibilityCheck from './components/BrowserCompatibilityCheck'
import ErrorBoundary from './components/ErrorBoundary'
import LoadingIndicator from './components/LoadingIndicator'
import DeferredStyles from './components/DeferredStyles'

// Lazy load page components for code splitting
const HomePage = lazy(() => import('./pages/HomePage'))
const ToolPage = lazy(() => import('./pages/ToolPage'))
const CategoryPage = lazy(() => import('./pages/CategoryPage'))
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage'))

function App() {
  return (
    <ErrorBoundary>
      <ConversionProvider>
        <Layout>
          <BrowserCompatibilityCheck />
          <Suspense fallback={
            <div className="flex items-center justify-center min-h-[60vh]">
              <LoadingIndicator 
                type="spinner" 
                size="large" 
                message="Loading page..." 
              />
            </div>
          }>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/category/:category" element={<CategoryPage />} />
              <Route path="/tool/:toolId" element={<ToolPage />} />
              <Route path="/privacy" element={<PrivacyPolicyPage />} />
            </Routes>
          </Suspense>
          
          {/* Defer non-critical CSS loading for optimal FCP (Requirements 9.1, 9.3) */}
          <DeferredStyles delay={100} />
        </Layout>
      </ConversionProvider>
    </ErrorBoundary>
  )
}

export default App