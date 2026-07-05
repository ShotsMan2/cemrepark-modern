"use client";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useStore } from "../../context/StoreContext";
import { getValidImageUrl } from "../../utils/imageHelper";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function CartPage() {
  const { cartItems, removeFromCart, isLoaded, formatPrice, t } = useStore();
  const router = useRouter();
  const { data: session } = useSession();

  const totalAmount = cartItems.reduce((acc, item) => acc + (item.fiyat * item.quantity), 0);

  if (!isLoaded) return null;

  return (
    <div className="min-h-[70vh] pt-24 pb-12 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-neon-pink opacity-[0.03] rounded-full blur-[120px] pointer-events-none"></div>

      <div className="container mx-auto px-4 relative z-10">
        <h1 className="text-3xl md:text-5xl font-black mb-12 text-glow-pink uppercase tracking-widest text-center">{t("my_cart")}</h1>
        
        {cartItems.length === 0 ? (
          <div className="text-center py-20" data-aos="fade-up">
            <div className="w-24 h-24 rounded-full border border-white/10 mx-auto flex items-center justify-center mb-6">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="gray" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">{t("cart_empty")}</h2>
            <p className="text-gray-400 mb-8">{t("no_products_found_desc")}</p>
            <Link href="/search" className="bg-white text-black px-8 py-3 uppercase tracking-widest text-sm font-bold clip-angled hover:bg-neon-pink hover:text-white transition-colors">
              {t("explore_collection")}
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-12 max-w-4xl mx-auto">
            <div className="w-full lg:w-2/3">
              <div className="glass-panel clip-angled p-6 mb-6">
                <div className="hidden md:grid grid-cols-12 gap-4 text-gray-500 text-xs font-bold uppercase tracking-wider mb-4 border-b border-white/10 pb-4">
                  <div className="col-span-6">{t("product_col")}</div>
                  <div className="col-span-2 text-center">{t("quantity_col")}</div>
                  <div className="col-span-2 text-center">{t("price_col")}</div>
                  <div className="col-span-2 text-center">{t("explore")}</div>
                </div>

                <div className="flex flex-col gap-6">
                  {cartItems.map((item, index) => (
                    <div key={`${item.id}-${item.beden}-${item.renk}-${index}`} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center group">
                      
                      {/* Product Info */}
                      <div className="col-span-1 md:col-span-6 flex gap-4 items-center">
                        <Link href={`/urundetay/${item.id}`} className="relative w-24 h-32 shrink-0 clip-angled overflow-hidden">
                          <Image src={getValidImageUrl(item.gorsel)} alt={item.ad} fill className="object-cover group-hover:scale-110 transition-transform duration-500" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
                        </Link>
                        <div>
                          <Link href={`/urundetay/${item.id}`} className="text-lg font-bold text-white hover:text-neon-pink transition-colors mb-1 block">
                            {t(item.ad)}
                          </Link>
                          <div className="flex items-center gap-3 text-xs text-gray-400">
                            <span className="bg-white/5 px-2 py-1 rounded">{t("size")}: <strong className="text-white">{item.beden}</strong></span>
                            <span className="bg-white/5 px-2 py-1 rounded">{t("color")}: <strong className="text-white">{item.renk}</strong></span>
                          </div>
                        </div>
                      </div>

                      {/* Quantity */}
                      <div className="col-span-1 md:col-span-2 flex justify-start md:justify-center items-center">
                        <span className="md:hidden text-gray-500 text-xs uppercase tracking-wider mr-2">{t("quantity_col")}:</span>
                        <div className="text-white font-bold bg-black border border-gray-800 px-4 py-2 clip-angled">
                          {item.quantity}
                        </div>
                      </div>

                      {/* Price */}
                      <div className="col-span-1 md:col-span-2 flex justify-start md:justify-center items-center">
                        <span className="md:hidden text-gray-500 text-xs uppercase tracking-wider mr-2">{t("price_col")}:</span>
                        <span className="text-white font-bold whitespace-nowrap">
                          {formatPrice(item.fiyat * item.quantity)}
                        </span>
                      </div>

                      {/* Remove Button */}
                      <div className="col-span-1 md:col-span-2 flex justify-start md:justify-center items-center">
                        <button onClick={() => removeFromCart(item.id, item.beden, item.renk)} className="text-gray-500 hover:text-neon-pink transition-colors p-2" title={t("remove")}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                        </button>
                      </div>

                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="w-full lg:w-1/3">
              <div className="glass-panel clip-angled p-8 sticky top-32">
                <h3 className="text-xl font-bold text-white mb-6 uppercase tracking-wider">{t("order_summary")}</h3>
                
                <div className="flex justify-between items-center mb-4 text-gray-400">
                  <span>{t("subtotal")}</span>
                  <span>{formatPrice(totalAmount)}</span>
                </div>
                
                <div className="flex justify-between items-center mb-6 text-gray-400">
                  <span>{t("shipping")}</span>
                  <span className="text-green-500 font-bold">{t("free")}</span>
                </div>
                
                <div className="h-px w-full bg-white/10 mb-6"></div>
                
                <div className="flex justify-between items-center mb-8">
                  <span className="text-white font-bold text-lg">{t("total")}</span>
                  <span className="text-white font-bold text-lg">{formatPrice(totalAmount)}</span>
                </div>

                <button 
                  onClick={() => {
                    if (session) {
                      router.push("/checkout");
                    } else {
                      router.push("/login");
                    }
                  }}
                  className="block w-full bg-holo-gold text-black text-center py-4 font-black uppercase tracking-widest hover:bg-white transition-colors clip-angled shadow-[0_0_20px_rgba(255,215,0,0.3)]"
                >
                  {t("checkout")}
                </button>
                
                <div className="mt-6 flex justify-center gap-3">
                  {/* Visa */}
                  <div className="w-14 h-8 bg-white rounded flex items-center justify-center shadow">
                    <span className="text-[#1434CB] font-black italic text-sm tracking-tighter">VISA</span>
                  </div>
                  {/* Mastercard */}
                  <div className="w-14 h-8 bg-[#1a1a1a] border border-white/10 rounded flex items-center justify-center relative overflow-hidden shadow">
                    <svg width="26" height="16" viewBox="0 0 32 20" fill="none">
                      <circle cx="10" cy="10" r="10" fill="#EB001B" />
                      <circle cx="22" cy="10" r="10" fill="#F79E1B" fillOpacity="0.8" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
