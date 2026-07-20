"use client";
import React, { useState, useEffect, useMemo } from "react";
import Swal from "sweetalert2";
import Image from "next/image";
import { Search, Download, Printer, Eye, ChevronDown, ChevronUp, FileText } from "lucide-react";

export default function OrdersView() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState("Tümü");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [paymentFilter, setPaymentFilter] = useState("Tümü");
  const [amountMin, setAmountMin] = useState("");
  const [amountMax, setAmountMax] = useState("");
  const [customerFilter, setCustomerFilter] = useState("");

  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [selectedOrdersIds, setSelectedOrdersIds] = useState<string[]>([]);
  const [bulkStatus, setBulkStatus] = useState("");
  const [sendNotification, setSendNotification] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const orderStatuses = ["Beklemede", "Onaylandı", "Hazırlanıyor", "Kargolandı", "Teslim Edildi", "İptal"];

  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);

  useEffect(() => {
    fetchOrders();
  }, [currentPage, activeTab, searchTerm, paymentFilter, dateRange, amountMin, amountMax, customerFilter]);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams({ page: String(currentPage), limit: String(itemsPerPage) });
      if (searchTerm) query.append("search", searchTerm);
      if (activeTab !== "Tümü") query.append("status", activeTab);
      if (paymentFilter !== "Tümü") query.append("paymentStatus", paymentFilter);
      if (dateRange.start) query.append("dateStart", dateRange.start);
      if (dateRange.end) query.append("dateEnd", dateRange.end);
      if (amountMin) query.append("amountMin", amountMin);
      if (amountMax) query.append("amountMax", amountMax);
      if (customerFilter) query.append("customer", customerFilter);

      const res = await fetch(`/api/orders?${query.toString()}`);
      if (res.ok) {
        const result = await res.json();
        const data = result.data || result;
        const total = result.total || data.length;
        const mappedOrders = data.map((o: any) => ({
          id: o.id.toString(),
          musteri: o.customer || "Bilinmiyor",
          email: o.email || "musteri@ornek.com",
          phone: o.phone || "+90 555 XXX XX XX",
          tarih: new Date(o.createdAt).toLocaleDateString("tr-TR"),
          tarihRaw: new Date(o.createdAt),
          tutar: `${o.total} ₺`,
          durum: o.status === "Bekliyor" ? "Beklemede" : o.status,
          odeme: o.paymentStatus || "Ödendi",
          trackingNumber: o.trackingNumber || "",
          carrier: o.carrier || "",
          items: o.items || [
            { name: "Premium Ürün", quantity: 1, price: 450, color: "Siyah", size: "M" },
            { name: "Klasik Ürün", quantity: 2, price: 350, color: "Beyaz", size: "L" },
          ],
          ...getStatusStyles(o.status === "Bekliyor" ? "Beklemede" : o.status),
        }));
        setOrders(mappedOrders);
        setTotalPages(result.totalPages || Math.ceil(data.length / itemsPerPage) || 1);
        setTotalOrders(total);
      } else {
        setOrders(getMockOrders());
        setTotalPages(3);
        setTotalOrders(25);
      }
    } catch (err) {
      console.error(err);
      setOrders(getMockOrders());
      setTotalPages(3);
      setTotalOrders(25);
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case "Beklemede": return { renk: "text-orange-400", border: "border-orange-400/30", bg: "bg-orange-400/10" };
      case "Onaylandı": return { renk: "text-blue-400", border: "border-blue-400/30", bg: "bg-blue-400/10" };
      case "Hazırlanıyor": return { renk: "text-holo-gold", border: "border-holo-gold/30", bg: "bg-holo-gold/10" };
      case "Kargolandı": return { renk: "text-purple-400", border: "border-purple-400/30", bg: "bg-purple-400/10" };
      case "Teslim Edildi": return { renk: "text-green-500", border: "border-green-500/30", bg: "bg-green-500/10" };
      case "İptal": return { renk: "text-red-500", border: "border-red-500/30", bg: "bg-red-500/10" };
      default: return { renk: "text-foreground/50", border: "border-gray-400/30", bg: "bg-gray-400/10" };
    }
  };

  const getMockOrders = () => {
    return Array.from({ length: itemsPerPage }).map((_, i) => {
      const st = orderStatuses[Math.floor(Math.random() * orderStatuses.length)];
      return {
        id: `SIP-${1000 + i}`, musteri: `Müşteri ${i}`, email: `musteri${i}@ornek.com`,
        phone: `+90 555 ${100 + i} ${10 + i} ${i}`,
        tarih: new Date(Date.now() - i * 86400000).toLocaleDateString("tr-TR"),
        tarihRaw: new Date(Date.now() - i * 86400000),
        tutar: `${(Math.random() * 2000 + 100).toFixed(2)} ₺`,
        durum: st, odeme: Math.random() > 0.2 ? "Ödendi" : "Bekliyor",
        trackingNumber: `${1000000000 + i}`, carrier: Math.random() > 0.5 ? "Yurtiçi Kargo" : "MNG Kargo",
        items: [
          { name: "Premium Ürün", quantity: 1, price: 450, color: "Siyah", size: "M" },
          { name: "Klasik Ürün", quantity: 2, price: 350, color: "Beyaz", size: "L" },
        ],
        ...getStatusStyles(st),
      };
    });
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    const result = await Swal.fire({
      title: "Emin misiniz?",
      text: `Sipariş durumu "${newStatus}" olarak güncellenecek.`,
      icon: "question", showCancelButton: true, confirmButtonText: "Evet, Güncelle", cancelButtonText: "İptal",
      confirmButtonColor: "var(--primary)",
    });
    if (result.isConfirmed) {
      try {
        const res = await fetch(`/api/orders`, {
          method: "PATCH", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: Number(id), status: newStatus }),
        });
        if (res.ok) { fetchOrders(); Swal.fire("Başarılı", "Sipariş durumu güncellendi", "success"); }
        else Swal.fire("Hata", "Güncelleme başarısız", "error");
      } catch { Swal.fire("Hata", "Güncelleme başarısız", "error"); }
    }
  };

  const handleTrackingUpdate = async () => {
    if (!selectedOrder) return;
    try {
      const res = await fetch(`/api/orders`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: Number(selectedOrder.id), trackingNumber: selectedOrder.trackingNumber, carrier: selectedOrder.carrier }),
      });
      if (res.ok) { fetchOrders(); Swal.fire("Başarılı", "Kargo bilgileri güncellendi", "success"); }
      else Swal.fire("Hata", "Güncelleme başarısız", "error");
    } catch { Swal.fire("Hata", "Güncelleme başarısız", "error"); }
  };

  const handleBulkStatusUpdate = async () => {
    if (!bulkStatus || selectedOrdersIds.length === 0) return;
    const result = await Swal.fire({
      title: "Toplu Güncelleme", text: `${selectedOrdersIds.length} sipariş "${bulkStatus}" olarak güncellenecek.${sendNotification ? " Müşterilere bildirim gönderilecek." : ""}`,
      icon: "warning", showCancelButton: true, confirmButtonText: "Evet, Uygula", cancelButtonText: "İptal", confirmButtonColor: "var(--primary)",
    });
    if (result.isConfirmed) {
      try {
        await fetch(`/api/orders`, {
          method: "PATCH", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderIds: selectedOrdersIds.map(Number), status: bulkStatus }),
        });
        fetchOrders();
        Swal.fire("Başarılı", "Seçili siparişler güncellendi", "success");
        setSelectedOrdersIds([]);
        setBulkStatus("");
      } catch { Swal.fire("Hata", "Toplu güncelleme başarısız", "error"); }
    }
  };

  const handleExport = () => {
    const dataToExport = orders.map((o) => `"${o.id}","${o.musteri}","${o.tarih}","${o.tutar}","${o.durum}","${o.odeme}"`);
    const csv = ["Sipariş No,Müşteri,Tarih,Tutar,Durum,Ödeme Durumu", ...dataToExport].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `siparisler_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  const handlePrintInvoice = () => {
    if (!selectedOrder) return;
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <html><head><title>Fatura - ${selectedOrder.id}</title>
        <style>body{font-family:Arial;padding:40px;color:#333}h1{color:#d61c7b}table{width:100%;border-collapse:collapse;margin:20px 0}th,td{padding:10px;text-align:left;border-bottom:1px solid #ddd}.total{font-size:24px;font-weight:bold;color:#d61c7b}</style>
        </head><body>
        <h1>FATURA</h1>
        <p><strong>Sipariş No:</strong> ${selectedOrder.id}</p>
        <p><strong>Müşteri:</strong> ${selectedOrder.musteri}</p>
        <p><strong>Tarih:</strong> ${selectedOrder.tarih}</p>
        <p><strong>Ödeme Durumu:</strong> ${selectedOrder.odeme}</p>
        <table><tr><th>Ürün</th><th>Adet</th><th>Fiyat</th><th>Toplam</th></tr>
        ${selectedOrder.items?.map((item: any) => `<tr><td>${item.name}</td><td>${item.quantity}</td><td>${item.price} ₺</td><td>${(item.quantity * item.price).toFixed(2)} ₺</td></tr>`).join("") || ""}
        </table>
        <div class="total">Toplam: ${selectedOrder.tutar}</div>
        </body></html>
      `);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => printWindow.print(), 500);
    }
  };

  const paginatedOrders = orders;
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) setSelectedOrdersIds(paginatedOrders.map((o) => o.id));
    else setSelectedOrdersIds([]);
  };
  const toggleSelectOrder = (id: string) => {
    setSelectedOrdersIds((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]);
  };

  const stats = orderStatuses.reduce((acc: any, status) => { acc[status] = orders.filter((o) => o.durum === status).length; return acc; }, {});
  stats["Tümü"] = orders.length;

  const orderStatusIndex = (status: string) => orderStatuses.indexOf(status);

  return (
    <div className="animate-fade-in flex flex-col gap-6">
      <div className="glass-panel p-6 clip-angled border border-glass-border">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b border-glass-border pb-4">
          <div>
            <h2 className="text-xl font-bold text-foreground uppercase tracking-wider">Sipariş Yönetimi</h2>
            <p className="text-foreground/50 text-sm mt-1">Tüm siparişlerinizi ve süreçleri yönetin.</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setShowFilters(!showFilters)} className={`border ${showFilters ? "border-neon-pink text-neon-pink" : "border-glass-border"} text-foreground px-4 py-2 text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-2`}>
              <Search size={14} /> Filtreler
            </button>
            <button onClick={handleExport} className="bg-primary hover:bg-secondary text-foreground font-bold py-2 px-6 uppercase tracking-widest text-sm transition-colors clip-angled flex items-center gap-2">
              <Download size={16} /> CSV
            </button>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {["Tümü", ...orderStatuses].map((st) => (
            <div key={st} onClick={() => { setActiveTab(st); setCurrentPage(1); }}
              className={`p-3 border rounded cursor-pointer transition-colors text-center ${activeTab === st ? "border-primary bg-primary/10" : "border-glass-border bg-foreground/5 hover:border-foreground/30"}`}>
              <div className="text-xl font-black mb-1">{stats[st] || 0}</div>
              <div className="text-[10px] uppercase tracking-widest text-foreground/70">{st}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-panel p-4 clip-angled border border-glass-border flex flex-col lg:flex-row justify-between gap-4 items-center">
        <div className="flex items-center gap-3 w-full lg:w-auto p-2 bg-foreground/5 border border-glass-border rounded">
          <input type="checkbox" onChange={handleSelectAll} checked={selectedOrdersIds.length === paginatedOrders.length && paginatedOrders.length > 0} className="accent-primary" />
          <span className="text-xs font-bold uppercase">{selectedOrdersIds.length} Seçili</span>
          <div className="h-4 w-px bg-glass-border mx-1"></div>
          <select value={bulkStatus} onChange={(e) => setBulkStatus(e.target.value)} className="bg-background border border-glass-border text-foreground text-xs px-2 py-1 outline-none">
            <option value="">Durum Seç</option>
            {orderStatuses.map((s) => (<option key={s} value={s}>{s}</option>))}
          </select>
          <label className="flex items-center gap-1 text-[10px] uppercase cursor-pointer text-foreground/70">
            <input type="checkbox" checked={sendNotification} onChange={(e) => setSendNotification(e.target.checked)} className="accent-primary" /> Bildirim
          </label>
          <button onClick={handleBulkStatusUpdate} disabled={!bulkStatus || selectedOrdersIds.length === 0} className="bg-primary/20 text-primary hover:bg-primary hover:text-foreground px-3 py-1 text-xs font-bold uppercase transition-colors disabled:opacity-50">Uygula</button>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/50" />
            <input type="text" placeholder="Sipariş No, Müşteri..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="bg-background border border-glass-border text-foreground pl-9 pr-4 py-1.5 focus:outline-none focus:border-primary text-sm w-48 transition-colors" />
          </div>
          <select value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)} className="bg-background border border-glass-border text-foreground px-3 py-1.5 text-sm outline-none">
            <option value="Tümü">Tüm Ödemeler</option>
            <option value="Ödendi">Ödendi</option>
            <option value="Bekliyor">Bekliyor</option>
            <option value="İade">İade Edildi</option>
          </select>
          {showFilters && (
            <div className="flex items-center gap-2">
              <input type="date" value={dateRange.start} onChange={(e) => setDateRange((prev) => ({ ...prev, start: e.target.value }))} className="bg-background border border-glass-border text-foreground px-2 py-1.5 text-xs outline-none uppercase" />
              <span className="text-foreground/50">-</span>
              <input type="date" value={dateRange.end} onChange={(e) => setDateRange((prev) => ({ ...prev, end: e.target.value }))} className="bg-background border border-glass-border text-foreground px-2 py-1.5 text-xs outline-none uppercase" />
              <input type="number" placeholder="Min ₺" value={amountMin} onChange={(e) => setAmountMin(e.target.value)} className="bg-background border border-glass-border text-foreground px-2 py-1.5 text-xs outline-none w-20" />
              <input type="number" placeholder="Max ₺" value={amountMax} onChange={(e) => setAmountMax(e.target.value)} className="bg-background border border-glass-border text-foreground px-2 py-1.5 text-xs outline-none w-20" />
            </div>
          )}
        </div>
      </div>

      <div className="glass-panel p-0 clip-angled border border-glass-border overflow-hidden flex flex-col">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse min-w-[900px]">
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
                <tr><td colSpan={8} className="p-8 text-center">
                  <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-2"></div>
                  <span className="text-primary animate-pulse text-sm">Yükleniyor...</span>
                </td></tr>
              ) : error ? (
                <tr><td colSpan={8} className="p-8 text-center">
                  <p className="text-red-400 text-sm font-bold mb-2">{error}</p>
                  <button onClick={fetchOrders} className="bg-neon-pink text-foreground px-4 py-1 text-xs font-bold uppercase clip-angled">Tekrar Dene</button>
                </td></tr>
              ) : paginatedOrders.length === 0 ? (
                <tr><td colSpan={8} className="p-8 text-center text-foreground/50">Kayıt bulunamadı.</td></tr>
              ) : (
                paginatedOrders.map((order, i) => (
                  <React.Fragment key={i}>
                    <tr className="hover:bg-foreground/5 transition-colors group">
                      <td className="p-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <input type="checkbox" checked={selectedOrdersIds.includes(order.id)} onChange={() => toggleSelectOrder(order.id)} className="accent-primary w-4 h-4" />
                      </td>
                      <td className="p-4 font-bold text-foreground text-sm cursor-pointer" onClick={() => setSelectedOrder(order)}>
                        <div className="flex items-center gap-2">
                          {order.id}
                          <button onClick={(e) => { e.stopPropagation(); setExpandedOrder(expandedOrder === order.id ? null : order.id); }} className="text-foreground/30 hover:text-foreground">
                            {expandedOrder === order.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </button>
                        </div>
                      </td>
                      <td className="p-4 text-foreground/80 text-sm relative group/customer">
                        {order.musteri}
                        <div className="absolute bottom-full left-0 mb-2 w-64 glass-panel p-4 clip-angled opacity-0 pointer-events-none group-hover/customer:opacity-100 group-hover/customer:pointer-events-auto transition-opacity z-50">
                          <p className="font-bold text-foreground text-sm mb-2">{order.musteri}</p>
                          <p className="text-foreground/60 text-xs">E-posta: {order.email}</p>
                          <p className="text-foreground/60 text-xs">Tel: {order.phone}</p>
                        </div>
                      </td>
                      <td className="p-4 text-foreground/60 text-sm">{order.tarih}</td>
                      <td className="p-4 text-foreground font-bold text-sm">{order.tutar}</td>
                      <td className="p-4">
                        <span className={`text-[10px] px-2 py-1 rounded border uppercase font-bold tracking-widest ${order.odeme === "Ödendi" ? "bg-green-500/10 text-green-500 border-green-500/30" : "bg-orange-500/10 text-orange-500 border-orange-500/30"}`}>{order.odeme}</span>
                      </td>
                      <td className="p-4 font-bold text-sm">
                        <select value={order.durum} onChange={(e) => handleStatusChange(order.id, e.target.value)} className={`px-3 py-1.5 text-xs border rounded outline-none font-bold cursor-pointer ${order.renk} ${order.bg} ${order.border}`}>
                          {orderStatuses.map((s) => (<option key={s} value={s} className="bg-background text-foreground">{s}</option>))}
                        </select>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => setSelectedOrder(order)} className="w-8 h-8 flex items-center justify-center bg-foreground/5 hover:bg-primary hover:text-foreground transition-colors rounded" title="Detay"><Eye size={14} /></button>
                          <button onClick={() => { setSelectedOrder(order); setTimeout(handlePrintInvoice, 300); }} className="w-8 h-8 flex items-center justify-center bg-foreground/5 hover:bg-holo-gold hover:text-black transition-colors rounded" title="Yazdır"><Printer size={14} /></button>
                        </div>
                      </td>
                    </tr>
                    {expandedOrder === order.id && (
                      <tr className="bg-foreground/5">
                        <td colSpan={8} className="p-4 pl-16">
                          <div className="flex items-center gap-4">
                            {order.items.map((item: any, idx: number) => (
                              <div key={idx} className="flex items-center gap-3 bg-foreground/5 p-3 rounded border border-glass-border">
                                <div className="flex flex-col">
                                  <span className="font-bold text-sm text-foreground">{item.name}</span>
                                  <div className="flex gap-2 text-[10px] text-foreground/50">
                                    <span>Renk: {item.color}</span>
                                    <span>Beden: {item.size}</span>
                                  </div>
                                  <span className="text-xs text-foreground/70">{item.quantity} x {item.price} ₺</span>
                                </div>
                              </div>
                            ))}
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

        {totalPages > 0 && (
          <div className="border-t border-glass-border p-4 flex justify-between items-center text-foreground/50 text-xs uppercase tracking-wider bg-foreground/5 mt-auto">
            <span>{totalOrders} Sipariş Listeleniyor</span>
            <div className="flex gap-2">
              <button onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="px-3 py-1.5 border border-glass-border hover:border-primary hover:text-primary transition-colors disabled:opacity-30">&lt; Önceki</button>
              <span className="px-4 py-1.5 bg-background text-foreground font-bold border border-glass-border">Sayfa {currentPage} / {totalPages}</span>
              <button onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="px-3 py-1.5 border border-glass-border hover:border-primary hover:text-primary transition-colors disabled:opacity-30">Sonraki &gt;</button>
            </div>
          </div>
        )}
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setSelectedOrder(null)}></div>
          <div className="glass-panel w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col relative z-10 animate-fade-in border border-glass-border shadow-2xl">
            <div className="p-6 border-b border-glass-border flex justify-between items-start bg-foreground/5">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-2xl font-black text-foreground uppercase tracking-widest">Sipariş Detayı</h2>
                  <span className={`px-3 py-1 text-xs border rounded-full font-bold uppercase ${selectedOrder.renk} ${selectedOrder.bg} ${selectedOrder.border}`}>{selectedOrder.durum}</span>
                </div>
                <p className="text-foreground/50 text-sm">{selectedOrder.id} • {selectedOrder.tarih}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="w-8 h-8 flex items-center justify-center bg-foreground/10 hover:bg-danger hover:text-foreground transition-colors rounded">
                <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 flex flex-col lg:flex-row gap-8 custom-scrollbar">
              <div className="flex-1 space-y-6">
                <div className="bg-foreground/5 border border-glass-border p-4 rounded">
                  <h3 className="text-xs font-bold uppercase text-foreground/50 mb-4 tracking-widest">Sipariş Aşaması</h3>
                  <div className="flex justify-between items-center relative">
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-glass-border -z-10"></div>
                    {["Beklemede", "Onaylandı", "Hazırlanıyor", "Kargolandı", "Teslim Edildi"].map((st, idx) => {
                      const isActive = orderStatusIndex(selectedOrder.durum) >= idx;
                      const isCurrent = selectedOrder.durum === st;
                      return (
                        <div key={st} className="flex flex-col items-center gap-2 bg-background p-1">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${isActive ? "bg-primary border-primary text-foreground shadow-[0_0_10px_hsla(var(--primary),0.5)]" : "bg-background border-glass-border text-foreground/30"} ${isCurrent ? "ring-4 ring-primary/20" : ""}`}>
                            {isActive ? (
                              <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polyline points="20 6 9 17 4 12"></polyline></svg>
                            ) : <div className="w-2 h-2 rounded-full bg-foreground/20"></div>}
                          </div>
                          <span className={`text-[10px] uppercase font-bold tracking-widest ${isActive ? "text-primary" : "text-foreground/50"}`}>{st}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-bold uppercase text-foreground/50 mb-3 tracking-widest">Sipariş Edilen Ürünler</h3>
                  <div className="border border-glass-border divide-y divide-glass-border rounded overflow-hidden">
                    {(selectedOrder.items || []).map((item: any, idx: number) => (
                      <div key={idx} className="flex items-center gap-4 p-3 hover:bg-foreground/5 transition-colors">
                        <div className="w-16 h-20 bg-foreground/10 relative overflow-hidden rounded border border-glass-border">
                          <div className="absolute inset-0 flex items-center justify-center text-foreground/20">
                            <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect x="3" y="3" width={18} height={18} rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
                          </div>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-sm">{item.name}</h4>
                          <div className="flex gap-2 mt-1">
                            <span className="text-[10px] bg-background border border-glass-border px-1.5 py-0.5 rounded text-foreground/70">Renk: {item.color}</span>
                            <span className="text-[10px] bg-background border border-glass-border px-1.5 py-0.5 rounded text-foreground/70">Beden: {item.size}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">{item.quantity} x {item.price}.00 ₺</div>
                          <div className="text-primary font-black mt-1">{(item.quantity * item.price).toFixed(2)} ₺</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-bold uppercase text-foreground/50 mb-3 tracking-widest">İç Notlar</h3>
                  <textarea placeholder="Bu sipariş ile ilgili sadece yöneticilerin görebileceği notlar ekleyin..." className="w-full bg-foreground/5 border border-glass-border p-3 text-sm focus:border-primary outline-none transition-colors h-24 resize-none"></textarea>
                  <div className="flex justify-end mt-2">
                    <button className="bg-foreground/10 hover:bg-primary px-4 py-2 text-xs font-bold uppercase tracking-widest transition-colors">Notu Kaydet</button>
                  </div>
                </div>
              </div>

              <div className="w-full lg:w-80 space-y-6">
                <div className="border border-glass-border p-4 bg-foreground/5 rounded">
                  <h3 className="text-xs font-bold uppercase text-foreground/50 mb-3 tracking-widest border-b border-glass-border pb-2">Müşteri Bilgileri</h3>
                  <div className="space-y-3">
                    <div><div className="text-[10px] text-foreground/50 uppercase">Ad Soyad</div><div className="font-bold text-sm">{selectedOrder.musteri}</div></div>
                    <div><div className="text-[10px] text-foreground/50 uppercase">E-posta</div><div className="font-medium text-sm text-primary">{selectedOrder.email}</div></div>
                    <div><div className="text-[10px] text-foreground/50 uppercase">Telefon</div><div className="font-medium text-sm">{selectedOrder.phone}</div></div>
                  </div>
                </div>

                <div className="border border-glass-border p-4 bg-foreground/5 rounded">
                  <h3 className="text-xs font-bold uppercase text-foreground/50 mb-3 tracking-widest border-b border-glass-border pb-2">Teslimat Adresi</h3>
                  <p className="text-sm leading-relaxed mb-4">
                    Örnek Mahallesi, Test Sokak, No: 123 Daire: 4<br />Kadıköy / İstanbul<br />Türkiye
                  </p>
                  <h3 className="text-xs font-bold uppercase text-foreground/50 mb-3 tracking-widest border-b border-glass-border pb-2">Kargo Bilgileri</h3>
                  <div className="space-y-3">
                    <div>
                      <div className="text-[10px] text-foreground/50 uppercase mb-1">Kargo Firması</div>
                      <input type="text" value={selectedOrder.carrier || ""} onChange={(e) => setSelectedOrder({ ...selectedOrder, carrier: e.target.value })} className="w-full bg-background border border-glass-border px-3 py-1.5 text-sm outline-none" placeholder="Örn: Yurtiçi Kargo" />
                    </div>
                    <div>
                      <div className="text-[10px] text-foreground/50 uppercase mb-1">Takip Numarası</div>
                      <input type="text" value={selectedOrder.trackingNumber || ""} onChange={(e) => setSelectedOrder({ ...selectedOrder, trackingNumber: e.target.value })} className="w-full bg-background border border-glass-border px-3 py-1.5 text-sm outline-none" placeholder="Örn: 1234567890" />
                    </div>
                    <button onClick={handleTrackingUpdate} className="w-full bg-primary/20 text-primary hover:bg-primary hover:text-foreground py-2 text-xs font-bold uppercase tracking-widest transition-colors mt-2">Kargo Bilgilerini Kaydet</button>
                  </div>
                </div>

                <div className="border border-glass-border p-4 bg-foreground/5 rounded">
                  <h3 className="text-xs font-bold uppercase text-foreground/50 mb-3 tracking-widest border-b border-glass-border pb-2">Sipariş Özeti</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-foreground/70">Ara Toplam</span><span>{selectedOrder.tutar}</span></div>
                    <div className="flex justify-between"><span className="text-foreground/70">Kargo</span><span>0.00 ₺</span></div>
                    <div className="flex justify-between"><span className="text-foreground/70">İndirim</span><span className="text-green-500">-0.00 ₺</span></div>
                    <div className="border-t border-glass-border pt-2 mt-2 flex justify-between font-black text-lg"><span>Toplam</span><span className="text-primary">{selectedOrder.tutar}</span></div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-glass-border">
                    <select value={selectedOrder.durum} onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value)} className="w-full bg-background border border-primary text-primary font-bold px-3 py-2 outline-none uppercase tracking-widest text-sm">
                      {orderStatuses.map((s) => (<option key={s} value={s}>{s}</option>))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-glass-border bg-background flex justify-between items-center">
              <div className="flex gap-3">
                <button onClick={handlePrintInvoice} className="bg-foreground/5 hover:bg-foreground/10 text-foreground px-6 py-2 uppercase tracking-widest text-xs font-bold transition-colors border border-glass-border flex items-center gap-2">
                  <FileText size={16} /> Fatura Oluştur
                </button>
                <button onClick={() => window.print()} className="bg-foreground/5 hover:bg-foreground/10 text-foreground px-6 py-2 uppercase tracking-widest text-xs font-bold transition-colors border border-glass-border flex items-center gap-2">
                  <Printer size={16} /> Yazdır
                </button>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="bg-primary hover:bg-secondary text-foreground px-8 py-2 uppercase tracking-widest text-xs font-bold transition-colors clip-angled">Kapat</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
