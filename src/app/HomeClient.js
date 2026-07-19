"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
    { id: 1, name: "Elbise", count: "124+", image: "/assets/siteimg/yeni1.jpg", href: "/search?q=Elbise" },
    { id: 2, name: "Takım", count: "86+", image: "/assets/siteimg/yeni2.jpg", href: "/search?q=Takım" },
    { id: 3, name: "Tunik", count: "150+", image: "/assets/siteimg/yeni3.jpg", href: "/search?q=Tunik" },
    { id: 4, name: "Kaban", count: "45+", image: "/assets/siteimg/yeni4.jpg", href: "/search?q=Kaban" },
    { id: 5, name: "Pantolon", count: "98+", image: "/assets/siteimg/yeni1.jpg", href: "/search?q=Pantolon" },
  ];

  const renderHeroSection = () => {
    if (activeBanners.length > 0) {
      return (
        <section className="relative min-h-[60vh] flex items-center justify-center pt-20 pb-8 overflow-hidden mb-12">
          <div className="absolute top-1/4 left-1/4 w-[350px] h-[350px] bg-primary opacity-20 rounded-full blur-[100px] mix-blend-screen pointer-events-none"></div>
          <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-secondary opacity-15 rounded-full blur-[100px] mix-blend-screen pointer-events-none"></div>

          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10 relative h-[400px] md:h-[450px]">
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
                  <motion.div 
                    className="w-full md:w-1/2 text-left"
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: isActive ? 1 : 0, x: isActive ? 0 : -50 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  >
                    <div className="inline-block px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold text-xs uppercase tracking-widest mb-6 animate-pulse-glow">
                      ✨ {t("new_season")}
                    </div>
                    <h1 className="text-4xl md:text-6xl font-display font-black mb-4 leading-none text-glow-primary tracking-tight flex flex-wrap gap-x-3">
                      {slide.title?.split(" ").map((word, i) => (
                        <motion.span
                          key={i}
                          custom={i}
                          initial="hidden"
                          animate={isActive ? "visible" : "hidden"}
                          variants={{
                            hidden: { opacity: 0, y: 20 },
                            visible: (i) => ({
                              opacity: 1,
                              y: 0,
                              transition: { delay: 0.3 + i * 0.1, duration: 0.5, ease: "easeOut" }
                            })
                          }}
                        >
                          {word}
                        </motion.span>
                      ))}
                    </h1>
                    <motion.p 
                      className="text-gray-600 dark:text-gray-300 text-base md:text-lg mb-10 max-w-xl font-light leading-relaxed"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: isActive ? 1 : 0 }}
                      transition={{ delay: 0.8, duration: 0.8 }}
                    >
                      {t("hero_desc")}
                    </motion.p>

                    <motion.div 
                      className="flex flex-wrap gap-6 items-center"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: isActive ? 1 : 0, y: isActive ? 0 : 20 }}
                      transition={{ delay: 1, duration: 0.5 }}
                    >
                      <Link
                        href={slide.linkUrl || "/search"}
                        className="glass-panel px-8 py-4 bg-foreground text-background dark:bg-white dark:text-black font-bold uppercase tracking-widest hover:bg-primary dark:hover:bg-primary hover:text-white hover:border-primary transition-all duration-300 clip-angled text-center inline-flex items-center gap-2 group"
                      >
                        {t("explore_collection")}
                        <svg className="w-5 h-5 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                      </Link>
                      <SearchTrigger />
                    </motion.div>
                  </motion.div>

                  <div className="w-full md:w-1/2 relative h-full flex justify-center float-fx hidden md:flex">
                    {/* Decorative Elements */}
                    <div className="absolute top-10 right-10 w-20 h-20 border-2 border-primary opacity-30 clip-hexa float-fx-delay animate-spin-slow"></div>
                    <div className="absolute bottom-20 left-10 w-14 h-14 border-2 border-secondary opacity-40 clip-angled float-fx"></div>
                    
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
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-3 z-20 glass-panel px-4 py-2 rounded-full">
              {activeBanners.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`relative h-2 rounded-full transition-all duration-500 overflow-hidden ${
                    index === currentSlide 
                      ? "w-16 bg-gray-200 dark:bg-gray-700" 
                      : "w-4 bg-gray-300 dark:bg-gray-600 hover:bg-primary/50"
                  }`}
                  aria-label={`Slayt ${index + 1}`}
                >
                  {index === currentSlide && (
                    <motion.div 
                      className="absolute top-0 left-0 h-full bg-primary"
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 6, ease: "linear" }}
                    />
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
      <section className="py-4 mb-12 border-y border-white/10 bg-white/50 dark:bg-black/50 overflow-hidden backdrop-blur-md relative z-20">
        <div className="w-full whitespace-nowrap animate-marquee flex gap-20 items-center opacity-60">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex gap-20 items-center">
              <h4 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-[0.3em] font-display">Shopier</h4>
              <span className="text-primary text-lg">✦</span>
              <h4 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-[0.3em] font-display">Yurtiçi Kargo</h4>
              <span className="text-primary text-lg">✦</span>
              <h4 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-[0.3em] font-display">Visa</h4>
              <span className="text-primary text-lg">✦</span>
              <h4 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-[0.3em] font-display">Mastercard</h4>
              <span className="text-primary text-xl">✦</span>
            </div>
          ))}
        </div>
      </section>

      {/* BRAND FEATURES STRIP */}
      <section className="py-8 bg-background relative z-10 border-b border-gray-200 dark:border-white/5">
        <div className="container-premium">
          <div className="flex gap-4 md:justify-between overflow-x-auto no-scrollbar pb-4 md:pb-0 snap-x">
            {[
              { icon: "🚚", title: "Ücretsiz Kargo", desc: "500 TL üzeri siparişlerde" },
              { icon: "🔄", title: "Kolay İade", desc: "14 gün içinde koşulsuz iade" },
              { icon: "💳", title: "Güvenli Ödeme", desc: "256-bit SSL koruması" },
              { icon: "📱", title: "7/24 Destek", desc: "WhatsApp destek hattı" },
            ].map((feat, i) => (
              <motion.div 
                key={i} 
                className="flex-none w-[240px] md:w-auto flex items-center gap-4 glass-panel p-4 rounded-2xl snap-center group"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-2xl group-hover:scale-110 group-hover:bg-primary/20 transition-all">
                  {feat.icon}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white text-sm uppercase tracking-wide">{feat.title}</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{feat.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CATEGORY SHOWCASE */}
      <section className="py-14 mb-12 bg-background relative">
        <div className="container-premium">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-3xl font-display font-black mb-2">Kategoriler</h2>
              <div className="w-16 h-1 bg-gradient-to-r from-primary to-secondary"></div>
            </div>
          </div>
          
          <motion.div 
            className="flex gap-6 overflow-x-auto no-scrollbar pb-6 snap-x"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            {categories.map((cat, i) => (
              <Link key={cat.id} href={cat.href} className="flex-none w-40 md:w-48 group snap-center cursor-pointer">
                <div className="relative w-full aspect-square rounded-full mb-3 border-4 border-transparent hover:border-primary/50 transition-colors duration-500 shadow-xl p-2 glass-panel glow-ring">
                  <div className="relative w-full h-full rounded-full overflow-hidden">
                    <Image
                      src={cat.image}
                      alt={cat.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors duration-500"></div>
                  </div>
                  <div className="absolute top-0 right-0 badge-premium bg-primary text-white shadow-lg z-10 translate-x-2 -translate-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {cat.count}
                  </div>
                </div>
                <h3 className="text-center font-bold text-base uppercase tracking-wider group-hover:text-primary transition-colors">{cat.name}</h3>
              </Link>
            ))}
          </motion.div>
        </div>
      </section>

      {/* FLASH SALE COUNTDOWN */}
      <section className="py-8 bg-background relative z-10">
        <div className="container-premium">
          <CountdownTimer targetDate={new Date(Date.now() + 86400000 * 2).toISOString()} />
        </div>
      </section>

      {/* BEST SELLERS */}
      <section id="collection" className="py-16 relative z-10">
        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-b from-transparent via-primary/5 to-transparent pointer-events-none"></div>
        <div className="container-premium relative">
          <motion.div 
            className="flex flex-col md:flex-row justify-between items-end mb-10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div>
              <p className="text-secondary tracking-widest text-xs uppercase font-bold mb-2">En Çok Tercih Edilenler</p>
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white font-display">Trend Ürünler</h2>
            </div>
            <Link
              href="/search"
              className="group flex items-center gap-2 text-sm font-bold uppercase tracking-widest hover:text-primary transition-colors mt-4 md:mt-0"
            >
              Tümünü Gör 
              <span className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                →
              </span>
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-8">
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
      <section className="py-16 bg-gray-100 dark:bg-[#0a0a0a] text-gray-900 dark:text-white relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-primary/20 blur-[150px] rounded-full"></div>
          <div className="absolute -bottom-[20%] -right-[10%] w-[50%] h-[50%] bg-secondary/20 blur-[150px] rounded-full"></div>
        </div>

        <div className="container-premium relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-auto md:h-[500px]">
            {/* Big Feature (Left, 8 cols) */}
            <motion.div
              className="md:col-span-8 glass-panel dark:border-white/10 border-black/10 relative group overflow-hidden rounded-3xl skeleton"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Image
                src={getValidImageUrl(discounted[0]?.resim || discounted[0]?.gorsel?.split(',')[0])}
                alt="Giyim"
                fill
                className="object-cover opacity-70 group-hover:opacity-100 group-hover:scale-105 transition-all duration-1000 ease-out"
                sizes="(max-width: 768px) 100vw, 66vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent p-8 flex flex-col justify-end">
                <div className="overflow-hidden mb-3">
                  <span className="inline-block bg-white text-black px-3 py-1 text-xs font-black uppercase tracking-widest transform translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                    Özel Tasarım
                  </span>
                </div>
                <h3 className="text-4xl md:text-5xl font-display font-black text-white mb-4 transform translate-y-8 group-hover:translate-y-0 transition-transform duration-500 delay-100">
                  Premium Koleksiyon
                </h3>
                <Link
                  href="/search"
                  className="flex items-center gap-3 text-white border-b-2 border-primary pb-2 w-max hover:text-secondary hover:border-secondary transition-colors font-bold uppercase tracking-widest text-sm transform translate-y-8 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500 delay-200"
                >
                  Koleksiyonu Keşfet <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </Link>
              </div>
            </motion.div>

            {/* Stacked Small Features (Right, 4 cols) */}
            <motion.div 
              className="md:col-span-4 flex flex-col gap-6"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="h-1/2 glass-panel dark:border-white/10 border-black/10 relative group overflow-hidden rounded-3xl skeleton">
                <Image
                  src={getValidImageUrl(discounted[1]?.resim || discounted[1]?.gorsel?.split(',')[0])}
                  alt="Elbise"
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover opacity-60 group-hover:scale-110 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-black/30 group-hover:bg-black/50 transition-colors duration-500">
                  <h4 className="text-2xl font-display font-black text-white mb-3">Minimalist</h4>
                  <Link
                    href="/search"
                    className="glass-frosted text-xs uppercase tracking-[0.2em] font-bold text-white px-6 py-2 rounded-full hover:bg-white hover:text-black transition-all transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 duration-500"
                  >
                    Keşfet
                  </Link>
                </div>
              </div>
              
              <div className="h-1/2 glass-panel dark:border-white/10 border-black/10 relative group overflow-hidden rounded-3xl skeleton">
                <Image
                  src={getValidImageUrl(discounted[2]?.resim || discounted[2]?.gorsel?.split(',')[0])}
                  alt="Tunik"
                  fill
                  className="object-cover opacity-60 group-hover:scale-110 transition-transform duration-700 ease-out"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-black/30 group-hover:bg-black/50 transition-colors duration-500">
                  <h4 className="text-2xl font-display font-black text-white mb-3">Modern Çizgiler</h4>
                  <Link
                    href="/search"
                    className="glass-frosted text-xs uppercase tracking-[0.2em] font-bold text-white px-6 py-2 rounded-full hover:bg-secondary hover:text-black transition-all transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 duration-500"
                  >
                    Keşfet
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF COUNTERS */}
      <SocialProofCounter />

      {/* NEWSLETTER SIGNUP */}
      <section className="py-20 relative overflow-hidden bg-background">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent pointer-events-none"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-secondary/10 blur-[120px] rounded-[100%] pointer-events-none"></div>
        
        <div className="container-premium relative z-10">
          <motion.div 
            className="glass-card max-w-4xl mx-auto p-10 md:p-14 text-center overflow-hidden relative"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 blur-3xl rounded-full"></div>
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-secondary/20 blur-3xl rounded-full"></div>
            
            <span className="badge-premium bg-primary/10 text-primary mb-6">Özel Fırsatlar</span>
            <h2 className="text-3xl md:text-5xl font-display font-black text-gray-900 dark:text-white mb-4">
              VIP Bültenimize Katılın
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-xl mx-auto mb-8 font-medium">
              Yeni koleksiyonlardan ilk siz haberdar olun! Sadece abonelerimize özel indirim kodları ve sürpriz fırsatları kaçırmayın.
            </p>
            
            <form className="max-w-md mx-auto relative flex items-center" onSubmit={(e) => e.preventDefault()}>
              <input 
                type="email" 
                placeholder="E-posta adresiniz..." 
                className="w-full input-premium pr-[140px]"
                required
              />
              <button 
                type="submit" 
                className="absolute right-1.5 btn-premium py-2.5 px-6 text-sm"
              >
                Abone Ol
              </button>
            </form>
            <p className="text-xs text-gray-400 mt-4">İstediğiniz zaman abonelikten ayrılabilirsiniz.</p>
          </motion.div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-16 relative overflow-hidden bg-background">
        <div className="absolute top-1/2 left-0 w-96 h-96 bg-primary opacity-5 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="container-premium relative z-10">
          <motion.div 
            className="text-center mb-14"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-secondary font-bold tracking-widest uppercase text-sm mb-2 block">Müşteri Yorumları</span>
            <h2 className="text-3xl md:text-4xl font-black font-display text-gray-900 dark:text-white mb-4">
              Sizden Gelenler
            </h2>
            <div className="w-20 h-1 bg-gradient-to-r from-primary to-secondary mx-auto mb-4"></div>
          </motion.div>

          {/* Rating Distribution Bar */}
          <motion.div 
            className="max-w-2xl mx-auto mb-16 glass-panel p-6 rounded-2xl flex flex-col md:flex-row items-center gap-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="text-center md:text-left flex-shrink-0">
              <div className="text-5xl font-black font-display text-gray-900 dark:text-white">4.9</div>
              <div className="flex gap-1 text-secondary my-2 justify-center md:justify-start">
                {[...Array(5)].map((_, i) => <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>)}
              </div>
              <div className="text-sm text-gray-500">1,250+ Değerlendirme</div>
            </div>
            <div className="flex-grow w-full space-y-2">
              {[
                { star: 5, pct: 92 },
                { star: 4, pct: 6 },
                { star: 3, pct: 2 },
                { star: 2, pct: 0 },
                { star: 1, pct: 0 },
              ].map(row => (
                <div key={row.star} className="flex items-center gap-3 text-sm">
                  <span className="font-medium w-8">{row.star} Y.</span>
                  <div className="flex-grow h-2 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-secondary" 
                      initial={{ width: 0 }}
                      whileInView={{ width: `${row.pct}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: 0.2 }}
                    />
                  </div>
                  <span className="text-gray-500 w-8 text-right">{row.pct}%</span>
                </div>
              ))}
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: "Ayşe Y.", text: t("review_1_text") || "Ürünlerin kalitesi muazzam. Paketleme çok özenliydi ve kargom ertesi gün elime ulaştı. Kesinlikle favori mağazam!", stars: 5, date: "2 gün önce" },
              { name: "Zeynep K.", text: t("review_2_text") || "Müşteri hizmetleri çok ilgiliydi. Beden değişimi sürecinde bana çok yardımcı oldular. Kabanın duruşu harika.", stars: 5, date: "1 hafta önce" },
              { name: "Fatma T.", text: t("review_3_text") || "Fotoğraflarda göründüğünden bile daha güzel bir elbise. Kumaşı kaliteli, üzerimde tam durdu. Herkese tavsiye ederim.", stars: 5, date: "2 hafta önce" },
            ].map((review, i) => (
              <motion.div
                key={i}
                className="glass-panel p-8 rounded-2xl relative group hover:-translate-y-4 transition-transform duration-500 hover:shadow-xl hover:border-primary/30"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
              >
                <div className="absolute -top-6 left-8 text-6xl text-primary opacity-20 font-serif">"</div>
                <div className="flex justify-between items-center mb-4 relative z-10">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, idx) => (
                      <svg key={idx} className="w-4 h-4 text-secondary drop-shadow-md" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-xs text-gray-500 font-medium">{review.date}</span>
                </div>
                
                <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed text-sm md:text-base relative z-10">
                  {review.text}
                </p>
                
                <div className="flex items-center gap-4 mt-auto pt-4 border-t border-gray-200 dark:border-white/10">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-black shadow-lg text-base">
                    {review.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-gray-900 dark:text-white font-bold tracking-wide">{review.name}</h4>
                    <div className="badge-premium bg-green-500/10 text-green-600 dark:text-green-400 mt-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                      Doğrulanmış Alıcı
                    </div>
                  </div>
                </div>
              </motion.div>
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
