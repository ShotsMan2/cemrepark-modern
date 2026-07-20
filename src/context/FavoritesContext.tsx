"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import Swal from "sweetalert2";
import { Product } from "@/types";

const Toast = Swal.mixin({
  toast: true,
  position: "bottom-end",
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  background: "rgba(15, 15, 15, 0.95)",
  color: "#fff",
  iconColor: "#ff007f",
  customClass: {
    popup: "border border-[rgba(255,0,127,0.2)] rounded-xl backdrop-blur-md",
  },
});

interface FavoritesContextType {
  favoriteItems: Product[];
  isFavoritesLoaded: boolean;
  addToFavorites: (product: Product) => void;
  removeFromFavorites: (productId: number) => void;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favoriteItems, setFavoriteItems] = useState<Product[]>([]);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  useEffect(() => {
    const savedFavorites = localStorage.getItem("cemrepark_favorites");
    if (savedFavorites) {
      try {
        setFavoriteItems(JSON.parse(savedFavorites));
      } catch (error) {
        console.error("Failed to parse favorites from localStorage", error);
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("cemrepark_favorites", JSON.stringify(favoriteItems));
    }
  }, [favoriteItems, isLoaded]);

  const addToFavorites = (product: Product) => {
    setFavoriteItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) return prev;
      return [...prev, product];
    });

    Toast.fire({
      icon: "success",
      title: `${product.ad} favorilere eklendi!`,
    });
  };

  const removeFromFavorites = (productId: number) => {
    setFavoriteItems((prev) => prev.filter((item) => item.id !== productId));
  };

  return (
    <FavoritesContext.Provider
      value={{
        favoriteItems,
        isFavoritesLoaded: isLoaded,
        addToFavorites,
        removeFromFavorites,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites(): FavoritesContextType {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }
  return context;
}
