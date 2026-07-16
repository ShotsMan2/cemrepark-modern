'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useStore } from '../../context/StoreContext';
import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import { getValidImageUrl } from '../../utils/imageHelper';
import AOS from 'aos';
import 'aos/dist/aos.css';

const QuickViewModal = dynamic(() => import('../../components/QuickViewModal'), { ssr: false });

export default function FavoritesPage() {
  const { favoriteItems, removeFromFavorites, isLoaded, t, formatPrice } = useStore();
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  useEffect(() => {
    AOS.init({ duration: 800, once: true });
  }, []);

  if (!isLoaded) return null;

  return (
    <div className="min-h-screen pt-32 pb-24 bg-gray-50 dark:bg-transparent relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-pink-50 via-white to-gray-50 dark:from-pink-950/20 dark:via-zinc-900/50 dark:to-black/30 -z-10"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <h1 className="text-5xl md:text-6xl font-black mb-16 text-transparent bg-clip-text bg-gradient-to-r from-neon-pink to-holo-gold uppercase tracking-tighter text-center" data-aos="fade-down">
          {t('favorites')}
        </h1>

        {favoriteItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20" data-aos="zoom-in">
            <div className="w-40 h-40 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md rounded-full shadow-2xl flex items-center justify-center mb-8 border border-white/20 dark:border-white/10 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-tr from-neon-pink/20 to-holo-gold/20 animate-pulse"></div>
              <svg className="w-16 h-16 text-neon-pink relative z-10 group-hover:scale-125 transition-transform duration-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"></path>
              </svg>
            </div>
            <h2 className="text-3xl font-black text-gray-800 dark:text-white mb-4 tracking-wide">{t('no_favorites')}</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-10 text-center max-w-md text-lg">{t('no_favorites_desc')}</p>
            <Link
              href="/search"
              className="bg-gradient-to-r from-neon-pink to-holo-gold text-white px-12 py-5 rounded-full uppercase tracking-[0.2em] text-sm font-black shadow-xl shadow-neon-pink/30 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-neon-pink/50 active:scale-95"
            >
              {t('explore_collection_btn')}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {favoriteItems.map((product: any, index: number) => (
              <div
                key={product.id}
                className="bg-white/60 dark:bg-zinc-900/40 backdrop-blur-xl rounded-[2rem] shadow-lg hover:shadow-2xl hover:shadow-neon-pink/20 transition-all duration-500 border border-white/50 dark:border-white/10 overflow-hidden group flex flex-col transform hover:-translate-y-2"
                data-aos="fade-up"
                data-aos-delay={(index % 4) * 100}
              >
                <div className="relative h-80 w-full overflow-hidden rounded-t-[2rem]">
                  <Image
                    src={getValidImageUrl(product.gorsel)}
                    alt={t(product.ad)}
                    fill
                    className="object-cover group-hover:scale-110 group-hover:rotate-1 transition-all duration-700 ease-out"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  <div className="absolute top-4 right-4 z-20">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        removeFromFavorites(product.id);
                      }}
                      className="w-12 h-12 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md rounded-full flex items-center justify-center text-neon-pink hover:bg-red-500 hover:text-white transition-all duration-300 shadow-lg hover:shadow-red-500/50 active:scale-90"
                    >
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"></path>
                      </svg>
                    </button>
                  </div>

                  <div className="absolute bottom-6 left-0 w-full px-6 flex justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-8 group-hover:translate-y-0 z-20">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        setQuickViewProduct(product);
                      }}
                      className="bg-white/95 dark:bg-zinc-900/95 text-gray-900 dark:text-white px-8 py-3.5 rounded-full font-black text-xs tracking-[0.2em] uppercase backdrop-blur-xl shadow-xl hover:bg-neon-pink hover:text-white transition-all duration-300 w-full transform active:scale-95"
                    >
                      {t('quick_view')}
                    </button>
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col relative">
                  <h3 className="text-gray-900 dark:text-white font-black text-lg mb-2 truncate group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-neon-pink group-hover:to-holo-gold transition-all duration-300">
                    <Link href={`/urundetay/${product.id}`} className="block relative z-10">{t(product.ad)}</Link>
                  </h3>
                  <div className="mt-auto pt-4 flex items-center justify-between border-t border-gray-200 dark:border-white/10">
                    <span className="text-gray-900 dark:text-white font-black text-2xl tracking-tight group-hover:text-neon-pink transition-colors">
                      {formatPrice(product.fiyat)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {quickViewProduct && (
        <QuickViewModal product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />
      )}
    </div>
  );
}
