import Image from "next/image";
import Link from "next/link";
import { searchProducts } from "../../data/products";
import FavoriteButton from "../../components/FavoriteButton";

export default async function SearchPage({ searchParams }) {
  const resolvedParams = await searchParams;
  const query = resolvedParams.q || "";
  const results = searchProducts(query);

  return (
    <div className="min-h-screen pt-32 pb-24 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-holo-gold opacity-[0.03] rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-neon-pink opacity-[0.03] rounded-full blur-[100px] pointer-events-none"></div>

      <div className="container mx-auto px-4 relative z-10">
        
        {/* Search Header */}
        <div className="glass-panel p-8 clip-angled mb-12 text-center">
          <h1 className="text-3xl md:text-5xl font-black mb-4 uppercase tracking-widest text-white">
            {query ? (
              <>Arama Sonuçları: <span className="text-neon-pink">"{query}"</span></>
            ) : (
              "Koleksiyon"
            )}
          </h1>
          <p className="text-gray-400">
            Toplam <strong className="text-white">{results.length}</strong> ürün bulunuyor.
          </p>
        </div>

        {results.length === 0 ? (
          <div className="glass-panel p-12 clip-angled flex flex-col items-center justify-center text-center max-w-2xl mx-auto">
            <div className="w-24 h-24 rounded-full border border-gray-700 flex items-center justify-center text-gray-500 mb-6">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Eşleşen Ürün Bulunamadı</h2>
            <p className="text-gray-400 mb-8">Aradığınız kelimeye uygun bir ürün stoklarımızda bulunmuyor. Farklı kelimeler deneyebilirsiniz.</p>
            <Link href="/" className="inline-block bg-transparent border border-holo-gold text-holo-gold hover:bg-holo-gold hover:text-black py-3 px-8 uppercase font-bold tracking-widest transition-all duration-300 clip-angled text-sm">
              Anasayfaya Dön
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {results.map((product, index) => (
              <div key={product.id} className="glass-card group relative" data-aos="fade-up" data-aos-delay={(index % 4) * 100}>
                {/* Floating Tags */}
                <div className="absolute top-4 left-4 z-20">
                  <span className="glass-panel px-3 py-1 text-xs text-white uppercase tracking-wider clip-angled">
                    Yeni Sezon
                  </span>
                </div>

                <Link href={`/urundetay/${product.id}`} className="block relative h-96 w-full clip-angled overflow-hidden m-2 rounded-t-lg group-hover:shadow-[0_0_20px_rgba(255,0,127,0.3)] transition-shadow duration-300">
                  <Image 
                    src={product.gorsel} 
                    alt={product.ad}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                  />
                  {/* Glass overlay on hover */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <span className="border border-white/50 text-white px-6 py-2 uppercase tracking-widest text-sm backdrop-blur-sm">İncele</span>
                  </div>
                </Link>

                <div className="p-6">
                  <h3 className="text-gray-300 font-medium text-lg mb-2 truncate group-hover:text-neon-pink transition-colors">
                    {product.ad}
                  </h3>
                  <div className="flex justify-between items-center">
                    <span className="text-glow-gold font-bold text-xl">
                      {product.fiyat.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL
                    </span>
                    <FavoriteButton product={product} />
                  </div>
                </div>
                {/* Invisible link overlay for the whole card */}
                <Link href={`/urundetay/${product.id}`} className="absolute inset-0 z-10"></Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
