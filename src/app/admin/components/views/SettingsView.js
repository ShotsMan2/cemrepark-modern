import { useState, useEffect } from 'react';
import Swal from "sweetalert2";
import { useStore } from "../../../../context/StoreContext";

export default function SettingsView() {
  const [activeTab, setActiveTab] = useState('Genel');
  const { settings, setSettings } = useStore();
  const [formData, setFormData] = useState({
    siteAdi: "",
    iletisimEposta: "",
    destekTelefonu: "",
    adres: "",
    kargoUcreti: 0,
    ucretsizKargoLimiti: 0,
    ayniGunTeslimat: false,
    bakimModu: false,
    ozelCss: ""
  });

  useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        kargoUcreti: parseFloat(formData.kargoUcreti) || 0,
        ucretsizKargoLimiti: parseFloat(formData.ucretsizKargoLimiti) || 0
      };
      
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        setSettings(payload);
        Swal.fire({
          icon: 'success',
          title: 'Kaydedildi',
          text: 'Ayarlar başarıyla güncellendi.',
          background: '#1a1a1a',
          color: '#fff',
          confirmButtonColor: '#ff007f'
        });
      } else {
        Swal.fire("Hata", "Ayarlar kaydedilemedi.", "error");
      }
    } catch (error) {
      console.error("Ayarlar kaydedilirken hata:", error);
      Swal.fire("Hata", "Bir hata oluştu.", "error");
    }
  };

  return (
    <div className="animate-fade-in max-w-4xl">
      <div className="glass-panel p-6 clip-angled mb-8">
        <h2 className="text-xl font-bold text-white uppercase tracking-wider">Mağaza Ayarları</h2>
        <p className="text-gray-400 text-sm mt-1">Sitenizin genel bilgilerini ve işleyiş kurallarını yapılandırın.</p>
      </div>

      <div className="flex gap-4 mb-6 overflow-x-auto pb-2 custom-scrollbar">
        {['Genel', 'Kargo & Teslimat', 'Gelişmiş'].map(tab => (
          <button 
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 uppercase tracking-widest text-xs font-bold whitespace-nowrap transition-colors border-b-2 ${activeTab === tab ? 'text-neon-pink border-neon-pink' : 'text-gray-500 border-transparent hover:text-white'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="glass-panel p-8 clip-angled min-h-[400px]">
        <form onSubmit={handleSave} className="space-y-6 h-full flex flex-col justify-between">
          
          {activeTab === 'Genel' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
              <div>
                <label className="block text-gray-400 text-xs font-bold mb-2 uppercase tracking-wider">Site Adı</label>
                <input 
                  type="text" 
                  name="siteAdi"
                  value={formData.siteAdi || ''}
                  onChange={handleInputChange}
                  className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 text-sm focus:border-neon-pink outline-none transition-colors" 
                />
              </div>
              <div>
                <label className="block text-gray-400 text-xs font-bold mb-2 uppercase tracking-wider">İletişim E-posta</label>
                <input 
                  type="email" 
                  name="iletisimEposta"
                  value={formData.iletisimEposta || ''}
                  onChange={handleInputChange}
                  className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 text-sm focus:border-neon-pink outline-none transition-colors" 
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-gray-400 text-xs font-bold mb-2 uppercase tracking-wider">Destek Telefonu</label>
                <input 
                  type="text" 
                  name="destekTelefonu"
                  value={formData.destekTelefonu || ''}
                  onChange={handleInputChange}
                  className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 text-sm focus:border-neon-pink outline-none transition-colors" 
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-gray-400 text-xs font-bold mb-2 uppercase tracking-wider">Adres</label>
                <textarea 
                  name="adres"
                  value={formData.adres || ''}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 text-sm focus:border-neon-pink outline-none transition-colors resize-none"
                />
              </div>
            </div>
          )}

          {activeTab === 'Kargo & Teslimat' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
              <div>
                <label className="block text-gray-400 text-xs font-bold mb-2 uppercase tracking-wider">Kargo Ücreti (TL)</label>
                <input 
                  type="number" 
                  name="kargoUcreti"
                  value={formData.kargoUcreti ?? ''}
                  onChange={handleInputChange}
                  step="0.01"
                  className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 text-sm focus:border-neon-pink outline-none transition-colors" 
                />
              </div>
              <div>
                <label className="block text-gray-400 text-xs font-bold mb-2 uppercase tracking-wider">Ücretsiz Kargo Limiti (TL)</label>
                <input 
                  type="number" 
                  name="ucretsizKargoLimiti"
                  value={formData.ucretsizKargoLimiti ?? ''}
                  onChange={handleInputChange}
                  className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 text-sm focus:border-neon-pink outline-none transition-colors" 
                />
              </div>
              <div className="md:col-span-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input 
                    type="checkbox" 
                    name="ayniGunTeslimat"
                    checked={!!formData.ayniGunTeslimat}
                    onChange={handleInputChange}
                    className="w-5 h-5 accent-neon-pink" 
                  />
                  <span className="text-gray-300 text-sm font-bold uppercase tracking-wider">Aynı Gün Teslimat Seçeneğini Aktif Et (Sadece İstanbul)</span>
                </label>
              </div>
            </div>
          )}

          {activeTab === 'Gelişmiş' && (
            <div className="space-y-6 animate-fade-in">
              <div className="p-4 border border-red-500/30 bg-red-500/5 clip-angled">
                <h3 className="text-red-500 font-bold uppercase tracking-wider mb-2">Bakım Modu</h3>
                <p className="text-gray-400 text-sm mb-4">Siteyi ziyaretçilere kapatın. Sadece adminler görebilir.</p>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    name="bakimModu"
                    checked={!!formData.bakimModu}
                    onChange={handleInputChange}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
                  <span className="ml-3 text-sm font-bold text-gray-300 uppercase">
                    {formData.bakimModu ? 'Aktif' : 'Pasif'}
                  </span>
                </label>
              </div>
              
              <div>
                <label className="block text-gray-400 text-xs font-bold mb-2 uppercase tracking-wider">Özel CSS Kodu</label>
                <textarea 
                  name="ozelCss"
                  value={formData.ozelCss || ''}
                  onChange={handleInputChange}
                  rows="4" 
                  className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 text-sm focus:border-neon-pink outline-none transition-colors font-mono text-xs" 
                  placeholder="/* Özel CSS kodlarınızı buraya yazın */"
                />
              </div>
            </div>
          )}

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
