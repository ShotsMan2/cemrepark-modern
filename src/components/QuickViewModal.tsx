"use client";
import Image from "next/image";
import Link from "next/link";
import { useStore } from "../context/StoreContext";
import Swal from "sweetalert2";
import { getValidImageUrl } from "../utils/imageHelper";
import React, { useEffect, useState, useCallback } from "react";
import { Product } from "@prisma/client";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectFade, Pagination, Thumbs } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/pagination";
import "swiper/css/thumbs";

interface QuickViewModalProps {
  product: Product;
  onClose: () => void;
}

export default function QuickViewModal({ product, onClose }: QuickViewModalProps) {
  const { formatPrice, t, favoriteItems, addToFavorites, removeFromFavorites, isLoaded } =
    useStore();
  const [isAnimating, setIsAnimating] = useState(false);
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperType | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const images = product.resim
    ? product.resim.split(",").filter(Boolean)
    : product.gorsel
      ? product.gorsel.split(",").filter(Boolean)
      : [];

  if (!product) return null;

  const isFavorite = isLoaded && favoriteItems.some((item) => item.id === product.id);

  const toggleFavorite = () => {
    if (!isLoaded) return;

    if (isFavorite) {
      removeFromFavorites(product.id);
      Swal.fire({
        toast: true,
        position: "bottom-end",
        showConfirmButton: false,
        timer: 2000,
        icon: "info",
        title: "Favorilerden Çıkarıldı!",
        background: "rgba(10, 10, 10, 0.9)",
        color: "#fff",
        iconColor: "#a0a0a0",
      });
    } else {
      addToFavorites(product);
      Swal.fire({
        toast: true,
        position: "bottom-end",
        showConfirmButton: false,
        timer: 2000,
        icon: "success",
        title: "Favorilere Eklendi!",
        background: "rgba(10, 10, 10, 0.9)",
        color: "#fff",
        iconColor: "#ff007f",
      });
    }
  };

  const handleClose = () => {
    setIsAnimating(true);
    setTimeout(onClose, 300);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 lg:p-8">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/80 backdrop-blur-2xl transition-opacity duration-500 ${
          isAnimating ? "opacity-0" : "opacity-100"
        }`}
        onClick={handleClose}
      />

      {/* Modal Container */}
      <div
        className={`relative z-10 w-full max-w-6xl max-h-[92vh] overflow-hidden rounded-[2rem] border border-white/10 shadow-2xl transition-all duration-500 ${
          isAnimating
            ? "opacity-0 scale-95 translate-y-8"
            : "opacity-100 scale-100 translate-y-0"
        }`}
        style={{
          background: "linear-gradient(145deg, rgba(15, 18, 28, 0.98), rgba(10, 12, 20, 0.99))",
        }}
      >
        {/* Decorative Gradient Orbs */}
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-gradient-to-br from-primary/25 to-purple/15 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-gradient-to-tl from-secondary/25 to-primary/15 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-primary/10 via-purple/10 to-secondary/10 rounded-full blur-[120px] pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={handleClose}
          aria-label="Kapat"
          className="absolute top-4 right-4 md:top-6 md:right-6 z-30 w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/15 hover:border-white/25 transition-all duration-300 backdrop-blur-xl group"
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-transform duration-300 group-hover:rotate-90"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        {/* Content */}
        <div className="flex flex-col lg:flex-row min-h-[500px] lg:min-h-[550px]">
          {/* Image Section */}
          <div className="relative w-full lg:w-[55%] h-[350px] lg:h-auto overflow-hidden">
            {/* Main Image Carousel */}
            {images.length > 1 ? (
              <>
                <Swiper
                  effect="fade"
                  modules={[EffectFade, Pagination, Thumbs]}
                  thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
                  pagination={{ clickable: true, dynamicBullets: true }}
                  onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
                  className="w-full h-full"
                >
                  {images.map((img: string, i: number) => (
                    <SwiperSlide key={i}>
                      <div className="relative w-full h-[350px] lg:h-[550px]">
                        <Image
                          src={getValidImageUrl(img)}
                          alt={`${t(product.ad)} - ${i + 1}`}
                          fill
                          className="object-cover"
                          sizes="(max-width: 1024px) 100vw, 55vw"
                          priority={i === 0}
                        />
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>

                {/* Thumbnail Navigation */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 hidden md:block">
                  <Swiper
                    onSwiper={setThumbsSwiper}
                    spaceBetween={8}
                    slidesPerView="auto"
                    watchSlidesProgress
                    className="thumb-carousel"
                  >
                    {images.map((img: string, i: number) => (
                      <SwiperSlide key={i} className="!w-auto">
                        <button
                          className={`relative w-14 h-14 rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                            activeIndex === i
                              ? "border-primary shadow-lg shadow-primary/30 scale-110"
                              : "border-white/20 opacity-60 hover:opacity-100 hover:border-white/40"
                          }`}
                        >
                          <Image
                            src={getValidImageUrl(img)}
                            alt={`${t(product.ad)} - Thumbnail ${i + 1}`}
                            fill
                            className="object-cover"
                            sizes="56px"
                          />
                        </button>
                      </SwiperSlide>
                    ))}
                  </Swiper>
                </div>
              </>
            ) : (
              <div className="relative w-full h-[350px] lg:h-[550px]">
                <Image
                  src={getValidImageUrl(images[0] || "")}
                  alt={t(product.ad)}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 55vw"
                  priority
                />
              </div>
            )}

            {/* Image Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#0f121c]/95 z-10 hidden lg:block pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0f121c]/95 via-transparent to-transparent z-10 lg:hidden pointer-events-none" />

            {/* Floating Badge */}
            {product.etiket && (
              <div className="absolute top-4 left-4 md:top-6 md:left-6 z-20">
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary to-secondary text-white text-xs font-bold uppercase tracking-wider shadow-xl shadow-primary/30">
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  {t(product.etiket)}
                </span>
              </div>
            )}

            {/* Image Counter */}
            {images.length > 1 && (
              <div className="absolute top-4 right-4 md:top-6 md:right-16 z-20">
                <span className="px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-xl text-white/80 text-xs font-medium border border-white/10">
                  {activeIndex + 1} / {images.length}
                </span>
              </div>
            )}
          </div>

          {/* Details Section */}
          <div className="w-full lg:w-[45%] p-6 md:p-8 lg:p-10 flex flex-col justify-between relative z-20">
            <div>
              {/* Category */}
              <div className="flex items-center gap-3 mb-4">
                <div className="h-px flex-1 bg-gradient-to-r from-primary/40 to-transparent" />
                <span className="text-primary text-xs font-bold tracking-[0.3em] uppercase">
                  {((t(product.kategori) as string) || (t("collection") as string)).toLocaleUpperCase("tr-TR")}
                </span>
                <div className="h-px flex-1 bg-gradient-to-l from-primary/40 to-transparent" />
              </div>

              {/* Product Name */}
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/60 uppercase tracking-wider mb-4 leading-tight">
                {t(product.ad)}
              </h2>

              {/* Price */}
              <div className="mb-6">
                <div className="inline-flex items-baseline gap-2">
                  <span className="text-3xl md:text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-primary">
                    {formatPrice(product.fiyat)}
                  </span>
                  <span className="text-white/30 text-xs font-medium uppercase tracking-wider">KDV Dahil</span>
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-6" />

              {/* Description */}
              <p className="text-white/50 text-sm leading-relaxed mb-8 max-w-md">
                {t("quick_view_desc") as string}
              </p>

              {/* Quick Info */}
              <div className="grid grid-cols-3 gap-3 mb-8">
                <div className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white/5 border border-white/5">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-white/60 text-[10px] font-medium uppercase tracking-wider text-center">Stokta</span>
                </div>
                <div className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white/5 border border-white/5">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-white/60 text-[10px] font-medium uppercase tracking-wider text-center">1-3 Gün</span>
                </div>
                <div className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white/5 border border-white/5">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  <span className="text-white/60 text-[10px] font-medium uppercase tracking-wider text-center">Ücretsiz Kargo</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3">
              <Link
                href={`/urundetay/${product.id}`}
                className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-primary to-secondary px-8 py-4 text-center text-sm font-bold uppercase tracking-widest text-white shadow-xl shadow-primary/25 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/40 hover:-translate-y-0.5"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {t("details") as string}
                  <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-secondary to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Link>

              <button
                onClick={toggleFavorite}
                className={`group relative overflow-hidden rounded-xl px-8 py-4 flex items-center justify-center gap-2.5 text-sm font-bold uppercase tracking-widest transition-all duration-300 ${
                  isFavorite
                    ? "bg-gradient-to-r from-primary/20 to-secondary/20 border border-primary/40 text-white hover:from-primary/30 hover:to-secondary/30"
                    : "bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white hover:border-white/20"
                }`}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill={isFavorite ? "currentColor" : "none"}
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`transition-all duration-300 ${isFavorite ? "scale-110 text-primary" : "group-hover:scale-110"}`}
                >
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
                <span>
                  {isFavorite
                    ? (t("remove_from_favorites") as string)
                    : (t("add_to_favorites") as string)}
                </span>
                {isFavorite && (
                  <span className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent animate-pulse" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
