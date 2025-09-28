"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Moon, Sun } from "lucide-react"
import { flushSync } from "react-dom"

import { cn } from "@/lib/utils"

type Props = {
  className?: string
}

export const AnimatedThemeToggler = ({ className }: Props) => {
  const [isDark, setIsDark] = useState(false)
  const [isRotating, setIsRotating] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const updateTheme = () => {
      setIsDark(document.documentElement.classList.contains("dark"))
    }

    updateTheme()

    const observer = new MutationObserver(updateTheme)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    })

    return () => observer.disconnect()
  }, [])

  const toggleTheme = useCallback(async () => {
    if (!buttonRef.current) return
    
    // Trigger rotation animation
    setIsRotating(true)
    setTimeout(() => setIsRotating(false), 300)

    await document.startViewTransition(() => {
      flushSync(() => {
        const newTheme = !isDark
        setIsDark(newTheme)
        document.documentElement.classList.toggle("dark")
        localStorage.setItem("theme", newTheme ? "dark" : "light")
      })
    }).ready

    const { top, left, width, height } =
      buttonRef.current.getBoundingClientRect()
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
        easing: "ease-in-out",
        pseudoElement: "::view-transition-new(root)",
      }
    )
  }, [isDark])

  return (
    <button 
      ref={buttonRef} 
      onClick={toggleTheme} 
      className={cn(
        "group relative rounded-full border border-primary/40 bg-primary/20 p-3",
        "shadow-[0_0_18px_rgba(168,85,247,0.35)] transition-all duration-300",
        "hover:border-primary/60 hover:bg-primary/30 hover:shadow-[0_0_26px_rgba(168,85,247,0.45)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
        className
      )}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
    >
      {/* CHANGE: Added rotation animation to icons */}
      {isDark ? (
        <Sun className={cn(
          "h-5 w-5 transition-transform duration-300 text-primary-foreground",
          isRotating && "rotate-180",
          "group-hover:scale-110"
        )} />
      ) : (
        <Moon className={cn(
          "h-5 w-5 transition-transform duration-300 text-primary-foreground",
          isRotating && "rotate-180",
          "group-hover:scale-110"
        )} />
      )}
    </button>
  )
}
