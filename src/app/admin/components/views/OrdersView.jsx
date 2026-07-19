import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import Image from "next/image";

export default function OrdersView() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Tabs & Filters
  const [activeTab, setActiveTab] = useState("Tümü");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [paymentFilter, setPaymentFilter] = useState("Tümü");

  // Selection & Modal
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedOrdersIds, setSelectedOrdersIds] = useState([]);
  const [bulkStatus, setBulkStatus] = useState("");
  const [sendNotification, setSendNotification] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const orderStatuses = ["Beklemede", "Onaylandı", "Hazırlanıyor", "Kargolandı", "Teslim Edildi", "İptal"];

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/orders");
      if (res.ok) {
        const data = await res.json();
        const mappedOrders = data.map((o) => ({
          id: o.id.toString(),
          musteri: o.customer || "Bilinmiyor",
          tarih: new Date(o.createdAt).toLocaleDateString("tr-TR"),
          tarihRaw: new Date(o.createdAt),
          tutar: `${o.total} ₺`,
          durum: o.status === "Bekliyor" ? "Beklemede" : o.status, // normalise
          odeme: o.paymentStatus || "Ödendi", // Mock payment status if not present
          ...getStatusStyles(o.status === "Bekliyor" ? "Beklemede" : o.status)
        }));
        setOrders(mappedOrders);
      } else {
        // Mock data fallback if API is not fully set up
        setOrders(getMockOrders());
      }
    } catch (err) {
      console.error(err);
      setOrders(getMockOrders());
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyles = (status) => {
    switch (status) {
      case "Beklemede": return { renk: "text-orange-400", border: "border-orange-400/30", bg: "bg-orange-400/10" };
      case "Onaylandı": return { renk: "text-blue-400", border: "border-blue-400/30", bg: "bg-blue-400/10" };
      case "Hazırlanıyor": return { renk: "text-holo-gold", border: "border-holo-gold/30", bg: "bg-holo-gold/10" };
      case "Kargolandı": return { renk: "text-purple-400", border: "border-purple-400/30", bg: "bg-purple-400/10" };
      case "Teslim Edildi": return { renk: "text-green-500", border: "border-green-500/30", bg: "bg-green-500/10" };
      case "İptal": return { renk: "text-red-500", border: "border-red-500/30", bg: "bg-red-500/10" };
      default: return { renk: "text-gray-400", border: "border-gray-400/30", bg: "bg-gray-400/10" };
    }
  };

  const getMockOrders = () => {
    return Array.from({ length: 25 }).map((_, i) => {
      const st = orderStatuses[Math.floor(Math.random() * orderStatuses.length)];
      return {
        id: `SIP-${1000 + i}`,
        musteri: `Müşteri ${i}`,
        tarih: new Date(Date.now() - i * 86400000).toLocaleDateString("tr-TR"),
        tarihRaw: new Date(Date.now() - i * 86400000),
        tutar: `${(Math.random() * 2000 + 100).toFixed(2)} ₺`,
        durum: st,
        odeme: Math.random() > 0.2 ? "Ödendi" : "Bekliyor",
        ...getStatusStyles(st)
      };
    });
  };

  const handleStatusChange = async (id, newStatus, showMessage = true) => {
    const result = await Swal.fire({
      title: 'Emin misiniz?',
      text: `Sipariş durumu "${newStatus}" olarak güncellenecek.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Evet, Güncelle',
      cancelButtonText: 'İptal',
      confirmButtonColor: 'var(--primary)'
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`/api/orders/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        });
        
        // Mock UI update anyway
        setOrders(prev => prev.map(o => o.id === id ? { ...o, durum: newStatus, ...getStatusStyles(newStatus) } : o));
        
        if (selectedOrder && selectedOrder.id === id) {
          setSelectedOrder(prev => ({ ...prev, durum: newStatus, ...getStatusStyles(newStatus) }));
        }

        if (showMessage) Swal.fire("Başarılı", "Sipariş durumu güncellendi", "success");
      } catch (err) {
        Swal.fire("Hata", "Güncelleme başarısız", "error");
      }
    }
  };

  const handleBulkStatusUpdate = async () => {
    if (!bulkStatus || selectedOrdersIds.length === 0) return;

    const result = await Swal.fire({
      title: 'Toplu Güncelleme',
      text: `${selectedOrdersIds.length} sipariş "${bulkStatus}" olarak güncellenecek.${sendNotification ? ' Müşterilere bildirim gönderilecek.' : ''}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Evet, Uygula',
      cancelButtonText: 'İptal',
      confirmButtonColor: 'var(--primary)'
    });

    if (result.isConfirmed) {
      setOrders(prev => prev.map(o => selectedOrdersIds.includes(o.id) ? { ...o, durum: bulkStatus, ...getStatusStyles(bulkStatus) } : o));
      Swal.fire("Başarılı", "Seçili siparişler güncellendi", "success");
      setSelectedOrdersIds([]);
      setBulkStatus("");
    }
  };

  // Filtering
  const filteredOrders = orders.filter((o) => {
    const matchesTab = activeTab === "Tümü" || o.durum === activeTab;
    const matchesSearch = o.id.toLowerCase().includes(searchTerm.toLowerCase()) || o.musteri.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPayment = paymentFilter === "Tümü" || o.odeme === paymentFilter;
    
    let matchesDate = true;
    if (dateRange.start) {
      matchesDate = matchesDate && o.tarihRaw >= new Date(dateRange.start);
    }
    if (dateRange.end) {
      const endD = new Date(dateRange.end);
      endD.setHours(23, 59, 59, 999);
      matchesDate = matchesDate && o.tarihRaw <= endD;
    }

    return matchesTab && matchesSearch && matchesPayment && matchesDate;
  });

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleExport = () => {
    const dataToExport = filteredOrders.map(o => `"${o.id}","${o.musteri}","${o.tarih}","${o.tutar}","${o.durum}","${o.odeme}"`);
    const csv = ["Sipariş No,Müşteri,Tarih,Tutar,Durum,Ödeme Durumu", ...dataToExport].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `siparisler_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) setSelectedOrdersIds(paginatedOrders.map(o => o.id));
    else setSelectedOrdersIds([]);
  };

  const toggleSelectOrder = (id) => {
    setSelectedOrdersIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  // Stats
  const stats = orderStatuses.reduce((acc, status) => {
    acc[status] = orders.filter(o => o.durum === status).length;
    return acc;
  }, {});
  stats["Tümü"] = orders.length;

  return (
    <div className="animate-fade-in flex flex-col gap-6">
      
      {/* Header & Stats */}
      <div className="glass-panel p-6 clip-angled border border-glass-border">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b border-glass-border pb-4">
          <div>
            <h2 className="text-xl font-bold text-foreground uppercase tracking-wider">
              Sipariş Yönetimi
            </h2>
            <p className="text-foreground/50 text-sm mt-1">
              Tüm siparişlerinizi ve süreçleri yönetin.
            </p>
          </div>
          <button onClick={handleExport} className="bg-primary hover:bg-secondary text-white font-bold py-2 px-6 uppercase tracking-widest text-sm transition-colors clip-angled shadow-[0_0_15px_hsla(var(--primary),0.3)] flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
            Dışa Aktar
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {["Tümü", ...orderStatuses].map(st => (
            <div key={st} onClick={() => setActiveTab(st)} className={`p-3 border rounded cursor-pointer transition-colors text-center ${activeTab === st ? 'border-primary bg-primary/10' : 'border-glass-border bg-foreground/5 hover:border-foreground/30'}`}>
              <div className="text-xl font-black mb-1">{stats[st] || 0}</div>
              <div className="text-[10px] uppercase tracking-widest text-foreground/70">{st}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters & Bulk Actions Bar */}
      <div className="glass-panel p-4 clip-angled border border-glass-border flex flex-col lg:flex-row justify-between gap-4 items-center">
        
        {/* Bulk Actions */}
        <div className="flex items-center gap-3 w-full lg:w-auto p-2 bg-foreground/5 border border-glass-border rounded">
          <input type="checkbox" onChange={handleSelectAll} checked={selectedOrdersIds.length === paginatedOrders.length && paginatedOrders.length > 0} className="accent-primary" />
          <span className="text-xs font-bold uppercase">{selectedOrdersIds.length} Seçili</span>
          <div className="h-4 w-px bg-glass-border mx-1"></div>
          <select value={bulkStatus} onChange={(e) => setBulkStatus(e.target.value)} className="bg-background border border-glass-border text-foreground text-xs px-2 py-1 outline-none">
            <option value="">Durum Seç</option>
            {orderStatuses.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <label className="flex items-center gap-1 text-[10px] uppercase cursor-pointer text-foreground/70">
            <input type="checkbox" checked={sendNotification} onChange={(e) => setSendNotification(e.target.checked)} className="accent-primary" />
            Bildirim
          </label>
          <button onClick={handleBulkStatusUpdate} disabled={!bulkStatus || selectedOrdersIds.length===0} className="bg-primary/20 text-primary hover:bg-primary hover:text-white px-3 py-1 text-xs font-bold uppercase transition-colors disabled:opacity-50">
            Uygula
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            <input type="text" placeholder="Sipariş No, Müşteri..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="bg-background border border-glass-border text-foreground pl-9 pr-4 py-1.5 focus:outline-none focus:border-primary text-sm w-48 transition-colors" />
          </div>
          
          <select value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)} className="bg-background border border-glass-border text-foreground px-3 py-1.5 text-sm outline-none">
            <option value="Tümü">Tüm Ödemeler</option>
            <option value="Ödendi">Ödendi</option>
            <option value="Bekliyor">Bekliyor</option>
            <option value="İade">İade Edildi</option>
          </select>

          <div className="flex items-center gap-1">
            <input type="date" value={dateRange.start} onChange={(e) => setDateRange(prev => ({...prev, start: e.target.value}))} className="bg-background border border-glass-border text-foreground px-2 py-1.5 text-xs outline-none uppercase" />
            <span className="text-foreground/50">-</span>
            <input type="date" value={dateRange.end} onChange={(e) => setDateRange(prev => ({...prev, end: e.target.value}))} className="bg-background border border-glass-border text-foreground px-2 py-1.5 text-xs outline-none uppercase" />
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="glass-panel p-0 clip-angled border border-glass-border overflow-hidden flex flex-col">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-glass-border bg-foreground/5 text-foreground/60 text-xs uppercase tracking-wider">
                <th className="p-4 w-12 text-center"></th>
                <th className="p-4 font-bold">Sipariş No</th>
                <th className="p-4 font-bold">Müşteri</th>
                <th className="p-4 font-bold">Tarih</th>
                <th className="p-4 font-bold">Tutar</th>
                <th className="p-4 font-bold">Ödeme</th>
                <th className="p-4 font-bold">Durum</th>
                <th className="p-4 font-bold text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-glass-border">
              {loading ? (
                <tr><td colSpan="8" className="p-8 text-center text-primary animate-pulse">Yükleniyor...</td></tr>
              ) : paginatedOrders.length === 0 ? (
                <tr><td colSpan="8" className="p-8 text-center text-foreground/50">Kayıt bulunamadı.</td></tr>
              ) : (
                paginatedOrders.map((order, i) => (
                  <tr key={i} className="hover:bg-foreground/5 transition-colors group">
                    <td className="p-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <input type="checkbox" checked={selectedOrdersIds.includes(order.id)} onChange={() => toggleSelectOrder(order.id)} className="accent-primary w-4 h-4" />
                    </td>
                    <td className="p-4 font-bold text-foreground text-sm cursor-pointer" onClick={() => setSelectedOrder(order)}>
                      {order.id}
                    </td>
                    <td className="p-4 text-foreground/80 text-sm">{order.musteri}</td>
                    <td className="p-4 text-foreground/60 text-sm">{order.tarih}</td>
                    <td className="p-4 text-foreground font-bold text-sm">{order.tutar}</td>
                    <td className="p-4">
                      <span className={`text-[10px] px-2 py-1 rounded border uppercase font-bold tracking-widest ${order.odeme === 'Ödendi' ? 'bg-green-500/10 text-green-500 border-green-500/30' : 'bg-orange-500/10 text-orange-500 border-orange-500/30'}`}>
                        {order.odeme}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-sm">
                      <select 
                        value={order.durum} 
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className={`px-3 py-1.5 text-xs border rounded outline-none font-bold cursor-pointer ${order.renk} ${order.bg} ${order.border}`}
                      >
                        {orderStatuses.map(s => <option key={s} value={s} className="bg-background text-foreground">{s}</option>)}
                      </select>
                    </td>
                    <td className="p-4 text-right">
                      <button onClick={() => setSelectedOrder(order)} className="bg-foreground/5 hover:bg-primary hover:text-white px-3 py-1.5 text-xs font-bold uppercase tracking-widest transition-colors border border-glass-border">
                        Detay
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 0 && (
          <div className="border-t border-glass-border p-4 flex justify-between items-center text-foreground/50 text-xs uppercase tracking-wider bg-foreground/5 mt-auto">
            <span>{filteredOrders.length} Sipariş Listeleniyor</span>
            <div className="flex gap-2">
              <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="px-3 py-1.5 border border-glass-border hover:border-primary hover:text-primary transition-colors disabled:opacity-30">
                &lt; Önceki
              </button>
              <span className="px-4 py-1.5 bg-background text-foreground font-bold border border-glass-border">Sayfa {currentPage} / {totalPages}</span>
              <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="px-3 py-1.5 border border-glass-border hover:border-primary hover:text-primary transition-colors disabled:opacity-30">
                Sonraki &gt;
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Advanced Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setSelectedOrder(null)}></div>
          <div className="glass-panel w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col relative z-10 animate-fade-in border border-glass-border shadow-2xl">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-glass-border flex justify-between items-start bg-foreground/5">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-2xl font-black text-foreground uppercase tracking-widest">Sipariş Detayı</h2>
                  <span className={`px-3 py-1 text-xs border rounded-full font-bold uppercase ${selectedOrder.renk} ${selectedOrder.bg} ${selectedOrder.border}`}>
                    {selectedOrder.durum}
                  </span>
                </div>
                <p className="text-foreground/50 text-sm">{selectedOrder.id} • {selectedOrder.tarih}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="w-8 h-8 flex items-center justify-center bg-foreground/10 hover:bg-danger hover:text-white transition-colors rounded">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col lg:flex-row gap-8 custom-scrollbar">
              
              {/* Left Column: Details */}
              <div className="flex-1 space-y-6">
                
                {/* Visual Status Pipeline */}
                <div className="bg-foreground/5 border border-glass-border p-4 rounded">
                  <h3 className="text-xs font-bold uppercase text-foreground/50 mb-4 tracking-widest">Sipariş Aşaması</h3>
                  <div className="flex justify-between items-center relative">
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-glass-border -z-10"></div>
                    {["Beklemede", "Onaylandı", "Hazırlanıyor", "Kargolandı", "Teslim Edildi"].map((st, idx) => {
                      const isActive = orderStatuses.indexOf(selectedOrder.durum) >= idx;
                      const isCurrent = selectedOrder.durum === st;
                      return (
                        <div key={st} className="flex flex-col items-center gap-2 bg-background p-1">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${isActive ? 'bg-primary border-primary text-white shadow-[0_0_10px_hsla(var(--primary),0.5)]' : 'bg-background border-glass-border text-foreground/30'} ${isCurrent ? 'ring-4 ring-primary/20' : ''}`}>
                            {isActive ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg> : <div className="w-2 h-2 rounded-full bg-foreground/20"></div>}
                          </div>
                          <span className={`text-[10px] uppercase font-bold tracking-widest ${isActive ? 'text-primary' : 'text-foreground/50'}`}>{st}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Items */}
                <div>
                  <h3 className="text-xs font-bold uppercase text-foreground/50 mb-3 tracking-widest">Sipariş Edilen Ürünler</h3>
                  <div className="border border-glass-border divide-y divide-glass-border rounded overflow-hidden">
                    {[1, 2].map((item) => (
                      <div key={item} className="flex items-center gap-4 p-3 hover:bg-foreground/5 transition-colors">
                        <div className="w-16 h-20 bg-foreground/10 relative overflow-hidden rounded border border-glass-border">
                          {/* Placeholder image logic */}
                          <div className="absolute inset-0 flex items-center justify-center text-foreground/20">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                          </div>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-sm">Premium Ürün {item}</h4>
                          <div className="flex gap-2 mt-1">
                            <span className="text-[10px] bg-background border border-glass-border px-1.5 py-0.5 rounded text-foreground/70">Renk: Siyah</span>
                            <span className="text-[10px] bg-background border border-glass-border px-1.5 py-0.5 rounded text-foreground/70">Beden: M</span>
                          </div>
                          <div className="text-xs text-foreground/50 mt-1">Stok Kodu: PRM-{1000 + item}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">{item} x 450.00 ₺</div>
                          <div className="text-primary font-black mt-1">{(item * 450).toFixed(2)} ₺</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Internal Notes */}
                <div>
                  <h3 className="text-xs font-bold uppercase text-foreground/50 mb-3 tracking-widest">İç Notlar</h3>
                  <textarea placeholder="Bu sipariş ile ilgili sadece yöneticilerin görebileceği notlar ekleyin..." className="w-full bg-foreground/5 border border-glass-border p-3 text-sm focus:border-primary outline-none transition-colors h-24 resize-none"></textarea>
                  <div className="flex justify-end mt-2">
                    <button className="bg-foreground/10 hover:bg-primary px-4 py-2 text-xs font-bold uppercase tracking-widest transition-colors">Notu Kaydet</button>
                  </div>
                </div>

              </div>

              {/* Right Column: Customer & Info */}
              <div className="w-full lg:w-80 space-y-6">
                
                {/* Customer Info */}
                <div className="border border-glass-border p-4 bg-foreground/5 rounded">
                  <h3 className="text-xs font-bold uppercase text-foreground/50 mb-3 tracking-widest border-b border-glass-border pb-2">Müşteri Bilgileri</h3>
                  <div className="space-y-3">
                    <div>
                      <div className="text-[10px] text-foreground/50 uppercase">Ad Soyad</div>
                      <div className="font-bold text-sm">{selectedOrder.musteri}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-foreground/50 uppercase">E-posta</div>
                      <div className="font-medium text-sm text-primary">musteri@ornek.com</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-foreground/50 uppercase">Telefon</div>
                      <div className="font-medium text-sm">+90 555 123 45 67</div>
                    </div>
                  </div>
                </div>

                {/* Shipping & Billing */}
                <div className="border border-glass-border p-4 bg-foreground/5 rounded">
                  <h3 className="text-xs font-bold uppercase text-foreground/50 mb-3 tracking-widest border-b border-glass-border pb-2">Teslimat Adresi</h3>
                  <p className="text-sm leading-relaxed">
                    Örnek Mahallesi, Test Sokak, No: 123 Daire: 4<br/>
                    Kadıköy / İstanbul<br/>
                    Türkiye
                  </p>
                </div>

                {/* Summary */}
                <div className="border border-glass-border p-4 bg-foreground/5 rounded">
                  <h3 className="text-xs font-bold uppercase text-foreground/50 mb-3 tracking-widest border-b border-glass-border pb-2">Sipariş Özeti</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-foreground/70">Ara Toplam</span>
                      <span>1,350.00 ₺</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-foreground/70">Kargo</span>
                      <span>0.00 ₺</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-foreground/70">İndirim</span>
                      <span className="text-green-500">-50.00 ₺</span>
                    </div>
                    <div className="border-t border-glass-border pt-2 mt-2 flex justify-between font-black text-lg">
                      <span>Toplam</span>
                      <span className="text-primary">{selectedOrder.tutar}</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-glass-border">
                    <select 
                      value={selectedOrder.durum} 
                      onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value)}
                      className="w-full bg-background border border-primary text-primary font-bold px-3 py-2 outline-none uppercase tracking-widest text-sm"
                    >
                      {orderStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-glass-border bg-background flex justify-between items-center">
              <button onClick={() => window.print()} className="bg-foreground/5 hover:bg-foreground/10 text-foreground px-6 py-2 uppercase tracking-widest text-xs font-bold transition-colors border border-glass-border flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
                Fatura Yazdır
              </button>
              <button onClick={() => setSelectedOrder(null)} className="bg-primary hover:bg-secondary text-white px-8 py-2 uppercase tracking-widest text-xs font-bold transition-colors clip-angled">
                Kapat
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
