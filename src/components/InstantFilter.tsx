"use client";

import React, { useState, useEffect, useCallback } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";

interface FilterState {
  category: string;
  minPrice: number;
  maxPrice: number;
  color: string;
  size: string;
  inStock: boolean;
}

interface InstantFilterProps {
  categories: string[];
  colors: string[];
  sizes: string[];
  onFilterChange: (filters: FilterState) => void;
}

const colorMap: Record<string, string> = {
  Siyah: "#111111",
  Beyaz: "#FFFFFF",
  Kırmızı: "#EF4444",
  Lacivert: "#1E3A8A",
  Bej: "#F5F5DC",
  Pembe: "#EC4899",
  Yeşil: "#10B981",
  Mavi: "#3B82F6",
  Sarı: "#EAB308",
  Kahverengi: "#78350F",
  Gri: "#6B7280",
  Mor: "#8B5CF6",
};

function debounce(func: Function, wait: number) {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: any[]) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export default function InstantFilter({
  categories,
  colors,
  sizes,
  onFilterChange,
}: InstantFilterProps) {
  const [filters, setFilters] = useState<FilterState>({
    category: "",
    minPrice: 0,
    maxPrice: 10000,
    color: "",
    size: "",
    inStock: false,
  });

  const [tempPrice, setTempPrice] = useState<{ min: number; max: number }>({ min: 0, max: 10000 });

  useEffect(() => {
    AOS.init({ duration: 800, once: true });
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedPriceChange = React.useMemo(
    () =>
      debounce((min: number, max: number) => {
        const newFilters = { ...filters, minPrice: min, maxPrice: max };
        setFilters(newFilters);
        onFilterChange(newFilters);
      }, 500),
    [filters, onFilterChange],
  );

  const handlePriceSlide = (type: "min" | "max", val: number) => {
    const newTemp = { ...tempPrice, [type]: val };
    setTempPrice(newTemp);
    debouncedPriceChange(newTemp.min, newTemp.max);
  };

  const handleChange = (key: keyof FilterState, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div
      className="glass-panel p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group transition-all duration-500 hover:shadow-neon-pink/10"
      data-aos="fade-right"
    >
      <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-neon-pink/20 to-holo-gold/20 rounded-full blur-[60px] pointer-events-none group-hover:scale-150 transition-transform duration-1000"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-blue-500/10 to-purple-500/10 rounded-full blur-[50px] pointer-events-none group-hover:scale-150 transition-transform duration-1000"></div>

      <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-500 dark:from-white dark:to-gray-400 mb-8 uppercase tracking-[0.15em] border-b border-glass-border pb-4 relative z-10">
        Filtreler
      </h3>

      {/* Category Tree */}
      <div className="mb-8 relative z-10">
        <h4 className="font-black text-xs text-foreground/60 mb-4 uppercase tracking-[0.2em]">
          Kategoriler
        </h4>
        <div className="space-y-1 bg-foreground/5 p-2 rounded-2xl border border-glass-border shadow-inner">
          {["Tümü", ...categories].map((cat, idx) => {
            const val = cat === "Tümü" ? "" : cat;
            const isSelected = filters.category === val;
            return (
              <button
                key={idx}
                onClick={() => handleChange("category", val)}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl transition-all duration-300 ${isSelected ? "bg-gradient-to-r from-neon-pink/10 to-holo-gold/10 text-neon-pink font-black shadow-sm" : "hover:bg-white/50 dark:hover:bg-zinc-800/50 text-gray-600 dark:text-gray-300 font-bold"}`}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`w-1.5 h-1.5 rounded-full transition-all ${isSelected ? "bg-neon-pink scale-150 shadow-[0_0_8px_rgba(255,0,127,0.8)]" : "bg-gray-300 dark:bg-zinc-600"}`}
                  ></div>
                  <span className="text-sm">{cat}</span>
                </div>
                {isSelected && <ChevronRight className="w-4 h-4 text-neon-pink animate-pulse" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Dynamic Price Slider */}
      <div className="mb-8 relative z-10">
        <div className="flex justify-between items-center mb-4">
          <h4 className="font-black text-xs text-foreground/60 uppercase tracking-[0.2em]">
            Fiyat (₺)
          </h4>
          <span className="text-[10px] font-bold text-neon-pink bg-neon-pink/10 px-2 py-1 rounded-md">
            {tempPrice.min}₺ - {tempPrice.max}₺
          </span>
        </div>
        <div className="px-2">
          <input
            type="range"
            min="0"
            max="10000"
            step="50"
            value={tempPrice.max}
            onChange={(e) => handlePriceSlide("max", Number(e.target.value))}
            className="w-full h-2 bg-gray-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-neon-pink hover:accent-holo-gold transition-all"
          />
          <div className="flex justify-between text-[10px] font-bold text-gray-400 mt-2">
            <span>0₺</span>
            <span>10,000₺</span>
          </div>
        </div>
      </div>

      {/* Color Swatches */}
      <div className="mb-8 relative z-10">
        <h4 className="font-black text-xs text-foreground/60 mb-4 uppercase tracking-[0.2em]">
          Renkler
        </h4>
        <div className="flex flex-wrap gap-3">
          {colors.map((color, idx) => {
            const isSelected = filters.color === color;
            const hex = colorMap[color] || "#cccccc";
            return (
              <button
                key={idx}
                onClick={() => handleChange("color", isSelected ? "" : color)}
                title={color}
                className={`relative w-8 h-8 rounded-full shadow-md transition-all duration-300 transform active:scale-95 flex items-center justify-center ${
                  isSelected
                    ? "ring-2 ring-neon-pink ring-offset-2 ring-offset-gray-50 dark:ring-offset-zinc-900 scale-110"
                    : "border border-gray-200 dark:border-zinc-700 hover:scale-110"
                }`}
                style={{ backgroundColor: hex }}
              >
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className={`w-3 h-3 rounded-full ${hex === "#FFFFFF" || hex === "#F5F5DC" ? "bg-black" : "bg-white"}`}
                  ></motion.div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sizes */}
      <div className="mb-8 relative z-10">
        <h4 className="font-black text-xs text-foreground/60 mb-4 uppercase tracking-[0.2em]">
          Bedenler
        </h4>
        <div className="grid grid-cols-4 gap-3">
          {sizes.map((size, idx) => {
            const isSelected = filters.size === size;
            return (
              <button
                key={idx}
                onClick={() => handleChange("size", isSelected ? "" : size)}
                className={`flex items-center justify-center aspect-square text-sm font-black rounded-2xl transition-all duration-300 transform active:scale-95 ${
                  isSelected
                    ? "bg-gradient-to-br from-gray-900 to-black dark:from-white dark:to-gray-200 text-foreground dark:text-black shadow-xl shadow-black/20 dark:shadow-white/20 scale-110"
                    : "bg-white/80 dark:bg-zinc-800/80 text-foreground/80 border border-gray-200 dark:border-zinc-700 hover:border-gray-900 dark:hover:border-white hover:shadow-md"
                }`}
              >
                {size}
              </button>
            );
          })}
        </div>
      </div>

      {/* In Stock Toggle */}
      <div className="mb-8 relative z-10">
        <label className="flex items-center justify-between cursor-pointer p-4 rounded-2xl bg-white/50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700 hover:shadow-md transition-all">
          <span className="text-xs font-black text-foreground/80 uppercase tracking-widest">
            Sadece Stoktakiler
          </span>
          <div className="relative">
            <input
              type="checkbox"
              checked={filters.inStock}
              onChange={(e) => handleChange("inStock", e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-300 dark:bg-zinc-600 rounded-full peer peer-checked:bg-neon-pink transition-colors duration-300 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all after:duration-300 peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
          </div>
        </label>
      </div>

      <button
        onClick={() => {
          const reset = {
            category: "",
            minPrice: 0,
            maxPrice: 10000,
            color: "",
            size: "",
            inStock: false,
          };
          setFilters(reset);
          setTempPrice({ min: 0, max: 10000 });
          onFilterChange(reset);
        }}
        className="w-full py-4 text-xs font-black uppercase tracking-[0.2em] text-foreground/70 bg-gray-100/50 dark:bg-zinc-800/50 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-500 dark:hover:text-red-400 rounded-2xl transition-all duration-300 active:scale-95 relative z-10 group"
      >
        <span className="flex items-center justify-center gap-2">
          <svg
            className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            ></path>
          </svg>
          Filtreleri Temizle
        </span>
      </button>
    </div>
  );
}
