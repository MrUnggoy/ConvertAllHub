import { useRef } from 'react'
import { Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ToolDefinition } from '@/tools/registry'

interface MobileFileUploadProps {
  tool: ToolDefinition
  onFilesAdded?: (files: File[]) => void
  maxFiles?: number
  maxSizeBytes?: number
  className?: string
}

export default function MobileFileUpload({ 
  tool, 
  onFilesAdded, 
  maxFiles = 10, 
  maxSizeBytes = 50 * 1024 * 1024,
  className 
}: MobileFileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      let fileArray = Array.from(files)
      
      // Apply maxFiles limit
      if (fileArray.length > maxFiles) {
        fileArray = fileArray.slice(0, maxFiles)
        alert(`Only the first ${maxFiles} files will be processed.`)
      }
      
      // Apply maxSizeBytes limit
      const validFiles = fileArray.filter(file => {
        if (file.size > maxSizeBytes) {
          alert(`File "${file.name}" is too large. Maximum size is ${Math.round(maxSizeBytes / (1024 * 1024))}MB.`)
          return false
        }
        return true
      })
      
      if (validFiles.length > 0) {
        onFilesAdded?.(validFiles)
      }
    }
    e.target.value = ''
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className={className}>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={tool.inputFormats.map(format => `.${format.toLowerCase()}`).join(',')}
        onChange={handleFileInput}
        className="hidden"
      />
      
      <Button onClick={handleClick} className="w-full">
        <Upload className="h-4 w-4 mr-2" />
        Choose Files
      </Button>
      
      <div className="text-xs text-muted-foreground mt-2 text-center space-y-1">
        <p>Supports: {tool.inputFormats.join(', ')}</p>
        <p>Max {maxFiles} files, {Math.round(maxSizeBytes / (1024 * 1024))}MB each</p>
      </div>
    </div>
  )
}