"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { CartProvider, useCart } from "./CartContext";
import { FavoritesProvider, useFavorites } from "./FavoritesContext";
import { CurrencyProvider, useCurrency } from "./CurrencyContext";
import { I18nProvider, useI18n } from "./I18nContext";

const StoreContext = createContext();

function StoreFacadeProvider({ children }) {
  const { cartItems, isCartLoaded, addToCart, removeFromCart, clearCart, updateQuantity } = useCart();
  const { favoriteItems, isFavoritesLoaded, addToFavorites, removeFromFavorites } = useFavorites();
  const { currency, setCurrency, formatPrice, isCurrencyLoaded } = useCurrency();
  const { language, setLanguage, t, isI18nLoaded } = useI18n();

  const [settings, setSettings] = useState({
    siteAdi: "Cemre Park",
    iletisimEposta: "info@cemrepark.com",
    destekTelefonu: "0554 169 89 09",
    adres: "Moda Sokak No: 123, Tekstil Merkezi, İstanbul",
    kargoUcreti: 49.9,
    ucretsizKargoLimiti: 1500,
    ayniGunTeslimat: true,
    bakimModu: false,
    ozelCss: "",
  });

  // Load settings from API
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/settings");
        if (res.ok) {
          const data = await res.json();
          setSettings(data);
        }
      } catch (error) {
        console.error("Ayarlar yüklenirken hata:", error);
      }
    };
    fetchSettings();
  }, []);

  const isLoaded = isCartLoaded && isFavoritesLoaded && isCurrencyLoaded && isI18nLoaded;

  return (
    <StoreContext.Provider
      value={{
        cartItems,
        favoriteItems,
        addToCart,
        removeFromCart,
        addToFavorites,
        removeFromFavorites,
        clearCart,
        updateQuantity,
        isLoaded,
        language,
        setLanguage,
        currency,
        setCurrency,
        formatPrice,
        t,
        settings,
        setSettings,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function StoreProvider({ children }) {
  const [settingsForI18n, setSettingsForI18n] = useState(null);

  // We need to fetch settings at this level too if we want to pass them directly to I18nProvider, 
  // or we can let StoreFacadeProvider handle settings and we just pass a simple context.
  // Actually, I18nProvider takes settings as a prop for the t() function.
  useEffect(() => {
    fetch("/api/settings")
      .then(res => res.ok ? res.json() : null)
      .then(data => setSettingsForI18n(data))
      .catch(() => {});
  }, []);

  return (
    <CartProvider>
      <FavoritesProvider>
        <CurrencyProvider>
          <I18nProvider settings={settingsForI18n}>
            <StoreFacadeProvider>
              {children}
            </StoreFacadeProvider>
          </I18nProvider>
        </CurrencyProvider>
      </FavoritesProvider>
    </CartProvider>
  );
}

export function useStore() {
  return useContext(StoreContext);
}
