import { useState, useEffect } from "react";
import Swal from "sweetalert2";

export default function CouponsView() {
  const [coupons, setCoupons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    code: "",
    discountType: "PERCENTAGE",
    discountValue: "",
    minCartValue: "",
    maxUses: "",
    expiresAt: "",
    isActive: true,
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/coupons");
      const data = await res.json();
      setCoupons(data);
    } catch (error) {
      console.error("Kuponlar yüklenirken hata:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.code || !formData.discountValue) {
      return Swal.fire("Hata", "Kupon Kodu ve İndirim Miktarı zorunludur.", "error");
    }

    const payload = {
      ...formData,
      code: formData.code.toUpperCase(),
      discountValue: parseFloat(formData.discountValue),
      minCartValue: formData.minCartValue ? parseFloat(formData.minCartValue) : null,
      maxUses: formData.maxUses ? parseInt(formData.maxUses) : null,
      expiresAt: formData.expiresAt ? formData.expiresAt : null,
    };

    const method = isEditing ? "PUT" : "POST";
    const url = isEditing ? `/api/coupons/${editingId}` : "/api/coupons";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        Swal.fire("Başarılı", `Kupon ${isEditing ? "güncellendi" : "eklendi"}.`, "success");
        resetForm();
        fetchCoupons();
      } else {
        const errorData = await res.json();
        Swal.fire("Hata", errorData.error || "İşlem başarısız.", "error");
      }
    } catch (error) {
      Swal.fire("Hata", "Sunucu hatası.", "error");
    }
  };

  const handleEdit = (coupon) => {
    setFormData({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minCartValue: coupon.minCartValue || "",
      maxUses: coupon.maxUses || "",
      expiresAt: coupon.expiresAt ? coupon.expiresAt.substring(0, 16) : "",
      isActive: coupon.isActive,
    });
    setEditingId(coupon.id);
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Emin misiniz?",
      text: "Bu kuponu silmek istediğinize emin misiniz?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ff007f",
      cancelButtonColor: "#333",
      confirmButtonText: "Evet, Sil!",
      cancelButtonText: "İptal",
      background: "#1a1a1a",
      color: "#fff",
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`/api/coupons/${id}`, { method: "DELETE" });
        if (res.ok) {
          Swal.fire("Silindi", "Kupon silindi.", "success");
          fetchCoupons();
        }
      } catch (error) {
        Swal.fire("Hata", "Silme başarısız.", "error");
      }
    }
  };

  const resetForm = () => {
    setFormData({
      code: "",
      discountType: "PERCENTAGE",
      discountValue: "",
      minCartValue: "",
      maxUses: "",
      expiresAt: "",
      isActive: true,
    });
    setIsEditing(false);
    setEditingId(null);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="glass-panel p-6 clip-angled border border-white/5">
        <h2 className="text-xl font-bold text-white uppercase tracking-widest mb-6">
          {isEditing ? "Kupon Düzenle" : "Yeni Kupon Ekle"}
        </h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-400 text-sm font-bold mb-2 uppercase">Kupon Kodu</label>
            <input
              type="text"
              name="code"
              value={formData.code}
              onChange={handleInputChange}
              className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 focus:border-neon-pink uppercase"
              required
            />
          </div>
          <div>
            <label className="block text-gray-400 text-sm font-bold mb-2 uppercase">İndirim Tipi</label>
            <select
              name="discountType"
              value={formData.discountType}
              onChange={handleInputChange}
              className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 focus:border-neon-pink"
            >
              <option value="PERCENTAGE">Yüzde (%)</option>
              <option value="FIXED">Sabit Tutar (TL)</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-400 text-sm font-bold mb-2 uppercase">
              İndirim Miktarı {formData.discountType === 'PERCENTAGE' ? '(%)' : '(TL)'}
            </label>
            <input
              type="number"
              name="discountValue"
              value={formData.discountValue}
              onChange={handleInputChange}
              className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 focus:border-neon-pink"
              required
              step="0.01"
              min="0"
            />
          </div>
          <div>
            <label className="block text-gray-400 text-sm font-bold mb-2 uppercase">Minimum Sepet Tutarı (Opsiyonel)</label>
            <input
              type="number"
              name="minCartValue"
              value={formData.minCartValue}
              onChange={handleInputChange}
              className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 focus:border-neon-pink"
              step="0.01"
              min="0"
            />
          </div>
          <div>
            <label className="block text-gray-400 text-sm font-bold mb-2 uppercase">Kullanım Limiti (Opsiyonel)</label>
            <input
              type="number"
              name="maxUses"
              value={formData.maxUses}
              onChange={handleInputChange}
              className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 focus:border-neon-pink"
              min="1"
            />
          </div>
          <div>
            <label className="block text-gray-400 text-sm font-bold mb-2 uppercase">Son Kullanma Tarihi (Opsiyonel)</label>
            <input
              type="datetime-local"
              name="expiresAt"
              value={formData.expiresAt}
              onChange={handleInputChange}
              className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 focus:border-neon-pink [color-scheme:dark]"
            />
          </div>
          <div className="md:col-span-2 flex items-center gap-3 mt-2">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleInputChange}
              className="w-5 h-5 accent-neon-pink"
              id="isActiveToggle"
            />
            <label htmlFor="isActiveToggle" className="text-gray-300 font-bold uppercase cursor-pointer">
              Kupon Aktif
            </label>
          </div>
          <div className="md:col-span-2 flex gap-4 mt-4">
            <button
              type="submit"
              className="bg-neon-pink text-white px-8 py-3 font-bold uppercase tracking-widest clip-angled hover:bg-white hover:text-black transition-colors"
            >
              {isEditing ? "Güncelle" : "Kupon Ekle"}
            </button>
            {isEditing && (
              <button
                type="button"
                onClick={resetForm}
                className="bg-transparent border border-gray-500 text-gray-400 px-8 py-3 font-bold uppercase tracking-widest clip-angled hover:text-white hover:border-white transition-colors"
              >
                İptal
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="glass-panel p-6 clip-angled border border-white/5">
        <h2 className="text-xl font-bold text-white uppercase tracking-widest mb-6">Mevcut Kuponlar</h2>
        {isLoading ? (
          <p className="text-gray-400">Yükleniyor...</p>
        ) : coupons.length === 0 ? (
          <p className="text-gray-400 italic">Henüz kupon eklenmemiş.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-400">
              <thead className="text-xs uppercase bg-black/30 text-gray-300">
                <tr>
                  <th className="px-4 py-3">Kupon Kodu</th>
                  <th className="px-4 py-3">İndirim</th>
                  <th className="px-4 py-3">Min. Sepet</th>
                  <th className="px-4 py-3">Kullanım</th>
                  <th className="px-4 py-3">Son Kullanma</th>
                  <th className="px-4 py-3">Durum</th>
                  <th className="px-4 py-3 text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((coupon) => (
                  <tr key={coupon.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-4 py-4 font-bold text-white">{coupon.code}</td>
                    <td className="px-4 py-4 text-neon-pink font-bold">
                      {coupon.discountType === 'PERCENTAGE' ? `%${coupon.discountValue}` : `${coupon.discountValue} TL`}
                    </td>
                    <td className="px-4 py-4">{coupon.minCartValue ? `${coupon.minCartValue} TL` : '-'}</td>
                    <td className="px-4 py-4">{coupon.usedCount} / {coupon.maxUses || 'Sınırsız'}</td>
                    <td className="px-4 py-4">{coupon.expiresAt ? new Date(coupon.expiresAt).toLocaleString("tr-TR") : 'Süresiz'}</td>
                    <td className="px-4 py-4">
                      {coupon.isActive ? (
                        <span className="bg-green-500/20 text-green-500 px-2 py-1 text-xs rounded">Aktif</span>
                      ) : (
                        <span className="bg-red-500/20 text-red-500 px-2 py-1 text-xs rounded">Pasif</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <button onClick={() => handleEdit(coupon)} className="text-holo-gold hover:text-white mr-3">Düzenle</button>
                      <button onClick={() => handleDelete(coupon.id)} className="text-red-500 hover:text-white">Sil</button>
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
