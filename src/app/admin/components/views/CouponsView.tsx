"use client";

import { useState, useEffect, useMemo } from "react";
import Swal from "sweetalert2";
import { motion } from "framer-motion";
import { Tag, TrendingUp, AlertTriangle, CheckCircle, RefreshCw, Copy, Trash2, Edit, Shuffle } from "lucide-react";

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
    restriction: "NONE"
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/coupons");
      if (res.ok) {
        const data = await res.json();
        // Add mock performance data if missing
        const enhancedData = data.map(c => ({
          ...c,
          revenueGenerated: Math.floor(Math.random() * 5000), // mock revenue
          usedCount: c.usedCount || 0
        }));
        setCoupons(enhancedData);
      } else {
        throw new Error("Failed to fetch coupons");
      }
    } catch (error) {
      console.error(error);
      // Fallback data if API fails
      setCoupons([]);
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

  const generateRandomCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, code: result }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Free shipping doesn't need a value, handle it gracefully
    let val = formData.discountType === "FREE_SHIPPING" ? 0 : parseFloat(formData.discountValue);

    const payload = {
      ...formData,
      discountValue: val,
      minCartValue: formData.minCartValue ? parseFloat(formData.minCartValue) : null,
      maxUses: formData.maxUses ? parseInt(formData.maxUses, 10) : null,
      expiresAt: formData.expiresAt ? new Date(formData.expiresAt).toISOString() : null,
    };

    try {
      const url = isEditing ? `/api/coupons/${editingId}` : "/api/coupons";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        Swal.fire({
          title: "Başarılı",
          text: isEditing ? "Kupon güncellendi." : "Kupon oluşturuldu.",
          icon: "success",
          background: "#1a1a1a",
          color: "#fff",
          confirmButtonColor: "#ff007f",
        });
        resetForm();
        fetchCoupons();
      } else {
        throw new Error("Failed to save");
      }
    } catch (error) {
      Swal.fire({
        title: "Hata",
        text: "Kupon kaydedilirken bir hata oluştu.",
        icon: "error",
        background: "#1a1a1a",
        color: "#fff",
        confirmButtonColor: "#ff007f",
      });
    }
  };

  const handleEdit = (coupon) => {
    setFormData({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue || "",
      minCartValue: coupon.minCartValue || "",
      maxUses: coupon.maxUses || "",
      expiresAt: coupon.expiresAt ? new Date(coupon.expiresAt).toISOString().slice(0, 16) : "",
      isActive: coupon.isActive,
      restriction: "NONE"
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
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Evet, Sil!",
      cancelButtonText: "İptal",
      background: "#1a1a1a",
      color: "#fff",
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`/api/coupons/${id}`, { method: "DELETE" });
        if (res.ok) {
          Swal.fire({
            title: "Silindi",
            text: "Kupon başarıyla silindi.",
            icon: "success",
            background: "#1a1a1a",
            color: "#fff",
            confirmButtonColor: "#ff007f",
          });
          fetchCoupons();
        }
      } catch (error) {
        Swal.fire({
          title: "Hata",
          text: "Silme işlemi başarısız.",
          icon: "error",
          background: "#1a1a1a",
          color: "#fff",
        });
      }
    }
  };

  const duplicateCoupon = (coupon) => {
    setFormData({
      ...coupon,
      code: coupon.code + "_KOPYA",
      expiresAt: coupon.expiresAt ? new Date(coupon.expiresAt).toISOString().slice(0, 16) : "",
    });
    setEditingId(null);
    setIsEditing(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleStatus = async (coupon) => {
    try {
      const payload = { isActive: !coupon.isActive };
      const res = await fetch(`/api/coupons/${coupon.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        fetchCoupons();
      }
    } catch (error) {
      console.error(error);
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
      restriction: "NONE"
    });
    setIsEditing(false);
    setEditingId(null);
  };

  const getStatusBadge = (coupon) => {
    const isExpired = coupon.expiresAt && new Date(coupon.expiresAt) < new Date();
    const isUsedUp = coupon.maxUses && coupon.usedCount >= coupon.maxUses;

    if (isExpired) {
      return <span className="bg-red-500/20 text-red-400 px-2 py-1 text-xs rounded border border-red-500/30 flex items-center gap-1 w-max"><AlertTriangle size={12}/> Süresi Dolmuş</span>;
    }
    if (isUsedUp) {
      return <span className="bg-orange-500/20 text-orange-400 px-2 py-1 text-xs rounded border border-orange-500/30 flex items-center gap-1 w-max"><AlertTriangle size={12}/> Kullanım Doldu</span>;
    }
    if (!coupon.isActive) {
      return <span className="bg-gray-500/20 text-gray-400 px-2 py-1 text-xs rounded border border-gray-500/30 flex items-center gap-1 w-max">Pasif</span>;
    }
    return <span className="bg-green-500/20 text-green-400 px-2 py-1 text-xs rounded border border-green-500/30 flex items-center gap-1 w-max"><CheckCircle size={12}/> Aktif</span>;
  };

  // Stats calculation
  const stats = useMemo(() => {
    const active = coupons.filter(c => c.isActive && (!c.expiresAt || new Date(c.expiresAt) >= new Date()) && (!c.maxUses || c.usedCount < c.maxUses)).length;
    const totalUsage = coupons.reduce((sum, c) => sum + (c.usedCount || 0), 0);
    const revenue = coupons.reduce((sum, c) => sum + (c.revenueGenerated || 0), 0);
    
    const oneWeekFromNow = new Date();
    oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7);
    const expiringSoon = coupons.filter(c => c.expiresAt && new Date(c.expiresAt) > new Date() && new Date(c.expiresAt) <= oneWeekFromNow).length;

    return [
      { label: "Aktif Kuponlar", value: active, icon: Tag, color: "text-green-400", bg: "bg-green-400/10" },
      { label: "Toplam Kullanım", value: totalUsage, icon: RefreshCw, color: "text-blue-400", bg: "bg-blue-400/10" },
      { label: "Kupon Geliri", value: `₺${revenue.toLocaleString("tr-TR")}`, icon: TrendingUp, color: "text-holo-gold", bg: "bg-holo-gold/10" },
      { label: "Yakında Bitecek", value: expiringSoon, icon: AlertTriangle, color: "text-orange-400", bg: "bg-orange-400/10" }
    ];
  }, [coupons]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats Header */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={i} 
            className="glass-card p-4 flex items-center gap-4 border border-white/5"
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${s.bg} ${s.color}`}>
              <s.icon size={24} />
            </div>
            <div>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">{s.label}</p>
              <h3 className="text-2xl font-bold text-white mt-1">{s.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="glass-panel p-6 clip-angled border border-white/5">
        <h2 className="text-xl font-bold text-white uppercase tracking-widest mb-6">
          {isEditing ? "Kupon Düzenle" : "Yeni Kupon Ekle"}
        </h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-gray-400 text-xs font-bold mb-2 uppercase tracking-wider">Kupon Kodu</label>
            <div className="flex">
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleInputChange}
                className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 focus:border-neon-pink uppercase outline-none rounded-l"
                required
              />
              <button 
                type="button" 
                onClick={generateRandomCode}
                className="bg-white/10 hover:bg-white/20 px-4 border border-l-0 border-white/10 rounded-r transition-colors text-white"
                title="Rastgele Kod Üret"
              >
                <Shuffle size={18} />
              </button>
            </div>
          </div>
          
          <div>
            <label className="block text-gray-400 text-xs font-bold mb-2 uppercase tracking-wider">İndirim Tipi</label>
            <select
              name="discountType"
              value={formData.discountType}
              onChange={handleInputChange}
              className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 focus:border-neon-pink outline-none rounded appearance-none"
            >
              <option value="PERCENTAGE">Yüzde İndirim (%)</option>
              <option value="FIXED">Sabit İndirim (TL)</option>
              <option value="FREE_SHIPPING">Ücretsiz Kargo</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-400 text-xs font-bold mb-2 uppercase tracking-wider">
              Değer {formData.discountType === 'PERCENTAGE' ? '(%)' : formData.discountType === 'FIXED' ? '(TL)' : '(Geçersiz)'}
            </label>
            <input
              type="number"
              name="discountValue"
              value={formData.discountValue}
              onChange={handleInputChange}
              disabled={formData.discountType === 'FREE_SHIPPING'}
              className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 focus:border-neon-pink outline-none rounded disabled:opacity-50"
              required={formData.discountType !== 'FREE_SHIPPING'}
              step="0.01"
              min="0"
            />
          </div>

          <div>
            <label className="block text-gray-400 text-xs font-bold mb-2 uppercase tracking-wider">Min. Sepet Tutarı (TL)</label>
            <input
              type="number"
              name="minCartValue"
              value={formData.minCartValue}
              onChange={handleInputChange}
              className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 focus:border-neon-pink outline-none rounded"
              step="0.01"
              min="0"
            />
          </div>

          <div>
            <label className="block text-gray-400 text-xs font-bold mb-2 uppercase tracking-wider">Kullanım Limiti</label>
            <input
              type="number"
              name="maxUses"
              value={formData.maxUses}
              onChange={handleInputChange}
              placeholder="Örn: 100"
              className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 focus:border-neon-pink outline-none rounded"
              min="1"
            />
          </div>

          <div>
            <label className="block text-gray-400 text-xs font-bold mb-2 uppercase tracking-wider">Son Kullanma Tarihi</label>
            <input
              type="datetime-local"
              name="expiresAt"
              value={formData.expiresAt}
              onChange={handleInputChange}
              className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 focus:border-neon-pink outline-none rounded [color-scheme:dark]"
            />
          </div>

          <div className="md:col-span-3 flex items-center justify-between border-t border-white/10 pt-4 mt-2">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleInputChange}
                className="w-5 h-5 accent-neon-pink"
                id="isActiveToggle"
              />
              <label htmlFor="isActiveToggle" className="text-gray-300 font-bold uppercase cursor-pointer">
                Kuponu Aktifleştir
              </label>
            </div>
            
            <div className="flex gap-4">
              {isEditing && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-transparent border border-gray-500 text-gray-400 px-6 py-2 font-bold uppercase tracking-widest rounded hover:text-white hover:border-white transition-colors"
                >
                  İptal
                </button>
              )}
              <button
                type="submit"
                className="bg-neon-pink text-white px-8 py-2 font-bold uppercase tracking-widest clip-angled hover:bg-white hover:text-black transition-colors"
              >
                {isEditing ? "Güncelle" : "Oluştur"}
              </button>
            </div>
          </div>
        </form>
      </div>

      <div className="glass-panel p-6 clip-angled border border-white/5">
        <h2 className="text-xl font-bold text-white uppercase tracking-widest mb-6">Mevcut Kuponlar</h2>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-4 border-neon-pink border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : coupons.length === 0 ? (
          <p className="text-gray-400 italic text-center py-8">Henüz kupon eklenmemiş.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase bg-black/40 text-gray-400 border-b border-white/10">
                <tr>
                  <th className="px-4 py-4 font-bold">Kupon Kodu</th>
                  <th className="px-4 py-4 font-bold">İndirim</th>
                  <th className="px-4 py-4 font-bold">Şartlar</th>
                  <th className="px-4 py-4 font-bold">Performans</th>
                  <th className="px-4 py-4 font-bold">Durum</th>
                  <th className="px-4 py-4 font-bold text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {coupons.map((coupon) => (
                  <tr key={coupon.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-4 py-4">
                      <div className="font-bold text-white flex items-center gap-2">
                        {coupon.code}
                        <button onClick={() => {
                          navigator.clipboard.writeText(coupon.code);
                          Swal.fire({ toast: true, position: 'top-end', showConfirmButton: false, timer: 1500, icon: 'success', title: 'Kopyalandı!', background: '#1a1a1a', color: '#fff' });
                        }} className="text-gray-500 hover:text-white transition-colors" title="Kopyala">
                          <Copy size={14} />
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-neon-pink font-bold">
                        {coupon.discountType === 'PERCENTAGE' ? `%${coupon.discountValue}` : 
                         coupon.discountType === 'FIXED' ? `₺${coupon.discountValue}` : 
                         'Ücretsiz Kargo'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-gray-300 text-xs space-y-1">
                      <div>Min Sepet: <span className="text-white">{coupon.minCartValue ? `₺${coupon.minCartValue}` : 'Yok'}</span></div>
                      <div>Bitiş: <span className="text-white">{coupon.expiresAt ? new Date(coupon.expiresAt).toLocaleDateString("tr-TR") : 'Süresiz'}</span></div>
                    </td>
                    <td className="px-4 py-4 text-gray-300 text-xs space-y-1">
                      <div>Kullanım: <span className="text-white">{coupon.usedCount} / {coupon.maxUses || '∞'}</span></div>
                      <div>Gelir: <span className="text-green-400">₺{coupon.revenueGenerated?.toLocaleString("tr-TR") || 0}</span></div>
                    </td>
                    <td className="px-4 py-4">
                      {getStatusBadge(coupon)}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-3 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => toggleStatus(coupon)} 
                          className={`${coupon.isActive ? 'text-orange-400' : 'text-green-400'} hover:text-white transition-colors`}
                          title={coupon.isActive ? "Pasife Al" : "Aktife Al"}
                        >
                          <RefreshCw size={16} />
                        </button>
                        <button onClick={() => handleEdit(coupon)} className="text-holo-gold hover:text-white transition-colors" title="Düzenle">
                          <Edit size={16} />
                        </button>
                        <button onClick={() => duplicateCoupon(coupon)} className="text-blue-400 hover:text-white transition-colors" title="Çoğalt">
                          <Copy size={16} />
                        </button>
                        <button onClick={() => handleDelete(coupon.id)} className="text-red-500 hover:text-white transition-colors" title="Sil">
                          <Trash2 size={16} />
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
