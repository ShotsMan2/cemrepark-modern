"use client";
import React, { useState } from "react";
import { Input, Textarea } from "./ui/Input";
import { Button } from "./ui/Button";
import Swal from "sweetalert2";

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
        if (typeof window !== "undefined" && Swal) {
          Swal.fire({
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
        if (typeof window !== "undefined" && Swal) {
          Swal.fire({
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
