"use client";

import { useState } from "react";
import Swal from "sweetalert2";
import { signIn, signOut, useSession } from "next-auth/react";
import AdminDashboard from "./AdminDashboard";

export default function AdminPage() {
  const { data: session, status } = useSession();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const result = await signIn("credentials", {
      email: username,
      password: password,
      redirect: false,
    });

    setIsSubmitting(false);

    if (result?.error) {
      Swal.fire({
        title: "Hata",
        text: "Kullanıcı adı veya şifre hatalı!",
        icon: "error",
        confirmButtonColor: "#ff007f",
        background: "#1a1a1a",
        color: "#fff",
      });
    } else {
      Swal.fire({
        title: "Hoş Geldiniz!",
        text: "Yönetim paneline giriş yapıldı.",
        icon: "success",
        confirmButtonColor: "#ff007f",
        background: "#1a1a1a",
        color: "#fff",
      });
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen pt-32 pb-24 flex items-center justify-center relative overflow-hidden bg-[#0a0a0a]">
        <div className="text-white text-xl uppercase tracking-widest animate-pulse">
          Yükleniyor...
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen pt-32 pb-24 flex items-center justify-center relative overflow-hidden bg-[#0a0a0a]">
        {/* Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-neon-pink opacity-[0.05] rounded-full blur-[120px] pointer-events-none"></div>
        
        <div className="glass-panel p-10 max-w-md w-full mx-4 clip-angled relative z-10 bg-black/40 border border-white/10 backdrop-blur-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black text-white uppercase tracking-widest mb-2">Admin Girişi</h1>
            <div className="w-16 h-1 bg-neon-pink mx-auto"></div>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-gray-400 text-sm font-bold mb-2 uppercase tracking-wider">Kullanıcı Adı</label>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 focus:outline-none focus:border-neon-pink transition-colors"
                placeholder="Kullanıcı adınızı girin"
                disabled={isSubmitting}
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-400 text-sm font-bold mb-2 uppercase tracking-wider">Şifre</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 focus:outline-none focus:border-neon-pink transition-colors"
                placeholder="Şifrenizi girin"
                disabled={isSubmitting}
                required
              />
            </div>
            
            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-neon-pink text-white font-bold py-4 px-4 uppercase tracking-widest hover:bg-white hover:text-black transition-colors clip-angled disabled:opacity-50"
            >
              {isSubmitting ? "Giriş Yapılıyor..." : "Giriş Yap"}
            </button>
          </form>
          
          <p className="text-center text-gray-500 text-xs mt-6">
            Sadece yetkili personel içindir. Bilgiler (admin / 123456)
          </p>
        </div>
      </div>
    );
  }

  // Check if user is authenticated but not an admin
  if (status === "authenticated" && session?.user?.role !== "admin") {
    return (
      <div className="min-h-screen pt-32 pb-24 flex items-center justify-center relative overflow-hidden bg-[#0a0a0a]">
        {/* Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-500 opacity-[0.05] rounded-full blur-[120px] pointer-events-none"></div>
        
        <div className="glass-panel p-10 max-w-md w-full mx-4 clip-angled relative z-10 bg-black/40 border border-white/10 backdrop-blur-md text-center">
          <h1 className="text-3xl font-black text-red-500 uppercase tracking-widest mb-4">Yetkisiz Erişim</h1>
          <p className="text-gray-300 text-sm mb-8">Bu sayfaya yalnızca yöneticiler erişebilir.</p>
          <button 
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-full bg-red-600 text-white font-bold py-4 px-4 uppercase tracking-widest hover:bg-white hover:text-black transition-colors clip-angled"
          >
            Çıkış Yap ve Giriş Ekranına Git
          </button>
        </div>
      </div>
    );
  }

  return (
    <AdminDashboard 
      onLogout={() => {
        signOut({ redirect: false });
      }} 
    />
  );
}
