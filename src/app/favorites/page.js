"use client";
import Link from "next/link";
import Image from "next/image";
import { useStore } from "../../context/StoreContext";
import dynamic from "next/dynamic";
const QuickViewModal = dynamic(() => import("../../components/QuickViewModal"), { ssr: false });
import { useState } from "react";
import { getValidImageUrl } from "../../utils/imageHelper";

export default function FavoritesPage() {
  const { favoriteItems, removeFromFavorites, isLoaded, t, formatPrice } = useStore();
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  if (!isLoaded) return null; // Wait for localStorage

  return (
    <div className="min-h-screen pt-32 pb-24 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-holo-gold opacity-[0.03] rounded-full blur-[120px] pointer-events-none"></div>

      <div className="container mx-auto px-4 relative z-10">
        <h1 className="text-3xl md:text-5xl font-black mb-12 text-glow-gold uppercase tracking-widest text-center">
          {t("favorites")}
        </h1>

        {favoriteItems.length === 0 ? (
          <div className="glass-panel p-12 clip-angled mb-8 flex flex-col items-center justify-center max-w-2xl mx-auto text-center">
            <div className="w-20 h-20 rounded-full border border-gray-700 flex items-center justify-center text-gray-500 mb-6">
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t("no_favorites")}</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">{t("no_favorites_desc")}</p>
            <Link
              href="/search"
              className="inline-block bg-transparent border border-holo-gold text-holo-gold hover:bg-holo-gold hover:text-black py-3 px-8 uppercase font-bold tracking-widest transition-all duration-300 clip-angled text-sm"
            >
              {t("explore_collection_btn")}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {favoriteItems.map((product, index) => (
              <div
                key={product.id}
                className="glass-card group relative"
                data-aos="fade-up"
                data-aos-delay={(index % 4) * 100}
              >
                <Link
                  href={`/urundetay/${product.id}`}
                  className="block relative h-96 w-full clip-angled overflow-hidden m-2 rounded-t-lg group-hover:drop-shadow-[0_0_20px_rgba(255,0,127,0.3)] transition-all duration-300 transform-gpu z-20"
                >
                  <Image
                    src={getValidImageUrl(product.gorsel)}
                    alt={t(product.ad)}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  {/* Quick View Button - appears on hover */}
                  <div className="absolute bottom-4 left-0 w-full px-4 flex justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0 z-30">
                    <button
                      onClick={(e) => {
                        e.preventDefault(); // Prevent navigating
                        setQuickViewProduct(product);
                      }}
                      className="text-xs uppercase tracking-widest font-bold text-white hover:text-neon-pink transition-colors mt-1 bg-black/60 px-6 py-3 rounded-full backdrop-blur-md touch-manipulation shadow-lg border border-white/10"
                    >
                      {t("quick_view")}
                    </button>
                  </div>
                </Link>

                <div className="p-6">
                  <h3 className="text-gray-900 dark:text-gray-300 font-medium text-lg mb-2 truncate group-hover:text-neon-pink transition-colors">
                    {t(product.ad)}
                  </h3>
                  <div className="flex justify-between items-center">
                    <span className="text-glow-gold font-bold text-xl">
                      {formatPrice(product.fiyat)}
                    </span>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        removeFromFavorites(product.id);
                      }}
                      className="relative z-30 text-neon-pink hover:text-gray-400 transition-colors w-12 h-12 flex items-center justify-center touch-manipulation"
                      title={t("favorite_remove_title") || "Favorilerden Çıkar"}
                      aria-label={t("favorite_remove_title") || "Favorilerden Çıkar"}
                    >
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                      </svg>
                    </button>
                  </div>
                </div>
                {/* Invisible link overlay for the whole card */}
                <Link href={`/urundetay/${product.id}`} className="absolute inset-0 z-10"></Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {quickViewProduct && (
        <QuickViewModal product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />
      )}
    </div>
  );
}
