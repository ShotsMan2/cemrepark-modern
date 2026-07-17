"use client";
import React from "react";
import { useStore } from "../context/StoreContext";

export default function SearchTrigger() {
  const { t } = useStore();
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    window.dispatchEvent(new CustomEvent("open-search"));
  };

  return (
    <a
      href="#"
      onClick={handleClick}
      className="px-8 py-4 text-gray-300 font-medium uppercase tracking-wider border border-gray-700 hover:border-holo-gold hover:text-holo-gold transition-all duration-300 clip-angled inline-block text-center cursor-pointer"
    >
      {t("search_now")}
    </a>
  );
}
