"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Swal from "sweetalert2";
import { getValidImageUrl } from "@/utils/imageHelper";
import { motion } from "framer-motion";
import { Search, Download, Copy, X, Filter, ChevronDown, ChevronUp } from "lucide-react";

export default function ProductsView({
  formData,
  editingId,
  handleInputChange,
  handleSubmit,
  handleEdit,
  handleDelete,
  cancelEdit,
  products,
  isLoading,
}: any) {
  const [productsData, setProductsData] = useState<any[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingLocal, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const itemsPerPage = 10;

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState("all");
  const [stockStatus, setStockStatus] = useState("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateAddedStart, setDateAddedStart] = useState("");
  const [dateAddedEnd, setDateAddedEnd] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [viewMode, setViewMode] = useState("list");
  const [sortBy, setSortBy] = useState("tarih");
  const [sortOrder, setSortOrder] = useState("desc");
  const [categories, setCategories] = useState<string[]>(["all"]);
  const [bulkAction, setBulkAction] = useState("");
  const [editingStockId, setEditingStockId] = useState<string | null>(null);
  const [editingStockValue, setEditingStockValue] = useState<number>(0);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  const [openSections, setOpenSections] = useState({ temel: true, fiyatStok: true, seoMedya: true });
  const toggleSection = (sec: string) => setOpenSections((prev) => ({ ...prev, [sec]: !prev[sec as keyof typeof prev] }));

  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => setDebouncedSearch(searchTerm), 400);
    return () => { if (debounceTimer.current) clearTimeout(debounceTimer.current); };
  }, [searchTerm]);

  useEffect(() => {
    fetchProducts();
  }, [currentPage, debouncedSearch, selectedCat, stockStatus, minPrice, maxPrice, statusFilter, dateAddedStart, dateAddedEnd, sortBy, sortOrder]);

  const fetchProducts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams({ page: String(currentPage), limit: String(itemsPerPage), sortBy, sortOrder });
      if (debouncedSearch) query.append("search", debouncedSearch);
      if (selectedCat && selectedCat !== "all") query.append("category", selectedCat);
      if (stockStatus !== "all") query.append("stockStatus", stockStatus);
      if (minPrice) query.append("minPrice", minPrice);
      if (maxPrice) query.append("maxPrice", maxPrice);
      if (statusFilter !== "all") query.append("status", statusFilter);
      if (dateAddedStart) query.append("dateStart", dateAddedStart);
      if (dateAddedEnd) query.append("dateEnd", dateAddedEnd);

      const res = await fetch(`/api/products?${query.toString()}`);
      if (res.ok) {
        const data = await res.json();
        let fetchedData = data.data || [];
        fetchedData = [...fetchedData].sort((a: any, b: any) => {
          let valA = a[sortBy], valB = b[sortBy];
          if (sortBy === "fiyat" || sortBy === "stok") { valA = Number(valA || 0); valB = Number(valB || 0); }
          if (valA < valB) return sortOrder === "asc" ? -1 : 1;
          if (valA > valB) return sortOrder === "asc" ? 1 : -1;
          return 0;
        });
        setProductsData(fetchedData);
        setTotalProducts(data.total || fetchedData.length);
        setTotalPages(data.totalPages || Math.ceil((data.total || fetchedData.length) / itemsPerPage));
      }

      if (categories.length === 1) {
        const allRes = await fetch("/api/products");
        if (allRes.ok) {
          const allData = await allRes.json();
          const cats = ["all", ...new Set((Array.isArray(allData) ? allData : []).map((p: any) => p.kategori?.trim()).filter(Boolean))];
          setCategories(cats);
        }
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
      setError("Ürünler yüklenirken hata oluştu");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) setSelectedProducts(productsData.map((p: any) => p.id));
    else setSelectedProducts([]);
  };

  const handleSelectProduct = (id: string) => {
    if (selectedProducts.includes(id)) setSelectedProducts((prev) => prev.filter((pId) => pId !== id));
    else setSelectedProducts((prev) => [...prev, id]);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    const formDataObj = new FormData();
    formDataObj.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formDataObj });
      if (res.ok) {
        const data = await res.json();
        const imageUrl = data.url || data.filePath;
        if (imageUrl) {
          handleInputChange({ target: { name: "gorsel", value: imageUrl } });
          Swal.fire({ icon: "success", title: "Başarılı", text: "Görsel yüklendi", timer: 1500, showConfirmButton: false });
        }
      } else {
        Swal.fire("Uyarı", "Yükleme başarısız. Lütfen URL girin.", "warning");
      }
    } catch { Swal.fire("Hata", "Görsel yüklenemedi.", "error"); }
    finally { setIsUploading(false); if (fileInputRef.current) fileInputRef.current.value = ""; }
  };

  const resetFilters = () => {
    setSearchTerm(""); setDebouncedSearch(""); setSelectedCat("all"); setStockStatus("all");
    setMinPrice(""); setMaxPrice(""); setStatusFilter("all"); setDateAddedStart(""); setDateAddedEnd("");
    setCurrentPage(1);
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedProducts.length === 0) return;
    const actionText = bulkAction === "delete" ? "Silinecek" : bulkAction === "stock" ? "Stok Güncellenecek" : "Kategori Değiştirilecek";
    const result = await Swal.fire({
      title: "Emin misiniz?", text: `${selectedProducts.length} ürün için ${actionText}.`, icon: "warning",
      showCancelButton: true, confirmButtonColor: "var(--primary)", cancelButtonColor: "#d33",
      confirmButtonText: "Evet, Uygula", cancelButtonText: "İptal",
    });
    if (result.isConfirmed) {
      Swal.fire("Başarılı", "Toplu işlem tamamlandı.", "success");
      setBulkAction("");
      setSelectedProducts([]);
      fetchProducts();
    }
  };

  const exportCSV = () => {
    const dataToExport = selectedProducts.length > 0 ? productsData.filter((p: any) => selectedProducts.includes(p.id)) : productsData;
    const headers = ["Ad", "Fiyat", "Kategori", "Stok", "Beden", "Renk", "Etiket"];
    const csvContent = [headers.join(","), ...dataToExport.map((p: any) => `"${p.ad || ""}","${p.fiyat || 0}","${p.kategori || ""}","${p.stok || 0}","${p.beden || ""}","${p.renk || ""}","${p.etiket || ""}"`)].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.setAttribute("href", URL.createObjectURL(blob));
    link.setAttribute("download", `urunler_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  const handleDuplicate = async (product: any) => {
    const newProduct = { ...product, id: undefined, ad: product.ad + " (Kopya)" };
    try {
      const res = await fetch("/api/products", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(newProduct) });
      if (res.ok) {
        Swal.fire("Başarılı", "Ürün kopyalandı.", "success");
        fetchProducts();
      }
    } catch {}
  };

  const handleInlineStockSave = async (id: string) => {
    try {
      const res = await fetch(`/api/products/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ stok: editingStockValue }) });
      if (res.ok) {
        Swal.fire({ toast: true, icon: "success", title: "Stok güncellendi", timer: 1500, showConfirmButton: false });
        setEditingStockId(null);
        fetchProducts();
      }
    } catch {}
  };

  const getStockBadge = (stok: number) => {
    const s = Number(stok) || 0;
    if (s <= 0) return <span className="bg-danger/20 text-danger text-[10px] px-2 py-1 rounded font-bold uppercase">Stok Yok</span>;
    if (s < 10) return <span className="bg-warning/20 text-warning text-[10px] px-2 py-1 rounded font-bold uppercase">Düşük Stok ({s})</span>;
    return <span className="bg-success/20 text-success text-[10px] px-2 py-1 rounded font-bold uppercase">Stokta ({s})</span>;
  };

  const handleSort = (col: string) => {
    if (sortBy === col) setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    else { setSortBy(col); setSortOrder("desc"); }
  };

  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      <div className="glass-panel p-4 clip-angled border border-glass-border">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-foreground uppercase tracking-wider">
              Ürün Yönetimi <span className="text-sm text-foreground/50 ml-1">({totalProducts} Ürün)</span>
            </h2>
            <button onClick={exportCSV} className="bg-foreground/5 border border-glass-border hover:bg-primary hover:text-foreground px-3 py-1.5 text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-2">
              <Download size={16} /> CSV İndir
            </button>
            <button onClick={() => setShowFilters(!showFilters)} className={`bg-foreground/5 border ${showFilters ? "border-primary text-primary" : "border-glass-border"} hover:bg-primary/20 px-3 py-1.5 text-xs font-bold uppercase transition-colors flex items-center gap-2`}>
              <Filter size={14} /> Filtreler
            </button>
          </div>
          <div className="flex flex-wrap gap-2 items-center w-full md:w-auto">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/50" />
              <input type="text" placeholder="Ürün Ara..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="bg-foreground/5 border border-glass-border text-foreground pl-9 pr-3 py-1.5 text-sm focus:border-primary outline-none transition-colors w-full md:w-48" />
            </div>
            <select value={selectedCat} onChange={(e) => setSelectedCat(e.target.value)} className="bg-foreground/5 border border-glass-border text-foreground px-3 py-1.5 text-sm outline-none">
              {categories.map((cat) => (<option key={cat} value={cat} className="bg-background text-foreground">{cat === "all" ? "Tüm Kategoriler" : cat}</option>))}
            </select>
            <select value={stockStatus} onChange={(e) => setStockStatus(e.target.value)} className="bg-foreground/5 border border-glass-border text-foreground px-3 py-1.5 text-sm outline-none">
              <option value="all">Tüm Stok</option>
              <option value="in_stock">Stokta</option>
              <option value="low_stock">Düşük Stok</option>
              <option value="out_of_stock">Stok Yok</option>
            </select>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-foreground/5 border border-glass-border text-foreground px-3 py-1.5 text-sm outline-none">
              <option value="all">Tüm Durumlar</option>
              <option value="active">Aktif</option>
              <option value="passive">Pasif</option>
            </select>
            <button onClick={resetFilters} className="text-xs bg-foreground/10 text-foreground hover:bg-foreground/20 px-3 py-1.5 font-bold uppercase transition-colors">Temizle</button>
          </div>
        </div>
        {showFilters && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="mt-4 pt-4 border-t border-glass-border grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-[10px] text-foreground/50 font-bold uppercase mb-1">Min Fiyat</label>
              <input type="number" placeholder="Min ₺" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} className="w-full bg-foreground/5 border border-glass-border text-foreground px-2 py-1.5 text-sm outline-none" />
            </div>
            <div>
              <label className="block text-[10px] text-foreground/50 font-bold uppercase mb-1">Max Fiyat</label>
              <input type="number" placeholder="Max ₺" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} className="w-full bg-foreground/5 border border-glass-border text-foreground px-2 py-1.5 text-sm outline-none" />
            </div>
            <div>
              <label className="block text-[10px] text-foreground/50 font-bold uppercase mb-1">Başlangıç Tarihi</label>
              <input type="date" value={dateAddedStart} onChange={(e) => setDateAddedStart(e.target.value)} className="w-full bg-foreground/5 border border-glass-border text-foreground px-2 py-1.5 text-sm outline-none" />
            </div>
            <div>
              <label className="block text-[10px] text-foreground/50 font-bold uppercase mb-1">Bitiş Tarihi</label>
              <input type="date" value={dateAddedEnd} onChange={(e) => setDateAddedEnd(e.target.value)} className="w-full bg-foreground/5 border border-glass-border text-foreground px-2 py-1.5 text-sm outline-none" />
            </div>
          </motion.div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4">
          <div className="glass-panel p-6 clip-angled sticky top-28 border border-glass-border max-h-[80vh] overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-center mb-6 border-b border-glass-border pb-4">
              <h2 className="text-lg font-bold text-foreground uppercase tracking-wider">{editingId ? "Ürün Düzenle" : "Yeni Ürün Ekle"}</h2>
              {editingId && <span className="bg-primary/20 text-primary text-[10px] font-bold px-2 py-1 rounded uppercase tracking-widest animate-pulse">Düzenleniyor</span>}
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="border border-glass-border p-3 bg-foreground/5">
                <div className="flex justify-between items-center cursor-pointer mb-2" onClick={() => toggleSection("temel")}>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-primary">Temel Bilgiler</h3>
                  <span>{openSections.temel ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</span>
                </div>
                {openSections.temel && (
                  <div className="space-y-3 mt-3 animate-fade-in">
                    <div>
                      <label className="block text-foreground/70 text-xs font-bold mb-1 uppercase">Ürün Adı *</label>
                      <input type="text" name="ad" value={formData.ad || ""} onChange={handleInputChange} className="w-full bg-background border border-glass-border text-foreground px-3 py-2 text-sm focus:border-primary outline-none transition-colors" required />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-foreground/70 text-xs font-bold mb-1 uppercase">Kategori</label>
                        <input type="text" name="kategori" value={formData.kategori || ""} onChange={handleInputChange} className="w-full bg-background border border-glass-border text-foreground px-3 py-2 text-sm focus:border-primary outline-none transition-colors" />
                      </div>
                      <div>
                        <label className="block text-foreground/70 text-xs font-bold mb-1 uppercase">Etiket</label>
                        <input type="text" name="etiket" value={formData.etiket || ""} onChange={handleInputChange} className="w-full bg-background border border-glass-border text-foreground px-3 py-2 text-sm focus:border-primary outline-none transition-colors" placeholder="Yeni Sezon vb." />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-foreground/70 text-xs font-bold mb-1 uppercase">Renkler</label>
                        <input type="text" name="renk" value={formData.renk || ""} onChange={handleInputChange} className="w-full bg-background border border-glass-border text-foreground px-3 py-2 text-sm focus:border-primary outline-none transition-colors" placeholder="Siyah, Beyaz" />
                      </div>
                      <div>
                        <label className="block text-foreground/70 text-xs font-bold mb-1 uppercase">Bedenler</label>
                        <input type="text" name="beden" value={formData.beden || ""} onChange={handleInputChange} className="w-full bg-background border border-glass-border text-foreground px-3 py-2 text-sm focus:border-primary outline-none transition-colors" placeholder="S, M, L" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="border border-glass-border p-3 bg-foreground/5">
                <div className="flex justify-between items-center cursor-pointer mb-2" onClick={() => toggleSection("fiyatStok")}>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-secondary">Fiyat & Stok</h3>
                  <span>{openSections.fiyatStok ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</span>
                </div>
                {openSections.fiyatStok && (
                  <div className="space-y-3 mt-3 animate-fade-in">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-foreground/70 text-xs font-bold mb-1 uppercase">Fiyat (TL) *</label>
                        <input type="number" step="0.01" name="fiyat" value={formData.fiyat || ""} onChange={handleInputChange} className="w-full bg-background border border-glass-border text-foreground px-3 py-2 text-sm focus:border-primary outline-none transition-colors" required />
                      </div>
                      <div>
                        <label className="block text-foreground/70 text-xs font-bold mb-1 uppercase">Stok *</label>
                        <input type="number" name="stok" value={formData.stok !== undefined ? formData.stok : 100} onChange={handleInputChange} className="w-full bg-background border border-glass-border text-foreground px-3 py-2 text-sm focus:border-primary outline-none transition-colors" required />
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="border border-glass-border p-3 bg-foreground/5">
                <div className="flex justify-between items-center cursor-pointer mb-2" onClick={() => toggleSection("seoMedya")}>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-accent">SEO & Medya</h3>
                  <span>{openSections.seoMedya ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</span>
                </div>
                {openSections.seoMedya && (
                  <div className="space-y-3 mt-3 animate-fade-in">
                    <div>
                      <label className="block text-foreground/70 text-xs font-bold mb-1 uppercase flex justify-between">
                        <span>Görsel URL *</span>
                        <button type="button" onClick={() => fileInputRef.current?.click()} className="text-primary hover:text-secondary flex items-center gap-1 transition-colors">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                          Yükle
                        </button>
                      </label>
                      <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
                      {isUploading ? (
                        <div className="w-full bg-background border border-glass-border p-3 text-sm text-center text-primary animate-pulse">Yükleniyor...</div>
                      ) : (
                        <div className="relative">
                          <input type="text" name="gorsel" value={formData.gorsel || ""} onChange={handleInputChange} placeholder="URL girin veya yükleyin..." className="w-full bg-background border border-glass-border text-foreground px-3 py-2 text-sm focus:border-primary outline-none transition-colors" required />
                          {formData.gorsel && (
                            <div className="mt-2 flex gap-2">
                              <div className="w-16 h-16 rounded overflow-hidden border border-glass-border relative">
                                <img src={formData.gorsel} alt="preview" className="w-full h-full object-cover" onError={(e) => ((e.target as HTMLElement).style.display = "none")} />
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-foreground/70 text-xs font-bold mb-1 uppercase">SEO Meta Title</label>
                      <input type="text" name="metaTitle" value={formData.metaTitle || ""} onChange={handleInputChange} className="w-full bg-background border border-glass-border text-foreground px-3 py-2 text-sm focus:border-primary outline-none transition-colors" />
                    </div>
                    <div>
                      <label className="block text-foreground/70 text-xs font-bold mb-1 uppercase">SEO Meta Description</label>
                      <textarea name="metaDescription" value={formData.metaDescription || ""} onChange={handleInputChange} className="w-full bg-background border border-glass-border text-foreground px-3 py-2 text-sm focus:border-primary outline-none transition-colors h-16 resize-none" />
                    </div>
                  </div>
                )}
              </div>
              <div className="pt-4 flex gap-3">
                <button type="submit" className="flex-1 bg-primary text-foreground font-bold py-3 uppercase tracking-widest text-xs hover:bg-secondary transition-colors clip-angled shadow-[0_0_15px_hsla(var(--primary),0.3)]">
                  {editingId ? "Güncelle" : "Ürünü Ekle"}
                </button>
                {editingId && (
                  <button type="button" onClick={cancelEdit} className="bg-foreground/5 border border-glass-border text-foreground font-bold px-6 py-3 uppercase tracking-widest text-xs hover:bg-foreground/10 transition-colors clip-angled">İptal</button>
                )}
              </div>
            </form>
          </div>
        </div>
        <div className="lg:col-span-8">
          <div className="glass-panel p-6 clip-angled min-h-[600px] border border-glass-border flex flex-col">
            <div className="flex justify-between items-center mb-4 bg-foreground/5 p-3 border border-glass-border">
              <div className="flex items-center gap-4">
                <input type="checkbox" onChange={handleSelectAll} checked={selectedProducts.length === productsData.length && productsData.length > 0} className="accent-primary w-4 h-4" />
                <span className="text-sm font-bold uppercase tracking-wider text-foreground/70">Tümünü Seç</span>
                {selectedProducts.length > 0 && (
                  <div className="flex items-center gap-2 ml-4">
                    <select value={bulkAction} onChange={(e) => setBulkAction(e.target.value)} className="bg-background border border-glass-border text-foreground text-xs px-2 py-1 outline-none">
                      <option value="">Toplu İşlem</option>
                      <option value="delete">Toplu Sil</option>
                      <option value="stock">Stok Güncelle</option>
                      <option value="category">Kategori Değiştir</option>
                    </select>
                    <button onClick={handleBulkAction} disabled={!bulkAction} className="bg-primary/20 text-primary hover:bg-primary hover:text-foreground px-3 py-1 text-xs font-bold uppercase disabled:opacity-50 transition-colors">Uygula</button>
                    <span className="text-xs text-foreground/50 ml-2">{selectedProducts.length} seçili</span>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <button onClick={() => setViewMode("grid")} className={`p-1.5 border ${viewMode === "grid" ? "border-primary text-primary" : "border-glass-border text-foreground/50"}`}>
                  <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect x="3" y="3" width={18} height={18} /><rect x="14" y="3" width={18} height={18} /><rect x="14" y="14" width={18} height={18} /><rect x="3" y="14" width={18} height={18} /></svg>
                </button>
                <button onClick={() => setViewMode("list")} className={`p-1.5 border ${viewMode === "list" ? "border-primary text-primary" : "border-glass-border text-foreground/50"}`}>
                  <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>
                </button>
              </div>
            </div>

            {isLoadingLocal || isLoading ? (
              <div className="flex-1 flex justify-center items-center h-64">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
              </div>
            ) : error ? (
              <div className="flex-1 flex flex-col items-center justify-center h-64 gap-3">
                <p className="text-danger text-sm font-bold">{error}</p>
                <button onClick={fetchProducts} className="bg-primary text-foreground px-4 py-2 text-xs font-bold uppercase clip-angled">Tekrar Dene</button>
              </div>
            ) : productsData.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center h-64 gap-3">
                <p className="text-foreground/50 text-sm font-bold">Ürün bulunamadı</p>
                <p className="text-foreground/30 text-xs">Filtreleri temizleyip tekrar deneyin</p>
              </div>
            ) : (
              <div className="flex-1 overflow-x-auto">
                {viewMode === "list" ? (
                  <table className="w-full text-left border-collapse whitespace-nowrap min-w-[800px]">
                    <thead>
                      <tr className="border-b border-glass-border bg-foreground/5 text-foreground/60 text-xs uppercase tracking-widest">
                        <th className="p-3 w-10 text-center"></th>
                        <th className="p-3 font-bold w-16 text-center">Görsel</th>
                        <th className="p-3 font-bold cursor-pointer hover:text-primary" onClick={() => handleSort("ad")}>Ürün Adı {sortBy === "ad" && (sortOrder === "asc" ? "↑" : "↓")}</th>
                        <th className="p-3 font-bold">Kategori</th>
                        <th className="p-3 font-bold text-center cursor-pointer hover:text-primary" onClick={() => handleSort("stok")}>Stok {sortBy === "stok" && (sortOrder === "asc" ? "↑" : "↓")}</th>
                        <th className="p-3 font-bold text-right cursor-pointer hover:text-primary" onClick={() => handleSort("fiyat")}>Fiyat {sortBy === "fiyat" && (sortOrder === "asc" ? "↑" : "↓")}</th>
                        <th className="p-3 font-bold text-right">İşlem</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-glass-border">
                      {productsData.map((product: any) => (
                        <tr key={product.id} className="hover:bg-foreground/5 transition-colors group">
                          <td className="p-3 text-center">
                            <input type="checkbox" checked={selectedProducts.includes(product.id)} onChange={() => handleSelectProduct(product.id)} className="accent-primary w-4 h-4" />
                          </td>
                          <td className="p-3">
                            <div className="w-12 h-16 bg-background overflow-hidden rounded relative mx-auto border border-glass-border cursor-pointer" onClick={() => setPreviewImage(getValidImageUrl(product.gorsel || product.resim || ""))}>
                              <Image src={getValidImageUrl(product.gorsel || product.resim || "")} alt={product.ad || "Ürün"} fill sizes="48px" className="object-cover group-hover:scale-110 transition-transform" />
                            </div>
                          </td>
                          <td className="p-3">
                            <p className="font-bold text-foreground text-sm truncate max-w-[200px]">{product.ad}</p>
                            <div className="flex gap-2 mt-1">
                              {product.renk && <span className="text-[10px] text-foreground/50 bg-background px-1 border border-glass-border rounded">Renk: {product.renk}</span>}
                              {product.beden && <span className="text-[10px] text-foreground/50 bg-background px-1 border border-glass-border rounded">Beden: {product.beden}</span>}
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="flex flex-col items-start gap-1">
                              <span className="text-foreground/80 text-xs font-medium">{product.kategori || "-"}</span>
                              {product.etiket && <span className="text-[9px] uppercase bg-primary/20 text-primary px-1.5 py-0.5 rounded font-bold tracking-widest">{product.etiket}</span>}
                            </div>
                          </td>
                          <td className="p-3 text-center">
                            {editingStockId === product.id ? (
                              <div className="flex items-center justify-center gap-1">
                                <input type="number" value={editingStockValue} onChange={(e) => setEditingStockValue(Number(e.target.value))} className="w-16 bg-background border border-primary text-foreground text-xs px-1 py-0.5 outline-none text-center" autoFocus />
                                <button onClick={() => handleInlineStockSave(product.id)} className="text-success hover:text-success">
                                  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polyline points="20 6 9 17 4 12"></polyline></svg>
                                </button>
                                <button onClick={() => setEditingStockId(null)} className="text-danger hover:text-danger">
                                  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                </button>
                              </div>
                            ) : (
                              <div onClick={() => { setEditingStockId(product.id); setEditingStockValue(Number(product.stok) || 0); }} className="cursor-pointer">
                                {getStockBadge(product.stok !== undefined ? product.stok : 100)}
                              </div>
                            )}
                          </td>
                          <td className="p-3 text-right">
                            <span className="text-foreground font-black text-sm">{parseFloat(product.fiyat || 0).toLocaleString("tr-TR", { minimumFractionDigits: 2 })} ₺</span>
                          </td>
                          <td className="p-3 text-right">
                            <div className="flex justify-end gap-1 opacity-50 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => handleEdit(product)} className="w-7 h-7 rounded bg-foreground/5 hover:bg-primary hover:text-foreground flex items-center justify-center transition-colors text-foreground" title="Düzenle">
                                <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                              </button>
                              <button onClick={() => handleDuplicate(product)} className="w-7 h-7 rounded bg-foreground/5 hover:bg-info hover:text-foreground flex items-center justify-center transition-colors text-foreground" title="Çoğalt">
                                <Copy size={14} />
                              </button>
                              <button onClick={() => handleDelete(product.id)} className="w-7 h-7 rounded bg-foreground/5 hover:bg-danger hover:text-foreground flex items-center justify-center transition-colors text-foreground" title="Sil">
                                <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path></svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 p-2">
                    {productsData.map((product: any) => (
                      <div key={product.id} className="border border-glass-border bg-foreground/5 p-3 rounded group relative">
                        <div className="absolute top-2 left-2 z-10">
                          <input type="checkbox" checked={selectedProducts.includes(product.id)} onChange={() => handleSelectProduct(product.id)} className="accent-primary w-4 h-4" />
                        </div>
                        <div className="w-full h-40 bg-background overflow-hidden rounded relative mb-3 border border-glass-border cursor-pointer" onClick={() => setPreviewImage(getValidImageUrl(product.gorsel || product.resim || ""))}>
                          <Image src={getValidImageUrl(product.gorsel || product.resim || "")} alt={product.ad || "Ürün"} fill sizes="200px" className="object-cover group-hover:scale-110 transition-transform" />
                        </div>
                        <h4 className="font-bold text-sm truncate mb-1" title={product.ad}>{product.ad}</h4>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs text-foreground/60">{product.kategori || "Kategorisiz"}</span>
                          <span className="font-black text-primary">{parseFloat(product.fiyat || 0).toLocaleString("tr-TR")} ₺</span>
                        </div>
                        <div className="flex justify-between items-center mb-3">{getStockBadge(product.stok !== undefined ? product.stok : 100)}</div>
                        <div className="flex gap-2">
                          <button onClick={() => handleEdit(product)} className="flex-1 text-xs bg-foreground/10 hover:bg-primary py-1.5 transition-colors font-bold uppercase text-center">Düzenle</button>
                          <button onClick={() => handleDuplicate(product)} className="w-8 flex items-center justify-center bg-foreground/10 hover:bg-info text-info hover:text-foreground transition-colors" title="Çoğalt"><Copy size={14} /></button>
                          <button onClick={() => handleDelete(product.id)} className="w-8 flex items-center justify-center bg-foreground/10 hover:bg-danger text-danger hover:text-foreground transition-colors">
                            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {!isLoadingLocal && !isLoading && totalPages > 0 && (
              <div className="border-t border-glass-border pt-4 mt-auto flex justify-between items-center text-foreground/50 text-xs uppercase tracking-widest">
                <span>{totalProducts} Ürün Listeleniyor</span>
                <div className="flex gap-1">
                  <button onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="w-8 h-8 flex items-center justify-center border border-glass-border hover:border-primary hover:text-primary transition-colors disabled:opacity-30">
                    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M15 18l-6-6 6-6" /></svg>
                  </button>
                  <span className="h-8 px-4 flex items-center justify-center bg-foreground/5 text-foreground font-bold">{currentPage} / {totalPages}</span>
                  <button onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="w-8 h-8 flex items-center justify-center border border-glass-border hover:border-primary hover:text-primary transition-colors disabled:opacity-30">
                    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M9 18l6-6-6-6" /></svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {previewImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={() => setPreviewImage(null)}>
          <div className="relative max-w-3xl max-h-[90vh]">
            <button onClick={() => setPreviewImage(null)} className="absolute -top-10 right-0 text-foreground/50 hover:text-foreground transition-colors">
              <X size={24} />
            </button>
            <Image src={previewImage} alt="Preview" width={800} height={600} className="object-contain rounded-lg" />
          </div>
        </div>
      )}
    </div>
  );
}
