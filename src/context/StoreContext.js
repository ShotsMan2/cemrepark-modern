"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { translations } from "../utils/translations";

const StoreContext = createContext();

export function StoreProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [favoriteItems, setFavoriteItems] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [language, setLanguage] = useState("TR");
  const [currency, setCurrency] = useState("TL");

  // Load from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("cemrepark_cart");
    const savedFavorites = localStorage.getItem("cemrepark_favorites");
    const savedLang = localStorage.getItem("cemrepark_lang");
    const savedCurr = localStorage.getItem("cemrepark_curr");
    
    if (savedCart) setCartItems(JSON.parse(savedCart));
    if (savedFavorites) setFavoriteItems(JSON.parse(savedFavorites));
    if (savedLang) setLanguage(savedLang);
    if (savedCurr) setCurrency(savedCurr);
    
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

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("cemrepark_lang", language);
      localStorage.setItem("cemrepark_curr", currency);
    }
  }, [language, currency, isLoaded]);

  const formatPrice = (priceInTL) => {
    const numPrice = parseFloat(priceInTL) || 0;
    if (currency === "USD") {
      return (numPrice / 32).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " $";
    }
    if (currency === "EUR") {
      return (numPrice / 35).toLocaleString('en-IE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
    }
    return numPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " TL";
  };

  const t = (key, params = {}) => {
    let text = translations[language]?.[key] || translations["TR"][key] || key;
    Object.keys(params).forEach(k => {
      text = text.replace(`{${k}}`, params[k]);
    });
    return text;
  };

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
      isLoaded,
      language,
      setLanguage,
      currency,
      setCurrency,
      formatPrice,
      t
    }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  return useContext(StoreContext);
}
