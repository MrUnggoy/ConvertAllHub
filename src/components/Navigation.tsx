import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Home, Settings, Menu, X } from 'lucide-react'

export default function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <nav className="border-b bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center space-x-2 min-h-[44px] min-w-[44px]">
            <Home className="h-6 w-6" />
            <span className="text-xl font-bold">ConvertAll Hub</span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <button 
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Settings"
            >
              <Settings className="h-5 w-5" />
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md min-h-[44px] min-w-[44px] flex items-center justify-center"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col space-y-2">
              <Link
                to="/"
                className="px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md min-h-[44px] flex items-center"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Home className="h-5 w-5 mr-3" />
                <span>Home</span>
              </Link>
              <button
                className="px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md min-h-[44px] flex items-center text-left w-full"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Settings className="h-5 w-5 mr-3" />
                <span>Settings</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}