"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import FavoriteButton from "../components/FavoriteButton";
const QuickViewModal = dynamic(() => import("../components/QuickViewModal"), { ssr: false });
import SearchTrigger from "../components/SearchTrigger";
import PriceDisplay from "../components/PriceDisplay";
import { useStore } from "../context/StoreContext";
import { getValidImageUrl } from "../utils/imageHelper";
import { ProductCard } from "../components/ui/ProductCard";

export default function HomeClient({ bestSellers, discounted, banners = [] }) {
  const { t } = useStore();
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  const activeBanners = banners.filter((b) => b.isActive);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (activeBanners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % activeBanners.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [activeBanners.length]);

  const renderHeroSection = () => {
    if (activeBanners.length > 0) {
      return (
        <section className="relative min-h-screen flex items-center justify-center pt-24 pb-12 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary opacity-20 rounded-full blur-[100px] mix-blend-screen pointer-events-none"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary opacity-10 rounded-full blur-[100px] mix-blend-screen pointer-events-none"></div>

          <div className="w-full max-w-6xl mx-auto px-4 z-10 relative h-[600px] md:h-[500px]">
            {activeBanners.map((slide, index) => {
              const isActive = index === currentSlide;
              return (
                <div
                  key={slide.id}
                  className={`absolute inset-0 transition-all duration-1000 flex flex-col md:flex-row items-center gap-12 ${
                    isActive
                      ? "opacity-100 translate-x-0 z-10 visible"
                      : "opacity-0 translate-x-8 z-0 pointer-events-none invisible"
                  }`}
                >
                  <div className="w-full md:w-1/2 text-left">
                    <h2 className="text-secondary tracking-[0.3em] text-sm uppercase mb-4 font-bold">
                      {t("new_season")}
                    </h2>
                    <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight text-glow-pink">
                      <span>{slide.title}</span>
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 text-lg md:text-xl mb-10 max-w-lg font-light leading-relaxed">
                      {t("hero_desc")}
                    </p>

                    <div className="flex gap-6">
                      <Link
                        href={slide.linkUrl || "/search"}
                        className="glass-panel px-8 py-4 text-gray-900 dark:text-white font-medium uppercase tracking-wider hover:bg-primary hover:border-primary transition-all duration-300 clip-angled text-center inline-block"
                      >
                        {t("explore_collection")}
                      </Link>
                      <SearchTrigger />
                    </div>
                  </div>

                  <div className="w-full md:w-1/2 relative h-full flex justify-center float-fx">
                    <div className="absolute top-10 right-10 w-24 h-24 border border-primary opacity-50 clip-hexa float-fx-delay"></div>
                    <div className="absolute bottom-20 left-10 w-16 h-16 border border-secondary opacity-30 clip-angled float-fx"></div>

                    <div className="relative w-4/5 h-full clip-angled glass-panel p-2">
                      <div className="relative w-full h-full clip-angled overflow-hidden group skeleton">
                        <Image
                          src={getValidImageUrl(slide.imageUrl)}
                          alt={slide.title}
                          fill
                          className="object-cover scale-105 group-hover:scale-110 transition-transform duration-1000 ease-out"
                          priority
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {activeBanners.length > 1 && (
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-3 z-20">
              {activeBanners.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentSlide 
                      ? "bg-primary w-8" 
                      : "bg-black/25 dark:bg-white/25 hover:bg-primary/60 dark:hover:bg-primary/60"
                  }`}
                  aria-label={`Slayt ${index + 1}`}
                />
              ))}
            </div>
          )}
        </section>
      );
    }

    return (
      <section className="relative min-h-screen flex items-center justify-center pt-24 pb-12">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary opacity-20 rounded-full blur-[100px] mix-blend-screen pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary opacity-10 rounded-full blur-[100px] mix-blend-screen pointer-events-none"></div>

        <div className="w-full max-w-6xl mx-auto px-4 z-10 relative">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="w-full md:w-1/2" data-aos="fade-right">
              <h2 className="text-secondary tracking-[0.3em] text-sm uppercase mb-4 font-bold">
                {t("new_season")}
              </h2>
              <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight text-glow-pink">
                <span dangerouslySetInnerHTML={{ __html: t("hero_title") }}></span>
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-lg md:text-xl mb-10 max-w-lg font-light leading-relaxed">
                {t("hero_desc")}
              </p>

              <div className="flex gap-6">
                <Link
                  href="/search"
                  className="glass-panel px-8 py-4 text-gray-900 dark:text-white font-medium uppercase tracking-wider hover:bg-primary hover:border-primary transition-all duration-300 clip-angled text-center inline-block hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/30 active:scale-95"
                >
                  {t("explore_collection")}
                </Link>
                <SearchTrigger />
              </div>
            </div>

            <div
              className="w-full md:w-1/2 relative h-[600px] flex justify-center float-fx"
              data-aos="fade-left"
            >
              <div className="absolute top-10 right-10 w-24 h-24 border border-primary opacity-50 clip-hexa float-fx-delay"></div>
              <div className="absolute bottom-20 left-10 w-16 h-16 border border-secondary opacity-30 clip-angled float-fx"></div>

              <div className="relative w-4/5 h-full clip-angled glass-panel p-2">
                <div className="relative w-full h-full clip-angled overflow-hidden group skeleton">
                  <Image
                    src={getValidImageUrl(bestSellers[0]?.resim || bestSellers[0]?.gorsel?.split(',')[0])}
                    alt="Hero Image"
                    fill
                    className="object-cover scale-105 group-hover:scale-110 transition-transform duration-1000 ease-out"
                    priority
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  };

  return (
    <div className="overflow-hidden">
      {renderHeroSection()}

      {/* 1.5 TRUSTED BRANDS MARQUEE */}
      <section className="py-8 border-y border-white/5 bg-white/50 dark:bg-black/50 overflow-hidden">
        <div className="w-full whitespace-nowrap animate-marquee flex gap-16 md:gap-32 items-center opacity-40">
          <h4 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-[0.3em]">Shopier</h4>
          <h4 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-[0.3em]">
            Yurtiçi Kargo
          </h4>
          <h4 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-[0.3em]">Visa</h4>
          <h4 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-[0.3em]">Mastercard</h4>
          <h4 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-[0.3em]">Shopier</h4>
          <h4 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-[0.3em]">
            Yurtiçi Kargo
          </h4>
          <h4 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-[0.3em]">Visa</h4>
          <h4 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-[0.3em]">Mastercard</h4>
          <h4 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-[0.3em]">Shopier</h4>
          <h4 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-[0.3em]">
            Yurtiçi Kargo
          </h4>
          <h4 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-[0.3em]">Visa</h4>
          <h4 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-[0.3em]">Mastercard</h4>
        </div>
      </section>

      {/* 2. FLOATING CARDS (BEST SELLERS) */}
      <section id="collection" className="py-24 relative z-10">
        <div className="w-full max-w-6xl mx-auto px-4">
          <div
            className="flex flex-col md:flex-row justify-between items-end mb-16"
            data-aos="fade-up"
          >
            <div>
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-2">{t("trending")}</h2>
              <div className="w-24 h-1 bg-primary"></div>
            </div>
            <Link
              href="/search"
              className="text-gray-600 dark:text-gray-400 hover:text-secondary mt-4 md:mt-0 tracking-widest text-sm uppercase transition-colors hover:translate-x-2 inline-block transform"
            >
              {t("view_all")} ↗
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {bestSellers.map((product, index) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onQuickView={setQuickViewProduct} 
                delay={index * 150} 
              />
            ))}
          </div>
        </div>
      </section>

      {/* 3. BENTO BOX SHOWCASE */}
      <section className="py-24 bg-white/50 dark:bg-black/50 border-y border-white/5">
        <div className="w-full max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-auto md:h-[600px]">
            {/* Big Feature */}
            <div
              className="md:col-span-2 glass-panel relative group overflow-hidden clip-angled skeleton"
              data-aos="fade-right"
            >
              <Image
                src={getValidImageUrl(discounted[0]?.resim || discounted[0]?.gorsel?.split(',')[0])}
                alt="Giyim"
                fill
                className="object-cover opacity-60 group-hover:opacity-90 group-hover:scale-105 transition-all duration-700 ease-out"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-10 flex flex-col justify-end transform transition-transform duration-500">
                <span className="text-primary uppercase tracking-[0.2em] text-sm font-bold mb-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 opacity-0 group-hover:opacity-100">
                  {t("special_design")}
                </span>
                <h3 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-6 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-75">{t("premium_coats")}</h3>
                <Link
                  href="/search"
                  className="text-gray-900 dark:text-white border-b-2 border-primary pb-1 w-max hover:text-secondary hover:border-secondary transition-colors font-bold uppercase tracking-widest text-sm transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-150"
                >
                  {t("explore_collection_btn")}
                </Link>
              </div>
            </div>

            {/* Stacked Small Features */}
            <div className="flex flex-col gap-6" data-aos="fade-left">
              <div className="h-1/2 glass-panel relative group overflow-hidden clip-angled transform-gpu hover:shadow-2xl hover:shadow-primary/20 transition-all duration-500 skeleton">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent z-10 pointer-events-none group-hover:opacity-50 transition-opacity duration-500"></div>
                <Image
                  src={getValidImageUrl(discounted[1]?.resim || discounted[1]?.gorsel?.split(',')[0])}
                  alt="Elbise"
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover opacity-50 group-hover:scale-110 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-20 bg-black/20 group-hover:bg-black/40 transition-colors duration-500">
                  <h4 className="text-2xl font-black text-gray-900 dark:text-white mb-3 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">{t("minimalist_dresses")}</h4>
                  <Link
                    href="/search"
                    className="text-xs uppercase tracking-[0.2em] font-bold text-gray-900 dark:text-white bg-white/50 dark:bg-black/50 px-6 py-2 rounded-full backdrop-blur-md hover:bg-primary hover:text-white transition-colors transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500 delay-75 opacity-0 group-hover:opacity-100"
                  >
                    {t("explore")}
                  </Link>
                </div>
              </div>
              <div className="h-1/2 glass-panel relative group overflow-hidden clip-angled transform-gpu hover:shadow-2xl hover:shadow-secondary/20 transition-all duration-500 skeleton">
                <Image
                  src={getValidImageUrl(discounted[2]?.resim || discounted[2]?.gorsel?.split(',')[0])}
                  alt="Tunik"
                  fill
                  className="object-cover opacity-50 group-hover:scale-110 transition-transform duration-700 ease-out"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-20 bg-black/20 group-hover:bg-black/40 transition-colors duration-500">
                  <h4 className="text-2xl font-black text-gray-900 dark:text-white mb-3 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">{t("modern_tunics")}</h4>
                  <Link
                    href="/search"
                    className="text-xs uppercase tracking-[0.2em] font-bold text-gray-900 dark:text-white bg-white/50 dark:bg-black/50 px-6 py-2 rounded-full backdrop-blur-md hover:bg-secondary hover:text-gray-900 transition-colors transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500 delay-75 opacity-0 group-hover:opacity-100"
                  >
                    {t("explore")}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3.5 TESTIMONIALS */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute top-1/2 left-0 w-96 h-96 bg-primary opacity-10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="w-full max-w-6xl mx-auto px-4 relative z-10">
          <div className="text-center mb-16" data-aos="fade-up">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-4">
              {t("testimonials_title")}
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-primary to-secondary mx-auto mb-6"></div>
            <p className="text-gray-600 dark:text-gray-400">{t("testimonials_desc")}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: "Ayşe Y.", text: t("review_1_text"), stars: 5 },
              { name: "Zeynep K.", text: t("review_2_text"), stars: 5 },
              { name: "Fatma T.", text: t("review_3_text"), stars: 5 },
            ].map((review, i) => (
              <div
                key={i}
                className="glass-panel p-8 clip-angled relative group hover:-translate-y-2 transition-transform duration-300"
                data-aos="fade-up"
                data-aos-delay={i * 150}
              >
                <div className="text-secondary mb-6 text-2xl drop-shadow-[0_0_8px_rgba(255,215,0,0.5)]">{"★".repeat(review.stars)}</div>
                <p className="text-gray-700 dark:text-gray-300 italic mb-8 leading-relaxed text-sm">
                  &quot;{review.text}&quot;
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-black shadow-lg">
                    {review.name.charAt(0)}
                  </div>
                  <h4 className="text-gray-900 dark:text-white font-bold tracking-wide">{review.name}</h4>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. FUTURISTIC TRUST BADGES */}
      <section className="py-24 bg-black/5 dark:bg-white/5 border-t border-white/5">
        <div className="w-full max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                title: t("badge_fast_delivery"),
                desc: t("badge_fast_delivery_desc"),
                icon: "M13 10V3L4 14h7v7l9-11h-7z",
              },
              {
                title: t("badge_secure_payment"),
                desc: t("badge_secure_payment_desc"),
                icon: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
              },
              {
                title: t("badge_customer_satisfaction"),
                desc: t("badge_customer_satisfaction_desc"),
                icon: "M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z",
              },
              {
                title: t("badge_whatsapp_support"),
                desc: t("badge_whatsapp_support_desc"),
                icon: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z",
              },
            ].map((badge, i) => (
              <div
                key={i}
                className="glass-panel p-8 text-center group clip-hexa hover:border-secondary transition-colors duration-300 hover:shadow-2xl hover:shadow-secondary/10"
                data-aos="zoom-in"
                data-aos-delay={i * 100}
              >
                <div className="w-16 h-16 mx-auto mb-6 bg-white/5 rounded-full flex items-center justify-center text-primary group-hover:text-secondary group-hover:scale-110 transition-all duration-300 shadow-inner">
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="group-hover:animate-pulse"
                  >
                    <path d={badge.icon}></path>
                  </svg>
                </div>
                <h4 className="text-gray-900 dark:text-white font-black mb-3 uppercase tracking-wider text-sm">
                  {badge.title}
                </h4>
                <p className="text-gray-500 text-xs font-medium leading-relaxed">{badge.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* QUICK VIEW MODAL */}
      {quickViewProduct && (
        <QuickViewModal product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />
      )}
    </div>
  );
}
