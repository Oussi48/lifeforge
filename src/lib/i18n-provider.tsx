'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { translations, Language, TranslationKeys } from '@/lib/i18n'

type I18nContextType = {
  t: TranslationKeys
  lang: Language
  setLanguage: (lang: Language) => void
}

const I18nContext = createContext<I18nContextType | null>(null)

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>('es')

  useEffect(() => {
    const savedLang = localStorage.getItem('lifeforge-lang') as Language
    if (savedLang && (savedLang === 'en' || savedLang === 'es')) {
      setLang(savedLang)
    }
  }, [])

  const setLanguage = (newLang: Language) => {
    setLang(newLang)
    localStorage.setItem('lifeforge-lang', newLang)
  }

  return (
    <I18nContext.Provider value={{ t: translations[lang], lang, setLanguage }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider')
  }
  return context
}