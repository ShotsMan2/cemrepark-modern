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
  hideCategories?: boolean;
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
  hideCategories = false,
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

  const debouncedPriceChange = React.useMemo(
    () =>
      debounce((min: number, max: number) => {
        const newFilters = { ...filters, minPrice: min, maxPrice: max };
        setFilters(newFilters);
        onFilterChange(newFilters);
      }, 500),
    [filters, onFilterChange]
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
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="product-card-bg p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] relative overflow-hidden group"
    >
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-gradient-to-br from-primary/20 via-purple/15 to-transparent rounded-full blur-[60px] pointer-events-none group-hover:scale-110 transition-transform duration-1000"></div>
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-gradient-to-tr from-purple/20 to-primary/10 rounded-full blur-[50px] pointer-events-none group-hover:scale-110 transition-transform duration-1000"></div>

      <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70 mb-8 tracking-wide border-b border-foreground/5 pb-4 relative z-10 flex items-center gap-3">
        <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
          ></path>
        </svg>
        Filtreler
      </h3>

      {/* Category Tree */}
      {!hideCategories && (
        <div className="mb-8 relative z-10">
          <h4 className="font-semibold text-xs text-foreground/60 mb-4 uppercase tracking-[0.15em]">
            Kategoriler
          </h4>
          <div className="space-y-1">
            {["Tümü", ...categories].map((cat, idx) => {
              const val = cat === "Tümü" ? "" : cat;
              const isSelected = filters.category === val;
              return (
                <button
                  key={idx}
                  onClick={() => handleChange("category", val)}
                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl transition-all duration-300 ${isSelected ? "bg-primary/10 text-primary font-bold shadow-sm" : "hover:bg-foreground/5 text-foreground/80 font-medium"}`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${isSelected ? "bg-primary scale-125 shadow-[0_0_8px_var(--color-primary)]" : "bg-foreground/20"}`}
                    ></div>
                    <span className="text-sm">{cat}</span>
                  </div>
                  {isSelected && <ChevronRight className="w-4 h-4 text-primary" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Dynamic Price Slider */}
      <div className="mb-8 relative z-10">
        <div className="flex justify-between items-center mb-4">
          <h4 className="font-semibold text-xs text-foreground/60 uppercase tracking-[0.15em]">
            Fiyat
          </h4>
          <span className="text-[11px] font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-md">
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
            className="w-full h-1.5 bg-foreground/10 rounded-lg appearance-none cursor-pointer accent-primary hover:accent-primary/80 transition-all"
          />
          <div className="flex justify-between text-[11px] font-medium text-foreground/50 mt-3">
            <span>0₺</span>
            <span>10,000₺</span>
          </div>
        </div>
      </div>

      {/* Color Swatches */}
      <div className="mb-8 relative z-10">
        <h4 className="font-semibold text-xs text-foreground/60 mb-4 uppercase tracking-[0.15em]">
          Renkler
        </h4>
        <div className="flex flex-wrap gap-2.5">
          {colors.map((color, idx) => {
            const isSelected = filters.color === color;
            const hex = colorMap[color] || "#cccccc";
            return (
              <button
                key={idx}
                onClick={() => handleChange("color", isSelected ? "" : color)}
                title={color}
                className={`relative w-8 h-8 rounded-full transition-all duration-300 transform flex items-center justify-center ${
                  isSelected
                    ? "ring-2 ring-primary ring-offset-2 ring-offset-background scale-110 shadow-lg"
                    : "border border-foreground/10 hover:scale-110 hover:shadow-md"
                }`}
                style={{ backgroundColor: hex }}
              >
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className={`w-2.5 h-2.5 rounded-full ${hex === "#FFFFFF" || hex === "#F5F5DC" ? "bg-black" : "bg-white"}`}
                  ></motion.div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sizes */}
      <div className="mb-8 relative z-10">
        <h4 className="font-semibold text-xs text-foreground/60 mb-4 uppercase tracking-[0.15em]">
          Bedenler
        </h4>
        <div className="grid grid-cols-4 gap-2.5">
          {sizes.map((size, idx) => {
            const isSelected = filters.size === size;
            return (
              <button
                key={idx}
                onClick={() => handleChange("size", isSelected ? "" : size)}
                className={`flex items-center justify-center py-2.5 text-xs font-semibold rounded-xl transition-all duration-300 ${
                  isSelected
                    ? "bg-foreground text-background shadow-md scale-[1.02]"
                    : "bg-foreground/5 text-foreground/80 hover:bg-foreground/10 hover:text-foreground"
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
        <label className="flex items-center justify-between cursor-pointer p-4 rounded-xl bg-foreground/5 hover:bg-foreground/10 transition-colors">
          <span className="text-xs font-semibold text-foreground/80 uppercase tracking-widest">
            Stoktakiler
          </span>
          <div className="relative">
            <input
              type="checkbox"
              checked={filters.inStock}
              onChange={(e) => handleChange("inStock", e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-10 h-5 bg-foreground/20 rounded-full peer peer-checked:bg-primary transition-colors duration-300 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all after:duration-300 peer-checked:after:translate-x-5"></div>
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
        className="w-full py-4 text-xs font-bold uppercase tracking-[0.15em] text-foreground bg-foreground/5 hover:bg-primary/10 hover:text-primary rounded-xl transition-all duration-300 relative z-10 group flex items-center justify-center gap-2"
      >
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
      </button>
    </motion.div>
  );
}
