import Link from "next/link";
import Image from "next/image";

export default function Header() {
  return (
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
        <div className="hidden lg:flex items-center gap-8">
          <Link href="/" className="text-gray-300 hover:text-neon-pink text-sm uppercase tracking-widest transition-colors font-medium">Anasayfa</Link>
          <Link href="/search" className="text-gray-300 hover:text-neon-pink text-sm uppercase tracking-widest transition-colors font-medium">Koleksiyon</Link>
          <Link href="/search" className="text-gray-300 hover:text-neon-pink text-sm uppercase tracking-widest transition-colors font-medium">Kap & Kaban</Link>
          <Link href="#contact" className="text-gray-300 hover:text-neon-pink text-sm uppercase tracking-widest transition-colors font-medium">İletişim</Link>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-6">
          <button className="search-popup-trigger text-gray-300 hover:text-holo-gold transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </button>
          
          <Link href="/favorites" className="text-gray-300 hover:text-neon-pink transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
          </Link>

          <Link href="/cart" className="relative text-gray-300 hover:text-holo-gold transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
            <span className="absolute -top-2 -right-2 bg-neon-pink text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">0</span>
          </Link>

          {/* Mobile Menu Toggle */}
          <button className="lg:hidden text-white" type="button" data-bs-toggle="offcanvas" data-bs-target="#mobileMenu">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          </button>
        </div>
      </div>
    </nav>
  );
}