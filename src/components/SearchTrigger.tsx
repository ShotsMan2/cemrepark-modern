"use client";
import React from "react";
import { useStore } from "../context/StoreContext";

export default function SearchTrigger() {
  const { t } = useStore();
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent("open-search"));
      }}
      className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-foreground text-background font-bold uppercase tracking-[0.15em] rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-[0_0_20px_rgba(225,28,142,0.4)] hover:scale-105 cursor-pointer focus-visible:ring-2 focus-visible:ring-secondary focus-visible:outline-none"
    >
      <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-[#e11c8e] to-[#a855f7] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <span className="relative z-10 group-hover:text-white transition-colors duration-300">
        {t("search_now")}
      </span>
    </button>
  );
}
