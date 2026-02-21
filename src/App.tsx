import { Routes, Route } from 'react-router-dom'
import { ConversionProvider } from './contexts/ConversionContext'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import ToolPage from './pages/ToolPage'
import CategoryPage from './pages/CategoryPage'

function App() {
  return (
    <ConversionProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/category/:category" element={<CategoryPage />} />
          <Route path="/tool/:toolId" element={<ToolPage />} />
        </Routes>
      </Layout>
    </ConversionProvider>
  )
}

export default App