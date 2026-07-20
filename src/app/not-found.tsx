"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function NotFound() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-[80vh] flex items-center justify-center relative overflow-hidden bg-background">
      {/* Background Decorative Elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary opacity-5 rounded-full blur-[150px] pointer-events-none"></div>
      
      <div className="container-premium relative z-10 flex flex-col items-center text-center">
        <h1 className="text-9xl md:text-[150px] font-black text-transparent bg-clip-text bg-gradient-to-br from-primary to-secondary animate-pulse-glow leading-none mb-4 tracking-tighter">
          404
        </h1>
        
        <div className="glass-panel px-6 py-2 rounded-full mb-8 border border-primary/20">
          <span className="text-sm font-bold uppercase tracking-widest text-primary">Sayfa Bulunamadı</span>
        </div>

        <h2 className="text-3xl md:text-4xl font-display font-black text-foreground mb-6">
          Aradığınız Sayfayı Bulamadık
        </h2>
        
        <p className="text-foreground/60 text-lg max-w-lg mb-10 leading-relaxed">
          Aradığınız ürün yayından kaldırılmış, taşınmış veya hiç var olmamış olabilir. Koleksiyonlarımızı incelemeye ne dersiniz?
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Link 
            href="/"
            className="bg-primary text-foreground font-bold px-8 py-4 uppercase tracking-widest text-sm hover:bg-secondary transition-colors clip-angled shadow-[0_0_20px_hsla(var(--primary),0.4)] flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            Ana Sayfaya Dön
          </Link>
          
          <Link 
            href="/search"
            className="bg-foreground/5 text-foreground border border-glass-border font-bold px-8 py-4 uppercase tracking-widest text-sm hover:bg-foreground/10 transition-colors clip-angled flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            Ürünlerde Ara
          </Link>
        </div>
      </div>
    </div>
  );
}
