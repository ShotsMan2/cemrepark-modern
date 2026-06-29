import Link from "next/link";

export default function FavoritesPage() {
  return (
    <div className="min-h-screen flex items-center justify-center pt-32 pb-24 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-holo-gold opacity-[0.05] rounded-full blur-[100px] pointer-events-none"></div>

      <div className="container mx-auto px-4 relative z-10 text-center max-w-2xl">
        <h1 className="text-4xl md:text-5xl font-black mb-8 text-glow-gold uppercase tracking-widest">Favorilerim</h1>
        
        <div className="glass-panel p-12 clip-angled mb-8 flex flex-col items-center justify-center">
          <div className="w-20 h-20 rounded-full border border-gray-700 flex items-center justify-center text-gray-500 mb-6">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Henüz Favori Ürününüz Yok</h2>
          <p className="text-gray-400">Beğendiğiniz ürünleri kalp ikonuna tıklayarak favorilerinize ekleyebilirsiniz.</p>
        </div>

        <Link href="/search" className="inline-block glass-panel px-8 py-4 text-white font-medium uppercase tracking-wider hover:bg-holo-gold hover:border-holo-gold hover:text-black transition-all duration-300 clip-angled">
          Koleksiyonu Keşfet
        </Link>
      </div>
    </div>
  );
}
