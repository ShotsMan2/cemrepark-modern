import { useState } from 'react';

export default function OrdersView() {
  const [activeTab, setActiveTab] = useState('Tümü');
  
  const mockOrders = [
    { id: 'ORD-2023-001', musteri: 'Ahmet Yılmaz', tarih: '29 Haz 2026', tutar: '4.500 ₺', durum: 'Hazırlanıyor', renk: 'text-holo-gold', border: 'border-holo-gold/30', bg: 'bg-holo-gold/10' },
    { id: 'ORD-2023-002', musteri: 'Ayşe Demir', tarih: '28 Haz 2026', tutar: '1.400 ₺', durum: 'Kargolandı', renk: 'text-blue-400', border: 'border-blue-400/30', bg: 'bg-blue-400/10' },
    { id: 'ORD-2023-003', musteri: 'Mehmet Kaya', tarih: '27 Haz 2026', tutar: '2.500 ₺', durum: 'Teslim Edildi', renk: 'text-green-500', border: 'border-green-500/30', bg: 'bg-green-500/10' },
    { id: 'ORD-2023-004', musteri: 'Fatma Çelik', tarih: '25 Haz 2026', tutar: '3.000 ₺', durum: 'İptal', renk: 'text-red-500', border: 'border-red-500/30', bg: 'bg-red-500/10' },
    { id: 'ORD-2023-005', musteri: 'Zeynep Yılmaz', tarih: '24 Haz 2026', tutar: '8.500 ₺', durum: 'Hazırlanıyor', renk: 'text-holo-gold', border: 'border-holo-gold/30', bg: 'bg-holo-gold/10' },
  ];

  const filteredOrders = activeTab === 'Tümü' ? mockOrders : mockOrders.filter(o => o.durum === activeTab);

  return (
    <div className="animate-fade-in">
      <div className="glass-panel p-6 clip-angled mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-white uppercase tracking-wider">Sipariş Yönetimi</h2>
          <p className="text-gray-400 text-sm mt-1">Son siparişlerinizi buradan takip edebilir, kargo durumlarını güncelleyebilirsiniz.</p>
        </div>
        <div className="flex gap-4">
          <input 
            type="text" 
            placeholder="Sipariş No, Müşteri Ara..." 
            className="bg-black/50 border border-white/10 text-white px-4 py-2 focus:outline-none focus:border-neon-pink text-sm w-64"
          />
          <button className="bg-neon-pink text-white font-bold py-2 px-6 uppercase tracking-widest text-sm hover:bg-white hover:text-black transition-colors clip-angled">
            Dışa Aktar
          </button>
        </div>
      </div>

      <div className="flex gap-4 mb-6 overflow-x-auto pb-2 custom-scrollbar">
        {['Tümü', 'Hazırlanıyor', 'Kargolandı', 'Teslim Edildi', 'İptal'].map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 uppercase tracking-widest text-xs font-bold whitespace-nowrap transition-colors border-b-2 ${activeTab === tab ? 'text-neon-pink border-neon-pink' : 'text-gray-500 border-transparent hover:text-white'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="glass-panel p-0 clip-angled overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 bg-black/40 text-gray-400 text-xs uppercase tracking-wider">
              <th className="p-4 w-12"><input type="checkbox" className="accent-neon-pink" /></th>
              <th className="p-4 font-bold">Sipariş No</th>
              <th className="p-4 font-bold">Müşteri</th>
              <th className="p-4 font-bold">Tarih</th>
              <th className="p-4 font-bold">Tutar</th>
              <th className="p-4 font-bold">Durum</th>
              <th className="p-4 font-bold text-right">İşlem</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredOrders.map((order, i) => (
              <tr key={i} className="hover:bg-white/5 transition-colors group cursor-pointer">
                <td className="p-4"><input type="checkbox" className="accent-neon-pink" /></td>
                <td className="p-4 font-bold text-white text-sm group-hover:text-neon-pink transition-colors">{order.id}</td>
                <td className="p-4 text-gray-300 text-sm">{order.musteri}</td>
                <td className="p-4 text-gray-400 text-sm">{order.tarih}</td>
                <td className="p-4 text-white font-bold text-sm">{order.tutar}</td>
                <td className="p-4 font-bold text-sm">
                  <span className={`px-3 py-1 text-xs border rounded-full ${order.renk} ${order.bg} ${order.border}`}>
                    {order.durum}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <button className="text-gray-400 hover:text-white transition-colors text-sm underline decoration-white/20 underline-offset-4">Detay</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {/* Pagination */}
        <div className="border-t border-white/5 p-4 flex justify-between items-center text-gray-400 text-xs uppercase tracking-wider bg-black/20">
          <span>{filteredOrders.length} Sipariş Listeleniyor</span>
          <div className="flex gap-2">
            <button className="px-3 py-1 border border-white/10 hover:border-neon-pink hover:text-white transition-colors">&lt; Önceki</button>
            <button className="px-3 py-1 bg-neon-pink text-white border border-neon-pink">1</button>
            <button className="px-3 py-1 border border-white/10 hover:border-neon-pink hover:text-white transition-colors">2</button>
            <button className="px-3 py-1 border border-white/10 hover:border-neon-pink hover:text-white transition-colors">Sonraki &gt;</button>
          </div>
        </div>
      </div>
    </div>
  );
}
