import { useState } from 'react'
import MobileMenu, { type NavItem } from './MobileMenu'
import { Home, Settings, Info, FileText, Mail, Menu, X } from 'lucide-react'

/**
 * MobileMenu Component Examples
 * 
 * Demonstrates various usage patterns for the MobileMenu component
 */

// Example 1: Basic Mobile Menu
export function BasicMobileMenu() {
  const [isOpen, setIsOpen] = useState(false)

  const items: NavItem[] = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Settings', href: '/settings', icon: Settings },
    { label: 'About', href: '/about', icon: Info },
  ]

  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-4">Basic Mobile Menu</h3>
      
      {/* Hamburger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-md bg-primary text-white hover:bg-primary/90 transition-colors"
        aria-label="Toggle menu"
        aria-expanded={isOpen}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      <MobileMenu
        items={items}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </div>
  )
}

// Example 2: Mobile Menu with Active State
export function MobileMenuWithActiveState() {
  const [isOpen, setIsOpen] = useState(false)
  const [currentPath] = useState('/')

  const items: NavItem[] = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Settings', href: '/settings', icon: Settings },
    { label: 'About', href: '/about', icon: Info },
    { label: 'Contact', href: '/contact', icon: Mail },
  ]

  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-4">Mobile Menu with Active State</h3>
      
      <div className="flex items-center gap-4 mb-4">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-md bg-primary text-white hover:bg-primary/90 transition-colors"
          aria-label="Toggle menu"
          aria-expanded={isOpen}
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
        
        <span className="text-sm text-gray-600">Current: {currentPath}</span>
      </div>

      <MobileMenu
        items={items}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        currentPath={currentPath}
      />
    </div>
  )
}

// Example 3: Mobile Menu with Custom Actions
export function MobileMenuWithCustomActions() {
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState('')

  const items: NavItem[] = [
    { label: 'Home', href: '/', icon: Home },
    { 
      label: 'Settings', 
      href: '/settings', 
      icon: Settings,
      onClick: () => setMessage('Settings clicked!')
    },
    { 
      label: 'Show Alert', 
      href: '#', 
      icon: Info,
      onClick: () => {
        setMessage('Custom action triggered!')
        setTimeout(() => setMessage(''), 3000)
      }
    },
  ]

  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-4">Mobile Menu with Custom Actions</h3>
      
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-md bg-primary text-white hover:bg-primary/90 transition-colors"
        aria-label="Toggle menu"
        aria-expanded={isOpen}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {message && (
        <div className="mt-4 p-3 bg-blue-100 text-blue-800 rounded-md">
          {message}
        </div>
      )}

      <MobileMenu
        items={items}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </div>
  )
}

// Example 4: Mobile Menu without Icons
export function MobileMenuWithoutIcons() {
  const [isOpen, setIsOpen] = useState(false)

  const items: NavItem[] = [
    { label: 'Home', href: '/' },
    { label: 'About', href: '/about' },
    { label: 'Services', href: '/services' },
    { label: 'Portfolio', href: '/portfolio' },
    { label: 'Contact', href: '/contact' },
  ]

  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-4">Mobile Menu without Icons</h3>
      
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-md bg-primary text-white hover:bg-primary/90 transition-colors"
        aria-label="Toggle menu"
        aria-expanded={isOpen}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      <MobileMenu
        items={items}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </div>
  )
}

// Example 5: Animated Hamburger Button
export function AnimatedHamburgerButton() {
  const [isOpen, setIsOpen] = useState(false)

  const items: NavItem[] = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Documents', href: '/documents', icon: FileText },
    { label: 'Settings', href: '/settings', icon: Settings },
  ]

  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-4">Animated Hamburger Button</h3>
      
      {/* Animated Hamburger Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-md bg-primary text-white hover:bg-primary/90 transition-all"
        aria-label="Toggle menu"
        aria-expanded={isOpen}
      >
        <div className="relative w-6 h-6 flex flex-col justify-center items-center">
          <span
            className={`block w-6 h-0.5 bg-white transition-all duration-300 ${
              isOpen ? 'rotate-45 translate-y-0' : '-translate-y-2'
            }`}
          />
          <span
            className={`block w-6 h-0.5 bg-white transition-all duration-300 ${
              isOpen ? 'opacity-0' : 'opacity-100'
            }`}
          />
          <span
            className={`block w-6 h-0.5 bg-white transition-all duration-300 ${
              isOpen ? '-rotate-45 -translate-y-2' : 'translate-y-2'
            }`}
          />
        </div>
      </button>

      <MobileMenu
        items={items}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </div>
  )
}

// Example 6: Full Navigation Integration
export function FullNavigationExample() {
  const [isOpen, setIsOpen] = useState(false)
  const [currentPath] = useState('/')

  const items: NavItem[] = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'About', href: '/about', icon: Info },
    { label: 'Services', href: '/services', icon: FileText },
    { label: 'Contact', href: '/contact', icon: Mail },
    { label: 'Settings', href: '/settings', icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-2">
              <Home className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">ConvertAll Hub</span>
            </div>
            
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden min-h-[44px] min-w-[44px] flex items-center justify-center rounded-md hover:bg-gray-100 transition-colors"
              aria-label="Toggle menu"
              aria-expanded={isOpen}
            >
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Page Content */}
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">Full Navigation Example</h1>
        <p className="text-gray-600 mb-4">
          This example shows how the MobileMenu integrates with a full navigation bar.
          Click the menu button in the top right to open the mobile menu.
        </p>
        <p className="text-sm text-gray-500">
          Current page: {currentPath}
        </p>
      </main>

      {/* Mobile Menu */}
      <MobileMenu
        items={items}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        currentPath={currentPath}
      />
    </div>
  )
}

// Export all examples
export default function MobileMenuExamples() {
  return (
    <div className="space-y-8 p-8">
      <h1 className="text-3xl font-bold mb-8">MobileMenu Component Examples</h1>
      
      <div className="grid gap-8">
        <BasicMobileMenu />
        <MobileMenuWithActiveState />
        <MobileMenuWithCustomActions />
        <MobileMenuWithoutIcons />
        <AnimatedHamburgerButton />
      </div>
      
      <div className="mt-12">
        <FullNavigationExample />
      </div>
    </div>
  )
}
