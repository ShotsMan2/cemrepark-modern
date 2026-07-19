"use client";
import { createContext, useContext, useState, useEffect } from "react";
import Swal from "sweetalert2";

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

const FavoritesContext = createContext();

export function FavoritesProvider({ children }) {
  const [favoriteItems, setFavoriteItems] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const savedFavorites = localStorage.getItem("cemrepark_favorites");
    if (savedFavorites) setFavoriteItems(JSON.parse(savedFavorites));
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("cemrepark_favorites", JSON.stringify(favoriteItems));
    }
  }, [favoriteItems, isLoaded]);

  const addToFavorites = (product) => {
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

  const removeFromFavorites = (productId) => {
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

export function useFavorites() {
  return useContext(FavoritesContext);
}
