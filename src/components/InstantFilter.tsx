'use client';

import React, { useState, useEffect } from 'react';

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

export default function InstantFilter({ categories, colors, sizes, onFilterChange }: InstantFilterProps) {
  const [filters, setFilters] = useState<FilterState>({
    category: '',
    minPrice: 0,
    maxPrice: 10000,
    color: '',
    size: '',
    inStock: false
  });

  const handleChange = (key: keyof FilterState, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters); // Trigger instant filter change
  };

  return (
    <div className="bg-white/60 dark:bg-zinc-900/40 backdrop-blur-xl p-8 rounded-[2rem] shadow-xl border border-white/50 dark:border-white/10 relative overflow-hidden" data-aos="fade-right">
      <div className="absolute top-0 right-0 w-32 h-32 bg-neon-pink/10 rounded-full blur-[50px] pointer-events-none"></div>
      <h3 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-500 dark:from-white dark:to-gray-400 mb-8 uppercase tracking-widest border-b border-gray-200 dark:border-white/10 pb-4">Gelişmiş Filtre</h3>
      
      {/* Categories */}
      <div className="mb-8 relative z-10">
        <h4 className="font-black text-xs text-gray-400 dark:text-gray-500 mb-4 uppercase tracking-[0.2em]">Kategoriler</h4>
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer group">
            <div className="relative flex items-center justify-center">
              <input 
                type="radio" 
                name="category" 
                checked={filters.category === ''}
                onChange={() => handleChange('category', '')}
                className="peer sr-only"
              />
              <div className="w-5 h-5 rounded-full border-2 border-gray-300 dark:border-zinc-600 peer-checked:border-neon-pink peer-checked:bg-neon-pink/20 transition-all duration-300"></div>
              <div className="absolute w-2 h-2 rounded-full bg-neon-pink opacity-0 peer-checked:opacity-100 transition-all duration-300 scale-0 peer-checked:scale-100"></div>
            </div>
            <span className="text-gray-700 dark:text-gray-300 group-hover:text-neon-pink font-medium transition-colors text-sm">Tümü</span>
          </label>
          {categories.map((cat, idx) => (
            <label key={idx} className="flex items-center gap-3 cursor-pointer group">
              <div className="relative flex items-center justify-center">
                <input 
                  type="radio" 
                  name="category" 
                  checked={filters.category === cat}
                  onChange={() => handleChange('category', cat)}
                  className="peer sr-only"
                />
                <div className="w-5 h-5 rounded-full border-2 border-gray-300 dark:border-zinc-600 peer-checked:border-neon-pink peer-checked:bg-neon-pink/20 transition-all duration-300"></div>
                <div className="absolute w-2 h-2 rounded-full bg-neon-pink opacity-0 peer-checked:opacity-100 transition-all duration-300 scale-0 peer-checked:scale-100"></div>
              </div>
              <span className="text-gray-700 dark:text-gray-300 group-hover:text-neon-pink font-medium transition-colors text-sm">{cat}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="mb-8 relative z-10">
        <h4 className="font-black text-xs text-gray-400 dark:text-gray-500 mb-4 uppercase tracking-[0.2em]">Fiyat Aralığı</h4>
        <div className="flex items-center gap-3">
          <div className="relative flex-1 group">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">₺</span>
            <input 
              type="number" 
              placeholder="Min" 
              value={filters.minPrice || ''}
              onChange={(e) => handleChange('minPrice', Number(e.target.value))}
              className="w-full bg-white/50 dark:bg-zinc-950/50 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white rounded-xl pl-7 pr-3 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-neon-pink transition-all shadow-inner group-hover:border-neon-pink/50"
            />
          </div>
          <span className="text-gray-300 dark:text-zinc-600 font-bold">-</span>
          <div className="relative flex-1 group">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">₺</span>
            <input 
              type="number" 
              placeholder="Max" 
              value={filters.maxPrice === 10000 ? '' : filters.maxPrice}
              onChange={(e) => handleChange('maxPrice', e.target.value ? Number(e.target.value) : 10000)}
              className="w-full bg-white/50 dark:bg-zinc-950/50 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white rounded-xl pl-7 pr-3 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-neon-pink transition-all shadow-inner group-hover:border-neon-pink/50"
            />
          </div>
        </div>
      </div>

      {/* Colors */}
      <div className="mb-8 relative z-10">
        <h4 className="font-black text-xs text-gray-400 dark:text-gray-500 mb-4 uppercase tracking-[0.2em]">Renkler</h4>
        <div className="flex flex-wrap gap-2">
          {colors.map((color, idx) => (
            <button
              key={idx}
              onClick={() => handleChange('color', filters.color === color ? '' : color)}
              className={`px-4 py-2 text-xs font-bold rounded-full transition-all duration-300 transform active:scale-95 shadow-sm ${
                filters.color === color 
                  ? 'bg-gradient-to-r from-neon-pink to-holo-gold text-white shadow-neon-pink/30 scale-105' 
                  : 'bg-white/80 dark:bg-zinc-800/80 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-zinc-700 hover:border-neon-pink hover:text-neon-pink'
              }`}
            >
              {color}
            </button>
          ))}
        </div>
      </div>

      {/* Sizes */}
      <div className="mb-8 relative z-10">
        <h4 className="font-black text-xs text-gray-400 dark:text-gray-500 mb-4 uppercase tracking-[0.2em]">Bedenler</h4>
        <div className="flex flex-wrap gap-2">
          {sizes.map((size, idx) => (
            <button
              key={idx}
              onClick={() => handleChange('size', filters.size === size ? '' : size)}
              className={`w-11 h-11 flex items-center justify-center text-xs font-black rounded-xl transition-all duration-300 transform active:scale-95 shadow-sm ${
                filters.size === size 
                  ? 'bg-gray-900 dark:bg-white text-white dark:text-black shadow-lg scale-105' 
                  : 'bg-white/80 dark:bg-zinc-800/80 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-zinc-700 hover:border-gray-900 dark:hover:border-white'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* In Stock Only */}
      <div className="mb-6 pt-6 border-t border-gray-200 dark:border-white/10 relative z-10">
        <label className="flex items-center justify-between cursor-pointer group">
          <span className="text-sm font-black text-gray-700 dark:text-gray-300 uppercase tracking-wider group-hover:text-neon-pink transition-colors">Sadece Stoktakiler</span>
          <div className={`w-12 h-6 rounded-full relative transition-colors duration-300 shadow-inner ${filters.inStock ? 'bg-neon-pink' : 'bg-gray-300 dark:bg-zinc-700'}`}>
            <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 shadow-sm ${filters.inStock ? 'translate-x-6' : 'translate-x-0'}`}></div>
            <input 
              type="checkbox" 
              checked={filters.inStock} 
              onChange={(e) => handleChange('inStock', e.target.checked)} 
              className="sr-only" 
            />
          </div>
        </label>
      </div>

      <button 
        onClick={() => {
          const reset = { category: '', minPrice: 0, maxPrice: 10000, color: '', size: '', inStock: false };
          setFilters(reset);
          onFilterChange(reset);
        }}
        className="w-full mt-4 py-4 text-xs font-black uppercase tracking-[0.2em] text-gray-500 border-2 border-gray-200 dark:border-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-gray-900 dark:hover:text-white rounded-xl transition-all duration-300 active:scale-95 relative z-10"
      >
        Filtreleri Temizle
      </button>
    </div>
  );
}
