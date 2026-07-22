"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useStore } from "../context/StoreContext";
import ThemeToggle from "./ThemeToggle";
import LanguageSwitcher from "./ui/LanguageSwitcher";
import { motion, AnimatePresence } from "framer-motion";

export default function Header() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);

  const {
    cartItems,
    favoriteItems,
    isLoaded,
    language,
    setLanguage,
    currency,
    setCurrency,
    t,
    settings,
  } = useStore();

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 40);

      if (currentScrollY > lastScrollY && currentScrollY > 200) {
        setIsHeaderVisible(false);
      } else {
        setIsHeaderVisible(true);
      }
      setLastScrollY(currentScrollY);

      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (currentScrollY / docHeight) * 100 : 0;
      setScrollProgress(progress);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsSearchOpen(false);
    };
    const handleOpenSearch = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    const handleCustomSearch = () => setIsSearchOpen(true);

    window.addEventListener("keydown", handleEsc);
    window.addEventListener("keydown", handleOpenSearch);
    window.addEventListener("open-search", handleCustomSearch);

    return () => {
      window.removeEventListener("keydown", handleEsc);
      window.removeEventListener("keydown", handleOpenSearch);
      window.removeEventListener("open-search", handleCustomSearch);
    };
  }, []);

  if (pathname.startsWith("/admin")) return null;

  return (
    <>
      {/* Scroll Progress Bar */}
      <div className="fixed top-0 left-0 z-[9999] w-full h-[3px] bg-transparent pointer-events-none">
        <div
          className="h-full bg-gradient-to-r from-[#e11c8e] via-[#a855f7] to-[#7B1FA2] transition-all duration-150 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      <header
        className={`w-full z-50 transition-all duration-500 ${
          isHeaderVisible ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        {/* SCROLLING ANNOUNCEMENT BAR */}
        <div className="bg-gradient-to-r from-[#e11c8e] via-[#c026d3] to-[#7B1FA2] text-white text-[10px] md:text-[11px] font-bold py-2 overflow-hidden shadow-lg border-b border-white/10">
          <div className="w-full whitespace-nowrap animate-marquee hover-pause flex gap-12 md:gap-24 min-w-max drop-shadow-md">
            <span className="flex items-center gap-2">
              <span className="text-white/90">✨</span> {t("discover_new_season")}
            </span>
            <span className="flex items-center gap-2">
              <span className="text-white/90">🚀</span> {t("free_shipping")}
            </span>
            <span className="flex items-center gap-2">
              <span className="text-white/90">🎁</span> {t("discount")}
            </span>
            <span className="flex items-center gap-2">
              <span className="text-white/90">💳</span> {t("installment")}
            </span>

            <span className="flex items-center gap-2">
              <span className="text-white/90">✨</span> {t("discover_new_season")}
            </span>
            <span className="flex items-center gap-2">
              <span className="text-white/90">🚀</span> {t("free_shipping")}
            </span>
            <span className="flex items-center gap-2">
              <span className="text-white/90">🎁</span> {t("discount")}
            </span>
            <span className="flex items-center gap-2">
              <span className="text-white/90">💳</span> {t("installment")}
            </span>
          </div>
        </div>

        {/* TOP BAR */}
        <div className="bg-background/90 dark:bg-background/90 backdrop-blur-2xl border-b border-foreground/5 text-foreground/70 text-[11px] md:text-xs py-2.5 hidden md:block transition-colors duration-300">
          <div className="w-full max-w-screen-2xl mx-auto px-4 md:px-8 flex justify-between items-center">
            <div className="flex gap-6 items-center font-medium tracking-wide">
              <a
                href={`https://wa.me/90${(settings?.destekTelefonu || "0554 169 89 09").replace(/\s+/g, "")}`}
                className="flex items-center gap-1.5 hover:text-primary transition-colors"
                aria-label={t("support_whatsapp") || "WhatsApp Destek"}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                </svg>
                {settings?.destekTelefonu || "0554 169 89 09"}
              </a>
              <span className="text-foreground/20">|</span>
              <a
                href="https://instagram.com/cemrepark"
                className="flex items-center gap-1.5 hover:text-primary transition-colors"
                aria-label="Instagram"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
                @cemrepark
              </a>
              <span className="text-foreground/20">|</span>
              <div className="flex gap-2 items-center">
                <LanguageSwitcher />
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="bg-transparent border-none text-foreground/70 text-[11px] focus:outline-none cursor-pointer uppercase font-bold hover:text-primary transition-colors"
                  aria-label="Currency"
                >
                  <option className="bg-background text-foreground" value="TL">
                    ₺ TRY
                  </option>
                  <option className="bg-background text-foreground" value="USD">
                    $ USD
                  </option>
                  <option className="bg-background text-foreground" value="EUR">
                    € EUR
                  </option>
                </select>
              </div>
            </div>
            <div className="flex gap-4 items-center font-medium tracking-wide">
              <a
                href="https://www.shopier.com/CEMREPARKK"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 hover:text-primary transition-colors"
                aria-label="Shopier Store"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <path d="M16 10a4 4 0 0 1-8 0"></path>
                </svg>
                {t("shopier_store")}
              </a>
              <span className="text-foreground/20">|</span>
              <span className="text-gradient font-bold">{t("suits_you_well")}</span>
            </div>
          </div>
        </div>

        {/* LOGO ROW */}
        <div className="bg-background dark:bg-background flex justify-center py-6 shadow-sm transition-colors duration-300 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-32 bg-primary/10 rounded-full blur-[80px] pointer-events-none"></div>
          <Link href="/" className="flex items-center group relative z-10">
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
              className="relative w-[220px] h-[75px] md:w-[360px] md:h-[120px]"
            >
              <Image
                src="/assets/siteimg/cemre park.png"
                alt="Cemre Park Logo"
                fill
                sizes="(max-width: 768px) 220px, 360px"
                className="object-contain"
                priority
              />
            </motion.div>
          </Link>
        </div>
      </header>

      {/* MAIN NAV (Sticky) */}
      <div
        className={`w-full backdrop-blur-2xl border-b transition-all duration-500 sticky top-0 z-[60] ${
          isScrolled
            ? "bg-white/80 dark:bg-[#120a10]/80 shadow-[0_4px_30px_rgba(0,0,0,0.1)] border-foreground/10 py-3"
            : "bg-white/95 dark:bg-[#120a10]/95 shadow-sm border-foreground/5 py-4"
        }`}
      >
        <div className="w-full max-w-screen-2xl mx-auto px-4 md:px-8 flex justify-between items-center relative">
          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center gap-8">
            {/* Mega Menu Wrapper */}
            <div
              className="relative"
              onMouseEnter={() => setIsMegaMenuOpen(true)}
              onMouseLeave={() => setIsMegaMenuOpen(false)}
            >
              <Link
                href="/search"
                className="text-foreground hover:text-primary text-sm uppercase tracking-widest transition-all duration-300 font-bold flex items-center gap-1.5"
              >
                {t("collections_menu")}
                <motion.svg
                  animate={{ rotate: isMegaMenuOpen ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </motion.svg>
              </Link>

              {/* Mega Menu Dropdown */}
              <AnimatePresence>
                {isMegaMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 15, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.98 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute top-full left-0 w-[800px] mt-6 glass-panel rounded-2xl shadow-elevated overflow-hidden z-50 border border-glass-border"
                  >
                    <div className="grid grid-cols-3 gap-8 p-10 bg-background/50 dark:bg-background/50">
                      <div>
                        <h3 className="text-foreground font-bold tracking-widest uppercase mb-6 text-sm flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-primary"></span>
                          {t("menu_clothing")}
                        </h3>
                        <ul className="space-y-4">
                          {[
                            { name: t("menu_two_piece"), q: "Takım" },
                            { name: t("menu_dresses"), q: "Elbise" },
                            { name: t("menu_tunics"), q: "Tunik" },
                            { name: t("menu_trousers"), q: "Pantolon" },
                          ].map((item, idx) => (
                            <motion.li key={idx} whileHover={{ x: 5 }}>
                              <Link
                                href={`/search?q=${item.q}&view=category`}
                                className="text-foreground/70 hover:text-primary transition-colors text-sm font-medium flex items-center"
                              >
                                {item.name}
                              </Link>
                            </motion.li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h3 className="text-foreground font-bold tracking-widest uppercase mb-6 text-sm flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-secondary"></span>
                          {t("menu_outerwear")}
                        </h3>
                        <ul className="space-y-4">
                          {[
                            { name: t("menu_jacket_blazer"), q: "Ceket" },
                            { name: t("menu_trench"), q: "Trenç" },
                            { name: t("menu_coat_jacket"), q: "Kaban" },
                          ].map((item, idx) => (
                            <motion.li key={idx} whileHover={{ x: 5 }}>
                              <Link
                                href={`/search?q=${item.q}&view=category`}
                                className="text-foreground/70 hover:text-secondary transition-colors text-sm font-medium flex items-center"
                              >
                                {item.name}
                              </Link>
                            </motion.li>
                          ))}
                        </ul>
                      </div>

                      <div className="relative h-64 rounded-xl overflow-hidden group/img shadow-md">
                        <div className="absolute inset-0 bg-gradient-to-tr from-primary/40 to-secondary/40 mix-blend-overlay z-10 transition-opacity duration-500 group-hover/img:opacity-70"></div>
                        <Image
                          src="/assets/siteimg/yeni1.jpg"
                          alt="Yeni Sezon"
                          fill
                          sizes="(max-width: 1024px) 100vw, 30vw"
                          className="object-cover group-hover/img:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 z-20 p-6 flex flex-col justify-end bg-gradient-to-t from-black/80 via-black/20 to-transparent">
                          <h4 className="text-white font-black text-2xl uppercase tracking-widest drop-shadow-lg">
                            {t("new_season")}
                          </h4>
                          <Link
                            href="/search"
                            className="inline-flex items-center gap-2 text-primary text-sm uppercase tracking-widest mt-3 hover:text-white transition-colors font-bold group/link"
                          >
                            {t("discover_collection")}
                            <motion.span className="inline-block" whileHover={{ x: 5 }}>
                              →
                            </motion.span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {[
              { name: t("sets"), q: "Takım" },
              { name: t("tunics"), q: "Tunik" },
              { name: t("jackets"), q: "Ceket" },
              { name: t("dresses"), q: "Elbise" },
              { name: t("trousers"), q: "Pantolon" },
            ].map((link, i) => (
              <Link
                key={i}
                href={`/search?q=${link.q}&view=category`}
                className="relative text-foreground/80 hover:text-primary text-sm uppercase tracking-widest transition-colors font-medium group"
              >
                {link.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full rounded-full"></span>
              </Link>
            ))}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-6">
            <ThemeToggle />
            {/* Auth Links */}
            <div className="hidden lg:flex items-center gap-4 text-sm font-medium">
              {status === "loading" ? null : session ? (
                <Link
                  href="/hesabim"
                  className="text-foreground/80 hover:text-primary transition-colors uppercase tracking-widest inline-block relative group"
                >
                  {t("my_account")}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full rounded-full"></span>
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-foreground/80 hover:text-primary transition-colors uppercase tracking-widest inline-block relative group"
                  >
                    {t("login")}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full rounded-full"></span>
                  </Link>
                  <div className="w-px h-4 bg-foreground/20"></div>
                  <Link
                    href="/register"
                    className="text-secondary hover:text-primary transition-colors uppercase tracking-widest font-bold inline-block"
                  >
                    {t("register")}
                  </Link>
                </>
              )}
            </div>

            <motion.button
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsSearchOpen(true)}
              className="text-foreground/70 hover:text-primary transition-colors relative"
              aria-label="Open Search"
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <kbd className="hidden md:inline absolute -bottom-4 left-1/2 -translate-x-1/2 text-[8px] text-foreground/30 font-mono border border-foreground/10 rounded px-1 leading-tight whitespace-nowrap">
                ⌘K
              </kbd>
            </motion.button>

            <Link href="/favorites" aria-label="Favorites" className="relative group">
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-foreground/70 group-hover:text-primary transition-colors"
                >
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
              </motion.div>
              <AnimatePresence>
                {isLoaded && favoriteItems.length > 0 && (
                  <motion.span
                    key="favorite-badge"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-2 -right-2 bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-md"
                  >
                    {favoriteItems.length}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>

            <Link href="/cart" aria-label="Cart" className="relative group">
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                animate={cartItems.length > 0 ? {
                  scale: [1, 1.15, 1],
                  transition: { duration: 0.5, ease: "easeInOut" },
                } : {}}
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-foreground/70 group-hover:text-primary transition-colors"
                >
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <path d="M16 10a4 4 0 0 1-8 0"></path>
                </svg>
              </motion.div>
              <AnimatePresence>
                {isLoaded && cartItems.length > 0 && (
                  <motion.span
                    key="cart-badge"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-2 -right-2 bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-md"
                  >
                    {cartItems.length}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>

            {/* Mobile Language Switcher */}
            <div className="lg:hidden flex items-center">
              <LanguageSwitcher />
            </div>

            {/* Mobile Menu Toggle */}
            <button
              className="lg:hidden text-foreground/70 hover:text-primary"
              type="button"
              aria-label="Toggle Mobile Menu"
              data-bs-toggle="offcanvas"
              data-bs-target="#mobileMenu"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-background/90 dark:bg-background/90 backdrop-blur-2xl border-t border-foreground/10 safe-area-bottom">
        <div className="flex items-center justify-around py-2 px-2">
          {[
            { href: "/", label: t("home"), icon: "home" },
            { href: "/search", label: t("search"), icon: "search" },
            { href: "/favorites", label: t("favorites"), icon: "heart", badge: isLoaded ? favoriteItems.length : 0 },
            { href: "/cart", label: t("cart"), icon: "cart", badge: isLoaded ? cartItems.length : 0 },
            { href: session ? "/hesabim" : "/login", label: t("account"), icon: "user" },
          ].map((item, idx) => (
            <Link
              key={idx}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-colors relative ${
                pathname === item.href ? "text-primary" : "text-foreground/60 hover:text-foreground/80"
              }`}
            >
              {item.icon === "home" && (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              )}
              {item.icon === "search" && (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              )}
              {item.icon === "heart" && (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              )}
              {item.icon === "cart" && (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
              )}
              {item.icon === "user" && (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                </svg>
              )}
              <span className="text-[10px] font-medium">{item.label}</span>
              {(item.badge ?? 0) > 0 && (
                <span className="absolute -top-0.5 right-1 bg-primary text-white text-[8px] font-bold min-w-[16px] h-4 flex items-center justify-center rounded-full px-1 shadow-md">
                  {item.badge}
                </span>
              )}
            </Link>
          ))}
        </div>
      </div>

      {/* Search Popup Area */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 glass-panel backdrop-blur-2xl z-[100] flex items-center justify-center bg-background/80"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-full max-w-2xl px-4 relative"
            >
              {/* Close Button */}
              <button
                onClick={() => setIsSearchOpen(false)}
                className="absolute -top-16 right-4 text-foreground/50 hover:text-primary transition-colors bg-background/50 p-2 rounded-full backdrop-blur-md"
                aria-label="Close Search"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>

              <form role="search" method="get" className="relative group" action="/search">
                <input type="hidden" name="type" value="search" />
                <div className="absolute -bottom-0.5 left-0 w-full h-[3px] bg-gradient-to-r from-primary via-accent to-secondary scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left rounded-full"></div>

                <input
                  type="search"
                  id="search-form"
                  autoFocus={isSearchOpen}
                  className="w-full bg-transparent border-b border-foreground/20 py-4 pr-12 text-3xl font-light text-foreground focus:outline-none placeholder-foreground/30 transition-colors [&::-webkit-search-cancel-button]:cursor-pointer"
                  placeholder={t("search_placeholder")}
                  aria-label="Search"
                  defaultValue=""
                  name="q"
                />
                <button
                  type="submit"
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-foreground/50 hover:text-primary transition-colors"
                  aria-label="Submit Search"
                >
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                </button>
              </form>

              <h5 className="text-foreground/50 font-bold text-sm tracking-widest uppercase mt-12 mb-6 flex items-center gap-2">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                  <polyline points="17 6 23 6 23 12"></polyline>
                </svg>
                {t("popular_searches")}
              </h5>

              <ul className="flex flex-wrap gap-3">
                {[
                  { label: "search_hijab_dress", value: "Tesettür Elbise" },
                  { label: "search_two_piece", value: "İkili Takım" },
                  { label: "search_tunic", value: "Tunik" },
                  { label: "search_coat", value: "Kap & Kaban" },
                  { label: "search_trousers", value: "Pantolon" },
                  { label: "search_evening_dress", value: "Abiye" },
                ].map((item, i) => (
                  <motion.li key={i} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <button
                      onClick={() => {
                        const el = document.getElementById("search-form") as HTMLInputElement;
                        if (el) el.value = t(item.label) as string;
                      }}
                      type="button"
                      className="inline-block px-5 py-2.5 bg-background/50 border border-foreground/10 text-foreground/70 text-sm font-medium rounded-full hover:border-primary hover:text-primary hover:bg-primary/5 transition-all shadow-sm"
                    >
                      {t(item.label)}
                    </button>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
