"use client";
import React, { useState } from 'react';
import { Input, Textarea } from './Input';
import { Button } from './Button';
import PaymentSelector, { PaymentMethod } from './PaymentSelector';

interface CheckoutFormProps {
  onSubmit?: (data: any) => void;
  isProcessing?: boolean;
  paymentStatus?: string | null;
}

export function CheckoutForm({ onSubmit, isProcessing, paymentStatus }: CheckoutFormProps) {
  const [formData, setFormData] = useState({
    fullName: '', email: '', phone: '', address: '', city: '', cardNumber: '', cardExpiry: '', cardCvv: '',
  });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("credit_card");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'cardNumber') {
      const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
      const parts = v.match(/.{1,4}/g) || [];
      setFormData({ ...formData, cardNumber: parts.join(' ') });
      return;
    }
    if (name === 'cardExpiry') {
      const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
      if (v.length >= 2) setFormData({ ...formData, cardExpiry: `${v.substring(0, 2)}/${v.substring(2, 4)}` });
      else setFormData({ ...formData, cardExpiry: v });
      return;
    }
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit({ ...formData, paymentMethod });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* 1. Teslimat Bilgileri */}
      <div className="bg-white/50 dark:bg-zinc-800/50 p-6 md:p-8 rounded-[2rem] border border-white/20 dark:border-white/5 shadow-inner">
        <h3 className="text-xl font-black text-foreground mb-8 uppercase tracking-widest flex items-center gap-4">
          <span className="w-8 h-8 rounded-full bg-gradient-to-tr from-neon-pink to-holo-gold flex items-center justify-center text-foreground text-sm">1</span>
          Teslimat Bilgileri
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input 
            label="Ad Soyad" 
            name="fullName" 
            value={formData.fullName} 
            onChange={handleInputChange} 
            required 
          />
          <Input 
            label="Telefon" 
            name="phone" 
            type="tel"
            value={formData.phone} 
            onChange={handleInputChange} 
            required 
          />
          <div className="md:col-span-2">
            <Input 
              label="E-Posta" 
              name="email" 
              type="email"
              value={formData.email} 
              onChange={handleInputChange} 
              required 
            />
          </div>
          <div className="md:col-span-2">
            <Textarea 
              label="Açık Adres" 
              name="address" 
              value={formData.address} 
              onChange={handleInputChange} 
              required 
              rows={3}
            />
          </div>
          <div className="md:col-span-2">
            <Input 
              label="Şehir / İlçe" 
              name="city" 
              value={formData.city} 
              onChange={handleInputChange} 
              required 
            />
          </div>
        </div>
      </div>

      {/* 2. Ödeme Bilgileri */}
      <div className="bg-white/50 dark:bg-zinc-800/50 p-6 md:p-8 rounded-[2rem] border border-white/20 dark:border-white/5 shadow-inner">
        <h3 className="text-xl font-black text-foreground mb-8 uppercase tracking-widest flex items-center gap-4">
          <span className="w-8 h-8 rounded-full bg-gradient-to-tr from-neon-pink to-holo-gold flex items-center justify-center text-foreground text-sm">2</span>
          Ödeme Bilgileri
        </h3>
        <div className="space-y-6">
          <PaymentSelector
            selectedMethod={paymentMethod}
            onSelect={(method) => setPaymentMethod(method)}
          />

          {paymentMethod === "credit_card" ? (
            <>
              <Input 
                label="Kart Numarası" 
                name="cardNumber" 
                value={formData.cardNumber} 
                onChange={handleInputChange} 
                maxLength={19}
                placeholder="0000 0000 0000 0000"
                required 
              />
              <div className="grid grid-cols-2 gap-6">
                <Input 
                  label="Son Kullanma" 
                  name="cardExpiry" 
                  value={formData.cardExpiry} 
                  onChange={handleInputChange} 
                  maxLength={5}
                  placeholder="AA/YY"
                  required 
                />
                <Input 
                  label="CVV" 
                  name="cardCvv" 
                  value={formData.cardCvv} 
                  onChange={handleInputChange} 
                  maxLength={3}
                  placeholder="123"
                  required 
                />
              </div>
            </>
          ) : (
            <div className="bg-secondary/10 border border-secondary/30 rounded-xl p-6 text-center animate-slide-up">
              <div className="mb-4 text-secondary">
                <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="text-lg font-bold text-foreground mb-2">Havale ile Ödeme</h4>
              <p className="text-foreground/70 text-sm">
                Siparişinizi tamamladıktan sonra, ekranda görünecek olan IBAN numaralarımızdan birine sipariş tutarını gönderebilirsiniz. 
                <br className="hidden md:block"/> Açıklama kısmına sipariş numaranızı yazmayı unutmayın!
              </p>
            </div>
          )}
        </div>
      </div>

      <Button 
        type="submit" 
        isLoading={isProcessing}
        className="w-full h-16 text-lg rounded-2xl shadow-xl hover:shadow-2xl hover:shadow-neon-pink/20"
      >
        {isProcessing ? (paymentStatus || "İşleniyor...") : "Siparişi Tamamla"}
      </Button>
    </form>
  );
}
