"use client";

import React from "react";
import { exportToCSV } from "@/utils/export";

export default function ExportButton({ data, filename, label = "Dışa Aktar (CSV)" }) {
  const handleExport = () => {
    exportToCSV(data, filename);
  };

  return (
    <button
      onClick={handleExport}
      className="flex items-center gap-2 glass-panel hover:bg-neon-pink/20 hover:border-neon-pink hover:shadow-[0_0_20px_rgba(255,0,127,0.3)] text-foreground px-5 py-2.5 text-sm font-bold uppercase tracking-wider transition-all duration-300 clip-angled"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="7 10 12 15 17 10"></polyline>
        <line x1="12" y1="15" x2="12" y2="3"></line>
      </svg>
      {label}
    </button>
  );
}
