'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  Activity,
  LogIn,
  UserCheck,
  UserX,
  Search,
  Filter,
  ExternalLink,
  Globe,
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ChevronRight,
} from 'lucide-react';
import Swal from 'sweetalert2';

// ─── Relative timestamp in Turkish ──────────────────────────────────────────
function timeAgo(dateStr) {
  const now = new Date();
  const date = new Date(dateStr);
  const seconds = Math.floor((now - date) / 1000);
  if (seconds < 60) return 'Az önce';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} dk önce`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} saat önce`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} gün önce`;
  return new Date(dateStr).toLocaleDateString('tr-TR');
}

// ─── Helpers ────────────────────────────────────────────────────────────────
function isToday(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  return (
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear()
  );
}

const DAY_NAMES_TR = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];

function getLast7DaysChart(logs) {
  const now = new Date();
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    days.push({
      date: key,
      label: DAY_NAMES_TR[d.getDay()],
      basarili: 0,
      basarisiz: 0,
    });
  }
  const dayMap = {};
  days.forEach((d) => (dayMap[d.date] = d));

  logs.forEach((log) => {
    const key = new Date(log.createdAt).toISOString().slice(0, 10);
    if (dayMap[key]) {
      if (log.success) dayMap[key].basarili++;
      else dayMap[key].basarisiz++;
    }
  });
  return days;
}

// ─── Skeleton shimmer component ─────────────────────────────────────────────
function Skeleton({ className = '' }) {
  return (
    <div
      className={`relative overflow-hidden rounded-lg bg-foreground/5 ${className}`}
    >
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

function TableRowSkeleton({ cols = 4 }) {
  return (
    <tr className="border-b border-glass-border">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="p-4">
          <Skeleton className="h-4 w-full max-w-[120px]" />
        </td>
      ))}
    </tr>
  );
}

// ─── Custom Recharts Tooltip ────────────────────────────────────────────────
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card p-3 rounded-lg border border-glass-border shadow-xl text-xs">
      <p className="font-bold text-foreground mb-1">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} style={{ color: entry.color }} className="flex items-center gap-1.5">
          <span
            className="w-2 h-2 rounded-full inline-block"
            style={{ backgroundColor: entry.color }}
          />
          {entry.name}: <strong>{entry.value}</strong>
        </p>
      ))}
    </div>
  );
}

// ─── Animation Variants ─────────────────────────────────────────────────────
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 300, damping: 24 },
  },
};

const tabContentVariants = {
  enter: { opacity: 0, x: 20 },
  center: { opacity: 1, x: 0, transition: { duration: 0.3, ease: 'easeOut' } },
  exit: { opacity: 0, x: -20, transition: { duration: 0.2 } },
};

// ═════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═════════════════════════════════════════════════════════════════════════════
export default function SecurityView() {
  const [logType, setLogType] = useState('login');
  const [loginLogs, setLoginLogs] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loginTotal, setLoginTotal] = useState(0);
  const [auditTotal, setAuditTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all | success | failed

  // ─── Fetch both log types on mount ──────────────────────────────────────
  useEffect(() => {
    async function loadAll() {
      setIsLoading(true);
      try {
        const [loginRes, auditRes] = await Promise.all([
          fetch('/api/admin/logs?type=login&take=50&skip=0'),
          fetch('/api/admin/logs?type=audit&take=50&skip=0'),
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
      } catch (err) {
        console.error('SecurityView fetch error:', err);
        Swal.fire('Hata', 'Güvenlik verileri alınamadı', 'error');
      } finally {
        setIsLoading(false);
      }
    }
    loadAll();
  }, []);

  // ─── Computed KPIs ──────────────────────────────────────────────────────
  const kpis = useMemo(() => {
    const todayLogins = loginLogs.filter((l) => isToday(l.createdAt)).length;
    const failedAttempts = loginLogs.filter((l) => !l.success).length;
    const todayAudit = auditLogs.filter((l) => isToday(l.createdAt)).length;
    return {
      todayLogins,
      failedAttempts,
      todayAudit,
      activeSessions: loginTotal,
    };
  }, [loginLogs, auditLogs, loginTotal]);

  // ─── Chart Data ─────────────────────────────────────────────────────────
  const chartData = useMemo(() => getLast7DaysChart(loginLogs), [loginLogs]);

  // ─── Filtered logs ──────────────────────────────────────────────────────
  const filteredLogs = useMemo(() => {
    const source = logType === 'login' ? loginLogs : auditLogs;
    let result = source;

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((log) => {
        const email = log.user?.email?.toLowerCase() || '';
        const action = log.action?.toLowerCase() || '';
        const ip = log.ipAddress?.toLowerCase() || '';
        return email.includes(q) || action.includes(q) || ip.includes(q);
      });
    }

    // Status filter (login only)
    if (logType === 'login' && statusFilter !== 'all') {
      result = result.filter((log) =>
        statusFilter === 'success' ? log.success : !log.success
      );
    }

    return result;
  }, [logType, loginLogs, auditLogs, searchQuery, statusFilter]);

  const handleSearchChange = useCallback((e) => {
    setSearchQuery(e.target.value);
  }, []);

  // ─── KPI Card config ───────────────────────────────────────────────────
  const kpiCards = [
    {
      title: 'Bugünkü Girişler',
      value: kpis.todayLogins,
      subtitle: 'Son 24 saat',
      icon: LogIn,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20',
    },
    {
      title: 'Başarısız Denemeler',
      value: kpis.failedAttempts,
      subtitle: 'Toplam reddedilen',
      icon: ShieldAlert,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/20',
    },
    {
      title: 'Bugünkü Aktiviteler',
      value: kpis.todayAudit,
      subtitle: 'Denetim kaydı',
      icon: Activity,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/20',
    },
    {
      title: 'Toplam Oturum',
      value: kpis.activeSessions,
      subtitle: 'Kayıtlı giriş',
      icon: ShieldCheck,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/20',
    },
  ];

  // ─── Tab configuration ─────────────────────────────────────────────────
  const tabs = [
    {
      key: 'login',
      label: 'Oturum Geçmişi',
      icon: LogIn,
      count: loginTotal,
    },
    {
      key: 'audit',
      label: 'Denetim Logları',
      icon: Activity,
      count: auditTotal,
    },
  ];

  // ═════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═════════════════════════════════════════════════════════════════════════
  return (
    <div className="space-y-6 animate-fade-in">
      {/* ─── Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-3">
            <Shield className="w-7 h-7 text-primary" />
            Güvenlik Kontrol Merkezi
          </h2>
          <p className="text-foreground/60 text-sm mt-1">
            Sistem erişim ve değişiklik kayıtlarını izleyin
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/login-history"
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-foreground/5 hover:bg-foreground/10 border border-glass-border rounded-lg transition-colors text-foreground/70 hover:text-foreground"
          >
            <LogIn className="w-4 h-4" />
            Oturum Geçmişi
            <ExternalLink className="w-3 h-3" />
          </Link>
          <Link
            href="/admin/audit-logs"
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-foreground/5 hover:bg-foreground/10 border border-glass-border rounded-lg transition-colors text-foreground/70 hover:text-foreground"
          >
            <Activity className="w-4 h-4" />
            Denetim Logları
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* ─── KPI Cards ───────────────────────────────────────────────────── */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <motion.div key={i} variants={cardVariants}>
                <KPICardSkeleton />
              </motion.div>
            ))
          : kpiCards.map((kpi) => (
              <motion.div
                key={kpi.title}
                variants={cardVariants}
                whileHover={{ y: -2, transition: { duration: 0.2 } }}
                className={`glass-card p-5 rounded-xl border ${kpi.borderColor} relative overflow-hidden group cursor-default`}
              >
                <div className={`absolute top-0 right-0 w-20 h-20 ${kpi.bgColor} rounded-bl-[40px] opacity-50 group-hover:opacity-80 transition-opacity`} />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-foreground/50">
                      {kpi.title}
                    </span>
                    <div className={`w-8 h-8 rounded-lg ${kpi.bgColor} flex items-center justify-center`}>
                      <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
                    </div>
                  </div>
                  <p className={`text-3xl font-black ${kpi.color}`}>
                    {kpi.value}
                  </p>
                  <p className="text-xs text-foreground/40 mt-1">{kpi.subtitle}</p>
                </div>
              </motion.div>
            ))}
      </motion.div>

      {/* ─── Chart Section ───────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-panel p-6 rounded-xl border border-glass-border"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              Giriş Aktivitesi (Son 7 Gün)
            </h3>
            <p className="text-xs text-foreground/40 mt-0.5">
              Başarılı ve başarısız giriş denemeleri
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs text-foreground/50">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              Başarılı
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
              Başarısız
            </span>
          </div>
        </div>
        {isLoading ? (
          <Skeleton className="h-[180px] w-full rounded-lg" />
        ) : (
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={chartData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-foreground, #888)" opacity={0.08} />
              <XAxis
                dataKey="label"
                tick={{ fill: 'var(--color-foreground, #888)', fontSize: 11, opacity: 0.5 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: 'var(--color-foreground, #888)', fontSize: 11, opacity: 0.5 }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: 'var(--color-foreground, #888)', opacity: 0.05 }} />
              <Bar
                dataKey="basarili"
                name="Başarılı"
                fill="#22c55e"
                radius={[4, 4, 0, 0]}
                maxBarSize={32}
              />
              <Bar
                dataKey="basarisiz"
                name="Başarısız"
                fill="#ef4444"
                radius={[4, 4, 0, 0]}
                maxBarSize={32}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </motion.div>

      {/* ─── Tabs + Filter Bar ───────────────────────────────────────────── */}
      <div className="glass-panel rounded-xl border border-glass-border overflow-hidden shadow-lg">
        {/* Tab bar */}
        <div className="flex items-center border-b border-glass-border bg-foreground/[0.02]">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setLogType(tab.key);
                setSearchQuery('');
                setStatusFilter('all');
              }}
              className={`relative flex items-center gap-2 px-6 py-3.5 text-sm font-bold transition-colors ${
                logType === tab.key
                  ? 'text-primary'
                  : 'text-foreground/50 hover:text-foreground/80'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              <span
                className={`ml-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  logType === tab.key
                    ? 'bg-primary/15 text-primary'
                    : 'bg-foreground/5 text-foreground/40'
                }`}
              >
                {tab.count}
              </span>
              {logType === tab.key && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Filter toolbar */}
        <div className="p-4 border-b border-glass-border bg-foreground/[0.02] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder={
                logType === 'login'
                  ? 'Email veya IP adresi ara...'
                  : 'Eylem, email veya IP ara...'
              }
              className="w-full pl-10 pr-4 py-2.5 bg-background border border-glass-border rounded-lg text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-foreground/30"
            />
          </div>
          <div className="flex items-center gap-2">
            {logType === 'login' && (
              <div className="flex items-center gap-1 p-1 bg-foreground/5 rounded-lg border border-glass-border">
                {[
                  { key: 'all', label: 'Tümü' },
                  { key: 'success', label: 'Başarılı' },
                  { key: 'failed', label: 'Başarısız' },
                ].map((opt) => (
                  <button
                    key={opt.key}
                    onClick={() => setStatusFilter(opt.key)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                      statusFilter === opt.key
                        ? 'bg-primary text-white shadow-sm'
                        : 'text-foreground/50 hover:text-foreground/80'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
            <Link
              href={logType === 'login' ? '/admin/login-history' : '/admin/audit-logs'}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-primary hover:bg-primary/10 rounded-lg transition-colors border border-primary/20"
            >
              Tümünü Gör
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* ─── Table Content with AnimatePresence ─────────────────────────── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={logType}
            variants={tabContentVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="overflow-x-auto custom-scrollbar"
          >
            {isLoading ? (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-foreground/[0.03] border-b border-glass-border">
                    {(logType === 'login'
                      ? ['Tarih', 'Kullanıcı', 'IP Adresi', 'Durum']
                      : ['Tarih', 'Kullanıcı', 'Eylem', 'Detay']
                    ).map((h) => (
                      <th
                        key={h}
                        className="p-4 text-xs font-bold uppercase tracking-wider text-foreground/50"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <TableRowSkeleton key={i} cols={4} />
                  ))}
                </tbody>
              </table>
            ) : logType === 'login' ? (
              /* ─── LOGIN TABLE ────────────────────────────────────────────── */
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-foreground/[0.03] border-b border-glass-border">
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-foreground/50">
                      Tarih
                    </th>
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-foreground/50">
                      Kullanıcı
                    </th>
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-foreground/50">
                      IP Adresi
                    </th>
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-foreground/50 text-center">
                      Durum
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-glass-border">
                  {filteredLogs.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="py-16 text-center text-foreground/40"
                      >
                        <div className="flex flex-col items-center gap-2">
                          <Shield className="w-10 h-10 text-foreground/20" />
                          <span className="text-sm font-medium">
                            Kayıt bulunamadı
                          </span>
                          <span className="text-xs text-foreground/30">
                            Arama kriterlerinizi değiştirmeyi deneyin
                          </span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredLogs.map((log, index) => (
                      <motion.tr
                        key={log.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.02 }}
                        className="hover:bg-foreground/[0.03] transition-colors group"
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="w-3.5 h-3.5 text-foreground/30" />
                            <span className="text-foreground/60 font-medium">
                              {timeAgo(log.createdAt)}
                            </span>
                          </div>
                          <span className="text-[10px] text-foreground/30 font-mono ml-5.5">
                            {new Date(log.createdAt).toLocaleString('tr-TR')}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-bold text-primary uppercase">
                              {log.user?.email
                                ? log.user.email.substring(0, 2)
                                : '??'}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-foreground">
                                {log.user?.name || log.user?.email || 'Anonim'}
                              </p>
                              <p className="text-xs text-foreground/40">
                                {log.user?.email || '—'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1.5 text-sm">
                            <Globe className="w-3.5 h-3.5 text-foreground/30" />
                            <span className="font-mono text-foreground/60 text-xs">
                              {log.ipAddress || 'Bilinmeyen'}
                            </span>
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          {log.success ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                              <CheckCircle2 className="w-3 h-3" />
                              Başarılı
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-500/10 text-red-500 border border-red-500/20">
                              <XCircle className="w-3 h-3" />
                              Reddedildi
                            </span>
                          )}
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            ) : (
              /* ─── AUDIT TABLE ────────────────────────────────────────────── */
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-foreground/[0.03] border-b border-glass-border">
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-foreground/50">
                      Tarih
                    </th>
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-foreground/50">
                      Kullanıcı
                    </th>
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-foreground/50">
                      Eylem
                    </th>
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-foreground/50">
                      Detaylar
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-glass-border">
                  {filteredLogs.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="py-16 text-center text-foreground/40"
                      >
                        <div className="flex flex-col items-center gap-2">
                          <Activity className="w-10 h-10 text-foreground/20" />
                          <span className="text-sm font-medium">
                            Kayıt bulunamadı
                          </span>
                          <span className="text-xs text-foreground/30">
                            Arama kriterlerinizi değiştirmeyi deneyin
                          </span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredLogs.map((log, index) => (
                      <motion.tr
                        key={log.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.02 }}
                        className="hover:bg-foreground/[0.03] transition-colors group"
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="w-3.5 h-3.5 text-foreground/30" />
                            <span className="text-foreground/60 font-medium">
                              {timeAgo(log.createdAt)}
                            </span>
                          </div>
                          <span className="text-[10px] text-foreground/30 font-mono ml-5.5">
                            {new Date(log.createdAt).toLocaleString('tr-TR')}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-xs font-bold text-amber-500 uppercase">
                              {log.user?.email
                                ? log.user.email.substring(0, 2)
                                : '??'}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-foreground">
                                {log.user?.name || log.user?.email || 'Sistem'}
                              </p>
                              <p className="text-xs text-foreground/40 flex items-center gap-1">
                                <Globe className="w-3 h-3" />
                                {log.ipAddress || '—'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-primary/10 text-primary border border-primary/20">
                            <Activity className="w-3 h-3" />
                            {log.action}
                          </span>
                        </td>
                        <td className="p-4 max-w-xs">
                          <p
                            className="text-sm text-foreground/50 truncate"
                            title={log.details || ''}
                          >
                            {log.details || '—'}
                          </p>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </motion.div>
        </AnimatePresence>

        {/* ─── Footer ────────────────────────────────────────────────────── */}
        {!isLoading && (
          <div className="p-4 border-t border-glass-border bg-foreground/[0.02] flex items-center justify-between">
            <span className="text-xs text-foreground/40">
              {filteredLogs.length} / {logType === 'login' ? loginTotal : auditTotal}{' '}
              kayıt gösteriliyor
            </span>
            <Link
              href={logType === 'login' ? '/admin/login-history' : '/admin/audit-logs'}
              className="flex items-center gap-1 text-xs font-bold text-primary hover:underline"
            >
              Tüm kayıtları görüntüle
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        )}
      </div>

      {/* ─── Shimmer keyframes (injected via style tag) ──────────────────── */}
      <style jsx global>{`
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
}
