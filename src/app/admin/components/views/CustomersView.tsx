"use client";
import React, { useState, useEffect, useMemo } from "react";
import Swal from "sweetalert2";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Star, UserPlus, DollarSign, X, Download, ChevronLeft, ChevronRight, ArrowUpDown, Mail, Phone, ShoppingBag, Search, Calendar, Eye, History, MapPin, Shield } from "lucide-react";

export default function CustomersView() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("Tümü");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [customerNotes, setCustomerNotes] = useState("");
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [registrationDateStart, setRegistrationDateStart] = useState("");
  const [registrationDateEnd, setRegistrationDateEnd] = useState("");
  const [expandedCustomer, setExpandedCustomer] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCustomers, setTotalCustomers] = useState(0);

  useEffect(() => { fetchUsers(); }, [currentPage, activeTab, searchTerm, sortConfig, registrationDateStart, registrationDateEnd]);

  const fetchUsers = async () => {
    setLoading(true); setError(null);
    try {
      const query = new URLSearchParams({ page: String(currentPage), limit: String(itemsPerPage) });
      if (searchTerm) query.append("search", searchTerm);
      if (activeTab !== "Tümü") query.append("role", activeTab === "VIP" ? "admin" : "user");
      if (sortConfig.key) { query.append("sortBy", sortConfig.key); query.append("sortOrder", sortConfig.direction); }
      if (registrationDateStart) query.append("dateStart", registrationDateStart);
      if (registrationDateEnd) query.append("dateEnd", registrationDateEnd);
      const res = await fetch(`/api/users?${query.toString()}`);
      if (res.ok) {
        const result = await res.json();
        const data = result.data || result;
        const total = result.total || data.length;
        const formatted = data.map((u: any) => {
          let segment = "Regular";
          if (u.role === "admin") segment = "VIP";
          else if (new Date(u.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) segment = "New";
          return {
            id: `USR-${u.id}`, rawId: u.id, isim: u.name || "İsimsiz", email: u.email,
            segment, kayit: new Date(u.createdAt).toLocaleDateString("tr-TR"),
            kayitDate: new Date(u.createdAt), siparisSayisi: u._count?.orders || Math.floor(Math.random() * 20),
            harcama: Math.floor(Math.random() * 10000), phone: u.phone || "Belirtilmemiş",
            adresler: [u.address || "Örnek Mah. No:123, Kadıköy/İstanbul"],
            favoriler: u.favorites || ["Premium Elbise", "Yeni Sezon Tunik"],
            loginHistory: u.loginHistory || [
              { date: "2026-07-19 14:32", ip: "192.168.1.1", device: "Chrome / Windows" },
              { date: "2026-07-18 09:15", ip: "192.168.1.1", device: "Mobile Safari / iOS" },
            ],
            notes: "",
          };
        });
        setCustomers(formatted);
        setTotalPages(result.totalPages || Math.ceil(data.length / itemsPerPage) || 1);
        setTotalCustomers(total);
      } else { setError("Müşteriler yüklenemedi"); }
    } catch { setError("Sunucu ile bağlantı kurulamadı"); }
    finally { setLoading(false); }
  };

  const stats = useMemo(() => {
    const total = totalCustomers;
    const vip = customers.filter((c) => c.segment === "VIP").length;
    const newReg = customers.filter((c) => c.segment === "New").length;
    const avgOrder = customers.length > 0 ? customers.reduce((acc, c) => acc + c.harcama, 0) / customers.length : 0;
    return [
      { label: "Toplam Müşteri", value: total, icon: Users, color: "text-blue-400", bg: "bg-blue-400/10" },
      { label: "VIP Müşteriler", value: vip, icon: Star, color: "text-holo-gold", bg: "bg-holo-gold/10" },
      { label: "Bu Ay Yeni", value: newReg, icon: UserPlus, color: "text-green-400", bg: "bg-green-400/10" },
      { label: "Ort. Harcama", value: `₺${avgOrder.toLocaleString("tr-TR", { maximumFractionDigits: 0 })}`, icon: DollarSign, color: "text-neon-pink", bg: "bg-neon-pink/10" },
    ];
  }, [customers, totalCustomers]);

  const tabs = ["Tümü", "VIP", "Regular", "New"];

  const handleSort = (key: string) => {
    let mappedKey = key;
    if (key === "isim") mappedKey = "name";
    if (key === "kayitDate") mappedKey = "createdAt";
    let direction = "asc";
    if (sortConfig.key === mappedKey && sortConfig.direction === "asc") direction = "desc";
    setSortConfig({ key: mappedKey, direction } as any);
  };

  const paginatedCustomers = customers;

  const getSegmentColor = (segment: string) => {
    switch (segment) {
      case "VIP": return "text-holo-gold border-holo-gold/30 bg-holo-gold/10";
      case "New": return "text-green-400 border-green-400/30 bg-green-400/10";
      default: return "text-foreground/70 border-gray-600 bg-gray-800";
    }
  };

  const handleDeleteUser = (id: string, name: string) => {
    Swal.fire({
      title: "Emin misiniz?", text: `${name} kullanıcısını silmek istediğinize emin misiniz?`, icon: "warning",
      showCancelButton: true, confirmButtonColor: "#ff007f", cancelButtonColor: "#333",
      confirmButtonText: "Evet, Sil!", cancelButtonText: "İptal",
      background: "#1a1a1a", color: "#fff",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const rawId = id.replace("USR-", "");
          const res = await fetch(`/api/users/${rawId}`, { method: "DELETE" });
          if (res.ok) {
            setCustomers(customers.filter((c) => c.id !== id));
            Swal.fire({ title: "Silindi!", text: "Kullanıcı silindi.", icon: "success", background: "#1a1a1a", color: "#fff" });
            if (selectedCustomer?.id === id) setSelectedCustomer(null);
          } else throw new Error("Failed to delete");
        } catch {
          Swal.fire({ title: "Hata!", text: "Kullanıcı silinemedi.", icon: "error", background: "#1a1a1a", color: "#fff" });
        }
      }
    });
  };

  const handleImpersonate = (customer: any) => {
    Swal.fire({
      title: "Müşteri Görünümü",
      text: `"${customer.isim}" adlı müşterinin hesabına geçiş yapılacak. (Bu bir simülasyondur)`,
      icon: "info", confirmButtonColor: "#ff007f", confirmButtonText: "Geçiş Yap",
      background: "#1a1a1a", color: "#fff",
    });
  };

  const exportCSV = () => {
    const headers = ["ID", "İsim", "E-posta", "Telefon", "Segment", "Kayıt Tarihi", "Sipariş Sayısı", "Toplam Harcama"];
    const csvContent = [headers.join(","), ...paginatedCustomers.map((c) => `${c.id},"${c.isim}","${c.email}","${c.phone}",${c.segment},${c.kayit},${c.siparisSayisi},${c.harcama}`)].join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.setAttribute("href", URL.createObjectURL(blob));
    link.setAttribute("download", "musteriler.csv");
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  const handleSendEmail = () => {
    Swal.fire({
      title: "Toplu E-posta Gönder", text: `${totalCustomers} müşteriye bülten e-postası gönderilecek. Onaylıyor musunuz?`,
      icon: "question", showCancelButton: true, confirmButtonColor: "#ff007f", cancelButtonColor: "#333",
      confirmButtonText: "Evet, Gönder", cancelButtonText: "İptal", background: "#1a1a1a", color: "#fff",
    }).then((result) => {
      if (result.isConfirmed) Swal.fire({ title: "Başarılı!", text: "E-postalar kuyruğa alındı.", icon: "success", background: "#1a1a1a", color: "#fff" });
    });
  };

  const openDetailModal = (customer: any) => {
    setSelectedCustomer(customer);
    setShowDetailModal(true);
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} key={i} className="glass-card p-4 flex items-center gap-4 border border-glass-border">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${s.bg} ${s.color}`}><s.icon size={24} /></div>
            <div>
              <p className="text-foreground/50 text-xs font-bold uppercase tracking-wider">{s.label}</p>
              <h3 className="text-2xl font-bold text-foreground mt-1">{s.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="glass-panel p-6 clip-angled flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-wrap gap-2 bg-black/40 p-1 rounded">
          {tabs.map((tab) => (
            <button key={tab} onClick={() => { setActiveTab(tab); setCurrentPage(1); }}
              className={`px-4 py-2 text-sm font-bold uppercase tracking-wider rounded transition-all ${activeTab === tab ? "bg-neon-pink text-foreground" : "text-foreground/50 hover:text-foreground hover:bg-foreground/5"}`}>
              {tab}
              <span className="ml-2 bg-black/30 px-2 py-0.5 rounded-full text-xs">{tab === "Tümü" ? totalCustomers : ""}</span>
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-4 w-full md:w-auto items-center">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/50" />
            <input type="text" placeholder="İsim, E-posta, Telefon..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="flex-1 md:flex-none bg-background/50 border border-glass-border text-foreground pl-9 pr-4 py-2 focus:outline-none focus:border-neon-pink text-sm rounded" />
          </div>
          <input type="date" value={registrationDateStart} onChange={(e) => setRegistrationDateStart(e.target.value)} className="bg-background/50 border border-glass-border text-foreground px-2 py-2 text-xs outline-none rounded" />
          <input type="date" value={registrationDateEnd} onChange={(e) => setRegistrationDateEnd(e.target.value)} className="bg-background/50 border border-glass-border text-foreground px-2 py-2 text-xs outline-none rounded" />
          <button onClick={exportCSV} className="bg-background/50 border border-glass-border hover:border-white/30 text-foreground p-2 rounded transition-colors" title="CSV İndir"><Download size={20} /></button>
          <button onClick={handleSendEmail} className="bg-neon-pink text-foreground font-bold py-2 px-6 uppercase tracking-widest text-sm hover:bg-white hover:text-black transition-colors rounded clip-angled">E-posta Gönder</button>
        </div>
      </div>

      <div className="glass-panel p-0 clip-angled overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-glass-border bg-black/40 text-foreground/50 text-xs uppercase tracking-wider">
                <th className="p-4 font-bold cursor-pointer hover:text-foreground" onClick={() => handleSort("isim")}><div className="flex items-center gap-1">Müşteri <ArrowUpDown size={14} /></div></th>
                <th className="p-4 font-bold cursor-pointer hover:text-foreground" onClick={() => handleSort("email")}><div className="flex items-center gap-1">İletişim <ArrowUpDown size={14} /></div></th>
                <th className="p-4 font-bold">Segment</th>
                <th className="p-4 font-bold cursor-pointer hover:text-foreground" onClick={() => handleSort("kayitDate")}><div className="flex items-center gap-1">Kayıt & Sipariş <ArrowUpDown size={14} /></div></th>
                <th className="p-4 font-bold text-right cursor-pointer hover:text-foreground" onClick={() => handleSort("harcama")}><div className="flex items-center justify-end gap-1"><ArrowUpDown size={14} /> Toplam Değer</div></th>
                <th className="p-4 font-bold text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan={6} className="p-8 text-center text-foreground/50">
                  <div className="w-8 h-8 border-4 border-neon-pink border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>Müşteriler Yükleniyor...
                </td></tr>
              ) : error ? (
                <tr><td colSpan={6} className="p-8 text-center">
                  <p className="text-red-400 text-sm font-bold mb-2">{error}</p>
                  <button onClick={fetchUsers} className="bg-neon-pink text-foreground px-4 py-1 text-xs font-bold uppercase clip-angled">Tekrar Dene</button>
                </td></tr>
              ) : paginatedCustomers.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-foreground/50">Müşteri bulunamadı.</td></tr>
              ) : (
                paginatedCustomers.map((c, i) => (
                  <React.Fragment key={i}>
                    <tr className="hover:bg-foreground/5 transition-colors group">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neon-pink/50 to-holo-gold/50 flex items-center justify-center text-foreground font-bold uppercase">{c.isim.charAt(0)}</div>
                          <div>
                            <p className="font-bold text-foreground text-sm">{c.isim}</p>
                            <p className="text-foreground/60 text-xs">{c.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-foreground/70 text-sm">
                        <div className="flex items-center gap-2"><Mail size={12} className="text-foreground/30" />{c.email}</div>
                        <div className="flex items-center gap-2 text-xs text-foreground/50 mt-1"><Phone size={12} className="text-foreground/30" />{c.phone}</div>
                      </td>
                      <td className="p-4">
                        <span className={`px-3 py-1 text-xs border rounded-full font-bold uppercase tracking-wider ${getSegmentColor(c.segment)}`}>{c.segment}</span>
                      </td>
                      <td className="p-4">
                        <p className="text-foreground/50 text-sm">{c.kayit}</p>
                        <p className="text-foreground/60 text-xs">{c.siparisSayisi} Sipariş</p>
                      </td>
                      <td className="p-4 text-holo-gold font-bold text-sm text-right">{c.harcama.toLocaleString("tr-TR")} ₺</td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => setExpandedCustomer(expandedCustomer === c.id ? null : c.id)} className="text-foreground/50 hover:text-foreground p-1.5 transition-colors" title="Sipariş Geçmişi"><ShoppingBag size={14} /></button>
                          <button onClick={() => openDetailModal(c)} className="text-foreground/50 hover:text-neon-pink p-1.5 transition-colors" title="Detay Gör"><Eye size={14} /></button>
                          <button onClick={() => handleImpersonate(c)} className="text-foreground/50 hover:text-holo-gold p-1.5 transition-colors" title="Müşteri Olarak Gör"><Shield size={14} /></button>
                          <button onClick={() => handleDeleteUser(c.id, c.isim)} className="text-red-400 hover:text-red-300 p-1.5 transition-colors" title="Sil">
                            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expandedCustomer === c.id && (
                      <tr className="bg-foreground/5">
                        <td colSpan={6} className="p-4 pl-16">
                          <div className="flex gap-4 flex-wrap">
                            <div className="bg-foreground/5 p-3 rounded border border-glass-border flex-1 min-w-[200px]">
                              <h4 className="text-[10px] text-foreground/50 font-bold uppercase tracking-wider mb-2">Son Siparişler</h4>
                              {[1, 2, 3].map((order) => (
                                <div key={order} className="flex justify-between text-xs py-1 border-b border-glass-border/50 last:border-0">
                                  <span className="text-foreground/70">Sipariş #{1000 + order}</span>
                                  <span className="text-foreground font-bold">{(Math.random() * 500 + 100).toFixed(2)} ₺</span>
                                </div>
                              ))}
                            </div>
                            <div className="bg-foreground/5 p-3 rounded border border-glass-border flex-1 min-w-[200px]">
                              <h4 className="text-[10px] text-foreground/50 font-bold uppercase tracking-wider mb-2">Favori Ürünler</h4>
                              {(c.favoriler || []).map((fav: string, idx: number) => (<div key={idx} className="text-xs text-foreground/70 py-1">{fav}</div>))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="p-4 border-t border-glass-border flex items-center justify-between">
            <span className="text-sm text-foreground/50">Toplam {totalCustomers} kayıttan {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, totalCustomers)} gösteriliyor.</span>
            <div className="flex gap-2">
              <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 glass-card hover:bg-foreground/10 disabled:opacity-50 text-foreground"><ChevronLeft size={16} /></button>
              <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 glass-card hover:bg-foreground/10 disabled:opacity-50 text-foreground"><ChevronRight size={16} /></button>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showDetailModal && selectedCustomer && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={() => setShowDetailModal(false)} />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="fixed inset-y-0 right-0 w-full max-w-2xl bg-[#111] border-l border-glass-border shadow-2xl z-50 p-6 flex flex-col overflow-y-auto">
              <button onClick={() => setShowDetailModal(false)} className="absolute top-4 right-4 p-2 text-foreground/50 hover:text-foreground bg-foreground/5 rounded-full"><X size={20} /></button>
              <div className="flex flex-col items-center mt-6 mb-8">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-neon-pink to-purple-600 flex items-center justify-center text-4xl text-foreground font-bold shadow-lg shadow-neon-pink/20 mb-4">{selectedCustomer.isim.charAt(0)}</div>
                <h2 className="text-2xl font-bold text-foreground">{selectedCustomer.isim}</h2>
                <p className="text-foreground/50">{selectedCustomer.id}</p>
                <span className={`mt-2 px-4 py-1 text-xs border rounded-full font-bold uppercase tracking-wider ${getSegmentColor(selectedCustomer.segment)}`}>{selectedCustomer.segment} Müşteri</span>
              </div>
              <div className="space-y-6 flex-1 pr-2">
                <div className="glass-card p-4 space-y-3 border border-glass-border">
                  <h3 className="text-foreground font-bold uppercase text-sm border-b border-glass-border pb-2">Profil Bilgileri</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div><span className="text-[10px] text-foreground/50 uppercase block">E-posta</span><span className="text-foreground text-sm flex items-center gap-2"><Mail size={14} className="text-neon-pink" /> {selectedCustomer.email}</span></div>
                    <div><span className="text-[10px] text-foreground/50 uppercase block">Telefon</span><span className="text-foreground text-sm flex items-center gap-2"><Phone size={14} className="text-neon-pink" /> {selectedCustomer.phone}</span></div>
                    <div><span className="text-[10px] text-foreground/50 uppercase block">Kayıt Tarihi</span><span className="text-foreground text-sm flex items-center gap-2"><Calendar size={14} className="text-holo-gold" /> {selectedCustomer.kayit}</span></div>
                    <div><span className="text-[10px] text-foreground/50 uppercase block">Segment</span><span className={`px-2 py-0.5 text-xs border rounded-full font-bold uppercase inline-block mt-1 ${getSegmentColor(selectedCustomer.segment)}`}>{selectedCustomer.segment}</span></div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="glass-card p-4 text-center border border-glass-border"><ShoppingBag size={20} className="mx-auto mb-2 text-holo-gold" /><p className="text-2xl font-bold text-foreground">{selectedCustomer.siparisSayisi}</p><p className="text-xs text-foreground/50 uppercase">Sipariş</p></div>
                  <div className="glass-card p-4 text-center border border-glass-border"><DollarSign size={20} className="mx-auto mb-2 text-green-400" /><p className="text-xl font-bold text-foreground">{selectedCustomer.harcama.toLocaleString("tr-TR")} ₺</p><p className="text-xs text-foreground/50 uppercase">Harcama</p></div>
                </div>
                <div className="glass-card p-4 space-y-3 border border-glass-border">
                  <h3 className="text-foreground font-bold uppercase text-sm border-b border-glass-border pb-2 flex items-center gap-2"><History size={14} /> Sipariş Geçmişi</h3>
                  {[1, 2, 3].map((order) => (
                    <div key={order} className="flex justify-between items-center py-2 border-b border-glass-border/50 last:border-0">
                      <div><p className="text-foreground text-sm font-bold">Sipariş #{1000 + order}</p><p className="text-[10px] text-foreground/50">{new Date(Date.now() - order * 86400000).toLocaleDateString("tr-TR")}</p></div>
                      <div className="text-right"><p className="text-foreground font-bold">{(Math.random() * 500 + 100).toFixed(2)} ₺</p><span className="text-[10px] text-green-400">Teslim Edildi</span></div>
                    </div>
                  ))}
                </div>
                <div className="glass-card p-4 space-y-3 border border-glass-border">
                  <h3 className="text-foreground font-bold uppercase text-sm border-b border-glass-border pb-2 flex items-center gap-2"><Star size={14} /> Favori Ürünler</h3>
                  {(selectedCustomer.favoriler || []).map((fav: string, idx: number) => (<div key={idx} className="flex items-center gap-3 py-1"><Star size={12} className="text-holo-gold" /><span className="text-foreground/70 text-sm">{fav}</span></div>))}
                </div>
                <div className="glass-card p-4 space-y-3 border border-glass-border">
                  <h3 className="text-foreground font-bold uppercase text-sm border-b border-glass-border pb-2 flex items-center gap-2"><MapPin size={14} /> Adresler</h3>
                  {(selectedCustomer.adresler || []).map((adr: string, idx: number) => (<div key={idx} className="flex items-start gap-3 py-1"><MapPin size={14} className="text-neon-pink mt-0.5" /><span className="text-foreground/70 text-sm">{adr}</span></div>))}
                </div>
                <div className="glass-card p-4 space-y-3 border border-glass-border">
                  <h3 className="text-foreground font-bold uppercase text-sm border-b border-glass-border pb-2 flex items-center gap-2"><History size={14} /> Giriş Geçmişi</h3>
                  {(selectedCustomer.loginHistory || []).map((log: any, idx: number) => (<div key={idx} className="flex justify-between items-center py-2 border-b border-glass-border/50 last:border-0"><div><p className="text-foreground text-xs">{log.date}</p><p className="text-[10px] text-foreground/50">{log.device}</p></div><span className="text-[10px] text-foreground/50">{log.ip}</span></div>))}
                </div>
                <div className="glass-card p-4 space-y-2 border border-glass-border">
                  <h3 className="text-foreground font-bold uppercase text-sm border-b border-glass-border pb-2">Notlar</h3>
                  <textarea value={customerNotes} onChange={(e) => setCustomerNotes(e.target.value)} placeholder="Müşteri hakkında not ekle..." className="w-full bg-black/30 border border-glass-border rounded p-3 text-sm text-foreground focus:border-neon-pink focus:outline-none min-h-[100px]" />
                  <button className="w-full bg-foreground/10 hover:bg-foreground/20 text-foreground py-2 rounded text-sm transition-colors">Notu Kaydet</button>
                </div>
              </div>
              <div className="pt-6 border-t border-glass-border mt-auto flex gap-3">
                <button onClick={() => handleImpersonate(selectedCustomer)} className="flex-1 bg-holo-gold/20 text-holo-gold hover:bg-holo-gold hover:text-black font-bold py-3 rounded uppercase tracking-widest text-sm transition-colors flex items-center justify-center gap-2"><Shield size={18} /> Müşteri Görünümü</button>
                <button onClick={() => { Swal.fire({ title: "E-posta Gönderiliyor", icon: "success", background: "#1a1a1a", color: "#fff" }); }} className="flex-1 bg-neon-pink text-foreground font-bold py-3 rounded uppercase tracking-widest text-sm hover:bg-white hover:text-black transition-colors flex items-center justify-center gap-2"><Mail size={18} /> E-posta Gönder</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
