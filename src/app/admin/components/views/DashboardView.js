export default function DashboardView({ products }) {
  const totalProducts = products.length;
  const activeCategories = [...new Set(products.map(p => p.kategori))].filter(Boolean).length;
  const totalValue = products.reduce((sum, p) => sum + (parseFloat(p.fiyat) || 0), 0);
  
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Metric Card 1 */}
        <div className="glass-panel p-6 clip-angled relative overflow-hidden group hover:border-neon-pink transition-colors">
          <div className="absolute top-0 right-0 w-24 h-24 bg-neon-pink opacity-10 rounded-bl-full group-hover:scale-110 transition-transform"></div>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Toplam Ürün</p>
          <h3 className="text-3xl font-black text-white">{totalProducts}</h3>
          <p className="text-neon-pink text-xs mt-2 font-bold">+12% geçen aya göre</p>
        </div>

        {/* Metric Card 2 */}
        <div className="glass-panel p-6 clip-angled relative overflow-hidden group hover:border-holo-gold transition-colors">
          <div className="absolute top-0 right-0 w-24 h-24 bg-holo-gold opacity-10 rounded-bl-full group-hover:scale-110 transition-transform"></div>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Aktif Kategoriler</p>
          <h3 className="text-3xl font-black text-white">{activeCategories}</h3>
          <p className="text-holo-gold text-xs mt-2 font-bold">Yeni sezon güncel</p>
        </div>

        {/* Metric Card 3 */}
        <div className="glass-panel p-6 clip-angled relative overflow-hidden group hover:border-purple-500 transition-colors">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500 opacity-10 rounded-bl-full group-hover:scale-110 transition-transform"></div>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Stok Değeri</p>
          <h3 className="text-3xl font-black text-white">{totalValue.toLocaleString('tr-TR')} ₺</h3>
          <p className="text-purple-500 text-xs mt-2 font-bold">Satışa hazır</p>
        </div>

        {/* Metric Card 4 */}
        <div className="glass-panel p-6 clip-angled relative overflow-hidden group hover:border-green-500 transition-colors">
          <div className="absolute top-0 right-0 w-24 h-24 bg-green-500 opacity-10 rounded-bl-full group-hover:scale-110 transition-transform"></div>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Bekleyen Sipariş</p>
          <h3 className="text-3xl font-black text-white">14</h3>
          <p className="text-green-500 text-xs mt-2 font-bold">Acil gönderim</p>
        </div>
      </div>

      {/* Mock Chart Area */}
      <div className="glass-panel p-8 clip-angled relative h-96 flex flex-col items-center justify-center border border-white/5">
        <h3 className="absolute top-6 left-6 text-white font-bold uppercase tracking-widest">Aylık Satış İstatistikleri (Demo)</h3>
        <div className="w-full h-48 flex items-end justify-between px-10 gap-2 opacity-50">
          {[40, 70, 45, 90, 65, 120, 85].map((height, i) => (
            <div key={i} className="w-full bg-gradient-to-t from-neon-pink to-holo-gold relative group clip-angled" style={{ height: `${height}%` }}>
              <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-xs py-1 px-2 font-bold">
                {height}K
              </div>
            </div>
          ))}
        </div>
        <div className="w-full flex justify-between px-10 mt-4 text-gray-500 text-xs font-bold">
          <span>Pzt</span><span>Sal</span><span>Çar</span><span>Per</span><span>Cum</span><span>Cmt</span><span>Paz</span>
        </div>
      </div>
    </div>
  );
}
