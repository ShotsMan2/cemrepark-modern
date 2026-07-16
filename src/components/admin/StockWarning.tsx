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
      <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-6 flex items-center gap-4 text-emerald-800">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
          <h4 className="font-bold text-lg">Stok Durumu Harika!</h4>
          <p className="text-sm">Şu an için kritik seviyede olan (3'ten az) ürün bulunmuyor.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-rose-50 border border-rose-200 rounded-xl p-6">
      <div className="flex items-center gap-3 text-rose-700 mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <h3 className="text-lg font-bold">Kritik Stok Uyarısı</h3>
      </div>
      
      <div className="space-y-3">
        {items.map((item) => (
          <div key={`${item.id}-${item.renk}-${item.beden}`} className="flex items-center justify-between bg-white p-3 rounded-lg border border-rose-100 shadow-sm">
            <div className="flex items-center gap-4">
              {item.resim ? (
                <img src={item.resim} alt={item.ad} className="w-12 h-12 object-cover rounded-md" />
              ) : (
                <div className="w-12 h-12 bg-gray-200 rounded-md"></div>
              )}
              <div>
                <p className="font-semibold text-gray-800 text-sm line-clamp-1">{item.ad}</p>
                <div className="flex gap-2 text-xs text-gray-500 mt-1">
                  {item.renk && <span className="bg-gray-100 px-2 py-0.5 rounded">{item.renk}</span>}
                  {item.beden && <span className="bg-gray-100 px-2 py-0.5 rounded">{item.beden}</span>}
                </div>
              </div>
            </div>
            <div className="text-right flex flex-col items-end">
              <span className="text-2xl font-black text-rose-600">{item.stok}</span>
              <span className="text-[10px] text-rose-500 font-medium uppercase tracking-wider">Kalan</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
