"use client";

import { useState, useEffect, useRef } from "react";
import Swal from "sweetalert2";
import AdminSidebar from "./components/AdminSidebar";
import dynamic from "next/dynamic";
import ThemeToggle from "@/components/ThemeToggle";

const DashboardView = dynamic(() => import("./components/views/DashboardView"), { loading: () => <div className="p-8 text-center animate-pulse text-primary">Yükleniyor...</div> });
const ProductsView = dynamic(() => import("./components/views/ProductsView"), { loading: () => <div className="p-8 text-center animate-pulse text-primary">Yükleniyor...</div> });
const OrdersView = dynamic(() => import("./components/views/OrdersView"), { loading: () => <div className="p-8 text-center animate-pulse text-primary">Yükleniyor...</div> });
const CustomersView = dynamic(() => import("./components/views/CustomersView"), { loading: () => <div className="p-8 text-center animate-pulse text-primary">Yükleniyor...</div> });
const SettingsView = dynamic(() => import("./components/views/SettingsView"), { loading: () => <div className="p-8 text-center animate-pulse text-primary">Yükleniyor...</div> });
const MessagesView = dynamic(() => import("./components/views/MessagesView"), { loading: () => <div className="p-8 text-center animate-pulse text-primary">Yükleniyor...</div> });
const PagesView = dynamic(() => import("./components/views/PagesView"), { loading: () => <div className="p-8 text-center animate-pulse text-primary">Yükleniyor...</div> });
const BannersView = dynamic(() => import("./components/views/BannersView"), { loading: () => <div className="p-8 text-center animate-pulse text-primary">Yükleniyor...</div> });
const CouponsView = dynamic(() => import("./components/views/CouponsView"), { loading: () => <div className="p-8 text-center animate-pulse text-primary">Yükleniyor...</div> });
const AISupportView = dynamic(() => import("./components/views/AISupportView"), { loading: () => <div className="p-8 text-center animate-pulse text-primary">Yükleniyor...</div> });
const SecurityView = dynamic(() => import("./components/views/SecurityView"), { loading: () => <div className="p-8 text-center animate-pulse text-primary">Yükleniyor...</div> });

