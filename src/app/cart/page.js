import Link from "next/link";

export default function CartPage() {
  return (
    <div className="min-h-screen flex items-center justify-center pt-32 pb-24 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-neon-pink opacity-[0.05] rounded-full blur-[100px] pointer-events-none"></div>

      <div className="container mx-auto px-4 relative z-10 text-center max-w-2xl">
        <h1 className="text-4xl md:text-5xl font-black mb-8 text-glow-pink uppercase tracking-widest">Alışveriş Sepetim</h1>
        
        <div className="glass-panel p-12 clip-angled mb-8 flex flex-col items-center justify-center">
          <div className="w-20 h-20 rounded-full border border-gray-700 flex items-center justify-center text-gray-500 mb-6">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Sepetiniz Şu An Boş</h2>
          <p className="text-gray-400">Yeni sezon koleksiyonumuzu inceleyerek sepetinizi doldurmaya başlayın.</p>
        </div>

        <Link href="/search" className="inline-block glass-panel px-8 py-4 text-white font-medium uppercase tracking-wider hover:bg-neon-pink hover:border-neon-pink transition-all duration-300 clip-angled">
          Alışverişe Başla
        </Link>
      </div>
    </div>
  );
}
