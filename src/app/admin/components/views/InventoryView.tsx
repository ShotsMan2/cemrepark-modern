"use client";
import React, { useState, useEffect, useCallback } from "react";
import Swal from "sweetalert2";
import DataTable from "../DataTable";

interface Product {
  id: number;
  ad: string;
  fiyat: number;
  stok: number;
  kategori: string | null;
  gorsel?: string;
  resim?: string;
}

type StockFilter = "all" | "low" | "out" | "in";

export default function InventoryView() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [stockFilter, setStockFilter] = useState<StockFilter>("all");
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [bulkStockValue, setBulkStockValue] = useState<number>(0);
  const [showBulkUpdate, setShowBulkUpdate] = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Stok listesi yüklenirken hata:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const filteredProducts = products.filter((p) => {
    if (stockFilter === "low") return p.stok > 0 && p.stok <= 5;
    if (stockFilter === "out") return p.stok === 0;
    if (stockFilter === "in") return p.stok > 5;
    return true;
  });

  const lowStockCount = products.filter((p) => p.stok > 0 && p.stok <= 5).length;
  const outOfStockCount = products.filter((p) => p.stok === 0).length;
  const inStockCount = products.filter((p) => p.stok > 5).length;

  const handleBulkStockUpdate = async () => {
    if (selectedProducts.length === 0 || bulkStockValue < 0) return;
    const { value: mode } = await Swal.fire({
      title: "Toplu Stok Güncelle",
      text: `Seçili ${selectedProducts.length} ürün için stok miktarını nasıl güncellemek istersiniz?`,
      input: "select",
      inputOptions: { set: "Belirle", add: "Ekle", subtract: "Çıkar" },
      confirmButtonColor: "#ff007f",
      cancelButtonColor: "#333",
      showCancelButton: true,
      confirmButtonText: "Uygula",
      cancelButtonText: "İptal",
    });
    if (!mode) return;
    try {
      await Promise.all(
        selectedProducts.map((p) =>
          fetch(`/api/products/${p.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              stok:
                mode === "set"
                  ? bulkStockValue
                  : mode === "add"
                  ? p.stok + bulkStockValue
                  : Math.max(0, p.stok - bulkStockValue),
            }),
          })
        )
      );
      Swal.fire("Başarılı", `${selectedProducts.length} ürün stoğu güncellendi.`, "success");
      setSelectedProducts([]);
      setShowBulkUpdate(false);
      fetchProducts();
    } catch (err) {
      Swal.fire("Hata", "Stok güncellenirken hata oluştu.", "error");
    }
  };

  const getStockBadge = (stok: number) => {
    if (stok === 0) return { label: "Stokta Yok", class: "bg-red-500/20 text-red-400 border-red-500/30" };
    if (stok <= 5) return { label: "Kritik", class: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" };
    if (stok <= 20) return { label: "Düşük", class: "bg-orange-500/20 text-orange-400 border-orange-500/30" };
    return { label: "Stokta", class: "bg-green-500/20 text-green-400 border-green-500/30" };
  };

  const columns = [
    { key: "ad", header: "Ürün Adı", render: (row: Product) => (
      <div className="flex items-center gap-3">
        {(row.gorsel || row.resim) && (
          <img src={row.gorsel || row.resim} alt={row.ad} className="w-10 h-10 rounded-lg object-cover border border-glass-border" />
        )}
        <span className="font-bold text-foreground">{row.ad}</span>
      </div>
    )},
    { key: "kategori", header: "Kategori", render: (row: Product) => (
      <span className="text-foreground/70">{row.kategori || "-"}</span>
    )},
    { key: "stok", header: "Stok", render: (row: Product) => {
      const badge = getStockBadge(row.stok);
      return (
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${row.stok === 0 ? "bg-red-500" : row.stok <= 5 ? "bg-yellow-500" : "bg-green-500"}`} />
            <span className={`text-sm font-bold ${row.stok === 0 ? "text-red-400" : row.stok <= 5 ? "text-yellow-400" : "text-green-400"}`}>
              {row.stok}
            </span>
          </div>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.class}`}>
            {badge.label}
          </span>
        </div>
      );
    }},
    { key: "fiyat", header: "Fiyat", render: (row: Product) => (
      <span className="font-bold text-primary">{row.fiyat.toLocaleString("tr-TR")} ₺</span>
    )},
    { key: "stok_degeri", header: "Stok Değeri", render: (row: Product) => (
      <span className="text-foreground/80 font-bold">
        {(row.fiyat * row.stok).toLocaleString("tr-TR")} ₺
      </span>
    )},
  ];

  const bulkActions = (
    <div className="flex items-center gap-2">
      <button onClick={() => setShowBulkUpdate(!showBulkUpdate)} className="px-3 py-1.5 text-xs font-bold bg-primary/20 text-primary border border-primary/30 rounded hover:bg-primary/30 transition-colors">
        Stok Güncelle
      </button>
    </div>
  );

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-foreground uppercase tracking-widest">Stok Yönetimi</h2>
          <p className="text-foreground/50 text-sm mt-1">Ürün stok seviyelerini takip edin ve yönetin</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-panel p-4 clip-angled border border-glass-border text-center cursor-pointer hover:border-primary/30 transition-all" onClick={() => setStockFilter("all")}>
          <p className="text-2xl font-black text-foreground">{products.length}</p>
          <p className="text-xs text-foreground/50 font-bold uppercase tracking-widest">Tüm Ürünler</p>
        </div>
        <div className={`glass-panel p-4 clip-angled border cursor-pointer transition-all ${stockFilter === "in" ? "border-green-500/50 bg-green-500/10" : "border-glass-border hover:border-green-500/30"}`} onClick={() => setStockFilter("in")}>
          <p className="text-2xl font-black text-green-400">{inStockCount}</p>
          <p className="text-xs text-foreground/50 font-bold uppercase tracking-widest">Stokta</p>
        </div>
        <div className={`glass-panel p-4 clip-angled border cursor-pointer transition-all ${stockFilter === "low" ? "border-yellow-500/50 bg-yellow-500/10" : "border-glass-border hover:border-yellow-500/30"}`} onClick={() => setStockFilter("low")}>
          <p className="text-2xl font-black text-yellow-400">{lowStockCount}</p>
          <p className="text-xs text-foreground/50 font-bold uppercase tracking-widest">Düşük Stok</p>
        </div>
        <div className={`glass-panel p-4 clip-angled border cursor-pointer transition-all ${stockFilter === "out" ? "border-red-500/50 bg-red-500/10" : "border-glass-border hover:border-red-500/30"}`} onClick={() => setStockFilter("out")}>
          <p className="text-2xl font-black text-red-400">{outOfStockCount}</p>
          <p className="text-xs text-foreground/50 font-bold uppercase tracking-widest">Stokta Yok</p>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        {(["all", "in", "low", "out"] as StockFilter[]).map((f) => (
          <button key={f} onClick={() => setStockFilter(f)} className={`px-4 py-1.5 text-xs font-bold rounded clip-angled border transition-all ${stockFilter === f ? "bg-primary text-white border-primary" : "bg-foreground/5 text-foreground/70 border-glass-border hover:border-primary/50"}`}>
            {f === "all" ? "Tümü" : f === "in" ? "Stokta" : f === "low" ? "Düşük Stok" : "Stokta Yok"}
          </button>
        ))}
      </div>

      {showBulkUpdate && selectedProducts.length > 0 && (
        <div className="glass-panel p-5 clip-angled border border-primary/30 bg-primary/5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <span className="text-sm font-bold text-foreground">Seçili {selectedProducts.length} ürün için stok:</span>
          <input
            type="number"
            min="0"
            value={bulkStockValue}
            onChange={(e) => setBulkStockValue(Math.max(0, parseInt(e.target.value) || 0))}
            className="p-2 border border-glass-border rounded bg-background/50 text-foreground focus:outline-none focus:ring-2 focus:ring-primary w-24"
            placeholder="Miktar"
          />
          <button onClick={handleBulkStockUpdate} className="px-4 py-2 bg-primary text-white text-xs font-bold rounded hover:bg-primary/80 transition-colors">
            Uygula
          </button>
          <button onClick={() => { setShowBulkUpdate(false); setSelectedProducts([]); }} className="px-4 py-2 text-xs text-foreground/70 hover:text-foreground transition-colors">
            İptal
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="flex gap-2">
            <div className="w-3 h-3 bg-primary rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-secondary rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
            <div className="w-3 h-3 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
          </div>
        </div>
      ) : (
        <DataTable
          data={filteredProducts}
          columns={columns}
          pageSize={25}
          selectable={true}
          onSelectionChange={setSelectedProducts}
          bulkActions={selectedProducts.length > 0 ? bulkActions : undefined}
          exportable={true}
          exportFilename={`stok_listesi_${stockFilter}`}
          rowKey="id"
        />
      )}
    </div>
  );
}
