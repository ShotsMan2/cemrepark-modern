"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Globe, ChevronDown, Check } from "lucide-react";
import { createPortal } from "react-dom";
import { useStore } from "@/context/StoreContext";

type Language = {
  code: string;
  name: string;
  short: string;
};

const languages: Language[] = [
  { code: "TR", name: "Türkçe", short: "TR" },
  { code: "EN", name: "English", short: "GB" },
  { code: "AR", name: "العربية", short: "SA" },
];

export default function LanguageSwitcher() {
  const { language, setLanguage } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedLang = languages.find((l) => l.code === language) || languages[0];

  const updatePosition = useCallback(() => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPos({ top: rect.bottom + 8, left: rect.left });
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      updatePosition();
      window.addEventListener("scroll", updatePosition, true);
      return () => window.removeEventListener("scroll", updatePosition, true);
    }
  }, [isOpen, updatePosition]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleSelect = (lang: Language) => {
    setLanguage(lang.code);
    setIsOpen(false);
  };

  return (
    <>
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2 py-1 rounded-full border border-gray-300 dark:border-white/20 bg-white/50 dark:bg-black/50 hover:bg-white dark:hover:bg-background/80 transition-all duration-300 backdrop-blur-md text-xs font-bold text-foreground/80 focus:outline-none focus:ring-1 focus:ring-primary/50"
        aria-haspopup="true"
        aria-expanded={isOpen}
        type="button"
      >
        <Globe className="w-3.5 h-3.5 text-primary" />
        <span className="inline-block">{selectedLang.code}</span>
        <ChevronDown
          className={`w-3 h-3 transition-transform duration-300 ${isOpen ? "rotate-180" : "rotate-0"}`}
        />
      </button>

      {isOpen &&
        typeof window !== "undefined" &&
        createPortal(
          <div
            ref={dropdownRef}
            className="fixed w-36 bg-background rounded-xl border border-gray-200 dark:border-gray-700 shadow-2xl z-[9999] animate-slide-up"
            style={{ top: pos.top, left: pos.left }}
          >
            <ul className="py-1" role="menu">
              {languages.map((lang) => (
                <li key={lang.code}>
                  <button
                    onClick={() => handleSelect(lang)}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs transition-colors duration-200 hover:bg-primary/10 ${
                      selectedLang.code === lang.code
                        ? "text-primary font-semibold bg-primary/5"
                        : "text-foreground/80"
                    }`}
                    role="menuitem"
                    type="button"
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-xs font-bold text-foreground/60">{lang.short}</span>
                      {lang.name}
                    </span>
                    {selectedLang.code === lang.code && (
                      <Check className="w-3.5 h-3.5 text-primary" />
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>,
          document.body
        )}
    </>
  );
}
