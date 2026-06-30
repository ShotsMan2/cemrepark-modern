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
    const handleOpenSearch = () => setIsSearchOpen(true);
    
    window.addEventListener('keydown', handleEsc);
    window.addEventListener('open-search', handleOpenSearch);
    
    return () => {
      window.removeEventListener('keydown', handleEsc);
      window.removeEventListener('open-search', handleOpenSearch);
    };
  }, []);

  if (pathname.startsWith("/admin")) return null;

  return (
    <>
      <header className="w-full z-50 transition-all duration-300">
        {/* TOP BAR */}
        <div className="bg-[#111] border-b border-neon-pink text-gray-400 text-[11px] md:text-xs py-2 hidden md:block">
          <div className="w-full px-4 md:px-6 flex justify-between items-center">
            <div className="flex gap-4 items-center">
              <a href="https://wa.me/905541698909" className="flex items-center gap-1.5 hover:text-neon-pink transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                0554 169 89 09
              </a>
              <span className="text-gray-700">|</span>
              <a href="https://instagram.com/cemrepark" className="flex items-center gap-1.5 hover:text-neon-pink transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                @cemrepark
              </a>
            </div>
            <div className="flex gap-4 items-center">
              <a href="https://www.shopier.com/CEMREPARKK" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-white transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
                Shopier Mağaza
              </a>
              <span className="text-gray-700">|</span>
              <span className="text-neon-pink font-bold">Size çok yakışacak! ✨</span>
            </div>
          </div>
        </div>

        {/* LOGO ROW */}
        <div className="bg-[#1a1a1a]/98 border-b border-neon-pink/30 flex justify-center py-4 md:py-6">
          <Link href="/" className="flex items-center group">
            <div className="relative w-[220px] h-[75px] md:w-[360px] md:h-[120px] group-hover:opacity-80 transition-opacity duration-300">
              <Image 
                src="/assets/siteimg/cemre park.png" 
                alt="Cemre Park" 
                fill
                className="object-contain" 
                priority
              />
            </div>
          </Link>
        </div>
      </header>

      {/* MAIN NAV (Original layout) */}
      <div className="w-full glass-panel border-b-0 border-white/5 py-1 sticky top-0 z-[60] shadow-xl">
          <div className="w-full px-4 md:px-6 flex justify-between items-center relative">

            {/* Desktop Menu */}
            <div className="hidden lg:flex items-center gap-6">
              
              {/* Mega Menu Wrapper */}
              <div className="group py-3">
                <Link href="/search" className="text-gray-300 hover:text-neon-pink text-sm uppercase tracking-widest transition-colors font-medium flex items-center gap-1">
                  Koleksiyonlar
                  <svg className="w-4 h-4 group-hover:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </Link>
                
                {/* Mega Menu Dropdown */}
                <div className="absolute top-full left-0 w-full bg-black/95 backdrop-blur-xl border-t border-white/10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 shadow-2xl z-50">
                  <div className="container mx-auto px-4 py-12">
                    <div className="grid grid-cols-4 gap-8">
                      
                      <div>
                        <h3 className="text-white font-bold tracking-widest uppercase mb-6 border-b border-white/10 pb-2">Giyim</h3>
                        <ul className="space-y-4">
                          <li><Link href="/search?q=Takım" className="text-gray-400 hover:text-neon-pink transition-colors text-sm block">İkili Takımlar</Link></li>
                          <li><Link href="/search?q=Elbise" className="text-gray-400 hover:text-neon-pink transition-colors text-sm block">Elbiseler</Link></li>
                          <li><Link href="/search?q=Tunik" className="text-gray-400 hover:text-neon-pink transition-colors text-sm block">Tunikler</Link></li>
                          <li><Link href="/search?q=Pantolon" className="text-gray-400 hover:text-neon-pink transition-colors text-sm block">Pantolonlar</Link></li>
                        </ul>
                      </div>

                      <div>
                        <h3 className="text-white font-bold tracking-widest uppercase mb-6 border-b border-white/10 pb-2">Dış Giyim</h3>
                        <ul className="space-y-4">
                          <li><Link href="/search?q=Ceket" className="text-gray-400 hover:text-holo-gold transition-colors text-sm block">Ceket & Blazer</Link></li>
                          <li><Link href="/search?q=Trenç" className="text-gray-400 hover:text-holo-gold transition-colors text-sm block">Trençkot</Link></li>
                          <li><Link href="/search?q=Kaban" className="text-gray-400 hover:text-holo-gold transition-colors text-sm block">Kaban & Mont</Link></li>
                        </ul>
                      </div>

                      <div className="col-span-2 relative h-48 clip-angled group/img overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-neon-pink/50 to-holo-gold/50 mix-blend-overlay z-10"></div>
                        <Image src="/assets/siteimg/yeni1.jpg" alt="Yeni Sezon" fill className="object-cover group-hover/img:scale-110 transition-transform duration-700" />
                        <div className="absolute inset-0 z-20 p-8 flex flex-col justify-end bg-gradient-to-t from-black/80 to-transparent">
                          <h4 className="text-white font-black text-2xl uppercase tracking-widest">Yeni Sezon</h4>
                          <Link href="/search" className="text-neon-pink text-sm uppercase tracking-widest mt-2 hover:text-white transition-colors">Koleksiyonu Keşfet →</Link>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              </div>

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
        </div>

      {/* Search Popup Area */}
      <div className={`fixed inset-0 bg-black/95 backdrop-blur-xl z-[100] flex items-center justify-center transition-all duration-500 ${isSearchOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className={`w-full max-w-2xl px-4 relative transition-transform duration-500 ${isSearchOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}`}>
          
          {/* Close Button */}
          <button onClick={() => setIsSearchOpen(false)} className="absolute -top-12 right-4 text-gray-500 hover:text-neon-pink transition-colors">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>

          <form role="search" method="get" className="relative group" action="/search">
            <input type="hidden" name="type" value="search" />
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