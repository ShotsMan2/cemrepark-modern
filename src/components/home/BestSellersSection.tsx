"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { ProductCard } from "../ui/ProductCard";

import { memo } from "react";
export default memo(function BestSellersSection({ bestSellers, setQuickViewProduct }: { bestSellers: any[]; setQuickViewProduct: (product: any) => void }) {
  return (
    <section id="collection" className="py-16 relative z-10">
      <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-b from-transparent via-primary/5 to-transparent pointer-events-none"></div>
      <div className="container-premium relative">
        <motion.div
          className="flex flex-col md:flex-row justify-between items-end mb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div>
            <p className="text-secondary tracking-widest text-xs uppercase font-bold mb-2">
              En Çok Tercih Edilenler
            </p>
            <h2 className="text-3xl md:text-4xl font-black text-foreground font-display">
              Trend Ürünler
            </h2>
          </div>
          <Link
            href="/search"
            className="group flex items-center gap-2 text-sm font-bold uppercase tracking-widest hover:text-primary transition-colors mt-4 md:mt-0"
          >
            Tümünü Gör
            <span className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-foreground transition-colors">
              →
            </span>
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-8">
          {bestSellers.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              onQuickView={setQuickViewProduct}
              delay={index * 100}
            />
          ))}
        </div>
      </div>
    </section>
  );
})
