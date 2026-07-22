"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useStore } from "@/context/StoreContext";
import Swal from "sweetalert2";

export default function AccountSettingsPage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const { t } = useStore();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user) {
      // Fetch the full profile including phoneNumber from the API
      const fetchProfile = async () => {
        try {
          const res = await fetch("/api/users/profile");
          if (res.ok) {
            const data = await res.json();

            setFormData((prev) => ({
              ...prev,
              name: data.user.name || "",
              email: data.user.email || "",
              phoneNumber: data.user.phoneNumber || "",
            }));
          } else {
            // Fallback to session data if API fails

            setFormData((prev) => ({
              ...prev,
              name: session.user.name || "",
              email: session.user.email || "",
            }));
          }
        } catch {
          // Fallback to session data

          setFormData((prev) => ({
            ...prev,
            name: session.user.name || "",
            email: session.user.email || "",
          }));
        }
      };
      fetchProfile();
    }
  }, [session]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password && formData.password !== formData.confirmPassword) {
      Swal.fire({
        icon: "error",
        title: t("error") || "Hata",
        text: "Şifreler eşleşmiyor.",
        background: "#111",
        color: "#fff",
        confirmButtonColor: "#ff007f",
      });
      return;
    }

    if (formData.password && formData.password.length < 6) {
      Swal.fire({
        icon: "error",
        title: t("error") || "Hata",
        text: "Şifre en az 6 karakter olmalıdır.",
        background: "#111",
        color: "#fff",
        confirmButtonColor: "#ff007f",
      });
      return;
    }

    try {
      setLoading(true);

      const updatePayload: Record<string, any> = {
        name: formData.name,
        email: formData.email,
        phoneNumber: formData.phoneNumber || undefined,
      };

      if (formData.password) {
        updatePayload.password = formData.password;
      }

      const res = await fetch("/api/users/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": "1",
        },
        body: JSON.stringify(updatePayload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Güncelleme başarısız oldu.");
      }

      // Update the session if email, name, or phone number changed
      if (
        updatePayload.name !== session?.user?.name ||
        updatePayload.email !== session?.user?.email ||
        updatePayload.phoneNumber !== session?.user?.phoneNumber
      ) {
        await update({
          name: updatePayload.name,
          email: updatePayload.email,
          phoneNumber: updatePayload.phoneNumber,
        });
      }

      Swal.fire({
        icon: "success",
        title: "Başarılı",
        text: "Profil bilgileriniz güncellendi.",
        background: "#111",
        color: "#fff",
        confirmButtonColor: "#ff007f",
      });

      // Clear password fields
      setFormData((prev) => ({ ...prev, password: "", confirmPassword: "" }));
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: t("error") || "Hata",
        text: error.message,
        background: "#111",
        color: "#fff",
        confirmButtonColor: "#ff007f",
      });
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || status === "unauthenticated") {
    return (
      <div className="min-h-screen pt-32 pb-24 bg-background flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-24 bg-background relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 relative z-10">
        <div className="mb-8 flex items-center gap-4">
          <Link
            href="/hesabim"
            className="text-gray-400 hover:text-primary transition-colors flex items-center gap-2 font-medium"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            {t("back_to_account") || "Hesabıma Dön"}
          </Link>
        </div>

        <h1 className="text-4xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple to-primary uppercase text-center relative z-10 mb-4">
          {t("account_settings") || "Hesap Ayarları"}
        </h1>
        <div className="w-24 h-1 bg-primary mx-auto mb-12"></div>

        <div className="glass-panel p-8 clip-angled max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-foreground uppercase tracking-wider mb-2">
                {t("name") || "Ad Soyad"}
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-black/5 dark:bg-black/30 border border-black/10 dark:border-white/10 rounded-none px-4 py-3 text-foreground focus:outline-none focus:border-primary transition-colors"
                placeholder={t("name") || "Ad Soyad"}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-foreground uppercase tracking-wider mb-2">
                {t("email") || "E-posta Adresi"}
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full bg-black/5 dark:bg-black/30 border border-black/10 dark:border-white/10 rounded-none px-4 py-3 text-foreground focus:outline-none focus:border-primary transition-colors"
                placeholder="ornek@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-foreground uppercase tracking-wider mb-2">
                {t("phone") || "Telefon Numarası"}
              </label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                className="w-full bg-black/5 dark:bg-black/30 border border-black/10 dark:border-white/10 rounded-none px-4 py-3 text-foreground focus:outline-none focus:border-primary transition-colors"
                placeholder="05XX XXX XX XX"
              />
            </div>

            <div className="pt-6 border-t border-black/10 dark:border-white/10">
              <h3 className="text-xl font-bold text-foreground uppercase tracking-wider mb-4">
                {t("change_password") || "Şifre Değiştir"}
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                {t("change_password_info") ||
                  "Şifrenizi değiştirmek istemiyorsanız bu alanları boş bırakın."}
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-foreground uppercase tracking-wider mb-2">
                    {t("new_password") || "Yeni Şifre"}
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full bg-black/5 dark:bg-black/30 border border-black/10 dark:border-white/10 rounded-none px-4 py-3 text-foreground focus:outline-none focus:border-primary transition-colors"
                    placeholder={t("new_password_placeholder") || "En az 6 karakter"}
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-foreground uppercase tracking-wider mb-2">
                    {t("confirm_password") || "Yeni Şifre (Tekrar)"}
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full bg-black/5 dark:bg-black/30 border border-black/10 dark:border-white/10 rounded-none px-4 py-3 text-foreground focus:outline-none focus:border-primary transition-colors"
                    placeholder={t("confirm_password_placeholder") || "Şifrenizi tekrar girin"}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-foreground font-bold uppercase tracking-widest py-4 clip-angled hover:bg-white hover:text-primary transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-8"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <span className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></span>
                  {t("updating") || "GÜNCELLENİYOR..."}
                </span>
              ) : (
                t("save_changes") || "Değişiklikleri Kaydet"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
