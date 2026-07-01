"use client";

import { useState } from "react";
import Swal from "sweetalert2";
import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";

export default function HesabimPage() {
  const { data: session, status } = useSession();
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    if (isLoginMode) {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        Swal.fire({
          title: "Hata",
          text: "E-posta veya şifre hatalı!",
          icon: "error",
          confirmButtonColor: "#ff007f",
          background: "#1a1a1a",
          color: "#fff",
        });
      } else {
        Swal.fire({
          title: "Hoş Geldiniz!",
          text: "Giriş başarılı.",
          icon: "success",
          confirmButtonColor: "#ff007f",
          background: "#1a1a1a",
          color: "#fff",
        });
      }
    } else {
      try {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        
        if (!res.ok) {
          throw new Error(data.error || "Kayıt olurken bir hata oluştu");
        }
        
        Swal.fire({
          title: "Kayıt Başarılı!",
          text: "Şimdi giriş yapabilirsiniz.",
          icon: "success",
          confirmButtonColor: "#ff007f",
          background: "#1a1a1a",
          color: "#fff",
        });
        setIsLoginMode(true);
      } catch (error) {
        Swal.fire({
          title: "Hata",
          text: error.message,
          icon: "error",
          confirmButtonColor: "#ff007f",
          background: "#1a1a1a",
          color: "#fff",
        });
      }
    }
    
    setIsSubmitting(false);
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
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-neon-pink opacity-[0.05] rounded-full blur-[120px] pointer-events-none"></div>
        
        <div className="glass-panel p-10 max-w-md w-full mx-4 clip-angled relative z-10 bg-black/40 border border-white/10 backdrop-blur-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black text-white uppercase tracking-widest mb-2">
              {isLoginMode ? "Müşteri Girişi" : "Kayıt Ol"}
            </h1>
            <div className="w-16 h-1 bg-neon-pink mx-auto"></div>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-400 text-sm font-bold mb-2 uppercase tracking-wider">E-posta</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 focus:outline-none focus:border-neon-pink transition-colors"
                placeholder="E-posta adresiniz"
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
                placeholder="Şifreniz"
                disabled={isSubmitting}
                required
              />
            </div>
            
            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-neon-pink text-white font-bold py-4 px-4 uppercase tracking-widest hover:bg-white hover:text-black transition-colors clip-angled disabled:opacity-50"
            >
              {isSubmitting ? "Bekleyiniz..." : isLoginMode ? "Giriş Yap" : "Kayıt Ol"}
            </button>
          </form>
          
          <div className="text-center mt-6">
            <button 
              type="button"
              onClick={() => setIsLoginMode(!isLoginMode)}
              className="text-gray-400 hover:text-neon-pink transition-colors text-sm uppercase tracking-wider"
            >
              {isLoginMode ? "Hesabınız yok mu? Kayıt Olun" : "Zaten hesabınız var mı? Giriş Yapın"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-24 bg-[#0a0a0a]">
      <div className="max-w-4xl mx-auto px-4 relative z-10">
        <h1 className="text-4xl font-black text-white uppercase tracking-widest mb-4 text-center">Hesabım</h1>
        <div className="w-24 h-1 bg-neon-pink mx-auto mb-12"></div>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="glass-panel p-8 clip-angled bg-black/40 border border-white/10 backdrop-blur-md">
            <h2 className="text-2xl font-bold text-white mb-4 uppercase tracking-wider">Hoş Geldiniz</h2>
            <p className="text-gray-400 mb-6">{session.user.email}</p>
            
            <button 
              onClick={() => signOut()}
              className="bg-white/10 border border-white/20 text-white px-6 py-3 uppercase tracking-wider font-bold hover:bg-white hover:text-black transition-colors clip-angled"
            >
              Çıkış Yap
            </button>
          </div>
          
          <div className="glass-panel p-8 clip-angled bg-black/40 border border-white/10 backdrop-blur-md">
            <h2 className="text-2xl font-bold text-white mb-4 uppercase tracking-wider">Hızlı Bağlantılar</h2>
            <div className="space-y-4">
              <Link href="/hesabim/siparislerim" className="block text-gray-400 hover:text-neon-pink transition-colors">
                • Siparişlerim
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
