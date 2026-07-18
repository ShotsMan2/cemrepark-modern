import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Swal from "sweetalert2";

export default function ProductsView({
  products,
  isLoading,
  formData,
  editingId,
  handleInputChange,
  handleSubmit,
  handleEdit,
  handleDelete,
  cancelEdit,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCat, setSelectedCat] = useState("all");
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const categories = ["all", ...new Set(products.map((p) => p.kategori?.trim()).filter(Boolean))];

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.ad.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.kategori && product.kategori.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory =
      selectedCat === "all" ||
      (product.kategori && product.kategori.trim().toLowerCase() === selectedCat.toLowerCase());
    return matchesSearch && matchesCategory;
  });

  const [currentPage, setCurrentPage] = useState(1);
  useEffect(() => { setCurrentPage(1); }, [searchTerm, selectedCat]);

  const itemsPerPage = 8;
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleSelectAll = (e) => {
    if (e.target.checked) setSelectedProducts(paginatedProducts.map(p => p.id));
    else setSelectedProducts([]);
  };

  const handleSelectProduct = (id) => {
    if (selectedProducts.includes(id)) setSelectedProducts(prev => prev.filter(pId => pId !== id));
    else setSelectedProducts(prev => [...prev, id]);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const formDataObj = new FormData();
    formDataObj.append("file", file);

    try {
      // Simulating or using actual upload endpoint if exists
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formDataObj,
      });

      if (res.ok) {
        const data = await res.json();
        // Assuming API returns { url: "/uploads/..." }
        const imageUrl = data.url || data.filePath; 
        if(imageUrl) {
          handleInputChange({ target: { name: 'gorsel', value: imageUrl } });
          Swal.fire({ icon: 'success', title: 'Başarılı', text: 'Görsel yüklendi', timer: 1500, showConfirmButton: false });
        }
      } else {
        // Fallback for demo if API doesn't support generic upload yet
        Swal.fire("Uyarı", "Yükleme API'si yanıt vermedi. Lütfen URL olarak giriniz.", "warning");
      }
    } catch (error) {
      console.error("Upload failed", error);
      Swal.fire("Hata", "Görsel yüklenemedi.", "error");
    } finally {
      setIsUploading(false);
      if(fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
      {/* Product Form - 4 cols */}
      <div className="lg:col-span-4">
        <div className="glass-panel p-6 clip-angled sticky top-28 border border-glass-border">
          <div className="flex justify-between items-center mb-6 border-b border-glass-border pb-4">
            <h2 className="text-xl font-bold text-foreground uppercase tracking-wider">
              {editingId ? "Ürün Düzenle" : "Yeni Ürün Ekle"}
            </h2>
            {editingId && <span className="bg-primary/20 text-primary text-[10px] font-bold px-2 py-1 rounded uppercase tracking-widest animate-pulse">Düzenleniyor</span>}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-foreground/70 text-xs font-bold mb-1 uppercase tracking-wider">Ürün Adı *</label>
              <input type="text" name="ad" value={formData.ad} onChange={handleInputChange} className="w-full bg-foreground/5 border border-glass-border text-foreground px-3 py-2 text-sm focus:border-primary outline-none transition-colors" required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-foreground/70 text-xs font-bold mb-1 uppercase tracking-wider">Fiyat (TL) *</label>
                <input type="number" step="0.01" name="fiyat" value={formData.fiyat} onChange={handleInputChange} className="w-full bg-foreground/5 border border-glass-border text-foreground px-3 py-2 text-sm focus:border-primary outline-none transition-colors" required />
              </div>
              <div>
                <label className="block text-foreground/70 text-xs font-bold mb-1 uppercase tracking-wider">Stok *</label>
                <input type="number" name="stok" defaultValue="100" className="w-full bg-foreground/5 border border-glass-border text-foreground px-3 py-2 text-sm focus:border-primary outline-none transition-colors" required />
              </div>
            </div>

            <div>
              <label className="block text-foreground/70 text-xs font-bold mb-1 uppercase tracking-wider flex justify-between">
                <span>Görsel URL *</span>
                <button type="button" onClick={() => fileInputRef.current?.click()} className="text-primary hover:text-secondary flex items-center gap-1 transition-colors">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                  Yükle
                </button>
              </label>
              <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
              
              {isUploading ? (
                <div className="w-full bg-foreground/5 border border-glass-border p-3 text-sm text-center text-primary animate-pulse flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeDasharray="30"></circle></svg> Yükleniyor...
                </div>
              ) : (
                <div className="relative">
                  <input type="text" name="gorsel" value={formData.gorsel} onChange={handleInputChange} placeholder="URL girin veya yükleyin..." className="w-full bg-foreground/5 border border-glass-border text-foreground px-3 py-2 text-sm focus:border-primary outline-none transition-colors" required />
                  {formData.gorsel && (
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={formData.gorsel} alt="preview" className="w-full h-full object-cover" onError={(e) => e.target.style.display='none'} />
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-foreground/70 text-xs font-bold mb-1 uppercase tracking-wider">Kategori</label>
                <input type="text" name="kategori" value={formData.kategori} onChange={handleInputChange} className="w-full bg-foreground/5 border border-glass-border text-foreground px-3 py-2 text-sm focus:border-primary outline-none transition-colors" />
              </div>
              <div>
                <label className="block text-foreground/70 text-xs font-bold mb-1 uppercase tracking-wider">Etiket</label>
                <input type="text" name="etiket" value={formData.etiket} onChange={handleInputChange} className="w-full bg-foreground/5 border border-glass-border text-foreground px-3 py-2 text-sm focus:border-primary outline-none transition-colors" placeholder="Yeni Sezon vb." />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-foreground/70 text-xs font-bold mb-1 uppercase tracking-wider">Renkler</label>
                <input type="text" name="renk" value={formData.renk} onChange={handleInputChange} className="w-full bg-foreground/5 border border-glass-border text-foreground px-3 py-2 text-sm focus:border-primary outline-none transition-colors" placeholder="Siyah, Beyaz" />
              </div>
              <div>
                <label className="block text-foreground/70 text-xs font-bold mb-1 uppercase tracking-wider">Bedenler</label>
                <input type="text" name="beden" value={formData.beden} onChange={handleInputChange} className="w-full bg-foreground/5 border border-glass-border text-foreground px-3 py-2 text-sm focus:border-primary outline-none transition-colors" placeholder="S, M, L" />
              </div>
            </div>

            <div className="pt-4 flex gap-3">
              <button type="submit" className="flex-1 bg-primary text-white font-bold py-3 uppercase tracking-widest text-xs hover:bg-secondary transition-colors clip-angled shadow-[0_0_15px_hsla(var(--primary),0.3)]">
                {editingId ? "Güncelle" : "Ürünü Ekle"}
              </button>
              {editingId && (
                <button type="button" onClick={cancelEdit} className="bg-foreground/5 border border-glass-border text-foreground font-bold px-6 py-3 uppercase tracking-widest text-xs hover:bg-foreground/10 transition-colors clip-angled">
                  İptal
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Product List - 8 cols */}
      <div className="lg:col-span-8">
        <div className="glass-panel p-6 clip-angled min-h-[600px] border border-glass-border flex flex-col">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b border-glass-border pb-4">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-foreground uppercase tracking-wider">
                Tüm Ürünler <span className="text-sm text-foreground/50 ml-1">({filteredProducts.length})</span>
              </h2>
              {selectedProducts.length > 0 && (
                <span className="bg-primary/20 text-primary text-xs font-bold px-2 py-1 rounded animate-fade-in">
                  {selectedProducts.length} seçili
                </span>
              )}
            </div>
            
            <div className="flex flex-wrap gap-3 items-center w-full md:w-auto">
              {selectedProducts.length > 0 && (
                <button onClick={() => {
                  Swal.fire("Geliştirme Aşamasında", "Toplu işlemler API'si henüz aktif değil.", "info");
                }} className="text-xs bg-danger/20 text-danger border border-danger/30 hover:bg-danger hover:text-white px-3 py-2 rounded transition-colors font-bold uppercase tracking-widest">
                  Seçilileri Sil
                </button>
              )}
              <div className="relative group flex-1 md:flex-none">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                <input
                  type="text"
                  placeholder="Ürün Ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-foreground/5 border border-glass-border text-foreground pl-9 pr-4 py-2 focus:outline-none focus:border-primary text-sm w-full md:w-48 transition-colors"
                />
              </div>
              <select
                value={selectedCat}
                onChange={(e) => setSelectedCat(e.target.value)}
                className="bg-foreground/5 border border-glass-border text-foreground px-4 py-2 focus:outline-none focus:border-primary text-sm uppercase tracking-widest transition-colors cursor-pointer"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat} className="bg-background text-foreground">
                    {cat === "all" ? "Tüm Kategoriler" : cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {isLoading ? (
            <div className="flex-1 flex justify-center items-center h-64">
              <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="border-b border-glass-border bg-foreground/5 text-foreground/60 text-xs uppercase tracking-widest">
                    <th className="p-3 w-10 text-center">
                      <input type="checkbox" onChange={handleSelectAll} checked={selectedProducts.length === paginatedProducts.length && paginatedProducts.length > 0} className="accent-primary" />
                    </th>
                    <th className="p-3 font-bold w-16 text-center">Görsel</th>
                    <th className="p-3 font-bold">Ürün Adı</th>
                    <th className="p-3 font-bold">Kategori / Etiket</th>
                    <th className="p-3 font-bold text-right">Fiyat</th>
                    <th className="p-3 font-bold text-right">İşlem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-glass-border">
                  {paginatedProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-foreground/5 transition-colors group">
                      <td className="p-3 text-center">
                        <input type="checkbox" checked={selectedProducts.includes(product.id)} onChange={() => handleSelectProduct(product.id)} className="accent-primary" />
                      </td>
                      <td className="p-3">
                        <div className="w-10 h-14 bg-background overflow-hidden rounded relative mx-auto border border-glass-border">
                          <Image
                            src={product.gorsel || product.resim1 || '/assets/placeholder.png'}
                            alt={product.ad}
                            fill
                            sizes="40px"
                            className="object-cover group-hover:scale-110 transition-transform"
                          />
                        </div>
                      </td>
                      <td className="p-3">
                        <p className="font-bold text-foreground text-sm truncate max-wxs">{product.ad}</p>
                        <div className="flex gap-2 mt-1">
                          {product.renk && <span className="text-[9px] text-foreground/50">Renk: {product.renk}</span>}
                          {product.beden && <span className="text-[9px] text-foreground/50">Beden: {product.beden}</span>}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex flex-col items-start gap-1">
                          <span className="text-foreground/80 text-xs font-medium">{product.kategori || "-"}</span>
                          {product.etiket && (
                            <span className="text-[9px] uppercase bg-primary/20 text-primary px-1.5 py-0.5 rounded font-bold tracking-widest">
                              {product.etiket}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-3 text-right">
                        <span className="text-foreground font-black text-sm">
                          {parseFloat(product.fiyat).toLocaleString("tr-TR", { minimumFractionDigits: 2 })} ₺
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex justify-end gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleEdit(product)} className="w-8 h-8 rounded bg-foreground/5 hover:bg-primary hover:text-white flex items-center justify-center transition-colors text-foreground" title="Düzenle">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                          </button>
                          <button onClick={() => handleDelete(product.id)} className="w-8 h-8 rounded bg-foreground/5 hover:bg-danger hover:text-white flex items-center justify-center transition-colors text-foreground" title="Sil">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {paginatedProducts.length === 0 && (
                    <tr>
                      <td colSpan="6" className="p-8 text-center text-foreground/50">Ürün bulunamadı.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Controls */}
          {!isLoading && totalPages > 1 && (
            <div className="border-t border-glass-border pt-4 mt-auto flex justify-between items-center text-foreground/50 text-xs uppercase tracking-widest">
              <span>{filteredProducts.length} Ürün Listeleniyor</span>
              <div className="flex gap-1">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="w-8 h-8 flex items-center justify-center border border-glass-border hover:border-primary hover:text-primary transition-colors disabled:opacity-30 disabled:hover:border-glass-border disabled:hover:text-foreground/50"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
                </button>
                <span className="h-8 px-4 flex items-center justify-center bg-foreground/5 text-foreground font-bold">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="w-8 h-8 flex items-center justify-center border border-glass-border hover:border-primary hover:text-primary transition-colors disabled:opacity-30 disabled:hover:border-glass-border disabled:hover:text-foreground/50"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
