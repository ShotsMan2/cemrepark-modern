"use client";
import Image from "next/image";
import Link from "next/link";
import { useStore } from "../context/StoreContext";
import Swal from "sweetalert2";
import { getValidImageUrl } from "../utils/imageHelper";
import React from "react";
import { Product } from "@prisma/client";

interface QuickViewModalProps {
  product: Product;
  onClose: () => void;
}

export default function QuickViewModal({ product, onClose }: QuickViewModalProps) {
  const { formatPrice, t, favoriteItems, addToFavorites, removeFromFavorites, isLoaded } =
    useStore();

  if (!product) return null;

  const isFavorite = isLoaded && favoriteItems.some((item) => item.id === product.id);

  const toggleFavorite = () => {
    if (!isLoaded) return;

    if (isFavorite) {
      removeFromFavorites(product.id);
      Swal.fire({
        toast: true,
        position: "bottom-end",
        showConfirmButton: false,
        timer: 2000,
        icon: "info",
        title: "Favorilerden Çıkarıldı!",
        background: "rgba(10, 10, 10, 0.9)",
        color: "#fff",
        iconColor: "#a0a0a0",
      });
    } else {
      addToFavorites(product);
      Swal.fire({
        toast: true,
        position: "bottom-end",
        showConfirmButton: false,
        timer: 2000,
        icon: "success",
        title: "Favorilere Eklendi! 💖",
        background: "rgba(10, 10, 10, 0.9)",
        color: "#fff",
        iconColor: "#ff007f",
      });
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-md" onClick={onClose}></div>
      <div className="glass-panel w-full max-w-4xl max-h-[90vh] overflow-y-auto clip-angled relative z-10 flex flex-col md:flex-row animate-fade-in">
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 w-10 h-10 bg-black/50 rounded-full flex items-center justify-center text-foreground hover:text-neon-pink hover:bg-white transition-colors z-20"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <div className="w-full md:w-1/2 h-[400px] md:h-[600px] relative clip-angled">
          <Image
            src={getValidImageUrl(product.resim || product.gorsel?.split(',')[0] || '')}
            alt={product.ad}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>

        <div className="w-full md:w-1/2 p-8 flex flex-col justify-center">
          <span className="text-neon-pink text-xs font-bold uppercase tracking-widest mb-2 block">
            {(t(product.kategori) as string) || (t("collection") as string)}
          </span>
          <h2 className="text-3xl font-black text-foreground uppercase tracking-widest mb-4">
            {t(product.ad)}
          </h2>
          <div className="text-3xl font-bold text-holo-gold mb-8">{formatPrice(product.fiyat)}</div>

          <p className="text-foreground/70 text-sm mb-8 leading-relaxed">{t("quick_view_desc") as string}</p>

          <div className="flex gap-4">
            <Link
              href={`/urundetay/${product.id}`}
              className="flex-1 text-center bg-transparent border border-neon-pink text-neon-pink px-6 py-4 font-bold uppercase tracking-widest hover:bg-neon-pink hover:text-foreground transition-colors clip-angled"
            >
              {t("details") as string}
            </Link>
            <button
              onClick={toggleFavorite}
              className={`flex-1 flex items-center justify-center gap-2 py-4 uppercase font-bold tracking-widest transition-all duration-300 clip-angled text-sm ${
                isFavorite
                  ? "bg-gray-900 dark:bg-white text-foreground dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200"
                  : "bg-neon-pink text-foreground hover:bg-black dark:hover:bg-white hover:text-foreground dark:hover:text-black"
              }`}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill={isFavorite ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
              {isFavorite ? (t("remove_from_favorites") as string) : (t("add_to_favorites") as string)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
