"use client";

import { useState, useEffect } from "react";
import Swal from "sweetalert2";

export default function PagesView() {
  const [pages, setPages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [formData, setFormData] = useState({ title: "", slug: "", content: "" });
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
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

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
        setFormData({ title: "", slug: "", content: "" });
        setEditingId(null);
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
    setFormData({ title: page.title, slug: page.slug, content: page.content });
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
    setFormData({ title: "", slug: "", content: "" });
    setEditingId(null);
  };

  return (
    <div className="space-y-8 animate-fade-in text-left">
      <div className="glass-panel p-8 clip-angled border border-white/5 relative overflow-hidden">
        <h3 className="text-xl font-bold text-white mb-6 uppercase tracking-wider flex items-center gap-3">
          <span className="w-8 h-8 bg-neon-pink/20 text-neon-pink flex items-center justify-center clip-angled">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              ></path>
            </svg>
          </span>
          {editingId ? "Sayfayı Düzenle" : "Yeni Sayfa Ekle"}
        </h3>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-gray-400 text-xs font-bold mb-1 uppercase tracking-wider">
                Sayfa Başlığı *
              </label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleInputChange}
                className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 text-sm focus:border-neon-pink outline-none transition-colors"
                placeholder="Örn: Hakkımızda"
              />
            </div>
            <div>
              <label className="block text-gray-400 text-xs font-bold mb-1 uppercase tracking-wider">
                URL Slug (Kalıcı Bağlantı) *
              </label>
              <input
                type="text"
                name="slug"
                required
                value={formData.slug}
                onChange={handleInputChange}
                className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 text-sm focus:border-neon-pink outline-none transition-colors"
                placeholder="Örn: hakkimizda"
              />
            </div>
          </div>

          <div className="space-y-4 flex flex-col">
            <div className="flex-1 flex flex-col">
              <label className="block text-gray-400 text-xs font-bold mb-1 uppercase tracking-wider">
                İçerik
              </label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                className="w-full h-full min-h-[120px] bg-black/50 border border-white/10 text-white px-4 py-3 text-sm focus:border-neon-pink outline-none transition-colors resize-none"
                placeholder="HTML veya düz metin içeriği buraya yazın..."
              />
            </div>
          </div>

          <div className="md:col-span-2 pt-4 border-t border-white/10 flex gap-4">
            <button
              type="submit"
              className="bg-neon-pink text-white px-8 py-3 uppercase tracking-widest text-xs font-bold hover:bg-white hover:text-black transition-colors clip-angled"
            >
              {editingId ? "Güncelle" : "Sayfayı Ekle"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={cancelEdit}
                className="border border-white/20 text-white px-8 py-3 uppercase tracking-widest text-xs font-bold hover:bg-white/10 transition-colors clip-angled"
              >
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
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 10h16M4 14h16M4 18h16"
              ></path>
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
                  <th className="p-4 pl-6 w-1/3">Başlık</th>
                  <th className="p-4 w-1/3">Slug</th>
                  <th className="p-4 pr-6 text-right w-1/3">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-gray-300">
                {pages.map((page) => (
                  <tr key={page.id} className="hover:bg-white/5 transition-colors group">
                    <td className="p-4 pl-6 font-bold text-white">{page.title}</td>
                    <td className="p-4 font-mono text-xs">{page.slug}</td>
                    <td className="p-4 pr-6 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(page)}
                          className="text-gray-400 hover:text-holo-gold p-2 transition-colors focus:outline-none"
                          title="Düzenle"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            ></path>
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(page.id)}
                          className="text-gray-400 hover:text-red-500 p-2 transition-colors focus:outline-none"
                          title="Sil"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            ></path>
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
