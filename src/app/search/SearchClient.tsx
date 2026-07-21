"use client";
import { useState, useEffect, useCallback, useRef, useTransition } from "react";
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
}: {
  initialResults: any[];
  query: string;
  isSearch: boolean;
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
      <div
        className="product-card-bg p-10 rounded-[2.5rem] shadow-2xl mb-12 text-center relative overflow-hidden group"
        data-aos="fade-down"
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-primary/20 via-purple/15 to-primary/10 rounded-full blur-[100px] pointer-events-none group-hover:scale-150 transition-transform duration-1000"></div>
        <h1 className="text-4xl md:text-6xl font-black mb-4 uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple to-primary relative z-10">
          {isSearch ? `${t("search_results")}: "${query}"` : t("collection")}
        </h1>
        {isSearch && (
          <p className="text-foreground/70 font-medium text-lg relative z-10">
            {t("total_products_listed", { count: String(results.length) })}
          </p>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        <div className="w-full lg:w-1/4">
          <div className="sticky top-32">
            <InstantFilter
              categories={categories}
              colors={colors}
              sizes={sizes}
              onFilterChange={handleFilterChange}
            />
          </div>
        </div>

        <div className="w-full lg:w-3/4 min-h-screen">
          {results.length === 0 ? (
            <div
              className="product-card-bg p-16 rounded-[3rem] flex flex-col items-center justify-center text-center shadow-2xl relative overflow-hidden group"
              data-aos="zoom-in"
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-tr from-primary/20 to-purple/20 rounded-full blur-[80px] pointer-events-none group-hover:scale-150 transition-transform duration-1000"></div>
              <div className="w-32 h-32 mb-8 bg-primary/10 rounded-full flex items-center justify-center shadow-inner relative z-10">
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
                  ></path>
                </svg>
              </div>
              <h2 className="text-4xl font-black text-foreground mb-4 relative z-10">
                {t("no_products_found")}
              </h2>
              <p className="text-foreground/60 relative z-10 text-xl font-medium max-w-md">
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
                      className="product-card-bg-search p-4 group relative transform flex flex-col"
                      data-aos="fade-up"
                      data-aos-delay={(index % 3) * 100}
                    >
                      <div className="relative aspect-[3/4] mb-4 overflow-hidden rounded-2xl transform-gpu">
                        {product.etiket && (
                          <div className="absolute top-3 left-3 z-20">
                            <span className="text-[10px] font-black uppercase tracking-widest bg-gradient-to-r from-neon-pink to-holo-gold text-foreground px-4 py-1.5 rounded-full shadow-lg">
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
                        ></Link>

                        <div className="absolute bottom-6 left-0 w-full px-6 flex justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-8 group-hover:translate-y-0 z-30">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              setQuickViewProduct(product);
                            }}
                            className="text-xs uppercase tracking-[0.2em] font-black text-foreground hover:text-white hover:bg-primary transition-all duration-300 glass-panel px-8 py-3.5 rounded-full backdrop-blur-xl shadow-xl w-full active:scale-95 transform hover:-translate-y-1"
                          >
                            {t("quick_view")}
                          </button>
                        </div>
                      </div>

                      <div className="p-2 flex-1 flex flex-col relative z-20">
                        <p className="text-purple/80 text-[10px] font-black uppercase tracking-[0.2em] mb-2 group-hover:text-primary transition-colors">
                          {t(product.kategori)}
                        </p>
                        <Link href={`/urundetay/${product.id}`} className="block">
                          <h3 className="text-foreground font-black text-lg mb-2 line-clamp-2 leading-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-primary group-hover:via-purple group-hover:to-secondary transition-all duration-300">
                            {t(product.ad)}
                          </h3>
                        </Link>
                        <div className="mt-auto pt-4 flex items-center justify-between border-t border-gray-100 dark:border-white/5">
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
                  );
                })}
              </div>

              {visibleCount < results.length && (
                <div ref={loaderRef} className="w-full py-16 flex justify-center">
                  <div className="relative w-16 h-16 flex items-center justify-center">
                    <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <div className="w-4 h-4 bg-purple rounded-full animate-pulse"></div>
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
