"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useStore } from "../context/StoreContext";

export default function Footer() {
  const pathname = usePathname();
  const { t } = useStore();

  const handleNewsletter = (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    if (!email) return;
    
    if (typeof window !== 'undefined' && window.Swal) {
      window.Swal.fire({
        icon: 'success',
        title: t("thanks"),
        text: t("newsletter_success"),
        confirmButtonColor: '#ff007f',
        background: '#111',
        color: '#fff'
      });
    } else {
      alert(t("newsletter_success"));
    }
    e.target.reset();
  };

  if (pathname.startsWith("/admin")) return null;

  return (
    <footer id="contact" className="relative bg-black pt-24 pb-12 border-t border-white/10 overflow-hidden">
      {/* Background Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-64 bg-neon-pink opacity-[0.03] rounded-full blur-[100px] pointer-events-none"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Brand Info */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex justify-center mb-8">
              <div className="relative w-[280px] h-[100px]">
                <Image src="/assets/siteimg/cemre park.png" alt="Cemre Park" fill className="object-contain" />
              </div>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mb-6 text-center lg:text-left">
              {t("footer_desc")}
            </p>
            <div className="flex gap-4 justify-center lg:justify-start">
              <a href="https://instagram.com/cemrepark" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-gray-800 flex items-center justify-center text-gray-400 hover:text-neon-pink hover:border-neon-pink transition-all duration-300">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </a>
            </div>
          </div>

          {/* Hızlı Linkler */}
          <div>
            <h4 className="text-white font-bold uppercase tracking-wider mb-6 text-sm">{t("explore")}</h4>
            <ul className="space-y-3">
              <li><Link href="/search" className="text-gray-400 hover:text-white text-sm transition-colors">{t("explore_menu_new")}</Link></li>
              <li><Link href="/search" className="text-gray-400 hover:text-white text-sm transition-colors">{t("explore_menu_best")}</Link></li>
              <li><Link href="/search" className="text-gray-400 hover:text-white text-sm transition-colors">{t("explore_menu_coats")}</Link></li>
              <li><Link href="/search" className="text-gray-400 hover:text-white text-sm transition-colors">{t("explore_menu_accessories")}</Link></li>
            </ul>
          </div>

          {/* Müşteri Hizmetleri & Kurumsal */}
          <div>
            <h4 className="text-white font-bold uppercase tracking-wider mb-6 text-sm">{t("corporate")}</h4>
            <ul className="space-y-3">
              <li><Link href="/kurumsal/hakkimizda" className="text-gray-400 hover:text-white text-sm transition-colors">{t("about_us")}</Link></li>
              <li><Link href="/kurumsal/iletisim" className="text-gray-400 hover:text-white text-sm transition-colors">{t("contact_us")}</Link></li>
              <li><Link href="/kurumsal/mesafeli-satis-sozlesmesi" className="text-gray-400 hover:text-white text-sm transition-colors">{t("distance_selling")}</Link></li>
              <li><Link href="/kurumsal/iade-ve-degisim-kosullari" className="text-gray-400 hover:text-white text-sm transition-colors">{t("return_policy")}</Link></li>
              <li><Link href="/kurumsal/gizlilik-politikasi" className="text-gray-400 hover:text-white text-sm transition-colors">{t("privacy_policy")}</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-white font-bold uppercase tracking-wider mb-6 text-sm">{t("newsletter")}</h4>
            <p className="text-gray-400 text-sm mb-4">{t("newsletter_desc")}</p>
            <form className="relative" onSubmit={handleNewsletter}>
              <input type="email" name="email" required placeholder={t("email_placeholder")} className="w-full bg-transparent border-b border-gray-700 py-3 text-sm text-white focus:outline-none focus:border-holo-gold transition-colors" />
              <button type="submit" className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-500 hover:text-holo-gold transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
              </button>
            </form>
          </div>

        </div>

        {/* Alt Bilgi */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-600 text-xs">
            © {new Date().getFullYear()} Cemre Park. {t("all_rights")} {t("secure_payment_infra")}
          </p>
          <div className="flex gap-4 items-center">
            <span className="text-xs text-gray-500 font-bold uppercase tracking-widest mr-2">{t("secure_100")}</span>
            {/* Using text badges if images are missing */}
            <div className="px-2 py-1 border border-white/20 text-[10px] text-white font-bold rounded">VISA</div>
            <div className="px-2 py-1 border border-white/20 text-[10px] text-white font-bold rounded">MASTERCARD</div>
            <div className="px-2 py-1 border border-white/20 text-[10px] text-white font-bold rounded">TROY</div>
          </div>
        </div>
      </div>
    </footer>
  );
}