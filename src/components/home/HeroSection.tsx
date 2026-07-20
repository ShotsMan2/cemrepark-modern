"use client";
import { useState, useEffect, useCallback } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import SearchTrigger from "../SearchTrigger";
import { useStore } from "../../context/StoreContext";
import { getValidImageUrl } from "../../utils/imageHelper";
import { memo } from "react";

function RippleButton({ children, href = "/search", className = "" }: { children: React.ReactNode; href?: string; className?: string }) {
  const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([]);

  const handleClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();
    setRipples((prev) => [...prev, { x, y, id }]);
    setTimeout(() => setRipples((prev) => prev.filter((r) => r.id !== id)), 1000);
  }, []);

  return (
    <Link
      href={href}
      onClick={handleClick}
      className={`group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-foreground text-background font-bold uppercase tracking-[0.15em] rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-[0_0_20px_var(--color-primary)] hover:scale-105 ${className}`}
    >
      <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-primary to-secondary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="absolute bg-white/30 rounded-full animate-ripple pointer-events-none"
          style={{
            left: ripple.x - 10,
            top: ripple.y - 10,
            width: 20,
            height: 20,
          }}
        />
      ))}
      <span className="relative z-10 flex items-center gap-2 group-hover:text-white transition-colors duration-300">
        {children}
      </span>
    </Link>
  );
}

function CountdownTimer({ targetDate }: { targetDate: string }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const target = new Date(targetDate).getTime();
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const diff = target - now;
      if (diff <= 0) {
        clearInterval(interval);
        return;
      }
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return (
    <div className="flex gap-3">
      {Object.entries(timeLeft).map(([unit, value]) => (
        <div key={unit} className="text-center">
          <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-background/80 backdrop-blur-md border border-foreground/10 flex items-center justify-center shadow-lg">
            <span className="text-lg md:text-xl font-black text-foreground">{value}</span>
          </div>
          <span className="text-[10px] uppercase tracking-widest text-foreground/50 font-bold mt-1 block">
            {unit}
          </span>
        </div>
      ))}
    </div>
  );
}

export default memo(function HeroSection({ activeBanners }: { activeBanners: any[] }) {
  const { t } = useStore();
  const [currentSlide, setCurrentSlide] = useState(0);
  const { scrollY } = useScroll();
  const parallaxY = useTransform(scrollY, [0, 500], [0, 150]);
  const parallaxOpacity = useTransform(scrollY, [0, 300], [1, 0.6]);

  useEffect(() => {
    if (activeBanners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % activeBanners.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [activeBanners.length]);

  if (activeBanners.length === 0) return null;

  return (
    <motion.section
      className="relative min-h-[60vh] flex items-center justify-center pt-20 pb-8 overflow-hidden mb-12"
      style={{ y: parallaxY, opacity: parallaxOpacity }}
    >
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] mix-blend-screen pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-secondary/15 rounded-full blur-[120px] mix-blend-screen pointer-events-none"></div>

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
                <motion.div
                  className="inline-block px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold text-xs uppercase tracking-widest mb-6"
                  initial={{ opacity: 0, y: -10 }}
                  animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: -10 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  ✨ {t("new_season")}
                </motion.div>

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
                          transition: { delay: 0.3 + i * 0.1, duration: 0.5, ease: "easeOut" },
                        }),
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
                  <RippleButton href={slide.linkUrl || "/search"}>
                    {t("explore_collection")}
                    <svg
                      className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M17 8l4 4m0 0l-4 4m4-4H3"
                      />
                    </svg>
                  </RippleButton>

                  {slide.countdownDate && (
                    <CountdownTimer targetDate={slide.countdownDate} />
                  )}

                  <div className="bg-background/80 backdrop-blur-md rounded-2xl border border-foreground/5 shadow-sm p-1">
                    <SearchTrigger />
                  </div>
                </motion.div>
              </motion.div>

              <div className="w-full md:w-1/2 relative h-full flex justify-center hidden md:flex items-center">
                <div className="absolute top-10 right-10 w-24 h-24 border border-primary/30 rounded-full opacity-40 animate-spin-slow pointer-events-none"></div>
                <div className="absolute bottom-20 left-10 w-16 h-16 border border-secondary/40 rounded-lg opacity-40 float-fx pointer-events-none rotate-12"></div>

                <motion.div
                  className="relative w-[90%] aspect-[4/5] rounded-[2.5rem] overflow-hidden shadow-[0_20px_50px_rgb(0,0,0,0.15)] dark:shadow-[0_20px_50px_rgb(0,0,0,0.4)] border border-white/20 dark:border-white/5 bg-background/50 backdrop-blur-sm"
                  initial={{ opacity: 0, scale: 0.95, rotate: -2 }}
                  animate={{
                    opacity: isActive ? 1 : 0,
                    scale: isActive ? 1 : 0.95,
                    rotate: isActive ? 0 : -2,
                  }}
                  transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
                >
                  <Image
                    src={getValidImageUrl(slide.imageUrl)}
                    alt={slide.title}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-[2000ms] ease-out"
                    priority
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none"></div>
                </motion.div>
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
                  ? "w-16 bg-foreground/20"
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
    </motion.section>
  );
});
