"use client";

import React, { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#ff007f", "#ffd700", "#00ffff", "#ff00ff", "#a200ff"];

const CustomLegend = ({ data }) => (
  <div className="flex justify-center gap-4 mt-4 flex-wrap">
    {data.map((entry, index) => (
      <div key={entry.name} className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
        <span className="text-gray-400 text-xs font-bold uppercase">{entry.name}</span>
      </div>
    ))}
  </div>
);

export default function DashboardAnalytics() {
  const [data, setData] = useState({
    loginStats: [],
    orderStats: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/analytics");
        if (res.ok) {
          const json = await res.json();
          setData({
            loginStats: json.loginStats || [],
            orderStats: json.orderStats || [],
          });
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
    return <div className="text-white p-4">Yükleniyor...</div>;
  }

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8 animate-fade-in">
      {/* Login Stats Pie Chart */}
      <div className="glass-panel p-6 md:p-8 clip-angled relative border border-white/5 h-[400px] flex flex-col">
        <h3 className="text-white font-bold uppercase tracking-widest mb-2">Kullanıcı Davranışları (Giriş)</h3>
        <p className="text-gray-500 text-xs mb-6">
          Başarılı ve Başarısız giriş denemeleri
        </p>
        <div className="flex-1 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data.loginStats}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {data.loginStats.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, name) => [value, name]}
                contentStyle={{ backgroundColor: "rgba(0,0,0,0.9)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 0 }}
                itemStyle={{ color: "#fff", fontWeight: "bold" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <CustomLegend data={data.loginStats} />
      </div>

      {/* Order Stats Pie Chart */}
      <div className="glass-panel p-6 md:p-8 clip-angled relative border border-white/5 h-[400px] flex flex-col">
        <h3 className="text-white font-bold uppercase tracking-widest mb-2">Sipariş Durum Dağılımı</h3>
        <p className="text-gray-500 text-xs mb-6">
          Siparişlerin İptal/İade veya Onaylanma durumları
        </p>
        <div className="flex-1 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data.orderStats}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {data.orderStats.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, name) => [value, name]}
                contentStyle={{ backgroundColor: "rgba(0,0,0,0.9)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 0 }}
                itemStyle={{ color: "#fff", fontWeight: "bold" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <CustomLegend data={data.orderStats} />
      </div>
    </div>
  );
}
