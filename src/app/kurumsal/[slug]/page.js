import { notFound } from "next/navigation";

export default function KurumsalPage({ params }) {
  const { slug } = params;

  const contentMap = {
    hakkimizda: {
      title: "Hakkımızda",
      content: (
        <div className="space-y-6">
          <p className="text-gray-300 leading-relaxed text-lg">
            Cemre Park olarak, modern tesettür giyimin zarafetini ve kalitesini bir araya getiren özgün tasarımlarımızla yıllardır sektörde öncü olmaktan gurur duyuyoruz.
          </p>
          <p className="text-gray-300 leading-relaxed text-lg">
            Amacımız, her kadının kendi stilini bulabileceği, günün her saatine uygun, konforlu ve şık seçenekler sunmaktır. Premium kumaş kalitemiz, usta işçiliğimiz ve güncel moda trendlerini yakalayan vizyonumuzla her sezon yepyeni bir heyecanla karşınızdayız.
          </p>
          <div className="p-8 border border-white/10 bg-black/40 clip-angled my-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-neon-pink opacity-10 rounded-bl-full"></div>
            <h3 className="text-white font-bold text-xl uppercase tracking-widest mb-4">Vizyonumuz</h3>
            <p className="text-gray-400">Türkiye'nin ve dünyanın dört bir yanına ulaşan, modaya yön veren en güvenilir tesettür giyim markası olmak.</p>
          </div>
        </div>
      )
    },
    iletisim: {
      title: "İletişim",
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-8">
            <p className="text-gray-300 leading-relaxed text-lg">
              Soru, öneri ve görüşleriniz bizim için çok değerli. Bize aşağıdaki kanallardan ulaşabilirsiniz.
            </p>
            <div className="space-y-4">
              <div className="flex gap-4 items-center">
                <div className="w-12 h-12 border border-holo-gold flex items-center justify-center text-holo-gold clip-angled">M</div>
                <div>
                  <h4 className="text-white font-bold uppercase tracking-wider text-sm">E-Posta</h4>
                  <p className="text-gray-400">info@cemrepark.com</p>
                </div>
              </div>
              <div className="flex gap-4 items-center">
                <div className="w-12 h-12 border border-neon-pink flex items-center justify-center text-neon-pink clip-angled">T</div>
                <div>
                  <h4 className="text-white font-bold uppercase tracking-wider text-sm">Telefon</h4>
                  <p className="text-gray-400">0850 123 45 67</p>
                </div>
              </div>
              <div className="flex gap-4 items-center">
                <div className="w-12 h-12 border border-white/20 flex items-center justify-center text-white clip-angled">A</div>
                <div>
                  <h4 className="text-white font-bold uppercase tracking-wider text-sm">Adres</h4>
                  <p className="text-gray-400">Moda Sokak No: 123, Tekstil Merkezi, İstanbul</p>
                </div>
              </div>
            </div>
          </div>
          <div className="glass-panel p-8 clip-angled">
            <form className="space-y-4">
              <div>
                <label className="block text-gray-400 text-xs font-bold mb-2 uppercase tracking-wider">Ad Soyad</label>
                <input type="text" className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 text-sm focus:border-neon-pink outline-none transition-colors" />
              </div>
              <div>
                <label className="block text-gray-400 text-xs font-bold mb-2 uppercase tracking-wider">E-Posta</label>
                <input type="email" className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 text-sm focus:border-neon-pink outline-none transition-colors" />
              </div>
              <div>
                <label className="block text-gray-400 text-xs font-bold mb-2 uppercase tracking-wider">Mesajınız</label>
                <textarea rows="4" className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 text-sm focus:border-neon-pink outline-none transition-colors"></textarea>
              </div>
              <button type="button" className="w-full bg-neon-pink text-white font-bold py-3 uppercase tracking-widest text-sm hover:bg-white hover:text-black transition-colors clip-angled">Gönder</button>
            </form>
          </div>
        </div>
      )
    },
    sozlesmeler: {
      title: "Kurumsal Sözleşmeler",
      content: (
        <div className="space-y-8">
          <div className="border-b border-white/10 pb-6">
            <h3 className="text-holo-gold font-bold text-xl uppercase tracking-widest mb-4">Mesafeli Satış Sözleşmesi</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              İşbu Sözleşme, Alıcı'nın, Satıcı'ya ait cemrepark.com internet sitesinden elektronik ortamda siparişini yaptığı aşağıda nitelikleri ve satış ücreti belirtilen ürünün satışı ve teslimi ile ilgili olarak yürürlükteki yasal mevzuat gereğince tarafların hak ve yükümlülüklerini saptar.
            </p>
          </div>
          <div className="border-b border-white/10 pb-6">
            <h3 className="text-holo-gold font-bold text-xl uppercase tracking-widest mb-4">İade ve Değişim Koşulları</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Satın almış olduğunuz ürünleri, kullanılmamış, etiketleri sökülmemiş ve tekrar satılabilir özelliğini kaybetmemiş olması şartıyla 14 gün içerisinde iade edebilir veya değiştirebilirsiniz. İade kargo bedelleri firmamız tarafından karşılanmaktadır.
            </p>
          </div>
          <div className="border-b border-white/10 pb-6">
            <h3 className="text-holo-gold font-bold text-xl uppercase tracking-widest mb-4">Gizlilik Politikası</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Müşterilerimize ait kişisel bilgiler, en yüksek güvenlik standartlarında korunmakta olup, hiçbir şekilde üçüncü şahıslar veya firmalarla paylaşılmaz. SSL sertifikası ile korunan altyapımızda güvenle alışveriş yapabilirsiniz.
            </p>
          </div>
        </div>
      )
    }
  };

  const pageData = contentMap[slug];

  if (!pageData) {
    notFound();
  }

  return (
    <div className="min-h-screen pt-32 pb-24 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-neon-pink opacity-[0.03] rounded-full blur-[120px] pointer-events-none"></div>

      <div className="container mx-auto px-4 relative z-10 max-w-5xl">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-widest mb-4">{pageData.title}</h1>
          <div className="h-1 w-20 bg-neon-pink"></div>
        </div>
        
        <div className="bg-black/20 backdrop-blur-md border border-white/5 p-8 md:p-12 clip-angled">
          {pageData.content}
        </div>
      </div>
    </div>
  );
}
