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
    <div className="bg-white dark:bg-zinc-900/50 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-white/10" data-aos="fade-right">
      <h3 className="text-xl font-black text-gray-900 dark:text-white mb-6 uppercase tracking-widest border-b border-gray-100 dark:border-white/10 pb-4">Filtrele</h3>
      
      {/* Categories */}
      <div className="mb-6">
        <h4 className="font-bold text-sm text-gray-700 dark:text-gray-200 mb-3 uppercase tracking-wider">Kategoriler</h4>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer group">
            <input 
              type="radio" 
              name="category" 
              checked={filters.category === ''}
              onChange={() => handleChange('category', '')}
              className="accent-neon-pink w-4 h-4 cursor-pointer"
            />
            <span className="text-gray-600 dark:text-gray-300 group-hover:text-neon-pink transition-colors text-sm">Tümü</span>
          </label>
          {categories.map((cat, idx) => (
            <label key={idx} className="flex items-center gap-2 cursor-pointer group">
              <input 
                type="radio" 
                name="category" 
                checked={filters.category === cat}
                onChange={() => handleChange('category', cat)}
                className="accent-neon-pink w-4 h-4 cursor-pointer"
              />
              <span className="text-gray-600 dark:text-gray-300 group-hover:text-neon-pink transition-colors text-sm">{cat}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="mb-6">
        <h4 className="font-bold text-sm text-gray-700 dark:text-gray-200 mb-3 uppercase tracking-wider">Fiyat Aralığı</h4>
        <div className="flex items-center gap-2">
          <input 
            type="number" 
            placeholder="Min" 
            value={filters.minPrice || ''}
            onChange={(e) => handleChange('minPrice', Number(e.target.value))}
            className="w-full bg-gray-50 dark:bg-zinc-950/50 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-neon-pink"
          />
          <span className="text-gray-400">-</span>
          <input 
            type="number" 
            placeholder="Max" 
            value={filters.maxPrice === 10000 ? '' : filters.maxPrice}
            onChange={(e) => handleChange('maxPrice', e.target.value ? Number(e.target.value) : 10000)}
            className="w-full bg-gray-50 dark:bg-zinc-950/50 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-neon-pink"
          />
        </div>
      </div>

      {/* Colors */}
      <div className="mb-6">
        <h4 className="font-bold text-sm text-gray-700 dark:text-gray-200 mb-3 uppercase tracking-wider">Renkler</h4>
        <div className="flex flex-wrap gap-2">
          {colors.map((color, idx) => (
            <button
              key={idx}
              onClick={() => handleChange('color', filters.color === color ? '' : color)}
              className={`px-3 py-1 text-xs border rounded-full transition-all ${
                filters.color === color 
                  ? 'bg-neon-pink text-white border-neon-pink' 
                  : 'bg-white dark:bg-zinc-900 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-zinc-700 hover:border-neon-pink'
              }`}
            >
              {color}
            </button>
          ))}
        </div>
      </div>

      {/* Sizes */}
      <div className="mb-6">
        <h4 className="font-bold text-sm text-gray-700 dark:text-gray-200 mb-3 uppercase tracking-wider">Bedenler</h4>
        <div className="flex flex-wrap gap-2">
          {sizes.map((size, idx) => (
            <button
              key={idx}
              onClick={() => handleChange('size', filters.size === size ? '' : size)}
              className={`w-10 h-10 flex items-center justify-center text-xs font-bold rounded-lg transition-all border ${
                filters.size === size 
                  ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white' 
                  : 'bg-white dark:bg-zinc-900 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-zinc-700 hover:border-black dark:hover:border-white'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* In Stock Only */}
      <div className="mb-4 pt-4 border-t border-gray-100 dark:border-white/10">
        <label className="flex items-center gap-3 cursor-pointer group">
          <div className={`w-10 h-5 rounded-full relative transition-colors ${filters.inStock ? 'bg-neon-pink' : 'bg-gray-300 dark:bg-zinc-800'}`}>
            <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${filters.inStock ? 'translate-x-5' : 'translate-x-0'}`}></div>
            <input 
              type="checkbox" 
              checked={filters.inStock} 
              onChange={(e) => handleChange('inStock', e.target.checked)} 
              className="sr-only" 
            />
          </div>
          <span className="text-sm font-bold text-gray-700 dark:text-gray-200">Sadece Stoktakiler</span>
        </label>
      </div>

      <button 
        onClick={() => {
          const reset = { category: '', minPrice: 0, maxPrice: 10000, color: '', size: '', inStock: false };
          setFilters(reset);
          onFilterChange(reset);
        }}
        className="w-full mt-2 py-3 text-sm font-bold text-gray-500 border border-gray-200 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800/50 rounded-lg transition-colors"
      >
        Filtreleri Temizle
      </button>
    </div>
  );
}
