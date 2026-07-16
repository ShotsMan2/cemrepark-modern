"use client";

import { useState } from "react";
import Swal from "sweetalert2";

export default function BannersManagementPage() {
  const [banners, setBanners] = useState([
    { id: 1, baslik: "Yaz Sezonu İndirimi", gorsel: "/assets/banners/summer.jpg", link: "/kategori/yaz", durum: "aktif" },
    { id: 2, baslik: "Yeni Koleksiyon", gorsel: "/assets/banners/new-collection.jpg", link: "/kategori/yeni", durum: "aktif" }
  ]);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ baslik: "", gorsel: "", link: "", durum: "aktif" });

  const handleDelete = (id) => {
    Swal.fire({
      title: "Emin misiniz?",
      text: "Bu banner silinecek!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ff007f",
      cancelButtonColor: "#333",
      confirmButtonText: "Evet, Sil!",
      background: "#1a1a1a",
      color: "#fff",
    }).then((result) => {
      if (result.isConfirmed) {
        setBanners(banners.filter(b => b.id !== id));
        Swal.fire({ title: "Silindi!", icon: "success", background: "#1a1a1a", color: "#fff", confirmButtonColor: "#ff007f" });
      }
    });
  };

  const handleSave = (e) => {
    e.preventDefault();
    setBanners([...banners, { ...formData, id: Date.now() }]);
    setIsAdding(false);
    setFormData({ baslik: "", gorsel: "", link: "", durum: "aktif" });
    Swal.fire({ title: "Eklendi!", icon: "success", background: "#1a1a1a", color: "#fff", confirmButtonColor: "#ff007f" });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-8 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-neon-pink opacity-[0.03] rounded-full blur-[150px] pointer-events-none"></div>

      <div className="flex justify-between items-center mb-8 relative z-10">
        <h1 className="text-3xl font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-neon-pink to-holo-gold">
          Banner & Slider Yönetimi
        </h1>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="bg-neon-pink text-white font-bold py-3 px-6 uppercase tracking-widest hover:bg-white hover:text-black transition-colors clip-angled"
        >
          {isAdding ? "İptal Et" : "+ Yeni Banner Ekle"}
        </button>
      </div>

      {isAdding && (
        <div className="glass-panel p-8 clip-angled mb-8 border border-white/10 bg-black/40 relative z-10">
          <h2 className="text-xl font-bold mb-6 uppercase tracking-widest border-b border-white/10 pb-4">Yeni Banner Ekle</h2>
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-400 text-sm font-bold mb-2 uppercase">Başlık</label>
                <input type="text" value={formData.baslik} onChange={e => setFormData({...formData, baslik: e.target.value})} className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 focus:border-neon-pink focus:outline-none transition-colors" required />
              </div>
              <div>
                <label className="block text-gray-400 text-sm font-bold mb-2 uppercase">Görsel URL</label>
                <input type="text" value={formData.gorsel} onChange={e => setFormData({...formData, gorsel: e.target.value})} className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 focus:border-neon-pink focus:outline-none transition-colors" required />
              </div>
              <div>
                <label className="block text-gray-400 text-sm font-bold mb-2 uppercase">Hedef Link</label>
                <input type="text" value={formData.link} onChange={e => setFormData({...formData, link: e.target.value})} className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 focus:border-neon-pink focus:outline-none transition-colors" required />
              </div>
              <div>
                <label className="block text-gray-400 text-sm font-bold mb-2 uppercase">Durum</label>
                <select value={formData.durum} onChange={e => setFormData({...formData, durum: e.target.value})} className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 focus:border-neon-pink focus:outline-none transition-colors">
                  <option value="aktif">Aktif</option>
                  <option value="pasif">Pasif</option>
                </select>
              </div>
            </div>
            <button type="submit" className="bg-holo-gold text-black font-bold py-3 px-8 uppercase tracking-widest hover:bg-white transition-colors clip-angled">
              Kaydet
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
        {banners.map(banner => (
          <div key={banner.id} className="glass-panel p-6 clip-angled border border-white/10 hover:border-neon-pink transition-colors bg-black/40 group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-neon-pink opacity-0 group-hover:opacity-10 rounded-bl-full transition-opacity"></div>
            <div className="flex flex-col gap-4">
              <div className="w-full h-40 bg-gray-800 rounded relative overflow-hidden border border-white/5">
                {/* Fallback image style for visual */}
                <div className="absolute inset-0 bg-gradient-to-br from-black/80 to-transparent flex items-center justify-center text-gray-500 font-bold tracking-widest text-sm z-10">GÖRSEL ÖNİZLEME</div>
                <img src={banner.gorsel} alt={banner.baslik} className="w-full h-full object-cover opacity-50" onError={(e) => { e.currentTarget.src = "https://via.placeholder.com/800x400?text=Banner" }} />
              </div>
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold uppercase tracking-widest text-white">{banner.baslik}</h3>
                  <span className={`text-[10px] font-bold px-2 py-1 uppercase tracking-widest ${banner.durum === 'aktif' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {banner.durum}
                  </span>
                </div>
                <p className="text-sm text-gray-400 mb-4 font-mono">{banner.link}</p>
                <div className="flex gap-4">
                  <button className="text-xs text-holo-gold uppercase tracking-widest hover:text-white font-bold transition-colors">Düzenle</button>
                  <button onClick={() => handleDelete(banner.id)} className="text-xs text-red-500 uppercase tracking-widest hover:text-white font-bold transition-colors">Sil</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
