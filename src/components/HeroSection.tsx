import { cn } from '@/lib/utils'

interface HeroSectionProps {
  title: string
  tagline: string
  gradient?: {
    from: string
    via?: string
    to: string
  }
  className?: string
}

export default function HeroSection({ 
  title, 
  tagline, 
  gradient = { from: 'blue-600', to: 'purple-600' },
  className 
}: HeroSectionProps) {
  return (
    <div 
      className={cn(
        "relative overflow-hidden rounded-3xl",
        className
      )}
    >
      {/* Animated gradient background */}
      <div 
        className="absolute inset-0 animate-gradient"
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #667eea 75%, #764ba2 100%)',
          backgroundSize: '400% 400%'
        }}
      />
      
      {/* Glassmorphism overlay */}
      <div className="absolute inset-0 glass" />
      
      {/* Floating geometric shapes */}
      <div className="absolute inset-0 overflow-hidden opacity-20">
        <div 
          className="absolute top-20 left-20 w-64 h-64 rounded-full animate-float"
          style={{
            background: 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 70%)',
            filter: 'blur(40px)',
            animationDelay: '0s'
          }}
        />
        <div 
          className="absolute bottom-20 right-20 w-80 h-80 rounded-full animate-float"
          style={{
            background: 'radial-gradient(circle, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0) 70%)',
            filter: 'blur(50px)',
            animationDelay: '2s'
          }}
        />
        <div 
          className="absolute top-1/2 left-1/3 w-56 h-56 rounded-full animate-float"
          style={{
            background: 'radial-gradient(circle, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0) 70%)',
            filter: 'blur(45px)',
            animationDelay: '4s'
          }}
        />
        
        {/* Geometric shapes */}
        <div 
          className="absolute top-40 right-1/4 w-32 h-32 rotate-45 animate-float opacity-10"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.1) 100%)',
            borderRadius: '20%',
            animationDelay: '1s'
          }}
        />
        <div 
          className="absolute bottom-40 left-1/4 w-40 h-40 rotate-12 animate-float opacity-10"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.1) 100%)',
            borderRadius: '30%',
            animationDelay: '3s'
          }}
        />
      </div>
      
      {/* Content */}
      <div className="relative px-6 py-24 sm:px-12 sm:py-32 lg:py-40">
        <div className="mx-auto max-w-5xl text-center">
          {/* Title with glow effect */}
          <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl xl:text-8xl animate-fade-in">
            <span className="inline-block relative">
              {title}
              {/* Text glow */}
              <span 
                className="absolute inset-0 blur-2xl opacity-50"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.2) 100%)',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text'
                }}
              >
                {title}
              </span>
            </span>
          </h1>
          
          {/* Tagline with subtle animation */}
          <p 
            className="mt-8 text-xl sm:text-2xl lg:text-3xl text-white/95 max-w-3xl mx-auto font-medium leading-relaxed animate-fade-in"
            style={{ animationDelay: '0.2s', animationFillMode: 'both' }}
          >
            {tagline}
          </p>
          
          {/* Decorative line with gradient */}
          <div 
            className="mt-12 mx-auto w-32 h-1 rounded-full animate-fade-in"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.8) 50%, transparent 100%)',
              animationDelay: '0.4s',
              animationFillMode: 'both'
            }}
          />
        </div>
      </div>
      
      {/* Bottom gradient fade */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-32"
        style={{
          background: 'linear-gradient(to top, rgba(0,0,0,0.1) 0%, transparent 100%)'
        }}
      />
    </div>
  )
}
