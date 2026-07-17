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
  BarChart,
  Bar,
  ComposedChart,
  Line
} from "recharts";
import DashboardAnalytics from "../DashboardAnalytics";
import { transformCategoryPopularity } from "@/utils/rechartsHelpers";
import StockWarning from "@/components/admin/StockWarning";

const COLORS = ["#ff007f", "#ffd700", "#a855f7", "#3b82f6", "#22c55e", "#ef4444"];

export default function DashboardView({ products }) {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/analytics")
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Analytics fetch error:", err);
        setIsLoading(false);
      });
  }, []);

  const safeProducts = Array.isArray(products) ? products : [];
  const totalProducts = stats && typeof stats.products === 'number' ? stats.products : safeProducts.length;
  const activeCategories = stats && typeof stats.categories === 'number' ? stats.categories : [...new Set(safeProducts.map((p) => p.kategori))].filter(Boolean).length;
  const totalRevenue = stats && typeof stats.revenue === 'number' ? stats.revenue : 0;
  const totalOrders = stats && typeof stats.orders === 'number' ? stats.orders : 0;

  const chartData = stats?.salesOverTime?.length > 0 ? stats.salesOverTime : [
    { name: "Pzt", total: 0 },
    { name: "Sal", total: 0 },
    { name: "Çar", total: 0 },
    { name: "Per", total: 0 },
    { name: "Cum", total: 0 },
    { name: "Cmt", total: 0 },
    { name: "Paz", total: 0 }
  ];
  const catData = stats?.categoryData?.length > 0 ? stats.categoryData : transformCategoryPopularity(safeProducts);
  const totalCategoryValue = catData.reduce((sum, item) => sum + item.value, 0);
  const loginData = stats?.loginStats || [];
  const orderData = stats?.orderStats?.length > 0 ? stats.orderStats : [
    { name: "Beklemede", value: 0 },
    { name: "Onaylandı", value: 0 },
    { name: "Hazırlanıyor", value: 0 },
    { name: "Kargolandı", value: 0 },
    { name: "Teslim Edildi", value: 0 },
    { name: "İptal", value: 0 }
  ];

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

  if (isLoading) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="glass-panel p-6 clip-angled border border-white/5 h-32 animate-pulse flex flex-col justify-between">
              <div className="w-24 h-4 bg-white/10 rounded"></div>
              <div className="w-32 h-8 bg-white/20 rounded mt-4"></div>
              <div className="w-16 h-3 bg-white/10 rounded mt-2"></div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <div className="lg:col-span-2 glass-panel p-6 border border-white/5 h-[400px] animate-pulse">
            <div className="w-48 h-6 bg-white/10 rounded mb-6"></div>
            <div className="w-full h-72 bg-white/5 rounded"></div>
          </div>
          <div className="glass-panel p-6 border border-white/5 animate-pulse">
            <div className="w-32 h-6 bg-white/10 rounded mb-6"></div>
            <div className="space-y-6">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-2 h-2 rounded-full bg-white/20 mt-2"></div>
                  <div className="flex-1 space-y-2">
                    <div className="w-3/4 h-4 bg-white/10 rounded"></div>
                    <div className="w-1/4 h-3 bg-white/5 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleExportCSV = () => {
    try {
      const headers = ["Metrik", "Deger"];
      const rows = [
        ["Toplam Urun", totalProducts],
        ["Aktif Kategoriler", activeCategories],
        ["Toplam Gelir", totalRevenue],
        ["Toplam Siparis", totalOrders],
      ];

      rows.push(["", ""]);
      rows.push(["Gun", "Satis Tutari"]);
      chartData.forEach(d => {
        rows.push([d.name, d.total]);
      });

      const csvContent = "\uFEFF" + headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", "dashboard_rapor.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Export error", error);
    }
  };

  const targetData = [
    { name: "Oca", gerceklesen: 12000, hedef: 15000 },
    { name: "Şub", gerceklesen: 18000, hedef: 16000 },
    { name: "Mar", gerceklesen: 25000, hedef: 20000 },
    { name: "Nis", gerceklesen: 22000, hedef: 25000 },
    { name: "May", gerceklesen: 32000, hedef: 28000 },
    { name: "Haz", gerceklesen: Math.max(35000, totalRevenue), hedef: 30000 },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header and Export Action */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
        <div>
          <h2 className="text-2xl font-black text-white uppercase tracking-widest">Genel Bakış</h2>
          <p className="text-gray-400 text-sm mt-1">Platformun anlık özet durumu ve performans metrikleri</p>
        </div>
        <button 
          onClick={handleExportCSV}
          className="flex items-center gap-2 glass-panel hover:bg-neon-pink hover:border-neon-pink hover:shadow-[0_0_20px_rgba(225,29,72,0.4)] text-white px-5 py-2.5 text-sm font-bold uppercase tracking-wider transition-all duration-300 clip-angled group"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-y-1 transition-transform duration-300">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          CSV Dışa Aktar
        </button>
      </div>

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

      {/* Stock Warning Component */}
      <div className="mt-8 animate-fade-in" data-aos="fade-up">
        <StockWarning items={safeProducts.filter(p => typeof p.stok === 'number' && p.stok < 5).map(p => ({id: p.id, ad: p.ad, resim: p.gorsel || p.resim, stok: p.stok, renk: p.renk, beden: p.beden}))} />
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

        {/* Top Selling Products Bar Chart */}
        <div className="glass-panel p-6 clip-angled relative border border-white/5 h-[400px]" data-aos="fade-up" data-aos-delay="200">
          <h3 className="text-white font-bold uppercase tracking-widest mb-1">En Çok Satanlar</h3>
          <p className="text-gray-500 text-xs mb-4">Bu ayın en popüler ürün satışları</p>

          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { name: "Premium Kadın Takım Siyah", value: 124 },
                  { name: "Yeni Sezon Tunik Bej", value: 98 },
                  { name: "Klasik Ceket Ekru", value: 75 },
                  { name: "Günlük Elbise Desenli", value: 42 }
                ]}
                margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                <XAxis type="number" stroke="rgba(255,255,255,0.3)" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }} />
                <YAxis dataKey="name" type="category" stroke="rgba(255,255,255,0.3)" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 10 }} width={120} />
                <Tooltip contentStyle={{ backgroundColor: "rgba(0,0,0,0.9)", border: "1px solid rgba(255,255,255,0.1)" }} itemStyle={{ color: "#fff", fontWeight: "bold" }} />
                <Bar dataKey="value" fill="#ffd700" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Security & Orders Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8 animate-fade-in" data-aos="fade-up" data-aos-delay="300">
        {/* Order Status Distribution */}
        <div className="glass-panel p-6 clip-angled relative border border-white/5 h-[350px]">
          <h3 className="text-white font-bold uppercase tracking-widest mb-1">Sipariş Durumları</h3>
          <p className="text-gray-500 text-xs mb-4">Mevcut siparişlerin anlık durum dağılımı</p>
          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={orderData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }} />
                <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }} />
                <Tooltip contentStyle={{ backgroundColor: "rgba(0,0,0,0.9)", border: "1px solid rgba(255,255,255,0.1)" }} itemStyle={{ color: "#fff", fontWeight: "bold" }} />
                <Bar dataKey="value" fill="#a855f7" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Login History Pie Chart */}
        <div className="glass-panel p-6 md:p-8 clip-angled relative border border-white/5 h-[350px] flex flex-col">
          <h3 className="text-white font-bold uppercase tracking-widest mb-2">Giriş İstatistikleri</h3>
          <p className="text-gray-500 text-xs mb-4">Başarılı ve başarısız yönetici/kullanıcı giriş oranları</p>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={loginData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {loginData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.name === "Başarılı" ? "#22c55e" : "#ef4444"} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: "rgba(0,0,0,0.9)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 0 }}
                  itemStyle={{ color: "#fff", fontWeight: "bold" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-gray-400 text-xs font-bold uppercase">Başarılı</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-gray-400 text-xs font-bold uppercase">Başarısız</span>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Target Analysis Row */}
      <div className="grid grid-cols-1 gap-6 mt-8 animate-fade-in" data-aos="fade-up" data-aos-delay="400">
        <div className="glass-panel p-6 md:p-8 clip-angled relative border border-white/5 h-[450px]">
          <div className="absolute top-0 left-0 w-32 h-32 bg-purple-500 opacity-5 rounded-br-full pointer-events-none"></div>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-white font-bold uppercase tracking-widest mb-1">Gelir ve Hedef Analizi</h3>
              <p className="text-gray-500 text-xs">Aylık gerçekleşen gelir ile öngörülen hedeflerin karşılaştırması</p>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-neon-pink rounded-sm"></div>
                <span className="text-gray-400 text-xs font-bold">Gerçekleşen</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-holo-gold rounded-full"></div>
                <span className="text-gray-400 text-xs font-bold">Hedef</span>
              </div>
            </div>
          </div>
          <div className="w-full h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={targetData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }} />
                <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }} tickFormatter={(val) => `₺${val / 1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "rgba(0,0,0,0.9)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px" }} 
                  itemStyle={{ color: "#fff", fontWeight: "bold" }}
                  formatter={(value) => `₺${value.toLocaleString()}`}
                />
                <Bar dataKey="gerceklesen" fill="#ff007f" radius={[4, 4, 0, 0]} barSize={40} />
                <Line type="monotone" dataKey="hedef" stroke="#ffd700" strokeWidth={3} dot={{ r: 6, fill: "#ffd700", strokeWidth: 2, stroke: "#000" }} activeDot={{ r: 8 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
