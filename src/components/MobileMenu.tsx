import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

export interface NavItem {
  label: string
  href: string
  icon?: React.ComponentType<{ className?: string }>
  onClick?: () => void
}

export interface MobileMenuProps {
  items: NavItem[]
  isOpen: boolean
  onClose: () => void
  currentPath?: string
}

/**
 * MobileMenu Component
 * 
 * A mobile-optimized navigation menu with:
 * - Slide-in animation from the right
 * - Backdrop with click-to-close
 * - Animated hamburger icon (handled by parent)
 * - 44x44px close button touch target
 * - Focus trap when open
 * - Escape key to close functionality
 * 
 * Validates: Requirements 6.3, 7.4
 */
export default function MobileMenu({ items, isOpen, onClose, currentPath }: MobileMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const firstFocusableRef = useRef<HTMLAnchorElement>(null)

  // Focus trap implementation
  useEffect(() => {
    if (!isOpen) return

    // Focus the close button when menu opens
    closeButtonRef.current?.focus()

    // Handle keyboard events
    const handleKeyDown = (e: KeyboardEvent) => {
      // Close on Escape key
      if (e.key === 'Escape') {
        onClose()
        return
      }

      // Focus trap: Tab key handling
      if (e.key === 'Tab') {
        const focusableElements = menuRef.current?.querySelectorAll<HTMLElement>(
          'button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        
        if (!focusableElements || focusableElements.length === 0) return

        const firstElement = focusableElements[0]
        const lastElement = focusableElements[focusableElements.length - 1]

        // Shift + Tab on first element: go to last
        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault()
          lastElement.focus()
        }
        // Tab on last element: go to first
        else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault()
          firstElement.focus()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    
    // Prevent body scroll when menu is open
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Menu Panel */}
      <div
        ref={menuRef}
        className="fixed top-0 right-0 bottom-0 w-[280px] max-w-[85vw] bg-white dark:bg-gray-900 shadow-2xl z-50 flex flex-col animate-slide-in-right"
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation menu"
      >
        {/* Header with Close Button */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Menu</h2>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            aria-label="Close menu"
          >
            <X className="h-6 w-6 text-gray-700 dark:text-gray-300" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-2">
            {items.map((item, index) => {
              const isActive = currentPath === item.href
              const Icon = item.icon

              return (
                <li key={item.href || index}>
                  <a
                    ref={index === 0 ? firstFocusableRef : undefined}
                    href={item.href}
                    onClick={(e) => {
                      if (item.onClick) {
                        e.preventDefault()
                        item.onClick()
                      }
                      onClose()
                    }}
                    className={`
                      flex items-center min-h-[44px] px-4 py-3 rounded-md
                      transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
                      ${isActive 
                        ? 'bg-primary/10 text-primary font-medium' 
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }
                    `}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    {Icon && (
                      <Icon className="h-5 w-5 mr-3 flex-shrink-0" />
                    )}
                    <span>{item.label}</span>
                  </a>
                </li>
              )
            })}
          </ul>
        </nav>
      </div>

      <style>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }

        .animate-slide-in-right {
          animation: slide-in-right var(--duration-normal, 300ms) var(--ease-out, cubic-bezier(0, 0, 0.2, 1));
        }
      `}</style>
    </>
  )
}
