# ErrorDisplay Component

Clear, actionable error messages with recovery options for the ConvertAllHub application.

## Overview

The `ErrorDisplay` component provides user-friendly error, warning, and info messages with appropriate styling, icons, and recovery options. It implements auto-dismiss for info messages and supports collapsible technical details for debugging.

## Features

- **Three Severity Levels**: Error (red), Warning (amber), Info (blue)
- **Retry Functionality**: Optional retry button for recoverable errors
- **Dismiss Functionality**: Optional dismiss button with smooth animation
- **Collapsible Technical Details**: Expandable section for debugging information
- **Auto-dismiss**: Info messages automatically dismiss after 5 seconds
- **Accessibility**: Full ARIA support with screen reader announcements
- **Responsive Design**: Works on all screen sizes

## Requirements Validation

- **Requirement 12.1**: Displays clear error messages with supported formats for unsupported file types
- **Requirement 12.2**: Shows user-friendly messages with suggested actions for conversion errors
- **Requirement 12.5**: Uses plain language and avoids technical jargon in user messages

## Props

### ErrorDisplayProps

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `error` | `ConversionError` | Yes | Error object containing all error information |
| `severity` | `'error' \| 'warning' \| 'info'` | Yes | Severity level determines styling and behavior |
| `onRetry` | `() => void` | No | Callback when user clicks retry button |
| `onDismiss` | `() => void` | No | Callback when user dismisses the error |
| `className` | `string` | No | Additional CSS classes |

### ConversionError

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `code` | `string` | Yes | Error code for tracking and debugging |
| `message` | `string` | Yes | Technical error message |
| `userMessage` | `string` | Yes | User-friendly error message |
| `suggestedAction` | `string` | Yes | Suggested action for the user |
| `technicalDetails` | `string` | No | Optional technical details for debugging |

## Usage Examples

### Basic Error

```tsx
import ErrorDisplay from '@/components/ErrorDisplay'

function MyComponent() {
  return (
    <ErrorDisplay
      error={{
        code: 'NETWORK_ERROR',
        message: 'Failed to fetch',
        userMessage: 'Unable to connect to the server',
        suggestedAction: 'Check your internet connection and try again'
      }}
      severity="error"
    />
  )
}
```

### Error with Retry

```tsx
<ErrorDisplay
  error={{
    code: 'CONVERSION_FAILED',
    message: 'Conversion process failed',
    userMessage: 'We couldn\'t convert your file',
    suggestedAction: 'Try again or use a different file'
  }}
  severity="error"
  onRetry={handleRetry}
  onDismiss={handleDismiss}
/>
```

### Error with Technical Details

```tsx
<ErrorDisplay
  error={{
    code: 'INVALID_FORMAT',
    message: 'Unsupported file type',
    userMessage: 'This file type is not supported',
    suggestedAction: 'Please use PDF, DOCX, or TXT files',
    technicalDetails: 'File extension ".xyz" not in allowed formats. MIME type: application/octet-stream'
  }}
  severity="error"
  onDismiss={handleDismiss}
/>
```

### Warning Message

```tsx
<ErrorDisplay
  error={{
    code: 'FILE_TOO_LARGE',
    message: 'File size exceeds recommended limit',
    userMessage: 'Your file is larger than recommended',
    suggestedAction: 'Files over 10MB may take longer to process'
  }}
  severity="warning"
  onDismiss={handleDismiss}
/>
```

### Info Message (Auto-dismisses)

```tsx
<ErrorDisplay
  error={{
    code: 'FILE_UPLOADED',
    message: 'File uploaded successfully',
    userMessage: 'Your file is ready for conversion',
    suggestedAction: 'Select an output format to continue'
  }}
  severity="info"
  onDismiss={handleDismiss}
/>
```

## Severity Levels

### Error (Red)
- Used for critical errors that prevent task completion
- Requires user action to resolve
- Does not auto-dismiss
- Examples: Network errors, conversion failures, invalid file types

