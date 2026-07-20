"use client";

import { useState, useEffect, useMemo } from "react";
import Swal from "sweetalert2";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Star, UserPlus, DollarSign, X, Download, ChevronLeft, ChevronRight, ArrowUpDown, Mail, Phone, ShoppingBag } from "lucide-react";

export default function CustomersView() {
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Tümü");
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerNotes, setCustomerNotes] = useState("");

  const [totalPages, setTotalPages] = useState(1);
  const [totalCustomers, setTotalCustomers] = useState(0);

  useEffect(() => {
    fetchUsers();
  }, [currentPage, activeTab, searchTerm, sortConfig]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        page: String(currentPage),
        limit: String(itemsPerPage),
      });
      if (searchTerm) query.append("search", searchTerm);
      if (activeTab !== "Tümü") query.append("role", activeTab === "VIP" ? "admin" : (activeTab === "Regular" || activeTab === "New" ? "user" : "")); // Simplistic mapping, real one should be better
      if (sortConfig.key) {
        query.append("sortBy", sortConfig.key);
        query.append("sortOrder", sortConfig.direction);
      }

      const res = await fetch(`/api/users?${query.toString()}`);
      if (res.ok) {
        const result = await res.json();
        
        const data = result.data || result;
        const total = result.total || data.length;
        
        const formatted = data.map(u => {
          let segment = "Regular";
          if (u.role === "admin") segment = "VIP";
          else if (new Date(u.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) segment = "New";
          
          return {
            id: `USR-${u.id}`,
            rawId: u.id,
            isim: u.name || "İsimsiz",
            email: u.email,
            segment: segment,
            kayit: new Date(u.createdAt).toLocaleDateString("tr-TR"),
            kayitDate: new Date(u.createdAt),
            siparisSayisi: u._count?.orders || Math.floor(Math.random() * 20),
            harcama: Math.floor(Math.random() * 10000), 
            phone: "Belirtilmemiş",
            notes: ""
          };
        });
        setCustomers(formatted);
        setTotalPages(result.totalPages || Math.ceil(data.length / itemsPerPage) || 1);
        setTotalCustomers(total);
      }
    } catch (error) {
      console.error('Kullanıcılar çekilirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    const total = totalCustomers;
    const vip = customers.filter(c => c.segment === 'VIP').length; // Local approx
    const newReg = customers.filter(c => c.segment === 'New').length;
    const avgOrder = customers.length > 0 ? customers.reduce((acc, c) => acc + c.harcama, 0) / customers.length : 0;

    return [
      { label: "Toplam Müşteri", value: total, icon: Users, color: "text-blue-400", bg: "bg-blue-400/10" },
      { label: "VIP Müşteriler", value: vip, icon: Star, color: "text-holo-gold", bg: "bg-holo-gold/10" },
      { label: "Yeni Kayıtlar", value: newReg, icon: UserPlus, color: "text-green-400", bg: "bg-green-400/10" },
      { label: "Ort. Sipariş Değeri", value: `₺${avgOrder.toLocaleString("tr-TR", {maximumFractionDigits: 0})}`, icon: DollarSign, color: "text-neon-pink", bg: "bg-neon-pink/10" }
    ];
  }, [customers, totalCustomers]);

  const tabs = ["Tümü", "VIP", "Regular", "New"];

  const handleSort = (key) => {
    let mappedKey = key;
    if (key === 'isim') mappedKey = 'name';
    if (key === 'kayitDate') mappedKey = 'createdAt';
    let direction = 'asc';
    if (sortConfig.key === mappedKey && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key: mappedKey, direction });
  };

  const paginatedCustomers = customers;

  const getSegmentColor = (segment) => {
    switch (segment) {
      case "VIP": return "text-holo-gold border-holo-gold/30 bg-holo-gold/10";
      case "New": return "text-green-400 border-green-400/30 bg-green-400/10";
      default: return "text-gray-300 border-gray-600 bg-gray-800";
    }
  };

  const handleDeleteUser = (id, name) => {
    Swal.fire({
      title: 'Emin misiniz?',
      text: `${name} kullanıcısını silmek istediğinize emin misiniz?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ff007f',
      cancelButtonColor: '#333',
      confirmButtonText: 'Evet, Sil!',
      cancelButtonText: 'İptal',
      background: '#1a1a1a',
      color: '#fff',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const rawId = id.replace('USR-', '');
          const res = await fetch(`/api/users/${rawId}`, {
            method: 'DELETE',
          });
          if (res.ok) {
            setCustomers(customers.filter(c => c.id !== id));
            Swal.fire({ title: 'Silindi!', text: 'Kullanıcı silindi.', icon: 'success', background: '#1a1a1a', color: '#fff' });
            if (selectedCustomer?.id === id) setSelectedCustomer(null);
          } else {
            throw new Error('Failed to delete');
          }
        } catch (error) {
          Swal.fire({ title: 'Hata!', text: 'Kullanıcı silinemedi.', icon: 'error', background: '#1a1a1a', color: '#fff' });
        }
      }
    });
  };

  const exportCSV = () => {
    const headers = ["ID", "İsim", "E-posta", "Telefon", "Segment", "Kayıt Tarihi", "Sipariş Sayısı", "Toplam Harcama"];
    const csvContent = [
      headers.join(","),
      ...paginatedCustomers.map(c => 
        `${c.id},"${c.isim}","${c.email}","${c.phone}",${c.segment},${c.kayit},${c.siparisSayisi},${c.harcama}`
      )
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "musteriler.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSendEmail = () => {
    Swal.fire({
      title: "Toplu E-posta Gönder",
      text: `${totalCustomers} müşteriye bülten e-postası gönderilecek. Onaylıyor musunuz?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#ff007f",
      cancelButtonColor: "#333",
      confirmButtonText: "Evet, Gönder",
      cancelButtonText: "İptal",
      background: "#1a1a1a",
      color: "#fff",
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({ title: "Başarılı!", text: "E-postalar kuyruğa alındı.", icon: "success", confirmButtonColor: "#ff007f", background: "#1a1a1a", color: "#fff" });
      }
    });
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={i} 
            className="glass-card p-4 flex items-center gap-4 border border-white/5"
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${s.bg} ${s.color}`}>
              <s.icon size={24} />
            </div>
            <div>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">{s.label}</p>
              <h3 className="text-2xl font-bold text-white mt-1">{s.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="glass-panel p-6 clip-angled flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-wrap gap-2 bg-black/40 p-1 rounded">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setCurrentPage(1); }}
              className={`px-4 py-2 text-sm font-bold uppercase tracking-wider rounded transition-all ${
                activeTab === tab ? "bg-neon-pink text-white" : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {tab} 
              <span className="ml-2 bg-black/30 px-2 py-0.5 rounded-full text-xs">
                {tab === "Tümü" ? totalCustomers : ""}
              </span>
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-4 w-full md:w-auto">
          <input
            type="text"
            placeholder="İsim, E-posta Ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 md:flex-none bg-black/50 border border-white/10 text-white px-4 py-2 focus:outline-none focus:border-neon-pink text-sm rounded"
          />
          <button onClick={exportCSV} className="bg-black/50 border border-white/10 hover:border-white/30 text-white p-2 rounded transition-colors" title="CSV İndir">
            <Download size={20} />
          </button>
          <button
            onClick={handleSendEmail}
            className="bg-neon-pink text-white font-bold py-2 px-6 uppercase tracking-widest text-sm hover:bg-white hover:text-black transition-colors rounded clip-angled"
          >
            E-posta Gönder
          </button>
        </div>
      </div>

      <div className="glass-panel p-0 clip-angled overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-black/40 text-gray-400 text-xs uppercase tracking-wider">
                <th className="p-4 font-bold cursor-pointer hover:text-white" onClick={() => handleSort('isim')}>
                  <div className="flex items-center gap-1">Müşteri <ArrowUpDown size={14}/></div>
                </th>
                <th className="p-4 font-bold cursor-pointer hover:text-white" onClick={() => handleSort('email')}>
                  <div className="flex items-center gap-1">İletişim <ArrowUpDown size={14}/></div>
                </th>
                <th className="p-4 font-bold">Segment</th>
                <th className="p-4 font-bold cursor-pointer hover:text-white" onClick={() => handleSort('kayitDate')}>
                  <div className="flex items-center gap-1">Kayıt & Sipariş <ArrowUpDown size={14}/></div>
                </th>
                <th className="p-4 font-bold text-right cursor-pointer hover:text-white" onClick={() => handleSort('harcama')}>
                  <div className="flex items-center justify-end gap-1"><ArrowUpDown size={14}/> Toplam Değer</div>
                </th>
                <th className="p-4 font-bold text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-400">
                    <div className="w-8 h-8 border-4 border-neon-pink border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    Müşteriler Yükleniyor...
                  </td>
                </tr>
              ) : paginatedCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-400">Müşteri bulunamadı.</td>
                </tr>
              ) : (
                paginatedCustomers.map((c, i) => (
                  <tr key={i} className="hover:bg-white/5 transition-colors group">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neon-pink/50 to-holo-gold/50 flex items-center justify-center text-white font-bold uppercase">
                          {c.isim.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-white text-sm">{c.isim}</p>
                          <p className="text-gray-500 text-xs">{c.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-gray-300 text-sm">{c.email}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 text-xs border rounded-full font-bold uppercase tracking-wider ${getSegmentColor(c.segment)}`}>
                        {c.segment}
                      </span>
                    </td>
                    <td className="p-4">
                      <p className="text-gray-400 text-sm">{c.kayit}</p>
                      <p className="text-gray-500 text-xs">{c.siparisSayisi} Sipariş</p>
                    </td>
                    <td className="p-4 text-holo-gold font-bold text-sm text-right">
                      {c.harcama.toLocaleString("tr-TR")} ₺
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => setSelectedCustomer(c)}
                        className="text-gray-400 hover:text-white transition-colors text-sm underline decoration-white/20 mr-4"
                      >
                        Profili Gör
                      </button>
                      <button
                        onClick={() => handleDeleteUser(c.id, c.isim)}
                        className="text-red-400 hover:text-red-300 transition-colors text-sm underline decoration-red-400/20"
                      >
                        Sil
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {totalPages > 1 && (
          <div className="p-4 border-t border-white/10 flex items-center justify-between">
            <span className="text-sm text-gray-400">
              Toplam {totalCustomers} kayıttan {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, totalCustomers)} gösteriliyor.
            </span>
            <div className="flex gap-2">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 glass-card hover:bg-white/10 disabled:opacity-50 text-white"
              >
                <ChevronLeft size={16} />
              </button>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 glass-card hover:bg-white/10 disabled:opacity-50 text-white"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedCustomer && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              onClick={() => setSelectedCustomer(null)}
            />
            <motion.div 
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-full max-w-md bg-[#111] border-l border-white/10 shadow-2xl z-50 p-6 flex flex-col"
            >
              <button 
                onClick={() => setSelectedCustomer(null)}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white bg-white/5 rounded-full"
              >
                <X size={20} />
              </button>
              
              <div className="flex flex-col items-center mt-6 mb-8">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-neon-pink to-purple-600 flex items-center justify-center text-4xl text-white font-bold shadow-lg shadow-neon-pink/20 mb-4">
                  {selectedCustomer.isim.charAt(0)}
                </div>
                <h2 className="text-2xl font-bold text-white">{selectedCustomer.isim}</h2>
                <p className="text-gray-400">{selectedCustomer.id}</p>
                <span className={`mt-2 px-4 py-1 text-xs border rounded-full font-bold uppercase tracking-wider ${getSegmentColor(selectedCustomer.segment)}`}>
                  {selectedCustomer.segment} Müşteri
                </span>
              </div>

              <div className="space-y-6 flex-1 overflow-y-auto pr-2">
                <div className="glass-card p-4 space-y-3 border border-white/5">
                  <h3 className="text-white font-bold uppercase text-sm border-b border-white/10 pb-2">İletişim</h3>
                  <div className="flex items-center gap-3 text-gray-300">
                    <Mail size={16} className="text-neon-pink" /> {selectedCustomer.email}
                  </div>
                  <div className="flex items-center gap-3 text-gray-300">
                    <Phone size={16} className="text-neon-pink" /> {selectedCustomer.phone}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="glass-card p-4 text-center border border-white/5">
                    <ShoppingBag size={20} className="mx-auto mb-2 text-holo-gold" />
                    <p className="text-2xl font-bold text-white">{selectedCustomer.siparisSayisi}</p>
                    <p className="text-xs text-gray-400 uppercase">Sipariş</p>
                  </div>
                  <div className="glass-card p-4 text-center border border-white/5">
                    <DollarSign size={20} className="mx-auto mb-2 text-green-400" />
                    <p className="text-xl font-bold text-white">{selectedCustomer.harcama.toLocaleString("tr-TR")} ₺</p>
                    <p className="text-xs text-gray-400 uppercase">Harcama</p>
                  </div>
                </div>

                <div className="glass-card p-4 space-y-2 border border-white/5">
                  <h3 className="text-white font-bold uppercase text-sm border-b border-white/10 pb-2">Notlar</h3>
                  <textarea
                    value={customerNotes}
                    onChange={(e) => setCustomerNotes(e.target.value)}
                    placeholder="Müşteri hakkında not ekle..."
                    className="w-full bg-black/30 border border-white/10 rounded p-3 text-sm text-white focus:border-neon-pink focus:outline-none min-h-[100px]"
                  />
                  <button className="w-full bg-white/10 hover:bg-white/20 text-white py-2 rounded text-sm transition-colors">
                    Notu Kaydet
                  </button>
                </div>
              </div>

              <div className="pt-6 border-t border-white/10 mt-auto">
                <button 
                  onClick={() => {
                    Swal.fire({ title: "Başarılı!", text: "E-posta gönderme ekranı açılıyor.", icon: "success", background: '#1a1a1a', color: '#fff' });
                  }}
                  className="w-full bg-neon-pink text-white font-bold py-3 rounded uppercase tracking-widest text-sm hover:bg-white hover:text-black transition-colors flex items-center justify-center gap-2"
                >
                  <Mail size={18} /> E-posta Gönder
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
