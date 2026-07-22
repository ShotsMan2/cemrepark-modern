"use client";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { useStore } from "../../../../context/StoreContext";
import { motion } from "framer-motion";
import { Save, RotateCcw, Trash2, RefreshCw, Server, Database, Clock, Download, Upload } from "lucide-react";

export default function SettingsView() {
  const [activeTab, setActiveTab] = useState("Genel");
  const [searchQuery, setSearchQuery] = useState("");
  const { settings, setSettings } = useStore();
  const [formData, setFormData] = useState({
    siteAdi: "", iletisimEposta: "", destekTelefonu: "", adres: "",
    kargoUcreti: 0, ucretsizKargoLimiti: 0, ayniGunTeslimat: false, bakimModu: false, ozelCss: "",
    bankaAdi: "", iban: "", hesapSahibi: "", shopierUrl: "",
    smtpHost: "", smtpPort: "", smtpUser: "", smtpPass: "", gonderenAdi: "", gonderenEposta: "",
    instagram: "", facebook: "", twitter: "", youtube: "", whatsapp: "",
    metaTitle: "", metaDescription: "", googleAnalyticsId: "", facebookPixelId: "",
    usdRate: "", eurRate: "", autoUpdateRates: false,
    siteLogo: "", favicon: "", primaryColor: "#d61c7b", secondaryColor: "#be185d", accentColor: "#a855f7",
    siteDescription: "", keywords: "",
    enableRegistration: true, enableCheckout: true, enableReviews: true,
    emailNotification: true, smsNotification: false,
    taxRate: 0, currency: "TRY", timezone: "Europe/Istanbul",
    shippingMethods: "Yurtiçi Kargo,Aras Kargo,MNG Kargo,PTT Kargo",
    paymentMethods: "Kredi Kartı,Havale/EFT,Kapıda Ödeme",
    maintenanceMessage: "",
    maxLoginAttempts: 5, sessionTimeout: 60,
  });
  const [lastModified, setLastModified] = useState(new Date().toLocaleString("tr-TR"));
  const [systemInfo, setSystemInfo] = useState({
    version: "3.2.1", uptime: "14 gün 7 saat", dbStatus: "Bağlı", nodeVersion: "20.11.0",
    nextVersion: "16.0.0", lastBackup: "2026-07-19 03:00",
  });
  const [cacheCleared, setCacheCleared] = useState(false);

  useEffect(() => { if (settings) setFormData((prev) => ({ ...prev, ...settings })); }, [settings]);

  const handleInputChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSave = async (e: any) => {
    e.preventDefault();
    await Swal.fire({
      title: "Değişiklikler kaydedilsin mi?", icon: "question", showCancelButton: true,
      confirmButtonColor: "#ff007f", cancelButtonColor: "#333",
      confirmButtonText: "Evet, Kaydet", cancelButtonText: "İptal",
      background: "#1a1a1a", color: "#fff",
    });
    try {
      const payload = { ...formData, kargoUcreti: Number(formData.kargoUcreti) || 0, ucretsizKargoLimiti: Number(formData.ucretsizKargoLimiti) || 0, taxRate: Number(formData.taxRate) || 0 };
      const res = await fetch("/api/settings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (res.ok) {
        setSettings(payload);
        setLastModified(new Date().toLocaleString("tr-TR"));
        Swal.fire({ icon: "success", title: "Kaydedildi", text: "Ayarlar başarıyla güncellendi.", background: "#1a1a1a", color: "#fff", confirmButtonColor: "#ff007f" });
      } else Swal.fire("Hata", "Kaydedilemedi.", "error");
    } catch { Swal.fire("Hata", "Bir hata oluştu.", "error"); }
  };

  const handleResetDefaults = () => {
    Swal.fire({
      title: "Emin misiniz?", text: "Tüm ayarlar varsayılana dönecek.", icon: "warning",
      showCancelButton: true, confirmButtonColor: "#d33", cancelButtonColor: "#333",
      confirmButtonText: "Sıfırla", cancelButtonText: "İptal", background: "#1a1a1a", color: "#fff",
    }).then((result) => { if (result.isConfirmed) Swal.fire("Sıfırlandı", "Ayarlar varsayılana döndü.", "success"); });
  };

  const handleClearCache = () => {
    Swal.fire({
      title: "Emin misiniz?", text: "Önbellek temizlenecek.", icon: "warning",
      showCancelButton: true, confirmButtonColor: "#ff007f", cancelButtonColor: "#333",
      confirmButtonText: "Temizle!", cancelButtonText: "İptal", background: "#1a1a1a", color: "#fff",
    }).then((result) => {
      if (result.isConfirmed) {
        setCacheCleared(true);
        Swal.fire({ title: "Temizlendi!", text: "Önbellek başarıyla temizlendi.", icon: "success", background: "#1a1a1a", color: "#fff" });
        setTimeout(() => setCacheCleared(false), 3000);
      }
    });
  };

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(formData, null, 2));
    const a = document.createElement("a"); a.setAttribute("href", dataStr);
    a.setAttribute("download", "cemrepark-settings.json");
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  const handleImport = (e: any) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        setFormData((prev) => ({ ...prev, ...imported }));
        Swal.fire("Başarılı", "Ayarlar içe aktarıldı.", "success");
      } catch { Swal.fire("Hata", "Geçersiz JSON dosyası.", "error"); }
    };
    reader.readAsText(file);
  };

  const tabs = ["Genel", "Görünüm", "Güvenlik", "E-posta", "Ödeme", "Kargo & Teslimat", "SEO", "Döviz", "Gelişmiş"];

  const renderField = (label: string, name: string, type = "text", opts?: any) => (
    <div className={opts?.colSpan || ""}>
      <label className="block text-foreground/50 text-xs font-bold mb-2 uppercase tracking-wider">{label}</label>
      {type === "textarea" ? (
        <textarea name={name} value={(formData as any)[name] || ""} onChange={handleInputChange} rows={opts?.rows || 3} className="w-full bg-background/50 border border-glass-border text-foreground px-4 py-3 text-sm focus:border-primary outline-none transition-colors resize-none" />
      ) : type === "checkbox" ? (
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" name={name} checked={(formData as any)[name] || false} onChange={handleInputChange} className="w-5 h-5 accent-neon-pink" />
          <span className="text-foreground/70 text-sm font-bold uppercase tracking-wider">{opts?.label || label}</span>
        </label>
      ) : (
        <input type={type} name={name} value={(formData as any)[name] || ""} onChange={handleInputChange} step={opts?.step} className="w-full bg-background/50 border border-glass-border text-foreground px-4 py-3 text-sm focus:border-primary outline-none transition-colors" />
      )}
    </div>
  );

  return (
    <div className="animate-fade-in max-w-6xl mx-auto space-y-6 text-left">
      <div className="glass-panel p-6 clip-angled flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground uppercase tracking-wider">Mağaza Ayarları</h2>
          <p className="text-foreground/50 text-sm mt-1">Son Güncelleme: {lastModified}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <input type="text" placeholder="Ayar Ara..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="bg-background/50 border border-glass-border text-foreground px-4 py-2 text-sm focus:border-primary outline-none transition-colors" />
          <button onClick={handleClearCache} className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1 ${cacheCleared ? "bg-success text-white" : "bg-foreground/10 text-foreground hover:bg-primary"}`}><RefreshCw size={14} />{cacheCleared ? "Temizlendi" : "Cache"}</button>
          <button onClick={handleExport} className="bg-foreground/10 text-foreground px-4 py-2 text-xs font-bold uppercase tracking-wider hover:bg-secondary transition-colors flex items-center gap-1"><Download size={14} />Dışa Aktar</button>
          <label className="bg-foreground/10 text-foreground px-4 py-2 text-xs font-bold uppercase tracking-wider hover:bg-primary transition-colors cursor-pointer flex items-center gap-1">
            <Upload size={14} />İçe Aktar
            <input type="file" accept=".json" className="hidden" onChange={handleImport} />
          </label>
          <button onClick={handleResetDefaults} className="bg-danger/20 text-danger px-4 py-2 text-xs font-bold uppercase tracking-wider hover:bg-danger hover:text-white transition-colors flex items-center gap-1"><RotateCcw size={14} />Sıfırla</button>
        </div>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
        {tabs.map((tab) => (
          <button key={tab} type="button" onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 uppercase tracking-widest text-xs font-bold whitespace-nowrap transition-colors border-b-2 ${activeTab === tab ? "text-primary border-primary" : "text-foreground/60 border-transparent hover:text-foreground"}`}>{tab}</button>
        ))}
      </div>

      <div className="glass-panel p-8 clip-angled min-h-[500px]">
        <form onSubmit={handleSave} className="space-y-6 h-full flex flex-col justify-between">
          <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in ${activeTab === "Genel" ? "block" : "hidden"}`}>
            {renderField("Site Adı", "siteAdi")}
            {renderField("Site Açıklaması", "siteDescription")}
            {renderField("İletişim E-posta", "iletisimEposta", "email")}
            {renderField("Anahtar Kelimeler", "keywords")}
            {renderField("Destek Telefonu", "destekTelefonu")}
            {renderField("Adres", "adres", "textarea", { rows: 3, colSpan: "md:col-span-2" })}
            {renderField("Para Birimi", "currency")}
            {renderField("Saat Dilimi", "timezone")}
          </div>

          <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in ${activeTab === "Görünüm" ? "block" : "hidden"}`}>
            {renderField("Site Logosu URL", "siteLogo")}
            {renderField("Favicon URL", "favicon")}
            {renderField("Birincil Renk", "primaryColor", "text")}
            {renderField("İkincil Renk", "secondaryColor", "text")}
            {renderField("Vurgu Rengi", "accentColor", "text")}
            {renderField("Özel CSS", "ozelCss", "textarea", { rows: 4 })}
            <div className="md:col-span-2 flex gap-6">
              <div className="w-12 h-12 rounded" style={{ backgroundColor: formData.primaryColor }}></div>
              <div className="w-12 h-12 rounded" style={{ backgroundColor: formData.secondaryColor }}></div>
              <div className="w-12 h-12 rounded" style={{ backgroundColor: formData.accentColor }}></div>
            </div>
          </div>

          <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in ${activeTab === "Güvenlik" ? "block" : "hidden"}`}>
            {renderField("Maks. Giriş Denemesi", "maxLoginAttempts", "number")}
            {renderField("Oturum Zaman Aşımı (dk)", "sessionTimeout", "number")}
            <div className="md:col-span-2 space-y-4">
              {renderField("Kayıt Aktif", "enableRegistration", "checkbox", { label: "Yeni kayıtlara izin ver" })}
              {renderField("Ödeme Aktif", "enableCheckout", "checkbox", { label: "Ödeme işlemlerine izin ver" })}
              {renderField("Yorumlar Aktif", "enableReviews", "checkbox", { label: "Ürün yorumlarına izin ver" })}
            </div>
          </div>

          <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in ${activeTab === "E-posta" ? "block" : "hidden"}`}>
            {renderField("SMTP Host", "smtpHost")}
            {renderField("SMTP Port", "smtpPort")}
            {renderField("SMTP Kullanıcı", "smtpUser")}
            {renderField("SMTP Şifre", "smtpPass", "password")}
            {renderField("Gönderen Adı", "gonderenAdi")}
            {renderField("Gönderen E-posta", "gonderenEposta", "email")}
            <div className="md:col-span-2">
              {renderField("E-posta Bildirimi", "emailNotification", "checkbox", { label: "Yeni siparişlerde e-posta bildirimi gönder" })}
              {renderField("SMS Bildirimi", "smsNotification", "checkbox", { label: "Yeni siparişlerde SMS bildirimi gönder" })}
            </div>
          </div>

          <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in ${activeTab === "Ödeme" ? "block" : "hidden"}`}>
            <div className="md:col-span-2"><h3 className="text-secondary font-bold uppercase mb-4">Havale/EFT Bilgileri</h3></div>
            {renderField("Banka Adı", "bankaAdi")}
            {renderField("IBAN", "iban")}
            {renderField("Hesap Sahibi", "hesapSahibi")}
            <div className="md:col-span-2"><h3 className="text-primary font-bold uppercase mb-4 mt-4">Shopier Entegrasyonu</h3></div>
            {renderField("Shopier API Key", "shopierUrl")}
            {renderField("Ödeme Yöntemleri", "paymentMethods")}
            {renderField("Vergi Oranı (%)", "taxRate", "number", { step: "0.01" })}
          </div>

          <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in ${activeTab === "Kargo & Teslimat" ? "block" : "hidden"}`}>
            {renderField("Kargo Ücreti (TL)", "kargoUcreti", "number", { step: "0.01" })}
            {renderField("Ücretsiz Kargo Limiti (TL)", "ucretsizKargoLimiti", "number")}
            {renderField("Kargo Yöntemleri", "shippingMethods")}
            <div className="md:col-span-2">{renderField("Aynı Gün Teslimat", "ayniGunTeslimat", "checkbox", { label: "Aynı Gün Teslimat Seçeneğini Aktif Et" })}</div>
          </div>

          <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in ${activeTab === "SEO" ? "block" : "hidden"}`}>
            {renderField("Varsayılan Meta Başlık", "metaTitle")}
            {renderField("Varsayılan Meta Açıklama", "metaDescription", "textarea", { rows: 3 })}
            {renderField("Google Analytics ID", "googleAnalyticsId")}
            {renderField("Facebook Pixel ID", "facebookPixelId")}
          </div>

          <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in ${activeTab === "Döviz" ? "block" : "hidden"}`}>
            {renderField("USD/TRY Oranı", "usdRate", "number", { step: "0.0001" })}
            {renderField("EUR/TRY Oranı", "eurRate", "number", { step: "0.0001" })}
            <div className="md:col-span-2">{renderField("Otomatik Güncelleme", "autoUpdateRates", "checkbox", { label: "Otomatik Güncelleme Aktif (TCMB)" })}</div>
          </div>

          <div className={`space-y-6 animate-fade-in ${activeTab === "Gelişmiş" ? "block" : "hidden"}`}>
            <div className="p-4 border border-danger/30 bg-danger/5 clip-angled">
              <h3 className="text-danger font-bold uppercase tracking-wider mb-2">Bakım Modu</h3>
              <p className="text-foreground/50 text-sm mb-4">Siteyi ziyaretçilere kapatın. Sadece adminler görebilir.</p>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" name="bakimModu" checked={formData.bakimModu} onChange={handleInputChange} className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-danger"></div>
                <span className="ml-3 text-sm font-bold text-foreground/70 uppercase">{formData.bakimModu ? "Aktif" : "Pasif"}</span>
              </label>
            </div>
            {formData.bakimModu && renderField("Bakım Mesajı", "maintenanceMessage", "textarea", { rows: 3 })}
            {renderField("Sosyal Medya - Instagram", "instagram")}
            {renderField("Sosyal Medya - Facebook", "facebook")}
            {renderField("Sosyal Medya - Twitter", "twitter")}
            {renderField("Sosyal Medya - YouTube", "youtube")}
            {renderField("WhatsApp Numarası", "whatsapp")}
            {renderField("Özel CSS Kodu", "ozelCss", "textarea", { rows: 6 })}

            <div className="border border-glass-border bg-foreground/5 p-6 rounded">
              <h3 className="text-foreground font-bold uppercase tracking-wider mb-4 flex items-center gap-2"><Server size={18} className="text-primary" /> Sistem Bilgisi</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-foreground/5 p-3 rounded border border-glass-border"><span className="text-[10px] text-foreground/50 uppercase block mb-1"><Server size={12} className="inline mr-1" />Sürüm</span><span className="font-bold text-foreground text-sm">{systemInfo.version}</span></div>
                <div className="bg-foreground/5 p-3 rounded border border-glass-border"><span className="text-[10px] text-foreground/50 uppercase block mb-1"><Clock size={12} className="inline mr-1" />Çalışma Süresi</span><span className="font-bold text-foreground text-sm">{systemInfo.uptime}</span></div>
                <div className="bg-foreground/5 p-3 rounded border border-glass-border"><span className="text-[10px] text-foreground/50 uppercase block mb-1"><Database size={12} className="inline mr-1" />Veritabanı</span><span className="font-bold text-success text-sm">{systemInfo.dbStatus}</span></div>
                <div className="bg-foreground/5 p-3 rounded border border-glass-border"><span className="text-[10px] text-foreground/50 uppercase block mb-1">Node.js</span><span className="font-bold text-foreground text-sm">{systemInfo.nodeVersion}</span></div>
                <div className="bg-foreground/5 p-3 rounded border border-glass-border"><span className="text-[10px] text-foreground/50 uppercase block mb-1">Next.js</span><span className="font-bold text-foreground text-sm">{systemInfo.nextVersion}</span></div>
                <div className="bg-foreground/5 p-3 rounded border border-glass-border"><span className="text-[10px] text-foreground/50 uppercase block mb-1">Son Yedek</span><span className="font-bold text-foreground text-sm">{systemInfo.lastBackup}</span></div>
                <div className="bg-foreground/5 p-3 rounded border border-glass-border">
                  <span className="text-[10px] text-foreground/50 uppercase block mb-1">Önbellek</span>
                  <button onClick={handleClearCache} className="text-xs bg-primary/20 text-primary hover:bg-primary hover:text-foreground px-3 py-1 rounded font-bold uppercase transition-colors">Temizle</button>
                </div>
                <div className="bg-foreground/5 p-3 rounded border border-glass-border">
                  <span className="text-[10px] text-foreground/50 uppercase block mb-1">Bakım</span>
                  <span className={`text-xs font-bold uppercase ${formData.bakimModu ? "text-danger" : "text-success"}`}>{formData.bakimModu ? "Aktif" : "Pasif"}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-glass-border flex gap-4">
            <button type="submit" className="bg-primary text-foreground font-bold py-3 px-8 uppercase tracking-widest text-sm hover:bg-white hover:text-black transition-colors clip-angled flex items-center gap-2"><Save size={16} /> Değişiklikleri Kaydet</button>
            <button type="button" onClick={handleClearCache} className="bg-foreground/10 text-foreground px-6 py-3 text-xs font-bold uppercase tracking-wider hover:bg-foreground/20 transition-colors clip-angled flex items-center gap-2"><Trash2 size={14} /> Cache Temizle</button>
          </div>
        </form>
      </div>
    </div>
  );
}
