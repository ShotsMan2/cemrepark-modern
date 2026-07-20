"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { ProductCard } from "../ui/ProductCard";
import { memo } from "react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 15,
    },
  },
};

export default memo(function BestSellersSection({
  bestSellers,
  setQuickViewProduct,
}: {
  bestSellers: any[];
  setQuickViewProduct: (product: any) => void;
}) {
  return (
    <motion.section
      id="collection"
      className="py-16 relative z-10"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
    >
      <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-b from-transparent via-primary/5 to-transparent pointer-events-none"></div>
      <div className="container-premium relative">
        <motion.div
          className="flex flex-col md:flex-row justify-between items-end mb-10"
          variants={itemVariants}
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

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-8"
          variants={containerVariants}
        >
          {bestSellers.map((product, index) => (
            <motion.div key={product.id} variants={itemVariants}>
              <ProductCard
                product={product}
                onQuickView={setQuickViewProduct}
                delay={index * 100}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
});
