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

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const savedCart = localStorage.getItem("cemrepark_cart");
    if (savedCart) setCartItems(JSON.parse(savedCart));
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("cemrepark_cart", JSON.stringify(cartItems));
    }
  }, [cartItems, isLoaded]);

  const addToCart = (product, beden, renk) => {
    setCartItems((prev) => {
      const existing = prev.find(
        (item) => item.id === product.id && item.beden === beden && item.renk === renk
      );
      if (existing) {
        return prev.map((item) =>
          item.id === product.id && item.beden === beden && item.renk === renk
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, beden, renk, quantity: 1 }];
    });

    Toast.fire({
      icon: "success",
      title: `${product.ad} sepete eklendi!`,
    });
  };

  const removeFromCart = (productId, beden, renk) => {
    setCartItems((prev) =>
      prev.filter((item) => !(item.id === productId && item.beden === beden && item.renk === renk))
    );
  };

  const clearCart = () => {
    setCartItems([]);
    if (typeof window !== "undefined") {
      localStorage.removeItem("cemrepark_cart");
    }
  };

  const updateQuantity = (productId, beden, renk, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId, beden, renk);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === productId && item.beden === beden && item.renk === renk
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        isCartLoaded: isLoaded,
        addToCart,
        removeFromCart,
        clearCart,
        updateQuantity,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
