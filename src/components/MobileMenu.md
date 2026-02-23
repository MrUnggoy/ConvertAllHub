# MobileMenu Component

A mobile-optimized navigation menu component with slide-in animation, backdrop, focus trap, and keyboard navigation support.

## Features

- ✅ Slide-in animation from the right
- ✅ Backdrop with click-to-close functionality
- ✅ 44x44px minimum touch targets (WCAG compliant)
- ✅ Focus trap when open
- ✅ Escape key to close
- ✅ Body scroll lock when open
- ✅ Active page highlighting
- ✅ Keyboard navigation support
- ✅ ARIA attributes for accessibility

## Requirements Validation

**Validates: Requirements 6.3, 7.4**

- **Requirement 6.3**: Mobile-first responsive design with navigation adaptation
- **Requirement 7.4**: Mobile navigation that doesn't obscure content

## Props

### `MobileMenuProps`

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `items` | `NavItem[]` | Yes | - | Array of navigation items to display |
| `isOpen` | `boolean` | Yes | - | Controls menu visibility |
| `onClose` | `() => void` | Yes | - | Callback when menu should close |
| `currentPath` | `string` | No | - | Current page path for highlighting active item |

### `NavItem`

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `label` | `string` | Yes | Display text for the navigation item |
| `href` | `string` | Yes | URL or path for the navigation link |
| `icon` | `React.ComponentType<{ className?: string }>` | No | Optional icon component (e.g., from lucide-react) |
| `onClick` | `() => void` | No | Optional custom click handler |

## Usage

### Basic Usage

```tsx
import { useState } from 'react'
import MobileMenu from './components/MobileMenu'
import { Home, Settings, Info } from 'lucide-react'

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const navItems = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Settings', href: '/settings', icon: Settings },
    { label: 'About', href: '/about', icon: Info },
  ]

  return (
    <>
      <button onClick={() => setIsMenuOpen(true)}>
        Open Menu
      </button>

      <MobileMenu
        items={navItems}
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
      />
    </>
  )
}
```

### With Active Page Highlighting

```tsx
import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import MobileMenu from './components/MobileMenu'

function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const location = useLocation()

  const navItems = [
    { label: 'Home', href: '/' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ]

  return (
    <MobileMenu
      items={navItems}
      isOpen={isMenuOpen}
      onClose={() => setIsMenuOpen(false)}
      currentPath={location.pathname}
    />
  )
}
```

### With Custom Click Handlers

```tsx
import { useState } from 'react'
import MobileMenu from './components/MobileMenu'

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const navItems = [
    { label: 'Home', href: '/' },
    { 
      label: 'Logout', 
      href: '#',
      onClick: () => {
        // Custom logout logic
        console.log('Logging out...')
      }
    },
  ]

  return (
    <MobileMenu
      items={navItems}
      isOpen={isMenuOpen}
      onClose={() => setIsMenuOpen(false)}
    />
  )
}
```

### Animated Hamburger Button

```tsx
import { useState } from 'react'
import MobileMenu from './components/MobileMenu'
import { Menu, X } from 'lucide-react'

function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="min-h-[44px] min-w-[44px]"
        aria-label="Toggle menu"
        aria-expanded={isMenuOpen}
      >
        {isMenuOpen ? <X /> : <Menu />}
      </button>

      <MobileMenu
        items={navItems}
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
      />
    </>
  )
}
```

## Behavior

### Opening and Closing

The menu can be closed by:
- Clicking the close button (X icon)
- Clicking the backdrop
- Pressing the Escape key
- Clicking a navigation item

### Focus Management

When the menu opens:
1. Focus automatically moves to the close button
2. Focus is trapped within the menu
3. Tab/Shift+Tab cycles through focusable elements
4. Focus returns to the trigger element when closed (handled by parent)

### Scroll Lock

When the menu is open, body scrolling is prevented to avoid background content scrolling while the menu is visible.

### Keyboard Navigation

| Key | Action |
|-----|--------|
| `Escape` | Close the menu |
| `Tab` | Move focus to next element (with wrapping) |
| `Shift + Tab` | Move focus to previous element (with wrapping) |
| `Enter` / `Space` | Activate focused link or button |

## Accessibility

### WCAG Compliance

- ✅ **Touch Targets**: All interactive elements are minimum 44x44px
- ✅ **Focus Indicators**: Visible focus rings on all focusable elements
- ✅ **Keyboard Navigation**: Full keyboard support
- ✅ **Screen Readers**: Proper ARIA attributes and semantic HTML
- ✅ **Focus Trap**: Focus contained within menu when open

### ARIA Attributes

- `role="dialog"` - Identifies the menu as a dialog
- `aria-modal="true"` - Indicates modal behavior
- `aria-label="Mobile navigation menu"` - Provides accessible name
- `aria-current="page"` - Marks the active navigation item
- `aria-expanded` - Should be set on the trigger button (parent component)

### Semantic HTML

- Uses `<nav>` for navigation container
- Uses `<ul>` and `<li>` for menu items
- Uses `<a>` tags for navigation links
- Uses `<button>` for the close button

## Styling

The component uses Tailwind CSS classes and is fully responsive. Key styling features:

- **Width**: 280px with max-width of 85vw
- **Position**: Fixed, full-height, right-aligned
- **Animation**: Slide-in from right (300ms)
- **Backdrop**: Semi-transparent black overlay
- **Shadow**: Large shadow for depth
- **Dark Mode**: Full dark mode support

### Custom Styling

You can customize the appearance by modifying the Tailwind classes in the component or by wrapping it in a styled container.

## Performance

- **Animation**: GPU-accelerated transforms
- **Scroll Lock**: Prevents unnecessary reflows
- **Event Listeners**: Properly cleaned up on unmount
- **Reduced Motion**: Respects `prefers-reduced-motion` media query

## Browser Support

- Chrome/Edge: Last 2 versions
- Firefox: Last 2 versions
- Safari: Last 2 versions
- Mobile Safari: iOS 13+
- Chrome Mobile: Android 8+

## Testing

The component includes comprehensive tests covering:
- Visibility states
- Navigation item rendering
- Close button functionality
- Backdrop interaction
- Keyboard navigation
- Focus trap
- Body scroll lock
- Accessibility attributes
- Touch target sizes
- Animation classes

Run tests with:
```bash
npm test MobileMenu.test.tsx
```

## Examples

See `MobileMenu.example.tsx` for complete working examples including:
- Basic mobile menu
- Menu with active state
- Menu with custom actions
- Menu without icons
- Animated hamburger button
- Full navigation integration

## Related Components

- `Navigation` - Main navigation component that uses MobileMenu
- `PrimaryCTA` - For consistent button styling
- `LoadingIndicator` - For loading states

## Notes

- The component handles its own focus trap and keyboard events
- Parent component should manage the `isOpen` state
- Parent component should provide the animated hamburger icon
- The component automatically prevents body scroll when open
- All navigation items close the menu when clicked
