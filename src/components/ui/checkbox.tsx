import * as React from "react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onCheckedChange?: (checked: boolean) => void
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, onCheckedChange, ...props }, ref) => {
    return (
      <div className="relative inline-flex items-center">
        <input
          type="checkbox"
          className="peer sr-only"
          ref={ref}
          onChange={(e) => {
            if (onCheckedChange) {
              onCheckedChange(e.target.checked)
            }
          }}
          {...props}
        />
        <div
          className={cn(
            "h-5 w-5 shrink-0 rounded border border-gray-300 bg-white",
            "peer-checked:bg-blue-600 peer-checked:border-blue-600",
            "peer-focus-visible:ring-2 peer-focus-visible:ring-blue-500 peer-focus-visible:ring-offset-2",
            "peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
            "flex items-center justify-center transition-colors",
            className
          )}
        >
          <Check className="h-3 w-3 text-white opacity-0 peer-checked:opacity-100" />
        </div>
      </div>
    )
  }
)
Checkbox.displayName = "Checkbox"

export { Checkbox }
