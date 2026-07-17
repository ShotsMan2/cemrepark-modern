"use client";

import { useState, useEffect, useRef } from "react";
import Swal from "sweetalert2";
import AdminSidebar from "./components/AdminSidebar";
import DashboardView from "./components/views/DashboardView";
import ProductsView from "./components/views/ProductsView";
import OrdersView from "./components/views/OrdersView";
import CustomersView from "./components/views/CustomersView";
import SettingsView from "./components/views/SettingsView";
import MessagesView from "./components/views/MessagesView";
import PagesView from "./components/views/PagesView";
import BannersView from "./components/views/BannersView";
import CouponsView from "./components/views/CouponsView";
import AISupportView from "./components/views/AISupportView";
import SecurityView from "./components/views/SecurityView";
import ThemeToggle from "@/components/ThemeToggle";

export default function AdminDashboard({ onLogout }) {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form States for Products
  const [formData, setFormData] = useState({
    ad: "",
    fiyat: "",
    gorsel: "",
    etiket: "",
    kategori: "",
    renk: "",
    beden: "",
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchProducts();
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
      return Swal.fire(
        "Hata",
        "Lütfen zorunlu alanları (Ad, Fiyat, Görsel URL) doldurun.",
        "error"
      );
    }

    const gorselUrl = formData.gorsel.trim();
    const isValidUrl =
      gorselUrl.startsWith("/") ||
      gorselUrl.startsWith("http://") ||
      gorselUrl.startsWith("https://");

    if (!isValidUrl) {
      return Swal.fire({
        title: "Geçersiz Görsel URL",
        text: "Görsel URL'si '/' ile başlamalı (örn: /assets/siteimg/yeni1.jpg) veya 'http://', 'https://' içermelidir.",
        icon: "warning",
        confirmButtonColor: "#ff007f",
        background: "#1a1a1a",
        color: "#fff",
      });
    }

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
        Swal.fire(
          "Başarılı",
          `Ürün başarıyla ${editingId ? "güncellendi" : "eklendi"}.`,
          "success"
        );
        setFormData({
          ad: "",
          fiyat: "",
          gorsel: "",
          etiket: "",
          kategori: "",
          renk: "",
          beden: "",
        });
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
      ad: product.ad,
      fiyat: product.fiyat,
      gorsel: product.gorsel || product.resim1 || "",
      etiket: product.etiket || "",
      kategori: product.kategori || "",
      renk: product.renk || "",
      beden: product.beden || "",
    });
    setEditingId(product.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "Emin misiniz?",
      text: "Bu ürünü silmek istediğinize emin misiniz?",
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
          const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
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
      case "dashboard":
        return <DashboardView products={products} />;
      case "products":
        return (
          <ProductsView
            products={products}
            isLoading={isLoading}
            formData={formData}
            editingId={editingId}
            handleInputChange={handleInputChange}
            handleSubmit={handleSubmit}
            handleEdit={handleEdit}
            handleDelete={handleDelete}
            cancelEdit={cancelEdit}
          />
        );
      case "orders":
        return <OrdersView />;
      case "customers":
        return <CustomersView />;
      case "messages":
        return <MessagesView />;
      case "settings":
        return <SettingsView />;
      case "pages":
        return <PagesView />;
      case "banners":
        return <BannersView />;
      case "coupons":
        return <CouponsView />;
      case "ai-support":
        return <AISupportView />;
      case "security":
        return <SecurityView />;
      default:
        return <DashboardView products={products} />;
    }
  };

  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(true);
  const [notifications, setNotifications] = useState([
    { id: "n1", text: "Yeni sipariş alındı #1042", time: "2 dk önce" },
    { id: "n2", text: "Ayşe Y. siparişi teslim edildi", time: "1 saat önce" },
    { id: "n3", text: "Ürün stoğu güncellendi (Kap)", time: "3 saat önce" },
    { id: "n4", text: "Yeni üye kaydı (zeynep@...)", time: "5 saat önce" },
    { id: "n5", text: "Ödeme onaylandı #1041", time: "12 saat önce" },
  ]);

  useEffect(() => {
    const fetchMessageNotifications = async () => {
      try {
        const res = await fetch("/api/messages");
        if (res.ok) {
          const data = await res.json();
          const messageNotifications = data.map((msg) => ({
            id: `msg-${msg.id}`,
            text: `Yeni Mesaj: ${msg.adSoyad} - "${msg.mesaj.substring(0, 25)}${msg.mesaj.length > 25 ? "..." : ""}"`,
            time: msg.tarih,
            isMessage: true,
          }));
          setNotifications((prev) => {
            const standardNotes = prev.filter(
              (n) => typeof n.id === "string" && n.id.startsWith("n")
            );
            return [...messageNotifications, ...standardNotes];
          });
          if (data.length > 0) {
            setUnreadNotifications(true);
          }
        }
      } catch (err) {
        console.error("Bildirim mesajları yüklenirken hata:", err);
      }
    };
    fetchMessageNotifications();
  }, [activeTab]);

  const handleNotificationClick = (item) => {
    if (item.isMessage) {
      setActiveTab("messages");
      setShowNotifications(false);
    }
  };

  const notificationRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    if (showNotifications) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showNotifications]);

  return (
    <div className="min-h-screen flex bg-background relative overflow-hidden text-foreground">
      {/* Background ambient light */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-neon-pink opacity-[0.03] rounded-full blur-[150px] pointer-events-none"></div>

      {/* Sidebar */}
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto">
        {/* Top Header */}
        <header className="glass-panel rounded-none border-t-0 border-x-0 border-b border-glass-border sticky top-0 z-30 flex items-center justify-between px-8 py-4">
          <div>
            <h1 className="text-xl font-bold uppercase tracking-widest text-foreground">
              {activeTab === "dashboard"
                ? "Dashboard"
                : activeTab === "products"
                  ? "Ürün Yönetimi"
                  : activeTab === "orders"
                    ? "Sipariş Yönetimi"
                    : activeTab === "customers"
                      ? "Müşteri Yönetimi"
                      : activeTab === "messages"
                        ? "Gelen Mesajlar"
                        : activeTab === "pages"
                          ? "Sayfa Yönetimi"
                          : activeTab === "banners"
                            ? "Banner / Slider Yönetimi"
                            : activeTab === "coupons"
                              ? "Kupon / Promosyon Yönetimi"
                              : activeTab === "ai-support"
                              ? "AI Destek Paneli"
                              : activeTab === "security"
                                ? "Güvenlik & Log Yönetimi"
                                : "Ayarlar"}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setUnreadNotifications(false);
                }}
                className="text-foreground/70 hover:text-foreground transition-colors relative focus:outline-none block py-2"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
                {unreadNotifications && (
                  <span className="absolute top-1.5 right-0.5 w-3 h-3 bg-neon-pink rounded-full border border-black"></span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 glass-panel p-4 clip-angled border border-glass-border shadow-2xl z-50 text-left">
                  <div className="flex justify-between items-center mb-4 pb-2 border-b border-glass-border">
                    <span className="font-bold text-xs uppercase tracking-widest text-holo-gold">
                      Bildirimler
                    </span>
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="text-foreground/60 hover:text-foreground text-xs"
                    >
                      Kapat
                    </button>
                  </div>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => handleNotificationClick(n)}
                        className={`p-2.5 rounded bg-foreground/5 hover:bg-foreground/10 transition-colors border-l-2 border-neon-pink text-xs ${n.isMessage ? "cursor-pointer hover:border-holo-gold" : ""}`}
                      >
                        <p className="text-foreground font-medium mb-1">{n.text}</p>
                        <span className="text-foreground/60 text-[10px]">{n.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={onLogout}
              className="border border-glass-border text-foreground hover:border-neon-pink hover:text-neon-pink px-4 py-1.5 uppercase tracking-widest text-xs transition-colors clip-angled ml-4"
            >
              Çıkış
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="p-8 pb-24">{renderView()}</div>
      </main>
    </div>
  );
}
