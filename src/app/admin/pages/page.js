"use client";

import { useState } from "react";
import Swal from "sweetalert2";

export default function PagesManagementPage() {
  const [pages, setPages] = useState([
    { id: 1, baslik: "Hakkımızda", slug: "hakkimizda", sonGuncelleme: "2024-03-01", durum: "yayında" },
    { id: 2, baslik: "Gizlilik Politikası", slug: "gizlilik-politikasi", sonGuncelleme: "2024-03-10", durum: "yayında" },
    { id: 3, baslik: "İade Koşulları", slug: "iade-kosullari", sonGuncelleme: "2024-03-15", durum: "taslak" }
  ]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentEdit, setCurrentEdit] = useState(null);

  const handleEdit = (page) => {
    setCurrentEdit(page);
    setIsEditing(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    setPages(pages.map(p => p.id === currentEdit.id ? { ...currentEdit, sonGuncelleme: new Date().toISOString().split('T')[0] } : p));
    setIsEditing(false);
    setCurrentEdit(null);
    Swal.fire({ title: "Başarılı!", text: "Sayfa güncellendi.", icon: "success", background: "#1a1a1a", color: "#fff", confirmButtonColor: "#ff007f" });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-8 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-holo-gold opacity-[0.03] rounded-full blur-[150px] pointer-events-none"></div>

      <div className="flex justify-between items-center mb-8 relative z-10">
        <h1 className="text-3xl font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-holo-gold to-neon-pink">
          Sayfa Yönetimi
        </h1>
        <button 
          onClick={() => { setCurrentEdit({id: Date.now(), baslik: '', slug: '', durum: 'taslak'}); setIsEditing(true); }}
          className="bg-holo-gold text-black font-bold py-3 px-6 uppercase tracking-widest hover:bg-white transition-colors clip-angled"
        >
          {isEditing && currentEdit?.baslik === '' ? "İptal Et" : "+ Yeni Sayfa"}
        </button>
      </div>

      {isEditing && (
        <div className="glass-panel p-8 clip-angled mb-8 border border-holo-gold/30 bg-black/60 relative z-10 animate-fade-in">
          <h2 className="text-xl font-bold mb-6 uppercase tracking-widest border-b border-white/10 pb-4">
            {currentEdit.baslik ? "Sayfayı Düzenle" : "Yeni Sayfa Oluştur"}
          </h2>
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-400 text-sm font-bold mb-2 uppercase">Sayfa Başlığı</label>
                <input type="text" value={currentEdit.baslik} onChange={e => setCurrentEdit({...currentEdit, baslik: e.target.value})} className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 focus:border-holo-gold focus:outline-none transition-colors" required />
              </div>
              <div>
                <label className="block text-gray-400 text-sm font-bold mb-2 uppercase">URL Slug (Kalıcı Bağlantı)</label>
                <input type="text" value={currentEdit.slug} onChange={e => setCurrentEdit({...currentEdit, slug: e.target.value})} className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 focus:border-holo-gold focus:outline-none transition-colors" required />
              </div>
              <div className="md:col-span-2">
                <label className="block text-gray-400 text-sm font-bold mb-2 uppercase">Sayfa İçeriği</label>
                <textarea rows={6} className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 focus:border-holo-gold focus:outline-none transition-colors custom-scrollbar" placeholder="HTML veya zengin metin içeriği..." required></textarea>
              </div>
              <div>
                <label className="block text-gray-400 text-sm font-bold mb-2 uppercase">Durum</label>
                <select value={currentEdit.durum} onChange={e => setCurrentEdit({...currentEdit, durum: e.target.value})} className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 focus:border-holo-gold focus:outline-none transition-colors">
                  <option value="yayında">Yayında</option>
                  <option value="taslak">Taslak</option>
                </select>
              </div>
            </div>
            <div className="flex gap-4 pt-4">
              <button type="submit" className="bg-neon-pink text-white font-bold py-3 px-8 uppercase tracking-widest hover:bg-white hover:text-black transition-colors clip-angled">
                Kaydet
              </button>
              <button type="button" onClick={() => setIsEditing(false)} className="bg-transparent border border-white/20 text-white font-bold py-3 px-8 uppercase tracking-widest hover:border-white transition-colors clip-angled">
                İptal
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="glass-panel clip-angled border border-white/10 relative z-10 bg-black/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Başlık</th>
                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-widest">URL Slug</th>
                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Son Güncelleme</th>
                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Durum</th>
                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {pages.map((page) => (
                <tr key={page.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="p-4 font-bold text-white">{page.baslik}</td>
                  <td className="p-4 text-gray-400 font-mono text-sm">/{page.slug}</td>
                  <td className="p-4 text-gray-400 text-sm">{page.sonGuncelleme}</td>
                  <td className="p-4">
                    <span className={`text-[10px] font-bold px-2 py-1 uppercase tracking-widest ${page.durum === 'yayında' ? 'bg-green-500/20 text-green-400' : 'bg-orange-500/20 text-orange-400'}`}>
                      {page.durum}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-4">
                    <button onClick={() => handleEdit(page)} className="text-xs font-bold text-holo-gold uppercase tracking-widest hover:text-white transition-colors">
                      Düzenle
                    </button>
                    <button onClick={() => setPages(pages.filter(p => p.id !== page.id))} className="text-xs font-bold text-red-500 uppercase tracking-widest hover:text-white transition-colors">
                      Sil
                    </button>
                  </td>
                </tr>
              ))}
              {pages.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-500 uppercase tracking-widest text-sm">
                    Kayıtlı sayfa bulunamadı.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
