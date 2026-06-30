export default function CustomersView() {
  const mockCustomers = [
    { id: 'CUS-001', isim: 'Ahmet Yılmaz', email: 'ahmet@example.com', kayit: '15 Oca 2026', harcama: '12.500 ₺' },
    { id: 'CUS-002', isim: 'Ayşe Demir', email: 'ayse@example.com', kayit: '02 Mar 2026', harcama: '4.200 ₺' },
    { id: 'CUS-003', isim: 'Mehmet Kaya', email: 'mehmet@example.com', kayit: '10 Nis 2026', harcama: '8.900 ₺' },
  ];

  return (
    <div className="animate-fade-in">
      <div className="glass-panel p-6 clip-angled mb-8 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-white uppercase tracking-wider">Müşteri Yönetimi</h2>
          <p className="text-gray-400 text-sm mt-1">Kayıtlı müşterileriniz ve alışveriş geçmişleri (Demo).</p>
        </div>
      </div>

      <div className="glass-panel p-0 clip-angled overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 bg-black/40 text-gray-400 text-xs uppercase tracking-wider">
              <th className="p-4 font-bold">ID</th>
              <th className="p-4 font-bold">Müşteri Adı</th>
              <th className="p-4 font-bold">E-posta</th>
              <th className="p-4 font-bold">Kayıt Tarihi</th>
              <th className="p-4 font-bold">Toplam Harcama</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {mockCustomers.map((c, i) => (
              <tr key={i} className="hover:bg-white/5 transition-colors">
                <td className="p-4 font-bold text-white text-sm">{c.id}</td>
                <td className="p-4 text-white font-bold text-sm">{c.isim}</td>
                <td className="p-4 text-gray-400 text-sm">{c.email}</td>
                <td className="p-4 text-gray-400 text-sm">{c.kayit}</td>
                <td className="p-4 text-holo-gold font-bold text-sm">{c.harcama}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
