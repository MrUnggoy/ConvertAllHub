# LoadingIndicator Component

## Overview

The LoadingIndicator component provides feedback during loading states with three distinct types: spinner, skeleton, and progress. It implements a 1-second delay before display to prevent flash for fast operations, improving perceived performance.

## Features

- **Three Types**: Spinner (indeterminate), Skeleton (content structure), Progress (determinate)
- **Smart Delay**: 1-second delay before display prevents flash for fast operations (Requirement 9.5)
- **Accessible**: Full ARIA support with screen reader announcements (Requirement 8.2)
- **Smooth Animation**: Fade-in animation for polished appearance
- **Flexible Sizing**: Small, medium, and large size options
- **Progress Tracking**: Visual progress bar with percentage display

## Usage

### Basic Spinner

```tsx
import { LoadingIndicator } from './components/LoadingIndicator'

// Simple spinner
<LoadingIndicator type="spinner" message="Loading..." />

// Large spinner
<LoadingIndicator type="spinner" size="large" message="Processing..." />
```

### Skeleton Loader

```tsx
// Content skeleton
<LoadingIndicator type="skeleton" size="medium" />

// With message
<LoadingIndicator 
  type="skeleton" 
  size="large" 
  message="Loading article..." 
/>
```

### Progress Bar

```tsx
// File conversion progress
<LoadingIndicator 
  type="progress" 
  progress={45} 
  message="Converting file..." 
/>

// Upload progress
<LoadingIndicator 
  type="progress" 
  progress={uploadProgress} 
  message="Uploading..." 
/>
```

### Custom Delay

```tsx
// No delay (immediate display)
<LoadingIndicator type="spinner" delay={0} />

// Custom 2-second delay
<LoadingIndicator type="spinner" delay={2000} />
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `type` | `'spinner' \| 'skeleton' \| 'progress'` | Required | Type of loading indicator |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | Size of the indicator |
| `progress` | `number` | `0` | Progress percentage (0-100) for progress type |
| `message` | `string` | `undefined` | Optional message to display |
| `className` | `string` | `''` | Additional CSS classes |
| `delay` | `number` | `1000` | Delay in milliseconds before showing indicator |

## When to Use Each Type

### Spinner
- API requests
- Form submissions
- Quick operations (< 1 second expected)
- Button loading states
- General indeterminate loading

### Skeleton
- Page content loading
- List items loading
- Card layouts loading
- Initial page render
- When you want to show layout structure

### Progress
- File uploads
- File conversions
- Multi-step processes
- Long operations with trackable progress
- Any operation where you can calculate percentage complete

## Accessibility

The LoadingIndicator component is fully accessible:

- **ARIA Attributes**: Uses `role="status"`, `aria-live="polite"`, and `aria-busy="true"`
- **Screen Reader Text**: Provides hidden text for screen readers with loading context
- **Progress Announcements**: Progress type announces percentage completion
- **Reduced Motion**: Respects `prefers-reduced-motion` user preference
- **Semantic HTML**: Uses appropriate HTML elements and attributes

## Design System Integration

The component uses design system tokens:

- **Colors**: `--color-primary`, `--color-neutral-*`, `--gradient-primary`
- **Typography**: `text-body-sm`, `text-secondary`
- **Animations**: `animate-fade-in`, `animate-spin`, `loading-skeleton`
- **Spacing**: Design system spacing scale

## Performance

The 1-second delay is a key performance optimization:

- **Prevents Flash**: Fast operations don't show loading indicator
- **Improves Perception**: Users don't see unnecessary loading states
- **Reduces Jank**: Fewer DOM updates for quick operations
- **Configurable**: Can be adjusted or disabled per use case

## Examples

See `LoadingIndicator.example.tsx` for comprehensive examples of all variations and use cases.

## Requirements Validation

- ✅ **Requirement 9.5**: Loading indicator displays after 1 second for operations exceeding 1 second
- ✅ **Requirement 8.2**: Semantic HTML with proper ARIA attributes
- ✅ **Requirement 8.4**: Accessible to screen readers with announcements
- ✅ **Requirement 11.1**: Uses design system color palette
- ✅ **Requirement 11.3**: Uses design system spacing scale

## Testing

The component includes comprehensive tests in `LoadingIndicator.test.tsx`:

- Delay timing tests
- Type-specific rendering tests
- Accessibility tests
- Animation tests
- Progress clamping tests
- Custom styling tests

Run tests with: `npm test LoadingIndicator.test.tsx`
