"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { CartProvider, useCart } from "./CartContext";
import { FavoritesProvider, useFavorites } from "./FavoritesContext";
import { CurrencyProvider, useCurrency } from "./CurrencyContext";
import { I18nProvider, useI18n } from "./I18nContext";
import type { Settings, CartContextProduct, Product } from "@/types";

interface StoreContextType {
  cartItems: CartContextProduct[];
  favoriteItems: Product[];
  addToCart: (product: Product, beden?: string, renk?: string) => Promise<void>;
  removeFromCart: (productId: number, beden?: string, renk?: string) => Promise<void>;
  addToFavorites: (product: Product) => void;
  removeFromFavorites: (productId: number) => void;
  clearCart: () => Promise<void>;
  updateQuantity: (productId: number, beden: string | undefined, renk: string | undefined, newQuantity: number) => Promise<void>;
  isLoaded: boolean;
  language: string;
  setLanguage: (lang: string) => void;
  currency: string;
  setCurrency: (curr: string) => void;
  formatPrice: (price: number | string) => string;
  t: (key: string, params?: Record<string, string>) => string;
  settings: Settings;
  setSettings: React.Dispatch<React.SetStateAction<Settings>>;
}

const StoreContext = createContext<StoreContextType>({} as StoreContextType);

function StoreFacadeProvider({ children }: { children: ReactNode }) {
  const { cartItems, isCartLoaded, addToCart, removeFromCart, clearCart, updateQuantity } =
    useCart();
  const { favoriteItems, isFavoritesLoaded, addToFavorites, removeFromFavorites } = useFavorites();
  const { currency, setCurrency, formatPrice, isCurrencyLoaded } = useCurrency();
  const { language, setLanguage, t, isI18nLoaded } = useI18n();

  const [settings, setSettings] = useState<Settings>({
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

export function StoreProvider({ children }: { children: ReactNode }) {
  const [settingsForI18n, setSettingsForI18n] = useState<Settings | null>(null);

  // We need to fetch settings at this level too if we want to pass them directly to I18nProvider,
  // or we can let StoreFacadeProvider handle settings and we just pass a simple context.
  // Actually, I18nProvider takes settings as a prop for the t() function.
  useEffect(() => {
    fetch("/api/settings")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setSettingsForI18n(data))
      .catch(() => {});
  }, []);

  return (
    <CartProvider>
      <FavoritesProvider>
        <CurrencyProvider>
          <I18nProvider settings={settingsForI18n}>
            <StoreFacadeProvider>{children}</StoreFacadeProvider>
          </I18nProvider>
        </CurrencyProvider>
      </FavoritesProvider>
    </CartProvider>
  );
}

export function useStore() {
  return useContext(StoreContext);
}
