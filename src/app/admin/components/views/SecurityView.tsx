"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";

const BarChart = dynamic(() => import("recharts").then((mod) => mod.BarChart), { ssr: false });
const Bar = dynamic(() => import("recharts").then((mod) => mod.Bar), { ssr: false });
const XAxis = dynamic(() => import("recharts").then((mod) => mod.XAxis), { ssr: false });
const YAxis = dynamic(() => import("recharts").then((mod) => mod.YAxis), { ssr: false });
const Tooltip = dynamic(() => import("recharts").then((mod) => mod.Tooltip), { ssr: false });
const ResponsiveContainer = dynamic(() => import("recharts").then((mod) => mod.ResponsiveContainer), { ssr: false });
const CartesianGrid = dynamic(() => import("recharts").then((mod) => mod.CartesianGrid), { ssr: false });
const PieChart = dynamic(() => import("recharts").then((mod) => mod.PieChart), { ssr: false });
const Pie = dynamic(() => import("recharts").then((mod) => mod.Pie), { ssr: false });
const Cell = dynamic(() => import("recharts").then((mod) => mod.Cell), { ssr: false });

import {
  Shield, ShieldAlert, ShieldCheck, ShieldOff, Activity, LogIn, UserCheck, UserX,
  Search, Filter, ExternalLink, Globe, Clock, TrendingUp, AlertTriangle,
  CheckCircle2, XCircle, ChevronRight, Download, Ban, Users, Eye, EyeOff,
  Lock, Smartphone, Monitor, MapPin, Flag, RefreshCw, MoreHorizontal,
  BarChart3, PieChart as PieIcon, List, FileText, Trash2, Plus,
} from "lucide-react";
import Swal from "sweetalert2";

const MOCK_GEO = {
  "212.156.": { city: "İstanbul", country: "Türkiye", flag: "🇹🇷" },
  "78.186.": { city: "Ankara", country: "Türkiye", flag: "🇹🇷" },
  "176.": { city: "İzmir", country: "Türkiye", flag: "🇹🇷" },
  "85.": { city: "Bursa", country: "Türkiye", flag: "🇹🇷" },
  "46.": { city: "Antalya", country: "Türkiye", flag: "🇹🇷" },
};

function mockGeoLookup(ip: string): { city: string; country: string; flag: string } | null {
  if (!ip) return null;
  for (const [prefix, geo] of Object.entries(MOCK_GEO)) {
    if (ip.startsWith(prefix)) return geo;
  }
  if (ip.startsWith("192.") || ip.startsWith("10.") || ip === "127.0.0.1") {
    return { city: "Yerel", country: "Local", flag: "🖥" };
  }
  return { city: "Bilinmeyen", country: "Unknown", flag: "🌍" };
}

function timeAgo(dateStr: string) {
  const now = new Date();
  const date = new Date(dateStr);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (seconds < 60) return "Az önce";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} dk önce`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} saat önce`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} gün önce`;
  return new Date(dateStr).toLocaleDateString("tr-TR");
}

function isToday(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  return d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}

const DAY_NAMES_TR = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"];

function getLast7DaysChart(logs: any[]) {
  const now = new Date();
  const days: any[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    days.push({ date: key, label: DAY_NAMES_TR[d.getDay()], basarili: 0, basarisiz: 0 });
  }
  const dayMap: Record<string, any> = {};
  days.forEach((d) => (dayMap[d.date] = d));
  logs.forEach((log: any) => {
    const key = new Date(log.createdAt).toISOString().slice(0, 10);
    if (dayMap[key]) {
      if (log.success) dayMap[key].basarili++;
      else dayMap[key].basarisiz++;
    }
  });
  return days;
}

function calculateSecurityScore(loginLogs: any[], auditLogs: any[]): { score: number; label: string; color: string; issues: string[] } {
  let score = 100;
  const issues: string[] = [];
  const failed = loginLogs.filter((l) => !l.success).length;
  const total = loginLogs.length;
  if (total > 0 && failed / total > 0.3) {
    score -= 20;
    issues.push("Yüksek oranda başarısız giriş");
  }
  if (failed > 50) {
    score -= 15;
    issues.push("50'den fazla başarısız giriş denemesi");
  }
  const criticalActions = auditLogs.filter((l) => l.action?.includes("DELETE") || l.details?.includes("CRITICAL")).length;
  if (criticalActions > 10) {
    score -= 10;
    issues.push("Çok sayıda kritik eylem");
  }
  score = Math.max(0, Math.min(100, score));
  if (score >= 80) return { score, label: "Güvenli", color: "text-success", issues };
  if (score >= 60) return { score, label: "Orta", color: "text-secondary", issues };
  return { score, label: "Riskli", color: "text-danger", issues };
}

function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-lg bg-foreground/5 ${className}`}>
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-foreground/10 to-transparent" />
    </div>
  );
}

