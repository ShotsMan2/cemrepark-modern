'use client';

import React from 'react';

interface LowStockItem {
  id: number;
  ad: string;
  resim: string | null;
  stok: number;
  renk?: string | null;
  beden?: string | null;
}

interface StockWarningProps {
  items: LowStockItem[];
}

export default function StockWarning({ items }: StockWarningProps) {
  if (!items || items.length === 0) {
    return (
      <div className="glass-panel p-6 clip-angled relative overflow-hidden group border border-green-500/30 bg-black/40">
        <div className="absolute top-0 right-0 w-24 h-24 bg-green-500 opacity-10 rounded-bl-full"></div>
        <div className="flex items-center gap-4 text-green-400">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h4 className="font-bold text-lg uppercase tracking-widest">Stok Durumu Harika!</h4>
            <p className="text-sm text-gray-400 mt-1">Şu an için kritik seviyede olan (5'ten az) ürün bulunmuyor.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-panel p-6 clip-angled relative overflow-hidden group border border-red-500/50 bg-black/40">
      <div className="absolute top-0 right-0 w-32 h-32 bg-red-500 opacity-10 rounded-bl-full animate-pulse"></div>
      
      <div className="flex items-center gap-3 text-red-500 mb-6 border-b border-red-500/20 pb-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <h3 className="text-lg font-black uppercase tracking-widest">Kritik Stok Uyarısı</h3>
      </div>
      
      <div className="space-y-4 max-h-80 overflow-y-auto custom-scrollbar pr-2">
        {items.map((item) => (
          <div key={`${item.id}-${item.renk}-${item.beden}`} className="flex items-center justify-between bg-black/60 p-4 clip-angled border border-red-500/20 hover:border-red-500/50 transition-colors">
            <div className="flex items-center gap-4">
              {item.resim ? (
                <img src={item.resim} alt={item.ad} className="w-14 h-14 object-cover rounded-sm border border-white/10" />
              ) : (
                <div className="w-14 h-14 bg-white/5 rounded-sm flex items-center justify-center">
                  <span className="text-xs text-gray-500">Görsel Yok</span>
                </div>
              )}
              <div>
                <p className="font-bold text-white text-sm line-clamp-1">{item.ad}</p>
                <div className="flex gap-2 text-[10px] text-gray-400 mt-2 uppercase tracking-wider">
                  {item.renk && <span className="bg-white/5 px-2 py-1 border border-white/10">{item.renk}</span>}
                  {item.beden && <span className="bg-white/5 px-2 py-1 border border-white/10">{item.beden}</span>}
                </div>
              </div>
            </div>
            <div className="text-right flex flex-col items-end pl-4 border-l border-white/10">
              <span className="text-3xl font-black text-red-500">{item.stok}</span>
              <span className="text-[10px] text-red-400/70 font-bold uppercase tracking-widest">Kalan</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
