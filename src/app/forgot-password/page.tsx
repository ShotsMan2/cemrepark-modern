"use client";
import { useState } from "react";
import Link from "next/link";
import Swal from "sweetalert2";
import { useStore } from "@/context/StoreContext";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const { t } = useStore();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        Swal.fire({
          icon: "success",
          title: t("reset_link_sent_title") || "Link Gönderildi",
          text: (t("reset_link_sent_desc") || "Şifre sıfırlama linki gönderildi.") + (data._devResetUrl ? `\n\n[Geliştirici Modu] Link: ${data._devResetUrl}` : ""),
          background: "rgba(10, 10, 10, 0.9)",
          color: "#fff",
        });
        setEmail("");
        router.push("/login");
      } else {
        Swal.fire({
          icon: "error",
          title: t("error_title") || "Hata",
          text: data.error || t("error_occurred") || "Bir hata oluştu",
          background: "rgba(10, 10, 10, 0.9)",
          color: "#fff",
        });
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      Swal.fire({
        icon: "error",
        title: t("error_title") || "Hata",
        text: t("error_occurred") || "Bir hata oluştu",
        background: "rgba(10, 10, 10, 0.9)",
        color: "#fff",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-20 flex items-center justify-center bg-background relative overflow-hidden px-4">
      <div className="max-w-md w-full glass-panel p-8 rounded-xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neon-pink to-holo-gold"></div>
        <h2 className="text-3xl font-black text-foreground mb-2 text-center">
          {t("reset_password_title") || "ŞİFREYİ SIFIRLA"}
        </h2>
        <p className="text-center text-foreground/70 mb-6 font-medium">
          {t("forgot_password_desc") || "E-posta adresinizi girin, size şifre sıfırlama bağlantısı gönderelim."}
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-foreground/70 text-sm font-bold mb-2 uppercase tracking-wider">
              {t("email") || "E-posta Adresi"}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black/5 dark:bg-black/50 border border-black/10 dark:border-gray-700 text-foreground px-4 py-3 rounded-lg focus:outline-none focus:border-neon-pink transition-colors font-medium"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-neon-pink to-holo-gold text-black font-bold py-3 px-4 rounded-lg hover:opacity-90 transition-opacity uppercase tracking-wider flex justify-center items-center gap-2 cursor-pointer"
          >
            {loading ? (t("sending_link") || "Gönderiliyor...") : (t("send_reset_link") || "Sıfırlama Linki Gönder")}
          </button>
        </form>

        <p className="mt-6 text-center text-foreground/70 font-medium">
          <Link href="/login" className="text-holo-gold hover:underline font-bold">
            ← {t("back_to_login") || "Giriş Ekranına Dön"}
          </Link>
        </p>
      </div>
    </div>
  );
}
