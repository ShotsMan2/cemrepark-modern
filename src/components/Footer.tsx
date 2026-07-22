"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useStore } from "../context/StoreContext";
import React from "react";
import Swal from "sweetalert2";
import { motion } from "framer-motion";

const paymentMethods = [
  { name: "Visa", color: "text-info" },
  { name: "Mastercard", color: "text-warning" },
  { name: "Troy", color: "text-success" },
  { name: "American Express", color: "text-info" },
];

const socialLinks = [
  {
    href: "https://instagram.com/cemrepark",
    label: "Instagram",
    color: "hover:border-primary hover:bg-primary/20 hover:shadow-[0_0_20px_hsla(var(--primary),0.5)]",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
      </svg>
    ),
  },
  {
    href: "https://facebook.com/cemrepark",
    label: "Facebook",
    color: "hover:border-info hover:bg-info/20 hover:shadow-[0_0_20px_hsla(var(--info),0.5)]",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
      </svg>
    ),
  },
  {
    href: "https://twitter.com/cemrepark",
    label: "Twitter/X",
    color: "hover:border-foreground hover:bg-foreground/20 hover:shadow-[0_0_20px_hsla(var(--foreground),0.3)]",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4l11.733 16h4.267l-11.733 -16zM4 20l6.768 -6.768M17.232 6.232l-4.464 4.464"></path>
      </svg>
    ),
  },
  {
    href: "https://pinterest.com/cemrepark",
    label: "Pinterest",
    color: "hover:border-danger hover:bg-danger/20 hover:shadow-[0_0_20px_hsla(var(--danger),0.5)]",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2C8 2 4 5 4 9c0 3 1.5 5 4 6 0-1-.2-2-.4-3-.2-1 0-2 .4-3 .2-.5.2-1 0-1.5-.2-.5-.6-1-1-1.2-1-.6-2 0-2.4.6-.6 1-1 2.4-.6 3.6.2.6.6 1 1 1 .4 0 .8-.2 1-.4.2-.2.4-.6.6-.8.2-.4.6-.6 1-.4.6.2 1 .8 1.2 1.4.2 1 .4 2 .2 3-.2 1-.6 2-1.4 2.6-1 .6-2 .6-3-.2-.6-.4-1-1-1-1.6"></path>
      </svg>
    ),
  },
  {
    href: "https://youtube.com/@cemrepark",
    label: "YouTube",
    color: "hover:border-danger hover:bg-danger/20 hover:shadow-[0_0_20px_hsla(var(--danger),0.5)]",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"></path>
        <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"></polygon>
      </svg>
    ),
  },
];

