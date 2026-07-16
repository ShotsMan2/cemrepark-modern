'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useStore } from '../../context/StoreContext';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import { getValidImageUrl } from '../../utils/imageHelper';

const QuickViewModal = dynamic(() => import('../../components/QuickViewModal'), { ssr: false });

export default function FavoritesPage() {
  const { favoriteItems, removeFromFavorites, isLoaded, t, formatPrice } = useStore();
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  if (!isLoaded) return null;

  return (
    <div className="min-h-screen pt-32 pb-24 bg-gray-50 dark:bg-transparent relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-pink-50 via-white to-gray-50 dark:from-pink-950/20 dark:via-zinc-900/50 dark:to-black/30 -z-10"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <h1 className="text-4xl md:text-5xl font-black mb-12 text-gray-900 dark:text-white uppercase tracking-tight text-center" data-aos="fade-down">
          {t('favorites')}
        </h1>

        {favoriteItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20" data-aos="zoom-in">
            <div className="w-32 h-32 bg-white dark:bg-zinc-900 rounded-full shadow-lg flex items-center justify-center mb-8 border border-gray-100 dark:border-zinc-800">
              <svg className="w-12 h-12 text-pink-300" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">{t('no_favorites')}</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8 text-center max-w-md">{t('no_favorites_desc')}</p>
            <Link
              href="/search"
              className="bg-black text-white px-10 py-4 rounded-full uppercase tracking-wider text-sm font-bold hover:bg-neon-pink hover:shadow-lg hover:shadow-neon-pink/30 transition-all duration-300 transform hover:-translate-y-1"
            >
              {t('explore_collection_btn')}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {favoriteItems.map((product: any, index: number) => (
              <div
                key={product.id}
                className="bg-white dark:bg-zinc-900/50 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-white/10 overflow-hidden group flex flex-col"
                data-aos="fade-up"
                data-aos-delay={(index % 4) * 100}
              >
                <div className="relative h-80 w-full overflow-hidden">
                  <Image
                    src={getValidImageUrl(product.gorsel)}
                    alt={t(product.ad)}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300"></div>
                  
                  <div className="absolute top-4 right-4 z-20">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        removeFromFavorites(product.id);
                      }}
                      className="w-10 h-10 bg-white/90 dark:bg-zinc-900/90 backdrop-blur rounded-full flex items-center justify-center text-neon-pink hover:bg-neon-pink hover:text-white transition-colors shadow-sm"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"></path>
                      </svg>
                    </button>
                  </div>

                  <div className="absolute bottom-4 left-0 w-full px-4 flex justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0 z-20">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        setQuickViewProduct(product);
                      }}
                      className="bg-white/90 dark:bg-zinc-900/90 text-gray-900 dark:text-white px-6 py-2.5 rounded-full font-bold text-sm tracking-wider uppercase backdrop-blur-md shadow-lg hover:bg-neon-pink hover:text-white transition-colors w-full mx-4"
                    >
                      {t('quick_view')}
                    </button>
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-gray-900 dark:text-white font-bold text-lg mb-2 truncate group-hover:text-neon-pink transition-colors">
                    <Link href={`/urundetay/${product.id}`} className="block relative z-10">{t(product.ad)}</Link>
                  </h3>
                  <div className="mt-auto pt-4 flex items-center justify-between border-t border-gray-100 dark:border-white/10">
                    <span className="text-gray-900 dark:text-white font-black text-xl">
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
