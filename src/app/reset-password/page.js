"use client";
import { useState, Suspense } from "react";
import Link from "next/link";
import Swal from "sweetalert2";
import { useStore } from "@/context/StoreContext";
import { useRouter, useSearchParams } from "next/navigation";

function ResetPasswordForm() {
  const { t } = useStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  if (!token) {
    return (
      <div className="text-center">
        <p className="text-red-500 mb-4 font-bold">Geçersiz veya eksik token.</p>
        <Link href="/login" className="text-holo-gold hover:underline font-bold">
            ← {t("back_to_login") || "Giriş Ekranına Dön"}
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      Swal.fire({
        icon: "warning",
        title: "Uyarı",
        text: "Şifreler eşleşmiyor.",
        background: "rgba(10, 10, 10, 0.9)",
        color: "#fff",
      });
      return;
    }

    if (password.length < 6) {
      Swal.fire({
        icon: "warning",
        title: "Uyarı",
        text: "Şifre en az 6 karakter olmalıdır.",
        background: "rgba(10, 10, 10, 0.9)",
        color: "#fff",
      });
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (res.ok) {
        Swal.fire({
          icon: "success",
          title: t("reset_password_success_title") || "Başarılı",
          text: t("reset_password_success_desc") || "Şifreniz başarıyla sıfırlandı.",
          background: "rgba(10, 10, 10, 0.9)",
          color: "#fff",
        }).then(() => {
            router.push("/login");
        });
      } else {
        Swal.fire({
          icon: "error",
          title: t("reset_password_error_title") || "Hata",
          text: data.error || t("reset_password_error_desc") || "Sıfırlama işlemi başarısız.",
          background: "rgba(10, 10, 10, 0.9)",
          color: "#fff",
        });
      }
    } catch (error) {
      console.error("Reset password error:", error);
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
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-gray-600 dark:text-gray-400 text-sm font-bold mb-2 uppercase tracking-wider">
          {t("new_password") || "Yeni Şifre"}
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-black/5 dark:bg-black/50 border border-black/10 dark:border-gray-700 text-gray-900 dark:text-white px-4 py-3 rounded-lg focus:outline-none focus:border-neon-pink transition-colors font-medium"
          placeholder={t("new_password_placeholder") || "En az 6 karakter"}
          required
        />
      </div>

      <div>
        <label className="block text-gray-600 dark:text-gray-400 text-sm font-bold mb-2 uppercase tracking-wider">
          {t("confirm_password") || "Yeni Şifre (Tekrar)"}
        </label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full bg-black/5 dark:bg-black/50 border border-black/10 dark:border-gray-700 text-gray-900 dark:text-white px-4 py-3 rounded-lg focus:outline-none focus:border-neon-pink transition-colors font-medium"
          placeholder={t("confirm_password_placeholder") || "Şifrenizi tekrar girin"}
          required
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-neon-pink to-holo-gold text-black font-bold py-3 px-4 rounded-lg hover:opacity-90 transition-opacity uppercase tracking-wider flex justify-center items-center gap-2 cursor-pointer"
      >
        {loading ? (t("updating") || "Güncelleniyor...") : (t("save_changes") || "Değişiklikleri Kaydet")}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  const { t } = useStore();

  return (
    <div className="min-h-screen pt-32 pb-20 flex items-center justify-center bg-background relative overflow-hidden px-4">
      <div className="max-w-md w-full glass-panel p-8 rounded-xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neon-pink to-holo-gold"></div>
        <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2 text-center">
          {t("reset_password_title") || "ŞİFREYİ SIFIRLA"}
        </h2>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-6 font-medium">
          {t("reset_password_desc") || "Yeni şifrenizi aşağıdan belirleyebilirsiniz."}
        </p>

        <Suspense fallback={<div className="text-center text-gray-500">Yükleniyor...</div>}>
          <ResetPasswordForm />
        </Suspense>

      </div>
    </div>
  );
}
