"use client";

import React, { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#ff007f", "#ffd700", "#00ffff", "#ff00ff", "#a200ff"];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-black/90 border border-white/10 p-3 shadow-xl backdrop-blur-md">
        <p className="text-white font-bold mb-1">{label}</p>
        {payload.map((entry, index) => (
          <p key={`item-${index}`} style={{ color: entry.color }} className="text-sm font-medium">
            {entry.name === "total" ? "Satış:" : `${entry.name}:`} {entry.value.toLocaleString("tr-TR")} ₺
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function DashboardAnalytics() {
  const [data, setData] = useState({
    salesOverTime: [],
    usersByRole: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/analytics");
        if (res.ok) {
          const json = await res.json();
          setData({
            salesOverTime: json.salesOverTime || [],
            usersByRole: json.usersByRole || [],
          });
        }
      } catch (error) {
        console.error("Failed to fetch analytics", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div className="text-white p-4">Yükleniyor...</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8 animate-fade-in">
      {/* Sales Over Time Line Chart */}
      <div className="glass-panel p-6 md:p-8 clip-angled relative border border-white/5 h-[400px] flex flex-col">
        <h3 className="text-white font-bold uppercase tracking-widest mb-2">Zaman İçinde Satışlar</h3>
        <p className="text-gray-500 text-xs mb-6">
          Son siparişlere göre günlük satış trendi
        </p>
        <div className="flex-1 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.salesOverTime} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ff007f" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#ff007f" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }} tickLine={false} axisLine={false} />
              <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }} tickLine={false} axisLine={false} tickFormatter={(val) => `₺${val}`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="total" stroke="#ff007f" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Users By Role Pie Chart */}
      <div className="glass-panel p-6 md:p-8 clip-angled relative border border-white/5 h-[400px] flex flex-col">
        <h3 className="text-white font-bold uppercase tracking-widest mb-2">Rol Bazında Kullanıcılar</h3>
        <p className="text-gray-500 text-xs mb-6">
          Kullanıcıların rol dağılımları
        </p>
        <div className="flex-1 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data.usersByRole}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {data.usersByRole.map((entry, index) => (
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
        <div className="flex justify-center gap-4 mt-4 flex-wrap">
          {data.usersByRole.map((entry, index) => (
            <div key={entry.name} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
              <span className="text-gray-400 text-xs font-bold uppercase">{entry.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
