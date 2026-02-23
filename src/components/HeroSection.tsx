import { cn } from '@/lib/utils'
import { LucideIcon, Shield, Clock, Lock } from 'lucide-react'
import ValueProposition from './ValueProposition'
import { PrimaryCTA } from './PrimaryCTA'
import OptimizedImage, { ImageSource } from './OptimizedImage'

/**
 * HeroSection Component
 * 
 * Enhanced hero section with value proposition, prominent CTA, and trust signals.
 * Validates: Requirements 1.1, 1.4, 2.1, 2.3, 2.5, 3.1, 3.2, 8.2, 9.1, 9.3, 9.4
 * 
 * Features:
 * - Value proposition within first 600px (Requirements 1.1, 1.4)
 * - Strong visual hierarchy (Requirements 2.1, 2.3, 2.5)
 * - Prominent primary CTA above fold (Requirements 3.1, 3.2)
 * - Semantic HTML structure (Requirement 8.2)
 * - Optimized for First Contentful Paint < 1.5s (Requirements 9.1, 9.3)
 * - Optimized images with WebP and responsive srcset (Requirement 9.4)
 * - Mobile-first responsive design
 */

export interface TrustSignal {
  icon: LucideIcon
  text: string
  description: string
  metric?: string
}

export interface HeroBackgroundImage {
  src: string
  alt: string
  sources?: ImageSource[]
  opacity?: number
}

interface HeroSectionProps {
  title: string
  valueProposition: {
    what: string      // "Free online file conversion tools"
    who: string       // "for everyone"
    why: string       // "Fast, secure, private"
  }
  primaryCTA: {
    text: string
    action: () => void
    ariaLabel: string
  }
  trustSignals?: TrustSignal[]
  backgroundImage?: HeroBackgroundImage
  className?: string
}

const defaultTrustSignals: TrustSignal[] = [
  {
    icon: Shield,
    text: 'Privacy-First',
    description: 'Files processed securely',
    metric: '256-bit encryption'
  },
  {
    icon: Clock,
    text: 'Auto-Delete',
    description: 'Files deleted after 1 hour',
  },
  {
    icon: Lock,
    text: 'No Signup',
    description: 'Start converting immediately',
  }
]

export default function HeroSection({ 
  title, 
  valueProposition,
  primaryCTA,
  trustSignals = defaultTrustSignals,
  backgroundImage,
  className 
}: HeroSectionProps) {
  return (
    <header 
      className={cn(
        "relative overflow-hidden rounded-3xl",
        className
      )}
    >
      {/* Background - either image or gradient */}
      {backgroundImage ? (
        <>
          {/* Optimized background image with WebP support and responsive srcset */}
          <div className="absolute inset-0">
            <OptimizedImage
              src={backgroundImage.src}
              alt={backgroundImage.alt}
              sources={backgroundImage.sources}
              priority // Hero images should load eagerly for LCP optimization
              className="w-full h-full"
              objectFit="cover"
            />
          </div>
          {/* Overlay for text readability */}
          <div 
            className="absolute inset-0 bg-gradient-to-br from-blue-900/80 to-purple-900/80"
            style={{ opacity: backgroundImage.opacity ?? 0.7 }}
          />
        </>
      ) : (
        <>
          {/* Simplified gradient background - optimized for FCP */}
          {/* Using CSS custom properties for better performance */}
          <div 
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              willChange: 'auto', // Prevent unnecessary layer promotion
            }}
          />
          
          {/* Subtle overlay for depth - removed to minimize main thread work */}
        </>
      )}
      
      {/* Main content - semantic structure */}
      <section className="relative px-4 py-12 sm:px-8 sm:py-16 md:py-20 lg:py-24">
        <div className="mx-auto max-w-4xl">
          {/* Value Proposition - First element for immediate understanding */}
          <ValueProposition
            what={valueProposition.what}
            who={valueProposition.who}
            why={valueProposition.why}
            className="mb-6 sm:mb-8"
          />
          
          {/* Title - Strong visual hierarchy - removed animation for faster interactivity */}
          <h1 
            className="text-center text-white font-extrabold tracking-tight"
            style={{
              fontSize: 'clamp(2.5rem, 5vw, 4rem)', // 2.5rem mobile, 4rem desktop (Requirement 2.3)
              fontWeight: 800, // >= 700 (Requirement 2.1)
              lineHeight: 1.1,
            }}
          >
            {title}
          </h1>
          
          {/* Primary CTA - Prominent positioning above fold - removed animation for faster interactivity */}
          <div className="mt-8 sm:mt-10 flex justify-center">
            <PrimaryCTA
              text={primaryCTA.text}
              onClick={primaryCTA.action}
              ariaLabel={primaryCTA.ariaLabel}
              variant="primary"
              size="large"
              className="shadow-xl hover:shadow-2xl"
            />
          </div>
          
          {/* Trust Signals - Integrated in hero - removed animation for faster interactivity */}
          <div className="mt-10 sm:mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 lg:gap-8">
            {trustSignals.map((signal, index) => (
              <div
                key={index}
                className="group flex items-center gap-3 px-4 py-2 rounded-lg bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors duration-200 cursor-default"
                title={signal.description}
              >
                <signal.icon 
                  className="w-5 h-5 text-white/90 flex-shrink-0" 
                  aria-hidden="true"
                />
                <div className="text-left">
                  <span className="block text-white font-semibold text-sm leading-tight">
                    {signal.text}
                  </span>
                  {signal.metric && (
                    <span className="block text-white/80 text-xs leading-tight mt-0.5">
                      {signal.metric}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </header>
  )
}
