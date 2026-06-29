import Swal from "sweetalert2";

export default function SettingsView() {
  const handleSave = (e) => {
    e.preventDefault();
    Swal.fire({
      icon: 'success',
      title: 'Kaydedildi',
      text: 'Ayarlar başarıyla güncellendi.',
      background: '#1a1a1a',
      color: '#fff',
      confirmButtonColor: '#ff007f'
    });
  };

  return (
    <div className="animate-fade-in max-w-4xl">
      <div className="glass-panel p-6 clip-angled mb-8">
        <h2 className="text-xl font-bold text-white uppercase tracking-wider">Mağaza Ayarları</h2>
        <p className="text-gray-400 text-sm mt-1">Sitenizin genel bilgilerini ve işleyiş kurallarını yapılandırın (Demo).</p>
      </div>

      <div className="glass-panel p-8 clip-angled">
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-400 text-xs font-bold mb-2 uppercase tracking-wider">Site Adı</label>
              <input type="text" defaultValue="Cemre Park" className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 text-sm focus:border-neon-pink outline-none transition-colors" />
            </div>
            <div>
              <label className="block text-gray-400 text-xs font-bold mb-2 uppercase tracking-wider">İletişim E-posta</label>
              <input type="email" defaultValue="info@cemrepark.com" className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 text-sm focus:border-neon-pink outline-none transition-colors" />
            </div>
            <div>
              <label className="block text-gray-400 text-xs font-bold mb-2 uppercase tracking-wider">Destek Telefonu</label>
              <input type="text" defaultValue="0555 555 55 55" className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 text-sm focus:border-neon-pink outline-none transition-colors" />
            </div>
            <div>
              <label className="block text-gray-400 text-xs font-bold mb-2 uppercase tracking-wider">Kargo Ücreti (TL)</label>
              <input type="number" defaultValue="49.90" className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 text-sm focus:border-neon-pink outline-none transition-colors" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-gray-400 text-xs font-bold mb-2 uppercase tracking-wider">Ücretsiz Kargo Limiti (TL)</label>
              <input type="number" defaultValue="1500" className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 text-sm focus:border-neon-pink outline-none transition-colors" />
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
