import { useState, useEffect } from "react";
import Swal from "sweetalert2";

export default function AISupportView() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data for AI Support conversations
    const mockData = [
      {
        id: "conv_1",
        customer: "Ahmet Yılmaz",
        title: "Kargo takibi sorgusu",
        status: "Çözüldü",
        messagesCount: 4,
        summary:
          "Müşteri 1042 numaralı siparişin kargo durumunu sordu. AI kargonun yola çıktığını ve takip numarasını iletti. Müşteri teşekkür ederek görüşmeyi sonlandırdı.",
        satisfaction: 95,
        date: "2026-07-11 14:30",
      },
      {
        id: "conv_2",
        customer: "Zeynep Kaya",
        title: "Ürün iade süreci",
        status: "İnsan Bekliyor",
        messagesCount: 6,
        summary:
          "Müşteri aldığı elbisenin bedeninin uymadığını belirtti. AI iade koşullarını açıkladı ancak müşteri özel bir durum nedeniyle canlı desteğe bağlanmak istedi.",
        satisfaction: 40,
        date: "2026-07-11 16:15",
      },
      {
        id: "conv_3",
        customer: "Ayşe Çelik",
        title: "Stok durumu sorusu",
        status: "Çözüldü",
        messagesCount: 2,
        summary:
          "Müşteri Siyah Premium Takım L beden stoğunu sordu. AI stoğun tükendiğini ancak önümüzdeki hafta yenileneceğini bildirdi.",
        satisfaction: 85,
        date: "2026-07-11 17:05",
      },
    ];

    // Simulate network delay
    setTimeout(() => {
      setConversations(mockData);
      setLoading(false);
    }, 600);
  }, []);

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 clip-angled relative overflow-hidden group hover:border-primary transition-colors">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary opacity-10 rounded-bl-full group-hover:scale-110 transition-transform"></div>
          <p className="text-foreground/50 text-xs font-bold uppercase tracking-widest mb-1">
            Toplam AI Görüşmesi
          </p>
          <h3 className="text-3xl font-black text-foreground">1,248</h3>
          <p className="text-primary text-xs mt-2 font-bold">Bu ay</p>
        </div>
        <div className="glass-panel p-6 clip-angled relative overflow-hidden group hover:border-secondary transition-colors">
          <div className="absolute top-0 right-0 w-24 h-24 bg-secondary opacity-10 rounded-bl-full group-hover:scale-110 transition-transform"></div>
          <p className="text-foreground/50 text-xs font-bold uppercase tracking-widest mb-1">
            Otomatik Çözüm Oranı
          </p>
          <h3 className="text-3xl font-black text-foreground">%84</h3>
          <p className="text-secondary text-xs mt-2 font-bold">+5% artış</p>
        </div>
        <div className="glass-panel p-6 clip-angled relative overflow-hidden group hover:border-success transition-colors">
          <div className="absolute top-0 right-0 w-24 h-24 bg-success opacity-10 rounded-bl-full group-hover:scale-110 transition-transform"></div>
          <p className="text-foreground/50 text-xs font-bold uppercase tracking-widest mb-1">
            Ort. Memnuniyet
          </p>
          <h3 className="text-3xl font-black text-foreground">%92</h3>
          <p className="text-success text-xs mt-2 font-bold">Müşteri geri bildirimleri</p>
        </div>
      </div>

      {/* Conversations List */}
      <div className="glass-panel p-6 clip-angled min-h-[500px]">
        <h2 className="text-xl font-bold text-foreground uppercase tracking-wider mb-6 border-b border-glass-border pb-4">
          Son AI Görüşme Özetleri
        </h2>

        {loading ? (
          <div className="flex justify-center items-center h-48">
            <div className="w-10 h-10 border-4 border-primary/20 border-t-neon-pink rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                className="bg-black/40 border border-glass-border p-5 clip-angled hover:border-white/20 transition-all group"
              >
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-3">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-foreground font-bold text-lg">{conv.title}</h3>
                      <span
                        className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-sm ${
                          conv.status === "Çözüldü"
                            ? "bg-success/20 text-success"
                            : "bg-secondary/20 text-secondary"
                        }`}
                      >
                        {conv.status}
                      </span>
                    </div>
                    <p className="text-foreground/50 text-xs">
                      Müşteri: <span className="text-gray-200">{conv.customer}</span> • {conv.date}{" "}
                      • {conv.messagesCount} mesaj
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-full md:w-32 h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${conv.satisfaction > 80 ? "bg-success" : conv.satisfaction > 50 ? "bg-secondary" : "bg-danger"}`}
                        style={{ width: `${conv.satisfaction}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-foreground/50 font-bold">
                      % {conv.satisfaction}
                    </span>
                  </div>
                </div>

                <div className="bg-foreground/5 p-4 rounded-sm border-l-2 border-primary">
                  <h4 className="text-primary text-xs uppercase font-bold tracking-widest mb-2">
                    AI Özeti
                  </h4>
                  <p className="text-sm text-foreground/70 leading-relaxed">{conv.summary}</p>
                </div>

                <div className="mt-4 flex justify-end">
                  <button className="text-xs uppercase tracking-widest font-bold text-foreground/50 hover:text-foreground transition-colors underline decoration-transparent hover:decoration-white underline-offset-4">
                    Tüm Transkripti Oku
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
