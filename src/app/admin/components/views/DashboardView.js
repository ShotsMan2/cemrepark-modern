import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Pzt', satis: 4000, ziyaret: 2400 },
  { name: 'Sal', satis: 3000, ziyaret: 1398 },
  { name: 'Çar', satis: 2000, ziyaret: 9800 },
  { name: 'Per', satis: 2780, ziyaret: 3908 },
  { name: 'Cum', satis: 1890, ziyaret: 4800 },
  { name: 'Cmt', satis: 2390, ziyaret: 3800 },
  { name: 'Paz', satis: 3490, ziyaret: 4300 },
];

export default function DashboardView({ products }) {
  const totalProducts = products.length;
  const activeCategories = [...new Set(products.map(p => p.kategori))].filter(Boolean).length;
  const totalValue = products.reduce((sum, p) => sum + (parseFloat(p.fiyat) || 0), 0);
  
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-black/90 border border-white/10 p-4 clip-angled backdrop-blur-md">
          <p className="text-white font-bold mb-2">{label}</p>
          <p className="text-neon-pink text-sm">Satış: {payload[0].value} ₺</p>
          <p className="text-holo-gold text-sm">Ziyaret: {payload[1].value}</p>
        </div>
      );
    }
    return null;
  };
  
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

      {/* Chart Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-panel p-6 md:p-8 clip-angled relative border border-white/5 h-[400px]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-white font-bold uppercase tracking-widest">Haftalık Performans</h3>
            <span className="bg-neon-pink/20 text-neon-pink px-3 py-1 text-xs font-bold rounded">+24% Artış</span>
          </div>
          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorSatis" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ff007f" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#ff007f" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorZiyaret" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ffd700" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#ffd700" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" tick={{fill: 'rgba(255,255,255,0.5)', fontSize: 12}} tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(255,255,255,0.3)" tick={{fill: 'rgba(255,255,255,0.5)', fontSize: 12}} tickLine={false} axisLine={false} tickFormatter={(val) => `₺${val/1000}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="satis" stroke="#ff007f" strokeWidth={3} fillOpacity={1} fill="url(#colorSatis)" />
                <Area type="monotone" dataKey="ziyaret" stroke="#ffd700" strokeWidth={3} fillOpacity={1} fill="url(#colorZiyaret)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity List */}
        <div className="glass-panel p-6 md:p-8 clip-angled relative border border-white/5">
          <h3 className="text-white font-bold uppercase tracking-widest mb-6">Son İşlemler</h3>
          <div className="space-y-6 overflow-y-auto max-h-72 pr-2 custom-scrollbar">
            {[
              { text: "Yeni sipariş alındı #1042", time: "2 dk önce", color: "neon-pink" },
              { text: "Ayşe Y. siparişi teslim edildi", time: "1 saat önce", color: "green-500" },
              { text: "Ürün stoğu güncellendi (Kap)", time: "3 saat önce", color: "holo-gold" },
              { text: "Yeni üye kaydı (zeynep@...)", time: "5 saat önce", color: "purple-500" },
              { text: "Ödeme onaylandı #1041", time: "Dün", color: "green-500" }
            ].map((act, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className={`w-2 h-2 mt-2 rounded-full bg-${act.color} shadow-[0_0_8px_var(--color-${act.color})]`}></div>
                <div>
                  <p className="text-white text-sm">{act.text}</p>
                  <span className="text-gray-500 text-xs">{act.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
