"use client";
import { useStore } from "../context/StoreContext";
import Swal from "sweetalert2";

export default function FavoriteButton({ product, className }) {
  const { favoriteItems, addToFavorites, removeFromFavorites, isLoaded, t } = useStore();

  if (!isLoaded) {
    return (
      <button
        className={`text-gray-500 relative z-20 ${className || ""}`}
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

  const toggleFavorite = (e) => {
    e.preventDefault(); // Prevent navigating to the product page since it's likely wrapped in a Link or inside a container with a Link overlay

    if (isFavorite) {
      removeFromFavorites(product.id);
      Swal.fire({
        toast: true,
        position: "bottom-end",
        showConfirmButton: false,
        timer: 2000,
        icon: "info",
        title: t("favorite_removed_toast"),
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
        title: t("favorite_added_toast"),
        background: "rgba(10, 10, 10, 0.9)",
        color: "#fff",
        iconColor: "#ff007f",
        customClass: {
          popup: "border border-neon-pink backdrop-blur-md rounded-xl",
        },
      });
    }
  };

  return (
    <button
      onClick={toggleFavorite}
      className={`transition-colors relative z-20 ${isFavorite ? "text-neon-pink" : "text-gray-500 hover:text-black dark:hover:text-white"} ${className || ""}`}
      title={isFavorite ? t("favorite_remove_title") : t("favorite_add_title")}
      aria-label={isFavorite ? t("favorite_remove_title") : t("favorite_add_title")}
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
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
      </svg>
    </button>
  );
}
