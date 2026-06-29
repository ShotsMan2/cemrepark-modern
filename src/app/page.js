import Image from "next/image";
import Link from "next/link";
import { products } from "../data/products";
import FavoriteButton from "../components/FavoriteButton";

export default function Home() {
  const bestSellers = products.slice(0, 4);
  const discounted = products.slice(4, 8);

  return (
    <div className="overflow-hidden">
      {/* 1. HERO SECTION - ASYMMETRIC & FLOATING */}
      <section className="relative min-h-screen flex items-center justify-center pt-24 pb-12">
        {/* Neon Background Glows */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-pink opacity-20 rounded-full blur-[100px] mix-blend-screen pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-holo-gold opacity-10 rounded-full blur-[100px] mix-blend-screen pointer-events-none"></div>

        <div className="container mx-auto px-4 z-10 relative">
          <div className="flex flex-col md:flex-row items-center gap-12">
            
            {/* Left Content */}
            <div className="w-full md:w-1/2" data-aos="fade-right">
              <h2 className="text-holo-gold tracking-[0.3em] text-sm uppercase mb-4 font-bold">YENİ SEZON KOLEKSİYONU</h2>
              <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight text-glow-pink">
                TESETTÜR GİYİMDE <br/> ŞIKLIK
              </h1>
              <p className="text-gray-400 text-lg md:text-xl mb-10 max-w-lg font-light leading-relaxed">
                Size çok yakışacak! En trend tesettür takım, kap ve tunik modelleriyle tarzınızı yeniden keşfedin. Havale, EFT veya Kapıda Nakit/Kredi Kartı ile güvenle alışveriş yapın.
              </p>
              
              <div className="flex gap-6">
                <Link href="#collection" className="glass-panel px-8 py-4 text-white font-medium uppercase tracking-wider hover:bg-neon-pink hover:border-neon-pink transition-all duration-300 clip-angled">
                  Koleksiyonu Keşfet
                </Link>
                <Link href="/search" className="px-8 py-4 text-gray-300 font-medium uppercase tracking-wider border border-gray-700 hover:border-holo-gold hover:text-holo-gold transition-all duration-300 clip-angled">
                  Arama Yap
                </Link>
              </div>
            </div>

            {/* Right Image - Floating */}
            <div className="w-full md:w-1/2 relative h-[600px] flex justify-center float-fx" data-aos="fade-left">
              {/* Decorative Elements */}
              <div className="absolute top-10 right-10 w-24 h-24 border border-neon-pink opacity-50 clip-hexa float-fx-delay"></div>
              <div className="absolute bottom-20 left-10 w-16 h-16 border border-holo-gold opacity-30 clip-angled float-fx"></div>
              
              <div className="relative w-4/5 h-full clip-angled glass-panel p-2">
                <div className="relative w-full h-full clip-angled overflow-hidden">
                  <Image 
                    src={products[0]?.gorsel || "/images/placeholder.jpg"} 
                    alt="Hero Image" 
                    fill
                    className="object-cover scale-105 hover:scale-110 transition-transform duration-700"
                    priority
                  />
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. FLOATING CARDS (BEST SELLERS) */}
      <section id="collection" className="py-24 relative z-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16" data-aos="fade-up">
            <div>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-2">Trend Olanlar</h2>
              <div className="w-24 h-1 bg-neon-pink"></div>
            </div>
            <Link href="/search" className="text-gray-400 hover:text-holo-gold mt-4 md:mt-0 tracking-widest text-sm uppercase transition-colors">
              Tümünü Gör ↗
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {bestSellers.map((product, index) => (
              <div key={product.id} className="glass-card group relative" data-aos="fade-up" data-aos-delay={index * 150}>
                {/* Floating Tags */}
                <div className="absolute top-4 left-4 z-20">
                  <span className="glass-panel px-3 py-1 text-xs text-white uppercase tracking-wider clip-angled">
                    Yeni
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
        </div>
      </section>

      {/* 3. BENTO BOX SHOWCASE */}
      <section className="py-24 bg-black/50 border-y border-white/5">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-auto md:h-[600px]">
            
            {/* Big Feature */}
            <div className="md:col-span-2 glass-panel relative group overflow-hidden clip-angled" data-aos="fade-right">
              <Image src={discounted[0]?.gorsel || "/images/placeholder.jpg"} alt="Giyim" fill className="object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent p-10 flex flex-col justify-end">
                <span className="text-neon-pink uppercase tracking-[0.2em] text-sm font-bold mb-2">Özel Tasarım</span>
                <h3 className="text-4xl font-black text-white mb-4">Premium Kaban Serisi</h3>
                <Link href="/search" className="text-white border-b border-white pb-1 w-max hover:text-holo-gold hover:border-holo-gold transition-colors">Koleksiyonu İncele</Link>
              </div>
            </div>

            {/* Stacked Small Features */}
            <div className="flex flex-col gap-6" data-aos="fade-left">
              <div className="h-1/2 glass-panel relative group overflow-hidden clip-angled">
                <div className="absolute inset-0 bg-gradient-to-br from-neon-pink/20 to-transparent z-10 pointer-events-none"></div>
                <Image src={discounted[1]?.gorsel || "/images/placeholder.jpg"} alt="Elbise" fill className="object-cover opacity-50 group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-20">
                  <h4 className="text-2xl font-bold text-white mb-2">Minimalist Elbiseler</h4>
                  <Link href="/search" className="text-xs uppercase tracking-widest text-gray-300 hover:text-white">Keşfet</Link>
                </div>
              </div>
              <div className="h-1/2 glass-panel relative group overflow-hidden clip-angled">
                <Image src={discounted[2]?.gorsel || "/images/placeholder.jpg"} alt="Tunik" fill className="object-cover opacity-50 group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-20">
                  <h4 className="text-2xl font-bold text-white mb-2">Modern Tunikler</h4>
                  <Link href="/search" className="text-xs uppercase tracking-widest text-gray-300 hover:text-white">Keşfet</Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. FUTURISTIC TRUST BADGES */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { title: "Hızlı Teslimat", desc: "Tüm Türkiye'ye hızlı kargo imkanı", icon: "M13 10V3L4 14h7v7l9-11h-7z" },
              { title: "Güvenli Ödeme", desc: "Kapıda Nakit veya Kredi Kartı", icon: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" },
              { title: "Müşteri Memnuniyeti", desc: "Yüzlerce mutlu müşteri", icon: "M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" },
              { title: "WhatsApp Destek", desc: "0554 169 89 09", icon: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" }
            ].map((badge, i) => (
              <div key={i} className="glass-panel p-8 text-center group clip-hexa hover:border-holo-gold transition-colors duration-300" data-aos="zoom-in" data-aos-delay={i * 100}>
                <div className="w-16 h-16 mx-auto mb-6 bg-white/5 rounded-full flex items-center justify-center text-neon-pink group-hover:text-holo-gold transition-colors duration-300">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d={badge.icon}></path>
                  </svg>
                </div>
                <h4 className="text-white font-bold mb-2 uppercase tracking-wider">{badge.title}</h4>
                <p className="text-gray-500 text-sm">{badge.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
