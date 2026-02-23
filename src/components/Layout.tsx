import { ReactNode } from 'react'
import Navigation from './Navigation'
import ToolCategoryNav from './ToolCategoryNav'

interface LayoutProps {
  children: ReactNode
}

/**
 * Layout Component
 * 
 * Global layout wrapper that includes:
 * - Enhanced Navigation with sticky header behavior
 * - MobileMenu integration for responsive design
 * - ToolCategoryNav for tool browsing
 * - Main content area with consistent spacing
 * 
 * Validates: Requirements 7.1, 7.3, 7.5
 */
export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Enhanced Navigation with sticky header */}
      <Navigation />
      
      {/* Tool Category Navigation */}
      <ToolCategoryNav />
      
      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}