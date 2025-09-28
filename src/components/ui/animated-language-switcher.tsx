"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Globe } from "lucide-react"
import { flushSync } from "react-dom"
import { cn } from "@/lib/utils"
import { 
  getCurrentLanguage, 
  setCurrentLanguage, 
  subscribeToLanguageChange,
  Language,
  LANGUAGES 
} from '@/utils/translate';


// Language abbreviations for display
const LANGUAGE_CODES: Record<Language, string> = {
  en: 'EN',
  af: 'AF',
  zu: 'ZU',
  xh: 'XH',
  st: 'ST',
  tn: 'TN',
  ts: 'TS',
  ve: 'VE',
  ss: 'SS',
  nr: 'NR',
  nso: 'NSO'
}

type Props = {
  className?: string
}

export const AnimatedLanguageSwitcher = ({ className }: Props) => {
  const [currentLang, setCurrentLang] = useState<Language>('en')
  const [isOpen, setIsOpen] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    // Initialize language from localStorage
    const initLang = getCurrentLanguage()
    setCurrentLang(initLang)
    document.documentElement.lang = initLang

    // Subscribe to language changes
    const unsubscribe = subscribeToLanguageChange((lang) => {
      setCurrentLang(lang)
    })

    // Click outside handler
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current && 
        !menuRef.current.contains(event.target as Node) &&
        !buttonRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      unsubscribe()
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const switchLanguage = useCallback(async (newLanguage: Language) => {
    if (newLanguage === currentLang || isAnimating) return
    
    setIsAnimating(true)
    setIsOpen(false)

    // Check if browser supports View Transitions API
    if ('startViewTransition' in document && buttonRef.current) {
      await document.startViewTransition(() => {
        flushSync(() => {
          setCurrentLanguage(newLanguage)
          setCurrentLang(newLanguage)
        })
      }).ready

      const { top, left, width, height } = buttonRef.current.getBoundingClientRect()
      const x = left + width / 2
      const y = top + height / 2
      const maxRadius = Math.hypot(
        Math.max(left, window.innerWidth - left),
        Math.max(top, window.innerHeight - top)
      )

      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${maxRadius}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration: 700,
          easing: 'ease-in-out',
          pseudoElement: '::view-transition-new(root)',
        }
      )
    } else {
      // Fallback for browsers that don't support View Transitions
      setCurrentLanguage(newLanguage)
      setCurrentLang(newLanguage)
    }
    
    setTimeout(() => setIsAnimating(false), 750)
  }, [currentLang, isAnimating])

  const toggleMenu = () => {
    if (!isAnimating) {
      setIsOpen(!isOpen)
    }
  }

  return (
    <div className={cn("relative", className)}>
      {/* Main toggle button */}
      <button
        ref={buttonRef}
        onClick={toggleMenu}
        className={cn(
          "group relative rounded-full border border-primary/40 bg-primary/20 p-3",
          "shadow-[0_0_18px_rgba(168,85,247,0.35)] transition-all duration-300",
          "hover:border-primary/60 hover:bg-primary/30 hover:shadow-[0_0_26px_rgba(168,85,247,0.45)]",
          isAnimating && "animate-pulse"
        )}
        aria-label={`Current language: ${LANGUAGES[currentLang]}. Click to change language`}
      >
        <Globe className={cn(
          "h-5 w-5 transition-transform duration-300",
          isOpen && "rotate-180",
          "text-foreground/80 group-hover:text-foreground"
        )} />
        
        {/* Current language badge */}
        <span className={cn(
          "absolute -top-1 -right-1",
          "px-1.5 py-0.5 rounded-full",
          "bg-primary text-primary-foreground",
          "text-[10px] font-bold",
          "shadow-sm border border-background"
        )}>
          {LANGUAGE_CODES[currentLang]}
        </span>
      </button>

      {/* Language menu */}
      <div
        ref={menuRef}
        className={cn(
          "absolute bottom-full right-0 mb-2",
          "grid grid-cols-3 gap-1 p-2",
          "rounded-xl border border-primary/25 bg-sidebar shadow-[0_18px_40px_rgba(16,6,32,0.45)]",
          "transition-all duration-300 origin-bottom-right",
          isOpen 
            ? "opacity-100 scale-100 pointer-events-auto" 
            : "opacity-0 scale-95 pointer-events-none"
        )}
        style={{ minWidth: '240px' }}
      >
        {(Object.entries(LANGUAGES) as [Language, string][]).map(([code, name]) => (
          <button
            key={code}
            onClick={() => switchLanguage(code)}
            className={cn(
              "relative flex flex-col items-center justify-center",
              "p-2 text-xs transition-all duration-200",
              "rounded-lg hover:bg-primary/15 hover:text-primary",
              currentLang === code && "bg-primary/25 text-primary",
              "group"
            )}
            title={name}
          >
            <span className={cn(
              "font-bold text-sm mb-0.5",
              "transition-transform duration-200 group-hover:scale-110"
            )}>
              {LANGUAGE_CODES[code]}
            </span>
            <span className="text-[10px] opacity-70 truncate max-w-[60px]">
              {name.length > 8 ? name.substring(0, 8) + '...' : name}
            </span>
            {currentLang === code && (
              <div className="absolute inset-0 rounded-md border-2 border-primary pointer-events-none" />
            )}
          </button>
        ))}
        
        {/* Arrow pointing to button */}
        <div className={cn(
          "absolute -bottom-1.5 right-4",
          "w-3 h-3 rotate-45",
          "bg-background border-r border-b border-border",
          "dark:bg-background/90 dark:border-border/50"
        )} />
      </div>
    </div>
  )
}
