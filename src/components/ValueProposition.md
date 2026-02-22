# ValueProposition Component

## Overview

The `ValueProposition` component communicates the core value of ConvertAllHub to first-time visitors within the first 600px of viewport height. It follows the what/who/why structure to clearly explain the service.

## Purpose

- Communicate what the service does
- Identify who it's for
- Explain why users should care
- Load within 50ms for immediate visibility
- Use responsive typography for all screen sizes

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `what` | `string` | Yes | Primary value statement (e.g., "Free online file conversion tools") |
| `who` | `string` | Yes | Target audience (e.g., "for everyone") |
| `why` | `string` | Yes | Key benefits (e.g., "Fast, secure, private") |
| `className` | `string` | No | Additional CSS classes for custom styling |

## Design Specifications

### Typography

- **What (Primary)**: 1.25rem (mobile) → 1.5rem (desktop), weight 600
- **Who (Secondary)**: 1rem (mobile) → 1.125rem (desktop), weight 500
- **Why (Tertiary)**: 0.875rem (mobile) → 1rem (desktop), weight 500

### Responsive Behavior

Uses CSS `clamp()` function for fluid typography that scales smoothly between mobile and desktop breakpoints without media queries.

### Accessibility

- Semantic HTML with proper heading hierarchy
- ARIA region role with descriptive label
- High contrast text (white/95% opacity on gradient backgrounds)
- Readable font sizes meeting WCAG AA standards

## Usage

### Basic Usage

```tsx
import ValueProposition from '@/components/ValueProposition'

function HeroSection() {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8">
      <ValueProposition
        what="Free online file conversion tools"
        who="for everyone"
        why="Fast, secure, private"
      />
    </div>
  )
}
```

### With Custom Styling

```tsx
<ValueProposition
  what="Professional document conversion"
  who="for businesses and individuals"
  why="No signup required, instant results"
  className="max-w-2xl mx-auto"
/>
```

### In Hero Section

```tsx
import HeroSection from '@/components/HeroSection'
import ValueProposition from '@/components/ValueProposition'
import PrimaryCTA from '@/components/PrimaryCTA'

function HomePage() {
  return (
    <HeroSection title="ConvertAllHub" tagline="Your files, your way">
      <ValueProposition
        what="Free online file conversion tools"
        who="for everyone"
        why="Fast, secure, private"
      />
      <PrimaryCTA text="Start Converting" />
    </HeroSection>
  )
}
```

## Requirements Validation

This component validates the following requirements:

- **1.1**: Displays value proposition within first 600px of vertical space
- **1.2**: Includes what, who, and why in the statement
- **1.3**: Readable within 50ms of page load (minimal CSS, no images)
- **1.4**: Presented before secondary content in hero section
- **1.5**: Uses clear, non-technical language

## Performance Considerations

- No external dependencies beyond React
- Minimal CSS (uses inline styles and Tailwind utilities)
- No images or heavy assets
- Fast render time for optimal FCP (First Contentful Paint)
- Uses CSS clamp() for responsive typography without JavaScript

## Browser Support

- Chrome/Edge: Last 2 versions
- Firefox: Last 2 versions
- Safari: Last 2 versions (iOS 13+)
- CSS clamp() support: All modern browsers

## Testing

See `ValueProposition.test.tsx` for comprehensive unit tests covering:

- Rendering all three value elements
- Accessibility (ARIA roles and labels)
- Responsive typography
- Custom className application
- Font weight hierarchy
- Viewport height requirements
