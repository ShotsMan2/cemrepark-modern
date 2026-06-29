"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useStore } from "../context/StoreContext";

export default function Header() {
  const pathname = usePathname();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { cartItems, favoriteItems, isLoaded } = useStore();

  // Close search on escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') setIsSearchOpen(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  if (pathname.startsWith("/admin")) return null;

  return (
    <>
      <nav className="fixed w-full z-50 transition-all duration-300 glass-panel border-b-0 border-white/5 py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            {/* A glowing neon ring around the logo */}
            <div className="relative w-12 h-12 rounded-full p-[2px] bg-gradient-to-r from-neon-pink to-holo-gold group-hover:shadow-[0_0_15px_rgba(255,0,127,0.8)] transition-shadow duration-300">
              <div className="w-full h-full bg-white rounded-full flex items-center justify-center overflow-hidden">
                <Image src="/assets/siteimg/cemre park.png" alt="Cemre Park" width={40} height={40} className="object-contain p-1" />
              </div>
            </div>
            <span className="text-xl font-bold tracking-widest text-white uppercase group-hover:text-glow-gold transition-colors">Cemre Park</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center gap-6">
            <Link href="/search" className="text-gray-300 hover:text-neon-pink text-sm uppercase tracking-widest transition-colors font-medium">Tüm Ürünler</Link>
            <Link href="/search?q=Takım" className="text-gray-300 hover:text-neon-pink text-sm uppercase tracking-widest transition-colors font-medium">Takım</Link>
            <Link href="/search?q=Tunik" className="text-gray-300 hover:text-neon-pink text-sm uppercase tracking-widest transition-colors font-medium">Tunik</Link>
            <Link href="/search?q=Ceket" className="text-gray-300 hover:text-neon-pink text-sm uppercase tracking-widest transition-colors font-medium">Ceket</Link>
            <Link href="/search?q=Elbise" className="text-gray-300 hover:text-neon-pink text-sm uppercase tracking-widest transition-colors font-medium">Elbise</Link>
            <Link href="/search?q=Pantolon" className="text-gray-300 hover:text-neon-pink text-sm uppercase tracking-widest transition-colors font-medium">Pantolon</Link>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-6">
            <button onClick={() => setIsSearchOpen(true)} className="text-gray-300 hover:text-holo-gold transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </button>
            
            <Link href="/favorites" className="relative text-gray-300 hover:text-neon-pink transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
              {isLoaded && favoriteItems.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-holo-gold text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full">{favoriteItems.length}</span>
              )}
            </Link>

            <Link href="/cart" className="relative text-gray-300 hover:text-holo-gold transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
              {isLoaded && cartItems.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-neon-pink text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{cartItems.length}</span>
              )}
            </Link>

            {/* Mobile Menu Toggle */}
            <button className="lg:hidden text-white" type="button" data-bs-toggle="offcanvas" data-bs-target="#mobileMenu">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Search Popup Area */}
      <div className={`fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex items-center justify-center transition-all duration-500 ${isSearchOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className={`w-full max-w-2xl px-4 relative transition-transform duration-500 ${isSearchOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}`}>
          
          {/* Close Button */}
          <button onClick={() => setIsSearchOpen(false)} className="absolute -top-12 right-4 text-gray-500 hover:text-neon-pink transition-colors">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>

          <form role="search" method="get" className="relative group" action="/search">
            {/* Glowing underline effect */}
            <div className="absolute -bottom-0.5 left-0 w-full h-[2px] bg-gradient-to-r from-neon-pink to-holo-gold scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
            
            <input type="search" id="search-form" autoFocus={isSearchOpen} className="w-full bg-transparent border-b border-gray-800 py-4 text-2xl text-white focus:outline-none placeholder-gray-700 transition-colors"
                   placeholder="Ürün, kategori arayın..." defaultValue="" name="q" />
            <button type="submit" className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-600 hover:text-holo-gold transition-colors">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </button>
          </form>

          <h5 className="text-gray-500 text-sm tracking-widest uppercase mt-12 mb-6">Popüler Aramalar</h5>

          <ul className="flex flex-wrap gap-3">
            {[
              "Tesettür Elbise", "İkili Takım", "Tunik", "Kap & Kaban", "Pantolon", "Abiye"
            ].map((item, i) => (
              <li key={i}>
                <button onClick={() => { document.getElementById('search-form').value = item; }} type="button" className="inline-block px-4 py-2 border border-gray-800 text-gray-400 text-sm hover:border-neon-pink hover:text-white clip-angled transition-all duration-300">
                  {item}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}