"use client";

import React, { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar,
  Legend
} from "recharts";

const PIE_COLORS = ["#d61c7b", "#d97706", "#e83d8b", "#f59e0b", "#f06292", "#fbbf24"];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-black/90 border border-white/10 p-3 rounded-lg shadow-2xl backdrop-blur-md">
        <p className="text-white font-bold mb-1">{label}</p>
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
      {/* Top row: Revenue Area Chart */}
      <div className="glass-panel p-6 md:p-8 clip-angled relative border border-white/5 w-full">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-white font-bold uppercase tracking-widest text-lg">Gelir Analizi (Son 7 Gün)</h3>
            <p className="text-gray-500 text-xs">Günlük satış hacmi trendleri</p>
          </div>
          <div className="text-right">
            <p className="text-primary font-black text-2xl">₺{data.revenue?.toLocaleString("tr-TR")}</p>
            <p className="text-gray-500 text-xs uppercase tracking-widest">Toplam Gelir</p>
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
              <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="total" name="Gelir" stroke="#d61c7b" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Middle row: 2 charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution Bar Chart */}
        <div className="glass-panel p-6 md:p-8 clip-angled relative border border-white/5 h-[350px] flex flex-col">
          <h3 className="text-white font-bold uppercase tracking-widest mb-2">Kategori Dağılımı</h3>
          <p className="text-gray-500 text-xs mb-6">Kategorilere göre ürün sayıları</p>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.categoryData || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" name="Ürün Sayısı" fill="#ffd700" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Order Status Pie Chart */}
        <div className="glass-panel p-6 md:p-8 clip-angled relative border border-white/5 h-[350px] flex flex-col">
          <h3 className="text-white font-bold uppercase tracking-widest mb-2">Sipariş Durum Dağılımı</h3>
          <p className="text-gray-500 text-xs mb-6">Siparişlerin onaylanma/iptal durumları</p>
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
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: "12px", color: "#9ca3af" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom row: Login Stats & Roles */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Roles Pie Chart */}
        <div className="glass-panel p-6 md:p-8 clip-angled relative border border-white/5 h-[300px] flex flex-col">
          <h3 className="text-white font-bold uppercase tracking-widest mb-2">Kullanıcı Rolleri</h3>
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
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: "12px", color: "#9ca3af" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Login Success Rate */}
        <div className="glass-panel p-6 md:p-8 clip-angled relative border border-white/5 h-[300px] flex flex-col">
          <h3 className="text-white font-bold uppercase tracking-widest mb-2">Giriş Başarı Oranı</h3>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.loginStats || []} layout="vertical" margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                <XAxis type="number" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis dataKey="name" type="category" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" name="Deneme Sayısı" fill="#00ffff" radius={[0, 4, 4, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
