"use client";
import { useState, useEffect, useCallback, useRef, useTransition } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { ProductSkeleton } from "../../components/ui/ProductSkeleton";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import FavoriteButton from "../../components/FavoriteButton";
import InstantFilter from "../../components/InstantFilter";
import { useStore } from "../../context/StoreContext";
import { getValidImageUrl } from "../../utils/imageHelper";
import AOS from "aos";
import "aos/dist/aos.css";

import { Swiper, SwiperSlide } from "swiper/react";
import { EffectFade, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/pagination";

const QuickViewModal = dynamic(() => import("../../components/QuickViewModal"), { ssr: false });

export default function SearchClient({
  initialResults,
  query,
  isSearch,
  isCategoryView,
}: {
  initialResults: any[];
  query: string;
  isSearch: boolean;
  isCategoryView?: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { formatPrice, t } = useStore();
  const [results, setResults] = useState(initialResults);
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  const [localQuery, setLocalQuery] = useState(query);
  const PAGE_SIZE = 12;
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [isPending, startTransition] = useTransition();
  const loaderRef = useRef(null);

  const colors = ["Siyah", "Beyaz", "Kırmızı", "Lacivert", "Bej", "Pembe", "Yeşil", "Mavi"];
  const sizes = ["XS", "S", "M", "L", "XL", "XXL", "3XL", "4XL"];
  const categories = [
    ...new Set(initialResults.map((p) => p.kategori).filter(Boolean)),
  ] as string[];

  const handleFilterChange = (filters: any) => {
    let filtered = initialResults;
    if (filters.category) {
      filtered = filtered.filter((p) => p.kategori === filters.category);
    }
    if (filters.minPrice || filters.maxPrice < 10000) {
      filtered = filtered.filter((p) => p.fiyat >= filters.minPrice && p.fiyat <= filters.maxPrice);
    }
    if (filters.color) {
      filtered = filtered.filter(
        (p) => p.renk && p.renk.toLowerCase().includes(filters.color.toLowerCase())
      );
    }
    if (filters.size) {
      filtered = filtered.filter(
        (p) => p.beden && p.beden.toUpperCase().includes(filters.size.toUpperCase())
      );
    }
    if (filters.inStock) {
      filtered = filtered.filter((p) => p.stok > 0);
    }

    if (localQuery.trim().length > 0) {
      const q = localQuery.toLowerCase();
      filtered = filtered.filter((p) => {
        const adTurkish = p.ad ? p.ad.toLowerCase() : "";
        const kategoriTurkish = p.kategori ? p.kategori.toLowerCase() : "";
        const adTranslated = t(p.ad) ? t(p.ad).toLowerCase() : "";
        return adTurkish.includes(q) || kategoriTurkish.includes(q) || adTranslated.includes(q);
      });
    }

    setResults(filtered);
    setVisibleCount(PAGE_SIZE);
  };

  useEffect(() => {
    AOS.init({ duration: 800, once: true });
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && visibleCount < results.length && !isPending) {
          startTransition(() => setVisibleCount((prev) => prev + PAGE_SIZE));
        }
      },
      { rootMargin: "200px" }
    );
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [visibleCount, results.length, isPending]);

  return (
    <div className="container mx-auto px-4 relative z-10">
      {/* Hero Header */}
      <div
        className="relative p-10 md:p-14 pb-12 rounded-[2.5rem] mb-12 text-center overflow-hidden group"
        style={{
          background: "linear-gradient(145deg, hsla(var(--primary), 0.12), hsla(var(--purple), 0.18), hsla(var(--primary), 0.08))",
          border: "1px solid hsla(var(--primary), 0.25)",
          boxShadow: "0 8px 40px -12px hsla(var(--primary), 0.15), inset 0 1px 0 hsla(var(--primary), 0.1)",
        }}
        data-aos="fade-down"
      >
        {/* Decorative orbs */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-primary/20 via-purple/15 to-primary/10 rounded-full blur-[100px] pointer-events-none group-hover:scale-150 transition-transform duration-1000" />
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-gradient-to-br from-purple/20 to-transparent rounded-full blur-[60px] pointer-events-none" />

        <h1
          className="text-4xl md:text-6xl font-black mb-4 tracking-widest relative z-10"
          style={{
            background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--purple)), hsl(var(--primary)))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          {isSearch
            ? `${t("search_results").toLocaleUpperCase("tr-TR")}: "${query}"`
            : isCategoryView
              ? query.toLocaleUpperCase("tr-TR")
              : t("collection").toLocaleUpperCase("tr-TR")}
        </h1>
        {(isSearch || isCategoryView) && (
          <p className="text-foreground/60 font-medium text-lg relative z-10">
            {t("total_products_listed", { count: String(results.length) })}
          </p>
        )}

        {/* Decorative line */}
        <div className="mt-6 mx-auto w-32 h-[2px] bg-gradient-to-r from-transparent via-primary/60 to-transparent rounded-full" />
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        {/* Filter Sidebar */}
        <div className="w-full lg:w-1/4">
          <div className="sticky top-32">
            <InstantFilter
              categories={categories}
              colors={colors}
              sizes={sizes}
              onFilterChange={handleFilterChange}
              hideCategories={isCategoryView}
            />
          </div>
        </div>

        {/* Product Grid */}
        <div className="w-full lg:w-3/4 min-h-screen">
          {results.length === 0 ? (
            <div
              className="relative p-16 rounded-[3rem] flex flex-col items-center justify-center text-center overflow-hidden group"
              style={{
                background: "linear-gradient(145deg, hsla(var(--primary), 0.08), hsla(var(--purple), 0.12))",
                border: "1px solid hsla(var(--primary), 0.2)",
                boxShadow: "0 8px 40px -12px hsla(var(--primary), 0.1)",
              }}
              data-aos="zoom-in"
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-tr from-primary/20 to-purple/20 rounded-full blur-[80px] pointer-events-none group-hover:scale-150 transition-transform duration-1000" />
              <div
                className="w-32 h-32 mb-8 rounded-full flex items-center justify-center shadow-inner relative z-10"
                style={{
                  background: "linear-gradient(135deg, hsla(var(--primary), 0.15), hsla(var(--purple), 0.15))",
                }}
              >
                <svg
                  className="w-16 h-16 text-primary opacity-80"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <h2 className="text-4xl font-black text-foreground mb-4 relative z-10">
                {t("no_products_found")}
              </h2>
              <p className="text-foreground/50 relative z-10 text-xl font-medium max-w-md">
                {t("no_products_found_desc")}
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                {results.slice(0, visibleCount).map((product, index) => {
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
                      data-aos-delay={(index % 3) * 100}
                    >
                      {/* Gradient frame border */}
                      <div
                        className="absolute -inset-[2px] rounded-[1.7rem] opacity-50 group-hover/card:opacity-100 transition-opacity duration-500 pointer-events-none"
                        style={{
                          background: "linear-gradient(135deg, hsla(var(--primary), 0.5), hsla(var(--purple), 0.4), hsla(var(--secondary), 0.3))",
                        }}
                      />

                      {/* Card Content */}
                      <div
                        className="relative p-4 group rounded-[1.5rem] flex flex-col h-full transition-all duration-500"
                        style={{
                          background: "linear-gradient(145deg, hsla(var(--primary), 0.1), hsla(var(--purple), 0.15), hsla(var(--primary), 0.06))",
                          backdropFilter: "blur(16px) saturate(150%)",
                          border: "1px solid hsla(var(--primary), 0.25)",
                          boxShadow: "0 8px 32px -8px hsla(var(--primary), 0.12), inset 0 1px 0 hsla(var(--primary), 0.1)",
                        }}
                      >
                        {/* Image Container */}
                        <div className="relative aspect-[3/4] mb-4 overflow-hidden rounded-2xl">
                          {product.etiket && (
                            <div className="absolute top-3 left-3 z-20">
                              <span
                                className="text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full shadow-lg text-white"
                                style={{
                                  background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--secondary)))",
                                }}
                              >
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

                          {/* Hover overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end justify-center pb-6 pointer-events-none z-10" />

                          {/* Quick View Button */}
                          <div className="absolute bottom-0 left-0 w-full px-6 flex justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-8 group-hover:translate-y-0 z-30 pb-6">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                setQuickViewProduct(product);
                              }}
                              className="relative overflow-hidden text-xs uppercase tracking-[0.2em] font-black text-white px-8 py-3.5 rounded-full backdrop-blur-xl shadow-xl w-full active:scale-95 transform hover:-translate-y-1 transition-all duration-300"
                              style={{
                                background: "linear-gradient(135deg, hsla(var(--primary), 0.9), hsla(var(--secondary), 0.9))",
                                boxShadow: "0 4px 20px hsla(var(--primary), 0.4)",
                              }}
                            >
                              <span className="relative z-10">{t("quick_view")}</span>
                              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                            </button>
                          </div>

                          {/* Link overlay */}
                          <Link
                            href={`/urundetay/${product.id}`}
                            className="absolute inset-0 z-20"
                          />
                        </div>

                        {/* Product Info */}
                        <div className="p-2 flex-1 flex flex-col relative z-20">
                          <p
                            className="text-[10px] font-black uppercase tracking-[0.2em] mb-2 transition-colors"
                            style={{
                              color: "hsla(var(--purple), 0.7)",
                            }}
                          >
                            {t(product.kategori)}
                          </p>

                          <Link href={`/urundetay/${product.id}`} className="block mb-3">
                            <h3
                              className="font-black text-lg mb-2 line-clamp-2 leading-tight transition-all duration-300"
                              style={{
                                background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--purple)))",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                                backgroundClip: "text",
                              }}
                            >
                              {t(product.ad)}
                            </h3>
                          </Link>

                          <div className="mt-auto pt-4 flex items-center justify-between" style={{ borderTop: "1px solid hsla(var(--primary), 0.1)" }}>
                            <span className="text-white font-black text-2xl tracking-tight">
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

              {visibleCount < results.length && (
                <div ref={loaderRef} className="w-full py-16 flex justify-center">
                  <div className="relative w-16 h-16 flex items-center justify-center">
                    <div className="absolute inset-0 border-4 border-primary/20 rounded-full" />
                    <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    <div
                      className="w-4 h-4 rounded-full animate-pulse"
                      style={{
                        background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--purple)))",
                      }}
                    />
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {quickViewProduct && (
        <QuickViewModal product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />
      )}
    </div>
  );
}
