import { useState, useEffect } from "react";
import Swal from "sweetalert2";

export default function CustomersView() {
  const [searchTerm, setSearchTerm] = useState("");
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/users");
      if (res.ok) {
        const data = await res.json();
        const mappedData = data.map((u) => {
          let segment = "New";
          if (u._count.orders >= 5) segment = "VIP";
          else if (u._count.orders >= 1) segment = "Regular";

          return {
            id: `USR-${u.id}`,
            isim: u.name || "İsimsiz Kullanıcı",
            email: u.email,
            kayit: new Date(u.createdAt).toLocaleDateString("tr-TR", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            }),
            harcama: 0, // Currently no order totals in user model without complex include
            segment: segment,
            siparisSayisi: u._count.orders,
          };
        });
        setCustomers(mappedData);
      }
    } catch (error) {
      console.error("Kullanıcılar alınırken hata:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter((c) => {
    return (
      c.isim.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const getSegmentColor = (segment) => {
    switch (segment) {
      case "VIP":
        return "bg-holo-gold/20 text-holo-gold border-holo-gold/30";
      case "Regular":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "New":
        return "bg-neon-pink/20 text-neon-pink border-neon-pink/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const handleDeleteUser = async (id, name) => {
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
          const res = await fetch(`/api/users/${id.replace('USR-', '')}`, {
            method: 'DELETE',
          });
          if (res.ok) {
            setCustomers(customers.filter(c => c.id !== id));
            Swal.fire({
              title: 'Silindi!',
              text: 'Kullanıcı silindi.',
              icon: 'success',
              background: '#1a1a1a',
              color: '#fff',
            });
          } else {
            throw new Error('Failed to delete');
          }
        } catch (error) {
          Swal.fire({
            title: 'Hata!',
            text: 'Kullanıcı silinemedi.',
            icon: 'error',
            background: '#1a1a1a',
            color: '#fff',
          });
        }
      }
    });
  };

  const handleSendEmail = () => {
    Swal.fire({
      title: "Toplu E-posta Gönder",
      text: `${filteredCustomers.length} müşteriye bülten e-postası gönderilecek. Onaylıyor musunuz?`,
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
        Swal.fire({
          title: "Başarılı!",
          text: "E-postalar kuyruğa alındı ve gönderim işlemi başlatıldı.",
          icon: "success",
          confirmButtonColor: "#ff007f",
          background: "#1a1a1a",
          color: "#fff",
        });
      }
    });
  };

  return (
    <div className="animate-fade-in">
      <div className="glass-panel p-6 clip-angled mb-8 flex justify-between items-center">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 w-full">
          <div>
            <h2 className="text-xl font-bold text-white uppercase tracking-wider">Müşteri CRM</h2>
            <p className="text-gray-400 text-sm mt-1">
              Müşteri segmentasyonu, harcama analizleri ve iletişim (Demo).
            </p>
          </div>
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="İsim, E-posta Ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-black/50 border border-white/10 text-white px-4 py-2 focus:outline-none focus:border-neon-pink text-sm w-64"
            />
            <button
              onClick={handleSendEmail}
              className="bg-neon-pink text-white font-bold py-2 px-6 uppercase tracking-widest text-sm hover:bg-white hover:text-black transition-colors clip-angled"
            >
              E-posta Gönder
            </button>
          </div>
        </div>
      </div>

      <div className="glass-panel p-0 clip-angled overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 bg-black/40 text-gray-400 text-xs uppercase tracking-wider">
              <th className="p-4 font-bold">Müşteri</th>
              <th className="p-4 font-bold">İletişim</th>
              <th className="p-4 font-bold">Segment</th>
              <th className="p-4 font-bold">Kayıt & Sipariş</th>
              <th className="p-4 font-bold text-right">Toplam Değer</th>
              <th className="p-4 font-bold text-right">İşlem</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              <tr>
                <td colSpan="6" className="p-8 text-center text-gray-400">
                  <div className="flex justify-center mb-4">
                    <div className="w-8 h-8 border-4 border-neon-pink border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  Kullanıcılar Yükleniyor...
                </td>
              </tr>
            ) : filteredCustomers.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-8 text-center text-gray-400">
                  Kayıtlı kullanıcı bulunamadı.
                </td>
              </tr>
            ) : (
              filteredCustomers.map((c, i) => (
                <tr key={i} className="hover:bg-white/5 transition-colors group cursor-pointer">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neon-pink/50 to-holo-gold/50 flex items-center justify-center text-white font-bold uppercase">
                        {c.isim.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-white text-sm group-hover:text-neon-pink transition-colors">
                          {c.isim}
                        </p>
                        <p className="text-gray-500 text-xs">{c.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-gray-300 text-sm">{c.email}</td>
                  <td className="p-4">
                    <span
                      className={`px-3 py-1 text-xs border rounded-full font-bold uppercase tracking-wider ${getSegmentColor(c.segment)}`}
                    >
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
                      onClick={() => {
                        Swal.fire({
                          title: c.isim,
                          html: `
                          <div class="text-left text-sm space-y-2">
                            <p><strong>Kullanıcı ID:</strong> ${c.id}</p>
                            <p><strong>E-posta:</strong> ${c.email}</p>
                            <p><strong>Segment:</strong> ${c.segment}</p>
                            <p><strong>Kayıt Tarihi:</strong> ${c.kayit}</p>
                            <p><strong>Sipariş Adedi:</strong> ${c.siparisSayisi}</p>
                            <p><strong>Toplam Harcama:</strong> Yakında...</p>
                          </div>
                        `,
                          confirmButtonColor: "#ff007f",
                          background: "#1a1a1a",
                          color: "#fff",
                        });
                      }}
                      className="text-gray-400 hover:text-white transition-colors text-sm underline decoration-white/20 underline-offset-4 mr-4"
                    >
                      Profili Gör
                    </button>
                    <button
                      onClick={() => handleDeleteUser(c.id, c.isim)}
                      className="text-red-400 hover:text-red-300 transition-colors text-sm underline decoration-red-400/20 underline-offset-4"
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
    </div>
  );
}
