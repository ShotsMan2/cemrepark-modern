"use client";
import { createContext, useContext, useState, useEffect } from "react";

const StoreContext = createContext();

export function StoreProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [favoriteItems, setFavoriteItems] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("cemrepark_cart");
    const savedFavorites = localStorage.getItem("cemrepark_favorites");
    
    if (savedCart) setCartItems(JSON.parse(savedCart));
    if (savedFavorites) setFavoriteItems(JSON.parse(savedFavorites));
    
    setIsLoaded(true);
  }, []);

  // Save to localStorage whenever items change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("cemrepark_cart", JSON.stringify(cartItems));
    }
  }, [cartItems, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("cemrepark_favorites", JSON.stringify(favoriteItems));
    }
  }, [favoriteItems, isLoaded]);

  const addToCart = (product, beden, renk) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id && item.beden === beden && item.renk === renk);
      if (existing) {
        return prev.map(item => 
          (item.id === product.id && item.beden === beden && item.renk === renk)
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, beden, renk, quantity: 1 }];
    });
  };

  const removeFromCart = (productId, beden, renk) => {
    setCartItems(prev => prev.filter(item => !(item.id === productId && item.beden === beden && item.renk === renk)));
  };

  const addToFavorites = (product) => {
    setFavoriteItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) return prev; // Already in favorites
      return [...prev, product];
    });
  };

  const removeFromFavorites = (productId) => {
    setFavoriteItems(prev => prev.filter(item => item.id !== productId));
  };

  return (
    <StoreContext.Provider value={{
      cartItems,
      favoriteItems,
      addToCart,
      removeFromCart,
      addToFavorites,
      removeFromFavorites,
      isLoaded
    }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  return useContext(StoreContext);
}
