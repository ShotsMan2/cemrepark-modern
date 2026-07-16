'use client';
import { useState, useEffect, useCallback, useRef, useTransition } from 'react';
import Image from 'next/image';
import { ProductSkeleton } from '../../components/ui/ProductSkeleton';
import Link from 'next/link';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';
import FavoriteButton from '../../components/FavoriteButton';
import InstantFilter from '../../components/InstantFilter';
import { useStore } from '../../context/StoreContext';
import { getValidImageUrl } from '../../utils/imageHelper';
import enDict from '../../utils/locales/en.json';

const QuickViewModal = dynamic(() => import('../../components/QuickViewModal'), { ssr: false });

export default function SearchClient({ initialResults, query, isSearch }: { initialResults: any[], query: string, isSearch: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { formatPrice, t } = useStore();
  const [results, setResults] = useState(initialResults);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  
  const [localQuery, setLocalQuery] = useState(query);
  const PAGE_SIZE = 12;
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [isPending, startTransition] = useTransition();
  const loaderRef = useRef(null);

  const colors = ['Siyah', 'Beyaz', 'Kırmızı', 'Lacivert', 'Bej'];
  const sizes = ['XS', 'S', 'M', 'L', 'XL'];
  const categories = [...new Set(initialResults.map(p => p.kategori).filter(Boolean))] as string[];

  const handleFilterChange = (filters: any) => {
    let filtered = initialResults;
    if (filters.category) {
      filtered = filtered.filter(p => p.kategori === filters.category);
    }
    if (filters.minPrice || filters.maxPrice < 10000) {
      filtered = filtered.filter(p => p.fiyat >= filters.minPrice && p.fiyat <= filters.maxPrice);
    }
    if (filters.color) {
      filtered = filtered.filter(p => p.renk && p.renk.toLowerCase().includes(filters.color.toLowerCase()));
    }
    if (filters.size) {
      filtered = filtered.filter(p => p.beden && p.beden.toUpperCase().includes(filters.size.toUpperCase()));
    }
    if (filters.inStock) {
      filtered = filtered.filter(p => p.stok > 0);
    }
    
    if (localQuery.trim().length > 0) {
      const q = localQuery.toLowerCase();
      filtered = filtered.filter(p => {
        const adTurkish = p.ad ? p.ad.toLowerCase() : '';
        const kategoriTurkish = p.kategori ? p.kategori.toLowerCase() : '';
        const adTranslated = t(p.ad) ? t(p.ad).toLowerCase() : '';
        return adTurkish.includes(q) || kategoriTurkish.includes(q) || adTranslated.includes(q);
      });
    }

    setResults(filtered);
    setVisibleCount(PAGE_SIZE);
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && visibleCount < results.length && !isPending) {
          startTransition(() => setVisibleCount(prev => prev + PAGE_SIZE));
        }
      },
      { rootMargin: '200px' }
    );
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [visibleCount, results.length, isPending]);

  return (
    <div className="container mx-auto px-4 relative z-10">
      <div className="bg-white dark:bg-zinc-900/50 p-8 rounded-3xl shadow-sm mb-12 text-center border border-gray-100 dark:border-white/10" data-aos="fade-down">
        <h1 className="text-3xl md:text-5xl font-black mb-4 uppercase tracking-widest text-gray-900 dark:text-white">
          {isSearch ? `${t('search_results')}: "${query}"` : t('collection')}
        </h1>
        {isSearch && <p className="text-gray-500 dark:text-gray-400">{t('total_products_listed', { count: results.length })}</p>}
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-1/4">
          <div className="sticky top-32">
             <InstantFilter categories={categories} colors={colors} sizes={sizes} onFilterChange={handleFilterChange} />
          </div>
        </div>

        <div className="w-full lg:w-3/4 min-h-screen">
          {results.length === 0 ? (
            <div className="bg-white dark:bg-zinc-900/50 p-12 rounded-3xl flex flex-col items-center justify-center text-center shadow-sm border border-gray-100 dark:border-white/10">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('no_products_found')}</h2>
              <p className="text-gray-500 dark:text-gray-400">{t('no_products_found_desc')}</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {results.slice(0, visibleCount).map((product, index) => (
                  <div key={product.id} className="bg-white dark:bg-zinc-900/50 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-white/10 overflow-hidden group flex flex-col" data-aos="fade-up" data-aos-delay={(index % 3) * 100}>
                    <div className="relative h-80 w-full overflow-hidden">
                      <Image
                        src={getValidImageUrl(product.resim || product.gorsel?.split(',')[0])}
                        alt={t(product.ad)}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300"></div>
                      
                      <div className="absolute top-4 right-4 z-20">
                         <FavoriteButton product={product} className="" />
                      </div>

                      <div className="absolute bottom-4 left-0 w-full px-4 flex justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0 z-20">
                        <button
                          onClick={(e) => { e.preventDefault(); setQuickViewProduct(product); }}
                          className="bg-white/90 dark:bg-zinc-900/90 text-gray-900 dark:text-white px-6 py-2.5 rounded-full font-bold text-sm tracking-wider uppercase backdrop-blur-md shadow-lg hover:bg-neon-pink hover:text-white transition-colors w-full mx-4"
                        >
                          {t('quick_view')}
                        </button>
                      </div>
                    </div>

                    <div className="p-6 flex-1 flex flex-col">
                      <Link href={`/urundetay/${product.id}`} className="block relative z-10">
                        <h3 className="text-gray-900 dark:text-white font-bold text-lg mb-2 truncate group-hover:text-neon-pink transition-colors">{t(product.ad)}</h3>
                      </Link>
                      <div className="mt-auto pt-4 flex items-center justify-between border-t border-gray-100 dark:border-white/10">
                        <span className="text-gray-900 dark:text-white font-black text-xl">{formatPrice(product.fiyat)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {visibleCount < results.length && (
                <div ref={loaderRef} className="w-full py-12 flex justify-center">
                  <div className="w-8 h-8 rounded-full border-4 border-neon-pink border-t-transparent animate-spin"></div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {quickViewProduct && <QuickViewModal product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />}
    </div>
  );
}
