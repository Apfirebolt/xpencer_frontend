'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import en from '@/locales/en.json';
import hi from '@/locales/hi.json';
import de from '@/locales/de.json';

const translations = { en, hi, de };

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [locale, setLocale] = useState('en');
  const [dict, setDict] = useState(en);

  useEffect(() => {
    const savedLocale = localStorage.getItem('lang') || 'en';
    setLocale(savedLocale);
    setDict(translations[savedLocale] || en);
  }, []);

  const changeLanguage = (lang) => {
    setLocale(lang);
    setDict(translations[lang] || en);
    localStorage.setItem('lang', lang);
  };

  // Helper function to resolve nested keys like t('nav.dashboard')
  const t = (path) => {
    const keys = path.split('.');
    let result = dict;
    for (const key of keys) {
      result = result?.[key];
    }
    return result || path;
  };

  return (
    <LanguageContext.Provider value={{ locale, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useTranslation = () => useContext(LanguageContext);