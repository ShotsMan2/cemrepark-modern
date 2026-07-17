"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export interface ShippingProvider {
  id: string;
  name: string;
  price: number;
  estimatedDays: string;
}

const providers: ShippingProvider[] = [
  {
    id: 'yurtici',
    name: 'Yurtiçi Kargo',
    price: 49.90,
    estimatedDays: '1-2 İş Günü'
  },
  {
    id: 'aras',
    name: 'Aras Kargo',
    price: 44.90,
    estimatedDays: '2-3 İş Günü'
  },
  {
    id: 'ptt',
    name: 'PTT Kargo',
    price: 35.00,
    estimatedDays: '3-5 İş Günü'
  }
];

interface ShippingSelectorProps {
  selectedId?: string;
  onSelect?: (providerId: string, price: number) => void;
}

export default function ShippingSelector({ selectedId, onSelect }: ShippingSelectorProps) {
  const [selected, setSelected] = useState<string>(selectedId || providers[0].id);

  useEffect(() => {
    if (!selectedId && onSelect) {
      const defaultProvider = providers.find(p => p.id === selected);
      if (defaultProvider) {
        onSelect(defaultProvider.id, defaultProvider.price);
      }
    }
  }, [selectedId, selected, onSelect]);

  const handleSelect = (provider: ShippingProvider) => {
    setSelected(provider.id);
    if (onSelect) {
      onSelect(provider.id, provider.price);
    }
  };

  return (
    <div className="w-full space-y-4 my-6">
      <div className="flex items-center gap-2 mb-4">
        <svg className="w-6 h-6 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
        </svg>
        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
          Kargo Seçimi
        </h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {providers.map((provider) => {
          const isSelected = selected === provider.id;
          return (
            <motion.div
              key={provider.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSelect(provider)}
              className={`
                relative p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300
                flex flex-col items-center text-center gap-2
                ${isSelected 
                  ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/20 shadow-[0_0_15px_rgba(16,185,129,0.15)]' 
                  : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-emerald-300 dark:hover:border-emerald-700'}
              `}
            >
              {isSelected && (
                <div className="absolute top-3 right-3 text-emerald-600 dark:text-emerald-400">
                  <motion.svg 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-6 h-6 drop-shadow-sm" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </motion.svg>
                </div>
              )}
              
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-1 transition-colors ${isSelected ? 'bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-800 dark:to-emerald-900 shadow-inner' : 'bg-gray-100 dark:bg-gray-800'}`}>
                <svg className={`w-7 h-7 ${isSelected ? 'text-emerald-700 dark:text-emerald-300' : 'text-gray-500 dark:text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {/* Shipping Truck Icon */}
                  <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                </svg>
              </div>
              
              <div className="flex-1 mt-2">
                <h4 className={`font-semibold text-lg ${isSelected ? 'text-emerald-800 dark:text-emerald-300' : 'text-gray-700 dark:text-gray-300'}`}>
                  {provider.name}
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full inline-block">
                  {provider.estimatedDays}
                </p>
              </div>

              <div className={`mt-3 font-bold text-xl ${isSelected ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-900 dark:text-gray-100'}`}>
                {provider.price.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
