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
      className="px-8 py-4 text-gray-300 font-medium uppercase tracking-wider border border-gray-700 hover:border-holo-gold hover:text-holo-gold transition-all duration-300 clip-angled inline-block text-center cursor-pointer focus-visible:ring-2 focus-visible:ring-holo-gold focus-visible:outline-none"
    >
      {t("search_now")}
    </button>
  );
}
