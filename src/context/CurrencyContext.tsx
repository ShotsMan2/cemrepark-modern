"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface ExchangeRates {
  USD: number;
  EUR: number;
}

interface CurrencyContextType {
  currency: string;
  setCurrency: React.Dispatch<React.SetStateAction<string>>;
  formatPrice: (priceInTL: number | string) => string;
  exchangeRates: ExchangeRates;
  setExchangeRates: React.Dispatch<React.SetStateAction<ExchangeRates>>;
  isCurrencyLoaded: boolean;
}

const CurrencyContext = createContext<CurrencyContextType>({} as CurrencyContextType);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrency] = useState("TL");
  const [isLoaded, setIsLoaded] = useState(false);
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates>({
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

  const formatPrice = (priceInTL: number | string) => {
    const numPrice = typeof priceInTL === "string" ? parseFloat(priceInTL) : priceInTL || 0;
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