function KPICardSkeleton() {
  return (
    <div className="glass-card p-5 rounded-xl border border-glass-border">
      <Skeleton className="h-4 w-24 mb-3" />
      <Skeleton className="h-8 w-16 mb-2" />
      <Skeleton className="h-3 w-32" />
    </div>
  );
}

function TableRowSkeleton({ cols = 5 }: { cols?: number }) {
  return (
    <tr className="border-b border-glass-border">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="p-4"><Skeleton className="h-4 w-full max-w-[120px]" /></td>
      ))}
    </tr>
  );
}

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card p-3 rounded-lg border border-glass-border shadow-xl text-xs">
      <p className="font-bold text-foreground mb-1">{label}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} style={{ color: entry.color }} className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: entry.color }} />
          {entry.name}: <strong>{entry.value}</strong>
        </p>
      ))}
    </div>
  );
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring" as const, stiffness: 300, damping: 24 } },
};

const tabContentVariants = {
  enter: { opacity: 0, x: 20 },
  center: { opacity: 1, x: 0, transition: { duration: 0.3, ease: "easeOut" as const } },
  exit: { opacity: 0, x: -20, transition: { duration: 0.2 } },
};

const PIE_COLORS = ["#22c55e", "#ef4444", "#f59e0b", "#3b82f6", "#8b5cf6"];

type TabKey = "login" | "audit" | "sessions" | "blacklist" | "overview";