export default function AdminDashboard({ onLogout }) {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  // Form States for Products
  const [formData, setFormData] = useState({
    ad: "", fiyat: "", gorsel: "", etiket: "", kategori: "", renk: "", beden: "",
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchProducts();
    
    // Command Palette shortcut (Ctrl+K)
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearch((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Ürünler çekilirken hata:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.ad || !formData.fiyat || !formData.gorsel) {
      return Swal.fire("Hata", "Lütfen zorunlu alanları doldurun.", "error");
    }
    // Form validation and submission logic...
    const method = editingId ? "PUT" : "POST";
    const url = editingId ? `/api/products/${editingId}` : "/api/products";
    const payload = { ...formData, fiyat: parseFloat(formData.fiyat) };

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        Swal.fire("Başarılı", `Ürün başarıyla ${editingId ? "güncellendi" : "eklendi"}.`, "success");
        setFormData({ ad: "", fiyat: "", gorsel: "", etiket: "", kategori: "", renk: "", beden: "" });
        setEditingId(null);
        fetchProducts();
      } else {
        Swal.fire("Hata", "İşlem başarısız oldu.", "error");
      }
    } catch (error) {
      Swal.fire("Hata", "Sunucu hatası oluştu.", "error");
    }
  };

  const handleEdit = (product) => {
    setFormData({
      ad: product.ad, fiyat: product.fiyat, gorsel: product.gorsel || product.resim || "",
      etiket: product.etiket || "", kategori: product.kategori || "", renk: product.renk || "", beden: product.beden || "",
    });
    setEditingId(product.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "Emin misiniz?", text: "Bu ürünü silmek istediğinize emin misiniz?", icon: "warning",
      showCancelButton: true, confirmButtonColor: "#ff007f", cancelButtonColor: "#333", confirmButtonText: "Evet, Sil!", cancelButtonText: "İptal",
    }).then(async (result) => {
      if (result.isConfirmed) {
        const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
        if (res.ok) {
          Swal.fire("Silindi!", "Ürün sistemden kaldırıldı.", "success");
          fetchProducts();
        }
      }
    });
  };

  const cancelEdit = () => {
    setFormData({ ad: "", fiyat: "", gorsel: "", etiket: "", kategori: "", renk: "", beden: "" });
    setEditingId(null);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const renderView = () => {
    switch (activeTab) {
      case "dashboard": return <DashboardView products={products} setActiveTab={setActiveTab} />;
      case "products": return <ProductsView products={products} isLoading={isLoading} formData={formData} editingId={editingId} handleInputChange={handleInputChange} handleSubmit={handleSubmit} handleEdit={handleEdit} handleDelete={handleDelete} cancelEdit={cancelEdit} />;
      case "orders": return <OrdersView />;
      case "customers": return <CustomersView />;
      case "messages": return <MessagesView />;
      case "settings": return <SettingsView />;
      case "pages": return <PagesView />;
      case "banners": return <BannersView />;
      case "coupons": return <CouponsView />;
      case "ai-support": return <AISupportView />;
      case "security": return <SecurityView />;
      default: return <DashboardView products={products} setActiveTab={setActiveTab} />;
    }
  };

  const getBreadcrumbTitle = () => {
    const titles = {
      dashboard: "Genel Bakış", products: "Ürün Yönetimi", orders: "Siparişler", customers: "Müşteriler",
      messages: "Gelen Kutusu", pages: "İçerik Sayfaları", banners: "Vitrin Yönetimi", coupons: "Kampanyalar",
      "ai-support": "AI Destek Asistanı", security: "Güvenlik & Loglar", settings: "Sistem Ayarları"
    };
    return titles[activeTab] || "Dashboard";
  };

  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(true);
  const [notifications, setNotifications] = useState([
    { id: "n1", text: "Yeni sipariş alındı #1042", time: "2 dk önce" },
    { id: "n2", text: "Ayşe Y. siparişi teslim edildi", time: "1 saat önce" },
  ]);

  const notificationRef = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) setShowNotifications(false);
      if (searchRef.current && !searchRef.current.contains(event.target)) setShowSearch(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen flex bg-background relative overflow-hidden text-foreground">
      {/* Background ambient light */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary opacity-5 rounded-full blur-[150px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-secondary opacity-5 rounded-full blur-[150px] pointer-events-none"></div>

      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <main className="flex-1 flex flex-col h-screen overflow-y-auto relative z-10">
        {/* Top Header */}
        <header className="glass-frosted border-x-0 sticky top-0 z-30 flex items-center justify-between px-4 lg:px-8 py-4 shadow-sm">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 text-foreground/70 hover:text-primary transition-colors focus:outline-none"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
            </button>
            
            <div className="hidden md:flex items-center text-sm font-medium text-foreground/50 uppercase tracking-widest">
              <span>Admin Paneli</span>
              <span className="mx-2">/</span>
              <span className="text-primary font-bold">{getBreadcrumbTitle()}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-5">
            {/* Global Search Button */}
            <button 
              onClick={() => setShowSearch(true)}
              className="hidden md:flex items-center gap-2 bg-foreground/5 hover:bg-foreground/10 px-4 py-2 rounded-lg text-sm transition-colors border border-glass-border"
            >
              <svg className="w-4 h-4 text-foreground/50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              <span className="text-foreground/50">Ara...</span>
              <kbd className="hidden lg:inline-block bg-background px-2 py-0.5 rounded text-[10px] text-foreground/50 border border-glass-border font-sans font-bold">Ctrl+K</kbd>
            </button>

            <ThemeToggle />
            
            {/* Fullscreen Toggle */}
            <button onClick={toggleFullscreen} className="hidden md:block text-foreground/70 hover:text-primary transition-colors focus:outline-none p-2">
              {isFullscreen ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 3v3a2 2 0 01-2 2H3m18 0h-3a2 2 0 01-2-2V3m0 18v-3a2 2 0 012-2h3M3 16h3a2 2 0 012 2v3"></path></svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"></path></svg>
              )}
            </button>

            {/* Notifications */}
            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => { setShowNotifications(!showNotifications); setUnreadNotifications(false); }}
                className="text-foreground/70 hover:text-primary transition-colors relative focus:outline-none p-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
                {unreadNotifications && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full border-2 border-background animate-pulse"></span>}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 glass-panel p-0 clip-angled border border-glass-border shadow-2xl z-50 overflow-hidden animate-slide-up">
                  <div className="flex justify-between items-center p-4 bg-foreground/5 border-b border-glass-border">
                    <span className="font-bold text-xs uppercase tracking-widest text-primary">Bildirim Merkezi</span>
                  </div>
                  <div className="max-h-64 overflow-y-auto p-2">
                    {notifications.map((n) => (
                      <div key={n.id} className="p-3 mb-1 rounded-lg hover:bg-primary/10 transition-colors border-l-2 border-transparent hover:border-primary cursor-pointer group">
                        <p className="text-foreground text-sm font-medium mb-1 group-hover:text-primary transition-colors">{n.text}</p>
                        <span className="text-foreground/50 text-xs flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6l4 2"></path></svg>
                          {n.time}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="h-6 w-px bg-glass-border mx-1"></div>

            <button
              onClick={onLogout}
              className="text-foreground/70 hover:text-danger flex items-center gap-2 px-2 py-1.5 uppercase tracking-widest text-xs font-bold transition-colors"
            >
              <span className="hidden md:inline">Çıkış</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
            </button>
          </div>
        </header>

        {/* Command Palette Overlay */}
        {showSearch && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-start justify-center pt-[20vh] animate-fade-in px-4">
            <div ref={searchRef} className="w-full max-w-2xl bg-background/95 border border-glass-border rounded-xl shadow-2xl overflow-hidden">
              <div className="flex items-center border-b border-glass-border px-4">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                <input 
                  type="text" 
                  placeholder="Ürün, sipariş veya sayfa ara..." 
                  className="w-full bg-transparent border-none p-4 text-foreground focus:outline-none focus:ring-0 placeholder:text-foreground/40"
                  autoFocus
                />
                <kbd className="bg-foreground/5 px-2 py-1 rounded text-xs text-foreground/50 border border-glass-border ml-2">ESC</kbd>
              </div>
              <div className="p-4">
                <p className="text-xs font-bold uppercase tracking-widest text-foreground/40 mb-3">Hızlı Bağlantılar</p>
                <div className="space-y-1">
                  <button onClick={() => {setActiveTab('products'); setShowSearch(false);}} className="w-full text-left px-3 py-2 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors flex items-center gap-3">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                    Yeni Ürün Ekle
                  </button>
                  <button onClick={() => {setActiveTab('orders'); setShowSearch(false);}} className="w-full text-left px-3 py-2 rounded-lg hover:bg-secondary/10 hover:text-secondary transition-colors flex items-center gap-3">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
                    Son Siparişleri Görüntüle
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-4 lg:p-8 pb-24 max-w-7xl mx-auto w-full animate-slide-up">
          {renderView()}
        </div>
      </main>
    </div>
  );
}
