import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { useStore } from "../../../../context/StoreContext";

export default function SettingsView() {
  const [activeTab, setActiveTab] = useState("Genel");
  const [searchQuery, setSearchQuery] = useState("");
  const { settings, setSettings } = useStore();
  const [formData, setFormData] = useState({
    siteAdi: "", iletisimEposta: "", destekTelefonu: "", adres: "",
    kargoUcreti: 0, ucretsizKargoLimiti: 0, ayniGunTeslimat: false,
    bakimModu: false, ozelCss: "",
    bankaAdi: "", iban: "", hesapSahibi: "", shopierUrl: "",
    smtpHost: "", smtpPort: "", smtpUser: "", smtpPass: "", gonderenAdi: "", gonderenEposta: "",
    instagram: "", facebook: "", twitter: "", youtube: "", whatsapp: "",
    metaTitle: "", metaDescription: "", googleAnalyticsId: "", facebookPixelId: "",
    usdRate: "", eurRate: "", autoUpdateRates: false
  });
  const [lastModified, setLastModified] = useState(new Date().toLocaleString('tr-TR'));

  useEffect(() => {
    if (settings) setFormData((prev) => ({ ...prev, ...settings }));
  }, [settings]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        kargoUcreti: parseFloat(formData.kargoUcreti) || 0,
        ucretsizKargoLimiti: parseFloat(formData.ucretsizKargoLimiti) || 0,
      };

      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSettings(payload);
        setLastModified(new Date().toLocaleString('tr-TR'));
        Swal.fire({
          icon: "success",
          title: "Kaydedildi",
          text: "Ayarlar başarıyla güncellendi.",
          background: "#1a1a1a",
          color: "#fff",
          confirmButtonColor: "#ff007f",
        });
      } else {
        Swal.fire("Hata", "Ayarlar kaydedilemedi.", "error");
      }
    } catch (error) {
      console.error("Ayarlar kaydedilirken hata:", error);
      Swal.fire("Hata", "Bir hata oluştu.", "error");
    }
  };

  const handleClearCache = () => {
    Swal.fire({
      title: "Emin misiniz?",
      text: "Önbelleği temizlemek sitenin geçici olarak yavaşlamasına neden olabilir.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ff007f",
      cancelButtonColor: "#333",
      confirmButtonText: "Evet, Temizle!",
      cancelButtonText: "İptal",
      background: "#1a1a1a",
      color: "#fff",
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: "Temizlendi!",
          text: "Önbellek başarıyla temizlendi.",
          icon: "success",
          confirmButtonColor: "#ff007f",
          background: "#1a1a1a",
          color: "#fff",
        });
      }
    });
  };

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(formData, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "cemrepark-settings.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target.result);
        setFormData((prev) => ({ ...prev, ...imported }));
        Swal.fire("Başarılı", "Ayarlar içe aktarıldı, kaydetmeyi unutmayın.", "success");
      } catch (err) {
        Swal.fire("Hata", "Geçersiz JSON dosyası.", "error");
      }
    };
    reader.readAsText(file);
  };

  const tabs = ["Genel", "Kargo & Teslimat", "Ödeme", "E-posta", "Sosyal Medya", "SEO", "Döviz Kurları", "Gelişmiş"];

  return (
    <div className="animate-fade-in max-w-6xl mx-auto space-y-6 text-left">
      <div className="glass-panel p-6 clip-angled flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white uppercase tracking-wider">Mağaza Ayarları</h2>
          <p className="text-gray-400 text-sm mt-1">
            Sitenizin genel bilgilerini ve işleyiş kurallarını yapılandırın. (Son Güncelleme: {lastModified})
          </p>
        </div>
        <div className="flex gap-2">
          <input 
            type="text" 
            placeholder="Ayar Ara..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-black/50 border border-white/10 text-white px-4 py-2 text-sm focus:border-neon-pink outline-none transition-colors"
          />
          <button onClick={handleClearCache} className="bg-white/10 text-white px-4 py-2 text-xs font-bold uppercase tracking-wider hover:bg-neon-pink transition-colors">
            Cache Temizle
          </button>
          <button onClick={handleExport} className="bg-white/10 text-white px-4 py-2 text-xs font-bold uppercase tracking-wider hover:bg-holo-gold transition-colors">
            Dışa Aktar
          </button>
          <label className="bg-white/10 text-white px-4 py-2 text-xs font-bold uppercase tracking-wider hover:bg-neon-pink transition-colors cursor-pointer">
            İçe Aktar
            <input type="file" accept=".json" className="hidden" onChange={handleImport} />
          </label>
        </div>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 uppercase tracking-widest text-xs font-bold whitespace-nowrap transition-colors border-b-2 ${activeTab === tab ? "text-neon-pink border-neon-pink" : "text-gray-500 border-transparent hover:text-white"}`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="glass-panel p-8 clip-angled min-h-[500px]">
        <form onSubmit={handleSave} className="space-y-6 h-full flex flex-col justify-between">
          
          {/* Genel Tab */}
          <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in ${activeTab === "Genel" ? "block" : "hidden"}`}>
            <div><label className="block text-gray-400 text-xs font-bold mb-2 uppercase tracking-wider">Site Adı</label><input type="text" name="siteAdi" value={formData.siteAdi} onChange={handleInputChange} className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 text-sm focus:border-neon-pink outline-none transition-colors"/></div>
            <div><label className="block text-gray-400 text-xs font-bold mb-2 uppercase tracking-wider">İletişim E-posta</label><input type="email" name="iletisimEposta" value={formData.iletisimEposta} onChange={handleInputChange} className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 text-sm focus:border-neon-pink outline-none transition-colors"/></div>
            <div className="md:col-span-2"><label className="block text-gray-400 text-xs font-bold mb-2 uppercase tracking-wider">Destek Telefonu</label><input type="text" name="destekTelefonu" value={formData.destekTelefonu} onChange={handleInputChange} className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 text-sm focus:border-neon-pink outline-none transition-colors"/></div>
            <div className="md:col-span-2"><label className="block text-gray-400 text-xs font-bold mb-2 uppercase tracking-wider">Adres</label><textarea name="adres" value={formData.adres} onChange={handleInputChange} rows={} className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 text-sm focus:border-neon-pink outline-none transition-colors resize-none"/></div>
          </div>

          {/* Kargo Tab */}
          <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in ${activeTab === "Kargo & Teslimat" ? "block" : "hidden"}`}>
            <div><label className="block text-gray-400 text-xs font-bold mb-2 uppercase tracking-wider">Kargo Ücreti (TL)</label><input type="number" name="kargoUcreti" value={formData.kargoUcreti} onChange={handleInputChange} step="0.01" className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 text-sm focus:border-neon-pink outline-none transition-colors"/></div>
            <div><label className="block text-gray-400 text-xs font-bold mb-2 uppercase tracking-wider">Ücretsiz Kargo Limiti (TL)</label><input type="number" name="ucretsizKargoLimiti" value={formData.ucretsizKargoLimiti} onChange={handleInputChange} className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 text-sm focus:border-neon-pink outline-none transition-colors"/></div>
            <div className="md:col-span-2"><label className="flex items-center gap-3 cursor-pointer"><input type="checkbox" name="ayniGunTeslimat" checked={formData.ayniGunTeslimat} onChange={handleInputChange} className="w-5 h-5 accent-neon-pink"/><span className="text-gray-300 text-sm font-bold uppercase tracking-wider">Aynı Gün Teslimat Seçeneğini Aktif Et</span></label></div>
          </div>

          {/* Ödeme Tab */}
          <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in ${activeTab === "Ödeme" ? "block" : "hidden"}`}>
            <div className="md:col-span-2"><h3 className="text-holo-gold font-bold uppercase mb-4">Havale/EFT Bilgileri</h3></div>
            <div><label className="block text-gray-400 text-xs font-bold mb-2 uppercase tracking-wider">Banka Adı</label><input type="text" name="bankaAdi" value={formData.bankaAdi} onChange={handleInputChange} className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 text-sm focus:border-neon-pink outline-none"/></div>
            <div><label className="block text-gray-400 text-xs font-bold mb-2 uppercase tracking-wider">IBAN</label><input type="text" name="iban" value={formData.iban} onChange={handleInputChange} className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 text-sm focus:border-neon-pink outline-none"/></div>
            <div><label className="block text-gray-400 text-xs font-bold mb-2 uppercase tracking-wider">Hesap Sahibi</label><input type="text" name="hesapSahibi" value={formData.hesapSahibi} onChange={handleInputChange} className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 text-sm focus:border-neon-pink outline-none"/></div>
            <div className="md:col-span-2 mt-4"><h3 className="text-neon-pink font-bold uppercase mb-4">Shopier Entegrasyonu</h3></div>
            <div className="md:col-span-2"><label className="block text-gray-400 text-xs font-bold mb-2 uppercase tracking-wider">Shopier URL / API Key</label><input type="text" name="shopierUrl" value={formData.shopierUrl} onChange={handleInputChange} className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 text-sm focus:border-neon-pink outline-none"/></div>
          </div>

          {/* E-posta Tab */}
          <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in ${activeTab === "E-posta" ? "block" : "hidden"}`}>
            <div><label className="block text-gray-400 text-xs font-bold mb-2 uppercase tracking-wider">SMTP Host</label><input type="text" name="smtpHost" value={formData.smtpHost} onChange={handleInputChange} className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 text-sm focus:border-neon-pink outline-none"/></div>
            <div><label className="block text-gray-400 text-xs font-bold mb-2 uppercase tracking-wider">SMTP Port</label><input type="text" name="smtpPort" value={formData.smtpPort} onChange={handleInputChange} className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 text-sm focus:border-neon-pink outline-none"/></div>
            <div><label className="block text-gray-400 text-xs font-bold mb-2 uppercase tracking-wider">SMTP Kullanıcı</label><input type="text" name="smtpUser" value={formData.smtpUser} onChange={handleInputChange} className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 text-sm focus:border-neon-pink outline-none"/></div>
            <div><label className="block text-gray-400 text-xs font-bold mb-2 uppercase tracking-wider">SMTP Şifre</label><input type="password" name="smtpPass" value={formData.smtpPass} onChange={handleInputChange} className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 text-sm focus:border-neon-pink outline-none"/></div>
            <div><label className="block text-gray-400 text-xs font-bold mb-2 uppercase tracking-wider">Gönderen Adı</label><input type="text" name="gonderenAdi" value={formData.gonderenAdi} onChange={handleInputChange} className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 text-sm focus:border-neon-pink outline-none"/></div>
            <div><label className="block text-gray-400 text-xs font-bold mb-2 uppercase tracking-wider">Gönderen E-posta</label><input type="email" name="gonderenEposta" value={formData.gonderenEposta} onChange={handleInputChange} className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 text-sm focus:border-neon-pink outline-none"/></div>
          </div>

          {/* Sosyal Medya Tab */}
          <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in ${activeTab === "Sosyal Medya" ? "block" : "hidden"}`}>
            <div><label className="block text-gray-400 text-xs font-bold mb-2 uppercase tracking-wider">Instagram URL</label><input type="text" name="instagram" value={formData.instagram} onChange={handleInputChange} className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 text-sm focus:border-neon-pink outline-none"/></div>
            <div><label className="block text-gray-400 text-xs font-bold mb-2 uppercase tracking-wider">Facebook URL</label><input type="text" name="facebook" value={formData.facebook} onChange={handleInputChange} className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 text-sm focus:border-neon-pink outline-none"/></div>
            <div><label className="block text-gray-400 text-xs font-bold mb-2 uppercase tracking-wider">Twitter URL</label><input type="text" name="twitter" value={formData.twitter} onChange={handleInputChange} className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 text-sm focus:border-neon-pink outline-none"/></div>
            <div><label className="block text-gray-400 text-xs font-bold mb-2 uppercase tracking-wider">YouTube URL</label><input type="text" name="youtube" value={formData.youtube} onChange={handleInputChange} className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 text-sm focus:border-neon-pink outline-none"/></div>
            <div className="md:col-span-2"><label className="block text-gray-400 text-xs font-bold mb-2 uppercase tracking-wider">WhatsApp Numara</label><input type="text" name="whatsapp" value={formData.whatsapp} onChange={handleInputChange} className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 text-sm focus:border-neon-pink outline-none"/></div>
          </div>

          {/* SEO Tab */}
          <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in ${activeTab === "SEO" ? "block" : "hidden"}`}>
            <div className="md:col-span-2"><label className="block text-gray-400 text-xs font-bold mb-2 uppercase tracking-wider">Varsayılan Meta Başlık</label><input type="text" name="metaTitle" value={formData.metaTitle} onChange={handleInputChange} className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 text-sm focus:border-neon-pink outline-none"/></div>
            <div className="md:col-span-2"><label className="block text-gray-400 text-xs font-bold mb-2 uppercase tracking-wider">Varsayılan Meta Açıklama</label><textarea name="metaDescription" value={formData.metaDescription} onChange={handleInputChange} rows={} className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 text-sm focus:border-neon-pink outline-none resize-none"/></div>
            <div><label className="block text-gray-400 text-xs font-bold mb-2 uppercase tracking-wider">Google Analytics ID</label><input type="text" name="googleAnalyticsId" value={formData.googleAnalyticsId} onChange={handleInputChange} className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 text-sm focus:border-neon-pink outline-none"/></div>
            <div><label className="block text-gray-400 text-xs font-bold mb-2 uppercase tracking-wider">Facebook Pixel ID</label><input type="text" name="facebookPixelId" value={formData.facebookPixelId} onChange={handleInputChange} className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 text-sm focus:border-neon-pink outline-none"/></div>
          </div>

          {/* Döviz Kurları Tab */}
          <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in ${activeTab === "Döviz Kurları" ? "block" : "hidden"}`}>
            <div><label className="block text-gray-400 text-xs font-bold mb-2 uppercase tracking-wider">USD/TRY Oranı</label><input type="number" step="0.0001" name="usdRate" value={formData.usdRate} onChange={handleInputChange} className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 text-sm focus:border-neon-pink outline-none"/></div>
            <div><label className="block text-gray-400 text-xs font-bold mb-2 uppercase tracking-wider">EUR/TRY Oranı</label><input type="number" step="0.0001" name="eurRate" value={formData.eurRate} onChange={handleInputChange} className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 text-sm focus:border-neon-pink outline-none"/></div>
            <div className="md:col-span-2"><label className="flex items-center gap-3 cursor-pointer"><input type="checkbox" name="autoUpdateRates" checked={formData.autoUpdateRates} onChange={handleInputChange} className="w-5 h-5 accent-neon-pink"/><span className="text-gray-300 text-sm font-bold uppercase tracking-wider">Otomatik Güncelleme Aktif (TCMB)</span></label></div>
          </div>

          {/* Gelişmiş Tab */}
          <div className={`space-y-6 animate-fade-in ${activeTab === "Gelişmiş" ? "block" : "hidden"}`}>
            <div className="p-4 border border-red-500/30 bg-red-500/5 clip-angled">
              <h3 className="text-red-500 font-bold uppercase tracking-wider mb-2">Bakım Modu</h3>
              <p className="text-gray-400 text-sm mb-4">Siteyi ziyaretçilere kapatın. Sadece adminler görebilir.</p>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" name="bakimModu" checked={formData.bakimModu} onChange={handleInputChange} className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
                <span className="ml-3 text-sm font-bold text-gray-300 uppercase">{formData.bakimModu ? "Aktif" : "Pasif"}</span>
              </label>
            </div>
            <div>
              <label className="block text-gray-400 text-xs font-bold mb-2 uppercase tracking-wider">Özel CSS Kodu</label>
              <textarea name="ozelCss" value={formData.ozelCss} onChange={handleInputChange} rows={} className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 text-sm focus:border-neon-pink outline-none transition-colors font-mono text-xs" placeholder="/* Özel CSS kodlarınızı buraya yazın */"/>
            </div>
          </div>

          <div className="pt-6 border-t border-white/10">
            <button type="submit" className="bg-neon-pink text-white font-bold py-3 px-8 uppercase tracking-widest text-sm hover:bg-white hover:text-black transition-colors clip-angled">
              Değişiklikleri Kaydet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
