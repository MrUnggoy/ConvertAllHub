import { ReactNode } from 'react'
import Navigation from './Navigation'
import ToolCategoryNav from './ToolCategoryNav'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <ToolCategoryNav />
      
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}