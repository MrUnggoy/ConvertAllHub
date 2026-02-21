import { cn } from '@/lib/utils'

interface LogoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
}

export default function Logo({ className, size = 'md', showText = true }: LogoProps) {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  }

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-3xl'
  }

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      {/* Logo Icon - Stylized "C" with conversion arrows */}
      <div className={cn(
        'relative flex items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold',
        sizeClasses[size]
      )}>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="w-3/4 h-3/4"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Main "C" shape */}
          <path
            d="M18 8.5C18 6.5 16.5 5 14.5 5H9.5C7.5 5 6 6.5 6 8.5V15.5C6 17.5 7.5 19 9.5 19H14.5C16.5 19 18 17.5 18 15.5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
          {/* Conversion arrows */}
          <path
            d="M20 7L22 9L20 11"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M4 13L2 15L4 17"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      
      {showText && (
        <div className="flex flex-col">
          <span className={cn(
            'font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent',
            textSizeClasses[size]
          )}>
            ConvertAll
          </span>
          {size === 'lg' && (
            <span className="text-xs text-muted-foreground -mt-1">
              Universal File Converter
            </span>
          )}
        </div>
      )}
    </div>
  )
}