"use client";

import React, { useState, useEffect, useCallback } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { motion } from "framer-motion";

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
  Sarı: "#be185d",
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
      className="relative p-8 rounded-[2rem] overflow-hidden group"
      style={{
        background: "linear-gradient(145deg, hsla(var(--primary), 0.1), hsla(var(--purple), 0.15), hsla(var(--primary), 0.06))",
        backdropFilter: "blur(20px) saturate(160%)",
        border: "1px solid hsla(var(--primary), 0.25)",
        boxShadow: "0 8px 32px -8px hsla(var(--primary), 0.12), inset 0 1px 0 hsla(var(--primary), 0.1)",
      }}
    >
      {/* Decorative orbs */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-gradient-to-br from-primary/20 via-purple/15 to-transparent rounded-full blur-[60px] pointer-events-none group-hover:scale-110 transition-transform duration-1000" />
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-gradient-to-tr from-purple/20 to-primary/10 rounded-full blur-[50px] pointer-events-none group-hover:scale-110 transition-transform duration-1000" />

      {/* Header */}
      <h3
        className="text-xl font-bold mb-8 tracking-wide pb-4 relative z-10 flex items-center gap-3"
        style={{ borderBottom: "1px solid hsla(var(--primary), 0.1)" }}
      >
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{
            background: "linear-gradient(135deg, hsla(var(--primary), 0.2), hsla(var(--purple), 0.2))",
          }}
        >
          <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
            />
          </svg>
        </div>
        <span
          className="bg-clip-text text-transparent"
          style={{
            background: "linear-gradient(135deg, hsl(var(--foreground)), hsla(var(--foreground), 0.7))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Filtreler
        </span>
      </h3>

      {/* Category Tree */}
      {!hideCategories && (
        <div className="mb-8 relative z-10">
          <h4 className="font-semibold text-[11px] text-foreground/50 mb-4 uppercase tracking-[0.2em]">
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
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 ${
                    isSelected
                      ? "font-bold"
                      : "hover:bg-white/5 text-foreground/70 font-medium"
                  }`}
                  style={
                    isSelected
                      ? {
                          background: "linear-gradient(135deg, hsla(var(--primary), 0.15), hsla(var(--purple), 0.1))",
                          color: "hsl(var(--primary))",
                          boxShadow: "0 0 20px hsla(var(--primary), 0.1)",
                        }
                      : {}
                  }
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        isSelected ? "scale-125" : "bg-foreground/20"
                      }`}
                      style={
                        isSelected
                          ? {
                              background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--purple)))",
                              boxShadow: "0 0 10px hsla(var(--primary), 0.5)",
                            }
                          : {}
                      }
                    />
                    <span className="text-sm">{cat}</span>
                  </div>
                  {isSelected && (
                    <svg
                      className="w-4 h-4 text-primary"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Dynamic Price Slider */}
      <div className="mb-8 relative z-10">
        <div className="flex justify-between items-center mb-4">
          <h4 className="font-semibold text-[11px] text-foreground/50 uppercase tracking-[0.2em]">
            Fiyat
          </h4>
          <span
            className="text-[11px] font-bold px-3 py-1.5 rounded-lg"
            style={{
              background: "linear-gradient(135deg, hsla(var(--primary), 0.15), hsla(var(--purple), 0.1))",
              color: "hsl(var(--primary))",
            }}
          >
            {tempPrice.min.toLocaleString("tr-TR")}₺ - {tempPrice.max.toLocaleString("tr-TR")}₺
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
            className="w-full h-1.5 bg-foreground/10 rounded-lg appearance-none cursor-pointer transition-all"
            style={{
              accentColor: "hsl(var(--primary))",
            }}
          />
          <div className="flex justify-between text-[11px] font-medium text-foreground/40 mt-3">
            <span>0₺</span>
            <span>10,000₺</span>
          </div>
        </div>
      </div>

      {/* Color Swatches */}
      <div className="mb-8 relative z-10">
        <h4 className="font-semibold text-[11px] text-foreground/50 mb-4 uppercase tracking-[0.2em]">
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
                className={`relative w-9 h-9 rounded-full transition-all duration-300 transform flex items-center justify-center ${
                  isSelected
                    ? "ring-2 ring-offset-2 ring-offset-background scale-110"
                    : "border border-foreground/10 hover:scale-110 hover:shadow-md"
                }`}
                style={{
                  backgroundColor: hex,
                  boxShadow: isSelected ? `0 0 0 2px hsla(var(--primary), 0.6), 0 0 15px hsla(var(--primary), 0.4)` : undefined,
                }}
              >
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className={`w-3 h-3 rounded-full ${
                      hex === "#FFFFFF" || hex === "#F5F5DC" ? "bg-black" : "bg-white"
                    }`}
                    style={{
                      boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sizes */}
      <div className="mb-8 relative z-10">
        <h4 className="font-semibold text-[11px] text-foreground/50 mb-4 uppercase tracking-[0.2em]">
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
                    ? "text-background shadow-md scale-[1.02]"
                    : "bg-foreground/5 text-foreground/70 hover:bg-foreground/10 hover:text-foreground"
                }`}
                style={
                  isSelected
                    ? {
                        background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--secondary)))",
                        boxShadow: "0 4px 15px hsla(var(--primary), 0.3)",
                      }
                    : {}
                }
              >
                {size}
              </button>
            );
          })}
        </div>
      </div>

      {/* In Stock Toggle */}
      <div className="mb-8 relative z-10">
        <label
          className="flex items-center justify-between cursor-pointer p-4 rounded-xl transition-all duration-300 hover:bg-white/5"
          style={{
            background: "rgba(255, 255, 255, 0.03)",
            border: "1px solid rgba(255, 255, 255, 0.05)",
          }}
        >
          <span className="text-xs font-semibold text-foreground/70 uppercase tracking-widest">
            Stoktakiler
          </span>
          <div className="relative">
            <input
              type="checkbox"
              checked={filters.inStock}
              onChange={(e) => handleChange("inStock", e.target.checked)}
              className="sr-only peer"
            />
            <div
              className="w-11 h-6 rounded-full peer peer-checked:transition-colors duration-300 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all after:duration-300 peer-checked:after:translate-x-5"
              style={{
                background: filters.inStock
                  ? "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--secondary)))"
                  : "rgba(255, 255, 255, 0.1)",
                boxShadow: filters.inStock ? `0 0 15px hsla(var(--primary), 0.3)` : "none",
              }}
            />
          </div>
        </label>
      </div>

      {/* Clear Button */}
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
        className="w-full py-4 text-xs font-bold uppercase tracking-[0.15em] text-foreground/60 rounded-xl transition-all duration-300 relative z-10 group flex items-center justify-center gap-3 hover:text-primary"
        style={{
          background: "rgba(255, 255, 255, 0.03)",
          border: "1px solid rgba(255, 255, 255, 0.05)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "hsla(var(--primary), 0.1)";
          e.currentTarget.style.borderColor = "hsla(var(--primary), 0.2)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "rgba(255, 255, 255, 0.03)";
          e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.05)";
        }}
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
          />
        </svg>
        Filtreleri Temizle
      </button>
    </motion.div>
  );
}
