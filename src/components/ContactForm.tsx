"use client";
import React, { useState } from "react";
import { Input, Textarea } from "./ui/Input";
import { Button } from "./ui/Button";
import { showToast, showErrorToast } from "../utils/toast";

export default function ContactForm() {
  const [adSoyad, setAdSoyad] = useState("");
  const [ePosta, setEPosta] = useState("");
  const [mesaj, setMesaj] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
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
        showToast("Mesajınız Alındı! En kısa sürede dönüş yapacağız.");
        setAdSoyad("");
        setEPosta("");
        setMesaj("");
      } else {
        showErrorToast("Mesaj gönderilirken bir hata oluştu.");
      }
    } catch (error) {
      console.error("Mesaj gönderilirken hata oluştu:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <Input
        label="Ad Soyad"
        required
        type="text"
        value={adSoyad}
        onChange={(e) => setAdSoyad(e.target.value)}
      />
      <Input
        label="E-Posta"
        required
        type="email"
        value={ePosta}
        onChange={(e) => setEPosta(e.target.value)}
      />
      <Textarea
        label="Mesajınız"
        required
        rows={4}
        value={mesaj}
        onChange={(e) => setMesaj(e.target.value)}
      />
      <Button
        type="submit"
        isLoading={isSubmitting}
        className="w-full"
      >
        Gönder
      </Button>
    </form>
  );
}
