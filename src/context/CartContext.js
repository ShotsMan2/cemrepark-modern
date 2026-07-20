"use client";
import { createContext, useContext, useState, useEffect, useRef } from "react";
import Swal from "sweetalert2";
import { useSession } from "next-auth/react";

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
  const { data: session, status } = useSession();
  const prevSessionStatus = useRef(status);
  const [isSyncing, setIsSyncing] = useState(false);

  const fetchServerCart = async () => {
    try {
      const res = await fetch("/api/cart");
      if (res.ok) {
        const data = await res.json();
        const mappedItems = data.items.map((item) => ({
          ...item.product,
          cartItemId: item.id,
          beden: item.size,
          renk: item.color,
          quantity: item.quantity,
          variantId: item.variantId
        }));
        setCartItems(mappedItems);
      }
    } catch (error) {
      console.error("Sepet yüklenirken hata:", error);
    }
  };

  useEffect(() => {
    if (status === "loading") return;

    if (status === "authenticated") {
      const savedCart = localStorage.getItem("cemrepark_cart");
      
      const syncCart = async () => {
        setIsSyncing(true);
        if (savedCart && prevSessionStatus.current !== "authenticated") {
          const parsed = JSON.parse(savedCart);
          if (parsed.length > 0) {
            try {
              await fetch("/api/cart/sync", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ cartItems: parsed })
              });
              localStorage.removeItem("cemrepark_cart");
            } catch (e) {
              console.error("Sepet eşitlenirken hata:", e);
            }
          }
        }
        await fetchServerCart();
        setIsLoaded(true);
        setIsSyncing(false);
      };

      syncCart();
    } else if (status === "unauthenticated") {
      const savedCart = localStorage.getItem("cemrepark_cart");
      if (savedCart) setCartItems(JSON.parse(savedCart));
      else setCartItems([]);
      setIsLoaded(true);
    }
    prevSessionStatus.current = status;
  }, [status]);

  useEffect(() => {
    if (isLoaded && status === "unauthenticated") {
      localStorage.setItem("cemrepark_cart", JSON.stringify(cartItems));
    }
  }, [cartItems, isLoaded, status]);

  const addToCart = async (product, beden, renk) => {
    if (status === "authenticated") {
      try {
        const res = await fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productId: product.id,
            quantity: 1,
            color: renk,
            size: beden
          })
        });
        if (res.ok) {
          await fetchServerCart();
          Toast.fire({ icon: "success", title: `${product.ad} sepete eklendi!` });
        }
      } catch (error) {
        console.error(error);
        Toast.fire({ icon: "error", title: "Sepete eklenirken hata oluştu." });
      }
    } else {
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
      Toast.fire({ icon: "success", title: `${product.ad} sepete eklendi!` });
    }
  };

  const removeFromCart = async (productId, beden, renk) => {
    if (status === "authenticated") {
      const itemToRemove = cartItems.find(
        (item) => item.id === productId && item.beden === beden && item.renk === renk
      );
      if (itemToRemove && itemToRemove.cartItemId) {
        try {
          const res = await fetch("/api/cart", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ itemId: itemToRemove.cartItemId, quantity: 0 })
          });
          if (res.ok) {
            await fetchServerCart();
          }
        } catch (error) {
          console.error(error);
        }
      }
    } else {
      setCartItems((prev) =>
        prev.filter((item) => !(item.id === productId && item.beden === beden && item.renk === renk))
      );
    }
  };

  const clearCart = async () => {
    if (status === "authenticated") {
      try {
        const res = await fetch("/api/cart", { method: "DELETE" });
        if (res.ok) {
          setCartItems([]);
        }
      } catch (error) {
        console.error(error);
      }
    } else {
      setCartItems([]);
      if (typeof window !== "undefined") {
        localStorage.removeItem("cemrepark_cart");
      }
    }
  };

  const updateQuantity = async (productId, beden, renk, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId, beden, renk);
      return;
    }

    if (status === "authenticated") {
      const itemToUpdate = cartItems.find(
        (item) => item.id === productId && item.beden === beden && item.renk === renk
      );
      if (itemToUpdate && itemToUpdate.cartItemId) {
        try {
          // Optimistic update
          setCartItems((prev) =>
            prev.map((item) =>
              item.cartItemId === itemToUpdate.cartItemId
                ? { ...item, quantity: newQuantity }
                : item
            )
          );
          
          const res = await fetch("/api/cart", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ itemId: itemToUpdate.cartItemId, quantity: newQuantity })
          });
          if (!res.ok) {
            // Revert on error
            await fetchServerCart();
          }
        } catch (error) {
          console.error(error);
          await fetchServerCart();
        }
      }
    } else {
      setCartItems((prev) =>
        prev.map((item) =>
          item.id === productId && item.beden === beden && item.renk === renk
            ? { ...item, quantity: newQuantity }
            : item
        )
      );
    }
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        isCartLoaded: isLoaded,
        isSyncing,
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
