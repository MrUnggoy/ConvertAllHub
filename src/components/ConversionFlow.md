# ConversionFlow Component

## Overview

The `ConversionFlow` component orchestrates the complete 3-step conversion process with a state machine architecture. It provides a guided, user-friendly interface for file conversion with inline validation, error recovery, and accessibility support.

## Features

- **3-Step State Machine**: File selection → Format selection → Conversion
- **Drag-and-Drop Upload**: Intuitive file upload with visual feedback
- **Click Upload**: Alternative file selection method
- **Format Selection**: Radio button interface for output format
- **Progress Indicator**: Real-time conversion progress display
- **Inline Validation**: Immediate feedback on file size and format
- **Error Recovery**: Retry and navigation without losing progress
- **Keyboard Navigation**: Full keyboard accessibility support
- **Component Integration**: Uses StepIndicator and InlineHelp components

## Requirements Validation

- **Requirement 5.1**: 3-step conversion flow (file, format, convert)
- **Requirement 5.2**: Visual feedback and step progression
- **Requirement 5.3**: Minimal decisions at each step
- **Requirement 5.4**: Inline help text for each step
- **Requirement 5.5**: No unrelated content during flow
- **Requirement 8.4**: Keyboard navigation support
- **Requirement 12.3**: Inline validation before submission
- **Requirement 12.4**: Error recovery without re-upload

## Usage

### Basic Example

```tsx
import ConversionFlow from '@/components/ConversionFlow'

function MyConverter() {
  const handleComplete = (result) => {
    console.log('Conversion complete:', result)
    // Handle download or display result
  }

  const handleError = (error) => {
    console.error('Conversion error:', error)
    // Handle error display or logging
  }

  return (
    <ConversionFlow
      toolId="pdf-converter"
      inputFormats={['pdf', 'docx', 'txt']}
      outputFormats={['pdf', 'jpg', 'png']}
      onComplete={handleComplete}
      onError={handleError}
    />
  )
}
```

### With Custom File Size Limit

```tsx
<ConversionFlow
  toolId="image-converter"
  inputFormats={['jpg', 'png', 'gif']}
  outputFormats={['jpg', 'png', 'webp']}
  maxFileSize={10 * 1024 * 1024} // 10MB
  onComplete={handleComplete}
  onError={handleError}
/>
```

### With Custom Styling

```tsx
<ConversionFlow
  toolId="document-converter"
  inputFormats={['docx', 'odt']}
  outputFormats={['pdf', 'txt']}
  onComplete={handleComplete}
  onError={handleError}
  className="my-custom-class"
/>
```

## Props

### ConversionFlowProps

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `toolId` | `string` | Yes | - | Unique identifier for the conversion tool |
| `inputFormats` | `string[]` | Yes | - | Array of supported input file formats (e.g., ['pdf', 'docx']) |
| `outputFormats` | `string[]` | Yes | - | Array of available output formats (e.g., ['jpg', 'png']) |
| `onComplete` | `(result: ConversionFlowResult) => void` | Yes | - | Callback when conversion completes successfully |
| `onError` | `(error: ConversionError) => void` | Yes | - | Callback when an error occurs |
| `maxFileSize` | `number` | No | `52428800` (50MB) | Maximum file size in bytes |
| `className` | `string` | No | - | Additional CSS classes |

### ConversionFlowResult

```typescript
interface ConversionFlowResult {
  file: Blob              // Converted file as Blob
  filename: string        // Suggested filename for download
  size: number           // File size in bytes
  downloadUrl: string    // Object URL for download
}
```

### ConversionError

```typescript
interface ConversionError {
  code: string              // Error code for tracking
  message: string           // Technical error message
  userMessage: string       // User-friendly message
  suggestedAction: string   // What user should do
  technicalDetails?: string // Optional debugging info
}
```

## Step-by-Step Flow

### Step 1: File Selection

**Purpose**: Allow users to upload a file via drag-drop or click

**Features**:
- Drag-and-drop zone with visual feedback
- Click to browse file system
- File validation (size and format)
- Visual confirmation when file is selected
- Inline help with supported formats

**Validation**:
- File size must not exceed `maxFileSize`
- File extension must be in `inputFormats`
- Clear error messages for validation failures

**Navigation**:
- "Next: Choose Format" button (disabled until valid file selected)

### Step 2: Format Selection

**Purpose**: Let users choose the desired output format

**Features**:
- Grid of format options with icons
- Visual selection feedback
- Format descriptions
- Inline help explaining format choices

**Validation**:
- At least one format must be selected

**Navigation**:
- "Back" button (returns to Step 1, preserves file)
- "Next: Convert" button (disabled until format selected)

### Step 3: Conversion

**Purpose**: Execute conversion and provide download

**Features**:
- Conversion summary (file name, format, size)
- Progress indicator during conversion
- Success message with download button
- Error display with retry option
- Inline help before conversion starts

