"use client";
import { useStore } from "../context/StoreContext";
import { showInfoToast, showToast } from "../utils/toast";
import React from "react";
import { Product } from "@prisma/client";

interface FavoriteButtonProps {
  product: Product;
  className?: string;
}

export default function FavoriteButton({ product, className = "" }: FavoriteButtonProps) {
  const { favoriteItems, addToFavorites, removeFromFavorites, isLoaded, t } = useStore();

  if (!isLoaded) {
    return (
      <button
        className={`text-gray-500 relative z-20 ${className}`}
        disabled
        aria-label="Yükleniyor..."
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
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
        </svg>
      </button>
    );
  }

  const isFavorite = favoriteItems.some((item) => item.id === product.id);

  const toggleFavorite = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (isFavorite) {
      removeFromFavorites(product.id);
      showInfoToast(t("favorite_removed_toast") as string);
    } else {
      addToFavorites(product);
      showToast(t("favorite_added_toast") as string);
    }
  };

  return (
    <button
      onClick={toggleFavorite}
      className={`transition-all duration-300 transform active:scale-75 hover:scale-110 relative z-20 focus-visible:ring-2 focus-visible:ring-neon-pink focus-visible:outline-none focus-visible:ring-offset-2 focus-visible:ring-offset-background ${isFavorite ? "text-neon-pink drop-shadow-md hover:text-pink-600" : "text-gray-400 hover:text-neon-pink dark:hover:text-neon-pink"} ${className}`}
      title={(isFavorite ? t("favorite_remove_title") : t("favorite_add_title")) as string}
      aria-label={(isFavorite ? t("favorite_remove_title") : t("favorite_add_title")) as string}
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill={isFavorite ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`transition-all duration-300 ${isFavorite ? "animate-pulse" : ""}`}
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
      </svg>
    </button>
  );
}
