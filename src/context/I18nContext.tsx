"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { loadTranslation } from "../utils/translations";
import type { Settings } from "@/types";

interface TranslationsMap {
  [lang: string]: Record<string, string>;
}

interface I18nContextType {
  language: string;
  setLanguage: React.Dispatch<React.SetStateAction<string>>;
  t: (key: string, params?: Record<string, string>) => string;
  translations: TranslationsMap;
  isI18nLoaded: boolean;
}

const I18nContext = createContext<I18nContextType>({} as I18nContextType);

export function I18nProvider({ children, settings }: { children: ReactNode; settings: Settings | null }) {
  const [language, setLanguage] = useState("TR");
  const [translations, setTranslations] = useState({});
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const savedLang = localStorage.getItem("cemrepark_lang");
    if (savedLang) setLanguage(savedLang);
    setIsLoaded(true);
  }, []);

  // Load language dictionary dynamically
  useEffect(() => {
    let isMounted = true;
    const loadLang = async () => {
      const langData = await loadTranslation(language);
      if (isMounted) {
        setTranslations((prev) => ({ ...prev, [language]: langData }));
      }
    };
    loadLang();
    return () => {
      isMounted = false;
    };
  }, [language]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("cemrepark_lang", language);

      // Handle RTL support for Arabic
      if (language === "AR") {
        document.documentElement.dir = "rtl";
      } else {
        document.documentElement.dir = "ltr";
      }

      // Update html lang attribute
      document.documentElement.lang = language.toLowerCase();

      // Handle Document Title dynamically
      if (translations[language] && translations[language]["suits_you_well"]) {
        document.title = "Cemre Park - " + translations[language]["suits_you_well"];
      }
    }
  }, [language, isLoaded, translations]);

  const t = (key: string, params: Record<string, string> = {}) => {
    if (key === "badge_whatsapp_support_desc" && settings?.destekTelefonu) {
      return settings.destekTelefonu;
    }
    let text = translations[language]?.[key] || key;
    if (typeof text === "string") {
      Object.keys(params).forEach((k) => {
        text = text.replace(`{${k}}`, params[k]);
      });
    }
    return text;
  };

  return (
    <I18nContext.Provider
      value={{
        language,
        setLanguage,
        t,
        translations,
        isI18nLoaded: isLoaded,
      }}
    >
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
