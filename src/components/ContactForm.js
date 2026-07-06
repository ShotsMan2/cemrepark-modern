"use client";
import React, { useState } from "react";

export default function ContactForm() {
  const [adSoyad, setAdSoyad] = useState("");
  const [ePosta, setEPosta] = useState("");
  const [mesaj, setMesaj] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!adSoyad || !ePosta || !mesaj) return;
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adSoyad, ePosta, mesaj }),
      });

      if (res.ok) {
        if (typeof window !== "undefined" && window.Swal) {
          window.Swal.fire({
            icon: "success",
            title: "Mesajınız Alındı!",
            text: "En kısa sürede size dönüş yapacağız.",
            confirmButtonColor: "#ff007f",
            background: "#111",
            color: "#fff",
          });
        } else {
          alert("Mesajınız Alındı! En kısa sürede size dönüş yapacağız.");
        }
        setAdSoyad("");
        setEPosta("");
        setMesaj("");
      } else {
        if (typeof window !== "undefined" && window.Swal) {
          window.Swal.fire({
            icon: "error",
            title: "Hata",
            text: "Mesaj gönderilirken bir hata oluştu.",
            confirmButtonColor: "#ff007f",
            background: "#111",
            color: "#fff",
          });
        }
      }
    } catch (error) {
      console.error("Mesaj gönderilirken hata oluştu:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div>
        <label className="block text-gray-400 text-xs font-bold mb-2 uppercase tracking-wider">
          Ad Soyad
        </label>
        <input
          required
          type="text"
          value={adSoyad}
          onChange={(e) => setAdSoyad(e.target.value)}
          className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 text-sm focus:border-neon-pink outline-none transition-colors"
        />
      </div>
      <div>
        <label className="block text-gray-400 text-xs font-bold mb-2 uppercase tracking-wider">
          E-Posta
        </label>
        <input
          required
          type="email"
          value={ePosta}
          onChange={(e) => setEPosta(e.target.value)}
          className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 text-sm focus:border-neon-pink outline-none transition-colors"
        />
      </div>
      <div>
        <label className="block text-gray-400 text-xs font-bold mb-2 uppercase tracking-wider">
          Mesajınız
        </label>
        <textarea
          required
          rows="4"
          value={mesaj}
          onChange={(e) => setMesaj(e.target.value)}
          className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 text-sm focus:border-neon-pink outline-none transition-colors"
        ></textarea>
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-neon-pink text-white font-bold py-3 uppercase tracking-widest text-sm hover:bg-white hover:text-neon-pink transition-colors clip-angled disabled:opacity-50"
      >
        {isSubmitting ? "Gönderiliyor..." : "Gönder"}
      </button>
    </form>
  );
}
