'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useStore } from '../../context/StoreContext';
import { getValidImageUrl } from '../../utils/imageHelper';

export default function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, clearCart, isLoaded, formatPrice, t } = useStore();
  const router = useRouter();
  const { data: session } = useSession();

  const totalAmount = cartItems.reduce((acc: number, item: any) => acc + item.fiyat * item.quantity, 0);

  if (!isLoaded) return null;

  return (
    <div className="min-h-screen pt-32 pb-24 bg-gray-50 dark:bg-transparent relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-pink-50 via-white to-gray-50 dark:from-pink-950/20 dark:via-zinc-900/50 dark:to-black/30 -z-10"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <h1 className="text-4xl md:text-5xl font-black mb-12 text-gray-900 dark:text-white uppercase tracking-tight text-center" data-aos="fade-down">
          {t('my_cart')}
        </h1>

        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20" data-aos="zoom-in">
            <div className="w-32 h-32 bg-white dark:bg-zinc-900 rounded-full shadow-lg flex items-center justify-center mb-8 border border-gray-100 dark:border-zinc-800">
              <svg className="w-12 h-12 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">{t('cart_empty')}</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8">{t('no_products_found_desc')}</p>
            <Link
              href="/search"
              className="bg-black text-white px-10 py-4 rounded-full uppercase tracking-wider text-sm font-bold hover:bg-neon-pink hover:shadow-lg hover:shadow-neon-pink/30 transition-all duration-300 transform hover:-translate-y-1"
            >
              {t('explore_collection')}
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-12">
            <div className="w-full lg:w-2/3 space-y-6" data-aos="fade-right">
              {cartItems.map((item: any, index: number) => (
                <div key={`${item.id}-${item.beden}-${item.renk}-${index}`} className="bg-white dark:bg-zinc-900/50 p-4 rounded-3xl shadow-sm border border-gray-100 dark:border-white/10 flex flex-col sm:flex-row gap-6 items-center group hover:shadow-md transition-shadow">
                  
                  <Link href={`/urundetay/${item.id}`} className="relative w-32 h-40 rounded-2xl overflow-hidden shrink-0">
                    <Image src={getValidImageUrl(item.gorsel)} alt={item.ad} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="128px" />
                  </Link>

                  <div className="flex-1 flex flex-col sm:flex-row justify-between w-full">
                    <div className="flex flex-col gap-2">
                      <Link href={`/urundetay/${item.id}`} className="text-lg font-bold text-gray-900 dark:text-white hover:text-neon-pink transition-colors">
                        {t(item.ad)}
                      </Link>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span className="bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300 px-3 py-1 rounded-full text-xs font-medium">Beden: {item.beden}</span>
                        <span className="bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300 px-3 py-1 rounded-full text-xs font-medium">Renk: {t(item.renk)}</span>
                      </div>
                      <div className="text-xl font-black text-gray-900 dark:text-white mt-2 sm:mt-auto">
                        {formatPrice(item.fiyat * item.quantity)}
                      </div>
                    </div>

                    <div className="flex flex-row sm:flex-col items-center justify-between sm:justify-center gap-4 mt-4 sm:mt-0">
                      <div className="flex items-center bg-gray-50 dark:bg-zinc-950/50 rounded-full border border-gray-200 dark:border-white/10 p-1">
                        <button onClick={() => updateQuantity(item.id, item.beden, item.renk, item.quantity - 1)} className="w-8 h-8 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-zinc-800 hover:shadow transition-all font-bold">
                          -
                        </button>
                        <span className="w-8 text-center font-bold text-gray-900 dark:text-white text-sm">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.beden, item.renk, item.quantity + 1)} className="w-8 h-8 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-zinc-800 hover:shadow transition-all font-bold">
                          +
                        </button>
                      </div>
                      <button onClick={() => removeFromCart(item.id, item.beden, item.renk)} className="w-10 h-10 rounded-full bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors" title={t('remove')}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="flex justify-end">
                <button onClick={() => clearCart()} className="text-sm font-bold text-gray-500 hover:text-red-500 transition-colors flex items-center gap-2">
                  Sepeti Temizle
                </button>
              </div>
            </div>

            <div className="w-full lg:w-1/3" data-aos="fade-left" data-aos-delay="200">
              <div className="bg-white dark:bg-zinc-900/50 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-white/10 sticky top-32">
                <h3 className="text-xl font-black text-gray-900 dark:text-white mb-8 uppercase tracking-wide">
                  Sipariş Özeti
                </h3>

                <div className="space-y-4 text-sm font-medium text-gray-600 dark:text-gray-300">
                  <div className="flex justify-between items-center">
                    <span>{t('subtotal')}</span>
                    <span className="text-gray-900 dark:text-white">{formatPrice(totalAmount)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>{t('shipping')}</span>
                    <span className="text-emerald-500 font-bold">{t('free')}</span>
                  </div>
                </div>

                <div className="h-px w-full bg-gray-100 dark:bg-white/10 my-6"></div>

                <div className="flex justify-between items-center mb-8">
                  <span className="text-gray-900 dark:text-white font-black text-lg">{t('total')}</span>
                  <span className="text-gray-900 dark:text-white font-black text-2xl text-neon-pink">{formatPrice(totalAmount)}</span>
                </div>

                <button
                  onClick={() => router.push(session ? '/checkout' : '/login')}
                  className="w-full bg-black text-white py-4 rounded-xl font-bold uppercase tracking-wider hover:bg-neon-pink hover:shadow-lg hover:shadow-neon-pink/30 transition-all transform hover:-translate-y-1"
                >
                  {t('checkout')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
