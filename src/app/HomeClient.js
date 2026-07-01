"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import FavoriteButton from "../components/FavoriteButton";
import QuickViewModal from "../components/QuickViewModal";
import SearchTrigger from "../components/SearchTrigger";
import PriceDisplay from "../components/PriceDisplay";
import { useStore } from "../context/StoreContext";

export default function HomeClient({ bestSellers, discounted }) {
  const { t } = useStore();
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  return (
    <div className="overflow-hidden">
      {/* 1. HERO SECTION - ASYMMETRIC & FLOATING */}
      <section className="relative min-h-screen flex items-center justify-center pt-24 pb-12">
        {/* Neon Background Glows */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-pink opacity-20 rounded-full blur-[100px] mix-blend-screen pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-holo-gold opacity-10 rounded-full blur-[100px] mix-blend-screen pointer-events-none"></div>

        <div className="w-full max-w-6xl mx-auto px-4 z-10 relative">
          <div className="flex flex-col md:flex-row items-center gap-12">
            
            {/* Left Content */}
            <div className="w-full md:w-1/2" data-aos="fade-right">
              <h2 className="text-holo-gold tracking-[0.3em] text-sm uppercase mb-4 font-bold">{t("new_season")}</h2>
              <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight text-glow-pink">
                <span dangerouslySetInnerHTML={{ __html: t("hero_title") }}></span>
              </h1>
              <p className="text-gray-400 text-lg md:text-xl mb-10 max-w-lg font-light leading-relaxed">
                {t("hero_desc")}
              </p>
              
              <div className="flex gap-6">
                <Link href="/search" className="glass-panel px-8 py-4 text-white font-medium uppercase tracking-wider hover:bg-neon-pink hover:border-neon-pink transition-all duration-300 clip-angled text-center inline-block">
                  {t("explore_collection")}
                </Link>
                <SearchTrigger />
              </div>
            </div>

            {/* Right Image - Floating */}
            <div className="w-full md:w-1/2 relative h-[600px] flex justify-center float-fx" data-aos="fade-left">
              {/* Decorative Elements */}
              <div className="absolute top-10 right-10 w-24 h-24 border border-neon-pink opacity-50 clip-hexa float-fx-delay"></div>
              <div className="absolute bottom-20 left-10 w-16 h-16 border border-holo-gold opacity-30 clip-angled float-fx"></div>
              
              <div className="relative w-4/5 h-full clip-angled glass-panel p-2">
                <div className="relative w-full h-full clip-angled overflow-hidden">
                  <Image 
                    src={bestSellers[0]?.gorsel || "/images/placeholder.jpg"} 
                    alt="Hero Image" 
                    fill
                    className="object-cover scale-105 hover:scale-110 transition-transform duration-700"
                    priority
                  />
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 1.5 TRUSTED BRANDS MARQUEE */}
      <section className="py-8 border-y border-white/5 bg-black/50 overflow-hidden">
        <div className="w-full whitespace-nowrap animate-marquee flex gap-16 md:gap-32 items-center opacity-40">
          <h4 className="text-xl font-black text-white uppercase tracking-[0.3em]">Shopier</h4>
          <h4 className="text-xl font-black text-white uppercase tracking-[0.3em]">Yurtiçi Kargo</h4>
          <h4 className="text-xl font-black text-white uppercase tracking-[0.3em]">Visa</h4>
          <h4 className="text-xl font-black text-white uppercase tracking-[0.3em]">Mastercard</h4>
          <h4 className="text-xl font-black text-white uppercase tracking-[0.3em]">Shopier</h4>
          <h4 className="text-xl font-black text-white uppercase tracking-[0.3em]">Yurtiçi Kargo</h4>
          <h4 className="text-xl font-black text-white uppercase tracking-[0.3em]">Visa</h4>
          <h4 className="text-xl font-black text-white uppercase tracking-[0.3em]">Mastercard</h4>
          <h4 className="text-xl font-black text-white uppercase tracking-[0.3em]">Shopier</h4>
          <h4 className="text-xl font-black text-white uppercase tracking-[0.3em]">Yurtiçi Kargo</h4>
          <h4 className="text-xl font-black text-white uppercase tracking-[0.3em]">Visa</h4>
          <h4 className="text-xl font-black text-white uppercase tracking-[0.3em]">Mastercard</h4>
        </div>
      </section>

      {/* 2. FLOATING CARDS (BEST SELLERS) */}
      <section id="collection" className="py-24 relative z-10">
        <div className="w-full max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16" data-aos="fade-up">
            <div>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-2">{t("trending")}</h2>
              <div className="w-24 h-1 bg-neon-pink"></div>
            </div>
            <Link href="/search" className="text-gray-400 hover:text-holo-gold mt-4 md:mt-0 tracking-widest text-sm uppercase transition-colors">
              {t("view_all")} ↗
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {bestSellers.map((product, index) => (
              <div key={product.id} className="glass-panel p-4 clip-angled group hover:border-neon-pink transition-colors relative" data-aos="fade-up" data-aos-delay={index * 150}>
                <div className="relative aspect-[3/4] mb-4 overflow-hidden clip-angled">
                  {product.etiket && (
                    <div className="absolute top-2 left-2 z-20">
                      <span className="text-xs font-bold uppercase tracking-widest bg-neon-pink text-white px-3 py-1 clip-angled shadow-lg">
                        {t(product.etiket)}
                      </span>
                    </div>
                  )}
                  
                  <Image src={product.gorsel || product.resim1} alt={product.ad} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
                  
                  <Link href={`/urundetay/${product.id}`} className="absolute inset-0 z-20">
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    </div>
                  </Link>
                  
                  {/* Quick View Button - appears on hover */}
                  <div className="absolute bottom-4 left-0 w-full px-4 flex justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0 z-30">
                    <button 
                      onClick={() => setQuickViewProduct(product)}
                      className="text-xs uppercase tracking-widest font-bold border-b border-gray-500 pb-1 text-white hover:text-neon-pink hover:border-neon-pink transition-colors mt-1 bg-black/50 px-4 py-2 rounded-full backdrop-blur-sm"
                    >
                      {t("quick_view")}
                    </button>
                  </div>
                </div>
                
                <div className="p-4 relative">
                  <p className="text-gray-400 text-xs uppercase tracking-widest mb-1">{t(product.kategori)}</p>
                  <h3 className="text-white font-bold text-lg truncate mb-2">{t(product.ad)}</h3>
                  <div className="flex justify-between items-center">
                    <PriceDisplay amount={product.fiyat} className="text-white font-bold" />
                    <FavoriteButton product={product} className="relative z-30" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. BENTO BOX SHOWCASE */}
      <section className="py-24 bg-black/50 border-y border-white/5">
        <div className="w-full max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-auto md:h-[600px]">
            
            {/* Big Feature */}
            <div className="md:col-span-2 glass-panel relative group overflow-hidden clip-angled" data-aos="fade-right">
              <Image src={discounted[0]?.gorsel || "/images/placeholder.jpg"} alt="Giyim" fill className="object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent p-10 flex flex-col justify-end">
                <span className="text-neon-pink uppercase tracking-[0.2em] text-sm font-bold mb-2">{t("special_design")}</span>
                <h3 className="text-4xl font-black text-white mb-4">{t("premium_coats")}</h3>
                <Link href="/search" className="text-white border-b border-white pb-1 w-max hover:text-holo-gold hover:border-holo-gold transition-colors">{t("explore_collection_btn")}</Link>
              </div>
            </div>

            {/* Stacked Small Features */}
            <div className="flex flex-col gap-6" data-aos="fade-left">
              <div className="h-1/2 glass-panel relative group overflow-hidden clip-angled">
                <div className="absolute inset-0 bg-gradient-to-br from-neon-pink/20 to-transparent z-10 pointer-events-none"></div>
                <Image src={discounted[1]?.gorsel || "/images/placeholder.jpg"} alt="Elbise" fill className="object-cover opacity-50 group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-20">
                  <h4 className="text-2xl font-bold text-white mb-2">{t("minimalist_dresses")}</h4>
                  <Link href="/search" className="text-xs uppercase tracking-widest text-gray-300 hover:text-white">{t("explore")}</Link>
                </div>
              </div>
              <div className="h-1/2 glass-panel relative group overflow-hidden clip-angled">
                <Image src={discounted[2]?.gorsel || "/images/placeholder.jpg"} alt="Tunik" fill className="object-cover opacity-50 group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-20">
                  <h4 className="text-2xl font-bold text-white mb-2">{t("modern_tunics")}</h4>
                  <Link href="/search" className="text-xs uppercase tracking-widest text-gray-300 hover:text-white">{t("explore")}</Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3.5 TESTIMONIALS */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute top-1/2 left-0 w-96 h-96 bg-neon-pink opacity-10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="w-full max-w-6xl mx-auto px-4 relative z-10">
          <div className="text-center mb-16" data-aos="fade-up">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">{t("testimonials_title")}</h2>
            <div className="w-24 h-1 bg-holo-gold mx-auto mb-4"></div>
            <p className="text-gray-400">{t("testimonials_desc")}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: "Ayşe Y.", text: t("review_1_text"), stars: 5 },
              { name: "Zeynep K.", text: t("review_2_text"), stars: 5 },
              { name: "Fatma T.", text: t("review_3_text"), stars: 5 }
            ].map((review, i) => (
              <div key={i} className="glass-panel p-8 clip-angled relative" data-aos="fade-up" data-aos-delay={i * 150}>
                <div className="text-holo-gold mb-4 text-2xl">
                  {"★".repeat(review.stars)}
                </div>
                <p className="text-gray-300 italic mb-6 leading-relaxed">&quot;{review.text}&quot;</p>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neon-pink to-holo-gold flex items-center justify-center text-white font-bold">
                    {review.name.charAt(0)}
                  </div>
                  <h4 className="text-white font-bold">{review.name}</h4>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. FUTURISTIC TRUST BADGES */}
      <section className="py-24">
        <div className="w-full max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { title: t("badge_fast_delivery"), desc: t("badge_fast_delivery_desc"), icon: "M13 10V3L4 14h7v7l9-11h-7z" },
              { title: t("badge_secure_payment"), desc: t("badge_secure_payment_desc"), icon: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" },
              { title: t("badge_customer_satisfaction"), desc: t("badge_customer_satisfaction_desc"), icon: "M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" },
              { title: t("badge_whatsapp_support"), desc: t("badge_whatsapp_support_desc"), icon: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" }
            ].map((badge, i) => (
              <div key={i} className="glass-panel p-8 text-center group clip-hexa hover:border-holo-gold transition-colors duration-300" data-aos="zoom-in" data-aos-delay={i * 100}>
                <div className="w-16 h-16 mx-auto mb-6 bg-white/5 rounded-full flex items-center justify-center text-neon-pink group-hover:text-holo-gold transition-colors duration-300">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d={badge.icon}></path>
                  </svg>
                </div>
                <h4 className="text-white font-bold mb-2 uppercase tracking-wider">{badge.title}</h4>
                <p className="text-gray-500 text-sm">{badge.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* QUICK VIEW MODAL */}
      <QuickViewModal product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />

    </div>
  );
}
