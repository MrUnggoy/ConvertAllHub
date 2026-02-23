# StepIndicator Component

A visual progress indicator component that shows users their current position in a multi-step process. Designed for conversion flows, form wizards, and other sequential user journeys.

## Features

- **Visual Progress Tracking**: Clear indication of completed, current, and upcoming steps
- **Accessibility First**: Screen reader announcements, ARIA labels, and semantic HTML
- **Responsive Design**: Adapts to mobile with simplified progress bar
- **Smooth Transitions**: Animated state changes between steps
- **Flexible Configuration**: Supports 2-5 steps with optional descriptions

## Requirements Validation

**Validates: Requirements 5.2** - Step progression feedback in conversion flow

## Usage

### Basic Example

```tsx
import { StepIndicator, Step } from '@/components/StepIndicator'

const steps: Step[] = [
  { number: 1, title: 'Select File', description: 'Choose a file to convert' },
  { number: 2, title: 'Choose Format', description: 'Pick output format' },
  { number: 3, title: 'Convert', description: 'Start conversion' },
]

function ConversionFlow() {
  const [currentStep, setCurrentStep] = useState(1)

  return (
    <StepIndicator
      currentStep={currentStep}
      totalSteps={3}
      steps={steps}
    />
  )
}
```

### With Step Navigation

```tsx
function InteractiveFlow() {
  const [currentStep, setCurrentStep] = useState(1)

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  return (
    <div>
      <StepIndicator
        currentStep={currentStep}
        totalSteps={3}
        steps={steps}
      />
      
      <div className="mt-6 flex justify-between">
        <button onClick={handlePrevious} disabled={currentStep === 1}>
          Previous
        </button>
        <button onClick={handleNext} disabled={currentStep === 3}>
          Next
        </button>
      </div>
    </div>
  )
}
```

### Simple Steps (No Descriptions)

```tsx
const simpleSteps: Step[] = [
  { number: 1, title: 'Upload' },
  { number: 2, title: 'Process' },
  { number: 3, title: 'Download' },
]

<StepIndicator
  currentStep={2}
  totalSteps={3}
  steps={simpleSteps}
/>
```

## Props

### StepIndicatorProps

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `currentStep` | `number` | Yes | - | Current active step (1-based index) |
| `totalSteps` | `number` | Yes | - | Total number of steps in the process |
| `steps` | `Step[]` | Yes | - | Array of step configurations |
| `className` | `string` | No | - | Additional CSS classes |

### Step Interface

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `number` | `number` | Yes | Step number (1-based) |
| `title` | `string` | Yes | Step title/label |
| `description` | `string` | No | Optional step description (hidden on mobile) |

## Visual States

### Completed Steps
- Gradient background (primary to secondary)
- Check mark icon
- Full opacity
- Connected by gradient line

### Current Step
- Gradient background with ring
- Step number displayed
- Scaled up (110%)
- Enhanced shadow
- Bold title text

### Upcoming Steps
- Gray background
- Step number displayed
- Reduced opacity
- Gray title text
- Connected by gray line

## Accessibility

### Screen Reader Support

The component provides comprehensive screen reader support:

```html
<!-- Live region announcement -->
<div role="status" aria-live="polite" aria-atomic="true">
  Step 2 of 3: Choose Format
</div>

<!-- Step labels -->
<div aria-label="Select File, completed">...</div>
<div aria-label="Choose Format, current step" aria-current="step">...</div>
<div aria-label="Convert, upcoming">...</div>
```

### ARIA Attributes

- `role="navigation"` - Identifies the component as navigation
- `aria-label="Progress"` - Labels the navigation region
- `aria-live="polite"` - Announces step changes
- `aria-current="step"` - Marks the current step
- `aria-atomic="true"` - Ensures complete announcement

### Keyboard Navigation

The component itself is not interactive, but should be used with keyboard-accessible navigation controls (Previous/Next buttons).

## Responsive Behavior

### Desktop (≥768px)
- Full step circles with numbers/check marks
- Step titles and descriptions visible
- Connector lines between steps
- Horizontal layout

### Mobile (<768px)
- Simplified step circles
- Step titles visible, descriptions hidden
- Additional progress bar at bottom
- Compact spacing

## Styling

### CSS Variables Used

```css
/* Colors */
--color-primary-500
--color-secondary-500
--color-primary-100
--color-primary-700
--color-neutral-200
--color-neutral-500

/* Spacing */
--spacing-2
--spacing-3
--spacing-6

/* Transitions */
--duration-normal (300ms)
--ease-out
```

### Custom Styling

```tsx
<StepIndicator
  currentStep={2}
  totalSteps={3}
  steps={steps}
  className="my-8 px-4"
/>
```

## Best Practices

### Do's ✓

- Use 3-5 steps for optimal user experience
- Keep step titles short (2-3 words)
- Provide clear descriptions for complex steps
- Update `currentStep` as user progresses
- Allow navigation back to previous steps when appropriate
- Test with screen readers

### Don'ts ✗

- Don't use more than 7 steps (consider breaking into multiple flows)
- Don't skip steps in the sequence
- Don't use vague step titles like "Step 1", "Step 2"
- Don't hide the indicator on mobile (use responsive design)
- Don't make steps clickable unless navigation is supported

## Common Use Cases

### File Conversion Flow

```tsx
const conversionSteps: Step[] = [
  { number: 1, title: 'Select File', description: 'Choose a file to convert' },
  { number: 2, title: 'Choose Format', description: 'Pick output format' },
  { number: 3, title: 'Convert', description: 'Start conversion' },
]
```

### Form Wizard

```tsx
const formSteps: Step[] = [
  { number: 1, title: 'Personal Info', description: 'Basic details' },
  { number: 2, title: 'Preferences', description: 'Your settings' },
  { number: 3, title: 'Review', description: 'Confirm details' },
  { number: 4, title: 'Complete', description: 'Finish setup' },
]
```

### Checkout Process

```tsx
const checkoutSteps: Step[] = [
  { number: 1, title: 'Cart', description: 'Review items' },
  { number: 2, title: 'Shipping', description: 'Delivery address' },
  { number: 3, title: 'Payment', description: 'Payment method' },
  { number: 4, title: 'Confirm', description: 'Place order' },
]
```

## Performance

- Lightweight component with minimal re-renders
- CSS transitions for smooth animations
- No external dependencies beyond Lucide icons
- Optimized for mobile with conditional rendering

## Browser Support

- Chrome/Edge: Last 2 versions ✓
- Firefox: Last 2 versions ✓
- Safari: Last 2 versions ✓
- Mobile Safari: iOS 13+ ✓
- Chrome Mobile: Android 8+ ✓

## Related Components

- **PrimaryCTA** - Use for step navigation buttons
- **LoadingIndicator** - Use during step processing
- **ErrorDisplay** - Use for step validation errors

## Examples

See `StepIndicator.example.tsx` for interactive examples including:
- Interactive 3-step conversion flow
- All steps completed state
- Two-step process
- Simple steps without descriptions
- Four-step process

## Testing

The component includes comprehensive tests covering:
- Basic rendering
- Step status changes (completed, current, upcoming)
- Accessibility features (ARIA, screen readers)
- Edge cases (first step, last step, two-step process)
- Visual progress indicators
- Step descriptions

Run tests:
```bash
npm test -- StepIndicator.test.tsx
```

## Changelog

### Version 1.0.0
- Initial release
- Support for 2-7 steps
- Accessibility features
- Responsive design
- Screen reader announcements
- Visual state indicators
