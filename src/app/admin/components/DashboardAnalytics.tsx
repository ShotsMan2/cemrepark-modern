"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";

const PieChart = dynamic(() => import("recharts").then(mod => mod.PieChart), { ssr: false });
const Pie = dynamic(() => import("recharts").then(mod => mod.Pie), { ssr: false });
const Cell = dynamic(() => import("recharts").then(mod => mod.Cell), { ssr: false });
const Tooltip = dynamic(() => import("recharts").then(mod => mod.Tooltip), { ssr: false });
const ResponsiveContainer = dynamic(() => import("recharts").then(mod => mod.ResponsiveContainer), { ssr: false });
const AreaChart = dynamic(() => import("recharts").then(mod => mod.AreaChart), { ssr: false });
const Area = dynamic(() => import("recharts").then(mod => mod.Area), { ssr: false });
const XAxis = dynamic(() => import("recharts").then(mod => mod.XAxis), { ssr: false });
const YAxis = dynamic(() => import("recharts").then(mod => mod.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import("recharts").then(mod => mod.CartesianGrid), { ssr: false });
const BarChart = dynamic(() => import("recharts").then(mod => mod.BarChart), { ssr: false });
const Bar = dynamic(() => import("recharts").then(mod => mod.Bar), { ssr: false });
const Legend = dynamic(() => import("recharts").then(mod => mod.Legend), { ssr: false });
const LineChart = dynamic(() => import("recharts").then(mod => mod.LineChart), { ssr: false });
const Line = dynamic(() => import("recharts").then(mod => mod.Line), { ssr: false });
const ComposedChart = dynamic(() => import("recharts").then(mod => mod.ComposedChart), { ssr: false });

const PIE_COLORS = ["#d61c7b", "#d97706", "#e83d8b", "#f59e0b", "#f06292", "#fbbf24"];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-black/90 border border-glass-border p-3 rounded-lg shadow-2xl backdrop-blur-md">
        <p className="text-foreground font-bold mb-1">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color || entry.fill }}>
            {entry.name}: <span className="font-bold">{entry.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function DashboardAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/analytics");
        if (res.ok) {
          const json = await res.json();
          setData(json);
        } else {
          throw new Error("Failed to fetch");
        }
      } catch (error) {
        console.error("Failed to fetch analytics", error);
        setError("Veriler yüklenirken bir hata oluştu.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="w-full h-96 flex items-center justify-center">
        <div className="flex gap-2">
          <div className="w-3 h-3 bg-primary rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-secondary rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
          <div className="w-3 h-3 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return <div className="text-red-500 p-4 font-bold">{error || "Veri bulunamadı."}</div>;
  }

  return (
    <div className="space-y-6 mt-8 animate-fade-in">
      {/* Top row: Revenue and Orders Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Area Chart */}
        <div className="glass-panel p-6 md:p-8 clip-angled relative border border-glass-border w-full">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-foreground font-bold uppercase tracking-widest text-lg">Gelir Analizi (Son 7 Gün)</h3>
              <p className="text-foreground/60 text-xs">Günlük satış hacmi trendleri</p>
            </div>
            <div className="text-right">
              <p className="text-primary font-black text-2xl">₺{data.revenue?.toLocaleString("tr-TR")}</p>
              <p className="text-foreground/60 text-xs uppercase tracking-widest">Toplam Gelir</p>
            </div>
          </div>
          
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.salesOverTime || []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d61c7b" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#d61c7b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₺${value}`} />
                <Tooltip content={<CustomTooltip active={undefined} payload={undefined} label={undefined} />} />
                <Area type="monotone" dataKey="total" name="Gelir" stroke="#d61c7b" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Orders Bar/Line Chart */}
        <div className="glass-panel p-6 md:p-8 clip-angled relative border border-glass-border w-full">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-foreground font-bold uppercase tracking-widest text-lg">Sipariş Trendi (Son 7 Gün)</h3>
              <p className="text-foreground/60 text-xs">Günlük sipariş adetleri</p>
            </div>
            <div className="text-right">
              <p className="text-[#00ffff] font-black text-2xl">{data.orders?.toLocaleString("tr-TR")}</p>
              <p className="text-foreground/60 text-xs uppercase tracking-widest">Toplam Sipariş</p>
            </div>
          </div>
          
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data.salesOverTime || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip active={undefined} payload={undefined} label={undefined} />} />
                <Bar dataKey="orders" name="Sipariş Adedi" fill="#00ffff" radius={[4, 4, 0, 0]} barSize={30} />
                <Line type="monotone" dataKey="orders" name="Trend" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4, fill: "#f59e0b" }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Middle row: 2 charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution Bar Chart */}
        <div className="glass-panel p-6 md:p-8 clip-angled relative border border-glass-border h-[350px] flex flex-col">
          <h3 className="text-foreground font-bold uppercase tracking-widest mb-2">Kategori Dağılımı</h3>
          <p className="text-foreground/60 text-xs mb-6">Kategorilere göre ürün sayıları</p>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.categoryData || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip active={undefined} payload={undefined} label={undefined} />} />
                <Bar dataKey="value" name="Ürün Sayısı" fill="#ffd700" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Order Status Pie Chart */}
        <div className="glass-panel p-6 md:p-8 clip-angled relative border border-glass-border h-[350px] flex flex-col">
          <h3 className="text-foreground font-bold uppercase tracking-widest mb-2">Sipariş Durum Dağılımı</h3>
          <p className="text-foreground/60 text-xs mb-6">Siparişlerin onaylanma/iptal durumları</p>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.orderStats || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {(data.orderStats || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip active={undefined} payload={undefined} label={undefined} />} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: "12px", color: "#9ca3af" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom row: Login Stats & Roles */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Roles Pie Chart */}
        <div className="glass-panel p-6 md:p-8 clip-angled relative border border-glass-border h-[300px] flex flex-col">
          <h3 className="text-foreground font-bold uppercase tracking-widest mb-2">Kullanıcı Rolleri</h3>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.usersByRole || []}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  stroke="none"
                >
                  {(data.usersByRole || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[(index + 2) % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip active={undefined} payload={undefined} label={undefined} />} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: "12px", color: "#9ca3af" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Login Success Rate */}
        <div className="glass-panel p-6 md:p-8 clip-angled relative border border-glass-border h-[300px] flex flex-col">
          <h3 className="text-foreground font-bold uppercase tracking-widest mb-2">Giriş Başarı Oranı</h3>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.loginStats || []} layout="vertical" margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                <XAxis type="number" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis dataKey="name" type="category" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip active={undefined} payload={undefined} label={undefined} />} />
                <Bar dataKey="value" name="Deneme Sayısı" fill="#00ffff" radius={[0, 4, 4, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
