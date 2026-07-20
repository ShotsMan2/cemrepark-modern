"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import RevenueChart from "../charts/RevenueChart";
import UserGrowthChart from "../charts/UserGrowthChart";
import StockWarning from "@/components/admin/StockWarning";
import { transformCategoryPopularity } from "@/utils/rechartsHelpers";
import Swal from "sweetalert2";

const AreaChart = dynamic(() => import("recharts").then((mod) => mod.AreaChart), { ssr: false });
const Area = dynamic(() => import("recharts").then((mod) => mod.Area), { ssr: false });
const XAxis = dynamic(() => import("recharts").then((mod) => mod.XAxis), { ssr: false });
const YAxis = dynamic(() => import("recharts").then((mod) => mod.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import("recharts").then((mod) => mod.CartesianGrid), { ssr: false });
const RechartsTooltip = dynamic(() => import("recharts").then((mod) => mod.Tooltip), { ssr: false });
const ResponsiveContainer = dynamic(() => import("recharts").then((mod) => mod.ResponsiveContainer), { ssr: false });
const PieChart = dynamic(() => import("recharts").then((mod) => mod.PieChart), { ssr: false });
const Pie = dynamic(() => import("recharts").then((mod) => mod.Pie), { ssr: false });
const Cell = dynamic(() => import("recharts").then((mod) => mod.Cell), { ssr: false });
const BarChart = dynamic(() => import("recharts").then((mod) => mod.BarChart), { ssr: false });
const Bar = dynamic(() => import("recharts").then((mod) => mod.Bar), { ssr: false });
const ComposedChart = dynamic(() => import("recharts").then((mod) => mod.ComposedChart), { ssr: false });
const Line = dynamic(() => import("recharts").then((mod) => mod.Line), { ssr: false });
import DashboardAnalytics from "../DashboardAnalytics";

const COLORS = ["#ff007f", "#ffd700", "#a855f7", "#3b82f6", "#22c55e", "#ef4444"];

const generateSparkline = () =>
  Array.from({ length: 10 }, (_, i) => ({ name: i, value: Math.random() * 100 + 50 }));

export default function DashboardView({ products, setActiveTab }: { products: any[]; setActiveTab: (t: string) => void }) {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  const [activities, setActivities] = useState([
    { id: 1, type: "order", text: "Yeni sipariş alındı #1042", time: "2 dk önce", color: "neon-pink", icon: "M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" },
    { id: 2, type: "payment", text: "Ayşe Y. siparişi teslim edildi", time: "1 saat önce", color: "green-500", icon: "M5 13l4 4L19 7" },
    { id: 3, type: "stock", text: "Ürün stoğu güncellendi (Kap)", time: "3 saat önce", color: "holo-gold", icon: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" },
    { id: 4, type: "user", text: "Yeni üye kaydı (zeynep@...)", time: "5 saat önce", color: "purple-500", icon: "M12 14c4 0 7 3 7 7H5c0-4 3-7 7-7zm0-2a4 4 0 110-8 4 4 0 010 8z" },
    { id: 5, type: "payment", text: "Ödeme onaylandı #1041", time: "Dün", color: "green-500", icon: "M5 13l4 4L19 7" },
  ]);

  const [sparklines] = useState(Array.from({ length: 8 }, () => generateSparkline()));

  const fetchWithRetry = async (url: string, retries = 3) => {
    for (let i = 0; i < retries; i++) {
      try {
        const res = await fetch(url);
        if (res.ok) return await res.json();
      } catch {}
      if (i < retries - 1) await new Promise((r) => setTimeout(r, 1000 * (i + 1)));
    }
    return null;
  };

  useEffect(() => {
    const load = async () => {
      const data = await fetchWithRetry("/api/analytics");
      if (data) setStats(data);
      else setError("Analytics yüklenemedi");
      setIsLoading(false);
    };
    load();
  }, []);

  useEffect(() => {
    const recent = async () => {
      try {
        const res = await fetch("/api/orders?limit=5&sortBy=createdAt&sortOrder=desc");
        if (res.ok) {
          const result = await res.json();
          const data = result.data || result;
          setRecentOrders(
            (Array.isArray(data) ? data : []).slice(0, 5).map((o: any) => ({
              id: o.id,
              customer: o.customer || o.musteri || "Bilinmiyor",
              total: o.total || o.tutar || "0",
              status: o.status || o.durum || "Beklemede",
              date: o.createdAt ? new Date(o.createdAt).toLocaleDateString("tr-TR") : "-",
            }))
          );
        }
      } catch {}
    };
    recent();
  }, []);

  useEffect(() => {
    const fetchRecentMessages = async () => {
      try {
        const res = await fetch("/api/messages");
        if (res.ok) {
          const messagesData = await res.json();
          const messageActivities = messagesData.slice(0, 3).map((msg: any, i: number) => ({
            id: `msg-${i}`,
            type: "message",
            text: `Yeni İletişim Mesajı: ${msg.adSoyad}`,
            time: msg.tarih || "Yeni",
            color: "neon-pink",
            icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
          }));
          setActivities((prev) => {
            const mockActs = prev.filter((a) => a.type !== "message");
            return [...messageActivities, ...mockActs].slice(0, 8);
          });
        }
      } catch {}
    };
    fetchRecentMessages();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const types = [
        { type: "order", text: "Yeni sipariş alındı #" + Math.floor(Math.random() * 10000 + 1000), color: "neon-pink", icon: "M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" },
        { type: "user", text: "Yeni üye kaydı (" + Math.random().toString(36).substring(7) + "@gmail.com)", color: "purple-500", icon: "M12 14c4 0 7 3 7 7H5c0-4 3-7 7-7zm0-2a4 4 0 110-8 4 4 0 010 8z" },
        { type: "stock", text: "Stok uyarısı: Ürün #" + Math.floor(Math.random() * 100), color: "holo-gold", icon: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" },
        { type: "payment", text: "Ödeme başarılı #" + Math.floor(Math.random() * 10000 + 1000), color: "green-500", icon: "M5 13l4 4L19 7" },
      ];
      const random = types[Math.floor(Math.random() * types.length)];
      setActivities((prev) => [{ ...random, time: "Şimdi", id: Date.now() }, ...prev].slice(0, 8));
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const safeProducts = Array.isArray(products) ? products : [];
  const totalProducts = stats && typeof stats.products === "number" ? stats.products : safeProducts.length;
  const activeCategories = stats && typeof stats.categories === "number" ? stats.categories : [...new Set(safeProducts.map((p) => p.kategori))].filter(Boolean).length;
  const totalRevenue = stats && typeof stats.revenue === "number" ? stats.revenue : 245000;
  const totalOrders = stats && typeof stats.orders === "number" ? stats.orders : 1245;
  const avgCartValue = totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(0) : 0;
  const conversionRate = 3.2;
  const activeUsers = stats?.activeUsers || 842;
  const returnRate = 1.5;
  const totalCustomers = stats?.customers || 342;

  const chartData = stats?.salesOverTime?.length > 0 ? stats.salesOverTime : [
    { name: "Pzt", total: 1200 }, { name: "Sal", total: 2100 }, { name: "Çar", total: 1800 },
    { name: "Per", total: 2400 }, { name: "Cum", total: 3200 }, { name: "Cmt", total: 4500 }, { name: "Paz", total: 3800 },
  ];

  const revenueChartData = stats?.revenueOverTime?.length > 0 ? stats.revenueOverTime : [
    { name: "Oca", gerceklesen: 12000, hedef: 15000 },
    { name: "Şub", gerceklesen: 18000, hedef: 16000 },
    { name: "Mar", gerceklesen: 25000, hedef: 20000 },
    { name: "Nis", gerceklesen: 22000, hedef: 25000 },
    { name: "May", gerceklesen: 32000, hedef: 28000 },
    { name: "Haz", gerceklesen: 35000, hedef: 30000 },
  ];

  const userGrowthData = stats?.userGrowth?.length > 0 ? stats.userGrowth : [
    { month: "Oca", users: 45 }, { month: "Şub", users: 62 }, { month: "Mar", users: 78 },
    { month: "Nis", users: 55 }, { month: "May", users: 92 }, { month: "Haz", users: 110 },
  ];

  const catData = stats?.categoryData?.length > 0 ? stats.categoryData : transformCategoryPopularity(safeProducts);
  if (catData.length === 0) catData.push({ name: "Genel", value: 100 });
  const totalCategoryValue = catData.reduce((sum: number, item: any) => sum + item.value, 0);

  const targetData = [
    { name: "Oca", gerceklesen: 12000, hedef: 15000 },
    { name: "Şub", gerceklesen: 18000, hedef: 16000 },
    { name: "Mar", gerceklesen: 25000, hedef: 20000 },
    { name: "Nis", gerceklesen: 22000, hedef: 25000 },
    { name: "May", gerceklesen: 32000, hedef: 28000 },
    { name: "Haz", gerceklesen: Math.max(35000, totalRevenue), hedef: 30000 },
  ];

  const topSellingProductsData = stats?.topSellingProducts?.length > 0 ? stats.topSellingProducts : [
    { name: "Premium Kadın Takım Siyah", value: 124 },
    { name: "Yeni Sezon Tunik Bej", value: 98 },
    { name: "Klasik Ceket Ekru", value: 75 },
    { name: "Günlük Elbise Desenli", value: 42 },
  ];

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const days = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
  const heatmapData = days.map((day) => hours.map((hour) => {
    const base = hour > 10 && hour < 22 ? 0.5 : 0.1;
    return base + Math.random() * 0.5;
  }));

  const funnelData = [
    { step: "Ziyaretçi", value: 12500, color: "#3b82f6" },
    { step: "Sepet", value: 4200, color: "#a855f7" },
    { step: "Ödeme", value: 1800, color: "#ffd700" },
    { step: "Satın Alma", value: totalOrders, color: "#ff007f" },
  ];

  const handleRetry = () => {
    setError(null);
    setIsLoading(true);
    fetch("/api/analytics")
      .then((res) => res.json())
      .then((data) => { setStats(data); setIsLoading(false); })
      .catch(() => { setError("Yeniden bağlanılamadı"); setIsLoading(false); });
  };

  const handleExportCSV = () => {
    try {
      const headers = ["Metrik", "Deger"];
      const rows = [["Toplam Urun", totalProducts], ["Aktif Kategoriler", activeCategories], ["Toplam Gelir", totalRevenue], ["Toplam Siparis", totalOrders]];
      rows.push(["", ""]);
      rows.push(["Gun", "Satis Tutari"]);
      chartData.forEach((d: any) => rows.push([d.name, d.total]));
      const csvContent = "\uFEFF" + headers.join(",") + "\n" + rows.map((e) => e.join(",")).join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.setAttribute("href", URL.createObjectURL(blob));
      link.setAttribute("download", "dashboard_rapor.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Export error", error);
    }
  };

  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Teslim Edildi": case "completed": return "text-green-400 bg-green-400/10 border-green-400/30";
      case "Kargolandı": case "shipped": return "text-purple-400 bg-purple-400/10 border-purple-400/30";
      case "Hazırlanıyor": case "processing": return "text-holo-gold bg-holo-gold/10 border-holo-gold/30";
      case "Onaylandı": case "confirmed": return "text-blue-400 bg-blue-400/10 border-blue-400/30";
      case "İptal": case "cancelled": return "text-red-500 bg-red-500/10 border-red-500/30";
      default: return "text-orange-400 bg-orange-400/10 border-orange-400/30";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-12 h-12 border-4 border-neon-pink border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <div className="text-red-400 text-lg font-bold">Bir hata oluştu</div>
        <p className="text-foreground/60 text-sm">{error}</p>
        <button onClick={handleRetry} className="bg-neon-pink text-foreground px-6 py-2 text-xs font-bold uppercase clip-angled hover:bg-white hover:text-black transition-colors">
          Tekrar Dene
        </button>
      </div>
    );
  }

  const KPICard = ({ title, value, subtext, trend, trendValue, colorClass, sparklineData, colorHex }: any) => (
    <motion.div variants={itemVariants} className="glass-card p-4 clip-angled relative overflow-hidden group hover:border-neon-pink/50 transition-colors bg-gradient-to-br from-white/5 to-transparent">
      <div className="absolute top-0 right-0 w-32 h-32 bg-neon-pink/5 rounded-bl-full group-hover:scale-110 transition-transform"></div>
      <div className="flex justify-between items-start mb-2">
        <p className="text-foreground/60 text-[10px] font-bold uppercase tracking-widest">{title}</p>
        <div className={`flex items-center gap-1 text-[10px] font-bold ${trend === "up" ? "text-green-400" : "text-red-400"}`}>
          {trend === "up" ? (
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 10l7-7m0 0l7 7m-7-7v18"></path></svg>
          ) : (
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path></svg>
          )}
          {trendValue}%
        </div>
      </div>
      <h3 className="text-2xl font-black text-foreground mb-1">{value}</h3>
      <p className="text-xs font-bold" style={{ color: colorHex }}>{subtext}</p>
      <div className="absolute bottom-0 right-0 w-24 h-12 opacity-50">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={sparklineData}>
            <Area type="monotone" dataKey="value" stroke={colorHex} fill={colorHex} strokeWidth={2} fillOpacity={0.2} isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-foreground uppercase tracking-widest">Genel Bakış</h2>
          <p className="text-foreground/50 text-sm mt-1">Platformun anlık özet durumu ve performans metrikleri</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button onClick={() => setActiveTab("products")} className="glass-panel px-4 py-2 flex items-center gap-2 hover:bg-neon-pink/20 hover:border-neon-pink transition-all text-xs font-bold text-foreground clip-angled">
            <svg className="w-4 h-4 text-neon-pink" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
            YENİ ÜRÜN
          </button>
          <button onClick={() => setActiveTab("orders")} className="glass-panel px-4 py-2 flex items-center gap-2 hover:bg-purple-500/20 hover:border-purple-500 transition-all text-xs font-bold text-foreground clip-angled">
            <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
            SİPARİŞLER
          </button>
          <button onClick={() => setActiveTab("customers")} className="glass-panel px-4 py-2 flex items-center gap-2 hover:bg-blue-500/20 hover:border-blue-500 transition-all text-xs font-bold text-foreground clip-angled">
            <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path></svg>
            MÜŞTERİLER
          </button>
          <button className="glass-panel px-4 py-2 flex items-center gap-2 hover:bg-holo-gold/20 hover:border-holo-gold transition-all text-xs font-bold text-foreground clip-angled cursor-default">
            <svg className="w-4 h-4 text-holo-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            STOK UYARISI
            <span className="bg-holo-gold text-black text-[10px] px-1.5 py-0.5 rounded-full font-black ml-1">{safeProducts.filter((p) => p.stok < 5).length}</span>
          </button>
          <div className="relative group">
            <button className="glass-panel hover:bg-foreground/10 text-foreground px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all clip-angled flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
              DIŞA AKTAR
            </button>
            <div className="absolute right-0 top-full mt-2 w-40 glass-panel p-2 flex flex-col gap-1 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity z-50">
              <button onClick={handleExportCSV} className="text-left px-3 py-2 text-xs text-foreground hover:bg-neon-pink/20 hover:text-neon-pink rounded font-bold transition-colors">CSV İndir</button>
            </div>
          </div>
        </div>
      </div>

      <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard title="Toplam Gelir" value={`${totalRevenue.toLocaleString("tr-TR")} ₺`} subtext="Tamamlanan" trend="up" trendValue="15" colorClass="neon-pink" colorHex="#ff007f" sparklineData={sparklines[0]} />
        <KPICard title="Toplam Sipariş" value={totalOrders} subtext="Tüm zamanlar" trend="up" trendValue="8" colorClass="success" colorHex="#22c55e" sparklineData={sparklines[1]} />
        <KPICard title="Toplam Müşteri" value={totalCustomers} subtext="Kayıtlı kullanıcı" trend="up" trendValue="12" colorClass="blue-500" colorHex="#3b82f6" sparklineData={sparklines[2]} />
        <KPICard title="Toplam Ürün" value={totalProducts} subtext="Aktif ürünler" trend="up" trendValue="10" colorClass="neon-pink" colorHex="#ff007f" sparklineData={sparklines[3]} />
        <KPICard title="Ort. Sepet Değeri" value={`${avgCartValue} ₺`} subtext="Sipariş başına" trend="up" trendValue="4" colorClass="holo-gold" colorHex="#ffd700" sparklineData={sparklines[4]} />
        <KPICard title="Dönüşüm Oranı" value={`%${conversionRate}`} subtext="Ziyaretçi/Satış" trend="down" trendValue="1.2" colorClass="purple-500" colorHex="#a855f7" sparklineData={sparklines[5]} />
        <KPICard title="Aktif Kullanıcı" value={activeUsers} subtext="Son 30 gün" trend="up" trendValue="22" colorClass="blue-500" colorHex="#3b82f6" sparklineData={sparklines[6]} />
        <KPICard title="İade Oranı" value={`%${returnRate}`} subtext="Son 30 gün" trend="down" trendValue="0.5" colorClass="red-500" colorHex="#ef4444" sparklineData={sparklines[7]} />
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
        <StockWarning
          items={safeProducts.filter((p) => typeof p.stok === "number" && p.stok < 5).map((p) => ({
            id: p.id, ad: p.ad, resim: p.gorsel || p.resim, stok: p.stok, renk: p.renk, beden: p.beden,
          }))}
        />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-panel p-6 md:p-8 clip-angled relative border border-glass-border h-[450px]">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-foreground font-bold uppercase tracking-widest">Gelir ve Hedef Analizi</h3>
              <p className="text-foreground/60 text-xs mt-1">Aylık gerçekleşen gelir vs hedefler</p>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2"><div className="w-3 h-3 bg-neon-pink rounded-sm"></div><span className="text-foreground/50 text-xs font-bold">Gerçekleşen</span></div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 bg-holo-gold rounded-full"></div><span className="text-foreground/50 text-xs font-bold">Hedef</span></div>
            </div>
          </div>
          <div className="w-full h-80">
            <RevenueChart data={revenueChartData} />
          </div>
        </div>
        <div className="glass-panel p-6 md:p-8 clip-angled relative border border-glass-border h-[450px] flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-foreground font-bold uppercase tracking-widest">Canlı Akış</h3>
            <div className="flex items-center gap-1 text-xs text-green-400">
              <span className="relative flex h-2 w-2 mr-1">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              Aktif
            </div>
          </div>
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
            <AnimatePresence>
              {activities.map((act) => (
                <motion.div
                  key={act.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-start gap-4 p-3 rounded-lg bg-foreground/5 border border-glass-border hover:bg-foreground/10 transition-colors"
                >
                  <div className={`p-2 rounded-full bg-${act.color}/20 text-${act.color}`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={act.icon}></path></svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-foreground text-sm font-medium">{act.text}</p>
                    <span className="text-foreground/60 text-[10px]">{act.time}</span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel p-6 md:p-8 clip-angled relative border border-glass-border h-[400px]">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-foreground font-bold uppercase tracking-widest">Kullanıcı Büyümesi</h3>
              <p className="text-foreground/60 text-xs mt-1">Aylık yeni kayıt grafiği</p>
            </div>
          </div>
          <div className="w-full h-80">
            <UserGrowthChart data={userGrowthData} />
          </div>
        </div>
        <div className="glass-panel p-6 md:p-8 clip-angled relative border border-glass-border h-[400px] flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-foreground font-bold uppercase tracking-widest">Son Siparişler</h3>
            <button onClick={() => setActiveTab("orders")} className="text-xs text-neon-pink hover:underline font-bold">Tümünü Gör</button>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {recentOrders.length === 0 ? (
              <div className="flex items-center justify-center h-full text-foreground/50 text-sm">Henüz sipariş bulunmuyor</div>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] text-foreground/50 uppercase tracking-widest border-b border-glass-border">
                    <th className="pb-2 font-bold">Sipariş</th>
                    <th className="pb-2 font-bold">Müşteri</th>
                    <th className="pb-2 font-bold">Tarih</th>
                    <th className="pb-2 font-bold text-right">Tutar</th>
                    <th className="pb-2 font-bold text-right">Durum</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-glass-border/50">
                  {recentOrders.map((order: any) => (
                    <tr key={order.id} className="text-sm hover:bg-foreground/5 transition-colors">
                      <td className="py-2 font-bold text-foreground">#{order.id}</td>
                      <td className="py-2 text-foreground/80">{order.customer}</td>
                      <td className="py-2 text-foreground/60">{order.date}</td>
                      <td className="py-2 text-right text-foreground font-bold">{order.total} ₺</td>
                      <td className="py-2 text-right">
                        <span className={`text-[10px] px-2 py-0.5 rounded border font-bold uppercase ${getStatusColor(order.status)}`}>{order.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      <DashboardAnalytics />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="glass-panel p-6 md:p-8 clip-angled relative border border-glass-border min-h-[400px]">
          <h3 className="text-foreground font-bold uppercase tracking-widest mb-1">Satış Yoğunluk Haritası</h3>
          <p className="text-foreground/60 text-xs mb-6">Gün ve saat bazında müşteri aktivitesi</p>
          <div className="w-full overflow-x-auto">
            <div className="min-w-[600px] grid grid-cols-[auto_repeat(24,1fr)] gap-1 mb-2">
              <div />
              {hours.map((h) => (<div key={h} className="text-[10px] text-foreground/60 text-center">{h}</div>))}
              {days.map((day, i) => (
                <React.Fragment key={day}>
                  <div className="text-[10px] text-foreground/50 pr-2 text-right self-center">{day}</div>
                  {heatmapData[i].map((val, j) => (
                    <div key={j} className="relative group cursor-pointer w-full aspect-square rounded-sm transition-all hover:scale-125 hover:z-10 hover:rounded" style={{ backgroundColor: `rgba(255, 0, 127, ${Math.max(0.1, val)})` }}>
                      <div className="absolute opacity-0 group-hover:opacity-100 -top-10 left-1/2 -translate-x-1/2 bg-black text-foreground text-[10px] py-1 px-2 rounded pointer-events-none whitespace-nowrap z-50 shadow-lg border border-glass-border">
                        {day} {j}:00<br />Yoğunluk: {(val * 100).toFixed(0)}%
                      </div>
                    </div>
                  ))}
                </React.Fragment>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 mt-4 text-[10px] text-foreground/50">
            Düşük <div className="w-16 h-2 bg-gradient-to-r from-[rgba(255,0,127,0.1)] to-[rgba(255,0,127,1)] rounded"></div> Yüksek
          </div>
        </div>
        <div className="glass-panel p-6 md:p-8 clip-angled relative border border-glass-border min-h-[400px] flex flex-col justify-center">
          <h3 className="text-foreground font-bold uppercase tracking-widest mb-1 absolute top-6 left-6 md:left-8">Müşteri Dönüşüm Hunisi</h3>
          <p className="text-foreground/60 text-xs mb-8 absolute top-12 left-6 md:left-8">Sitenize gelen ziyaretçilerin satışa dönüşme yolculuğu</p>
          <div className="flex flex-col items-center w-full gap-4 mt-16 px-4">
            {funnelData.map((d, i) => {
              const width = Math.max(15, (d.value / funnelData[0].value) * 100);
              const dropOff = i > 0 ? ((1 - d.value / funnelData[i - 1].value) * 100).toFixed(0) : null;
              return (
                <div key={d.step} className="w-full flex items-center gap-4 relative">
                  <div className="w-20 text-right text-xs font-bold text-foreground/50">{d.step}</div>
                  <div className="flex-1 flex justify-center flex-col relative group">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${width}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: i * 0.2, ease: "easeOut" }}
                      className="h-10 rounded flex items-center justify-center text-xs font-bold text-foreground relative overflow-hidden shadow-lg mx-auto"
                      style={{ backgroundColor: d.color }}
                    >
                      <span className="z-10 tracking-widest">{d.value.toLocaleString()}</span>
                      <div className="absolute inset-0 bg-foreground/20" style={{ clipPath: "polygon(0 0, 100% 0, 95% 100%, 5% 100%)" }}></div>
                    </motion.div>
                    {dropOff && (
                      <div className="absolute -top-4 right-0 text-[10px] text-red-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-background/80 px-2 py-1 rounded">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path></svg>
                        {dropOff}% kayıp
                      </div>
                    )}
                  </div>
                  <div className="w-12"></div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="glass-panel p-6 md:p-8 clip-angled relative border border-glass-border h-[400px] flex flex-col">
          <h3 className="text-foreground font-bold uppercase tracking-widest mb-2">Kategori Dağılımı</h3>
          <p className="text-foreground/60 text-xs mb-6">Satışların ürün kategorilerine göre oranları</p>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={catData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value" stroke="none">
                  {catData.map((_: any, index: number) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                </Pie>
                <RechartsTooltip
                  formatter={(value: number, name: string) => { const p = ((value / totalCategoryValue) * 100).toFixed(1); return [`${value} (${p}%)`, name]; }}
                  contentStyle={{ backgroundColor: "rgba(0,0,0,0.9)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 0 }}
                  itemStyle={{ color: "#fff", fontWeight: "bold" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-4 flex-wrap">
            {catData.map((entry: any, index: number) => (
              <div key={entry.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                <span className="text-foreground/50 text-[10px] font-bold uppercase">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="glass-panel p-6 md:p-8 clip-angled relative border border-glass-border h-[400px]">
          <h3 className="text-foreground font-bold uppercase tracking-widest mb-1">En Çok Satanlar</h3>
          <p className="text-foreground/60 text-xs mb-4">Bu ayın en popüler ürün satışları</p>
          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topSellingProductsData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                <XAxis type="number" stroke="rgba(255,255,255,0.3)" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 10 }} />
                <YAxis dataKey="name" type="category" stroke="rgba(255,255,255,0.3)" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 10 }} width={120} />
                <RechartsTooltip contentStyle={{ backgroundColor: "rgba(0,0,0,0.9)", border: "1px solid rgba(255,255,255,0.1)" }} itemStyle={{ color: "#fff", fontWeight: "bold" }} />
                <Bar dataKey="value" fill="#ffd700" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
