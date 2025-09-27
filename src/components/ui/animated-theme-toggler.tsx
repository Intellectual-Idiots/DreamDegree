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
        "group relative p-3 rounded-full",
        "bg-background/95 backdrop-blur",
        "border border-border shadow-lg",
        "transition-all duration-300 hover:scale-110",
        "dark:bg-background/90 dark:border-border/50",
        className
      )}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
    >
      {/* CHANGE: Added rotation animation to icons */}
      {isDark ? (
        <Sun className={cn(
          "h-5 w-5 transition-transform duration-300",
          isRotating && "rotate-180",
          "text-foreground/80 group-hover:text-foreground"
        )} />
      ) : (
        <Moon className={cn(
          "h-5 w-5 transition-transform duration-300",
          isRotating && "rotate-180",
          "text-foreground/80 group-hover:text-foreground"
        )} />
      )}
    </button>
  )
}