"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;

  return (
    <footer id="contact" className="relative bg-black pt-24 pb-12 border-t border-white/10 overflow-hidden">
      {/* Background Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-64 bg-neon-pink opacity-[0.03] rounded-full blur-[100px] pointer-events-none"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Brand Info */}
          <div className="lg:col-span-1">
            <Link href="/" className="inline-block mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full border border-holo-gold flex items-center justify-center p-1 bg-white">
                  <Image src="/assets/siteimg/cemre park.png" alt="Cemre Park" width={32} height={32} className="object-contain" />
                </div>
                <span className="text-xl font-bold tracking-widest text-white uppercase">Cemre Park</span>
              </div>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Modern tesettür giyimde şıklık ve kalitenin adresi. En yeni kap, kaban, tunik ve takım modelleriyle tarzınızı yansıtın.
            </p>
            <div className="flex gap-4">
              <a href="https://instagram.com/cemrepark" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-gray-800 flex items-center justify-center text-gray-400 hover:text-neon-pink hover:border-neon-pink transition-all duration-300">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-full border border-gray-800 flex items-center justify-center text-gray-400 hover:text-holo-gold hover:border-holo-gold transition-all duration-300">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
              </a>
            </div>
          </div>

          {/* Hızlı Linkler */}
          <div>
            <h4 className="text-white font-bold uppercase tracking-wider mb-6 text-sm">Keşfet</h4>
            <ul className="space-y-3">
              <li><Link href="/search" className="text-gray-400 hover:text-white text-sm transition-colors">Yeni Gelenler</Link></li>
              <li><Link href="/search" className="text-gray-400 hover:text-white text-sm transition-colors">Çok Satanlar</Link></li>
              <li><Link href="/search" className="text-gray-400 hover:text-white text-sm transition-colors">Kaban & Ceket</Link></li>
              <li><Link href="/search" className="text-gray-400 hover:text-white text-sm transition-colors">Aksesuar</Link></li>
            </ul>
          </div>

          {/* Müşteri Hizmetleri */}
          <div>
            <h4 className="text-white font-bold uppercase tracking-wider mb-6 text-sm">Hizmetler</h4>
            <ul className="space-y-3">
              <li><Link href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Bize Ulaşın</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Sıkça Sorulan Sorular</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white text-sm transition-colors">İade ve Değişim</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Kargo Takip</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-white font-bold uppercase tracking-wider mb-6 text-sm">Bültene Katıl</h4>
            <p className="text-gray-400 text-sm mb-4">Özel koleksiyonlardan ilk sizin haberiniz olsun.</p>
            <form className="relative">
              <input type="email" placeholder="E-posta Adresiniz" className="w-full bg-transparent border-b border-gray-700 py-3 text-sm text-white focus:outline-none focus:border-holo-gold transition-colors" />
              <button type="button" className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-500 hover:text-holo-gold transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
              </button>
            </form>
          </div>

        </div>

        {/* Alt Bilgi */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-600 text-xs">
            © {new Date().getFullYear()} Cemre Park. Tüm hakları saklıdır.
          </p>
          <div className="flex gap-4">
            <Image src="/assets/img/credit/visa.png" alt="Visa" width={40} height={25} className="opacity-50 grayscale hover:opacity-100 hover:grayscale-0 transition-all" />
            <Image src="/assets/img/credit/mastercard.png" alt="Mastercard" width={40} height={25} className="opacity-50 grayscale hover:opacity-100 hover:grayscale-0 transition-all" />
          </div>
        </div>
      </div>
    </footer>
  );
}