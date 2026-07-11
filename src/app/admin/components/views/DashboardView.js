import { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import DashboardAnalytics from "../DashboardAnalytics";

const COLORS = ["#ff007f", "#ffd700", "#a855f7", "#3b82f6", "#22c55e", "#ef4444"];

export default function DashboardView({ products }) {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetch("/api/analytics")
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch((err) => console.error("Analytics fetch error:", err));
  }, []);

  const totalProducts = stats ? stats.products : products.length;
  const activeCategories = stats ? stats.categories : [...new Set(products.map((p) => p.kategori))].filter(Boolean).length;
  const totalRevenue = stats ? stats.revenue : 0;
  const totalOrders = stats ? stats.orders : 0;

  const chartData = stats?.salesOverTime || [];
  const catData = stats?.categoryData || [];
  const totalCategoryValue = catData.reduce((sum, item) => sum + item.value, 0);
  const loginData = stats?.loginStats || [];
  const orderData = stats?.orderStats || [];

  const [activities, setActivities] = useState([
    { text: "Yeni sipariş alındı #1042", time: "2 dk önce", color: "neon-pink" },
    { text: "Ayşe Y. siparişi teslim edildi", time: "1 saat önce", color: "green-500" },
    { text: "Ürün stoğu güncellendi (Kap)", time: "3 saat önce", color: "holo-gold" },
    { text: "Yeni üye kaydı (zeynep@...)", time: "5 saat önce", color: "purple-500" },
    { text: "Ödeme onaylandı #1041", time: "Dün", color: "green-500" },
  ]);

  useEffect(() => {
    const fetchRecentMessages = async () => {
      try {
        const res = await fetch("/api/messages");
        if (res.ok) {
          const messagesData = await res.json();
          const messageActivities = messagesData.map((msg) => ({
            text: `Yeni İletişim Mesajı: ${msg.adSoyad}`,
            time: msg.tarih,
            color: "neon-pink",
          }));

          setActivities((prev) => {
            const mockActs = prev.filter((a) => !a.text.startsWith("Yeni İletişim Mesajı:"));
            return [...messageActivities, ...mockActs];
          });
        }
      } catch (error) {
        console.error("Dashboard son işlemler yüklenirken hata:", error);
      }
    };
    fetchRecentMessages();
  }, []);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-black/90 border border-white/10 p-4 clip-angled backdrop-blur-md">
          <p className="text-white font-bold mb-2">{label}</p>
          <p className="text-neon-pink text-sm">Satış Tutarı: {payload[0]?.value} ₺</p>
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
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">
            Toplam Ürün
          </p>
          <h3 className="text-3xl font-black text-white">{totalProducts}</h3>
          <p className="text-neon-pink text-xs mt-2 font-bold">+12% geçen aya göre</p>
        </div>

        {/* Metric Card 2 */}
        <div className="glass-panel p-6 clip-angled relative overflow-hidden group hover:border-holo-gold transition-colors">
          <div className="absolute top-0 right-0 w-24 h-24 bg-holo-gold opacity-10 rounded-bl-full group-hover:scale-110 transition-transform"></div>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">
            Aktif Kategoriler
          </p>
          <h3 className="text-3xl font-black text-white">{activeCategories}</h3>
          <p className="text-holo-gold text-xs mt-2 font-bold">Yeni sezon güncel</p>
        </div>

        {/* Metric Card 3 */}
        <div className="glass-panel p-6 clip-angled relative overflow-hidden group hover:border-purple-500 transition-colors">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500 opacity-10 rounded-bl-full group-hover:scale-110 transition-transform"></div>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">
            Toplam Gelir
          </p>
          <h3 className="text-3xl font-black text-white">
            {totalRevenue.toLocaleString("tr-TR")} ₺
          </h3>
          <p className="text-purple-500 text-xs mt-2 font-bold">Tamamlanan satışlar</p>
        </div>

        {/* Metric Card 4 */}
        <div className="glass-panel p-6 clip-angled relative overflow-hidden group hover:border-green-500 transition-colors">
          <div className="absolute top-0 right-0 w-24 h-24 bg-green-500 opacity-10 rounded-bl-full group-hover:scale-110 transition-transform"></div>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">
            Toplam Sipariş
          </p>
          <h3 className="text-3xl font-black text-white">{totalOrders}</h3>
          <p className="text-green-500 text-xs mt-2 font-bold">Tüm zamanlar</p>
        </div>
      </div>

      {/* Chart Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-panel p-6 md:p-8 clip-angled relative border border-white/5 h-[400px]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-white font-bold uppercase tracking-widest">Haftalık Performans</h3>
            <span className="bg-neon-pink/20 text-neon-pink px-3 py-1 text-xs font-bold rounded">
              +24% Artış
            </span>
          </div>
          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSatis" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ff007f" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#ff007f" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.05)"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  stroke="rgba(255,255,255,0.3)"
                  tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="rgba(255,255,255,0.3)"
                  tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `₺${val}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="#ff007f"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorSatis)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity List */}
        <div className="glass-panel p-6 md:p-8 clip-angled relative border border-white/5">
          <h3 className="text-white font-bold uppercase tracking-widest mb-6">Son İşlemler</h3>
          <div className="space-y-6 overflow-y-auto max-h-72 pr-2 custom-scrollbar">
            {activities.map((act, i) => (
              <div key={i} className="flex items-start gap-4">
                <div
                  className={`w-2 h-2 mt-2 rounded-full bg-${act.color} shadow-[0_0_8px_var(--color-${act.color})]`}
                ></div>
                <div>
                  <p className="text-white text-sm">{act.text}</p>
                  <span className="text-gray-500 text-xs">{act.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <DashboardAnalytics />

      {/* Advanced Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8 animate-fade-in">
        {/* Category Distribution Pie Chart */}
        <div className="glass-panel p-6 md:p-8 clip-angled relative border border-white/5 h-[400px] flex flex-col">
          <h3 className="text-white font-bold uppercase tracking-widest mb-2">Kategori Dağılımı</h3>
          <p className="text-gray-500 text-xs mb-6">
            Satışların ürün kategorilerine göre yüzdelik oranları
          </p>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={catData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {catData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => {
                    const percentage = ((value / totalCategoryValue) * 100).toFixed(1);
                    return [`${value} (${percentage}%)`, name];
                  }}
                  contentStyle={{
                    backgroundColor: "rgba(0,0,0,0.9)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 0,
                  }}
                  itemStyle={{ color: "#fff", fontWeight: "bold" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-4 flex-wrap">
            {catData.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                ></div>
                <span className="text-gray-400 text-xs font-bold uppercase">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Selling Products Mock */}
        <div className="glass-panel p-6 clip-angled relative border border-white/5 h-[400px]">
          <h3 className="text-white font-bold uppercase tracking-widest mb-1">En Çok Satanlar</h3>
          <p className="text-gray-500 text-xs mb-4">Bu ayın en popüler ürünleri</p>

          <div className="space-y-3 overflow-y-auto max-h-[280px] pr-1 custom-scrollbar">
            {[
              {
                name: "Premium Kadın Takım Siyah",
                sales: 124,
                rev: "310.000 ₺",
                progress: 85,
                color: "neon-pink",
              },
              {
                name: "Yeni Sezon Tunik Bej",
                sales: 98,
                rev: "147.000 ₺",
                progress: 65,
                color: "holo-gold",
              },
              {
                name: "Klasik Ceket Ekru",
                sales: 75,
                rev: "187.500 ₺",
                progress: 45,
                color: "purple-500",
              },
              {
                name: "Günlük Elbise Desenli",
                sales: 42,
                rev: "63.000 ₺",
                progress: 25,
                color: "blue-400",
              },
            ].map((prod, i) => (
              <div key={i} className="bg-black/30 p-2.5 border border-white/5 clip-angled">
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-white font-bold truncate pr-4 text-xs md:text-sm">
                    {prod.name}
                  </span>
                  <span className="text-holo-gold font-bold whitespace-nowrap text-xs md:text-sm">
                    {prod.rev}
                  </span>
                </div>
                <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                  <span>{prod.sales} Adet satıldı</span>
                </div>
                <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-${prod.color}`}
                    style={{ width: `${prod.progress}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
