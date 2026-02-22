import { cn } from '@/lib/utils'

/**
 * ValueProposition Component
 * 
 * Communicates what the service does, who it's for, and why it matters
 * within the first 600px of viewport height.
 * 
 * Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5
 */

interface ValuePropositionProps {
  what: string      // "Free online file conversion tools"
  who: string       // "for everyone"
  why: string       // "Fast, secure, private"
  className?: string
}

export default function ValueProposition({ 
  what, 
  who, 
  why, 
  className 
}: ValuePropositionProps) {
  return (
    <div 
      className={cn(
        "text-center space-y-2 animate-fade-in",
        className
      )}
      role="region"
      aria-label="Value proposition"
    >
      {/* What - Primary value statement */}
      <p 
        className="text-white/95 font-semibold leading-tight"
        style={{
          fontSize: 'clamp(1.25rem, 2vw, 1.5rem)', // 1.25rem mobile, 1.5rem desktop
          fontWeight: 600
        }}
      >
        {what}
      </p>
      
      {/* Who - Target audience */}
      <p 
        className="text-white/90 font-medium"
        style={{
          fontSize: 'clamp(1rem, 1.5vw, 1.125rem)'
        }}
      >
        {who}
      </p>
      
      {/* Why - Key benefits */}
      <p 
        className="text-white/85 font-medium"
        style={{
          fontSize: 'clamp(0.875rem, 1.25vw, 1rem)'
        }}
      >
        {why}
      </p>
    </div>
  )
}
