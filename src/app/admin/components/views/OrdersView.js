import { useState } from 'react';

export default function OrdersView() {
  const [activeTab, setActiveTab] = useState('Tümü');
  const [selectedOrder, setSelectedOrder] = useState(null);
  
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
                  <button 
                    onClick={() => setSelectedOrder(order)}
                    className="text-gray-400 hover:text-white transition-colors text-sm underline decoration-white/20 underline-offset-4"
                  >
                    Detay
                  </button>
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

      {/* INVOICE MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setSelectedOrder(null)}></div>
          <div className="glass-panel w-full max-w-3xl max-h-[90vh] overflow-y-auto clip-angled relative z-10 animate-fade-in bg-[#111]">
            <button 
              onClick={() => setSelectedOrder(null)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-gray-500 hover:text-white transition-colors"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
            
            <div className="p-8">
              <div className="flex justify-between items-start mb-12 border-b border-white/10 pb-8">
                <div>
                  <h2 className="text-3xl font-black text-white uppercase tracking-widest mb-1">Cemre Park</h2>
                  <p className="text-gray-500 text-xs tracking-wider">PREMİUM E-TİCARET A.Ş.</p>
                </div>
                <div className="text-right">
                  <h3 className="text-neon-pink font-bold text-xl uppercase tracking-widest mb-1">FATURA</h3>
                  <p className="text-white text-sm">Sipariş No: {selectedOrder.id}</p>
                  <p className="text-gray-400 text-sm">Tarih: {selectedOrder.tarih}</p>
                </div>
              </div>

              <div className="flex justify-between mb-12">
                <div>
                  <h4 className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-2">Fatura Edilen</h4>
                  <p className="text-white font-bold">{selectedOrder.musteri}</p>
                  <p className="text-gray-400 text-sm">musteri@email.com</p>
                  <p className="text-gray-400 text-sm">555 123 45 67</p>
                  <p className="text-gray-400 text-sm mt-2 max-w-xs">Barbaros Mah. Premium Sk. No:1 Ataşehir / İstanbul</p>
                </div>
                <div className="text-right">
                  <h4 className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-2">Durum</h4>
                  <span className={`inline-block px-3 py-1 text-xs border rounded-full ${selectedOrder.renk} ${selectedOrder.bg} ${selectedOrder.border}`}>
                    {selectedOrder.durum}
                  </span>
                </div>
              </div>

              <table className="w-full text-left mb-8">
                <thead>
                  <tr className="border-b border-white/10 text-gray-400 text-xs uppercase tracking-wider">
                    <th className="py-2 font-bold">Ürün / Açıklama</th>
                    <th className="py-2 font-bold text-center">Adet</th>
                    <th className="py-2 font-bold text-right">Birim Fiyat</th>
                    <th className="py-2 font-bold text-right">Toplam</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <tr>
                    <td className="py-4">
                      <p className="text-white font-bold text-sm">Premium Kadın Takım</p>
                      <p className="text-gray-500 text-xs">Renk: Siyah | Beden: M</p>
                    </td>
                    <td className="py-4 text-white text-sm text-center">1</td>
                    <td className="py-4 text-white text-sm text-right">{selectedOrder.tutar}</td>
                    <td className="py-4 text-white font-bold text-sm text-right">{selectedOrder.tutar}</td>
                  </tr>
                </tbody>
              </table>

              <div className="flex justify-end mb-12">
                <div className="w-64">
                  <div className="flex justify-between py-2 border-b border-white/5">
                    <span className="text-gray-400 text-sm">Ara Toplam</span>
                    <span className="text-white text-sm">{selectedOrder.tutar}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-white/5">
                    <span className="text-gray-400 text-sm">Kargo</span>
                    <span className="text-white text-sm">0.00 ₺</span>
                  </div>
                  <div className="flex justify-between py-3">
                    <span className="text-white font-bold uppercase tracking-wider">Genel Toplam</span>
                    <span className="text-holo-gold font-bold text-xl">{selectedOrder.tutar}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center border-t border-white/10 pt-6">
                <p className="text-gray-500 text-xs italic">Bizi tercih ettiğiniz için teşekkür ederiz.</p>
                <div className="flex gap-4">
                  <button 
                    onClick={() => setSelectedOrder(null)}
                    className="bg-transparent border border-white/20 text-white hover:border-white px-6 py-2 uppercase tracking-widest text-xs font-bold transition-colors clip-angled"
                  >
                    Kapat
                  </button>
                  <button 
                    onClick={() => window.print()}
                    className="bg-neon-pink text-white hover:bg-white hover:text-black px-6 py-2 uppercase tracking-widest text-xs font-bold transition-colors clip-angled flex items-center gap-2"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
                    Fatura Yazdır
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
