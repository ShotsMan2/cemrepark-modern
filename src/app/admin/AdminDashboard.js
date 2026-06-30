"use client";

import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import AdminSidebar from "./components/AdminSidebar";
import DashboardView from "./components/views/DashboardView";
import ProductsView from "./components/views/ProductsView";
import OrdersView from "./components/views/OrdersView";
import CustomersView from "./components/views/CustomersView";
import SettingsView from "./components/views/SettingsView";

export default function AdminDashboard({ onLogout }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Form States for Products
  const [formData, setFormData] = useState({
    ad: "", fiyat: "", gorsel: "", etiket: "", kategori: "", renk: "", beden: ""
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
    if (!formData.ad || !formData.fiyat || !formData.gorsel) {
      return Swal.fire("Hata", "Lütfen zorunlu alanları (Ad, Fiyat, Görsel URL) doldurun.", "error");
    }

    const method = editingId ? 'PUT' : 'POST';
    const url = editingId ? `/api/products/${editingId}` : '/api/products';
    const payload = { ...formData, fiyat: parseFloat(formData.fiyat) };

    try {
      const res = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        Swal.fire("Başarılı", `Ürün başarıyla ${editingId ? 'güncellendi' : 'eklendi'}.`, "success");
        setFormData({ ad: "", fiyat: "", gorsel: "", etiket: "", kategori: "", renk: "", beden: "" });
        setEditingId(null);
        fetchProducts(); 
      } else {
        Swal.fire("Hata", "İşlem başarısız oldu.", "error");
      }
    } catch (error) {
      Swal.fire("Hata", "Bir sunucu hatası oluştu.", "error");
    }
  };

  const handleEdit = (product) => {
    setFormData({
      ad: product.ad, fiyat: product.fiyat, gorsel: product.gorsel || product.resim1 || "",
      etiket: product.etiket || "", kategori: product.kategori || "",
      renk: product.renk || "", beden: product.beden || ""
    });
    setEditingId(product.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: 'Emin misiniz?', text: "Bu ürünü silmek istediğinize emin misiniz?", icon: 'warning',
      showCancelButton: true, confirmButtonColor: '#ff007f', cancelButtonColor: '#333',
      confirmButtonText: 'Evet, Sil!', cancelButtonText: 'İptal', background: "#1a1a1a", color: "#fff"
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

  // Render the current view
  const renderView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView products={products} />;
      case 'products':
        return (
          <ProductsView 
            products={products} isLoading={isLoading} formData={formData} editingId={editingId}
            handleInputChange={handleInputChange} handleSubmit={handleSubmit} handleEdit={handleEdit} 
            handleDelete={handleDelete} cancelEdit={cancelEdit}
          />
        );
      case 'orders':
        return <OrdersView />;
      case 'customers':
        return <CustomersView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView products={products} />;
    }
  };

  return (
    <div className="min-h-screen flex bg-[#0a0a0a] relative overflow-hidden text-white">
      {/* Background ambient light */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-neon-pink opacity-[0.03] rounded-full blur-[150px] pointer-events-none"></div>
      
      {/* Sidebar */}
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto">
        {/* Top Header */}
        <header className="bg-black/20 backdrop-blur-md border-b border-white/5 sticky top-0 z-30 flex items-center justify-between px-8 py-4">
          <div>
            <h1 className="text-xl font-bold uppercase tracking-widest text-white">
              {activeTab === 'dashboard' ? 'Dashboard' : 
               activeTab === 'products' ? 'Ürün Yönetimi' : 
               activeTab === 'orders' ? 'Sipariş Yönetimi' : 
               activeTab === 'customers' ? 'Müşteri Yönetimi' : 'Ayarlar'}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-gray-400 hover:text-white transition-colors relative">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-neon-pink rounded-full border border-black"></span>
            </button>
            <button 
              onClick={onLogout}
              className="border border-white/20 text-white hover:border-neon-pink hover:text-neon-pink px-4 py-1.5 uppercase tracking-widest text-xs transition-colors clip-angled ml-4"
            >
              Çıkış
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="p-8 pb-24">
          {renderView()}
        </div>
      </main>
    </div>
  );
}
