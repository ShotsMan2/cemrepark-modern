"use client";
import { createContext, useContext, useState, useEffect } from "react";

const CurrencyContext = createContext<any>({});

export function CurrencyProvider({ children }) {
  const [currency, setCurrency] = useState("TL");
  const [isLoaded, setIsLoaded] = useState(false);
  const [exchangeRates, setExchangeRates] = useState({
    USD: 32,
    EUR: 35,
  });

  useEffect(() => {
    const savedCurr = localStorage.getItem("cemrepark_curr");
    if (savedCurr) setCurrency(savedCurr);
    setIsLoaded(true);

    // In the future, we could fetch exchange rates from an API here
    // fetchExchangeRates().then(rates => setExchangeRates(rates));
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("cemrepark_curr", currency);
    }
  }, [currency, isLoaded]);

  const formatPrice = (priceInTL) => {
    const numPrice = parseFloat(priceInTL) || 0;
    if (currency === "USD") {
      return (
        (numPrice / exchangeRates.USD).toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }) + " $"
      );
    }
    if (currency === "EUR") {
      return (
        (numPrice / exchangeRates.EUR).toLocaleString("en-IE", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }) + " €"
      );
    }
    return (
      numPrice.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) +
      " TL"
    );
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        formatPrice,
        exchangeRates,
        setExchangeRates,
        isCurrencyLoaded: isLoaded,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}