**Validation**:
- Ensures file and format are still valid

**Navigation**:
- "Back" button (returns to Step 2, preserves selections)
- "Start Conversion" button (initiates conversion)
- "Download File" button (after successful conversion)
- "Convert Another File" button (resets to Step 1)

## State Management

The component uses internal state to manage:

```typescript
interface ConversionFlowState {
  currentStep: 1 | 2 | 3           // Current step in flow
  selectedFile: File | null         // Selected file
  selectedFormat: string | null     // Selected output format
  isConverting: boolean             // Conversion in progress
  progress: number                  // Conversion progress (0-100)
  error: ConversionError | null     // Current error
  result: ConversionFlowResult | null // Conversion result
}
```

## Error Handling

### Validation Errors

- **Invalid File Type**: Shows supported formats
- **File Too Large**: Shows size limit
- **No File Selected**: Prompts to select file
- **No Format Selected**: Prompts to select format

### Conversion Errors

- **Network Error**: Retry button preserves file
- **Conversion Failed**: Shows technical details (collapsible)
- **Unknown Error**: Generic error with support contact

### Error Recovery

- **Dismiss**: Clears error, stays on current step
- **Retry**: Re-attempts conversion without re-upload
- **Go Back**: Returns to previous step, preserves data
- **Start Over**: Resets entire flow

## Accessibility

### Keyboard Navigation

- **Tab**: Navigate between interactive elements
- **Enter/Space**: Activate buttons and select formats
- **Escape**: Dismiss errors (when applicable)

### Screen Reader Support

- **Step Announcements**: Current step announced on change
- **Progress Updates**: Conversion progress announced
- **Error Announcements**: Errors announced with severity
- **ARIA Labels**: All interactive elements properly labeled
- **ARIA Roles**: Proper roles for radiogroup, status, alert

### Focus Management

- **Visible Focus Indicators**: 2px ring on focused elements
- **Logical Tab Order**: Follows visual flow
- **Focus Preservation**: Focus maintained during state changes

## Integration

### With ConversionContext

The component integrates with the global `ConversionContext` to:
- Add files to the conversion queue
- Track conversion status
- Share state across components

### With StepIndicator

Uses the `StepIndicator` component to:
- Show current step (1/3, 2/3, 3/3)
- Display step titles and descriptions
- Provide visual progress feedback

### With InlineHelp

Uses the `InlineHelp` component to:
- Provide contextual help at each step
- Explain supported formats and limits
- Guide users through the process

### With ErrorDisplay

Uses the `ErrorDisplay` component to:
- Show validation and conversion errors
- Provide retry and recovery options
- Display technical details when needed

### With LoadingIndicator

Uses the `LoadingIndicator` component to:
- Show conversion progress
- Display percentage complete
- Provide visual feedback during processing

## Styling

The component uses Tailwind CSS classes and follows the design system:

- **Colors**: Primary gradient for CTAs, neutral for backgrounds
- **Spacing**: Consistent spacing scale (4, 6, 8, 12, 16, 24)
- **Typography**: Font size hierarchy (text-sm, text-lg, text-2xl)
- **Transitions**: Smooth 200-300ms transitions
- **Shadows**: Elevation on hover for interactive elements

### Custom Styling

Add custom classes via the `className` prop:

```tsx
<ConversionFlow
  className="my-custom-flow"
  // ... other props
/>
```

## Performance

- **Lazy Loading**: Components loaded on demand
- **Debounced Validation**: File validation debounced to prevent lag
- **Progress Updates**: Throttled to 100ms intervals
- **Memory Management**: Object URLs cleaned up after use

## Browser Support

- **Modern Browsers**: Chrome, Firefox, Safari, Edge (last 2 versions)
- **File API**: Required for file upload
- **Drag and Drop API**: Required for drag-drop upload
- **Blob API**: Required for file download

## Testing

The component includes comprehensive tests:

- **Unit Tests**: Individual function testing
- **Integration Tests**: Step-by-step flow testing
- **Accessibility Tests**: Keyboard and screen reader testing
- **Error Handling Tests**: Validation and recovery testing

Run tests:

```bash
npm test ConversionFlow.test.tsx
```

## Examples

See `ConversionFlow.example.tsx` for interactive examples.

## Related Components

- `StepIndicator`: Visual step progress indicator
- `InlineHelp`: Contextual help component
- `ErrorDisplay`: Error message display
- `LoadingIndicator`: Progress and loading states
- `FileUpload`: Alternative file upload component
- `ConversionProgress`: Batch conversion progress

## Future Enhancements

- **Batch Processing**: Support multiple files
- **Format Presets**: Quick format selection presets
- **Conversion Options**: Quality, resolution, etc.
- **Preview**: Preview before conversion
- **History**: Recent conversions list
