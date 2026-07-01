"use client";
import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import FavoriteButton from "../../components/FavoriteButton";
import QuickViewModal from "../../components/QuickViewModal";
import { useStore } from "../../context/StoreContext";
import { getValidImageUrl } from "../../utils/imageHelper";

export default function SearchClient({ initialResults, query, isSearch }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { formatPrice, t } = useStore();
  const [results, setResults] = useState(initialResults);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  
  // Filter States initialized from URL
  const [priceRange, setPriceRange] = useState(Number(searchParams.get("price")) || 5000);
  const [selectedColors, setSelectedColors] = useState(searchParams.get("colors") ? searchParams.get("colors").split(",") : []);
  const [selectedSizes, setSelectedSizes] = useState(searchParams.get("sizes") ? searchParams.get("sizes").split(",") : []);


  const colors = [
    { name: 'Siyah', code: '#000000' },
    { name: 'Beyaz', code: '#ffffff' },
    { name: 'Kırmızı', code: '#ff0000' },
    { name: 'Lacivert', code: '#000080' },
    { name: 'Bej', code: '#f5f5dc' },
  ];

  const sizes = ['XS', 'S', 'M', 'L', 'XL'];

  useEffect(() => {
    let filtered = initialResults.filter(p => p.fiyat <= priceRange);
    
    if (selectedColors.length > 0) {
      filtered = filtered.filter(p => {
        if (!p.renk) return false;
        const prodColors = p.renk.split(',').map(s => s.trim().toLowerCase());
        return selectedColors.some(c => prodColors.includes(c.toLowerCase()));
      });
    }
    
    if (selectedSizes.length > 0) {
      filtered = filtered.filter(p => {
        if (!p.beden) return false;
        const prodSizes = p.beden.split(',').map(s => s.trim().toUpperCase());
        return selectedSizes.some(s => prodSizes.includes(s.toUpperCase()));
      });
    }

    setResults(filtered);
  }, [priceRange, selectedColors, selectedSizes, initialResults]);

  // Update URL when filters change
  const updateUrl = useCallback((price, colors, sizes) => {
    const params = new URLSearchParams(searchParams.toString());
    if (price < 5000) params.set("price", price);
    else params.delete("price");
    
    if (colors.length > 0) params.set("colors", colors.join(","));
    else params.delete("colors");
    
    if (sizes.length > 0) params.set("sizes", sizes.join(","));
    else params.delete("sizes");
    
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [pathname, router, searchParams]);

  const handlePriceChange = (e) => {
    const newPrice = Number(e.target.value);
    setPriceRange(newPrice);
    updateUrl(newPrice, selectedColors, selectedSizes);
  };

  const handleColorToggle = (colorName) => {
    const newColors = selectedColors.includes(colorName) 
      ? selectedColors.filter(c => c !== colorName) 
      : [...selectedColors, colorName];
    setSelectedColors(newColors);
    updateUrl(priceRange, newColors, selectedSizes);
  };

  const handleSizeToggle = (sizeName) => {
    const newSizes = selectedSizes.includes(sizeName) 
      ? selectedSizes.filter(s => s !== sizeName) 
      : [...selectedSizes, sizeName];
    setSelectedSizes(newSizes);
    updateUrl(priceRange, selectedColors, newSizes);
  };

  const handleClearFilters = () => {
    setPriceRange(5000);
    setSelectedColors([]);
    setSelectedSizes([]);
    const params = new URLSearchParams(searchParams.toString());
    params.delete("price");
    params.delete("colors");
    params.delete("sizes");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="container mx-auto px-4 relative z-10">
      
      {/* Search Header */}
      <div className="glass-panel p-8 clip-angled mb-12 text-center">
        <h1 className="text-3xl md:text-5xl font-black mb-4 uppercase tracking-widest text-white">
          {isSearch ? `${t("search_results")}: "${query}"` : t("collection")}
        </h1>
        {isSearch && (
          <p className="text-gray-400">
            {t("total_products_listed", { count: results.length })}
          </p>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* SIDEBAR FILTER */}
        <div className="w-full lg:w-1/4">
          <div className="glass-panel p-6 clip-angled sticky top-32">
            <h3 className="text-white font-bold uppercase tracking-widest mb-6 border-b border-white/10 pb-4">{t("filters")}</h3>
            
            <div className="mb-8">
              <h4 className="text-gray-400 text-sm font-bold uppercase tracking-widest mb-4">{t("price_range")}</h4>
              <input 
                type="range" 
                min="0" 
                max="5000" 
                step="100" 
                value={priceRange} 
                onChange={handlePriceChange}
                className="w-full accent-neon-pink mb-2"
              />
              <div className="flex justify-between text-xs text-gray-500 font-bold">
                <span>{formatPrice(0)}</span>
                <span>{formatPrice(priceRange)}</span>
              </div>
            </div>

            <div className="mb-8">
              <h4 className="text-gray-400 text-sm font-bold uppercase tracking-widest mb-4">{t("color")}</h4>
              <div className="flex flex-wrap gap-2">
                {colors.map(color => (
                  <button 
                    type="button"
                    key={color.name}
                    onClick={() => handleColorToggle(color.name)}
                    className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${selectedColors.includes(color.name) ? 'border-neon-pink scale-110' : 'border-transparent shadow-[0_0_0_1px_rgba(255,255,255,0.2)]'}`}
                    style={{ backgroundColor: color.code }}
                    title={color.name}
                  ></button>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <h4 className="text-gray-400 text-sm font-bold uppercase tracking-widest mb-4">{t("size")}</h4>
              <div className="grid grid-cols-3 gap-2">
                {sizes.map(size => (
                  <button 
                    type="button"
                    key={size}
                    onClick={() => handleSizeToggle(size)}
                    className={`py-2 text-xs font-bold uppercase tracking-wider transition-colors clip-angled border ${selectedSizes.includes(size) ? 'bg-neon-pink text-white border-neon-pink' : 'bg-transparent text-gray-400 border-white/20 hover:border-white'}`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
            
            <button 
              type="button"
              onClick={handleClearFilters}
              className="w-full text-center text-xs text-gray-500 hover:text-white underline decoration-white/20 hover:decoration-white transition-colors"
            >
              {t("clear_filters")}
            </button>
          </div>
        </div>

        {/* PRODUCT GRID */}
        <div className="w-full lg:w-3/4 min-h-screen">
          {results.length === 0 ? (
            <div className="glass-panel p-12 clip-angled flex flex-col items-center justify-center text-center">
              <div className="w-24 h-24 rounded-full border border-gray-700 flex items-center justify-center text-gray-500 mb-6">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">{t("no_products_found")}</h2>
              <p className="text-gray-400 mb-8">{t("no_products_found_desc")}</p>
              <button 
                onClick={handleClearFilters} 
                className="inline-block bg-transparent border border-holo-gold text-holo-gold hover:bg-holo-gold hover:text-black py-3 px-8 uppercase font-bold tracking-widest transition-all duration-300 clip-angled text-sm"
              >
                {t("remove_filters")}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map((product, index) => (
                <div key={product.id} className="glass-card group relative" data-aos="fade-up" data-aos-delay={(index % 3) * 100}>
                  {/* Floating Tags */}
                  <div className="absolute top-4 left-4 z-20">
                    <span className="glass-panel px-3 py-1 text-xs text-white uppercase tracking-wider clip-angled">
                      {t("new_season")}
                    </span>
                  </div>

                  <div className="relative h-96 w-full clip-angled overflow-hidden m-2 rounded-t-lg group-hover:shadow-[0_0_20px_rgba(255,0,127,0.3)] transition-shadow duration-300">
                    <Link href={`/urundetay/${product.id}`} className="block w-full h-full">
                      <Image 
                        src={getValidImageUrl(product.gorsel)} 
                        alt={t(product.ad)}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                      />
                    </Link>
                    
                    {/* Quick View Button - appears on hover */}
                    <div className="absolute bottom-4 left-0 w-full px-4 flex justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0 z-30">
                      <button 
                        onClick={() => setQuickViewProduct(product)}
                        className="text-xs uppercase tracking-widest font-bold border-b border-gray-500 pb-1 text-gray-400 hover:text-white hover:border-white transition-colors mt-1"
                      >
                        {t("quick_view")}
                      </button>
                    </div>
                  </div>

                  <div className="p-6">
                    <Link href={`/urundetay/${product.id}`}>
                      <h3 className="text-gray-300 font-medium text-lg mb-2 truncate group-hover:text-neon-pink transition-colors">
                        {t(product.ad)}
                      </h3>
                    </Link>
                    <div className="flex justify-between items-center">
                      <span className="text-glow-gold font-bold text-xl">
                      {formatPrice(product.fiyat)}
                      </span>
                      <FavoriteButton product={product} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* QUICK VIEW MODAL */}
      <QuickViewModal product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />

    </div>
  );
}
