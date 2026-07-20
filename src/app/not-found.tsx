"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const quickLinks = [
  { name: "Trend Ürünler", href: "/search?q=Tesettür" },
  { name: "Yeni Sezon", href: "/search?q=Yeni+Sezon" },
  { name: "İndirimdekiler", href: "/search?q=İndirim" },
  { name: "İletişim", href: "/kurumsal/iletisim" },
];

export default function NotFound() {
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-[80vh] flex items-center justify-center relative overflow-hidden bg-background">
      {/* Background Decorative Elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary opacity-5 rounded-full blur-[150px] pointer-events-none"></div>

      {/* Animated floating numbers */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[4, 0, 4].map((num, i) => (
          <motion.div
            key={i}
            className="absolute text-primary/5 font-black text-[200px] md:text-[400px] leading-none select-none"
            style={{
              left: `${20 + i * 30}%`,
              top: `${10 + (i % 2) * 40}%`,
            }}
            animate={{
              y: [0, -30, 0],
              rotate: [0, i % 2 === 0 ? 5 : -5, 0],
            }}
            transition={{
              duration: 4 + i,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            {num}
          </motion.div>
        ))}
      </div>

      <div className="container-premium relative z-10 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 12 }}
        >
          <h1 className="text-9xl md:text-[150px] font-black text-transparent bg-clip-text bg-gradient-to-br from-primary to-secondary animate-pulse-glow leading-none mb-4 tracking-tighter">
            404
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="glass-panel px-6 py-2 rounded-full mb-8 border border-primary/20"
        >
          <span className="text-sm font-bold uppercase tracking-widest text-primary">
            Sayfa Bulunamadı
          </span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="text-3xl md:text-4xl font-display font-black text-foreground mb-6"
        >
          Aradığınız Sayfayı Bulamadık
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="text-foreground/60 text-lg max-w-lg mb-10 leading-relaxed"
        >
          Aradığınız ürün yayından kaldırılmış, taşınmış veya hiç var olmamış olabilir.
          Koleksiyonlarımızı incelemeye ne dersiniz?
        </motion.p>

        {/* Search bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="w-full max-w-md mb-8"
        >
          <form action="/search" method="get" className="relative">
            <input
              type="search"
              name="q"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ürünlerde ara..."
              className="w-full bg-background/80 backdrop-blur-md border border-glass-border rounded-full py-3 px-5 pr-12 text-foreground placeholder-foreground/40 focus:outline-none focus:border-primary/50 transition-colors"
              aria-label="Ürünlerde ara"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-primary flex items-center justify-center"
              aria-label="Ara"
            >
              <svg className="w-4 h-4 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>
          </form>
        </motion.div>

        {/* Quick links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="flex flex-wrap justify-center gap-3 mb-8"
        >
          {quickLinks.map((link, idx) => (
            <Link
              key={idx}
              href={link.href}
              className="px-4 py-2 bg-foreground/5 border border-glass-border rounded-full text-sm text-foreground/70 hover:text-primary hover:border-primary/30 transition-all font-medium"
            >
              {link.name}
            </Link>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
        >
          <Link
            href="/"
            className="bg-primary text-foreground font-bold px-8 py-4 uppercase tracking-widest text-sm hover:bg-secondary transition-colors clip-angled shadow-[0_0_20px_hsla(var(--primary),0.4)] flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              ></path>
            </svg>
            Ana Sayfaya Dön
          </Link>

          <Link
            href="/search"
            className="bg-foreground/5 text-foreground border border-glass-border font-bold px-8 py-4 uppercase tracking-widest text-sm hover:bg-foreground/10 transition-colors clip-angled flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              ></path>
            </svg>
            Ürünlerde Ara
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