### Warning (Amber)
- Used for non-critical issues that may affect user experience
- User can continue but should be aware of the issue
- Does not auto-dismiss
- Examples: File size warnings, format compatibility warnings

### Info (Blue)
- Used for informational messages and success notifications
- Auto-dismisses after 5 seconds
- Examples: Upload success, processing started, helpful tips

## Behavior

### Auto-dismiss
- Info messages automatically dismiss after 5 seconds
- Error and warning messages do not auto-dismiss
- Dismissal includes a smooth fade-out animation

### Technical Details
- Collapsed by default to reduce visual clutter
- Toggle button shows/hides details
- Includes error code and stack trace when available
- Useful for debugging and support requests

### Retry Functionality
- Only shown when `onRetry` prop is provided
- Useful for network errors and temporary failures
- Preserves user context (e.g., uploaded file)

## Accessibility

- **ARIA Role**: Uses `role="alert"` for screen reader announcements
- **ARIA Live**: `assertive` for errors, `polite` for warnings/info
- **ARIA Atomic**: Ensures entire message is announced
- **ARIA Expanded**: Indicates technical details expansion state
- **ARIA Controls**: Links toggle button to details section
- **Screen Reader Text**: Hidden text provides full context
- **Keyboard Navigation**: All buttons are keyboard accessible
- **Focus Indicators**: Visible focus states on all interactive elements

## Styling

The component uses Tailwind CSS classes with severity-specific color schemes:

- **Error**: Red color palette (`red-50`, `red-600`, etc.)
- **Warning**: Amber color palette (`amber-50`, `amber-600`, etc.)
- **Info**: Blue color palette (`blue-50`, `blue-600`, etc.)

All colors meet WCAG 2.1 AA contrast requirements.

## Best Practices

### Error Messages
1. **Be Specific**: Clearly state what went wrong
2. **Be Helpful**: Provide actionable suggestions
3. **Be Human**: Use plain language, avoid jargon
4. **Be Concise**: Keep messages short and scannable

### When to Use Each Severity
- **Error**: Task cannot be completed
- **Warning**: Task can continue but user should be aware
- **Info**: Confirmation or helpful information

### Technical Details
- Include only when useful for debugging
- Keep technical details concise
- Include error codes for support reference

## Integration with Error Handling

The component works seamlessly with the existing error handling utilities:

```tsx
import { getUserFriendlyErrorMessage } from '@/utils/error-handling'
import ErrorDisplay from '@/components/ErrorDisplay'

function MyComponent() {
  const [error, setError] = useState<ConversionError | null>(null)

  const handleConversion = async () => {
    try {
      await convertFile(file)
    } catch (err) {
      setError({
        code: 'CONVERSION_FAILED',
        message: err.message,
        userMessage: getUserFriendlyErrorMessage(err, 'during conversion'),
        suggestedAction: 'Please try again or use a different file',
        technicalDetails: err.stack
      })
    }
  }

  return (
    <>
      {error && (
        <ErrorDisplay
          error={error}
          severity="error"
          onRetry={handleConversion}
          onDismiss={() => setError(null)}
        />
      )}
    </>
  )
}
```

## Testing

The component includes comprehensive unit tests covering:
- All severity levels
- Retry and dismiss functionality
- Collapsible technical details
- Auto-dismiss for info messages
- Accessibility features
- Edge cases

Run tests with:
```bash
npm test ErrorDisplay.test.tsx
```

## Related Components

- **ErrorBoundary**: Catches React errors and displays fallback UI
- **LoadingIndicator**: Shows loading states during operations
- **PrimaryCTA**: Action buttons that may trigger errors

## Related Utilities

- **error-handling.ts**: Error validation and user-friendly message generation
- **getUserFriendlyErrorMessage()**: Converts technical errors to user-friendly messages
- **validateFile()**: File validation that generates error messages
