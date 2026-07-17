"use client";

import { useState, useRef, useEffect } from "react";
import { Globe, ChevronDown, Check } from "lucide-react";
import { useStore } from "@/context/StoreContext";

type Language = {
  code: string;
  name: string;
  flag: string;
};

const languages: Language[] = [
  { code: "TR", name: "Türkçe", flag: "🇹🇷" },
  { code: "EN", name: "English", flag: "🇬🇧" },
  { code: "AR", name: "العربية", flag: "🇸🇦" },
];

export default function LanguageSwitcher() {
  const { language, setLanguage } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedLang = languages.find((l) => l.code === language) || languages[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (lang: Language) => {
    setLanguage(lang.code);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2 py-1 rounded-full border border-gray-300 dark:border-white/20 bg-white/50 dark:bg-black/50 hover:bg-white dark:hover:bg-black/80 transition-all duration-300 backdrop-blur-md text-xs font-bold text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-primary/50"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <Globe className="w-3.5 h-3.5 text-primary" />
        <span className="inline-block">{selectedLang.code}</span>
        <ChevronDown
          className={`w-3 h-3 transition-transform duration-300 ${isOpen ? "rotate-180" : "rotate-0"}`}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-2 w-36 glass-card animate-slide-up z-50 overflow-hidden shadow-2xl border border-primary/20">
          <ul className="py-1" role="menu">
            {languages.map((lang) => (
              <li key={lang.code}>
                <button
                  onClick={() => handleSelect(lang)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs transition-colors duration-200 hover:bg-primary/10 ${
                    selectedLang.code === lang.code
                      ? "text-primary font-semibold bg-primary/5"
                      : "text-gray-700 dark:text-gray-300"
                  }`}
                  role="menuitem"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-base">{lang.flag}</span>
                    {lang.name}
                  </span>
                  {selectedLang.code === lang.code && (
                    <Check className="w-3.5 h-3.5 text-primary" />
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
