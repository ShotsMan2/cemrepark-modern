'use client';

import React, { useState, useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';

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

  useEffect(() => {
    AOS.init({ duration: 800, once: true });
  }, []);

  const handleChange = (key: keyof FilterState, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className="bg-white/40 dark:bg-zinc-900/40 backdrop-blur-3xl p-8 rounded-[2.5rem] shadow-2xl border border-white/50 dark:border-white/10 relative overflow-hidden group transition-all duration-500 hover:shadow-neon-pink/10" data-aos="fade-right">
      <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-neon-pink/20 to-holo-gold/20 rounded-full blur-[60px] pointer-events-none group-hover:scale-150 transition-transform duration-1000"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-blue-500/10 to-purple-500/10 rounded-full blur-[50px] pointer-events-none group-hover:scale-150 transition-transform duration-1000"></div>
      
      <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-500 dark:from-white dark:to-gray-400 mb-8 uppercase tracking-[0.15em] border-b border-gray-200 dark:border-white/10 pb-4 relative z-10">
        Filtreler
      </h3>
      
      {/* Categories */}
      <div className="mb-8 relative z-10">
        <h4 className="font-black text-xs text-gray-500 dark:text-gray-400 mb-4 uppercase tracking-[0.2em]">Kategoriler</h4>
        <div className="space-y-3">
          {['Tümü', ...categories].map((cat, idx) => {
            const val = cat === 'Tümü' ? '' : cat;
            return (
              <label key={idx} className="flex items-center gap-4 cursor-pointer group/label">
                <div className="relative flex items-center justify-center">
                  <input 
                    type="radio" 
                    name="category" 
                    checked={filters.category === val}
                    onChange={() => handleChange('category', val)}
                    className="peer sr-only"
                  />
                  <div className="w-6 h-6 rounded-xl border-2 border-gray-300 dark:border-zinc-600 peer-checked:border-neon-pink peer-checked:bg-neon-pink/10 transition-all duration-300 group-hover/label:border-neon-pink/50"></div>
                  <div className="absolute inset-0 m-auto w-3 h-3 rounded-lg bg-neon-pink opacity-0 peer-checked:opacity-100 transition-all duration-300 scale-0 peer-checked:scale-100"></div>
                </div>
                <span className={`text-sm font-bold transition-colors ${filters.category === val ? 'text-neon-pink' : 'text-gray-600 dark:text-gray-400 group-hover/label:text-gray-900 dark:group-hover/label:text-white'}`}>
                  {cat}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Price Range */}
      <div className="mb-8 relative z-10">
        <h4 className="font-black text-xs text-gray-500 dark:text-gray-400 mb-4 uppercase tracking-[0.2em]">Fiyat (₺)</h4>
        <div className="flex items-center gap-4">
          <div className="relative flex-1 group/price">
            <input 
              type="number" 
              placeholder="Min" 
              value={filters.minPrice || ''}
              onChange={(e) => handleChange('minPrice', Number(e.target.value))}
              className="w-full bg-white/60 dark:bg-zinc-950/60 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white rounded-2xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-neon-pink transition-all shadow-inner group-hover/price:border-neon-pink/50"
            />
          </div>
          <span className="text-gray-300 dark:text-zinc-600 font-bold">-</span>
          <div className="relative flex-1 group/price">
            <input 
              type="number" 
              placeholder="Max" 
              value={filters.maxPrice === 10000 ? '' : filters.maxPrice}
              onChange={(e) => handleChange('maxPrice', e.target.value ? Number(e.target.value) : 10000)}
              className="w-full bg-white/60 dark:bg-zinc-950/60 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white rounded-2xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-neon-pink transition-all shadow-inner group-hover/price:border-neon-pink/50"
            />
          </div>
        </div>
      </div>

      {/* Colors */}
      <div className="mb-8 relative z-10">
        <h4 className="font-black text-xs text-gray-500 dark:text-gray-400 mb-4 uppercase tracking-[0.2em]">Renkler</h4>
        <div className="flex flex-wrap gap-3">
          {colors.map((color, idx) => {
            const isSelected = filters.color === color;
            return (
              <button
                key={idx}
                onClick={() => handleChange('color', isSelected ? '' : color)}
                className={`relative overflow-hidden px-5 py-2.5 text-xs font-black rounded-2xl transition-all duration-300 transform active:scale-95 ${
                  isSelected 
                    ? 'text-white shadow-lg shadow-neon-pink/30 scale-105 ring-2 ring-neon-pink ring-offset-2 ring-offset-gray-50 dark:ring-offset-zinc-900' 
                    : 'bg-white/80 dark:bg-zinc-800/80 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-zinc-700 hover:border-neon-pink hover:text-neon-pink shadow-sm'
                }`}
              >
                {isSelected && <div className="absolute inset-0 bg-gradient-to-r from-neon-pink to-holo-gold z-0"></div>}
                <span className="relative z-10">{color}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Sizes */}
      <div className="mb-8 relative z-10">
        <h4 className="font-black text-xs text-gray-500 dark:text-gray-400 mb-4 uppercase tracking-[0.2em]">Bedenler</h4>
        <div className="grid grid-cols-4 gap-3">
          {sizes.map((size, idx) => {
            const isSelected = filters.size === size;
            return (
              <button
                key={idx}
                onClick={() => handleChange('size', isSelected ? '' : size)}
                className={`flex items-center justify-center aspect-square text-sm font-black rounded-2xl transition-all duration-300 transform active:scale-95 ${
                  isSelected 
                    ? 'bg-gradient-to-br from-gray-900 to-black dark:from-white dark:to-gray-200 text-white dark:text-black shadow-xl shadow-black/20 dark:shadow-white/20 scale-110' 
                    : 'bg-white/80 dark:bg-zinc-800/80 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-zinc-700 hover:border-gray-900 dark:hover:border-white hover:shadow-md'
                }`}
              >
                {size}
              </button>
            );
          })}
        </div>
      </div>

      {/* In Stock Only */}
      <div className="mb-8 pt-8 border-t border-gray-200 dark:border-white/10 relative z-10">
        <label className="flex items-center justify-between cursor-pointer group">
          <span className="text-sm font-black text-gray-700 dark:text-gray-300 uppercase tracking-widest group-hover:text-neon-pink transition-colors">Sadece Stoktakiler</span>
          <div className={`w-14 h-7 rounded-full relative transition-all duration-500 shadow-inner ${filters.inStock ? 'bg-gradient-to-r from-neon-pink to-holo-gold' : 'bg-gray-300 dark:bg-zinc-700'}`}>
            <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform duration-500 shadow-md ${filters.inStock ? 'translate-x-7 rotate-180' : 'translate-x-0'}`}></div>
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
        className="w-full py-4 text-xs font-black uppercase tracking-[0.2em] text-gray-600 dark:text-gray-400 bg-gray-100/50 dark:bg-zinc-800/50 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-500 dark:hover:text-red-400 rounded-2xl transition-all duration-300 active:scale-95 relative z-10 group"
      >
        <span className="flex items-center justify-center gap-2">
          <svg className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          Filtreleri Temizle
        </span>
      </button>
    </div>
  );
}
