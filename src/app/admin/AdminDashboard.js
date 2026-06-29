"use client";

import { useState, useEffect } from "react";
import Swal from "sweetalert2";

export default function AdminDashboard({ onLogout }) {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Form States
  const [formData, setFormData] = useState({
    ad: "",
    fiyat: "",
    gorsel: "",
    etiket: "",
    kategori: "",
    renk: "",
    beden: ""
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      console.error("Ürünler çekilirken hata:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basit Validasyon
    if (!formData.ad || !formData.fiyat || !formData.gorsel) {
      return Swal.fire("Hata", "Lütfen zorunlu alanları (Ad, Fiyat, Görsel URL) doldurun.", "error");
    }

    const method = editingId ? 'PUT' : 'POST';
    const url = editingId ? `/api/products/${editingId}` : '/api/products';
    
    const payload = {
      ...formData,
      fiyat: parseFloat(formData.fiyat)
    };

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        Swal.fire("Başarılı", `Ürün başarıyla ${editingId ? 'güncellendi' : 'eklendi'}.`, "success");
        setFormData({ ad: "", fiyat: "", gorsel: "", etiket: "", kategori: "", renk: "", beden: "" });
        setEditingId(null);
        fetchProducts(); // Listeyi yenile
      } else {
        Swal.fire("Hata", "İşlem başarısız oldu.", "error");
      }
    } catch (error) {
      Swal.fire("Hata", "Bir sunucu hatası oluştu.", "error");
    }
  };

  const handleEdit = (product) => {
    setFormData({
      ad: product.ad,
      fiyat: product.fiyat,
      gorsel: product.gorsel || product.resim1 || "",
      etiket: product.etiket || "",
      kategori: product.kategori || "",
      renk: product.renk || "",
      beden: product.beden || ""
    });
    setEditingId(product.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: 'Emin misiniz?',
      text: "Bu ürünü silmek istediğinize emin misiniz? Bu işlem geri alınamaz!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ff007f',
      cancelButtonColor: '#333',
      confirmButtonText: 'Evet, Sil!',
      cancelButtonText: 'İptal',
      background: "#1a1a1a",
      color: "#fff"
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
          if (res.ok) {
            Swal.fire("Silindi!", "Ürün sistemden kaldırıldı.", "success");
            fetchProducts();
          }
        } catch (error) {
          Swal.fire("Hata", "Silme işlemi başarısız.", "error");
        }
      }
    });
  };

  const cancelEdit = () => {
    setFormData({ ad: "", fiyat: "", gorsel: "", etiket: "", kategori: "", renk: "", beden: "" });
    setEditingId(null);
  };

  return (
    <div className="min-h-screen pt-24 pb-24 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-12 glass-panel p-6 clip-angled">
          <div>
            <h1 className="text-3xl font-black text-white uppercase tracking-widest">Yönetim Paneli</h1>
            <p className="text-neon-pink">Cemre Park Ürün Yönetimi</p>
          </div>
          <button 
            onClick={onLogout}
            className="border border-white/20 text-white hover:border-neon-pink hover:text-neon-pink px-6 py-2 uppercase tracking-widest text-sm transition-colors clip-angled"
          >
            Çıkış Yap
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Form */}
          <div className="lg:col-span-1">
            <div className="glass-panel p-6 clip-angled sticky top-28">
              <h2 className="text-xl font-bold text-white mb-6 uppercase tracking-wider border-b border-white/10 pb-4">
                {editingId ? 'Ürün Düzenle' : 'Yeni Ürün Ekle'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-gray-400 text-xs font-bold mb-1 uppercase tracking-wider">Ürün Adı *</label>
                  <input type="text" name="ad" value={formData.ad} onChange={handleInputChange} className="w-full bg-black/50 border border-white/10 text-white px-3 py-2 text-sm focus:border-neon-pink outline-none" required />
                </div>
                
                <div>
                  <label className="block text-gray-400 text-xs font-bold mb-1 uppercase tracking-wider">Fiyat (TL) *</label>
                  <input type="number" step="0.01" name="fiyat" value={formData.fiyat} onChange={handleInputChange} className="w-full bg-black/50 border border-white/10 text-white px-3 py-2 text-sm focus:border-neon-pink outline-none" required />
                </div>

                <div>
                  <label className="block text-gray-400 text-xs font-bold mb-1 uppercase tracking-wider">Görsel URL * (örn: /assets/siteimg/yeni1.jpg)</label>
                  <input type="text" name="gorsel" value={formData.gorsel} onChange={handleInputChange} className="w-full bg-black/50 border border-white/10 text-white px-3 py-2 text-sm focus:border-neon-pink outline-none" required />
                </div>

                <div>
                  <label className="block text-gray-400 text-xs font-bold mb-1 uppercase tracking-wider">Etiket (Yeni Sezon, Tükendi vb.)</label>
                  <input type="text" name="etiket" value={formData.etiket} onChange={handleInputChange} className="w-full bg-black/50 border border-white/10 text-white px-3 py-2 text-sm focus:border-neon-pink outline-none" />
                </div>

                <div>
                  <label className="block text-gray-400 text-xs font-bold mb-1 uppercase tracking-wider">Kategori (Elbise, Takım vb.)</label>
                  <input type="text" name="kategori" value={formData.kategori} onChange={handleInputChange} className="w-full bg-black/50 border border-white/10 text-white px-3 py-2 text-sm focus:border-neon-pink outline-none" />
                </div>

                <div>
                  <label className="block text-gray-400 text-xs font-bold mb-1 uppercase tracking-wider">Renk Seçenekleri (Virgülle Ayırın)</label>
                  <input type="text" name="renk" value={formData.renk} onChange={handleInputChange} className="w-full bg-black/50 border border-white/10 text-white px-3 py-2 text-sm focus:border-neon-pink outline-none" placeholder="Örn: Siyah, Kırmızı, Mavi" />
                </div>

                <div>
                  <label className="block text-gray-400 text-xs font-bold mb-1 uppercase tracking-wider">Beden Seçenekleri (Virgülle Ayırın)</label>
                  <input type="text" name="beden" value={formData.beden} onChange={handleInputChange} className="w-full bg-black/50 border border-white/10 text-white px-3 py-2 text-sm focus:border-neon-pink outline-none" placeholder="Örn: S, M, L, XL veya 38, 40, 42" />
                </div>

                <div className="pt-4 flex gap-2">
                  <button type="submit" className="flex-1 bg-neon-pink text-white font-bold py-3 uppercase tracking-widest text-sm hover:bg-white hover:text-black transition-colors clip-angled">
                    {editingId ? 'Güncelle' : 'Ekle'}
                  </button>
                  {editingId && (
                    <button type="button" onClick={cancelEdit} className="bg-transparent border border-white/20 text-white font-bold px-4 py-3 uppercase tracking-widest text-sm hover:border-white transition-colors clip-angled">
                      İptal
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* Product List */}
          <div className="lg:col-span-2">
            <div className="glass-panel p-6 clip-angled min-h-[600px]">
              <h2 className="text-xl font-bold text-white mb-6 uppercase tracking-wider border-b border-white/10 pb-4">
                Tüm Ürünler ({products.length})
              </h2>
              
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="w-12 h-12 border-4 border-neon-pink/20 border-t-neon-pink rounded-full animate-spin"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {products.map(product => (
                    <div key={product.id} className="bg-black/30 border border-white/5 p-4 flex items-center justify-between hover:border-white/20 transition-colors clip-angled group">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-20 bg-black overflow-hidden clip-angled relative">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={product.gorsel || product.resim1} alt={product.ad} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                        </div>
                        <div>
                          <h3 className="text-white font-bold text-lg">{product.ad}</h3>
                          <p className="text-neon-pink font-bold">{parseFloat(product.fiyat).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL</p>
                          <div className="flex gap-2 mt-1">
                            {product.etiket && <span className="text-[10px] uppercase bg-white/10 px-2 py-0.5 text-gray-300">{product.etiket}</span>}
                            {product.kategori && <span className="text-[10px] uppercase bg-white/10 px-2 py-0.5 text-gray-300">{product.kategori}</span>}
                          </div>
                          <div className="flex gap-2 mt-1">
                            {product.renk && <span className="text-[10px] uppercase text-gray-400 border border-gray-700 px-1">Renk: {product.renk}</span>}
                            {product.beden && <span className="text-[10px] uppercase text-gray-400 border border-gray-700 px-1">Beden: {product.beden}</span>}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-3">
                        <button onClick={() => handleEdit(product)} className="text-gray-400 hover:text-white transition-colors" title="Düzenle">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        </button>
                        <button onClick={() => handleDelete(product.id)} className="text-gray-400 hover:text-red-500 transition-colors" title="Sil">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
