"use client";
import React, { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import type { AnalyticsDashboardData, RechartsDataPoint, RechartsPieData } from "@/types";

const PieChart = dynamic(() => import("recharts").then((mod) => mod.PieChart), { ssr: false });
const Pie = dynamic(() => import("recharts").then((mod) => mod.Pie), { ssr: false });
const Cell = dynamic(() => import("recharts").then((mod) => mod.Cell), { ssr: false });
const Tooltip = dynamic(() => import("recharts").then((mod) => mod.Tooltip), { ssr: false });
const ResponsiveContainer = dynamic(() => import("recharts").then((mod) => mod.ResponsiveContainer), { ssr: false });
const AreaChart = dynamic(() => import("recharts").then((mod) => mod.AreaChart), { ssr: false });
const Area = dynamic(() => import("recharts").then((mod) => mod.Area), { ssr: false });
const XAxis = dynamic(() => import("recharts").then((mod) => mod.XAxis), { ssr: false });
const YAxis = dynamic(() => import("recharts").then((mod) => mod.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import("recharts").then((mod) => mod.CartesianGrid), { ssr: false });
const BarChart = dynamic(() => import("recharts").then((mod) => mod.BarChart), { ssr: false });
const Bar = dynamic(() => import("recharts").then((mod) => mod.Bar), { ssr: false });
const Legend = dynamic(() => import("recharts").then((mod) => mod.Legend), { ssr: false });
const LineChart = dynamic(() => import("recharts").then((mod) => mod.LineChart), { ssr: false });
const Line = dynamic(() => import("recharts").then((mod) => mod.Line), { ssr: false });
const ComposedChart = dynamic(() => import("recharts").then((mod) => mod.ComposedChart), { ssr: false });
const RadialBarChart = dynamic(() => import("recharts").then((mod) => mod.RadialBarChart), { ssr: false });
const RadialBar = dynamic(() => import("recharts").then((mod) => mod.RadialBar), { ssr: false });
const Treemap = dynamic(() => import("recharts").then((mod) => mod.Treemap), { ssr: false });
const ScatterChart = dynamic(() => import("recharts").then((mod) => mod.ScatterChart), { ssr: false });
const Scatter = dynamic(() => import("recharts").then((mod) => mod.Scatter), { ssr: false });
const ZAxis = dynamic(() => import("recharts").then((mod) => mod.ZAxis), { ssr: false });

const PIE_COLORS = ["#d61c7b", "#d97706", "#e83d8b", "#f59e0b", "#f06292", "#fbbf24", "#a855f7", "#22c55e"];
const RADIAL_COLORS = ["#d61c7b", "#f59e0b", "#00ffff", "#a855f7", "#22c55e"];
const DAY_RANGES = [7, 14, 30, 90];

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color?: string; fill?: string }>; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-black/90 border border-glass-border p-3 rounded-lg shadow-2xl backdrop-blur-md">
        <p className="text-foreground font-bold mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color || entry.fill }}>
            {entry.name}: <span className="font-bold">{typeof entry.value === "number" ? entry.value.toLocaleString("tr-TR") : entry.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function DashboardAnalytics() {
  const [data, setData] = useState<AnalyticsDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [days, setDays] = useState(7);
  const [animated, setAnimated] = useState(false);

  const fetchData = useCallback(async (d: number) => {
    setLoading(true);
    setError(null);
    setAnimated(false);
    try {
      const res = await fetch(`/api/analytics?days=${d}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      } else {
        throw new Error("Failed to fetch");
      }
    } catch (err) {
      console.error("Failed to fetch analytics", err);
      setError("Veriler yüklenirken bir hata oluştu.");
    } finally {
      setLoading(false);
      setTimeout(() => setAnimated(true), 150);
    }
  }, []);

  useEffect(() => { fetchData(days); }, [days, fetchData]);

  const loadingSpinner = (
    <div className="w-full h-64 flex items-center justify-center">
      <div className="flex gap-2">
        <div className="w-3 h-3 bg-primary rounded-full animate-bounce"></div>
        <div className="w-3 h-3 bg-secondary rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
        <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
      </div>
    </div>
  );

  if (loading && !data) return loadingSpinner;

  if (error || !data) {
    return (
      <div className="space-y-4">
        <div className="flex gap-2 mb-4">
          {DAY_RANGES.map((d) => (
            <button key={d} onClick={() => setDays(d)} className={`px-3 py-1 text-xs font-bold rounded clip-angled border transition-all ${days === d ? "bg-primary text-white border-primary" : "bg-foreground/5 text-foreground/70 border-glass-border hover:border-primary/50"}`}>
              {d} Gün
            </button>
          ))}
        </div>
        <div className="text-danger p-4 font-bold">{error || "Veri bulunamadı."}</div>
      </div>
    );
  }

  const d = data as any;
  const salesData = d.salesOverTime || [];
  const categoryData = d.categoryData || [];
  const orderStats = d.orderStats || [];
  const usersByRole = d.usersByRole || [];
  const loginStats = d.loginStats || [];
  const revenueByCategory = d.revenueByCategory || [];
  const topProducts = d.topProducts || [];
  const conversionRate = d.conversionRate || 0;
  const averageOrderValue = d.averageOrderValue || 0;

  const orderValueScatterData = salesData.map((s: any) => ({ name: s.name, value: s.total || 0, orders: s.orders || 0 }));

  return (
    <div className="space-y-6 mt-8 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
        <h2 className="text-foreground font-black uppercase tracking-widest text-xl">Detaylı Analitik</h2>
        <div className="flex gap-2">
          {DAY_RANGES.map((d) => (
            <button key={d} onClick={() => setDays(d)} className={`px-4 py-1.5 text-xs font-bold rounded clip-angled border transition-all ${days === d ? "bg-primary text-white border-primary shadow-lg shadow-primary/30" : "bg-foreground/5 text-foreground/70 border-glass-border hover:border-primary/50 hover:text-primary"}`}>
              Son {d} Gün
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel p-6 md:p-8 clip-angled relative border border-glass-border w-full">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-foreground font-bold uppercase tracking-widest text-lg">Gelir Analizi</h3>
              <p className="text-foreground/60 text-xs">Günlük satış hacmi trendleri</p>
            </div>
            <div className="text-right">
              <p className="text-primary font-black text-2xl">{d.revenue?.toLocaleString("tr-TR")} ₺</p>
              <p className="text-foreground/60 text-xs uppercase tracking-widest">Toplam Gelir</p>
              {d.revenueGrowth > 0 ? (
                <p className="text-success text-xs font-bold">+{d.revenueGrowth}%</p>
              ) : (
                <p className="text-danger text-xs font-bold">{d.revenueGrowth}%</p>
              )}
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d61c7b" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#d61c7b" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorPrevTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6b7280" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6b7280" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₺${value}`} />
                <Tooltip content={<CustomTooltip active={undefined} payload={undefined} label={undefined} />} />
                {d.previousSalesOverTime?.length > 0 && (
                  <Area type="monotone" data={d.previousSalesOverTime} dataKey="total" name="Önceki Dönem" stroke="#6b7280" strokeWidth={2} strokeDasharray="4 4" fillOpacity={1} fill="url(#colorPrevTotal)" isAnimationActive={animated} animationDuration={800} />
                )}
                <Area type="monotone" dataKey="total" name="Gelir" stroke="#d61c7b" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" isAnimationActive={animated} animationDuration={1000} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel p-6 md:p-8 clip-angled relative border border-glass-border w-full">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-foreground font-bold uppercase tracking-widest text-lg">Sipariş Trendi</h3>
              <p className="text-foreground/60 text-xs">Günlük sipariş adetleri</p>
            </div>
            <div className="text-right">
              <p className="text-[#00ffff] font-black text-2xl">{d.orders?.toLocaleString("tr-TR")}</p>
              <p className="text-foreground/60 text-xs uppercase tracking-widest">Toplam Sipariş</p>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={salesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip active={undefined} payload={undefined} label={undefined} />} />
                <Bar dataKey="orders" name="Sipariş Adedi" fill="#00ffff" radius={[4, 4, 0, 0]} barSize={30} isAnimationActive={animated} animationDuration={800} />
                <Line type="monotone" dataKey="orders" name="Trend" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4, fill: "#f59e0b" }} isAnimationActive={animated} animationDuration={1000} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel p-6 md:p-8 clip-angled relative border border-glass-border h-[350px] flex flex-col">
          <h3 className="text-foreground font-bold uppercase tracking-widest mb-2">Dönüşüm Oranları</h3>
          <p className="text-foreground/60 text-xs mb-6">Satış hunisi dönüşüm performansı</p>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="80%" barSize={20} data={[
                { name: "Dönüşüm Oranı", value: conversionRate, fill: "#d61c7b" },
                { name: "Ort. Sipariş Değeri", value: averageOrderValue > 1000 ? 100 : Math.min(averageOrderValue / 100, 100), fill: "#f59e0b" },
                { name: "Müşteri Tutma", value: d.customerRetentionRate || 50, fill: "#00ffff" },
                { name: "Sepet Dönüşüm", value: conversionRate > 0 ? Math.min(conversionRate * 10, 100) : 0, fill: "#a855f7" },
              ]}>
                <RadialBar background dataKey="value" cornerRadius={10} isAnimationActive={animated} animationDuration={1200} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: "12px", color: "#9ca3af" }} />
                <Tooltip content={<CustomTooltip active={undefined} payload={undefined} label={undefined} />} />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel p-6 md:p-8 clip-angled relative border border-glass-border h-[350px] flex flex-col">
          <h3 className="text-foreground font-bold uppercase tracking-widest mb-2">Kategori Gelir Dağılımı</h3>
          <p className="text-foreground/60 text-xs mb-6">Kategorilere göre gelir dağılımı (Treemap)</p>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <Treemap data={revenueByCategory.length > 0 ? revenueByCategory : categoryData} dataKey="value" aspectRatio={4 / 3} stroke="#111" fill="#d61c7b" isAnimationActive={animated} animationDuration={1000}>
                <Tooltip content={<CustomTooltip active={undefined} payload={undefined} label={undefined} />} />
              </Treemap>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel p-6 md:p-8 clip-angled relative border border-glass-border h-[350px] flex flex-col">
          <h3 className="text-foreground font-bold uppercase tracking-widest mb-2">Sipariş Değeri / Adet Analizi</h3>
          <p className="text-foreground/60 text-xs mb-6">Günlük sipariş değeri ve adet dağılımı</p>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 10, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="value" name="Gelir" stroke="#6b7280" fontSize={12} tickFormatter={(val) => `₺${val}`} />
                <YAxis dataKey="orders" name="Sipariş" stroke="#6b7280" fontSize={12} />
                <Tooltip content={<CustomTooltip active={undefined} payload={undefined} label={undefined} />} />
                <Scatter data={orderValueScatterData} fill="#d61c7b" isAnimationActive={animated} animationDuration={800} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel p-6 md:p-8 clip-angled relative border border-glass-border h-[350px] flex flex-col">
          <h3 className="text-foreground font-bold uppercase tracking-widest mb-2">Kategori Dağılımı</h3>
          <p className="text-foreground/60 text-xs mb-6">Kategorilere göre ürün sayıları</p>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip active={undefined} payload={undefined} label={undefined} />} />
                <Bar dataKey="value" name="Ürün Sayısı" fill="#ffd700" radius={[4, 4, 0, 0]} isAnimationActive={animated} animationDuration={800} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel p-6 md:p-8 clip-angled relative border border-glass-border h-[350px] flex flex-col">
          <h3 className="text-foreground font-bold uppercase tracking-widest mb-2">Sipariş Durum Dağılımı</h3>
          <p className="text-foreground/60 text-xs mb-6">Siparişlerin durumları</p>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={orderStats} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={5} dataKey="value" stroke="none" isAnimationActive={animated} animationDuration={800}>
                  {orderStats.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip active={undefined} payload={undefined} label={undefined} />} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: "12px", color: "#9ca3af" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel p-6 md:p-8 clip-angled relative border border-glass-border h-[350px] flex flex-col">
          <h3 className="text-foreground font-bold uppercase tracking-widest mb-2">Kullanıcı Rolleri</h3>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={usersByRole} cx="50%" cy="50%" outerRadius={80} dataKey="value" stroke="none" isAnimationActive={animated} animationDuration={800}>
                  {usersByRole.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[(index + 2) % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip active={undefined} payload={undefined} label={undefined} />} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: "12px", color: "#9ca3af" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel p-6 md:p-8 clip-angled relative border border-glass-border h-[300px] flex flex-col">
          <h3 className="text-foreground font-bold uppercase tracking-widest mb-2">Giriş Başarı Oranı</h3>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={loginStats} layout="vertical" margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                <XAxis type="number" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis dataKey="name" type="category" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip active={undefined} payload={undefined} label={undefined} />} />
                <Bar dataKey="value" name="Deneme Sayısı" fill="#00ffff" radius={[0, 4, 4, 0]} barSize={30} isAnimationActive={animated} animationDuration={800} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel p-6 md:p-8 clip-angled relative border border-glass-border h-[300px] flex flex-col">
          <h3 className="text-foreground font-bold uppercase tracking-widest mb-2">En Çok Satan Ürünler</h3>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProducts.slice(0, 6)} layout="vertical" margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                <XAxis type="number" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis dataKey="name" type="category" stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} width={140} />
                <Tooltip content={<CustomTooltip active={undefined} payload={undefined} label={undefined} />} />
                <Bar dataKey="value" fill="#ffd700" radius={[0, 4, 4, 0]} barSize={20} isAnimationActive={animated} animationDuration={800} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
