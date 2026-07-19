"use client";

import { useState, useEffect, useRef } from "react";
import Swal from "sweetalert2";
import Image from "next/image";
import { getValidImageUrl } from "@/utils/imageHelper";

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
  });
  const [editingId, setEditingId] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef(null);

  const fetchBanners = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/banners");
      if (res.ok) {
        const data = await res.json();
        setBanners(data);
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
        });
      } else {
        Swal.fire("Hata", "Resim yükleme başarısız.", "error");
      }
    } catch (error) {
      Swal.fire("Hata", "Resim yüklenirken bir hata oluştu.", "error");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingId ? `/api/banners/${editingId}` : "/api/banners";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        Swal.fire(
          "Başarılı",
          `Banner başarıyla ${editingId ? "güncellendi" : "eklendi"}.`,
          "success"
        );
        setFormData({ title: "", imageUrl: "", linkUrl: "", isActive: true, order: 0 });
        setEditingId(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        fetchBanners();
      } else {
        Swal.fire("Hata", "İşlem başarısız oldu.", "error");
      }
    } catch (error) {
      Swal.fire("Hata", "Bir hata oluştu.", "error");
    }
  };

  const handleEdit = (banner) => {
    setEditingId(banner.id);
    setFormData({
      title: banner.title,
      imageUrl: banner.imageUrl,
      linkUrl: banner.linkUrl || "",
      isActive: banner.isActive,
      order: banner.order,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = (id) => {
    console.log("Silinecek banner ID:", id);
    Swal.fire({
      title: "Emin misiniz?",
      text: "Bu banner/slider'ı silmek istediğinize emin misiniz?",
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
          console.log("Silme isteği gönderiliyor:", `/api/banners/${id}`);
          const res = await fetch(`/api/banners/${id}`, { method: "DELETE" });
          console.log("Silme yanıtı:", res.status, res.ok);
          if (res.ok) {
            Swal.fire("Silindi!", "Banner sistemden kaldırıldı.", "success");
            fetchBanners();
          } else {
            const errorData = await res.json().catch(() => ({ error: "Bilinmeyen hata" }));
            console.error("Silme hatası (detay):", errorData);
            Swal.fire(
              "Hata",
              `Silme işlemi başarısız: ${errorData.error || "Bilinmeyen hata"}`,
              "error"
            );
          }
        } catch (error) {
          console.error("Silme işlemi hatası:", error);
          Swal.fire("Hata", `Silme işlemi başarısız: ${error.message}`, "error");
        }
      }
    });
  };

  const cancelEdit = () => {
    setFormData({ title: "", imageUrl: "", linkUrl: "", isActive: true, order: 0 });
    setEditingId(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
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
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              ></path>
            </svg>
          </span>
          {editingId ? "Banner Düzenle" : "Yeni Banner Ekle"}
        </h3>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-gray-400 text-xs font-bold mb-1 uppercase tracking-wider">
                Başlık *
              </label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleInputChange}
                className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 text-sm focus:border-neon-pink outline-none transition-colors"
                placeholder="Banner Başlığı"
              />
            </div>
            <div>
              <label className="block text-gray-400 text-xs font-bold mb-1 uppercase tracking-wider">
                Görsel URL veya Yükle *
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  name="imageUrl"
                  required
                  value={formData.imageUrl}
                  onChange={handleInputChange}
                  className="flex-1 bg-black/50 border border-white/10 text-white px-4 py-3 text-sm focus:border-neon-pink outline-none transition-colors"
                  placeholder="/uploads/..."
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-white/10 hover:bg-white/20 text-white px-4 py-3 text-xs uppercase font-bold transition-colors whitespace-nowrap clip-angled"
                >
                  {isUploading ? "Yükleniyor..." : "Gözat"}
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="hidden"
                />
              </div>
            </div>
            <div>
              <label className="block text-gray-400 text-xs font-bold mb-1 uppercase tracking-wider">
                Hedef Bağlantı (İsteğe Bağlı)
              </label>
              <input
                type="text"
                name="linkUrl"
                value={formData.linkUrl}
                onChange={handleInputChange}
                className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 text-sm focus:border-neon-pink outline-none transition-colors"
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-gray-400 text-xs font-bold mb-1 uppercase tracking-wider">
                Sıra No
              </label>
              <input
                type="number"
                name="order"
                value={formData.order}
                onChange={handleInputChange}
                className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 text-sm focus:border-neon-pink outline-none transition-colors"
                placeholder="0"
              />
            </div>
            <div className="flex items-center gap-3 pt-4 border-t border-white/5 mt-4">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleInputChange}
                id="isActiveCheckbox"
                className="w-5 h-5 accent-neon-pink"
              />
              <label
                htmlFor="isActiveCheckbox"
                className="text-gray-300 text-sm font-bold cursor-pointer"
              >
                Aktif Mi?
              </label>
            </div>

            {formData.imageUrl && (
              <div className="mt-4 p-2 bg-black/40 border border-white/10 rounded">
                <p className="text-xs text-gray-500 mb-2 uppercase">Önizleme:</p>
                <div className="relative w-full h-32">
                  <Image
                    src={getValidImageUrl(formData.imageUrl)}
                    alt="Önizleme"
                    fill
                    sizes="(max-width: 768px) 100vw, 30vw"
                    className="object-contain rounded mx-auto"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="md:col-span-2 pt-4 border-t border-white/10 flex gap-4">
            <button
              type="submit"
              className="bg-neon-pink text-white px-8 py-3 uppercase tracking-widest text-xs font-bold hover:bg-white hover:text-black transition-colors clip-angled"
            >
              {editingId ? "Güncelle" : "Banner Ekle"}
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
          Mevcut Banner'lar
        </h3>

        {isLoading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-4">
            <div className="w-12 h-12 border-4 border-neon-pink/30 border-t-neon-pink rounded-full animate-spin"></div>
            <p className="text-gray-400 text-sm">Banner'lar yükleniyor...</p>
          </div>
        ) : error ? (
          <div className="py-16 flex flex-col items-center justify-center gap-4 text-center">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div>
              <p className="text-red-400 font-medium mb-2">{error}</p>
              <button
                onClick={fetchBanners}
                className="text-neon-pink hover:text-neon-pink/80 text-sm underline transition-colors"
              >
                Tekrar Dene
              </button>
            </div>
          </div>
        ) : banners.length === 0 ? (
          <div className="py-16 text-center border border-white/5 border-dashed bg-black/20 clip-angled">
            <div className="w-16 h-16 bg-neon-pink/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-neon-pink/60"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <p className="text-gray-400 mb-2">Henüz eklenmiş bir banner bulunmuyor.</p>
            <p className="text-gray-500 text-sm">Yukarıdaki formdan ilk banner'ınızı ekleyin!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {banners.map((banner) => (
              <div
                key={banner.id}
                className={`glass-panel p-4 clip-angled border ${banner.isActive ? "border-white/10" : "border-red-500/30 opacity-60"} group hover:border-white/30 transition-all`}
              >
                <div className="h-40 bg-black/50 mb-4 rounded overflow-hidden flex items-center justify-center relative">
                  {banner.imageUrl ? (
                    <Image
                      src={getValidImageUrl(banner.imageUrl)}
                      alt={banner.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <span className="text-gray-600 text-xs">Görsel Yok</span>
                  )}
                  {!banner.isActive && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white text-[10px] px-2 py-1 font-bold uppercase rounded">
                      Pasif
                    </div>
                  )}
                </div>

                <h4 className="font-bold text-white mb-1 truncate">{banner.title}</h4>
                <div className="flex justify-between items-center text-xs text-gray-500 mb-4">
                  <span>Sıra: {banner.order}</span>
                  {banner.linkUrl && (
                    <span className="truncate max-w-[100px]" title={banner.linkUrl}>
                      🔗 Link Var
                    </span>
                  )}
                </div>

                <div className="flex justify-between border-t border-white/10 pt-3">
                  <button
                    onClick={() => handleEdit(banner)}
                    className="text-gray-400 hover:text-holo-gold text-xs uppercase font-bold tracking-wider transition-colors"
                  >
                    Düzenle
                  </button>
                  <button
                    onClick={() => handleDelete(banner.id)}
                    className="text-gray-400 hover:text-red-500 text-xs uppercase font-bold tracking-wider transition-colors"
                  >
                    Sil
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