export default function SecurityView() {
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [logType, setLogType] = useState("login");
  const [loginLogs, setLoginLogs] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [blacklist, setBlacklist] = useState<any[]>([]);
  const [loginTotal, setLoginTotal] = useState(0);
  const [auditTotal, setAuditTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [securityScore, setSecurityScore] = useState({ score: 100, label: "Güvenli", color: "text-success", issues: [] as string[] });
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [newBlacklistIP, setNewBlacklistIP] = useState("");
  const [newBlacklistReason, setNewBlacklistReason] = useState("");

  useEffect(() => {
    async function loadAll() {
      setIsLoading(true);
      try {
        const [loginRes, auditRes, sessionsRes, blacklistRes, analyticsRes] = await Promise.all([
          fetch("/api/admin/logs?type=login&take=50&skip=0"),
          fetch("/api/admin/logs?type=audit&take=50&skip=0"),
          fetch("/api/admin/sessions?take=20"),
          fetch("/api/admin/blacklist"),
          fetch("/api/analytics?type=security"),
        ]);
        if (loginRes.ok) {
          const ld = await loginRes.json();
          setLoginLogs(ld.logs || []);
          setLoginTotal(ld.total || 0);
        }
        if (auditRes.ok) {
          const ad = await auditRes.json();
          setAuditLogs(ad.logs || []);
          setAuditTotal(ad.total || 0);
        }
        if (sessionsRes.ok) {
          const sd = await sessionsRes.json();
          setSessions(sd.sessions || []);
        }
        if (blacklistRes.ok) {
          const bd = await blacklistRes.json();
          setBlacklist(bd.items || []);
        }
      } catch (err) {
        console.error("SecurityView fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadAll();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      setSecurityScore(calculateSecurityScore(loginLogs, auditLogs));
    }
  }, [loginLogs, auditLogs, isLoading]);

  const kpis = useMemo(() => {
    const todayLogins = loginLogs.filter((l) => isToday(l.createdAt)).length;
    const failedAttempts = loginLogs.filter((l) => !l.success).length;
    const todayAudit = auditLogs.filter((l) => isToday(l.createdAt)).length;
    const failedToday = loginLogs.filter((l) => isToday(l.createdAt) && !l.success).length;
    const successRate = loginLogs.length > 0 ? Math.round(((loginLogs.length - failedAttempts) / loginLogs.length) * 100) : 100;
    return { todayLogins, failedAttempts, todayAudit, activeSessions: sessions.length || loginTotal, failedToday, successRate, totalSessions: sessions.length };
  }, [loginLogs, auditLogs, loginTotal, sessions]);

  const chartData = useMemo(() => getLast7DaysChart(loginLogs), [loginLogs]);

  const pieData = useMemo(() => [
    { name: "Başarılı", value: loginLogs.filter((l) => l.success).length, color: "#22c55e" },
    { name: "Başarısız", value: loginLogs.filter((l) => !l.success).length, color: "#ef4444" },
  ], [loginLogs]);

  const auditPieData = useMemo(() => {
    const actionCounts: Record<string, number> = {};
    auditLogs.forEach((l) => {
      const action = l.action || "Bilinmeyen";
      actionCounts[action] = (actionCounts[action] || 0) + 1;
    });
    return Object.entries(actionCounts).slice(0, 5).map(([name, value], i) => ({
      name, value, color: PIE_COLORS[i % PIE_COLORS.length],
    }));
  }, [auditLogs]);

  const filteredLogs = useMemo(() => {
    const source = logType === "login" ? loginLogs : auditLogs;
    let result = source;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((log) => {
        const email = log.user?.email?.toLowerCase() || "";
        const action = log.action?.toLowerCase() || "";
        const ip = log.ipAddress?.toLowerCase() || "";
        const details = log.details?.toLowerCase() || "";
        return email.includes(q) || action.includes(q) || ip.includes(q) || details.includes(q);
      });
    }
    if (logType === "login" && statusFilter !== "all") {
      result = result.filter((log) => (statusFilter === "success" ? log.success : !log.success));
    }
    return result;
  }, [logType, loginLogs, auditLogs, searchQuery, statusFilter]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  async function handleRevokeSession(sessionId: number) {
    const result = await Swal.fire({
      title: "Oturumu Sonlandır?",
      text: "Bu oturum zorla kapatılacak.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Evet, sonlandır",
      cancelButtonText: "İptal",
    });
    if (result.isConfirmed) {
      try {
        const res = await fetch(`/api/admin/sessions/${sessionId}`, { method: "DELETE" });
        if (res.ok) {
          setSessions((prev) => prev.filter((s) => s.id !== sessionId));
          Swal.fire("Başarılı", "Oturum sonlandırıldı.", "success");
        } else {
          Swal.fire("Hata", "Oturum sonlandırılamadı.", "error");
        }
      } catch {
        Swal.fire("Hata", "Bir sorun oluştu.", "error");
      }
    }
  }

  async function handleAddToBlacklist() {
    if (!newBlacklistIP.trim()) return;
    try {
      const res = await fetch("/api/admin/blacklist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ip: newBlacklistIP.trim(), reason: newBlacklistReason.trim() }),
      });
      if (res.ok) {
        setBlacklist((prev) => [...prev, { ip: newBlacklistIP.trim(), reason: newBlacklistReason.trim(), createdAt: new Date().toISOString() }]);
        setNewBlacklistIP("");
        setNewBlacklistReason("");
        Swal.fire("Başarılı", "IP kara listeye eklendi.", "success");
      } else {
        Swal.fire("Hata", "IP eklenemedi.", "error");
      }
    } catch {
      Swal.fire("Hata", "Bir sorun oluştu.", "error");
    }
  }

  async function handleRemoveFromBlacklist(ip: string) {
    try {
      const res = await fetch(`/api/admin/blacklist?ip=${encodeURIComponent(ip)}`, { method: "DELETE" });
      if (res.ok) {
        setBlacklist((prev) => prev.filter((b) => b.ip !== ip));
        Swal.fire("Başarılı", "IP kara listeden çıkarıldı.", "success");
      } else {
        Swal.fire("Hata", "IP kaldırılamadı.", "error");
      }
    } catch {
      Swal.fire("Hata", "Bir sorun oluştu.", "error");
    }
  }

  async function handleExportReport() {
    const data = {
      exportDate: new Date().toISOString(),
      securityScore,
      kpis,
      loginLogs: loginLogs.slice(0, 100),
      auditLogs: auditLogs.slice(0, 100),
      sessions,
      blacklist,
      chartData,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `güvenlik-raporu-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
    Swal.fire("Başarılı", "Rapor indiriliyor.", "success");
  }

  const kpiCards = [
    { title: "Güvenlik Skoru", value: `${securityScore.score}`, subtitle: securityScore.label, icon: securityScore.score >= 80 ? ShieldCheck : securityScore.score >= 60 ? Shield : ShieldOff, color: securityScore.color, bgColor: `${securityScore.color.replace("text-", "bg-")}/10`, borderColor: `${securityScore.color.replace("text-", "border-")}/20` },
    { title: "Bugünkü Girişler", value: kpis.todayLogins, subtitle: "Son 24 saat", icon: LogIn, color: "text-info", bgColor: "bg-info/10", borderColor: "border-info/20" },
    { title: "Başarısız Denemeler", value: kpis.failedAttempts, subtitle: `${kpis.failedToday} bugün`, icon: ShieldAlert, color: "text-danger", bgColor: "bg-danger/10", borderColor: "border-danger/20" },
    { title: "Başarı Oranı", value: `%${kpis.successRate}`, subtitle: `${kpis.activeSessions} aktif oturum`, icon: TrendingUp, color: "text-success", bgColor: "bg-success/10", borderColor: "border-success/20" },
  ];

  const tabs: { key: TabKey; label: string; icon: any }[] = [
    { key: "overview", label: "Genel Bakış", icon: BarChart3 },
    { key: "login", label: "Oturum Geçmişi", icon: LogIn },
    { key: "audit", label: "Denetim Logları", icon: Activity },
    { key: "sessions", label: "Aktif Oturumlar", icon: Users },
    { key: "blacklist", label: "IP Kara Liste", icon: Ban },
  ];

  const loginSubTabs = [
    { key: "login", label: "Oturum Geçmişi", icon: LogIn, count: loginTotal },
    { key: "audit", label: "Denetim Logları", icon: Activity, count: auditTotal },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-3">
            <Shield className="w-7 h-7 text-primary" />
            Güvenlik Kontrol Merkezi
          </h2>
          <p className="text-foreground/60 text-sm mt-1">Sistem güvenlik durumu, oturumlar ve denetim kayıtları</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-foreground/5 hover:bg-foreground/10 border border-glass-border rounded-lg transition-colors text-foreground/70 hover:text-foreground"
            >
              <Download className="w-4 h-4" />
              Rapor İndir
            </button>
            {showExportMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 glass-panel rounded-xl border border-glass-border shadow-2xl overflow-hidden z-50">
                <button onClick={handleExportReport} className="w-full px-4 py-2.5 text-left text-sm text-foreground hover:bg-foreground/5 flex items-center gap-2">
                  <FileText className="w-4 h-4" /> JSON Rapor
                </button>
                <button onClick={() => { setShowExportMenu(false); window.print(); }} className="w-full px-4 py-2.5 text-left text-sm text-foreground hover:bg-foreground/5 flex items-center gap-2">
                  <Download className="w-4 h-4" /> PDF (Yazdır)
                </button>
              </div>
            )}
          </div>
          <Link href="/admin/login-history" className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-foreground/5 hover:bg-foreground/10 border border-glass-border rounded-lg transition-colors text-foreground/70 hover:text-foreground">
            <LogIn className="w-4 h-4" /> Detaylı Görüntüle <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1 p-1 bg-foreground/5 rounded-xl border border-glass-border">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => { setActiveTab(tab.key); setSearchQuery(""); setStatusFilter("all"); }}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === tab.key ? "bg-primary text-foreground shadow-sm" : "text-foreground/50 hover:text-foreground/80"}`}
          >
            <tab.icon className="w-4 h-4" /> {tab.label}
          </button>
        ))}
      </div>

      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        key={activeTab}
      >
        {isLoading ? Array.from({ length: 4 }).map((_, i) => (
          <motion.div key={i} variants={cardVariants}><KPICardSkeleton /></motion.div>
        )) : kpiCards.map((kpi) => (
          <motion.div
            key={kpi.title}
            variants={cardVariants}
            whileHover={{ y: -2, transition: { duration: 0.2 } }}
            className={`glass-card p-5 rounded-xl border ${kpi.borderColor} relative overflow-hidden group cursor-default`}
          >
            <div className={`absolute top-0 right-0 w-20 h-20 ${kpi.bgColor} rounded-bl-[40px] opacity-50 group-hover:opacity-80 transition-opacity`} />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-foreground/50">{kpi.title}</span>
                <div className={`w-8 h-8 rounded-lg ${kpi.bgColor} flex items-center justify-center`}>
                  <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
                </div>
              </div>
              <p className={`text-3xl font-black ${kpi.color}`}>{kpi.value}</p>
              <p className="text-xs text-foreground/40 mt-1">{kpi.subtitle}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          variants={tabContentVariants}
          initial="enter"
          animate="center"
          exit="exit"
        >
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-panel p-6 rounded-xl border border-glass-border">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-primary" /> Giriş Aktivitesi (Son 7 Gün)
                      </h3>
                      <p className="text-xs text-foreground/40 mt-0.5">Başarılı ve başarısız giriş denemeleri</p>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-foreground/50">
                      <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-success" /> Başarılı</span>
                      <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-danger" /> Başarısız</span>
                    </div>
                  </div>
                  {isLoading ? <Skeleton className="h-[180px] w-full rounded-lg" /> : (
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart data={chartData} barGap={4}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-foreground, #888)" opacity={0.08} />
                        <XAxis dataKey="label" tick={{ fill: "var(--color-foreground, #888)", fontSize: 11, opacity: 0.5 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: "var(--color-foreground, #888)", fontSize: 11, opacity: 0.5 }} axisLine={false} tickLine={false} allowDecimals={false} />
                        <Tooltip content={<ChartTooltip active={undefined} payload={undefined} label={undefined} />} cursor={{ fill: "var(--color-foreground, #888)", opacity: 0.05 }} />
                        <Bar dataKey="basarili" name="Başarılı" fill="#22c55e" radius={[4, 4, 0, 0]} maxBarSize={32} />
                        <Bar dataKey="basarisiz" name="Başarısız" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={32} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-panel p-6 rounded-xl border border-glass-border">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                        <PieIcon className="w-4 h-4 text-primary" /> Giriş Dağılımı
                      </h3>
                      <p className="text-xs text-foreground/40 mt-0.5">Toplam giriş denemeleri</p>
                    </div>
                  </div>
                  {isLoading ? <Skeleton className="h-[180px] w-full rounded-lg" /> : (
                    <ResponsiveContainer width="100%" height={180}>
                      <PieChart>
                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                          {pieData.map((entry, index) => (<Cell key={index} fill={entry.color} />))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </motion.div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-panel p-6 rounded-xl border border-glass-border">
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-2 mb-4">
                    <Shield className="w-4 h-4 text-primary" /> Güvenlik Skoru
                  </h3>
                  <div className="flex items-center gap-6">
                    <div className={`relative w-24 h-24 rounded-full border-4 ${securityScore.color.replace("text-", "border-")}/30 flex items-center justify-center`}>
                      <span className={`text-3xl font-black ${securityScore.color}`}>{securityScore.score}</span>
                    </div>
                    <div>
                      <p className={`text-lg font-bold ${securityScore.color}`}>{securityScore.label}</p>
                      {securityScore.issues.length > 0 ? (
                        <ul className="mt-2 space-y-1">
                          {securityScore.issues.map((issue, i) => (
                            <li key={i} className="text-xs text-foreground/60 flex items-center gap-1.5">
                              <AlertTriangle className="w-3 h-3 text-secondary" /> {issue}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-xs text-foreground/50 mt-1">Tüm güvenlik kontrolleri başarılı.</p>
                      )}
                    </div>
                  </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="glass-panel p-6 rounded-xl border border-glass-border">
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-2 mb-4">
                    <Activity className="w-4 h-4 text-primary" /> Denetim Log Dağılımı
                  </h3>
                  {isLoading || auditPieData.length === 0 ? (
                    <Skeleton className="h-[150px] w-full rounded-lg" />
                  ) : (
                    <ResponsiveContainer width="100%" height={150}>
                      <PieChart>
                        <Pie data={auditPieData} cx="50%" cy="50%" outerRadius={60} paddingAngle={3} dataKey="value" label={({ name }) => name.length > 12 ? name.slice(0, 12) + ".." : name}>
                          {auditPieData.map((entry, index) => (<Cell key={index} fill={entry.color} />))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </motion.div>
              </div>
            </div>
          )}

          {activeTab === "login" && (
            <div className="glass-panel rounded-xl border border-glass-border overflow-hidden shadow-lg">
              <div className="flex items-center border-b border-glass-border bg-foreground/[0.02]">
                {loginSubTabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => { setLogType(tab.key); setSearchQuery(""); setStatusFilter("all"); }}
                    className={`relative flex items-center gap-2 px-6 py-3.5 text-sm font-bold transition-colors ${logType === tab.key ? "text-primary" : "text-foreground/50 hover:text-foreground/80"}`}
                  >
                    <tab.icon className="w-4 h-4" /> {tab.label}
                    <span className={`ml-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${logType === tab.key ? "bg-primary/15 text-primary" : "bg-foreground/5 text-foreground/40"}`}>{tab.count}</span>
                    {logType === tab.key && <motion.div layoutId="activeSubTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" transition={{ type: "spring", stiffness: 400, damping: 30 }} />}
                  </button>
                ))}
              </div>

              <div className="p-4 border-b border-glass-border bg-foreground/[0.02] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="relative w-full sm:w-80">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
                  <input type="text" value={searchQuery} onChange={handleSearchChange} placeholder={logType === "login" ? "Email veya IP adresi ara..." : "Eylem, email veya IP ara..."} className="w-full pl-10 pr-4 py-2.5 bg-background border border-glass-border rounded-lg text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-foreground/30" />
                </div>
                <div className="flex items-center gap-2">
                  {logType === "login" && (
                    <div className="flex items-center gap-1 p-1 bg-foreground/5 rounded-lg border border-glass-border">
                      {[{ key: "all", label: "Tümü" }, { key: "success", label: "Başarılı" }, { key: "failed", label: "Başarısız" }].map((opt) => (
                        <button key={opt.key} onClick={() => setStatusFilter(opt.key)} className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${statusFilter === opt.key ? "bg-primary text-foreground shadow-sm" : "text-foreground/50 hover:text-foreground/80"}`}>{opt.label}</button>
                      ))}
                    </div>
                  )}
                  <Link href={logType === "login" ? "/admin/login-history" : "/admin/audit-logs"} className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-primary hover:bg-primary/10 rounded-lg transition-colors border border-primary/20">
                    Tümünü Gör <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              <div className="overflow-x-auto custom-scrollbar">
                {isLoading ? (
                  <table className="w-full text-left border-collapse">
                    <thead><tr className="bg-foreground/[0.03] border-b border-glass-border">
                      {(logType === "login" ? ["Tarih", "Kullanıcı", "IP Adresi / Konum", "Durum"] : ["Tarih", "Kullanıcı", "Eylem", "Detay"]).map((h) => (
                        <th key={h} className="p-4 text-xs font-bold uppercase tracking-wider text-foreground/50">{h}</th>
                      ))}
                    </tr></thead>
                    <tbody>{Array.from({ length: 6 }).map((_, i) => (<TableRowSkeleton key={i} cols={4} />))}</tbody>
                  </table>
                ) : logType === "login" ? (
                  <table className="w-full text-left border-collapse">
                    <thead><tr className="bg-foreground/[0.03] border-b border-glass-border">
                      <th className="p-4 text-xs font-bold uppercase tracking-wider text-foreground/50">Tarih</th>
                      <th className="p-4 text-xs font-bold uppercase tracking-wider text-foreground/50">Kullanıcı</th>
                      <th className="p-4 text-xs font-bold uppercase tracking-wider text-foreground/50">IP Adresi / Konum</th>
                      <th className="p-4 text-xs font-bold uppercase tracking-wider text-foreground/50 text-center">Durum</th>
                    </tr></thead>
                    <tbody className="divide-y divide-glass-border">
                      {filteredLogs.length === 0 ? (
                        <tr><td colSpan={4} className="py-16 text-center text-foreground/40">
                          <div className="flex flex-col items-center gap-2"><Shield className="w-10 h-10 text-foreground/20" /><span className="text-sm font-medium">Kayıt bulunamadı</span></div>
                        </td></tr>
                      ) : filteredLogs.map((log, index) => {
                        const geo = mockGeoLookup(log.ipAddress);
                        return (
                          <motion.tr key={log.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: index * 0.02 }} className="hover:bg-foreground/[0.03] transition-colors group">
                            <td className="p-4">
                              <div className="flex items-center gap-2 text-sm"><Clock className="w-3.5 h-3.5 text-foreground/30" /><span className="text-foreground/60 font-medium">{timeAgo(log.createdAt)}</span></div>
                              <span className="text-[10px] text-foreground/30 font-mono ml-5.5">{new Date(log.createdAt).toLocaleString("tr-TR")}</span>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-bold text-primary uppercase">{log.user?.email ? log.user.email.substring(0, 2) : "??"}</div>
                                <div><p className="text-sm font-semibold text-foreground">{log.user?.name || log.user?.email || "Anonim"}</p><p className="text-xs text-foreground/40">{log.user?.email || "—"}</p></div>
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-2 text-sm">
                                <Globe className="w-3.5 h-3.5 text-foreground/30" />
                                <div>
                                  <span className="font-mono text-foreground/60 text-xs">{log.ipAddress || "Bilinmeyen"}</span>
                                  {geo && <p className="text-[10px] text-foreground/40 flex items-center gap-1">{geo.flag} {geo.city}, {geo.country}</p>}
                                </div>
                              </div>
                            </td>
                            <td className="p-4 text-center">
                              {log.success ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-success/10 text-success border border-success/20">
                                  <CheckCircle2 className="w-3 h-3" /> Başarılı
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-danger/10 text-danger border border-danger/20">
                                  <XCircle className="w-3 h-3" /> Reddedildi
                                </span>
                              )}
                            </td>
                          </motion.tr>
                        );
                      })}
                    </tbody>
                  </table>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead><tr className="bg-foreground/[0.03] border-b border-glass-border">
                      <th className="p-4 text-xs font-bold uppercase tracking-wider text-foreground/50">Tarih</th>
                      <th className="p-4 text-xs font-bold uppercase tracking-wider text-foreground/50">Kullanıcı</th>
                      <th className="p-4 text-xs font-bold uppercase tracking-wider text-foreground/50">Eylem</th>
                      <th className="p-4 text-xs font-bold uppercase tracking-wider text-foreground/50">Detaylar</th>
                    </tr></thead>
                    <tbody className="divide-y divide-glass-border">
                      {filteredLogs.length === 0 ? (
                        <tr><td colSpan={4} className="py-16 text-center text-foreground/40">
                          <div className="flex flex-col items-center gap-2"><Activity className="w-10 h-10 text-foreground/20" /><span className="text-sm font-medium">Kayıt bulunamadı</span></div>
                        </td></tr>
                      ) : filteredLogs.map((log, index) => (
                        <motion.tr key={log.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: index * 0.02 }} className="hover:bg-foreground/[0.03] transition-colors group">
                          <td className="p-4">
                            <div className="flex items-center gap-2 text-sm"><Clock className="w-3.5 h-3.5 text-foreground/30" /><span className="text-foreground/60 font-medium">{timeAgo(log.createdAt)}</span></div>
                            <span className="text-[10px] text-foreground/30 font-mono ml-5.5">{new Date(log.createdAt).toLocaleString("tr-TR")}</span>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-secondary/10 border border-secondary/20 flex items-center justify-center text-xs font-bold text-secondary uppercase">{log.user?.email ? log.user.email.substring(0, 2) : "??"}</div>
                              <div><p className="text-sm font-semibold text-foreground">{log.user?.name || log.user?.email || "Sistem"}</p><p className="text-xs text-foreground/40 flex items-center gap-1"><Globe className="w-3 h-3" /> {log.ipAddress || "—"}</p></div>
                            </div>
                          </td>
                          <td className="p-4"><span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-primary/10 text-primary border border-primary/20"><Activity className="w-3 h-3" /> {log.action}</span></td>
                          <td className="p-4 max-w-xs"><p className="text-sm text-foreground/50 truncate" title={log.details || ""}>{log.details || "—"}</p></td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {!isLoading && (
                <div className="p-4 border-t border-glass-border bg-foreground/[0.02] flex items-center justify-between">
                  <span className="text-xs text-foreground/40">{filteredLogs.length} / {logType === "login" ? loginTotal : auditTotal} kayıt gösteriliyor</span>
                  <Link href={logType === "login" ? "/admin/login-history" : "/admin/audit-logs"} className="flex items-center gap-1 text-xs font-bold text-primary hover:underline">
                    Tüm kayıtları görüntüle <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              )}
            </div>
          )}

          {activeTab === "sessions" && (
            <div className="glass-panel rounded-xl border border-glass-border overflow-hidden shadow-lg">
              <div className="p-4 border-b border-glass-border bg-foreground/[0.02] flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-2"><Users className="w-4 h-4 text-primary" /> Aktif Oturumlar ({sessions.length})</h3>
                  <p className="text-xs text-foreground/40 mt-0.5">Şu anda aktif olan kullanıcı oturumları</p>
                </div>
                <button onClick={async () => {
                  const result = await Swal.fire({ title: "Tüm oturumları sonlandır?", text: "Tüm kullanıcıların oturumları kapatılacak.", icon: "warning", showCancelButton: true, confirmButtonText: "Evet", cancelButtonText: "İptal" });
                  if (result.isConfirmed) {
                    try {
                      await fetch("/api/admin/sessions", { method: "DELETE" });
                      setSessions([]);
                      Swal.fire("Başarılı", "Tüm oturumlar sonlandırıldı.", "success");
                    } catch { Swal.fire("Hata", "Bir sorun oluştu.", "error"); }
                  }
                }} className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-danger hover:bg-danger/10 rounded-lg transition-colors border border-danger/20">
                  <Trash2 className="w-3.5 h-3.5" /> Tümünü Sonlandır
                </button>
              </div>
              <div className="overflow-x-auto custom-scrollbar">
                {isLoading ? (
                  <table className="w-full text-left border-collapse">
                    <thead><tr className="bg-foreground/[0.03] border-b border-glass-border">
                      {["Kullanıcı", "Cihaz", "Son Aktivite", "Süre", "İşlem"].map((h) => (
                        <th key={h} className="p-4 text-xs font-bold uppercase tracking-wider text-foreground/50">{h}</th>
                      ))}
                    </tr></thead>
                    <tbody>{Array.from({ length: 4 }).map((_, i) => (<TableRowSkeleton key={i} cols={5} />))}</tbody>
                  </table>
                ) : sessions.length === 0 ? (
                  <div className="py-16 text-center text-foreground/40">
                    <div className="flex flex-col items-center gap-2"><Users className="w-10 h-10 text-foreground/20" /><span className="text-sm font-medium">Aktif oturum bulunamadı</span></div>
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead><tr className="bg-foreground/[0.03] border-b border-glass-border">
                      <th className="p-4 text-xs font-bold uppercase tracking-wider text-foreground/50">Kullanıcı</th>
                      <th className="p-4 text-xs font-bold uppercase tracking-wider text-foreground/50">Cihaz</th>
                      <th className="p-4 text-xs font-bold uppercase tracking-wider text-foreground/50">Son Aktivite</th>
                      <th className="p-4 text-xs font-bold uppercase tracking-wider text-foreground/50">Geçerlilik</th>
                      <th className="p-4 text-xs font-bold uppercase tracking-wider text-foreground/50 text-center">İşlem</th>
                    </tr></thead>
                    <tbody className="divide-y divide-glass-border">
                      {sessions.map((session, index) => (
                        <motion.tr key={session.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: index * 0.03 }} className="hover:bg-foreground/[0.03] transition-colors group">
                          <td className="p-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-info/10 border border-info/20 flex items-center justify-center text-xs font-bold text-info">{session.user?.name?.[0] || session.user?.email?.[0] || "?"}</div>
                              <div><p className="text-sm font-semibold text-foreground">{session.user?.name || "Bilinmeyen"}</p><p className="text-xs text-foreground/40">{session.user?.email || "—"}</p></div>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-1.5 text-sm">
                              <Monitor className="w-3.5 h-3.5 text-foreground/30" />
                              <span className="text-xs text-foreground/60">{session.userAgent || "Bilinmeyen"}</span>
                            </div>
                          </td>
                          <td className="p-4 text-sm text-foreground/60">{timeAgo(session.lastActivity || session.createdAt || session.expires)}</td>
                          <td className="p-4">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${new Date(session.expires) > new Date() ? "bg-success/10 text-success border border-success/20" : "bg-danger/10 text-danger border border-danger/20"}`}>
                              {new Date(session.expires) > new Date() ? "Aktif" : "Süresi Dolmuş"}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <button onClick={() => handleRevokeSession(session.id)} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-danger/10 text-danger hover:bg-danger/20 transition-colors border border-danger/20">
                              <XCircle className="w-3 h-3" /> Sonlandır
                            </button>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {activeTab === "blacklist" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 glass-panel rounded-xl border border-glass-border overflow-hidden shadow-lg">
                <div className="p-4 border-b border-glass-border bg-foreground/[0.02]">
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-2"><Ban className="w-4 h-4 text-primary" /> Kara Liste ({blacklist.length})</h3>
                  <p className="text-xs text-foreground/40 mt-0.5">Engellenen IP adresleri</p>
                </div>
                <div className="overflow-x-auto custom-scrollbar">
                  {isLoading ? (
                    <table className="w-full text-left border-collapse">
                      <thead><tr className="bg-foreground/[0.03] border-b border-glass-border">
                        {["IP Adresi", "Sebep", "Eklenme Tarihi", "İşlem"].map((h) => (
                          <th key={h} className="p-4 text-xs font-bold uppercase tracking-wider text-foreground/50">{h}</th>
                        ))}
                      </tr></thead>
                      <tbody>{Array.from({ length: 3 }).map((_, i) => (<TableRowSkeleton key={i} cols={4} />))}</tbody>
                    </table>
                  ) : blacklist.length === 0 ? (
                    <div className="py-16 text-center text-foreground/40">
                      <div className="flex flex-col items-center gap-2"><Ban className="w-10 h-10 text-foreground/20" /><span className="text-sm font-medium">Kara liste boş</span></div>
                    </div>
                  ) : (
                    <table className="w-full text-left border-collapse">
                      <thead><tr className="bg-foreground/[0.03] border-b border-glass-border">
                        <th className="p-4 text-xs font-bold uppercase tracking-wider text-foreground/50">IP Adresi</th>
                        <th className="p-4 text-xs font-bold uppercase tracking-wider text-foreground/50">Konum</th>
                        <th className="p-4 text-xs font-bold uppercase tracking-wider text-foreground/50">Sebep</th>
                        <th className="p-4 text-xs font-bold uppercase tracking-wider text-foreground/50">Tarih</th>
                        <th className="p-4 text-xs font-bold uppercase tracking-wider text-foreground/50 text-center">İşlem</th>
                      </tr></thead>
                      <tbody className="divide-y divide-glass-border">
                        {blacklist.map((item, index) => {
                          const geo = mockGeoLookup(item.ip);
                          return (
                            <motion.tr key={item.ip} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: index * 0.03 }} className="hover:bg-foreground/[0.03] transition-colors group">
                              <td className="p-4"><span className="font-mono text-sm text-foreground/80">{item.ip}</span></td>
                              <td className="p-4"><span className="text-xs text-foreground/60 flex items-center gap-1">{geo?.flag} {geo?.city || "Bilinmeyen"}</span></td>
                              <td className="p-4"><span className="text-sm text-foreground/60">{item.reason || "Belirtilmemiş"}</span></td>
                              <td className="p-4 text-sm text-foreground/60">{timeAgo(item.createdAt)}</td>
                              <td className="p-4 text-center">
                                <button onClick={() => handleRemoveFromBlacklist(item.ip)} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-success/10 text-success hover:bg-success/20 transition-colors border border-success/20">
                                  <CheckCircle2 className="w-3 h-3" /> Kaldır
                                </button>
                              </td>
                            </motion.tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>

              <div className="glass-panel p-6 rounded-xl border border-glass-border">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2 mb-4"><Plus className="w-4 h-4 text-primary" /> IP Ekle</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-foreground/60 mb-1.5">IP Adresi</label>
                    <input type="text" value={newBlacklistIP} onChange={(e) => setNewBlacklistIP(e.target.value)} placeholder="örn: 192.168.1.100" className="w-full px-4 py-2.5 bg-background border border-glass-border rounded-lg text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-foreground/30" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-foreground/60 mb-1.5">Sebep</label>
                    <input type="text" value={newBlacklistReason} onChange={(e) => setNewBlacklistReason(e.target.value)} placeholder="örn: Çoklu başarısız giriş" className="w-full px-4 py-2.5 bg-background border border-glass-border rounded-lg text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-foreground/30" />
                  </div>
                  <button onClick={handleAddToBlacklist} disabled={!newBlacklistIP.trim()} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold bg-danger/10 text-danger border border-danger/20 rounded-lg hover:bg-danger/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    <Ban className="w-4 h-4" /> Kara Listeye Ekle
                  </button>
                </div>
                <div className="mt-6 pt-4 border-t border-glass-border">
                  <h4 className="text-xs font-bold text-foreground/60 mb-2">Önerilen IP'ler</h4>
                  <div className="space-y-2">
                    {[
                      { ip: "10.0.0.1", reason: "Bilinen saldırı kaynağı" },
                      { ip: "192.168.1.99", reason: "Çoklu başarısız giriş (15 deneme)" },
                      { ip: "172.16.0.50", reason: "Şüpheli aktivite" },
                    ].map((suggestion) => (
                      <button key={suggestion.ip} onClick={() => { setNewBlacklistIP(suggestion.ip); setNewBlacklistReason(suggestion.reason); }} className="w-full text-left px-3 py-2 rounded-lg bg-foreground/5 hover:bg-foreground/10 transition-colors text-xs">
                        <span className="font-mono font-bold text-foreground/80">{suggestion.ip}</span>
                        <p className="text-foreground/40 mt-0.5">{suggestion.reason}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <style jsx global>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
