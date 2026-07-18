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
import CountdownTimer from "../components/ui/CountdownTimer";
import SocialProofCounter from "../components/ui/SocialProofCounter";

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

  const categories = [
    { id: 1, name: "Elbise", image: "/assets/siteimg/yeni1.jpg", href: "/search?q=Elbise" },
    { id: 2, name: "Takım", image: "/assets/siteimg/yeni2.jpg", href: "/search?q=Takım" },
    { id: 3, name: "Tunik", image: "/assets/siteimg/yeni3.jpg", href: "/search?q=Tunik" },
    { id: 4, name: "Kaban", image: "/assets/siteimg/yeni4.jpg", href: "/search?q=Kaban" },
    { id: 5, name: "Pantolon", image: "/assets/siteimg/yeni1.jpg", href: "/search?q=Pantolon" },
  ];

  const renderHeroSection = () => {
    if (activeBanners.length > 0) {
      return (
        <section className="relative min-h-[90vh] flex items-center justify-center pt-24 pb-12 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary opacity-20 rounded-full blur-[120px] mix-blend-screen pointer-events-none"></div>
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-secondary opacity-15 rounded-full blur-[120px] mix-blend-screen pointer-events-none"></div>

          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10 relative h-[600px] md:h-[650px]">
            {activeBanners.map((slide, index) => {
              const isActive = index === currentSlide;
              return (
                <div
                  key={slide.id}
                  className={`absolute inset-0 transition-all duration-1000 flex flex-col md:flex-row items-center gap-12 ${
                    isActive
                      ? "opacity-100 translate-x-0 z-10 visible"
                      : "opacity-0 translate-x-12 z-0 pointer-events-none invisible"
                  }`}
                >
                  <div className="w-full md:w-1/2 text-left" data-aos="fade-right">
                    <div className="inline-block px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold text-xs uppercase tracking-widest mb-6 animate-pulse-glow">
                      ✨ {t("new_season")}
                    </div>
                    <h1 className="text-6xl md:text-8xl font-display font-black mb-6 leading-none text-glow-primary tracking-tight">
                      {slide.title}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300 text-lg md:text-2xl mb-10 max-w-xl font-light leading-relaxed">
                      {t("hero_desc")}
                    </p>

                    <div className="flex flex-wrap gap-6 items-center">
                      <Link
                        href={slide.linkUrl || "/search"}
                        className="glass-panel px-10 py-5 bg-foreground text-background dark:bg-white dark:text-black font-bold uppercase tracking-widest hover:bg-primary dark:hover:bg-primary hover:text-white hover:border-primary transition-all duration-300 clip-angled text-center inline-flex items-center gap-2 group"
                      >
                        {t("explore_collection")}
                        <svg className="w-5 h-5 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                      </Link>
                      <SearchTrigger />
                    </div>
                  </div>

                  <div className="w-full md:w-1/2 relative h-full flex justify-center float-fx hidden md:flex">
                    {/* Decorative Elements */}
                    <div className="absolute top-10 right-10 w-32 h-32 border-2 border-primary opacity-30 clip-hexa float-fx-delay animate-spin-slow"></div>
                    <div className="absolute bottom-20 left-10 w-20 h-20 border-2 border-secondary opacity-40 clip-angled float-fx"></div>
                    
                    <div className="relative w-[85%] h-full clip-angled glass-frosted p-3 shadow-2xl">
                      <div className="relative w-full h-full clip-angled overflow-hidden group skeleton">
                        <Image
                          src={getValidImageUrl(slide.imageUrl)}
                          alt={slide.title}
                          fill
                          className="object-cover scale-105 group-hover:scale-110 transition-transform duration-[2000ms] ease-out"
                          priority
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                        {/* Overlay Gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {activeBanners.length > 1 && (
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-4 z-20 glass-panel px-6 py-3 rounded-full">
              {activeBanners.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`relative h-2 rounded-full transition-all duration-500 overflow-hidden ${
                    index === currentSlide 
                      ? "w-12 bg-gray-600 dark:bg-gray-400" 
                      : "w-3 bg-gray-300 dark:bg-gray-700 hover:bg-primary/50"
                  }`}
                  aria-label={`Slayt ${index + 1}`}
                >
                  {index === currentSlide && (
                    <div className="absolute top-0 left-0 h-full bg-primary animate-[progress_6s_linear_infinite]"></div>
                  )}
                </button>
              ))}
            </div>
          )}
        </section>
      );
    }

    return null;
  };

  return (
    <div className="overflow-hidden">
      {renderHeroSection()}

      {/* MARQUEE */}
      <section className="py-6 border-y border-white/10 bg-white/50 dark:bg-black/50 overflow-hidden backdrop-blur-md relative z-20">
        <div className="w-full whitespace-nowrap animate-marquee flex gap-20 items-center opacity-60">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex gap-20 items-center">
              <h4 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-[0.3em] font-display">Shopier</h4>
              <span className="text-primary text-xl">✦</span>
              <h4 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-[0.3em] font-display">Yurtiçi Kargo</h4>
              <span className="text-primary text-xl">✦</span>
              <h4 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-[0.3em] font-display">Visa</h4>
              <span className="text-primary text-xl">✦</span>
              <h4 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-[0.3em] font-display">Mastercard</h4>
              <span className="text-primary text-xl">✦</span>
            </div>
          ))}
        </div>
      </section>

      {/* CATEGORY SHOWCASE */}
      <section className="py-20 bg-background relative">
        <div className="container-premium">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-4xl font-display font-black mb-2">Kategoriler</h2>
              <div className="w-20 h-1 bg-gradient-to-r from-primary to-secondary"></div>
            </div>
          </div>
          
          <div className="flex gap-6 overflow-x-auto no-scrollbar pb-8 snap-x">
            {categories.map((cat, i) => (
              <Link key={cat.id} href={cat.href} className="flex-none w-48 md:w-56 group snap-center cursor-pointer">
                <div className="relative w-full aspect-square rounded-full overflow-hidden mb-4 border-4 border-white/10 dark:border-white/5 group-hover:border-primary transition-colors duration-500 shadow-xl p-2 glass-panel">
                  <div className="relative w-full h-full rounded-full overflow-hidden">
                    <Image
                      src={cat.image}
                      alt={cat.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors duration-500"></div>
                  </div>
                </div>
                <h3 className="text-center font-bold text-lg uppercase tracking-wider group-hover:text-primary transition-colors">{cat.name}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FLASH SALE COUNTDOWN */}
      <section className="py-12 bg-background relative z-10">
        <div className="container-premium">
          <CountdownTimer targetDate={new Date(Date.now() + 86400000 * 2).toISOString()} />
        </div>
      </section>

      {/* BEST SELLERS */}
      <section id="collection" className="py-24 relative z-10">
        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-b from-transparent via-primary/5 to-transparent pointer-events-none"></div>
        <div className="container-premium relative">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16" data-aos="fade-up">
            <div>
              <p className="text-secondary tracking-widest text-sm uppercase font-bold mb-2">En Çok Tercih Edilenler</p>
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white font-display">Trend Ürünler</h2>
            </div>
            <Link
              href="/search"
              className="group flex items-center gap-2 text-sm font-bold uppercase tracking-widest hover:text-primary transition-colors mt-6 md:mt-0"
            >
              Tümünü Gör 
              <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                →
              </span>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
            {bestSellers.map((product, index) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onQuickView={setQuickViewProduct} 
                delay={index * 100} 
              />
            ))}
          </div>
        </div>
      </section>

      {/* BENTO BOX SHOWCASE */}
      <section className="py-24 bg-[#0a0a0a] text-white relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-primary/20 blur-[150px] rounded-full"></div>
          <div className="absolute -bottom-[20%] -right-[10%] w-[50%] h-[50%] bg-secondary/20 blur-[150px] rounded-full"></div>
        </div>

        <div className="container-premium relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-auto md:h-[700px]">
            {/* Big Feature (Left, 8 cols) */}
            <div
              className="md:col-span-8 glass-panel border-white/10 relative group overflow-hidden rounded-3xl skeleton"
              data-aos="fade-right"
            >
              <Image
                src={getValidImageUrl(discounted[0]?.resim || discounted[0]?.gorsel?.split(',')[0])}
                alt="Giyim"
                fill
                className="object-cover opacity-70 group-hover:opacity-100 group-hover:scale-105 transition-all duration-1000 ease-out"
                sizes="(max-width: 768px) 100vw, 66vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent p-12 flex flex-col justify-end">
                <div className="overflow-hidden mb-4">
                  <span className="inline-block bg-white text-black px-4 py-1 text-xs font-black uppercase tracking-widest transform translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                    Özel Tasarım
                  </span>
                </div>
                <h3 className="text-5xl md:text-6xl font-display font-black text-white mb-6 transform translate-y-8 group-hover:translate-y-0 transition-transform duration-500 delay-100">
                  Premium Koleksiyon
                </h3>
                <Link
                  href="/search"
                  className="flex items-center gap-3 text-white border-b-2 border-primary pb-2 w-max hover:text-secondary hover:border-secondary transition-colors font-bold uppercase tracking-widest text-sm transform translate-y-8 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500 delay-200"
                >
                  Koleksiyonu Keşfet <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </Link>
              </div>
            </div>

            {/* Stacked Small Features (Right, 4 cols) */}
            <div className="md:col-span-4 flex flex-col gap-6" data-aos="fade-left" data-aos-delay="100">
              <div className="h-1/2 glass-panel border-white/10 relative group overflow-hidden rounded-3xl skeleton">
                <Image
                  src={getValidImageUrl(discounted[1]?.resim || discounted[1]?.gorsel?.split(',')[0])}
                  alt="Elbise"
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover opacity-60 group-hover:scale-110 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-black/30 group-hover:bg-black/50 transition-colors duration-500">
                  <h4 className="text-3xl font-display font-black text-white mb-4">Minimalist</h4>
                  <Link
                    href="/search"
                    className="glass-frosted text-xs uppercase tracking-[0.2em] font-bold text-white px-8 py-3 rounded-full hover:bg-white hover:text-black transition-all transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 duration-500"
                  >
                    Keşfet
                  </Link>
                </div>
              </div>
              
              <div className="h-1/2 glass-panel border-white/10 relative group overflow-hidden rounded-3xl skeleton">
                <Image
                  src={getValidImageUrl(discounted[2]?.resim || discounted[2]?.gorsel?.split(',')[0])}
                  alt="Tunik"
                  fill
                  className="object-cover opacity-60 group-hover:scale-110 transition-transform duration-700 ease-out"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-black/30 group-hover:bg-black/50 transition-colors duration-500">
                  <h4 className="text-3xl font-display font-black text-white mb-4">Modern Çizgiler</h4>
                  <Link
                    href="/search"
                    className="glass-frosted text-xs uppercase tracking-[0.2em] font-bold text-white px-8 py-3 rounded-full hover:bg-secondary hover:text-black transition-all transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 duration-500"
                  >
                    Keşfet
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF COUNTERS */}
      <SocialProofCounter />

      {/* TESTIMONIALS */}
      <section className="py-24 relative overflow-hidden bg-background">
        <div className="absolute top-1/2 left-0 w-96 h-96 bg-primary opacity-5 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="container-premium relative z-10">
          <div className="text-center mb-20" data-aos="fade-up">
            <span className="text-secondary font-bold tracking-widest uppercase text-sm mb-2 block">Müşteri Yorumları</span>
            <h2 className="text-4xl md:text-5xl font-black font-display text-gray-900 dark:text-white mb-6">
              Sizden Gelenler
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-primary to-secondary mx-auto mb-6"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: "Ayşe Y.", text: t("review_1_text"), stars: 5, date: "2 gün önce" },
              { name: "Zeynep K.", text: t("review_2_text"), stars: 5, date: "1 hafta önce" },
              { name: "Fatma T.", text: t("review_3_text"), stars: 5, date: "2 hafta önce" },
            ].map((review, i) => (
              <div
                key={i}
                className="glass-panel p-8 rounded-2xl relative group hover:-translate-y-4 transition-transform duration-500"
                data-aos="fade-up"
                data-aos-delay={i * 150}
              >
                <div className="absolute -top-6 left-8 text-6xl text-primary opacity-20 font-serif">"</div>
                <div className="flex justify-between items-center mb-6 relative z-10">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, idx) => (
                      <svg key={idx} className="w-5 h-5 text-secondary drop-shadow-md" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-xs text-gray-500 font-medium">{review.date}</span>
                </div>
                
                <p className="text-gray-700 dark:text-gray-300 mb-8 leading-relaxed text-sm md:text-base relative z-10">
                  {review.text}
                </p>
                
                <div className="flex items-center gap-4 mt-auto pt-6 border-t border-gray-200 dark:border-white/10">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-black shadow-lg text-lg">
                    {review.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-gray-900 dark:text-white font-bold tracking-wide">{review.name}</h4>
                    <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 mt-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                      Doğrulanmış Alıcı
                    </div>
                  </div>
                </div>
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
