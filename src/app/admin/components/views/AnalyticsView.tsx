"use client";
import React, { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import ExportButton from "../ExportButton";

const AreaChart = dynamic(() => import("recharts").then((mod) => mod.AreaChart), { ssr: false });
const Area = dynamic(() => import("recharts").then((mod) => mod.Area), { ssr: false });
const BarChart = dynamic(() => import("recharts").then((mod) => mod.BarChart), { ssr: false });
const Bar = dynamic(() => import("recharts").then((mod) => mod.Bar), { ssr: false });
const LineChart = dynamic(() => import("recharts").then((mod) => mod.LineChart), { ssr: false });
const Line = dynamic(() => import("recharts").then((mod) => mod.Line), { ssr: false });
const ComposedChart = dynamic(() => import("recharts").then((mod) => mod.ComposedChart), { ssr: false });
const PieChart = dynamic(() => import("recharts").then((mod) => mod.PieChart), { ssr: false });
const Pie = dynamic(() => import("recharts").then((mod) => mod.Pie), { ssr: false });
const Cell = dynamic(() => import("recharts").then((mod) => mod.Cell), { ssr: false });
const RadialBarChart = dynamic(() => import("recharts").then((mod) => mod.RadialBarChart), { ssr: false });
const RadialBar = dynamic(() => import("recharts").then((mod) => mod.RadialBar), { ssr: false });
const Treemap = dynamic(() => import("recharts").then((mod) => mod.Treemap), { ssr: false });
const ScatterChart = dynamic(() => import("recharts").then((mod) => mod.ScatterChart), { ssr: false });
const Scatter = dynamic(() => import("recharts").then((mod) => mod.Scatter), { ssr: false });
const XAxis = dynamic(() => import("recharts").then((mod) => mod.XAxis), { ssr: false });
const YAxis = dynamic(() => import("recharts").then((mod) => mod.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import("recharts").then((mod) => mod.CartesianGrid), { ssr: false });
const Tooltip = dynamic(() => import("recharts").then((mod) => mod.Tooltip), { ssr: false });
const Legend = dynamic(() => import("recharts").then((mod) => mod.Legend), { ssr: false });
const ResponsiveContainer = dynamic(() => import("recharts").then((mod) => mod.ResponsiveContainer), { ssr: false });
const ReferenceLine = dynamic(() => import("recharts").then((mod) => mod.ReferenceLine), { ssr: false });
const ZAxis = dynamic(() => import("recharts").then((mod) => mod.ZAxis), { ssr: false });
const FunnelChart = dynamic(() => import("recharts").then((mod) => mod.FunnelChart), { ssr: false });
const Funnel = dynamic(() => import("recharts").then((mod) => mod.Funnel), { ssr: false });

const COLORS = ["#d61c7b", "#d97706", "#e83d8b", "#f59e0b", "#f06292", "#fbbf24", "#a855f7", "#22c55e", "#3b82f6", "#ef4444"];
const RANGES = [7, 14, 30, 90];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-black/90 border border-glass-border p-3 rounded-lg shadow-2xl backdrop-blur-md">
        <p className="text-foreground font-bold mb-1">{label}</p>
        {payload.map((entry: any, i: number) => (
          <p key={i} className="text-sm" style={{ color: entry.color || entry.fill }}>
            {entry.name}: <span className="font-bold">{typeof entry.value === "number" ? entry.value.toLocaleString("tr-TR") : entry.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function AnalyticsView() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);
  const [compareMode, setCompareMode] = useState(false);
  const [animated, setAnimated] = useState(false);

  const fetchData = useCallback(async (d: number) => {
    setLoading(true);
    setAnimated(false);
    try {
      const res = await fetch(`/api/analytics?days=${d}`);
      if (res.ok) { const json = await res.json(); setData(json); }
    } catch (err) { console.error("Analytics fetch error:", err); }
    finally { setLoading(false); setTimeout(() => setAnimated(true), 200); }
  }, []);

  useEffect(() => { fetchData(days); }, [days, fetchData]);

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex gap-2">
          <div className="w-3 h-3 bg-primary rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-secondary rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
          <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
        </div>
      </div>
    );
  }

  const d = data as any;
  const salesOverTime = d?.salesOverTime || [];
  const previousSalesOverTime = d?.previousSalesOverTime || [];
  const categoryData = d?.categoryData || [];
  const revenueByCategory = d?.revenueByCategory || [];
  const orderStats = d?.orderStats || [];
  const usersByRole = d?.usersByRole || [];
  const loginStats = d?.loginStats || [];
  const topProducts = d?.topProducts || [];
  const userGrowth = d?.userGrowth || [];

  const funnelData = [
    { step: "Ziyaretçi", value: 12500, fill: "#3b82f6" },
    { step: "Sepet", value: 4200, fill: "#a855f7" },
    { step: "Ödeme", value: 1800, fill: "#f59e0b" },
    { step: "Satın Alma", value: d?.periodOrdersCount || 0, fill: "#d61c7b" },
  ];

  const exportData = salesOverTime.map((s: any) => ({ Tarih: s.name, Gelir: s.total, Siparis: s.orders }));

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-foreground uppercase tracking-widest">Analitik Raporlar</h2>
          <p className="text-foreground/50 text-sm mt-1">Gelişmiş raporlama ve karşılaştırmalı analiz</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex gap-1 bg-foreground/5 rounded-lg p-1 border border-glass-border">
            {RANGES.map((r) => (
              <button key={r} onClick={() => setDays(r)} className={`px-3 py-1.5 text-xs font-bold rounded transition-all ${days === r ? "bg-primary text-white shadow-lg shadow-primary/30" : "text-foreground/70 hover:text-primary"}`}>
                {r} Gün
              </button>
            ))}
          </div>
          <button onClick={() => setCompareMode(!compareMode)} className={`px-3 py-1.5 text-xs font-bold rounded border transition-all ${compareMode ? "bg-secondary/20 border-secondary text-secondary" : "border-glass-border text-foreground/70 hover:text-primary"}`}>
            {compareMode ? "Karşılaştırma: Açık" : "Karşılaştırma: Kapalı"}
          </button>
          <ExportButton data={exportData} filename={`analytics_${days}_gun`} label="Rapor İndir" columns={[{ key: "Tarih", header: "Tarih" }, { key: "Gelir", header: "Gelir" }, { key: "Siparis", header: "Sipariş" }]} />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { title: "Toplam Gelir", value: `${(d?.revenue || 0).toLocaleString("tr-TR")} ₺`, sub: "Seçilen dönem", color: "text-primary" },
          { title: "Toplam Sipariş", value: d?.periodOrdersCount || 0, sub: "Adet", color: "text-[#00ffff]" },
          { title: "Ort. Sipariş Değeri", value: `${Math.round(d?.averageOrderValue || 0).toLocaleString("tr-TR")} ₺`, sub: "Sipariş başına", color: "text-[#f59e0b]" },
          { title: "Dönüşüm Oranı", value: `%${d?.conversionRate || 0}`, sub: "Ziyaretçi → Satış", color: "text-[#a855f7]" },
        ].map((kpi, i) => (
          <div key={i} className="glass-panel p-5 clip-angled border border-glass-border relative overflow-hidden group hover:border-primary/30 transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary opacity-5 rounded-bl-full group-hover:scale-110 transition-transform"></div>
            <p className="text-foreground/60 text-[10px] font-bold uppercase tracking-widest mb-1">{kpi.title}</p>
            <h3 className={`text-2xl font-black text-foreground mb-1 ${kpi.color}`}>{kpi.value}</h3>
            <p className="text-foreground/50 text-xs font-bold">{kpi.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel p-6 clip-angled border border-glass-border h-[400px]">
          <h3 className="text-foreground font-bold uppercase tracking-widest mb-1">Gelir Trendi</h3>
          <p className="text-foreground/60 text-xs mb-4">Günlük satış hacmi {compareMode && "(önceki dönemle karşılaştırmalı)"}</p>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesOverTime}>
                <defs><linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#d61c7b" stopOpacity={0.8} /><stop offset="95%" stopColor="#d61c7b" stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `₺${v}`} />
                <Tooltip content={<CustomTooltip />} />
                {compareMode && previousSalesOverTime.length > 0 && (
                  <Area type="monotone" data={previousSalesOverTime} dataKey="total" name="Önceki Dönem" stroke="#6b7280" strokeWidth={2} strokeDasharray="4 4" fillOpacity={0.3} fill="#6b7280" isAnimationActive={animated} animationDuration={800} />
                )}
                <Area type="monotone" dataKey="total" name="Gelir" stroke="#d61c7b" strokeWidth={3} fillOpacity={1} fill="url(#revGrad)" isAnimationActive={animated} animationDuration={1000} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel p-6 clip-angled border border-glass-border h-[400px]">
          <h3 className="text-foreground font-bold uppercase tracking-widest mb-1">Kullanıcı Büyümesi</h3>
          <p className="text-foreground/60 text-xs mb-4">Aylık yeni kayıtlar {compareMode && "(karşılaştırmalı)"}</p>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={userGrowth}>
                <defs><linearGradient id="userGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} /><stop offset="95%" stopColor="#3b82f6" stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="users" name="Yeni Kullanıcı" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#userGrad)" isAnimationActive={animated} animationDuration={1000} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-panel p-6 clip-angled border border-glass-border h-[350px] flex flex-col">
          <h3 className="text-foreground font-bold uppercase tracking-widest mb-2">Dönüşüm Oranları</h3>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="80%" barSize={18} data={[
                { name: "Dönüşüm", value: Math.min(d?.conversionRate || 0, 100), fill: "#d61c7b" },
                { name: "Müşteri Tutma", value: Math.min(d?.customerRetentionRate || 0, 100), fill: "#00ffff" },
                { name: "Ort. Sip. Değeri", value: Math.min((d?.averageOrderValue || 0) / 100, 100), fill: "#f59e0b" },
              ]}>
                <RadialBar background dataKey="value" cornerRadius={10} isAnimationActive={animated} animationDuration={1200} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: "11px", color: "#9ca3af" }} />
                <Tooltip content={<CustomTooltip />} />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel p-6 clip-angled border border-glass-border h-[350px] flex flex-col lg:col-span-2">
          <h3 className="text-foreground font-bold uppercase tracking-widest mb-2">Kategori Gelir Dağılımı</h3>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <Treemap data={revenueByCategory.length > 0 ? revenueByCategory : categoryData} dataKey="value" aspectRatio={4 / 3} stroke="#111" fill="#d61c7b" isAnimationActive={animated} animationDuration={1000}>
                <Tooltip content={<CustomTooltip />} />
              </Treemap>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel p-6 clip-angled border border-glass-border h-[350px] flex flex-col">
          <h3 className="text-foreground font-bold uppercase tracking-widest mb-2">Sipariş Değeri Dağılımı</h3>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="total" name="Gelir" stroke="#6b7280" fontSize={12} tickFormatter={(v) => `₺${v}`} />
                <YAxis dataKey="orders" name="Sipariş" stroke="#6b7280" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Scatter data={salesOverTime} fill="#d61c7b" isAnimationActive={animated} animationDuration={800} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel p-6 clip-angled border border-glass-border h-[350px] flex flex-col">
          <h3 className="text-foreground font-bold uppercase tracking-widest mb-2">Dönüşüm Hunisi</h3>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <FunnelChart>
                <Tooltip content={<CustomTooltip />} />
                <Funnel dataKey="value" data={funnelData} isAnimationActive={animated} animationDuration={800}>
                  {funnelData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Funnel>
              </FunnelChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-panel p-6 clip-angled border border-glass-border h-[350px] flex flex-col">
          <h3 className="text-foreground font-bold uppercase tracking-widest mb-2">Kategoriler</h3>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" outerRadius={80} dataKey="value" stroke="none" isAnimationActive={animated} animationDuration={800}>
                  {categoryData.map((_: any, i: number) => (<Cell key={i} fill={COLORS[i % COLORS.length]} />))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: "10px", color: "#9ca3af" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel p-6 clip-angled border border-glass-border h-[350px] flex flex-col">
          <h3 className="text-foreground font-bold uppercase tracking-widest mb-2">En Çok Satanlar</h3>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProducts.slice(0, 6)} layout="vertical" margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                <XAxis type="number" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis dataKey="name" type="category" stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} width={140} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" fill="#f59e0b" radius={[0, 4, 4, 0]} barSize={20} isAnimationActive={animated} animationDuration={800} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel p-6 clip-angled border border-glass-border h-[350px] flex flex-col">
          <h3 className="text-foreground font-bold uppercase tracking-widest mb-2">Sipariş Durumları</h3>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={orderStats} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none" isAnimationActive={animated} animationDuration={800}>
                  {orderStats.map((_: any, i: number) => (<Cell key={i} fill={COLORS[i % COLORS.length]} />))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: "10px", color: "#9ca3af" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel p-6 clip-angled border border-glass-border h-[300px] flex flex-col">
          <h3 className="text-foreground font-bold uppercase tracking-widest mb-2">Kullanıcı Rolleri</h3>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={usersByRole} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" name="Kullanıcı" fill="#a855f7" radius={[4, 4, 0, 0]} isAnimationActive={animated} animationDuration={800} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel p-6 clip-angled border border-glass-border h-[300px] flex flex-col">
          <h3 className="text-foreground font-bold uppercase tracking-widest mb-2">Giriş İstatistikleri</h3>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={loginStats} layout="vertical" margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                <XAxis type="number" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis dataKey="name" type="category" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" name="Deneme" fill="#00ffff" radius={[0, 4, 4, 0]} barSize={30} isAnimationActive={animated} animationDuration={800} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
