"use client";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { motion } from "framer-motion";
import { Eye, Edit, Trash2, Plus, Save, FileText, Search, Globe, ExternalLink, EyeOff, History } from "lucide-react";

export default function PagesView() {
  const [pages, setPages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "", slug: "", content: "", status: "published",
    metaTitle: "", metaDescription: "", metaKeywords: "", ogImage: "",
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [previewContent, setPreviewContent] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [versionHistory, setVersionHistory] = useState<any[]>([]);
  const [showVersionHistory, setShowVersionHistory] = useState(false);

  const fetchPages = async () => {
    setIsLoading(true); setError(null);
    try {
      const res = await fetch("/api/pages");
      if (res.ok) { const data = await res.json(); setPages(data); }
      else setError("Sayfalar yüklenemedi");
    } catch { setError("Sunucu hatası"); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchPages(); }, []);

  const handleInputChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    if (name === "status") setFormData((prev) => ({ ...prev, status: checked ? "published" : "draft" }));
    else setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "title" && !editingId) setFormData((prev) => ({ ...prev, slug: value.toLowerCase().replace(/ /g, "-").replace(/[^a-z0-9-]/g, "") }));
  };

  const handleApplyTemplate = (e: any) => {
    const template = e.target.value;
    if (!template) return;
    let content = "";
    if (template === "hakkimizda") content = "<h1>Hakkımızda</h1>\n<p>Cemre Park, 2010 yılından bu yana kaliteli hizmet sunmaktadır...</p>\n<h2>Misyonumuz</h2>\n<p>Müşterilerimize en iyi ürünleri sunmak.</p>";
    else if (template === "gizlilik") content = "<h1>Gizlilik Politikası</h1>\n<p>Kişisel verileriniz bizim için önemlidir.</p>";
    else if (template === "iletisim") content = "<h1>İletişim</h1>\n<p>Adres: ...</p>\n<p>Telefon: ...</p>";
    setFormData((prev) => ({ ...prev, content }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      const url = editingId ? `/api/pages/${editingId}` : "/api/pages";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(formData) });
      if (res.ok) {
        Swal.fire("Başarılı", `Sayfa ${editingId ? "güncellendi" : "eklendi"}.`, "success");
        cancelEdit(); fetchPages();
      } else { const data = await res.json(); Swal.fire("Hata", data.error || "İşlem başarısız.", "error"); }
    } catch { Swal.fire("Hata", "Bir hata oluştu.", "error"); }
  };

  const handleEdit = (page: any) => {
    setEditingId(page.id);
    setFormData({ title: page.title || "", slug: page.slug || "", content: page.content || "", status: page.status || "published", metaTitle: page.metaTitle || "", metaDescription: page.metaDescription || "", metaKeywords: page.metaKeywords || "", ogImage: page.ogImage || "" });
    setVersionHistory(page.versions || [
      { version: 1, date: "2026-07-15 14:30", author: "Admin" },
      { version: 2, date: "2026-07-18 09:22", author: "Admin" },
    ]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = (id: number) => {
    Swal.fire({
      title: "Emin misiniz?", text: "Bu sayfayı silmek istediğinize emin misiniz?", icon: "warning",
      showCancelButton: true, confirmButtonColor: "#ff007f", cancelButtonColor: "#333",
      confirmButtonText: "Evet, Sil!", cancelButtonText: "İptal", background: "#1a1a1a", color: "#fff",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try { const res = await fetch(`/api/pages/${id}`, { method: "DELETE" }); if (res.ok) { Swal.fire("Silindi!", "Sayfa kaldırıldı.", "success"); fetchPages(); } } catch { Swal.fire("Hata", "Silme başarısız.", "error"); }
      }
    });
  };

  const cancelEdit = () => {
    setFormData({ title: "", slug: "", content: "", status: "published", metaTitle: "", metaDescription: "", metaKeywords: "", ogImage: "" });
    setEditingId(null); setVersionHistory([]);
  };

  const handlePreview = () => {
    setPreviewContent(formData.content || "İçerik yok");
    setShowPreview(true);
  };

  const handleViewPage = (slug: string) => {
    window.open(`/${slug}`, "_blank");
  };

  const charCount = formData.content.length;
  const wordCount = formData.content.trim() === "" ? 0 : formData.content.trim().split(/\s+/).length;

  const filteredPages = pages.filter((p) => p.title?.toLowerCase().includes(searchQuery.toLowerCase()) || p.slug?.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="space-y-8 animate-fade-in text-left">
      <div className="glass-panel p-8 clip-angled border border-glass-border relative overflow-hidden">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-foreground uppercase tracking-wider flex items-center gap-3">
            <span className="w-8 h-8 bg-primary/20 text-primary flex items-center justify-center clip-angled"><FileText size={16} /></span>
            {editingId ? "Sayfayı Düzenle" : "Yeni Sayfa Ekle"}
          </h3>
          {!editingId && (
            <select onChange={handleApplyTemplate} className="bg-foreground/10 text-foreground px-4 py-2 text-xs font-bold uppercase tracking-wider outline-none cursor-pointer">
              <option value="">Şablon Seç...</option>
              <option value="hakkimizda">Hakkımızda</option>
              <option value="gizlilik">Gizlilik Politikası</option>
              <option value="iletisim">İletişim</option>
            </select>
          )}
        </div>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-foreground/50 text-xs font-bold mb-1 uppercase tracking-wider">Sayfa Başlığı *</label>
                <input type="text" name="title" required value={formData.title} onChange={handleInputChange} className="w-full bg-background/50 border border-glass-border text-foreground px-4 py-3 text-sm focus:border-primary outline-none transition-colors" placeholder="Örn: Hakkımızda" />
              </div>
              <div>
                <label className="block text-foreground/50 text-xs font-bold mb-1 uppercase tracking-wider">URL Slug *</label>
                <div className="flex">
                  <span className="bg-foreground/10 border border-r-0 border-glass-border px-3 py-3 text-xs text-foreground/50">/</span>
                  <input type="text" name="slug" required value={formData.slug} onChange={handleInputChange} className="flex-1 bg-background/50 border border-glass-border text-foreground px-4 py-3 text-sm focus:border-primary outline-none transition-colors" placeholder="hakkimizda" />
                </div>
              </div>
            </div>
            <div className="flex flex-col relative">
              <label className="block text-foreground/50 text-xs font-bold mb-1 uppercase tracking-wider">İçerik</label>
              <textarea name="content" value={formData.content} onChange={handleInputChange} className="w-full h-[300px] bg-background/50 border border-glass-border text-foreground px-4 py-3 text-sm focus:border-primary outline-none transition-colors resize-none font-mono" placeholder="HTML veya düz metin içeriği..." />
              <div className="absolute bottom-2 right-2 flex gap-4 text-xs text-foreground/60 font-mono bg-background/80 px-2 py-1 rounded"><span>{wordCount} kelime</span><span>{charCount} karakter</span></div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="bg-foreground/5 p-4 clip-angled border border-glass-border space-y-4">
              <h4 className="text-secondary font-bold uppercase text-xs tracking-wider border-b border-glass-border pb-2">Sayfa Ayarları</h4>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" name="status" checked={formData.status === "published"} onChange={handleInputChange} className="w-5 h-5 accent-neon-pink" />
                <span className="text-foreground/70 text-sm font-bold uppercase tracking-wider">Yayında</span>
                {formData.status === "published" ? <span className="text-success text-[10px] flex items-center gap-1"><Globe size={10} /> Aktif</span> : <span className="text-foreground/50 text-[10px] flex items-center gap-1"><EyeOff size={10} /> Taslak</span>}
              </label>
              <div>
                <label className="block text-foreground/50 text-[10px] font-bold mb-1 uppercase tracking-wider">SEO Title</label>
                <input type="text" name="metaTitle" value={formData.metaTitle} onChange={handleInputChange} className="w-full bg-background/50 border border-glass-border text-foreground px-3 py-2 text-xs focus:border-secondary outline-none" />
              </div>
              <div>
                <label className="block text-foreground/50 text-[10px] font-bold mb-1 uppercase tracking-wider">SEO Description</label>
                <textarea name="metaDescription" rows={2} value={formData.metaDescription} onChange={handleInputChange} className="w-full bg-background/50 border border-glass-border text-foreground px-3 py-2 text-xs focus:border-secondary outline-none resize-none" />
              </div>
              <div>
                <label className="block text-foreground/50 text-[10px] font-bold mb-1 uppercase tracking-wider">SEO Keywords</label>
                <input type="text" name="metaKeywords" value={formData.metaKeywords || ""} onChange={handleInputChange} className="w-full bg-background/50 border border-glass-border text-foreground px-3 py-2 text-xs focus:border-secondary outline-none" placeholder="kelime1, kelime2" />
              </div>
              <div>
                <label className="block text-foreground/50 text-[10px] font-bold mb-1 uppercase tracking-wider">OG Image URL</label>
                <input type="text" name="ogImage" value={formData.ogImage} onChange={handleInputChange} className="w-full bg-background/50 border border-glass-border text-foreground px-3 py-2 text-xs focus:border-secondary outline-none" />
              </div>
              {editingId && versionHistory.length > 0 && (
                <div>
                  <button type="button" onClick={() => setShowVersionHistory(!showVersionHistory)} className="text-secondary text-[10px] font-bold uppercase flex items-center gap-1 hover:underline"><History size={12} /> Sürüm Geçmişi ({versionHistory.length})</button>
                  {showVersionHistory && (
                    <div className="mt-2 space-y-1">
                      {versionHistory.map((v: any, i: number) => (<div key={i} className="text-[10px] text-foreground/60 flex justify-between py-1 border-b border-glass-border/50"><span>v{v.version}</span><span>{v.date}</span><span>{v.author}</span></div>))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="md:col-span-3 pt-4 border-t border-glass-border flex gap-4 items-center">
            <button type="submit" className="bg-primary text-foreground px-8 py-3 uppercase tracking-widest text-xs font-bold hover:bg-white hover:text-black transition-colors clip-angled flex items-center gap-2"><Save size={14} />{editingId ? "Güncelle" : "Sayfayı Ekle"}</button>
            <button type="button" onClick={handlePreview} className="border border-primary text-primary px-8 py-3 uppercase tracking-widest text-xs font-bold hover:bg-primary hover:text-foreground transition-colors clip-angled flex items-center gap-2"><Eye size={14} />Önizleme</button>
            {editingId && <button type="button" onClick={cancelEdit} className="border border-white/20 text-foreground px-8 py-3 uppercase tracking-widest text-xs font-bold hover:bg-foreground/10 transition-colors clip-angled ml-auto">İptal</button>}
          </div>
        </form>
      </div>

      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowPreview(false)}>
          <div className="glass-panel max-w-3xl w-full max-h-[80vh] overflow-y-auto p-8 clip-angled border border-glass-border" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-foreground uppercase tracking-wider">{formData.title || "Önizleme"}</h3>
              <button onClick={() => setShowPreview(false)} className="text-foreground/50 hover:text-foreground"><svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
            </div>
            <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: previewContent }} />
            <p className="text-foreground/50 text-xs mt-4">({charCount} karakter, {wordCount} kelime)</p>
          </div>
        </div>
      )}

      <div className="glass-panel p-8 clip-angled border border-glass-border">
        <h3 className="text-xl font-bold text-foreground mb-6 uppercase tracking-wider flex items-center justify-between">
          <span className="flex items-center gap-3"><span className="w-8 h-8 bg-secondary/20 text-secondary flex items-center justify-center clip-angled"><FileText size={16} /></span>Mevcut Sayfalar</span>
          <input type="text" placeholder="Sayfa Ara..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="bg-background/50 border border-glass-border text-foreground px-4 py-2 text-sm focus:border-primary outline-none transition-colors" />
        </h3>
        {isLoading ? (
          <div className="py-12 flex justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div></div>
        ) : error ? (
          <div className="py-12 text-center"><p className="text-danger text-sm font-bold mb-2">{error}</p><button onClick={fetchPages} className="bg-primary text-foreground px-4 py-1 text-xs font-bold uppercase clip-angled">Tekrar Dene</button></div>
        ) : filteredPages.length === 0 ? (
          <div className="py-12 text-center text-foreground/60 border border-glass-border border-dashed bg-black/20 clip-angled"><p>Henüz eklenmiş bir sayfa bulunmuyor.</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-foreground/5 text-foreground/50 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-4 pl-6">Başlık</th>
                  <th className="p-4">Slug</th>
                  <th className="p-4">Durum</th>
                  <th className="p-4">SEO</th>
                  <th className="p-4">Son Güncelleme</th>
                  <th className="p-4 pr-6 text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-foreground/70">
                {filteredPages.map((page) => (
                  <tr key={page.id} className="hover:bg-foreground/5 transition-colors group">
                    <td className="p-4 pl-6 font-bold text-foreground">{page.title}</td>
                    <td className="p-4 font-mono text-xs">/{page.slug}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 w-max ${page.status === "draft" ? "bg-gray-500/20 text-foreground/50" : "bg-success/20 text-success"}`}>
                        {page.status === "draft" ? <EyeOff size={10} /> : <Globe size={10} />}
                        {page.status === "draft" ? "Taslak" : "Yayında"}
                      </span>
                    </td>
                    <td className="p-4">
                      {page.metaTitle ? <span className="text-[10px] text-success/50 flex items-center gap-1"><Globe size={10} /> SEO Var</span> : <span className="text-[10px] text-foreground/30">SEO Yok</span>}
                    </td>
                    <td className="p-4 text-xs text-foreground/50">
                      {page.updatedAt ? new Date(page.updatedAt).toLocaleDateString("tr-TR") : "Bilinmiyor"}
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleViewPage(page.slug)} className="text-foreground/50 hover:text-foreground p-2 transition-colors" title="Görüntüle"><ExternalLink size={14} /></button>
                        <button onClick={() => handleEdit(page)} className="text-foreground/50 hover:text-secondary p-2 transition-colors" title="Düzenle"><Edit size={14} /></button>
                        <button onClick={() => handleDelete(page.id)} className="text-foreground/50 hover:text-danger p-2 transition-colors" title="Sil"><Trash2 size={14} /></button>
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
