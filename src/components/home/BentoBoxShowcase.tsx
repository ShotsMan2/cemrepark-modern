"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { getValidImageUrl } from "../../utils/imageHelper";

import { memo } from "react";
export default memo(function BentoBoxShowcase({ discounted }: { discounted: any[] }) {
  return (
    <section className="py-16 bg-gradient-to-br from-gray-100 via-primary to-purple dark:from-[#0a0a0f] dark:via-[#12081a] dark:to-[#0d0518] text-foreground relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-primary/25 blur-[150px] rounded-full"></div>
        <div className="absolute -bottom-[20%] -right-[10%] w-[50%] h-[50%] bg-purple/25 blur-[150px] rounded-full"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full"></div>
      </div>

      <div className="container-premium relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-auto md:h-[500px]">
          {/* Big Feature (Left, 8 cols) */}
          <motion.div
            className="md:col-span-8 product-card-bg dark:border-purple/30 border-primary/20 relative group overflow-hidden rounded-3xl skeleton"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Image
              src={getValidImageUrl(discounted[0]?.resim || discounted[0]?.gorsel?.split(",")[0])}
              alt="Giyim"
              fill
              className="object-cover opacity-70 group-hover:opacity-100 group-hover:scale-105 transition-all duration-1000 ease-out"
              sizes="(max-width: 768px) 100vw, 66vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent p-8 flex flex-col justify-end">
              <div className="overflow-hidden mb-3">
                <span className="inline-block bg-white text-black px-3 py-1 text-xs font-black uppercase tracking-widest transform translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                  Özel Tasarım
                </span>
              </div>
              <h3 className="text-4xl md:text-5xl font-display font-black text-foreground mb-4 transform translate-y-8 group-hover:translate-y-0 transition-transform duration-500 delay-100">
                Premium Koleksiyon
              </h3>
              <Link
                href="/search"
                className="flex items-center gap-3 text-foreground border-b-2 border-primary pb-2 w-max hover:text-secondary hover:border-secondary transition-colors font-bold uppercase tracking-widest text-sm transform translate-y-8 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500 delay-200"
              >
                Koleksiyonu Keşfet{" "}
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </motion.div>

          {/* Stacked Small Features (Right, 4 cols) */}
          <motion.div
            className="md:col-span-4 flex flex-col gap-6"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="h-1/2 product-card-bg dark:border-purple/30 border-primary/20 relative group overflow-hidden rounded-3xl skeleton">
              <Image
                src={getValidImageUrl(discounted[1]?.resim || discounted[1]?.gorsel?.split(",")[0])}
                alt="Elbise"
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover opacity-60 group-hover:scale-110 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-gradient-to-t from-primary/40 via-purple/20 to-transparent group-hover:from-primary/60 group-hover:via-purple/30 transition-colors duration-500">
                <h4 className="text-2xl font-display font-black text-foreground mb-3">
                  Minimalist
                </h4>
                <Link
                  href="/search"
                  className="glass-frosted text-xs uppercase tracking-[0.2em] font-bold text-foreground px-6 py-2 rounded-full hover:bg-primary hover:text-white transition-all transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 duration-500"
                >
                  Keşfet
                </Link>
              </div>
            </div>

            <div className="h-1/2 product-card-bg dark:border-purple/30 border-primary/20 relative group overflow-hidden rounded-3xl skeleton">
              <Image
                src={getValidImageUrl(discounted[2]?.resim || discounted[2]?.gorsel?.split(",")[0])}
                alt="Tunik"
                fill
                className="object-cover opacity-60 group-hover:scale-110 transition-transform duration-700 ease-out"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-gradient-to-t from-purple/40 via-primary/20 to-transparent group-hover:from-purple/60 group-hover:via-primary/30 transition-colors duration-500">
                <h4 className="text-2xl font-display font-black text-foreground mb-3">
                  Modern Çizgiler
                </h4>
                <Link
                  href="/search"
                  className="glass-frosted text-xs uppercase tracking-[0.2em] font-bold text-foreground px-6 py-2 rounded-full hover:bg-purple hover:text-white transition-all transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 duration-500"
                >
                  Keşfet
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
});
