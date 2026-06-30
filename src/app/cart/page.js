"use client";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useStore } from "../../context/StoreContext";

export default function CartPage() {
  const { cartItems, removeFromCart } = useStore();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const totalAmount = cartItems.reduce((acc, item) => acc + (item.fiyat * item.quantity), 0);

  if (!isLoaded) return null;

  return (
    <div className="min-h-[70vh] pt-24 pb-12 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-neon-pink opacity-[0.03] rounded-full blur-[120px] pointer-events-none"></div>

      <div className="container mx-auto px-4 relative z-10">
        <h1 className="text-3xl md:text-5xl font-black mb-12 text-glow-pink uppercase tracking-widest text-center">Alışveriş Sepetim</h1>
        
        {cartItems.length === 0 ? (
          <div className="glass-panel p-12 clip-angled mb-8 flex flex-col items-center justify-center max-w-2xl mx-auto text-center">
            <div className="w-20 h-20 rounded-full border border-gray-700 flex items-center justify-center text-gray-500 mb-6">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Sepetiniz Şu An Boş</h2>
            <p className="text-gray-400 mb-8">Yeni sezon koleksiyonumuzu inceleyerek sepetinizi doldurmaya başlayın.</p>
            <Link href="/search" className="inline-block bg-transparent border border-neon-pink text-neon-pink hover:bg-neon-pink hover:text-white py-3 px-8 uppercase font-bold tracking-widest transition-all duration-300 clip-angled text-sm">
              Alışverişe Başla
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-12 max-w-4xl mx-auto">
            <div className="w-full lg:w-2/3">
              <div className="glass-panel clip-angled p-6 mb-6">
                <div className="hidden md:grid grid-cols-12 gap-4 text-gray-500 text-xs font-bold uppercase tracking-wider mb-4 border-b border-white/10 pb-4">
                  <div className="col-span-6">Ürün</div>
                  <div className="col-span-2 text-center">Adet</div>
                  <div className="col-span-2 text-center">Fiyat</div>
                  <div className="col-span-2 text-center">İşlem</div>
                </div>

                <div className="flex flex-col gap-6">
                  {cartItems.map((item, index) => (
                    <div key={`${item.id}-${item.beden}-${item.renk}-${index}`} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center group">
                      
                      {/* Product Info */}
                      <div className="col-span-1 md:col-span-6 flex gap-4 items-center">
                        <Link href={`/urundetay/${item.id}`} className="relative w-24 h-32 shrink-0 clip-angled overflow-hidden">
                          <Image src={item.gorsel} alt={item.ad} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                        </Link>
                        <div>
                          <Link href={`/urundetay/${item.id}`} className="text-lg font-bold text-white hover:text-neon-pink transition-colors mb-1 block">
                            {item.ad}
                          </Link>
                          <div className="flex items-center gap-3 text-xs text-gray-400">
                            <span className="bg-white/5 px-2 py-1 rounded">Beden: <strong className="text-white">{item.beden}</strong></span>
                            <span className="bg-white/5 px-2 py-1 rounded">Renk: <strong className="text-white">{item.renk}</strong></span>
                          </div>
                        </div>
                      </div>

                      {/* Quantity */}
                      <div className="col-span-1 md:col-span-2 flex justify-start md:justify-center items-center">
                        <span className="md:hidden text-gray-500 text-xs uppercase tracking-wider mr-2">Adet:</span>
                        <div className="text-white font-bold bg-black border border-gray-800 px-4 py-2 clip-angled">
                          {item.quantity}
                        </div>
                      </div>

                      {/* Price */}
                      <div className="col-span-1 md:col-span-2 flex justify-start md:justify-center items-center">
                        <span className="md:hidden text-gray-500 text-xs uppercase tracking-wider mr-2">Fiyat:</span>
                        <div className="text-holo-gold font-bold">
                          {(item.fiyat * item.quantity).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL
                        </div>
                      </div>

                      {/* Remove Button */}
                      <div className="col-span-1 md:col-span-2 flex justify-start md:justify-center items-center">
                        <button onClick={() => removeFromCart(item.id, item.beden, item.renk)} className="text-gray-500 hover:text-neon-pink transition-colors p-2" title="Sepetten Çıkar">
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
                <h3 className="text-xl font-bold text-white mb-6 uppercase tracking-wider">Sipariş Özeti</h3>
                
                <div className="flex justify-between items-center mb-4 text-gray-400">
                  <span>Ara Toplam</span>
                  <span>{totalAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL</span>
                </div>
                
                <div className="flex justify-between items-center mb-6 text-gray-400">
                  <span>Kargo Ücreti</span>
                  <span className="text-green-400">Ücretsiz</span>
                </div>
                
                <div className="h-px w-full bg-white/10 mb-6"></div>
                
                <div className="flex justify-between items-center mb-8">
                  <span className="text-white font-bold text-lg">Toplam</span>
                  <span className="text-glow-gold font-black text-2xl">{totalAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL</span>
                </div>

                <Link 
                  href="/checkout"
                  className="w-full bg-neon-pink text-white hover:bg-white hover:text-neon-pink py-4 uppercase font-bold tracking-widest transition-all duration-300 rounded-lg text-sm flex items-center justify-center gap-2"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                  GÜVENLİ ÖDEME
                </Link>
                
                <div className="mt-6 flex justify-center gap-4 text-gray-500">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
