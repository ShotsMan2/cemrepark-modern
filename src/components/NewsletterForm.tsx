"use client";
import React from "react";
import { useStore } from "../context/StoreContext";
import { Input } from "./ui/Input";
import { Button } from "./ui/Button";
import Swal from "sweetalert2";

export default function NewsletterForm() {
  const { t } = useStore();
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;

    const emailInput = form.querySelector('input[type="email"]') as HTMLInputElement;
    if (!emailInput?.value) {
      if (typeof window !== "undefined" && Swal) {
        Swal.fire({
          icon: "warning",
          title: "Uyarı",
          text: t("email_placeholder") || "Lütfen e-posta adresinizi giriniz.",
          confirmButtonColor: "#ff007f",
          background: "#1a1a1a",
          color: "#fff",
        });
      }
      return;
    }

    if (typeof window !== "undefined" && Swal) {
      Swal.fire({
        icon: "success",
        title: t("thanks"),
        text: t("newsletter_success"),
        confirmButtonColor: "#ff007f",
        background: "#1a1a1a",
        color: "#fff",
      });
    }
    form.reset();
  };

  return (
    <form
      className="flex flex-col md:flex-row gap-4 justify-center items-stretch"
      onSubmit={handleSubmit}
      noValidate
    >
      <div className="flex-1 max-w-md">
        <Input
          type="email"
          placeholder={t("email_placeholder") as string}
          required
          className="bg-white/5 border-white/20 text-foreground min-w-[300px] h-full"
        />
      </div>
      <Button
        type="submit"
        className="px-8 py-4 h-full"
      >
        {t("subscribe")}
      </Button>
    </form>
  );
}
