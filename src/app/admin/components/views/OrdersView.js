export default function OrdersView() {
  const mockOrders = [
    { id: 'ORD-2023-001', musteri: 'Ahmet Yılmaz', tarih: '29 Haz 2026', tutar: '4.500 ₺', durum: 'Hazırlanıyor', renk: 'text-holo-gold' },
    { id: 'ORD-2023-002', musteri: 'Ayşe Demir', tarih: '28 Haz 2026', tutar: '1.400 ₺', durum: 'Kargolandı', renk: 'text-blue-400' },
    { id: 'ORD-2023-003', musteri: 'Mehmet Kaya', tarih: '27 Haz 2026', tutar: '2.500 ₺', durum: 'Teslim Edildi', renk: 'text-green-500' },
    { id: 'ORD-2023-004', musteri: 'Fatma Çelik', tarih: '25 Haz 2026', tutar: '3.000 ₺', durum: 'İptal', renk: 'text-red-500' },
  ];

  return (
    <div className="animate-fade-in">
      <div className="glass-panel p-6 clip-angled mb-8 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-white uppercase tracking-wider">Sipariş Yönetimi</h2>
          <p className="text-gray-400 text-sm mt-1">Son siparişlerinizi buradan takip edebilirsiniz (Demo).</p>
        </div>
        <button className="bg-neon-pink text-white font-bold py-2 px-6 uppercase tracking-widest text-sm hover:bg-white hover:text-black transition-colors clip-angled">
          Filtrele
        </button>
      </div>

      <div className="glass-panel p-0 clip-angled overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 bg-black/40 text-gray-400 text-xs uppercase tracking-wider">
              <th className="p-4 font-bold">Sipariş No</th>
              <th className="p-4 font-bold">Müşteri</th>
              <th className="p-4 font-bold">Tarih</th>
              <th className="p-4 font-bold">Tutar</th>
              <th className="p-4 font-bold">Durum</th>
              <th className="p-4 font-bold text-right">İşlem</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {mockOrders.map((order, i) => (
              <tr key={i} className="hover:bg-white/5 transition-colors">
                <td className="p-4 font-bold text-white text-sm">{order.id}</td>
                <td className="p-4 text-gray-300 text-sm">{order.musteri}</td>
                <td className="p-4 text-gray-400 text-sm">{order.tarih}</td>
                <td className="p-4 text-white font-bold text-sm">{order.tutar}</td>
                <td className="p-4 font-bold text-sm">
                  <span className={`px-2 py-1 bg-black/50 border border-white/10 text-xs ${order.renk}`}>
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
      </div>
    </div>
  );
}
