import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Home, Settings, Info, Shield } from 'lucide-react'
import MobileMenu, { NavItem } from './MobileMenu'

export default function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const location = useLocation()
  const currentPath = location.pathname

  // Sticky header on scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Navigation items for mobile menu
  const navItems: NavItem[] = [
    {
      label: 'Home',
      href: '/',
      icon: Home
    },
    {
      label: 'About',
      href: '/about',
      icon: Info
    },
    {
      label: 'Privacy',
      href: '/privacy',
      icon: Shield
    },
    {
      label: 'Settings',
      href: '/settings',
      icon: Settings
    }
  ]

  return (
    <nav 
      className={`
        sticky top-0 z-30 border-b bg-white dark:bg-gray-900 transition-shadow duration-300
        ${isScrolled ? 'shadow-md' : ''}
      `}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo - Always links to homepage */}
          <Link 
            to="/" 
            className="flex items-center space-x-2 min-h-[44px] min-w-[44px] hover:opacity-80 transition-opacity"
            aria-label="ConvertAll Hub - Home"
          >
            <Home className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold text-gray-900 dark:text-white">ConvertAll Hub</span>
          </Link>
          
          {/* Desktop Navigation - Limited to 7 items */}
          <div className="hidden md:flex items-center space-x-1">
            <Link
              to="/"
              className={`
                px-3 py-2 rounded-md text-sm font-medium transition-colors min-h-[44px] flex items-center
                ${currentPath === '/' 
                  ? 'text-primary border-b-2 border-primary' 
                  : 'text-gray-700 dark:text-gray-300 hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-800'
                }
              `}
              aria-current={currentPath === '/' ? 'page' : undefined}
            >
              Home
            </Link>
            <Link
              to="/about"
              className={`
                px-3 py-2 rounded-md text-sm font-medium transition-colors min-h-[44px] flex items-center
                ${currentPath === '/about' 
                  ? 'text-primary border-b-2 border-primary' 
                  : 'text-gray-700 dark:text-gray-300 hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-800'
                }
              `}
              aria-current={currentPath === '/about' ? 'page' : undefined}
            >
              About
            </Link>
            <Link
              to="/privacy"
              className={`
                px-3 py-2 rounded-md text-sm font-medium transition-colors min-h-[44px] flex items-center
                ${currentPath === '/privacy' 
                  ? 'text-primary border-b-2 border-primary' 
                  : 'text-gray-700 dark:text-gray-300 hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-800'
                }
              `}
              aria-current={currentPath === '/privacy' ? 'page' : undefined}
            >
              Privacy
            </Link>
            <button 
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors"
              aria-label="Settings"
            >
              <Settings className="h-5 w-5 text-gray-700 dark:text-gray-300" />
            </button>
          </div>

          {/* Mobile Menu Button - Animated hamburger */}
          <button
            className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
          >
            <div className="relative w-6 h-6 flex items-center justify-center">
              <div className={`hamburger-icon ${mobileMenuOpen ? 'open' : ''}`}>
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Menu Component */}
      <MobileMenu
        items={navItems}
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        currentPath={currentPath}
      />

      <style>{`
        .hamburger-icon {
          width: 24px;
          height: 24px;
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 5px;
        }

        .hamburger-icon span {
          display: block;
          width: 100%;
          height: 2px;
          background-color: currentColor;
          transition: all 0.3s ease;
          transform-origin: center;
        }

        .hamburger-icon.open span:nth-child(1) {
          transform: translateY(7px) rotate(45deg);
        }

        .hamburger-icon.open span:nth-child(2) {
          opacity: 0;
        }

        .hamburger-icon.open span:nth-child(3) {
          transform: translateY(-7px) rotate(-45deg);
        }
      `}</style>
    </nav>
  )
}