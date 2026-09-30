import { createContext, useContext } from 'react'

export type Language = 'en' | 'hi' | 'mr'

type LanguageContextValue = {
  language: Language
  setLanguage: (language: Language) => void
}

export const LanguageContext = createContext<LanguageContextValue | null>(null)

export function useLanguage() {
  const value = useContext(LanguageContext)
  if (!value) throw new Error('Language components must be used inside LanguageProvider.')
  return value
}