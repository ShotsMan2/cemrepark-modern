"use client";

import { useState, useEffect } from "react";
import Swal from "sweetalert2";

export default function PagesView() {
  const [pages, setPages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [formData, setFormData] = useState({ 
    title: "", slug: "", content: "", 
    status: "published", metaTitle: "", metaDescription: "", ogImage: "" 
  });
  const [editingId, setEditingId] = useState(null);

  const fetchPages = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/pages");
      if (res.ok) {
        const data = await res.json();
        setPages(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if(name === "status") {
       setFormData(prev => ({...prev, status: checked ? "published" : "draft"}));
    } else {
       setFormData((prev) => ({ ...prev, [name]: value }));
    }
    
    // Auto-slug generation if title is typed and slug is empty or we are not editing
    if(name === "title" && !editingId) {
       setFormData(prev => ({...prev, slug: value.toLowerCase().replace(/ /g, '-').replace(/[^a-z0-9-]/g, '')}));
    }
  };

  const handleApplyTemplate = (e) => {
    const template = e.target.value;
    if(!template) return;
    
    let content = "";
    if(template === "hakkimizda") {
       content = `<h1>Hakkımızda</h1>\n<p>Cemre Park, 2010 yılından bu yana kaliteli hizmet sunmaktadır...</p>\n<h2>Misyonumuz</h2>\n<p>Müşterilerimize en iyi ürünleri sunmak.</p>`;
    } else if (template === "gizlilik") {
       content = `<h1>Gizlilik Politikası</h1>\n<p>Kişisel verileriniz bizim için önemlidir. Bu politikada...</p>`;
    } else if (template === "iletisim") {
       content = `<h1>İletişim</h1>\n<p>Adres: ...</p>\n<p>Telefon: ...</p>`;
    }
    
    setFormData(prev => ({...prev, content}));
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingId ? `/api/pages/${editingId}` : "/api/pages";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        Swal.fire(
          "Başarılı",
          `Sayfa başarıyla ${editingId ? "güncellendi" : "eklendi"}.`,
          "success"
        );
        cancelEdit();
        fetchPages();
      } else {
        const data = await res.json();
        Swal.fire("Hata", data.error || "İşlem başarısız oldu.", "error");
      }
    } catch (error) {
      Swal.fire("Hata", "Bir hata oluştu.", "error");
    }
  };

  const handleEdit = (page) => {
    setEditingId(page.id);
    setFormData({ 
      title: page.title || "", 
      slug: page.slug || "", 
      content: page.content || "",
      status: page.status || "published",
      metaTitle: page.metaTitle || "",
      metaDescription: page.metaDescription || "",
      ogImage: page.ogImage || ""
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "Emin misiniz?",
      text: "Bu sayfayı silmek istediğinize emin misiniz?",
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
          const res = await fetch(`/api/pages/${id}`, { method: "DELETE" });
          if (res.ok) {
            Swal.fire("Silindi!", "Sayfa sistemden kaldırıldı.", "success");
            fetchPages();
          }
        } catch (error) {
          Swal.fire("Hata", "Silme işlemi başarısız.", "error");
        }
      }
    });
  };

  const cancelEdit = () => {
    setFormData({ title: "", slug: "", content: "", status: "published", metaTitle: "", metaDescription: "", ogImage: "" });
    setEditingId(null);
  };
  
  const handlePreview = () => {
      // Mock preview
      Swal.fire({
          title: formData.title || 'Önizleme',
          html: `<div style="text-align:left; color:#fff;">${formData.content || 'İçerik yok'}</div>`,
          width: 800,
          background: '#1a1a1a',
          color: '#fff',
          confirmButtonColor: '#ff007f',
          confirmButtonText: 'Kapat'
      })
  }

  // Calculate rich text hints
  const charCount = formData.content.length;
  const wordCount = formData.content.trim() === "" ? 0 : formData.content.trim().split(/\s+/).length;

  return (
    <div className="space-y-8 animate-fade-in text-left">
      <div className="glass-panel p-8 clip-angled border border-white/5 relative overflow-hidden">
        <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-white uppercase tracking-wider flex items-center gap-3">
              <span className="w-8 h-8 bg-neon-pink/20 text-neon-pink flex items-center justify-center clip-angled">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
              </span>
              {editingId ? "Sayfayı Düzenle" : "Yeni Sayfa Ekle"}
            </h3>
            
            {!editingId && (
                <select onChange={handleApplyTemplate} className="bg-white/10 text-white px-4 py-2 text-xs font-bold uppercase tracking-wider outline-none cursor-pointer">
                    <option value="">Şablon Seç...</option>
                    <option value="hakkimizda">Hakkımızda Şablonu</option>
                    <option value="gizlilik">Gizlilik Politikası</option>
                    <option value="iletisim">İletişim Şablonu</option>
                </select>
            )}
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-xs font-bold mb-1 uppercase tracking-wider">Sayfa Başlığı *</label>
                  <input type="text" name="title" required value={formData.title} onChange={handleInputChange} className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 text-sm focus:border-neon-pink outline-none transition-colors" placeholder="Örn: Hakkımızda"/>
                </div>
                <div>
                  <label className="block text-gray-400 text-xs font-bold mb-1 uppercase tracking-wider">URL Slug *</label>
                  <input type="text" name="slug" required value={formData.slug} onChange={handleInputChange} className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 text-sm focus:border-neon-pink outline-none transition-colors" placeholder="Örn: hakkimizda"/>
                </div>
            </div>

            <div className="flex flex-col relative">
              <label className="block text-gray-400 text-xs font-bold mb-1 uppercase tracking-wider">İçerik</label>
              <textarea name="content" value={formData.content} onChange={handleInputChange} className="w-full h-[250px] bg-black/50 border border-white/10 text-white px-4 py-3 text-sm focus:border-neon-pink outline-none transition-colors resize-none font-mono" placeholder="HTML veya düz metin içeriği buraya yazın..."/>
              <div className="absolute bottom-2 right-2 flex gap-4 text-xs text-gray-500 font-mono bg-black/80 px-2 py-1 rounded">
                  <span>{wordCount} kelime</span>
                  <span>{charCount} karakter</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white/5 p-4 clip-angled border border-white/10 space-y-4">
                <h4 className="text-holo-gold font-bold uppercase text-xs tracking-wider border-b border-white/10 pb-2">Sayfa Ayarları</h4>
                
                <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" name="status" checked={formData.status === "published"} onChange={handleInputChange} className="w-5 h-5 accent-neon-pink"/>
                    <span className="text-gray-300 text-sm font-bold uppercase tracking-wider">Yayında</span>
                </label>

                <div>
                    <label className="block text-gray-400 text-[10px] font-bold mb-1 uppercase tracking-wider">SEO Title</label>
                    <input type="text" name="metaTitle" value={formData.metaTitle} onChange={handleInputChange} className="w-full bg-black/50 border border-white/10 text-white px-3 py-2 text-xs focus:border-holo-gold outline-none"/>
                </div>
                
                <div>
                    <label className="block text-gray-400 text-[10px] font-bold mb-1 uppercase tracking-wider">SEO Description</label>
                    <textarea name="metaDescription" rows="3" value={formData.metaDescription} onChange={handleInputChange} className="w-full bg-black/50 border border-white/10 text-white px-3 py-2 text-xs focus:border-holo-gold outline-none resize-none"/>
                </div>
                
                <div>
                    <label className="block text-gray-400 text-[10px] font-bold mb-1 uppercase tracking-wider">OG Image URL</label>
                    <input type="text" name="ogImage" value={formData.ogImage} onChange={handleInputChange} className="w-full bg-black/50 border border-white/10 text-white px-3 py-2 text-xs focus:border-holo-gold outline-none"/>
                </div>
            </div>
          </div>

          <div className="md:col-span-3 pt-4 border-t border-white/10 flex gap-4 items-center">
            <button type="submit" className="bg-neon-pink text-white px-8 py-3 uppercase tracking-widest text-xs font-bold hover:bg-white hover:text-black transition-colors clip-angled">
              {editingId ? "Güncelle" : "Sayfayı Ekle"}
            </button>
            <button type="button" onClick={handlePreview} className="border border-neon-pink text-neon-pink px-8 py-3 uppercase tracking-widest text-xs font-bold hover:bg-neon-pink hover:text-white transition-colors clip-angled">
              Önizleme
            </button>
            {editingId && (
              <button type="button" onClick={cancelEdit} className="border border-white/20 text-white px-8 py-3 uppercase tracking-widest text-xs font-bold hover:bg-white/10 transition-colors clip-angled ml-auto">
                İptal
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="glass-panel p-8 clip-angled border border-white/5">
        <h3 className="text-xl font-bold text-white mb-6 uppercase tracking-wider flex items-center gap-3">
          <span className="w-8 h-8 bg-holo-gold/20 text-holo-gold flex items-center justify-center clip-angled">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path>
            </svg>
          </span>
          Mevcut Sayfalar
        </h3>

        {isLoading ? (
          <div className="py-12 flex justify-center">
            <div className="w-8 h-8 border-2 border-neon-pink border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : pages.length === 0 ? (
          <div className="py-12 text-center text-gray-500 border border-white/5 border-dashed bg-black/20 clip-angled">
            <p>Henüz eklenmiş bir sayfa bulunmuyor.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 text-gray-400 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-4 pl-6">Başlık</th>
                  <th className="p-4">Slug</th>
                  <th className="p-4">Durum</th>
                  <th className="p-4">Son Güncelleme</th>
                  <th className="p-4 pr-6 text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-gray-300">
                {pages.map((page) => (
                  <tr key={page.id} className="hover:bg-white/5 transition-colors group">
                    <td className="p-4 pl-6 font-bold text-white">{page.title}</td>
                    <td className="p-4 font-mono text-xs">{page.slug}</td>
                    <td className="p-4">
                        <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${page.status === 'draft' ? 'bg-gray-500/20 text-gray-400' : 'bg-green-500/20 text-green-400'}`}>
                            {page.status === 'draft' ? 'Taslak' : 'Yayında'}
                        </span>
                    </td>
                    <td className="p-4 text-xs text-gray-400">
                        {page.updatedAt ? new Date(page.updatedAt).toLocaleDateString('tr-TR') : 'Bilinmiyor'} 
                        <br/>
                        <span className="text-[9px]">Yazar: {page.author || 'Admin'}</span>
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <div className="flex justify-end gap-2">
                        <a href={`/${page.slug}`} target="_blank" className="text-gray-400 hover:text-white p-2 transition-colors focus:outline-none" title="Görüntüle">
                           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                        </a>
                        <button onClick={() => handleEdit(page)} className="text-gray-400 hover:text-holo-gold p-2 transition-colors focus:outline-none" title="Düzenle">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                          </svg>
                        </button>
                        <button onClick={() => handleDelete(page.id)} className="text-gray-400 hover:text-red-500 p-2 transition-colors focus:outline-none" title="Sil">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
