export default function CustomersView() {
  const mockCustomers = [
    { id: 'CUS-001', isim: 'Ahmet Yılmaz', email: 'ahmet@example.com', kayit: '15 Oca 2026', harcama: 12500, segment: 'VIP', siparisSayisi: 8 },
    { id: 'CUS-002', isim: 'Ayşe Demir', email: 'ayse@example.com', kayit: '02 Mar 2026', harcama: 4200, segment: 'Regular', siparisSayisi: 3 },
    { id: 'CUS-003', isim: 'Mehmet Kaya', email: 'mehmet@example.com', kayit: '10 Nis 2026', harcama: 8900, segment: 'VIP', siparisSayisi: 5 },
    { id: 'CUS-004', isim: 'Fatma Çelik', email: 'fatma@example.com', kayit: '28 Haz 2026', harcama: 850, segment: 'New', siparisSayisi: 1 },
    { id: 'CUS-005', isim: 'Zeynep Yılmaz', email: 'zeynep@example.com', kayit: '20 May 2026', harcama: 2400, segment: 'Regular', siparisSayisi: 2 },
  ];

  const getSegmentColor = (segment) => {
    switch (segment) {
      case 'VIP': return 'bg-holo-gold/20 text-holo-gold border-holo-gold/30';
      case 'Regular': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'New': return 'bg-neon-pink/20 text-neon-pink border-neon-pink/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="glass-panel p-6 clip-angled mb-8 flex justify-between items-center">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 w-full">
          <div>
            <h2 className="text-xl font-bold text-white uppercase tracking-wider">Müşteri CRM</h2>
            <p className="text-gray-400 text-sm mt-1">Müşteri segmentasyonu, harcama analizleri ve iletişim (Demo).</p>
          </div>
          <div className="flex gap-4">
            <input 
              type="text" 
              placeholder="İsim, E-posta Ara..." 
              className="bg-black/50 border border-white/10 text-white px-4 py-2 focus:outline-none focus:border-neon-pink text-sm w-64"
            />
            <button className="bg-neon-pink text-white font-bold py-2 px-6 uppercase tracking-widest text-sm hover:bg-white hover:text-black transition-colors clip-angled">
              E-posta Gönder
            </button>
          </div>
        </div>
      </div>

      <div className="glass-panel p-0 clip-angled overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 bg-black/40 text-gray-400 text-xs uppercase tracking-wider">
              <th className="p-4 w-12"><input type="checkbox" className="accent-neon-pink" /></th>
              <th className="p-4 font-bold">Müşteri</th>
              <th className="p-4 font-bold">İletişim</th>
              <th className="p-4 font-bold">Segment</th>
              <th className="p-4 font-bold">Kayıt & Sipariş</th>
              <th className="p-4 font-bold text-right">Toplam Değer</th>
              <th className="p-4 font-bold text-right">İşlem</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {mockCustomers.map((c, i) => (
              <tr key={i} className="hover:bg-white/5 transition-colors group cursor-pointer">
                <td className="p-4"><input type="checkbox" className="accent-neon-pink" /></td>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neon-pink/50 to-holo-gold/50 flex items-center justify-center text-white font-bold uppercase">
                      {c.isim.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-white text-sm group-hover:text-neon-pink transition-colors">{c.isim}</p>
                      <p className="text-gray-500 text-xs">{c.id}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-gray-300 text-sm">{c.email}</td>
                <td className="p-4">
                  <span className={`px-3 py-1 text-xs border rounded-full font-bold uppercase tracking-wider ${getSegmentColor(c.segment)}`}>
                    {c.segment}
                  </span>
                </td>
                <td className="p-4">
                  <p className="text-gray-400 text-sm">{c.kayit}</p>
                  <p className="text-gray-500 text-xs">{c.siparisSayisi} Sipariş</p>
                </td>
                <td className="p-4 text-holo-gold font-bold text-sm text-right">
                  {c.harcama.toLocaleString('tr-TR')} ₺
                </td>
                <td className="p-4 text-right">
                  <button className="text-gray-400 hover:text-white transition-colors text-sm underline decoration-white/20 underline-offset-4">Profili Gör</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
