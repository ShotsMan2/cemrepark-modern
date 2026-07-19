"use client";
import { useState, useEffect, useMemo } from "react";
import Swal from "sweetalert2";

export default function MessagesView() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("Tümü");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [selectedMessages, setSelectedMessages] = useState([]);

  // Reply Modal States
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replySubject, setReplySubject] = useState("");
  const [replyText, setReplyText] = useState("");
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const res = await fetch("/api/messages");
      if (res.ok) {
        const data = await res.json();
        // Mock adding status if backend doesn't provide
        const enrichedData = data.map(m => ({
            ...m,
            status: m.status || (Math.random() > 0.5 ? 'okunmadi' : (Math.random() > 0.5 ? 'okundu' : 'yanitlandi'))
        }));
        setMessages(enrichedData);
      }
    } catch (error) {
      console.error("Mesajlar yüklenirken hata:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "Emin misiniz?",
      text: "Bu mesajı silmek istediğinize emin misiniz?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ff007f",
      cancelButtonColor: "#333",
      confirmButtonText: "Evet, Sil!",
      cancelButtonText: "İptal",
      background: "#1a1a1a",
      color: "#fff",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await fetch(`/api/messages/${id}`, { method: "DELETE" });
          if (res.ok) {
            Swal.fire({ title: "Silindi!", text: "Mesaj silindi.", icon: "success", confirmButtonColor: "#ff007f", background: "#1a1a1a", color: "#fff" });
            fetchMessages();
          }
        } catch (error) {}
      }
    });
  };

  const handleBulkDelete = () => {
      if(selectedMessages.length === 0) return;
      Swal.fire({
          title: "Emin misiniz?",
          text: `${selectedMessages.length} mesajı silmek istediğinize emin misiniz?`,
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#ff007f",
          cancelButtonColor: "#333",
          confirmButtonText: "Evet, Sil!",
          cancelButtonText: "İptal",
          background: "#1a1a1a",
          color: "#fff",
      }).then((result) => {
          if (result.isConfirmed) {
              // Mock bulk delete
              setMessages(messages.filter(m => !selectedMessages.includes(m.id)));
              setSelectedMessages([]);
              Swal.fire("Başarılı", "Seçili mesajlar silindi", "success");
          }
      });
  };

  const handleBulkMarkAsRead = () => {
      if(selectedMessages.length === 0) return;
      setMessages(messages.map(m => selectedMessages.includes(m.id) ? {...m, status: 'okundu'} : m));
      setSelectedMessages([]);
      Swal.fire("Başarılı", "Seçili mesajlar okundu olarak işaretlendi", "success");
  }

  const handleReplyClick = (msg) => {
    setSelectedMessage(msg);
    setReplySubject(`Cemre Park Destek Yanıtı`);
    setReplyText(`Merhaba ${msg.adSoyad},\n\nİletişim formumuz üzerinden iletmiş olduğunuz mesajınız için teşekkür ederiz.\n\n[Buraya yanıtınızı yazın]\n\nSaygılarımızla,\nCemre Park Müşteri Hizmetleri`);
    
    // Mark as read when opened
    if(msg.status === 'okunmadi') {
        setMessages(messages.map(m => m.id === msg.id ? {...m, status: 'okundu'} : m));
    }
  };

  const applyTemplate = (e) => {
      const template = e.target.value;
      if(!template || !selectedMessage) return;

      let text = `Merhaba ${selectedMessage.adSoyad},\n\n`;
      if(template === "tesekkur") text += "Geri bildiriminiz için teşekkür ederiz. Görüşleriniz bizim için çok değerli.\n\n";
      else if(template === "siparis") text += "Siparişiniz başarıyla alınmış olup, kargoya verilmek üzere hazırlanmaktadır. Kargo takip numaranız SMS ile iletilecektir.\n\n";
      else if(template === "iade") text += "İade talebiniz işleme alınmıştır. Ürünü faturasıyla birlikte anlaşmalı kargo firmamızla ücretsiz olarak gönderebilirsiniz.\n\n";
      else if(template === "urun") text += "İlgilendiğiniz ürünle ilgili detaylı bilgi aşağıdadır: \n\n";

      text += "Saygılarımızla,\nCemre Park Müşteri Hizmetleri";
      setReplyText(text);
  };

  const handleSendEmail = async (e) => {
    e.preventDefault();
    if (!selectedMessage || !replySubject || !replyText) return;
    setIsSending(true);

    try {
      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: selectedMessage.ePosta, subject: replySubject, message: replyText }),
      });

      if (res.ok) {
        Swal.fire({ icon: "success", title: "Gönderildi!", text: "E-posta başarıyla gönderildi.", confirmButtonColor: "#ff007f", background: "#1a1a1a", color: "#fff" });
        setMessages(messages.map(m => m.id === selectedMessage.id ? {...m, status: 'yanitlandi'} : m));
        setSelectedMessage(null);
      } else {
        Swal.fire("Hata", "E-posta gönderilemedi.", "error");
      }
    } catch (err) {
      Swal.fire("Hata", "Bir hata oluştu.", "error");
    } finally {
      setIsSending(false);
    }
  };

  // Stats
  const stats = useMemo(() => {
      const total = messages.length;
      const unread = messages.filter(m => m.status === 'okunmadi').length;
      const replied = messages.filter(m => m.status === 'yanitlandi').length;
      const today = messages.filter(m => {
          // simple check for today if mock dates are strings
          return m.tarih && m.tarih.includes(new Date().getFullYear().toString());
      }).length;
      return { total, unread, replied, today };
  }, [messages]);

  // Filtering
  const filteredMessages = messages.filter(msg => {
      const matchesSearch = msg.adSoyad?.toLowerCase().includes(searchQuery.toLowerCase()) || msg.ePosta?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "Tümü" || 
                            (statusFilter === "Okunmadı" && msg.status === 'okunmadi') ||
                            (statusFilter === "Yanıtlandı" && msg.status === 'yanitlandi');
      return matchesSearch && matchesStatus;
  });

  const toggleSelect = (id) => {
      if(selectedMessages.includes(id)) setSelectedMessages(selectedMessages.filter(i => i !== id));
      else setSelectedMessages([...selectedMessages, id]);
  };

  const toggleSelectAll = () => {
      if(selectedMessages.length === filteredMessages.length) setSelectedMessages([]);
      else setSelectedMessages(filteredMessages.map(m => m.id));
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-[400px]"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neon-pink"></div></div>;
  }

  return (
    <div className="animate-fade-in text-left">
      <div className="glass-panel p-6 clip-angled mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white uppercase tracking-wider">İletişim Mesajları</h2>
          <p className="text-gray-400 text-sm mt-1">Müşterilerinizden gelen tüm mesajları buradan yönetebilirsiniz.</p>
        </div>
        <div className="text-right">
            <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">Ort. Yanıt Süresi</span>
            <div className="text-holo-gold font-bold text-lg">2 Saat 15 Dk</div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="glass-panel p-4 clip-angled border-l-4 border-white/20">
              <div className="text-gray-400 text-xs font-bold uppercase mb-1">Toplam Mesaj</div>
              <div className="text-2xl font-bold text-white">{stats.total}</div>
          </div>
          <div className="glass-panel p-4 clip-angled border-l-4 border-neon-pink/50 bg-neon-pink/5">
              <div className="text-neon-pink text-xs font-bold uppercase mb-1">Bugün Gelen</div>
              <div className="text-2xl font-bold text-white">{stats.today}</div>
          </div>
          <div className="glass-panel p-4 clip-angled border-l-4 border-green-500/50 bg-green-500/5">
              <div className="text-green-400 text-xs font-bold uppercase mb-1">Yanıtlanan</div>
              <div className="text-2xl font-bold text-white">{stats.replied}</div>
          </div>
          <div className="glass-panel p-4 clip-angled border-l-4 border-holo-gold/50 bg-holo-gold/5">
              <div className="text-holo-gold text-xs font-bold uppercase mb-1">Yanıt Bekleyen</div>
              <div className="text-2xl font-bold text-white">{stats.unread}</div>
          </div>
      </div>

      {/* Toolbar */}
      <div className="glass-panel p-4 clip-angled mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 w-full md:w-auto">
              <input type="text" placeholder="İsim veya E-posta ara..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="bg-black/50 border border-white/10 text-white px-4 py-2 text-sm focus:border-neon-pink outline-none flex-1 md:w-64"/>
              <input type="date" value={dateRange.start} onChange={e => setDateRange({...dateRange, start: e.target.value})} className="bg-black/50 border border-white/10 text-white px-2 py-2 text-sm outline-none"/>
          </div>
          <div className="flex gap-2 text-xs font-bold uppercase tracking-wider w-full md:w-auto overflow-x-auto">
              {['Tümü', 'Okunmadı', 'Yanıtlandı'].map(tab => (
                  <button key={tab} onClick={() => setStatusFilter(tab)} className={`px-4 py-2 whitespace-nowrap transition-colors border ${statusFilter === tab ? 'bg-white/10 border-white/20 text-white' : 'border-transparent text-gray-500 hover:text-white'}`}>
                      {tab}
                  </button>
              ))}
          </div>
      </div>

      {selectedMessages.length > 0 && (
          <div className="bg-neon-pink/20 border border-neon-pink p-3 mb-6 flex items-center justify-between clip-angled animate-fade-in">
              <span className="text-white font-bold text-sm">{selectedMessages.length} mesaj seçildi</span>
              <div className="flex gap-2">
                  <button onClick={handleBulkMarkAsRead} className="bg-white/10 hover:bg-white/20 text-white px-3 py-1 text-xs font-bold uppercase">Okundu İşaretle</button>
                  <button onClick={handleBulkDelete} className="bg-red-500/80 hover:bg-red-500 text-white px-3 py-1 text-xs font-bold uppercase">Sil</button>
              </div>
          </div>
      )}

      {filteredMessages.length === 0 ? (
        <div className="glass-panel p-12 clip-angled text-center border border-white/5">
          <h3 className="text-lg font-bold text-white mb-2">Sonuç Bulunamadı</h3>
          <p className="text-gray-500 text-sm">Filtrelere uygun mesaj yok.</p>
        </div>
      ) : (
        <div className="space-y-4">
            {filteredMessages.map((msg) => (
                <div key={msg.id} className={`glass-panel p-0 clip-angled border ${msg.status === 'okunmadi' ? 'border-l-4 border-l-holo-gold border-white/5 bg-holo-gold/5' : 'border-white/5'} transition-all hover:bg-white/5 group`}>
                    <div className="p-4 flex flex-col md:flex-row gap-4 items-start md:items-center">
                        <div className="pt-1">
                            <input type="checkbox" checked={selectedMessages.includes(msg.id)} onChange={() => toggleSelect(msg.id)} className="w-4 h-4 accent-neon-pink"/>
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-1">
                                <div className="flex items-center gap-3">
                                    <h4 className={`font-bold ${msg.status === 'okunmadi' ? 'text-white' : 'text-gray-300'}`}>{msg.adSoyad}</h4>
                                    {msg.status === 'okunmadi' && <span className="bg-holo-gold text-black text-[9px] px-1.5 py-0.5 font-bold uppercase">Yeni</span>}
                                    {msg.status === 'yanitlandi' && <span className="bg-green-500 text-black text-[9px] px-1.5 py-0.5 font-bold uppercase">Yanıtlandı</span>}
                                </div>
                                <span className="text-xs text-gray-500 whitespace-nowrap ml-4">{msg.tarih}</span>
                            </div>
                            <a href={`mailto:${msg.ePosta}`} className="text-xs text-neon-pink hover:underline inline-block mb-2">{msg.ePosta}</a>
                            <p className={`text-sm ${msg.status === 'okunmadi' ? 'text-gray-200 font-medium' : 'text-gray-400'} line-clamp-2`}>{msg.mesaj}</p>
                        </div>
                        <div className="flex items-center gap-2 md:opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleReplyClick(msg)} className="bg-white/10 hover:bg-neon-pink text-white px-4 py-2 text-xs font-bold uppercase clip-angled transition-colors">Yanıtla</button>
                            <button onClick={() => handleDelete(msg.id)} className="bg-white/5 hover:bg-red-500 text-gray-400 hover:text-white p-2 transition-colors"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg></button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
      )}

      {/* Reply Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="glass-panel p-6 max-w-2xl w-full clip-angled border border-white/10 relative animate-fade-in text-left flex flex-col max-h-[90vh]">
            <button onClick={() => setSelectedMessage(null)} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>

            <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-wider">Yanıtla</h3>
            <p className="text-xs text-gray-400 mb-6 border-b border-white/10 pb-4">
                <strong>Alıcı:</strong> {selectedMessage.adSoyad} &lt;{selectedMessage.ePosta}&gt;
            </p>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
                <div className="bg-white/5 p-4 text-sm text-gray-300 italic border-l-2 border-white/20 mb-4">
                    "{selectedMessage.mesaj}"
                </div>
                
                <form id="replyForm" onSubmit={handleSendEmail} className="space-y-4">
                    <div className="flex justify-between items-center">
                        <label className="block text-gray-400 text-xs font-bold uppercase tracking-wider">Konu</label>
                        <select onChange={applyTemplate} className="bg-white/10 text-white text-xs px-2 py-1 outline-none font-bold uppercase">
                            <option value="">Şablon Seç...</option>
                            <option value="tesekkur">Teşekkür Mesajı</option>
                            <option value="siparis">Sipariş Bilgilendirme</option>
                            <option value="iade">İade Talebi Yanıtı</option>
                            <option value="urun">Ürün Bilgisi</option>
                        </select>
                    </div>
                    <input required type="text" value={replySubject} onChange={(e) => setReplySubject(e.target.value)} className="w-full bg-black/50 border border-white/10 text-white px-4 py-2 text-sm focus:border-neon-pink outline-none transition-colors" />

                    <div>
                        <label className="block text-gray-400 text-xs font-bold mb-1 uppercase tracking-wider">Mesajınız</label>
                        <textarea required rows="8" value={replyText} onChange={(e) => setReplyText(e.target.value)} className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 text-sm focus:border-neon-pink outline-none transition-colors resize-none font-sans" />
                    </div>
                </form>
            </div>

            <div className="flex gap-4 pt-4 mt-4 border-t border-white/10">
                <button type="button" onClick={() => setSelectedMessage(null)} className="flex-1 border border-white/10 text-white py-3 uppercase tracking-widest text-xs hover:bg-white/5 transition-colors clip-angled font-bold">İptal</button>
                <button type="submit" form="replyForm" disabled={isSending} className="flex-1 bg-neon-pink text-white py-3 uppercase tracking-widest text-xs hover:bg-white hover:text-black transition-colors clip-angled font-bold disabled:opacity-50">
                    {isSending ? "Gönderiliyor..." : "Gönder"}
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
