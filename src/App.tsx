import { Routes, Route } from 'react-router-dom'
import { ConversionProvider } from './contexts/ConversionContext'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import ToolPage from './pages/ToolPage'
import CategoryPage from './pages/CategoryPage'
import PrivacyPolicyPage from './pages/PrivacyPolicyPage'
import BrowserCompatibilityCheck from './components/BrowserCompatibilityCheck'
import ErrorBoundary from './components/ErrorBoundary'

function App() {
  return (
    <ErrorBoundary>
      <ConversionProvider>
        <Layout>
          <BrowserCompatibilityCheck />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/category/:category" element={<CategoryPage />} />
            <Route path="/tool/:toolId" element={<ToolPage />} />
            <Route path="/privacy" element={<PrivacyPolicyPage />} />
          </Routes>
        </Layout>
      </ConversionProvider>
    </ErrorBoundary>
  )
}

export default App