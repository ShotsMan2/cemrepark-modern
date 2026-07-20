"use client";
import { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react";
import Swal from "sweetalert2";
import { useSession } from "next-auth/react";
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

export interface CartContextProduct extends Product {
  cartItemId?: number;
  quantity: number;
  beden?: string;
  renk?: string;
  variantId?: number;
}

interface CartContextType {
  cartItems: CartContextProduct[];
  isCartLoaded: boolean;
  isSyncing: boolean;
  addToCart: (product: Product, beden?: string, renk?: string) => Promise<void>;
  removeFromCart: (productId: number, beden?: string, renk?: string) => Promise<void>;
  clearCart: () => Promise<void>;
  updateQuantity: (productId: number, beden?: string, renk?: string, newQuantity: number) => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartContextProduct[]>([]);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const { data: session, status } = useSession();
  const prevSessionStatus = useRef<string>(status);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  const fetchServerCart = async () => {
    try {
      const res = await fetch("/api/cart");
      if (res.ok) {
        const data = await res.json();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mappedItems: CartContextProduct[] = data.items.map((item: any) => ({
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
          try {
            const parsed: CartContextProduct[] = JSON.parse(savedCart);
            if (parsed.length > 0) {
              await fetch("/api/cart/sync", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ cartItems: parsed })
              });
              localStorage.removeItem("cemrepark_cart");
            }
          } catch (e) {
            console.error("Sepet eşitlenirken hata veya parse hatası:", e);
          }
        }
        await fetchServerCart();
        setIsLoaded(true);
        setIsSyncing(false);
      };

      syncCart();
    } else if (status === "unauthenticated") {
      const savedCart = localStorage.getItem("cemrepark_cart");
      if (savedCart) {
        try {
          setCartItems(JSON.parse(savedCart));
        } catch(e) {
          console.error("Sepet parse hatası:", e);
          setCartItems([]);
        }
      } else {
        setCartItems([]);
      }
      setIsLoaded(true);
    }
    prevSessionStatus.current = status;
  }, [status]);

  useEffect(() => {
    if (isLoaded && status === "unauthenticated") {
      localStorage.setItem("cemrepark_cart", JSON.stringify(cartItems));
    }
  }, [cartItems, isLoaded, status]);

  const addToCart = async (product: Product, beden?: string, renk?: string) => {
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
        return [...prev, { ...product, beden, renk, quantity: 1 } as CartContextProduct];
      });
      Toast.fire({ icon: "success", title: `${product.ad} sepete eklendi!` });
    }
  };

  const removeFromCart = async (productId: number, beden?: string, renk?: string) => {
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

  const updateQuantity = async (productId: number, beden?: string, renk?: string, newQuantity: number) => {
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

export function useCart(): CartContextType {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
