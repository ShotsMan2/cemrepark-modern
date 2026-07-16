'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useStore } from '../../context/StoreContext';
import { getValidImageUrl } from '../../utils/imageHelper';
import { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';

export default function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, clearCart, isLoaded, formatPrice, t } = useStore();
  const router = useRouter();
  const { data: session } = useSession();

  useEffect(() => {
    AOS.init({ duration: 800, once: true });
  }, []);

  const totalAmount = cartItems.reduce((acc: number, item: any) => acc + item.fiyat * item.quantity, 0);

  if (!isLoaded) return null;

  return (
    <div className="min-h-screen pt-32 pb-24 bg-gray-50 dark:bg-transparent relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-pink-50 via-white to-gray-50 dark:from-pink-950/20 dark:via-zinc-900/50 dark:to-black/30 -z-10"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <h1 className="text-5xl md:text-6xl font-black mb-12 text-transparent bg-clip-text bg-gradient-to-r from-neon-pink to-holo-gold uppercase tracking-tighter text-center" data-aos="fade-down">
          {t('my_cart')}
        </h1>

        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20" data-aos="zoom-in">
            <div className="w-32 h-32 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md rounded-full shadow-2xl flex items-center justify-center mb-8 border border-white/20 dark:border-white/10 animate-pulse">
              <svg className="w-16 h-16 text-neon-pink opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">{t('cart_empty')}</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8">{t('no_products_found_desc')}</p>
            <Link
              href="/search"
              className="bg-gradient-to-r from-neon-pink to-holo-gold text-white px-10 py-4 rounded-full uppercase tracking-wider text-sm font-bold shadow-lg shadow-neon-pink/30 transition-all duration-300 transform hover:scale-105 active:scale-95"
            >
              {t('explore_collection')}
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-12">
            <div className="w-full lg:w-2/3 space-y-6">
              {cartItems.map((item: any, index: number) => (
                <div key={`${item.id}-${item.beden}-${item.renk}-${index}`} data-aos="fade-right" data-aos-delay={index * 100} className="bg-white/60 dark:bg-zinc-900/40 backdrop-blur-xl p-4 rounded-3xl shadow-lg border border-white/50 dark:border-white/10 flex flex-col sm:flex-row gap-6 items-center group hover:shadow-2xl hover:shadow-neon-pink/10 transition-all duration-300 transform hover:-translate-y-1">
                  
                  <Link href={`/urundetay/${item.id}`} className="relative w-32 h-40 rounded-2xl overflow-hidden shrink-0 shadow-inner">
                    <Image src={getValidImageUrl(item.gorsel)} alt={item.ad} fill className="object-cover group-hover:scale-110 transition-transform duration-500" sizes="128px" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
                  </Link>

                  <div className="flex-1 flex flex-col sm:flex-row justify-between w-full">
                    <div className="flex flex-col gap-2">
                      <Link href={`/urundetay/${item.id}`} className="text-xl font-bold text-gray-900 dark:text-white hover:text-neon-pink transition-colors">
                        {t(item.ad)}
                      </Link>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span className="bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm text-gray-700 dark:text-gray-300 px-4 py-1.5 rounded-full text-xs font-bold border border-gray-100 dark:border-zinc-700 shadow-sm">Beden: {item.beden}</span>
                        <span className="bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm text-gray-700 dark:text-gray-300 px-4 py-1.5 rounded-full text-xs font-bold border border-gray-100 dark:border-zinc-700 shadow-sm">Renk: {t(item.renk)}</span>
                      </div>
                      <div className="text-2xl font-black text-gray-900 dark:text-white mt-2 sm:mt-auto bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300">
                        {formatPrice(item.fiyat * item.quantity)}
                      </div>
                    </div>

                    <div className="flex flex-row sm:flex-col items-center justify-between sm:justify-center gap-4 mt-4 sm:mt-0">
                      <div className="flex items-center bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md rounded-full border border-gray-200 dark:border-white/10 p-1 shadow-sm">
                        <button onClick={() => updateQuantity(item.id, item.beden, item.renk, item.quantity - 1)} className="w-10 h-10 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-neon-pink transition-all font-bold active:scale-90">
                          -
                        </button>
                        <span className="w-10 text-center font-black text-gray-900 dark:text-white text-base">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.beden, item.renk, item.quantity + 1)} className="w-10 h-10 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-neon-pink transition-all font-bold active:scale-90">
                          +
                        </button>
                      </div>
                      <button onClick={() => removeFromCart(item.id, item.beden, item.renk)} className="w-12 h-12 rounded-full bg-red-50/80 dark:bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all duration-300 hover:shadow-lg hover:shadow-red-500/30 active:scale-90 group/btn" title={t('remove')}>
                        <svg className="w-5 h-5 group-hover/btn:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="flex justify-end" data-aos="fade-up">
                <button onClick={() => clearCart()} className="text-sm font-bold text-gray-500 hover:text-red-500 transition-colors flex items-center gap-2 px-4 py-2 rounded-full hover:bg-red-50 dark:hover:bg-red-500/10 active:scale-95">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                  Sepeti Temizle
                </button>
              </div>
            </div>

            <div className="w-full lg:w-1/3" data-aos="fade-left" data-aos-delay="200">
              <div className="bg-white/70 dark:bg-zinc-900/60 backdrop-blur-2xl p-8 rounded-[2rem] shadow-xl border border-white/50 dark:border-white/10 sticky top-32">
                <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 mb-8 uppercase tracking-widest">
                  Sipariş Özeti
                </h3>

                <div className="space-y-4 text-sm font-medium text-gray-600 dark:text-gray-300">
                  <div className="flex justify-between items-center bg-white/50 dark:bg-zinc-800/50 p-4 rounded-2xl">
                    <span>{t('subtotal')}</span>
                    <span className="text-gray-900 dark:text-white font-bold">{formatPrice(totalAmount)}</span>
                  </div>
                  <div className="flex justify-between items-center bg-white/50 dark:bg-zinc-800/50 p-4 rounded-2xl">
                    <span>{t('shipping')}</span>
                    <span className="text-emerald-500 font-black uppercase tracking-wider">{t('free')}</span>
                  </div>
                </div>

                <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-200 dark:via-white/20 to-transparent my-8"></div>

                <div className="flex justify-between items-end mb-10">
                  <span className="text-gray-900 dark:text-white font-black text-xl uppercase tracking-wider">{t('total')}</span>
                  <span className="text-gray-900 dark:text-white font-black text-4xl text-transparent bg-clip-text bg-gradient-to-r from-neon-pink to-holo-gold">{formatPrice(totalAmount)}</span>
                </div>

                <button
                  onClick={() => router.push(session ? '/checkout' : '/login')}
                  className="w-full bg-gradient-to-r from-gray-900 to-black dark:from-white dark:to-gray-200 text-white dark:text-black py-5 rounded-2xl font-black uppercase tracking-[0.2em] hover:shadow-2xl hover:shadow-neon-pink/20 transition-all duration-300 transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3 group"
                >
                  {t('checkout')}
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

