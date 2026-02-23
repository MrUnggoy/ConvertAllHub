# InlineHelp Component

## Overview

The `InlineHelp` component provides contextual help text for each step in the ConversionFlow. It features a collapsible design optimized for mobile devices to save screen space while maintaining accessibility.

## Features

- **Collapsible Help Text**: Saves space on mobile with collapsed state by default
- **Mobile-Optimized**: Automatically adapts to mobile viewports with collapsed state
- **Accessibility**: Proper aria-describedby associations for screen readers
- **Keyboard Navigation**: Full keyboard support (Enter/Space to toggle)
- **Smooth Animations**: Fade-in animations for expand/collapse transitions
- **Visual Indicators**: Clear icons showing help availability and state

## Requirements Validation

**Validates: Requirements 5.4** - Inline help text for each step without requiring external documentation

## Usage

### Basic Collapsible Help

```tsx
import { InlineHelp } from '@/components/InlineHelp'

function FileUploadStep() {
  return (
    <div>
      <label htmlFor="file-input">Select a file</label>
      <input
        id="file-input"
        type="file"
        aria-describedby="file-help"
      />
      <InlineHelp
        id="file-help"
        title="Need help selecting a file?"
        content="Click the upload area or drag and drop your file. Supported formats: PDF, DOCX, JPG, PNG. Maximum file size: 10MB."
      />
    </div>
  )
}
```

### Always Expanded Help

```tsx
<InlineHelp
  id="format-help"
  title="Choose your output format"
  content="Select the format you want to convert your file to. The conversion will preserve your document's formatting and quality."
  collapsible={false}
/>
```

### Simple Help Without Title

```tsx
<InlineHelp
  id="privacy-help"
  content="Your files are automatically deleted after 1 hour for your privacy and security."
  collapsible={false}
/>
```

### With aria-describedby Association

```tsx
function ConversionStep() {
  return (
    <div>
      <button
        aria-describedby="convert-help"
        onClick={handleConvert}
      >
        Convert File
      </button>
      <InlineHelp
        id="convert-help"
        content="Click to start the conversion process. This usually takes 10-30 seconds depending on file size."
      />
    </div>
  )
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `id` | `string` | **Required** | Unique ID for aria-describedby associations |
| `title` | `string` | `undefined` | Optional title/heading for the help text |
| `content` | `string` | **Required** | Help text content to display |
| `collapsible` | `boolean` | `true` | Whether the help text is collapsible |
| `defaultCollapsed` | `boolean` | `true` | Initial collapsed state |
| `className` | `string` | `undefined` | Additional CSS classes |

## Accessibility

### ARIA Attributes

- **`role="region"`**: Identifies the help section as a landmark region
- **`aria-label`**: Provides accessible name (uses title or "Help information")
- **`aria-expanded`**: Indicates collapsed/expanded state for collapsible help
- **`aria-controls`**: Associates toggle button with content area
- **`aria-describedby`**: Used by form elements to reference help text

### Keyboard Navigation

- **Tab**: Focus on collapsible help toggle button
- **Enter/Space**: Toggle expand/collapse state
- **Screen Readers**: Content is always available to screen readers (via sr-only when collapsed)

### Focus Management

- Visible focus indicators with 2px ring
- Focus offset for better visibility
- Hover states for better discoverability

## Mobile Optimization

### Collapsed by Default

On mobile devices, help text is collapsed by default to save valuable screen space. Users can tap to expand when they need assistance.

### Touch-Friendly

- Large touch targets (minimum 44x44px)
- Clear visual indicators for interactive elements
- Smooth animations for better user feedback

### Responsive Design

The component adapts to different screen sizes:
- **Mobile (< 768px)**: Collapsed by default, compact layout
- **Desktop (≥ 768px)**: Can be expanded by default, more spacious layout

## Design System Integration

### Colors

Uses the design system's blue color scale for help indicators:
- Background: `bg-blue-50` / `dark:bg-blue-900/20`
- Border: `border-blue-200` / `dark:border-blue-800`
- Text: `text-blue-900` / `dark:text-blue-100`
- Icon: `text-blue-600` / `dark:text-blue-400`

### Spacing

Follows the design system spacing scale:
- Padding: `p-3` (12px)
- Gap: `gap-3` (12px)
- Border: `border-2` (2px)

### Typography

- Title: `text-sm font-medium` (14px, weight 500)
- Content: `text-sm leading-relaxed` (14px, relaxed line height)

## Best Practices

### When to Use

✅ **Use InlineHelp when:**
- Providing contextual guidance for form inputs
- Explaining step-by-step processes
- Clarifying complex features or options
- Offering tips for better results

❌ **Don't use InlineHelp for:**
- Critical error messages (use ErrorDisplay instead)
- Primary instructions (use regular text)
- Long documentation (link to external docs)
- Marketing content (use appropriate components)

### Content Guidelines

1. **Be Concise**: Keep help text brief and to the point (1-3 sentences)
2. **Be Specific**: Provide actionable guidance, not generic advice
3. **Be Clear**: Use simple language, avoid jargon
4. **Be Helpful**: Answer the question "How do I...?" or "What does this mean?"

### Accessibility Guidelines

1. **Always provide an ID**: Required for aria-describedby associations
2. **Associate with form elements**: Use aria-describedby on inputs
3. **Provide meaningful titles**: Help users understand what the help is about
4. **Keep content accessible**: Screen readers can access collapsed content

## Examples

### File Upload Help

```tsx
<InlineHelp
  id="file-upload-help"
  title="Supported file formats"
  content="You can upload PDF, Word (DOCX), Excel (XLSX), PowerPoint (PPTX), and image files (JPG, PNG, GIF). Maximum file size is 10MB."
/>
```

### Format Selection Help

```tsx
<InlineHelp
  id="format-selection-help"
  title="Choosing the right format"
  content="PDF is best for documents you want to share. DOCX is ideal if you need to edit the file later. JPG works well for images and photos."
/>
```

### Privacy Information

```tsx
<InlineHelp
  id="privacy-info"
  content="Your files are processed securely and automatically deleted after 1 hour. We never store or share your files."
  collapsible={false}
/>
```

### Conversion Tips

```tsx
<InlineHelp
  id="conversion-tips"
  title="Tips for better results"
  content="For best results, ensure your file is not password-protected and contains readable text. Scanned documents may require OCR processing."
  defaultCollapsed={false}
/>
```

## Related Components

- **ErrorDisplay**: For error messages and warnings
- **LoadingIndicator**: For loading states during conversion
- **StepIndicator**: For showing progress through conversion steps
- **ConversionFlow**: Parent component that uses InlineHelp

## Testing

The component includes comprehensive test coverage:
- Collapsible behavior (expand/collapse)
- Keyboard navigation (Enter/Space)
- Accessibility attributes (ARIA)
- Mobile optimization (collapsed state)
- Screen reader support

See `InlineHelp.test.tsx` for full test suite.
