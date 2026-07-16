'use client';

import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';

interface AnalyticsChartsProps {
  salesData?: any[];
  categoryData?: any[];
  registrationData?: any[];
  abandonedCartData?: any[];
}

const COLORS = ['#ff007f', '#ffd700', '#a855f7', '#3b82f6', '#22c55e', '#ef4444'];

export default function AnalyticsCharts({ 
  salesData = [], 
  categoryData = [], 
  registrationData = [], 
  abandonedCartData = [] 
}: AnalyticsChartsProps) {

  // Mock data if empty
  const defaultSales = salesData.length ? salesData : [
    { name: 'Pzt', total: 4000 }, { name: 'Sal', total: 3000 }, { name: 'Çar', total: 2000 },
    { name: 'Per', total: 2780 }, { name: 'Cum', total: 1890 }, { name: 'Cmt', total: 2390 }, { name: 'Paz', total: 3490 }
  ];

  const defaultCategory = categoryData.length ? categoryData : [
    { name: 'Elbise', value: 400 }, { name: 'Tunik', value: 300 }, { name: 'Kaban', value: 300 }, { name: 'Etek', value: 200 }
  ];

  const defaultRegs = registrationData.length ? registrationData : [
    { name: 'Pzt', users: 12 }, { name: 'Sal', users: 19 }, { name: 'Çar', users: 15 },
    { name: 'Per', users: 22 }, { name: 'Cum', users: 18 }, { name: 'Cmt', users: 30 }, { name: 'Paz', users: 25 }
  ];

  const defaultAbandoned = abandonedCartData.length ? abandonedCartData : [
    { name: 'Pzt', carts: 5 }, { name: 'Sal', carts: 8 }, { name: 'Çar', carts: 4 },
    { name: 'Per', carts: 10 }, { name: 'Cum', carts: 6 }, { name: 'Cmt', carts: 15 }, { name: 'Paz', carts: 12 }
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-black/90 border border-white/10 p-3 clip-angled backdrop-blur-md">
          <p className="text-white font-bold mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm font-semibold">
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 my-8 animate-fade-in">
      {/* Sales Trend Chart */}
      <div className="glass-panel p-6 clip-angled relative border border-white/5 h-[400px]">
        <div className="absolute top-0 right-0 w-32 h-32 bg-neon-pink opacity-5 rounded-bl-full pointer-events-none"></div>
        <h3 className="text-white font-bold uppercase tracking-widest mb-4 flex items-center justify-between">
          Satış Trendleri <span className="text-xs text-neon-pink bg-neon-pink/10 px-2 py-1 rounded">Son 7 Gün</span>
        </h3>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={defaultSales} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ff007f" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#ff007f" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(value) => `₺${value}`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="total" name="Satış" stroke="#ff007f" strokeWidth={3} fill="url(#colorSales)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Sales Chart */}
      <div className="glass-panel p-6 clip-angled relative border border-white/5 h-[400px]">
        <div className="absolute top-0 right-0 w-32 h-32 bg-holo-gold opacity-5 rounded-bl-full pointer-events-none"></div>
        <h3 className="text-white font-bold uppercase tracking-widest mb-4">Popüler Kategoriler</h3>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={defaultCategory}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {defaultCategory.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#fff' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Registrations Chart */}
      <div className="glass-panel p-6 clip-angled relative border border-white/5 h-[400px]">
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500 opacity-5 rounded-bl-full pointer-events-none"></div>
        <h3 className="text-white font-bold uppercase tracking-widest mb-4">Yeni Kayıtlar</h3>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={defaultRegs} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="users" name="Kullanıcı" fill="#a855f7" radius={[4, 4, 0, 0]} barSize={30} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Abandoned Carts Chart */}
      <div className="glass-panel p-6 clip-angled relative border border-white/5 h-[400px]">
        <div className="absolute top-0 right-0 w-32 h-32 bg-red-500 opacity-5 rounded-bl-full pointer-events-none"></div>
        <h3 className="text-white font-bold uppercase tracking-widest mb-4">Terk Edilen Sepetler</h3>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={defaultAbandoned} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="carts" name="Sepet" stroke="#ef4444" strokeWidth={3} dot={{ r: 4, fill: '#ef4444', strokeWidth: 2, stroke: '#111' }} activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
