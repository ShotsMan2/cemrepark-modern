"use client";

import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import AdminDashboard from "./AdminDashboard";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (sessionStorage.getItem("adminAuth") === "true") {
      setIsAuthenticated(true);
    }
    setIsChecking(false);
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (username === "admin" && password === "123456") {
      sessionStorage.setItem("adminAuth", "true");
      setIsAuthenticated(true);
      Swal.fire({
        title: "Hoş Geldiniz!",
        text: "Yönetim paneline giriş yapıldı.",
        icon: "success",
        confirmButtonColor: "#ff007f",
        background: "#1a1a1a",
        color: "#fff",
      });
    } else {
      Swal.fire({
        title: "Hata",
        text: "Kullanıcı adı veya şifre hatalı!",
        icon: "error",
        confirmButtonColor: "#ff007f",
        background: "#1a1a1a",
        color: "#fff",
      });
    }
  };

  if (isChecking) return null;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen pt-32 pb-24 flex items-center justify-center relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-neon-pink opacity-[0.05] rounded-full blur-[120px] pointer-events-none"></div>
        
        <div className="glass-panel p-10 max-w-md w-full w-full mx-4 clip-angled relative z-10">
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
              />
            </div>
            
            <button 
              type="submit"
              className="w-full bg-neon-pink text-white font-bold py-4 px-4 uppercase tracking-widest hover:bg-white hover:text-black transition-colors clip-angled"
            >
              Giriş Yap
            </button>
          </form>
          
          <p className="text-center text-gray-500 text-xs mt-6">
            Sadece yetkili personel içindir. Bilgiler (admin / 123456)
          </p>
        </div>
      </div>
    );
  }

  return <AdminDashboard onLogout={() => {
    sessionStorage.removeItem("adminAuth");
    setIsAuthenticated(false);
  }} />;
}
