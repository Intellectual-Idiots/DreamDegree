// Language codes for South Africa's 11 official languages
export type Language = 
  | 'en' // English
  | 'af' // Afrikaans
  | 'zu' // Zulu
  | 'xh' // Xhosa
  | 'st' // Sotho
  | 'tn' // Tswana
  | 'ts' // Tsonga
  | 've' // Venda
  | 'ss' // Swati
  | 'nr' // Ndebele
  | 'nso' // Northern Sotho

export const LANGUAGES: Record<Language, string> = {
  en: 'English',
  af: 'Afrikaans',
  zu: 'isiZulu',
  xh: 'isiXhosa',
  st: 'Sesotho',
  tn: 'Setswana',
  ts: 'Xitsonga',
  ve: 'Tshivenda',
  ss: 'siSwati',
  nr: 'isiNdebele',
  nso: 'Sesotho sa Leboa'
}

// Store for current language state
let currentLanguage: Language = 'en'
let languageChangeCallbacks: ((lang: Language) => void)[] = []

// Initialize language from localStorage if available
if (typeof window !== 'undefined') {
  const savedLanguage = localStorage.getItem('app-language') as Language
  if (savedLanguage && LANGUAGES[savedLanguage]) {
    currentLanguage = savedLanguage
  }
}

// Get current language
export const getCurrentLanguage = (): Language => currentLanguage

// Set current language
export const setCurrentLanguage = (language: Language) => {
  currentLanguage = language
  if (typeof window !== 'undefined') {
    localStorage.setItem('app-language', language)
    document.documentElement.lang = language
  }
  // Notify all callbacks
  languageChangeCallbacks.forEach(callback => callback(language))
}

// Subscribe to language changes
export const subscribeToLanguageChange = (callback: (lang: Language) => void) => {
  languageChangeCallbacks.push(callback)
  // Return unsubscribe function
  return () => {
    languageChangeCallbacks = languageChangeCallbacks.filter(cb => cb !== callback)
  }
}

// Translation cache to avoid repeated API calls
const translationCache = new Map<string, string>()

// Create cache key
const getCacheKey = (text: string, from: Language, to: Language): string => {
  return `${from}-${to}-${text}`
}

// Google Translate API function (free tier using fetch)
async function translateWithGoogle(text: string, targetLang: Language, sourceLang: Language = 'en'): Promise<string> {
  // Check cache first
  const cacheKey = getCacheKey(text, sourceLang, targetLang)
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey)!
  }

  try {
    // Using Google Translate's free API endpoint (limited usage)
    // Note: For production, you should use the official Google Cloud Translation API
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`
    
    const response = await fetch(url)
    const data = await response.json()
    
    // Extract translated text from the response
    let translatedText = ''
    if (data && data[0]) {
      data[0].forEach((item: [string, string]) => {
        if (item[0]) {
          translatedText += item[0]
        }
      })
    }
    
    // If translation failed, return original text
    if (!translatedText) {
      return text
    }
    
    // Cache the result
    translationCache.set(cacheKey, translatedText)
    
    return translatedText
  } catch (error) {
    console.error('Translation error:', error)
    // Return original text if translation fails
    return text
  }
}

// Main translate function
export async function translate(text: string, options?: {
  to?: Language
  from?: Language
}): Promise<string> {
  const targetLang = options?.to || currentLanguage
  const sourceLang = options?.from || 'en'
  
  // If target language is the same as source, return original text
  if (targetLang === sourceLang) {
    return text
  }
  
  // If target is English and source isn't specified, assume it's already in English
  if (targetLang === 'en' && !options?.from) {
    return text
  }
  
  return translateWithGoogle(text, targetLang, sourceLang)
}

// Synchronous translate function that returns a promise
// Useful for React components with Suspense
export function t(text: string, options?: {
  to?: Language
  from?: Language
}): string {
  const targetLang = options?.to || currentLanguage
  const sourceLang = options?.from || 'en'
  
  // For same language, return immediately
  if (targetLang === sourceLang || (targetLang === 'en' && !options?.from)) {
    return text
  }
  
  // Check cache for immediate return
  const cacheKey = getCacheKey(text, sourceLang, targetLang)
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey)!
  }
  
  // If not in cache, trigger translation in background and return original text
  // The component should re-render when translation is complete
  translate(text, options).then(() => {
    // This will trigger re-renders in components using this
    languageChangeCallbacks.forEach(callback => callback(currentLanguage))
  })
  
  return text
}

// Hook for React components to use translations
export function useTranslation() {
  const [, forceUpdate] = useState({})
  
  useEffect(() => {
    const unsubscribe = subscribeToLanguageChange(() => {
      forceUpdate({})
    })
    return unsubscribe
  }, [])
  
  return {
    translate,
    t,
    currentLanguage,
    setLanguage: setCurrentLanguage
  }
}

import { useState, useEffect } from 'react';