"use client";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";

export default function MessagesView() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

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
        setMessages(data);
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
          const res = await fetch(`/api/messages/${id}`, {
            method: "DELETE",
          });
          if (res.ok) {
            Swal.fire({
              title: "Silindi!",
              text: "Mesaj başarıyla silindi.",
              icon: "success",
              confirmButtonColor: "#ff007f",
              background: "#1a1a1a",
              color: "#fff",
            });
            fetchMessages(); // reload list
          } else {
            Swal.fire("Hata", "Silme işlemi başarısız oldu.", "error");
          }
        } catch (error) {
          console.error(error);
          Swal.fire("Hata", "Bir sunucu hatası oluştu.", "error");
        }
      }
    });
  };

  const handleReplyClick = (msg) => {
    setSelectedMessage(msg);
    setReplySubject(`Cemre Park Destek Yanıtı`);
    setReplyText(
      `Merhaba ${msg.adSoyad},\n\nİletişim formumuz üzerinden iletmiş olduğunuz mesajınız için teşekkür ederiz.\n\n[Buraya yanıtınızı yazın]\n\nSaygılarımızla,\nCemre Park Müşteri Hizmetleri`
    );
  };

  const handleSendEmail = async (e) => {
    e.preventDefault();
    if (!selectedMessage || !replySubject || !replyText) return;
    setIsSending(true);

    try {
      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: selectedMessage.ePosta,
          subject: replySubject,
          message: replyText,
        }),
      });

      if (res.ok) {
        Swal.fire({
          icon: "success",
          title: "Gönderildi!",
          text: `${selectedMessage.adSoyad} isimli müşteriye e-posta başarıyla gönderildi. (Konsol çıktısını kontrol edebilirsiniz.)`,
          confirmButtonColor: "#ff007f",
          background: "#1a1a1a",
          color: "#fff",
        });
        setSelectedMessage(null);
      } else {
        Swal.fire("Hata", "E-posta gönderilemedi.", "error");
      }
    } catch (err) {
      console.error(err);
      Swal.fire("Hata", "Bir hata oluştu.", "error");
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neon-pink"></div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="glass-panel p-6 clip-angled mb-8">
        <h2 className="text-xl font-bold text-white uppercase tracking-wider">
          İletişim Mesajları
        </h2>
        <p className="text-gray-400 text-sm mt-1">
          İletişim formundan müşterilerinizin gönderdiği mesajları buradan inceleyebilirsiniz.
        </p>
      </div>

      {messages.length === 0 ? (
        <div className="glass-panel p-12 clip-angled text-center border border-white/5">
          <div className="w-16 h-16 rounded-full border border-white/10 mx-auto flex items-center justify-center mb-4">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="gray"
              strokeWidth="1.5"
            >
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
              <polyline points="22,6 12,13 2,6"></polyline>
            </svg>
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Henüz Mesaj Yok</h3>
          <p className="text-gray-500 text-sm">Gelen kutunuz şu anda boş.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Desktop Table View */}
          <div className="hidden md:block glass-panel clip-angled overflow-hidden border border-white/5">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/5 text-gray-400 text-xs font-bold uppercase tracking-wider">
                  <th className="p-4 pl-6">Ad Soyad</th>
                  <th className="p-4">E-Posta</th>
                  <th className="p-4">Tarih</th>
                  <th className="p-4">Mesaj</th>
                  <th className="p-4 text-center pr-6" style={{ width: "120px" }}>
                    İşlem
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm text-gray-300">
                {messages.map((msg) => (
                  <tr key={msg.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 pl-6 font-bold text-white">{msg.adSoyad}</td>
                    <td className="p-4">
                      <a href={`mailto:${msg.ePosta}`} className="text-neon-pink hover:underline">
                        {msg.ePosta}
                      </a>
                    </td>
                    <td className="p-4 text-gray-500 whitespace-nowrap">{msg.tarih}</td>
                    <td className="p-4 leading-relaxed max-w-md break-words">{msg.mesaj}</td>
                    <td className="p-4 pr-6">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleReplyClick(msg)}
                          className="text-gray-400 hover:text-neon-pink p-2 transition-colors focus:outline-none"
                          title="Yanıtla (E-posta Gönder)"
                        >
                          <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                            <polyline points="22,6 12,13 2,6"></polyline>
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(msg.id)}
                          className="text-gray-400 hover:text-red-500 p-2 transition-colors focus:outline-none"
                          title="Mesajı Sil"
                        >
                          <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M3 6h18"></path>
                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                            <line x1="10" y1="11" x2="10" y2="17"></line>
                            <line x1="14" y1="11" x2="14" y2="17"></line>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className="glass-panel p-6 clip-angled border border-white/5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-white font-bold">{msg.adSoyad}</h4>
                      <a
                        href={`mailto:${msg.ePosta}`}
                        className="text-xs text-neon-pink hover:underline block mt-0.5"
                      >
                        {msg.ePosta}
                      </a>
                    </div>
                    <span className="text-[10px] text-gray-500 bg-white/5 px-2 py-1 rounded">
                      {msg.tarih}
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed mb-4 break-words">
                    {msg.mesaj}
                  </p>
                </div>
                <div className="flex justify-end border-t border-white/5 pt-4 gap-4">
                  <button
                    onClick={() => handleReplyClick(msg)}
                    className="flex items-center gap-2 text-xs text-gray-400 hover:text-neon-pink transition-colors uppercase font-bold tracking-wider"
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                      <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                    Yanıtla
                  </button>
                  <button
                    onClick={() => handleDelete(msg.id)}
                    className="flex items-center gap-2 text-xs text-gray-400 hover:text-red-500 transition-colors uppercase font-bold tracking-wider"
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M3 6h18"></path>
                      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                    </svg>
                    Sil
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reply Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="glass-panel p-8 max-w-lg w-full clip-angled border border-white/10 relative animate-fade-in text-left">
            <button
              onClick={() => setSelectedMessage(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors focus:outline-none"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>

            <h3 className="text-xl font-bold text-white mb-6 uppercase tracking-wider">
              E-Posta Gönder
            </h3>

            <form onSubmit={handleSendEmail} className="space-y-4">
              <div>
                <label className="block text-gray-400 text-xs font-bold mb-1 uppercase tracking-wider">
                  Alıcı
                </label>
                <input
                  readOnly
                  type="text"
                  value={`${selectedMessage.adSoyad} (${selectedMessage.ePosta})`}
                  className="w-full bg-white/5 border border-white/10 text-gray-400 px-4 py-3 text-sm outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-400 text-xs font-bold mb-1 uppercase tracking-wider">
                  Konu
                </label>
                <input
                  required
                  type="text"
                  value={replySubject}
                  onChange={(e) => setReplySubject(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 text-sm focus:border-neon-pink outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-gray-400 text-xs font-bold mb-1 uppercase tracking-wider">
                  Yanıt Mesajınız
                </label>
                <textarea
                  required
                  rows="6"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Müşteriye göndermek istediğiniz mesajı buraya yazın..."
                  className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 text-sm focus:border-neon-pink outline-none transition-colors resize-none font-sans"
                />
              </div>

              <div className="flex gap-4 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setSelectedMessage(null)}
                  className="flex-1 border border-white/10 text-white py-3 uppercase tracking-widest text-xs hover:bg-white/5 transition-colors clip-angled font-bold"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={isSending}
                  className="flex-1 bg-neon-pink text-white py-3 uppercase tracking-widest text-xs hover:bg-white hover:text-black transition-colors clip-angled font-bold disabled:opacity-50"
                >
                  {isSending ? "Gönderiliyor..." : "E-Posta Gönder"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
