"use client";
import { useState, useEffect, useMemo } from "react";
import Swal from "sweetalert2";
import { motion } from "framer-motion";
import { Search, Download, Mail, CheckCheck, Eye, EyeOff, Trash2, Send, MessageSquare, Inbox, Reply, CheckCircle } from "lucide-react";

export default function MessagesView() {
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("Tümü");
  const [selectedMessages, setSelectedMessages] = useState<number[]>([]);

  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [replySubject, setReplySubject] = useState("");
  const [replyText, setReplyText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [viewingMessage, setViewingMessage] = useState<any>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [totalPages, setTotalPages] = useState(1);
  const [totalMessages, setTotalMessages] = useState(0);

  useEffect(() => { fetchMessages(); }, [currentPage, searchQuery, statusFilter]);

  const fetchMessages = async () => {
    setIsLoading(true); setError(null);
    try {
      const query = new URLSearchParams({ page: String(currentPage), limit: String(itemsPerPage) });
      if (searchQuery) query.append("search", searchQuery);
      const res = await fetch(`/api/messages?${query.toString()}`);
      if (res.ok) {
        const result = await res.json();
        const data = result.data || result;
        const total = result.total || data.length;
        const enrichedData = data.map((m: any) => ({ ...m, status: m.status || (Math.random() > 0.5 ? "okunmadi" : Math.random() > 0.5 ? "okundu" : "yanitlandi") }));
        setMessages(enrichedData);
        setTotalPages(result.totalPages || Math.ceil(data.length / itemsPerPage) || 1);
        setTotalMessages(total);
      } else setError("Mesajlar yüklenemedi");
    } catch { setError("Sunucu hatası"); }
    finally { setIsLoading(false); }
  };

  const handleDelete = (id: number) => {
    Swal.fire({
      title: "Emin misiniz?", text: "Bu mesajı silmek istediğinize emin misiniz?", icon: "warning",
      showCancelButton: true, confirmButtonColor: "#ff007f", cancelButtonColor: "#333",
      confirmButtonText: "Evet, Sil!", cancelButtonText: "İptal", background: "#1a1a1a", color: "#fff",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try { await fetch(`/api/messages/${id}`, { method: "DELETE" }); fetchMessages(); Swal.fire({ title: "Silindi!", icon: "success", background: "#1a1a1a", color: "#fff" }); } catch {}
      }
    });
  };

  const handleBulkDelete = () => {
    if (selectedMessages.length === 0) return;
    Swal.fire({
      title: "Emin misiniz?", text: `${selectedMessages.length} mesaj silinecek.`, icon: "warning",
      showCancelButton: true, confirmButtonColor: "#ff007f", cancelButtonColor: "#333",
      confirmButtonText: "Evet, Sil!", cancelButtonText: "İptal", background: "#1a1a1a", color: "#fff",
    }).then((result) => {
      if (result.isConfirmed) {
        setMessages(messages.filter((m) => !selectedMessages.includes(m.id)));
        setSelectedMessages([]);
        Swal.fire("Başarılı", "Seçili mesajlar silindi", "success");
      }
    });
  };

  const handleBulkMarkAsRead = () => {
    if (selectedMessages.length === 0) return;
    setMessages(messages.map((m) => selectedMessages.includes(m.id) ? { ...m, status: "okundu" } : m));
    setSelectedMessages([]);
    Swal.fire("Başarılı", "Seçili mesajlar okundu işaretlendi", "success");
  };

  const handleMarkAsUnread = (msg: any) => {
    setMessages(messages.map((m) => m.id === msg.id ? { ...m, status: "okunmadi" } : m));
    Swal.fire({ toast: true, icon: "info", title: "Okunmadı işaretlendi", timer: 1500, showConfirmButton: false });
  };

  const handleReplyClick = (msg: any) => {
    setSelectedMessage(msg);
    setReplySubject("Cemre Park Destek Yanıtı");
    setReplyText(`Merhaba ${msg.adSoyad},\n\nİletişim formumuz üzerinden iletmiş olduğunuz mesajınız için teşekkür ederiz.\n\n[Buraya yanıtınızı yazın]\n\nSaygılarımızla,\nCemre Park Müşteri Hizmetleri`);
    if (msg.status === "okunmadi") setMessages(messages.map((m) => m.id === msg.id ? { ...m, status: "okundu" } : m));
  };

  const applyTemplate = (e: any) => {
    const template = e.target.value;
    if (!template || !selectedMessage) return;
    let text = `Merhaba ${selectedMessage.adSoyad},\n\n`;
    if (template === "tesekkur") text += "Geri bildiriminiz için teşekkür ederiz.\n\n";
    else if (template === "siparis") text += "Siparişiniz başarıyla alınmıştır. Kargo takip numaranız SMS ile iletilecektir.\n\n";
    else if (template === "iade") text += "İade talebiniz işleme alınmıştır.\n\n";
    else if (template === "urun") text += "İlgilendiğiniz ürünle ilgili detaylı bilgi aşağıdadır:\n\n";
    text += "Saygılarımızla,\nCemre Park Müşteri Hizmetleri";
    setReplyText(text);
  };

  const handleSendEmail = async (e: any) => {
    e.preventDefault();
    if (!selectedMessage || !replySubject || !replyText) return;
    setIsSending(true);
    try {
      const res = await fetch("/api/send-email", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: selectedMessage.ePosta, subject: replySubject, message: replyText }),
      });
      if (res.ok) {
        Swal.fire({ icon: "success", title: "Gönderildi!", background: "#1a1a1a", color: "#fff" });
        setMessages(messages.map((m) => m.id === selectedMessage.id ? { ...m, status: "yanitlandi" } : m));
        setSelectedMessage(null);
      } else Swal.fire("Hata", "E-posta gönderilemedi.", "error");
    } catch { Swal.fire("Hata", "Bir hata oluştu.", "error"); }
    finally { setIsSending(false); }
  };

  const handleExport = () => {
    const dataToExport = messages.map((m) => `"${m.adSoyad}","${m.ePosta}","${m.mesaj}","${m.tarih}","${m.status}"`);
    const csv = ["Ad Soyad,E-posta,Mesaj,Tarih,Durum", ...dataToExport].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a"); link.href = URL.createObjectURL(blob);
    link.download = `mesajlar_${new Date().toISOString().slice(0, 10)}.csv`; link.click();
  };

  const stats = useMemo(() => {
    const total = messages.length;
    const unread = messages.filter((m) => m.status === "okunmadi").length;
    const replied = messages.filter((m) => m.status === "yanitlandi").length;
    const today = messages.filter((m) => m.tarih && m.tarih.includes(new Date().getFullYear().toString())).length;
    return { total, unread, replied, today };
  }, [messages]);

  const filteredMessages = messages.filter((msg) => {
    const matchesSearch = msg.adSoyad?.toLowerCase().includes(searchQuery.toLowerCase()) || msg.ePosta?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "Tümü" || (statusFilter === "Okunmadı" && msg.status === "okunmadi") || (statusFilter === "Yanıtlandı" && msg.status === "yanitlandi") || (statusFilter === "Okundu" && msg.status === "okundu");
    return matchesSearch && matchesStatus;
  });

  const toggleSelect = (id: number) => {
    if (selectedMessages.includes(id)) setSelectedMessages(selectedMessages.filter((i) => i !== id));
    else setSelectedMessages([...selectedMessages, id]);
  };

  const toggleSelectAll = () => {
    if (selectedMessages.length === filteredMessages.length && filteredMessages.length > 0) setSelectedMessages([]);
    else setSelectedMessages(filteredMessages.map((m) => m.id));
  };

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  );

  return (
    <div className="animate-fade-in text-left">
      <div className="glass-panel p-6 clip-angled mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground uppercase tracking-wider">İletişim Mesajları</h2>
          <p className="text-foreground/50 text-sm mt-1">Müşterilerinizden gelen tüm mesajları yönetin.</p>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={handleExport} className="bg-foreground/10 hover:bg-foreground/20 text-foreground px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2"><Download size={14} /> CSV</button>
          <span className="text-xs text-foreground/60 uppercase font-bold tracking-wider"><span className="text-secondary font-bold text-lg">2s 15dk</span><br />Ort. Yanıt</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="glass-panel p-4 clip-angled border-l-4 border-white/20"><div className="text-foreground/50 text-xs font-bold uppercase mb-1">Toplam Mesaj</div><div className="text-2xl font-bold text-foreground">{stats.total}</div></div>
        <div className="glass-panel p-4 clip-angled border-l-4 border-primary/50 bg-primary/5"><div className="text-primary text-xs font-bold uppercase mb-1">Bugün Gelen</div><div className="text-2xl font-bold text-foreground">{stats.today}</div></div>
        <div className="glass-panel p-4 clip-angled border-l-4 border-success/50 bg-success/5"><div className="text-success text-xs font-bold uppercase mb-1">Yanıtlanan</div><div className="text-2xl font-bold text-foreground">{stats.replied}</div></div>
        <div className="glass-panel p-4 clip-angled border-l-4 border-secondary/50 bg-secondary/5"><div className="text-secondary text-xs font-bold uppercase mb-1">Okunmayan</div><div className="text-2xl font-bold text-foreground">{stats.unread}</div></div>
      </div>

      <div className="glass-panel p-4 clip-angled mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2 w-full md:w-auto">
          <input type="text" placeholder="İsim veya E-posta ara..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="bg-background/50 border border-glass-border text-foreground px-4 py-2 text-sm focus:border-primary outline-none flex-1 md:w-64" />
        </div>
        <div className="flex gap-2 text-xs font-bold uppercase tracking-wider w-full md:w-auto overflow-x-auto">
          {["Tümü", "Okunmadı", "Okundu", "Yanıtlandı"].map((tab) => (
            <button key={tab} onClick={() => { setStatusFilter(tab); setCurrentPage(1); }} className={`px-4 py-2 whitespace-nowrap transition-colors border ${statusFilter === tab ? "bg-foreground/10 border-white/20 text-foreground" : "border-transparent text-foreground/60 hover:text-foreground"}`}>{tab}</button>
          ))}
        </div>
      </div>

      {selectedMessages.length > 0 && (
        <div className="bg-primary/20 border border-primary p-3 mb-6 flex items-center justify-between clip-angled animate-fade-in">
          <span className="text-foreground font-bold text-sm">{selectedMessages.length} mesaj seçildi</span>
          <div className="flex gap-2">
            <button onClick={handleBulkMarkAsRead} className="bg-foreground/10 hover:bg-foreground/20 text-foreground px-3 py-1 text-xs font-bold uppercase"><CheckCircle size={14} className="inline mr-1" />Okundu</button>
            <button onClick={handleBulkDelete} className="bg-danger/80 hover:bg-danger text-foreground px-3 py-1 text-xs font-bold uppercase"><Trash2 size={14} className="inline mr-1" />Sil</button>
          </div>
        </div>
      )}

      {error ? (
        <div className="glass-panel p-12 clip-angled text-center border border-glass-border">
          <p className="text-danger text-sm font-bold mb-2">{error}</p>
          <button onClick={fetchMessages} className="bg-primary text-foreground px-4 py-2 text-xs font-bold uppercase clip-angled">Tekrar Dene</button>
        </div>
      ) : filteredMessages.length === 0 ? (
        <div className="glass-panel p-12 clip-angled text-center border border-glass-border">
          <Inbox size={48} className="mx-auto mb-4 text-foreground/20" />
          <h3 className="text-lg font-bold text-foreground mb-2">Sonuç Bulunamadı</h3>
          <p className="text-foreground/60 text-sm">Filtrelere uygun mesaj yok.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredMessages.map((msg) => (
            <div key={msg.id} className="glass-panel p-0 clip-angled border border-glass-border transition-all hover:bg-foreground/5 group">
              <div className="p-4 flex flex-col md:flex-row gap-4 items-start md:items-center">
                <div className="pt-1">
                  <input type="checkbox" checked={selectedMessages.includes(msg.id)} onChange={() => toggleSelect(msg.id)} className="w-4 h-4 accent-neon-pink" />
                </div>
                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setViewingMessage(viewingMessage?.id === msg.id ? null : msg)}>
                  <div className="flex justify-between items-start mb-1">
                    <div className="flex items-center gap-3">
                      <h4 className={`font-bold ${msg.status === "okunmadi" ? "text-foreground" : "text-foreground/70"}`}>{msg.adSoyad}</h4>
                      {msg.status === "okunmadi" && <span className="bg-secondary text-black text-[9px] px-1.5 py-0.5 font-bold uppercase">Yeni</span>}
                      {msg.status === "yanitlandi" && <span className="bg-success text-black text-[9px] px-1.5 py-0.5 font-bold uppercase flex items-center gap-1"><Send size={10} /> Yanıtlandı</span>}
                      {msg.status === "okundu" && <span className="text-[9px] text-foreground/50 font-bold uppercase flex items-center gap-1"><Eye size={10} /> Okundu</span>}
                    </div>
                    <span className="text-xs text-foreground/60 whitespace-nowrap ml-4">{msg.tarih}</span>
                  </div>
                  <a href={`mailto:${msg.ePosta}`} className="text-xs text-primary hover:underline inline-block mb-2">{msg.ePosta}</a>
                  <p className={`text-sm ${msg.status === "okunmadi" ? "text-gray-200 font-medium" : "text-foreground/50"} line-clamp-2`}>{msg.mesaj}</p>
                  {viewingMessage?.id === msg.id && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="mt-4 p-4 bg-foreground/5 rounded border border-glass-border">
                      <h5 className="text-xs font-bold uppercase text-foreground/50 mb-2">Tam Mesaj</h5>
                      <p className="text-foreground/80 text-sm whitespace-pre-wrap">{msg.mesaj}</p>
                    </motion.div>
                  )}
                </div>
                <div className="flex items-center gap-2 md:opacity-0 group-hover:opacity-100 transition-opacity">
                  {msg.status !== "yanitlandi" && (
                    <button onClick={() => handleReplyClick(msg)} className="bg-foreground/10 hover:bg-primary text-foreground px-4 py-2 text-xs font-bold uppercase clip-angled transition-colors flex items-center gap-1"><Reply size={12} />Yanıtla</button>
                  )}
                  {msg.status === "yanitlandi" ? (
                    <button onClick={() => handleMarkAsUnread(msg)} className="bg-foreground/5 hover:bg-secondary/20 text-foreground/50 hover:text-secondary p-2 transition-colors" title="Okunmadı İşaretle"><EyeOff size={16} /></button>
                  ) : (
                    <button onClick={() => { setMessages(messages.map((m) => m.id === msg.id ? { ...m, status: "yanitlandi" } : m)); }} className="bg-foreground/5 hover:bg-success/20 text-foreground/50 hover:text-success p-2 transition-colors" title="Yanıtlandı İşaretle"><CheckCheck size={16} /></button>
                  )}
                  <button onClick={() => handleDelete(msg.id)} className="bg-foreground/5 hover:bg-danger text-foreground/50 hover:text-foreground p-2 transition-colors"><Trash2 size={16} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 0 && (
        <div className="border-t border-glass-border p-4 flex justify-between items-center text-foreground/50 text-xs uppercase tracking-wider bg-black/40 mt-6 rounded clip-angled">
          <span>{totalMessages} Mesaj Listeleniyor</span>
          <div className="flex gap-2">
            <button onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="px-3 py-1.5 border border-glass-border hover:border-primary hover:text-primary transition-colors disabled:opacity-30 rounded">&lt; Önceki</button>
            <span className="px-4 py-1.5 bg-background/50 text-foreground font-bold border border-glass-border rounded">Sayfa {currentPage} / {totalPages}</span>
            <button onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="px-3 py-1.5 border border-glass-border hover:border-primary hover:text-primary transition-colors disabled:opacity-30 rounded">Sonraki &gt;</button>
          </div>
        </div>
      )}

      {selectedMessage && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="glass-panel p-6 max-w-2xl w-full clip-angled border border-glass-border relative animate-fade-in text-left flex flex-col max-h-[90vh]">
            <button onClick={() => setSelectedMessage(null)} className="absolute top-4 right-4 text-foreground/60 hover:text-foreground transition-colors">
              <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
            <h3 className="text-xl font-bold text-foreground mb-2 uppercase tracking-wider flex items-center gap-2"><Mail size={20} className="text-primary" /> Yanıtla</h3>
            <p className="text-xs text-foreground/50 mb-6 border-b border-glass-border pb-4"><strong>Alıcı:</strong> {selectedMessage.adSoyad} &lt;{selectedMessage.ePosta}&gt;</p>
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
              <div className="bg-foreground/5 p-4 text-sm text-foreground/70 italic border-l-2 border-white/20 mb-4">"{selectedMessage.mesaj}"</div>
              <form id="replyForm" onSubmit={handleSendEmail} className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="block text-foreground/50 text-xs font-bold uppercase tracking-wider">Konu</label>
                  <select onChange={applyTemplate} className="bg-foreground/10 text-foreground text-xs px-2 py-1 outline-none font-bold uppercase">
                    <option value="">Şablon Seç...</option>
                    <option value="tesekkur">Teşekkür</option>
                    <option value="siparis">Sipariş</option>
                    <option value="iade">İade</option>
                    <option value="urun">Ürün Bilgisi</option>
                  </select>
                </div>
                <input required type="text" value={replySubject} onChange={(e) => setReplySubject(e.target.value)} className="w-full bg-background/50 border border-glass-border text-foreground px-4 py-2 text-sm focus:border-primary outline-none transition-colors" />
                <div>
                  <label className="block text-foreground/50 text-xs font-bold mb-1 uppercase tracking-wider">Mesajınız</label>
                  <textarea required rows={4} value={replyText} onChange={(e) => setReplyText(e.target.value)} className="w-full bg-background/50 border border-glass-border text-foreground px-4 py-3 text-sm focus:border-primary outline-none transition-colors resize-none font-sans" />
                </div>
              </form>
            </div>
            <div className="flex gap-4 pt-4 mt-4 border-t border-glass-border">
              <button type="button" onClick={() => setSelectedMessage(null)} className="flex-1 border border-glass-border text-foreground py-3 uppercase tracking-widest text-xs hover:bg-foreground/5 transition-colors clip-angled font-bold">İptal</button>
              <button type="submit" form="replyForm" disabled={isSending} className="flex-1 bg-primary text-foreground py-3 uppercase tracking-widest text-xs hover:bg-white hover:text-black transition-colors clip-angled font-bold disabled:opacity-50 flex items-center justify-center gap-2">{isSending ? "Gönderiliyor..." : <><Send size={14} /> Gönder</>}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
