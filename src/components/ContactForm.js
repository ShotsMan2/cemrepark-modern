"use client";
import React from "react";

export default function ContactForm() {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (typeof window !== 'undefined' && window.Swal) {
      window.Swal.fire({
        icon: 'success',
        title: 'Mesajınız Alındı!',
        text: 'En kısa sürede size dönüş yapacağız.',
        confirmButtonColor: '#ff007f',
        background: '#111',
        color: '#fff'
      });
    } else {
      alert("Mesajınız Alındı! En kısa sürede size dönüş yapacağız.");
    }
    e.target.reset();
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div>
        <label className="block text-gray-400 text-xs font-bold mb-2 uppercase tracking-wider">Ad Soyad</label>
        <input required type="text" className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 text-sm focus:border-neon-pink outline-none transition-colors" />
      </div>
      <div>
        <label className="block text-gray-400 text-xs font-bold mb-2 uppercase tracking-wider">E-Posta</label>
        <input required type="email" className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 text-sm focus:border-neon-pink outline-none transition-colors" />
      </div>
      <div>
        <label className="block text-gray-400 text-xs font-bold mb-2 uppercase tracking-wider">Mesajınız</label>
        <textarea required rows="4" className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 text-sm focus:border-neon-pink outline-none transition-colors"></textarea>
      </div>
      <button type="submit" className="w-full bg-neon-pink text-white font-bold py-3 uppercase tracking-widest text-sm hover:bg-white hover:text-neon-pink transition-colors clip-angled">
        Gönder
      </button>
    </form>
  );
}
