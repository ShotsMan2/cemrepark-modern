"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import PriceDisplay from "../PriceDisplay";
import FavoriteButton from "../FavoriteButton";
import { useStore } from "@/context/StoreContext";
import { getValidImageUrl } from "@/utils/imageHelper";
import { Product } from "@prisma/client";

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
  className?: string;
  delay?: number;
}

export function ProductCard({ product, onQuickView, className = "", delay = 0 }: ProductCardProps) {
  const { t } = useStore();

  return (
    <div
      className={`glass-panel p-4 clip-angled group hover:border-neon-pink hover:shadow-2xl hover:shadow-neon-pink/20 transition-all duration-500 relative transform hover:-translate-y-2 ${className}`}
      data-aos="fade-up"
      data-aos-delay={delay}
    >
      <div className="relative aspect-[3/4] mb-4 overflow-hidden clip-angled transform-gpu skeleton">
        {product.etiket && (
          <div className="absolute top-2 left-2 z-20">
            <span className="text-xs font-bold uppercase tracking-widest bg-gradient-to-r from-neon-pink to-holo-gold text-white px-3 py-1 clip-angled shadow-lg">
              {t(product.etiket) as string}
            </span>
          </div>
        )}

        <Image
          src={getValidImageUrl(product.resim || product.gorsel?.split(',')[0] || '')}
          alt={product.ad}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          className="object-cover transition-transform duration-700 group-hover:scale-110 ease-out"
        />

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none z-10"></div>
        <Link href={`/urundetay/${product.id}`} className="absolute inset-0 z-20"></Link>

        {/* Quick View Button - appears on hover */}
        {onQuickView && (
          <div className="absolute bottom-4 left-0 w-full px-4 flex justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-8 group-hover:translate-y-0 z-30">
            <button
              onClick={(e) => { e.preventDefault(); onQuickView(product); }}
              className="text-xs uppercase tracking-widest font-black text-gray-900 dark:text-white hover:text-white hover:bg-neon-pink transition-colors bg-white/90 dark:bg-black/80 px-6 py-3 rounded-full backdrop-blur-md shadow-xl w-full active:scale-95"
            >
              {t("quick_view") as string}
            </button>
          </div>
        )}
      </div>

      <div className="p-4 relative">
        <p className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-widest mb-1 group-hover:text-holo-gold transition-colors">
          {t(product.kategori) as string}
        </p>
        <Link href={`/urundetay/${product.id}`} className="block before:absolute before:inset-0 before:z-10">
          <h3 className="text-gray-900 dark:text-white font-black text-lg truncate mb-2 group-hover:text-neon-pink transition-colors">{t(product.ad) as string}</h3>
        </Link>
        <div className="flex justify-between items-center mt-3">
          <PriceDisplay amount={product.fiyat} className="text-gray-900 dark:text-white font-black text-xl" />
          <FavoriteButton product={product} className="relative z-30 transform hover:scale-110 active:scale-90" />
        </div>
      </div>
    </div>
  );
}
