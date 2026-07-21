"use client";

import React from "react";
import { AlertTriangle, TrendingDown } from "lucide-react";

interface StockWarningItem {
  id: any;
  ad: any;
  resim?: any;
  stok: number;
  renk?: any;
  beden?: any;
}

interface StockWarningProps {
  items?: StockWarningItem[];
}

const fallbackStocks = [
  { id: 1, name: "Floral Maxi Dress", variation: "Size M - Blue", stock: 2, threshold: 5 },
  { id: 2, name: "Silk Hijab", variation: "Standard - Beige", stock: 0, threshold: 10 },
  { id: 3, name: "Evening Abaya", variation: "Size L - Black", stock: 1, threshold: 3 },
  { id: 4, name: "Pearl Pins Set", variation: "Gold", stock: 4, threshold: 15 },
];

export default function StockWarning({ items }: StockWarningProps) {
  const displayItems =
    items && items.length > 0
      ? items.map((p) => ({
          id: p.id,
          name: p.ad,
          variation: [p.renk, p.beden].filter(Boolean).join(" - ") || "-",
          stock: p.stok,
        }))
      : fallbackStocks;

  if (!displayItems || displayItems.length === 0) return null;

  return (
    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-red-100 dark:bg-red-800 p-2 rounded-lg">
          <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-red-800 dark:text-red-300">Kritik Stok Uyarısı</h3>
          <p className="text-sm text-red-600 dark:text-red-400">Stok eşiğinin altındaki ürünler</p>
        </div>
      </div>

      <div className="overflow-hidden bg-white dark:bg-gray-800 rounded-xl border border-red-100 dark:border-red-900/30">
        <table className="w-full text-sm text-left">
          <thead className="bg-red-50/50 dark:bg-gray-800/50 text-red-800 dark:text-red-300 font-medium border-b border-red-100 dark:border-red-900/30">
            <tr>
              <th className="px-4 py-3">Ürün Adı</th>
              <th className="px-4 py-3">Varyasyon</th>
              <th className="px-4 py-3 text-right">Kalan Stok</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-red-50 dark:divide-gray-700">
            {displayItems.map((item) => (
              <tr
                key={item.id}
                className="text-foreground/80 hover:bg-red-50/30 dark:hover:bg-gray-700/50 transition-colors"
              >
                <td className="px-4 py-3 font-medium">{item.name}</td>
                <td className="px-4 py-3 text-foreground/60">{item.variation}</td>
                <td className="px-4 py-3 text-right">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400">
                    <TrendingDown className="w-3 h-3" />
                    {item.stock} adet
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