export default function Footer() {
  const pathname = usePathname();
  const { t, settings } = useStore();

  const handleNewsletter = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const emailInput = form.elements.namedItem("email") as HTMLInputElement;
    const email = emailInput?.value;
    if (!email) return;

    if (typeof window !== "undefined" && Swal) {
      Swal.fire({
        icon: "success",
        title: t("thanks"),
        text: t("newsletter_success"),
        confirmButtonColor: "hsl(var(--primary))",
        background: "hsl(var(--background))",
        color: "hsl(var(--foreground))",
        customClass: {
          popup: "border border-glass-border glass-panel rounded-2xl",
        },
      });
    } else {
      alert(t("newsletter_success"));
    }
    form.reset();
  };

  if (pathname?.startsWith("/admin")) return null;

  return (
    <footer
      id="contact"
      className="relative bg-[#05080f] pt-28 pb-24 lg:pb-12 border-t border-white/10 overflow-hidden text-gray-300"
    >
      {/* Decorative Glows */}
      <div className="absolute top-0 left-1/4 w-full max-w-4xl h-96 bg-primary/10 rounded-full blur-[150px] pointer-events-none mix-blend-screen"></div>
      <div className="absolute bottom-0 right-1/4 w-full max-w-4xl h-96 bg-secondary/10 rounded-full blur-[150px] pointer-events-none mix-blend-screen"></div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-20">
          <div className="lg:col-span-4 lg:pr-8">
            <Link href="/" className="flex justify-center lg:justify-start mb-8">
              <motion.div whileHover={{ scale: 1.05 }} className="relative w-[280px] h-[100px]">
                <Image
                  src="/assets/siteimg/cemre park.png"
                  alt="Cemre Park Logo"
                  fill
                  sizes="280px"
                  className="object-contain brightness-0 invert opacity-90"
                />
              </motion.div>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mb-8 text-center lg:text-left font-light">
              {t("footer_desc")}
            </p>
            <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
              {socialLinks.map((social, idx) => (
                <motion.a
                  key={idx}
                  whileHover={{ scale: 1.1, y: -3 }}
                  whileTap={{ scale: 0.9 }}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-11 h-11 rounded-full border border-white/20 flex items-center justify-center text-gray-300 hover:text-white transition-all duration-300 backdrop-blur-sm ${social.color}`}
                  aria-label={social.label}
                >
                  {social.icon}
                </motion.a>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2">
            <h4 className="text-white font-bold uppercase tracking-widest mb-6 text-sm flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
              {t("explore")}
            </h4>
            <ul className="space-y-4">
              {[
                { name: t("explore_menu_new"), href: "/search" },
                { name: t("explore_menu_best"), href: "/search" },
                { name: t("explore_menu_coats"), href: "/search" },
                { name: t("explore_menu_accessories"), href: "/search" },
              ].map((link, idx) => (
                <li key={idx}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-white text-sm transition-all duration-300 flex items-center group"
                  >
                    <span className="w-0 h-px bg-primary mr-0 group-hover:w-3 group-hover:mr-2 transition-all duration-300"></span>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-3">
            <h4 className="text-white font-bold uppercase tracking-widest mb-6 text-sm flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
              {t("corporate")}
            </h4>
            <ul className="space-y-4">
              {[
                { name: t("about_us"), href: "/kurumsal/hakkimizda" },
                { name: t("contact_us"), href: "/kurumsal/iletisim" },
                { name: t("distance_selling"), href: "/kurumsal/mesafeli-satis-sozlesmesi" },
                { name: t("return_policy"), href: "/kurumsal/iade-ve-degisim-kosullari" },
                { name: t("privacy_policy"), href: "/kurumsal/gizlilik-politikasi" },
              ].map((link, idx) => (
                <li key={idx}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-white text-sm transition-all duration-300 flex items-center group"
                  >
                    <span className="w-0 h-px bg-secondary mr-0 group-hover:w-3 group-hover:mr-2 transition-all duration-300"></span>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-3">
            <h4 className="text-white font-bold uppercase tracking-widest mb-6 text-sm flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent"></span>
              {t("newsletter")}
            </h4>
            <p className="text-gray-400 text-sm mb-6 font-light leading-relaxed">
              {t("newsletter_desc")}
            </p>
            <form className="relative group" onSubmit={handleNewsletter}>
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent rounded-full blur opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
              <div className="relative flex items-center bg-white/5 border border-white/10 rounded-full p-1 backdrop-blur-md transition-colors focus-within:border-primary/50 focus-within:bg-white/10">
                <input
                  type="email"
                  name="email"
                  required
                  placeholder={t("email_placeholder")}
                  aria-label={t("email_placeholder")}
                  className="w-full bg-transparent py-2.5 px-4 text-sm text-white focus:outline-none placeholder-gray-500"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  className="bg-primary hover:bg-primary/90 text-white rounded-full p-2.5 transition-colors shadow-lg"
                  aria-label="Subscribe"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </motion.button>
              </div>
            </form>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-gray-500 text-xs font-light">
            © {new Date().getFullYear()} Cemre Park. {t("all_rights")} {t("secure_payment_infra")}
          </p>
          <div className="flex flex-wrap gap-3 items-center">
            <span className="text-xs text-gray-400 font-bold uppercase tracking-widest mr-2 flex items-center gap-1.5">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-success"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
              {t("secure_100")}
            </span>
            {paymentMethods.map((card) => (
              <div
                key={card.name}
                className={`px-2.5 py-1 bg-white/5 border border-white/10 text-[10px] font-bold rounded shadow-sm backdrop-blur-sm ${card.color}`}
              >
                {card.name}
              </div>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
