import { useState } from "react";

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

  // Get unique categories from products
  const categories = ["all", ...new Set(products.map((p) => p.kategori?.trim()).filter(Boolean))];

  // Filter products based on search term and selected category
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.ad.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.kategori && product.kategori.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory =
      selectedCat === "all" ||
      (product.kategori && product.kategori.trim().toLowerCase() === selectedCat.toLowerCase());

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
      {/* Form */}
      <div className="lg:col-span-1">
        <div className="glass-panel p-6 clip-angled sticky top-28">
          <h2 className="text-xl font-bold text-white mb-6 uppercase tracking-wider border-b border-white/10 pb-4">
            {editingId ? "Ürün Düzenle" : "Yeni Ürün Ekle"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-400 text-xs font-bold mb-1 uppercase tracking-wider">
                Ürün Adı *
              </label>
              <input
                type="text"
                name="ad"
                value={formData.ad}
                onChange={handleInputChange}
                className="w-full bg-black/50 border border-white/10 text-white px-3 py-2 text-sm focus:border-neon-pink outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-gray-400 text-xs font-bold mb-1 uppercase tracking-wider">
                Fiyat (TL) *
              </label>
              <input
                type="number"
                step="0.01"
                name="fiyat"
                value={formData.fiyat}
                onChange={handleInputChange}
                className="w-full bg-black/50 border border-white/10 text-white px-3 py-2 text-sm focus:border-neon-pink outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-gray-400 text-xs font-bold mb-1 uppercase tracking-wider">
                Görsel URL * (örn: /assets/siteimg/yeni1.jpg)
              </label>
              <input
                type="text"
                name="gorsel"
                value={formData.gorsel}
                onChange={handleInputChange}
                className="w-full bg-black/50 border border-white/10 text-white px-3 py-2 text-sm focus:border-neon-pink outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-gray-400 text-xs font-bold mb-1 uppercase tracking-wider">
                Etiket (Yeni Sezon, vb.)
              </label>
              <input
                type="text"
                name="etiket"
                value={formData.etiket}
                onChange={handleInputChange}
                className="w-full bg-black/50 border border-white/10 text-white px-3 py-2 text-sm focus:border-neon-pink outline-none"
              />
            </div>

            <div>
              <label className="block text-gray-400 text-xs font-bold mb-1 uppercase tracking-wider">
                Kategori (Elbise, vb.)
              </label>
              <input
                type="text"
                name="kategori"
                value={formData.kategori}
                onChange={handleInputChange}
                className="w-full bg-black/50 border border-white/10 text-white px-3 py-2 text-sm focus:border-neon-pink outline-none"
              />
            </div>

            <div>
              <label className="block text-gray-400 text-xs font-bold mb-1 uppercase tracking-wider">
                Renk Seçenekleri
              </label>
              <input
                type="text"
                name="renk"
                value={formData.renk}
                onChange={handleInputChange}
                className="w-full bg-black/50 border border-white/10 text-white px-3 py-2 text-sm focus:border-neon-pink outline-none"
                placeholder="Örn: Siyah, Kırmızı"
              />
            </div>

            <div>
              <label className="block text-gray-400 text-xs font-bold mb-1 uppercase tracking-wider">
                Beden Seçenekleri
              </label>
              <input
                type="text"
                name="beden"
                value={formData.beden}
                onChange={handleInputChange}
                className="w-full bg-black/50 border border-white/10 text-white px-3 py-2 text-sm focus:border-neon-pink outline-none"
                placeholder="Örn: S, M, L, XL"
              />
            </div>

            <div className="pt-4 flex gap-2">
              <button
                type="submit"
                className="flex-1 bg-neon-pink text-white font-bold py-3 uppercase tracking-widest text-sm hover:bg-white hover:text-black transition-colors clip-angled"
              >
                {editingId ? "Güncelle" : "Ekle"}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="bg-transparent border border-white/20 text-white font-bold px-4 py-3 uppercase tracking-widest text-sm hover:border-white transition-colors clip-angled"
                >
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
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b border-white/10 pb-4">
            <h2 className="text-xl font-bold text-white uppercase tracking-wider">
              Tüm Ürünler ({filteredProducts.length})
            </h2>
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="Ürün Ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-black/50 border border-white/10 text-white px-4 py-2 focus:outline-none focus:border-neon-pink text-sm w-48"
              />
              <select
                value={selectedCat}
                onChange={(e) => setSelectedCat(e.target.value)}
                className="bg-black/50 border border-white/10 text-gray-300 px-4 py-2 focus:outline-none focus:border-neon-pink text-sm uppercase tracking-widest"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === "all" ? "Tüm Kategoriler" : cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="w-12 h-12 border-4 border-neon-pink/20 border-t-neon-pink rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-black/30 border border-white/5 p-4 flex items-center justify-between hover:border-white/20 transition-colors clip-angled group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-20 bg-black overflow-hidden clip-angled relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={product.gorsel || product.resim1}
                        alt={product.ad}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                      />
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-lg">{product.ad}</h3>
                      <p className="text-neon-pink font-bold">
                        {parseFloat(product.fiyat).toLocaleString("tr-TR", {
                          minimumFractionDigits: 2,
                        })}{" "}
                        TL
                      </p>
                      <div className="flex gap-2 mt-1">
                        {product.etiket && (
                          <span className="text-[10px] uppercase bg-white/10 px-2 py-0.5 text-gray-300">
                            {product.etiket}
                          </span>
                        )}
                        {product.kategori && (
                          <span className="text-[10px] uppercase bg-white/10 px-2 py-0.5 text-gray-300">
                            {product.kategori}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2 mt-1">
                        {product.renk && (
                          <span className="text-[10px] uppercase text-gray-400 border border-gray-700 px-1">
                            Renk: {product.renk}
                          </span>
                        )}
                        {product.beden && (
                          <span className="text-[10px] uppercase text-gray-400 border border-gray-700 px-1">
                            Beden: {product.beden}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleEdit(product)}
                      className="text-gray-400 hover:text-white transition-colors"
                      title="Düzenle"
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                      title="Sil"
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        <line x1="10" y1="11" x2="10" y2="17"></line>
                        <line x1="14" y1="11" x2="14" y2="17"></line>
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
