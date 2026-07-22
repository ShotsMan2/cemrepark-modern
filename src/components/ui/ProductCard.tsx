"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import PriceDisplay from "../PriceDisplay";
import FavoriteButton from "../FavoriteButton";
import { useStore } from "@/context/StoreContext";
import { getValidImageUrl } from "@/utils/imageHelper";
import { Product } from "@prisma/client";
import { motion } from "framer-motion";

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
  className?: string;
  delay?: number;
}

export function ProductCard({ product, onQuickView, className = "", delay = 0 }: ProductCardProps) {
  const { t } = useStore();
  const [isHovered, setIsHovered] = React.useState(false);
  const [selectedColor, setSelectedColor] = React.useState(0);

  const p = product as any;
  const colorVariants = p.renkler ? p.renkler.split(",").slice(0, 4) : [];

  const stockValue = typeof p.stok === "number" ? p.stok : parseInt(p.stok || "0") || 0;
  const isInStock = stockValue > 0;
  const isLowStock = stockValue > 0 && stockValue <= 5;

  const discountPercent = p.indirimOrani || p.indirimOrani === 0 ? p.indirimOrani : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: delay / 1000, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={`relative group ${className}`}
    >
      {/* Outer glow on hover */}
      <motion.div
        className="absolute -inset-2 bg-gradient-to-br from-primary/40 via-purple/30 to-secondary/40 rounded-3xl blur-xl opacity-0 pointer-events-none"
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.4 }}
      />

      {/* Main card with gradient border */}
      <div className="relative rounded-2xl overflow-hidden p-[2px] bg-gradient-to-br from-primary/60 via-purple/50 to-secondary/50">
        <div className="relative bg-white dark:bg-[#1a1025] rounded-[14px] overflow-hidden clip-angled">
          {/* Image area */}
          <div className="relative aspect-[3/4] overflow-hidden clip-angled transform-gpu">
            {product.etiket && (
              <div className="absolute top-3 left-3 z-20">
                <span className="text-[10px] font-black uppercase tracking-[0.15em] bg-gradient-to-r from-primary to-purple text-white px-3 py-1.5 clip-angled shadow-lg">
                  {t(product.etiket) as string}
                </span>
              </div>
            )}

            {discountPercent !== null && discountPercent > 0 && (
              <motion.div
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
                className="absolute top-3 right-3 z-20"
              >
                <span className="text-[10px] font-black bg-danger text-white px-2.5 py-1 rounded-full shadow-lg">
                  -%{discountPercent}
                </span>
              </motion.div>
            )}

            <Link href={`/urundetay/${product.id}`} className="absolute inset-0 z-20">
              <Image
                src={getValidImageUrl(product.resim || product.gorsel?.split(",")[0] || "")}
                alt={product.ad}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                className="object-cover transition-transform duration-700 ease-out"
                style={{ transform: isHovered ? "scale(1.08)" : "scale(1)" }}
              />
            </Link>

            {/* Stock indicator */}
            <div className="absolute bottom-3 left-3 right-3 z-20">
              {!isInStock && (
                <span className="block text-[10px] font-black uppercase tracking-widest bg-danger/90 text-white px-3 py-1.5 rounded-full backdrop-blur-sm text-center">
                  {t("out_of_stock")}
                </span>
              )}
              {isLowStock && (
                <span className="block text-[10px] font-black uppercase tracking-widest bg-warning/90 text-white px-3 py-1.5 rounded-full backdrop-blur-sm text-center">
                  {t("low_stock")}
                </span>
              )}
            </div>

            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10" />

            {/* Quick View Button */}
            {onQuickView && (
              <div className="absolute bottom-4 left-0 w-full px-4 flex justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-6 group-hover:translate-y-0 z-30">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    onQuickView(product);
                  }}
                  className="text-[11px] uppercase tracking-[0.15em] font-black text-white bg-white/20 backdrop-blur-md border border-white/30 hover:bg-primary hover:border-primary transition-all px-6 py-3 rounded-full shadow-xl w-full active:scale-95"
                >
                  {t("quick_view") as string}
                </button>
              </div>
            )}
          </div>

          {/* Text area */}
          <div className="p-4">
            <p className="text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-1.5">
              {t(product.kategori) as string}
            </p>
            <Link
              href={`/urundetay/${product.id}`}
              className="block before:absolute before:inset-0 before:z-10"
            >
              <h3 className="text-foreground font-black text-base leading-tight truncate mb-2 hover:text-primary transition-colors">
                {t(product.ad) as string}
              </h3>
            </Link>

            {/* Color Variant Selector */}
            {colorVariants.length > 0 && (
              <div className="flex gap-1.5 mb-3">
                {colorVariants.map((color, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSelectedColor(idx); }}
                    className={`w-4 h-4 rounded-full border-2 transition-all ${
                      idx === selectedColor
                        ? "border-primary scale-125 shadow-md"
                        : "border-foreground/20 opacity-60 hover:opacity-100"
                    }`}
                    style={{ backgroundColor: color.trim() }}
                    aria-label={`Renk ${idx + 1}`}
                  />
                ))}
              </div>
            )}

            <div className="flex justify-between items-center mt-3 pt-3 border-t border-foreground/5">
              <PriceDisplay amount={product.fiyat} className="text-foreground font-black text-lg" />
              <FavoriteButton
                product={product}
                className="relative z-30 transform hover:scale-110 active:scale-90"
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
