"use client";
import React from 'react';
import { useStore } from '../context/StoreContext';

export default function NewsletterForm() {
  const { t } = useStore();
  const handleSubmit = (e) => {
    e.preventDefault();
    
    const emailInput = e.target.querySelector('input[type="email"]');
    if (!emailInput.value) {
      if (typeof window !== 'undefined' && window.Swal) {
        window.Swal.fire({
          icon: 'warning',
          title: 'Uyarı',
          text: t("email_placeholder") || 'Lütfen e-posta adresinizi giriniz.',
          confirmButtonColor: '#ff007f',
          background: '#1a1a1a',
          color: '#fff'
        });
      }
      return;
    }

    if (typeof window !== 'undefined' && window.Swal) {
      window.Swal.fire({
        icon: 'success',
        title: t("thanks"),
        text: t("newsletter_success"),
        confirmButtonColor: '#ff007f',
        background: '#1a1a1a',
        color: '#fff'
      });
    }
    e.target.reset();
  };

  return (
    <form className="flex flex-col md:flex-row gap-4 justify-center" onSubmit={handleSubmit} noValidate>
      <input 
        type="email" 
        placeholder={t("email_placeholder")}
        required
        className="bg-white/5 border border-white/20 text-white px-6 py-4 min-w-[300px] focus:outline-none focus:border-neon-pink transition-colors clip-angled"
      />
      <button type="submit" className="bg-neon-pink text-white font-bold uppercase tracking-widest px-8 py-4 clip-angled hover:bg-holo-gold hover:text-black transition-colors duration-300">
        {t("subscribe")}
      </button>
    </form>
  );
}
