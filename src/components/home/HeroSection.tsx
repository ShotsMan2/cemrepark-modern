"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import SearchTrigger from "../SearchTrigger";
import { useStore } from "../../context/StoreContext";
import { getValidImageUrl } from "../../utils/imageHelper";
import { memo } from "react";

export default memo(function HeroSection({ activeBanners }: { activeBanners: any[] }) {
  const { t } = useStore();
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (activeBanners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % activeBanners.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [activeBanners.length]);

  if (activeBanners.length === 0) return null;

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
})

