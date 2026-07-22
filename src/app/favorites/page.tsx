"use client";
import Link from "next/link";
import Image from "next/image";
import { useStore } from "../../context/StoreContext";
import dynamic from "next/dynamic";
import { useState, useEffect, useRef } from "react";
import { getValidImageUrl } from "../../utils/imageHelper";
import AOS from "aos";
import "aos/dist/aos.css";
import FavoriteButton from "../../components/FavoriteButton";

import { Swiper, SwiperSlide } from "swiper/react";
import { EffectFade, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/pagination";

const QuickViewModal = dynamic(() => import("../../components/QuickViewModal"), { ssr: false });

export default function FavoritesPage() {
  const { favoriteItems, removeFromFavorites, isLoaded, t, formatPrice } = useStore();
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const quickViewClicked = useRef(false);

  useEffect(() => {
    AOS.init({ duration: 800, once: true });
  }, []);

  if (!isLoaded) return null;

  return (
    <div className="min-h-screen pt-32 pb-24 bg-gray-50 dark:bg-transparent relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary via-white to-gray-50 dark:from-pink-950/20 dark:via-zinc-900/50 dark:to-black/30 -z-10"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <h1
          className="text-4xl md:text-6xl font-black mb-16 tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple to-primary uppercase text-center relative z-10"
          data-aos="fade-down"
        >
          {t("favorites")}
        </h1>

        {favoriteItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20" data-aos="zoom-in">
            <div className="w-40 h-40 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md rounded-full shadow-2xl flex items-center justify-center mb-8 border border-white/20 dark:border-white/10 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-purple/20 animate-pulse"></div>
              <svg
                className="w-16 h-16 text-primary relative z-10 group-hover:scale-125 transition-transform duration-500"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"></path>
              </svg>
            </div>
            <h2 className="text-3xl font-black text-foreground mb-4 tracking-wide">
              {t("no_favorites")}
            </h2>
            <p className="text-foreground/60 mb-10 text-center max-w-md text-lg">
              {t("no_favorites_desc")}
            </p>
            <Link
              href="/search"
              className="bg-gradient-to-r from-primary to-purple text-foreground px-12 py-5 rounded-full uppercase tracking-[0.2em] text-sm font-black shadow-xl shadow-primary/30 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-primary/50 active:scale-95"
            >
              {t("explore_collection_btn")}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {favoriteItems.map((product: any, index: number) => {
              const images = product.resim
                ? product.resim.split(",")
                : product.gorsel
                  ? product.gorsel.split(",")
                  : [];
              return (
                <div
                  key={product.id}
                  className="relative group/card"
                  data-aos="fade-up"
                  data-aos-delay={(index % 4) * 100}
                >
                  {/* Gradient frame border */}
                  <div className="absolute -inset-[2px] bg-gradient-to-br from-primary/60 via-purple/50 to-secondary/50 rounded-[2.1rem] opacity-60 group-hover/card:opacity-100 transition-opacity duration-500 pointer-events-none" />
                  <div className="bg-white/60 dark:bg-zinc-900/40 backdrop-blur-xl p-4 rounded-[2rem] group hover:shadow-2xl hover:shadow-primary/20 transition-all duration-500 relative transform hover:-translate-y-2 flex flex-col border border-white/50 dark:border-white/10">
                  <div className="relative aspect-[3/4] mb-4 overflow-hidden rounded-2xl transform-gpu">
                    {product.etiket && (
                      <div className="absolute top-3 left-3 z-20">
                        <span className="text-[10px] font-black uppercase tracking-widest bg-gradient-to-r from-primary to-purple text-foreground px-4 py-1.5 rounded-full shadow-lg">
                          {t(product.etiket)}
                        </span>
                      </div>
                    )}

                    {images.length > 1 ? (
                      <Swiper
                        modules={[EffectFade, Pagination, Autoplay]}
                        effect="fade"
                        pagination={{ clickable: true, dynamicBullets: true }}
                        autoplay={{
                          delay: 3000,
                          disableOnInteraction: false,
                          pauseOnMouseEnter: true,
                        }}
                        className="w-full h-full group-hover:scale-105 transition-transform duration-1000"
                      >
                        {images.map((img: string, i: number) => (
                          <SwiperSlide key={i}>
                            <Image
                              src={getValidImageUrl(img)}
                              alt={`${t(product.ad)} - Image ${i + 1}`}
                              fill
                              className="object-cover"
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            />
                          </SwiperSlide>
                        ))}
                      </Swiper>
                    ) : (
                      <Image
                        src={getValidImageUrl(images[0])}
                        alt={t(product.ad)}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-1000 ease-out"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center pointer-events-none z-10"></div>
                    <Link
                      href={`/urundetay/${product.id}`}
                      className="absolute inset-0 z-20"
                      onClick={(e) => {
                        if (quickViewClicked.current) {
                          e.preventDefault();
                          quickViewClicked.current = false;
                        }
                      }}
                    />

                    <div className="absolute bottom-6 left-0 w-full px-6 flex justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-8 group-hover:translate-y-0 z-30">
                      <button
                        onPointerDown={(e) => { e.stopPropagation(); quickViewClicked.current = true; }}
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          quickViewClicked.current = true;
                          setQuickViewProduct(product);
                        }}
                        className="text-xs uppercase tracking-[0.2em] font-black text-foreground hover:text-foreground hover:bg-primary transition-all duration-300 glass-panel px-8 py-3.5 rounded-full backdrop-blur-xl shadow-xl w-full active:scale-95 transform hover:-translate-y-1"
                      >
                        {t("quick_view")}
                      </button>
                    </div>
                  </div>

                  <div className="p-2 flex-1 flex flex-col relative z-20">
                    <p className="text-foreground/60 text-[10px] font-black uppercase tracking-[0.2em] mb-2 group-hover:text-primary transition-colors">
                      {t(product.kategori)}
                    </p>
                    <Link href={`/urundetay/${product.id}`} className="block">
                      <h3 className="text-foreground font-black text-lg mb-2 line-clamp-2 leading-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-primary group-hover:to-purple transition-all duration-300">
                        {t(product.ad)}
                      </h3>
                    </Link>
                    <div className="mt-auto pt-4 flex items-center justify-between border-t border-gray-100 dark:border-white/5">
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 font-black text-2xl tracking-tight">
                        {formatPrice(product.fiyat)}
                      </span>
                      <FavoriteButton
                        product={product}
                        className="relative z-30 transform hover:scale-125 active:scale-90 transition-transform duration-300"
                      />
                    </div>
                  </div>
                </div>
              </div>
              );
            })}
          </div>
        )}
      </div>

      {quickViewProduct && (
        <QuickViewModal product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />
      )}
    </div>
  );
}
