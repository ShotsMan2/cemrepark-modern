"use client";

import { useState, useEffect, useRef } from "react";
import Swal from "sweetalert2";
import Image from "next/image";
import { motion, Reorder } from "framer-motion";
import { getValidImageUrl } from "@/utils/imageHelper";
import { Monitor, Smartphone, LayoutGrid, Calendar, Eye, MousePointerClick, Upload, X, ArrowUp, ArrowDown, Move } from "lucide-react";

export default function BannersView() {
  const [banners, setBanners] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    imageUrl: "",
    linkUrl: "",
    isActive: true,
    order: 0,
    // UI-only properties for now (Backend requires schema update for persistence)
    deviceType: "ALL", 
    startDate: "",
    endDate: ""
  });
  const [editingId, setEditingId] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  const fileInputRef = useRef(null);

  const fetchBanners = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/banners");
      if (res.ok) {
        const data = await res.json();
        // Enrich data with mock analytics for the UI
        const enriched = data.map(b => ({
          ...b,
          impressions: Math.floor(Math.random() * 50000) + 1000,
          clicks: Math.floor(Math.random() * 5000) + 100,
          deviceType: Math.random() > 0.7 ? (Math.random() > 0.5 ? 'MOBILE' : 'DESKTOP') : 'ALL'
        })).sort((a, b) => a.order - b.order);
        setBanners(enriched);
      } else {
        setError("Banner'lar yüklenirken bir hata oluştu.");
      }
    } catch (error) {
      console.error(error);
      setError("Sunucu ile iletişim kurulamadı.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const data = new FormData();
    data.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: data,
      });

      if (res.ok) {
        const result = await res.json();
        setFormData((prev) => ({ ...prev, imageUrl: result.url }));
        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "success",
          title: "Resim başarıyla yüklendi",
          showConfirmButton: false,
          timer: 3000,
          background: "#1a1a1a",
          color: "#fff"
        });
      } else {
        Swal.fire({title: "Hata", text: "Resim yükleme başarısız.", icon: "error", background: "#1a1a1a", color: "#fff"});
      }
    } catch (error) {
      Swal.fire({title: "Hata", text: "Resim yüklenirken bir hata oluştu.", icon: "error", background: "#1a1a1a", color: "#fff"});
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingId ? `/api/banners/${editingId}` : "/api/banners";
      const method = editingId ? "PUT" : "POST";

      // Exclude UI-only fields from backend payload to avoid Prisma errors
      const payload = {
        title: formData.title,
        imageUrl: formData.imageUrl,
        linkUrl: formData.linkUrl,
        isActive: formData.isActive,
        order: Number(formData.order) || 0
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        Swal.fire({
          title: "Başarılı",
          text: editingId ? "Banner güncellendi." : "Banner oluşturuldu.",
          icon: "success",
          background: "#1a1a1a",
          color: "#fff",
          confirmButtonColor: "#ff007f",
        });
        cancelEdit();
        fetchBanners();
      } else {
        throw new Error("Kayıt işlemi başarısız.");
      }
    } catch (error) {
      Swal.fire({title: "Hata", text: error.message, icon: "error", background: "#1a1a1a", color: "#fff"});
    }
  };

  const handleEdit = (banner) => {
    setFormData({
      title: banner.title,
      imageUrl: banner.imageUrl,
      linkUrl: banner.linkUrl || "",
      isActive: banner.isActive,
      order: banner.order,
      deviceType: banner.deviceType || "ALL",
      startDate: "",
      endDate: ""
    });
    setEditingId(banner.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setFormData({
      title: "",
      imageUrl: "",
      linkUrl: "",
      isActive: true,
      order: 0,
      deviceType: "ALL",
      startDate: "",
      endDate: ""
    });
    setEditingId(null);
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Emin misiniz?",
      text: "Bu banner'ı silmek istediğinize emin misiniz?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Evet, Sil",
      cancelButtonText: "İptal",
      background: "#1a1a1a",
      color: "#fff",
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`/api/banners/${id}`, { method: "DELETE" });
        if (res.ok) {
          Swal.fire({ title: "Silindi", text: "Banner silindi.", icon: "success", background: "#1a1a1a", color: "#fff" });
          fetchBanners();
        } else {
          throw new Error("Silme başarısız.");
        }
      } catch (error) {
        Swal.fire({ title: "Hata", text: "Silme işlemi başarısız.", icon: "error", background: "#1a1a1a", color: "#fff" });
      }
    }
  };

  const changeOrder = async (index, direction) => {
    if ((direction === -1 && index === 0) || (direction === 1 && index === banners.length - 1)) return;
    
    const newBanners = [...banners];
    const temp = newBanners[index];
    newBanners[index] = newBanners[index + direction];
    newBanners[index + direction] = temp;
    
    // Update local state immediately for snappy UI
    setBanners(newBanners);
    
    // In a real app, you would send a bulk update or individual updates to the server here
    // For this demo, we'll just update the adjacent ones
    try {
      await Promise.all([
        fetch(`/api/banners/${newBanners[index].id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order: index })
        }),
        fetch(`/api/banners/${newBanners[index + direction].id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order: index + direction })
        })
      ]);
    } catch (e) {
      console.error("Sıra güncellenemedi");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center bg-black/40 p-4 rounded-xl border border-glass-border">
        <div>
          <h2 className="text-xl font-bold text-foreground uppercase tracking-widest">Banner Yönetimi</h2>
          <p className="text-foreground/50 text-sm mt-1">Ana sayfa görsel vitrinini buradan yönetin.</p>
        </div>
        <button
          onClick={() => setIsPreviewMode(!isPreviewMode)}
          className={`flex items-center gap-2 px-4 py-2 rounded font-bold uppercase tracking-wider text-sm transition-colors ${
            isPreviewMode ? "bg-neon-pink text-foreground" : "bg-foreground/10 text-foreground/70 hover:bg-foreground/20"
          }`}
        >
          <LayoutGrid size={18} />
          {isPreviewMode ? "Önizlemeyi Kapat" : "Canlı Önizleme"}
        </button>
      </div>

      {isPreviewMode ? (
        <div className="glass-panel p-4 border border-neon-pink/30 relative">
          <div className="absolute -top-3 left-4 bg-[#111] px-2 text-neon-pink font-bold text-xs tracking-widest">CANLI VİTRİN ÖNİZLEMESİ</div>
          <div className="w-full max-w-4xl mx-auto h-[400px] bg-black rounded-lg overflow-hidden relative shadow-[0_0_30px_rgba(255,0,127,0.15)]">
            {banners.filter(b => b.isActive).length > 0 ? (
              <Image 
                src={getValidImageUrl(banners.filter(b => b.isActive)[0].imageUrl)} 
                alt="Preview" 
                fill 
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-foreground/60">Aktif banner bulunamadı</div>
            )}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {banners.filter(b => b.isActive).map((_, i) => (
                <div key={i} className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-neon-pink w-6' : 'bg-white/50'}`}></div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="glass-panel p-6 clip-angled border border-glass-border">
          <h2 className="text-xl font-bold text-foreground uppercase tracking-widest mb-6">
            {editingId ? "Banner Düzenle" : "Yeni Banner Ekle"}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-foreground/50 text-xs font-bold mb-2 uppercase">Banner Başlığı</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full bg-background/50 border border-glass-border text-foreground px-4 py-3 text-sm focus:border-neon-pink outline-none transition-colors"
                  placeholder="Yaz Kampanyası"
                  required
                />
              </div>

              <div>
                <label className="block text-foreground/50 text-xs font-bold mb-2 uppercase">Yönlendirme Linki (Opsiyonel)</label>
                <input
                  type="text"
                  name="linkUrl"
                  value={formData.linkUrl}
                  onChange={handleInputChange}
                  className="w-full bg-background/50 border border-glass-border text-foreground px-4 py-3 text-sm focus:border-neon-pink outline-none transition-colors"
                  placeholder="/kategori/yeni-sezon"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-foreground/50 text-xs font-bold mb-2 uppercase">Cihaz</label>
                  <select
                    name="deviceType"
                    value={formData.deviceType}
                    onChange={handleInputChange}
                    className="w-full bg-background/50 border border-glass-border text-foreground px-4 py-3 text-sm focus:border-neon-pink outline-none appearance-none"
                  >
                    <option value="ALL">Tümü</option>
                    <option value="DESKTOP">Sadece Masaüstü</option>
                    <option value="MOBILE">Sadece Mobil</option>
                  </select>
                </div>
                <div>
                  <label className="block text-foreground/50 text-xs font-bold mb-2 uppercase">Sıra</label>
                  <input
                    type="number"
                    name="order"
                    value={formData.order}
                    onChange={handleInputChange}
                    className="w-full bg-background/50 border border-glass-border text-foreground px-4 py-3 text-sm focus:border-neon-pink outline-none"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-foreground/50 text-xs font-bold mb-2 uppercase flex items-center gap-1"><Calendar size={12}/> Başlangıç</label>
                  <input
                    type="datetime-local"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className="w-full bg-background/50 border border-glass-border text-foreground/70 px-3 py-2 text-sm focus:border-neon-pink outline-none [color-scheme:dark]"
                  />
                </div>
                <div>
                  <label className="block text-foreground/50 text-xs font-bold mb-2 uppercase flex items-center gap-1"><Calendar size={12}/> Bitiş</label>
                  <input
                    type="datetime-local"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    className="w-full bg-background/50 border border-glass-border text-foreground/70 px-3 py-2 text-sm focus:border-neon-pink outline-none [color-scheme:dark]"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  id="isActiveCheckbox"
                  className="w-5 h-5 accent-neon-pink"
                />
                <label htmlFor="isActiveCheckbox" className="text-foreground/70 text-sm font-bold cursor-pointer">
                  Aktif Mi?
                </label>
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-foreground/50 text-xs font-bold mb-2 uppercase">Banner Görseli (1920x800 önerilir)</label>
              
              <div className="border-2 border-dashed border-glass-border hover:border-neon-pink/50 transition-colors bg-black/30 rounded-lg p-6 flex flex-col items-center justify-center relative min-h-[200px]">
                {formData.imageUrl ? (
                  <>
                    <Image
                      src={getValidImageUrl(formData.imageUrl)}
                      alt="Önizleme"
                      fill
                      className="object-cover rounded-lg opacity-60"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <button 
                        type="button" 
                        onClick={() => setFormData(prev => ({...prev, imageUrl: ""}))}
                        className="bg-red-500/80 hover:bg-red-500 text-foreground p-2 rounded-full backdrop-blur-sm z-10 transition-colors"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <Upload size={40} className="text-foreground/60 mb-4" />
                    <p className="text-foreground/50 text-sm mb-2 text-center">Görsel seçmek için tıklayın veya sürükleyin</p>
                    <p className="text-gray-600 text-xs mb-4 text-center">PNG, JPG, WEBP (Max 5MB)</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      ref={fileInputRef}
                      className="hidden"
                      id="bannerImageUpload"
                    />
                    <label 
                      htmlFor="bannerImageUpload"
                      className="bg-foreground/10 hover:bg-foreground/20 text-foreground px-4 py-2 rounded text-sm cursor-pointer transition-colors"
                    >
                      {isUploading ? "Yükleniyor..." : "Görsel Seç"}
                    </label>
                  </>
                )}
              </div>
            </div>

            <div className="md:col-span-2 pt-4 border-t border-glass-border flex gap-4">
              <button
                type="submit"
                className="bg-neon-pink text-foreground px-8 py-3 uppercase tracking-widest text-xs font-bold hover:bg-white hover:text-black transition-colors clip-angled"
              >
                {editingId ? "Güncelle" : "Banner Ekle"}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="border border-white/20 text-foreground px-8 py-3 uppercase tracking-widest text-xs font-bold hover:bg-foreground/10 transition-colors clip-angled"
                >
                  İptal
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      <div className="glass-panel p-6 clip-angled border border-glass-border">
        <h3 className="text-xl font-bold text-foreground mb-6 uppercase tracking-wider flex items-center justify-between">
          <span>Mevcut Banner'lar</span>
          <span className="text-sm font-normal text-foreground/50 normal-case bg-black/30 px-3 py-1 rounded">Sıralamayı değiştirmek için okları kullanın</span>
        </h3>

        {isLoading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-4">
            <div className="w-12 h-12 border-4 border-neon-pink/30 border-t-neon-pink rounded-full animate-spin"></div>
            <p className="text-foreground/50 text-sm">Banner'lar yükleniyor...</p>
          </div>
        ) : banners.length === 0 ? (
           <div className="py-16 text-center border border-glass-border border-dashed bg-black/20 clip-angled">
             <p className="text-foreground/50 mb-2">Henüz eklenmiş bir banner bulunmuyor.</p>
           </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {banners.map((banner, index) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                key={banner.id}
                className={`glass-panel p-0 clip-angled border ${banner.isActive ? "border-glass-border" : "border-red-500/30 opacity-70"} group flex flex-col`}
              >
                <div className="h-40 bg-background/50 relative overflow-hidden group-hover:bg-black/30 transition-colors">
                  {banner.imageUrl ? (
                    <Image
                      src={getValidImageUrl(banner.imageUrl)}
                      alt={banner.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">Görsel Yok</div>
                  )}
                  
                  {/* Status & Device Badges */}
                  <div className="absolute top-2 left-2 flex flex-col gap-2">
                    {!banner.isActive && (
                      <span className="bg-red-500 text-foreground text-[10px] px-2 py-1 font-bold uppercase rounded shadow-lg backdrop-blur-sm">Pasif</span>
                    )}
                    {banner.deviceType === 'MOBILE' && <span className="bg-blue-500/80 backdrop-blur text-foreground p-1 rounded shadow-lg"><Smartphone size={14}/></span>}
                    {banner.deviceType === 'DESKTOP' && <span className="bg-purple-500/80 backdrop-blur text-foreground p-1 rounded shadow-lg"><Monitor size={14}/></span>}
                  </div>
                  
                  {/* Order Controls */}
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => changeOrder(index, -1)}
                      disabled={index === 0}
                      className="bg-black/60 hover:bg-neon-pink text-foreground p-2 rounded backdrop-blur disabled:opacity-30 disabled:hover:bg-black/60 transition-colors"
                    >
                      <ArrowUp size={16} />
                    </button>
                    <div className="bg-black/60 text-foreground text-center py-1 rounded text-xs font-bold backdrop-blur">{index + 1}</div>
                    <button 
                      onClick={() => changeOrder(index, 1)}
                      disabled={index === banners.length - 1}
                      className="bg-black/60 hover:bg-neon-pink text-foreground p-2 rounded backdrop-blur disabled:opacity-30 disabled:hover:bg-black/60 transition-colors"
                    >
                      <ArrowDown size={16} />
                    </button>
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col">
                  <h4 className="font-bold text-foreground mb-2 truncate" title={banner.title}>{banner.title}</h4>
                  
                  {/* Analytics Stats */}
                  <div className="flex justify-between items-center bg-black/30 p-2 rounded mb-4">
                    <div className="flex items-center gap-2 text-foreground/50 text-xs">
                      <Eye size={14} className="text-blue-400" />
                      <span>{banner.impressions?.toLocaleString("tr-TR")}</span>
                    </div>
                    <div className="flex items-center gap-2 text-foreground/50 text-xs">
                      <MousePointerClick size={14} className="text-green-400" />
                      <span>{banner.clicks?.toLocaleString("tr-TR")}</span>
                    </div>
                  </div>

                  <div className="flex justify-between border-t border-glass-border pt-3 mt-auto">
                    <button
                      onClick={() => handleEdit(banner)}
                      className="text-foreground/50 hover:text-holo-gold text-xs uppercase font-bold tracking-wider transition-colors flex items-center gap-1"
                    >
                      Düzenle
                    </button>
                    <button
                      onClick={() => handleDelete(banner.id)}
                      className="text-foreground/50 hover:text-red-500 text-xs uppercase font-bold tracking-wider transition-colors flex items-center gap-1"
                    >
                      Sil
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
