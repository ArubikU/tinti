"use client"
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

// Types
interface LanguageConfig {
  languages: Record<string, {
    name: string
    nativeName: string
    flag: string
  }>
  defaultLanguage: string
  availableLanguages: string[]
}

interface Translations {
  [key: string]: any
}

interface LanguageContextType {
  currentLanguage: string
  setLanguage: (lang: string) => void
  t: (key: string, params?: Record<string, string>) => string
  availableLanguages: LanguageConfig['languages']
  isLoading: boolean
}

// Context
const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

// Custom hook
export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

// Translation function
const translateKey = (translations: Translations, key: string, params?: Record<string, string>): string => {
  const keys = key.split('.')
  let value = translations
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k]
    } else {
      return key // Return key if translation not found
    }
  }
  
  if (typeof value !== 'string') {
    return key
  }
  
  // Replace parameters if provided
  if (params && typeof value === 'string') {
    let result: string = value
    Object.entries(params).forEach(([param, replacement]) => {
      result = result.replace(new RegExp(`{{${param}}}`, 'g'), replacement)
    })
    return result
  }
  
  return value
}

// Provider component
interface LanguageProviderProps {
  children: ReactNode
}

export const LanguageProvider = ({ children }: LanguageProviderProps) => {
  const [currentLanguage, setCurrentLanguage] = useState<string>('')
  const [translations, setTranslations] = useState<Translations>({})
  const [config, setConfig] = useState<LanguageConfig | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load language configuration
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const response = await fetch('/lang/index.json')
        const languageConfig: LanguageConfig = await response.json()
        setConfig(languageConfig)
        
        // Get language from localStorage or use default
        const savedLanguage = localStorage.getItem('tinti-language')
        const browserLanguage = navigator.language.split('-')[0]
        const language = savedLanguage || 
                        (languageConfig.availableLanguages.includes(browserLanguage) ? browserLanguage : languageConfig.defaultLanguage)
        
        setCurrentLanguage(language)
      } catch (error) {
        console.error('Error loading language config:', error)
        setCurrentLanguage('en') // Fallback
      }
    }
    
    loadConfig()
  }, [])

  // Load translations when language changes
  useEffect(() => {
    if (!currentLanguage) return
    
    const loadTranslations = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`/lang/${currentLanguage}.json`)
        const translationData = await response.json()
        setTranslations(translationData)
      } catch (error) {
        console.error(`Error loading translations for ${currentLanguage}:`, error)
        // Try to load Spanish as fallback
        if (currentLanguage !== 'es') {
          try {
            const fallbackResponse = await fetch('/lang/es.json')
            const fallbackData = await fallbackResponse.json()
            setTranslations(fallbackData)
          } catch (fallbackError) {
            console.error('Error loading fallback translations:', fallbackError)
          }
        }
      } finally {
        setIsLoading(false)
      }
    }
    
    loadTranslations()
  }, [currentLanguage])

  const setLanguage = (lang: string) => {
    if (config?.availableLanguages.includes(lang)) {
      setCurrentLanguage(lang)
      localStorage.setItem('tinti-language', lang)
    }
  }

  const t = (key: string, params?: Record<string, string>) => {
    return translateKey(translations, key, params)
  }

  const value: LanguageContextType = {
    currentLanguage,
    setLanguage,
    t,
    availableLanguages: config?.languages || {},
    isLoading
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

// Utility function for static translations (when outside React context)
export const getStaticTranslation = async (key: string, language?: string): Promise<string> => {
  try {
    const lang = language || 'es'
    const response = await fetch(`/lang/${lang}.json`)
    const translations = await response.json()
    return translateKey(translations, key)
  } catch (error) {
    console.error('Error loading static translation:', error)
    return key
  }
}
