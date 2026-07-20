"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Swal from "sweetalert2";
import { useStore } from "@/context/StoreContext";

export default function RegisterPage() {
  const router = useRouter();
  const { t } = useStore();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        Swal.fire({
          icon: "error",
          title: t("register_failed"),
          text: data.error || t("error_occurred"),
          background: "rgba(10, 10, 10, 0.9)",
          color: "#fff",
        });
      } else {
        Swal.fire({
          icon: "success",
          title: t("success"),
          text: t("register_success_desc"),
          background: "rgba(10, 10, 10, 0.9)",
          color: "#fff",
        }).then(() => {
          router.push("/login");
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: t("error_title"),
        text: t("register_error_unexpected"),
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
        <h2 className="text-3xl font-black text-foreground mb-6 text-center">{t("register_title")}</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-foreground/70 text-sm font-bold mb-2 uppercase tracking-wider">
              {t("name_surname")}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-black/5 dark:bg-black/50 border border-black/10 dark:border-gray-700 text-foreground px-4 py-3 rounded-lg focus:outline-none focus:border-neon-pink transition-colors font-medium"
              required
            />
          </div>

          <div>
            <label className="block text-foreground/70 text-sm font-bold mb-2 uppercase tracking-wider">
              {t("email_title")}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black/5 dark:bg-black/50 border border-black/10 dark:border-gray-700 text-foreground px-4 py-3 rounded-lg focus:outline-none focus:border-neon-pink transition-colors font-medium"
              required
            />
          </div>

          <div>
            <label className="block text-foreground/70 text-sm font-bold mb-2 uppercase tracking-wider">
              {t("password_label")}
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/5 dark:bg-black/50 border border-black/10 dark:border-gray-700 text-foreground px-4 py-3 rounded-lg focus:outline-none focus:border-neon-pink transition-colors font-medium pr-12"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 px-4 flex items-center text-gray-500 hover:text-holo-gold dark:hover:text-holo-gold transition-colors focus:outline-none cursor-pointer"
                title={showPassword ? t("hide_password") || "Şifreyi gizle" : t("show_password") || "Şifreyi göster"}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">{t("password_hint")}</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-neon-pink to-holo-gold text-black font-bold py-3 px-4 rounded-lg hover:opacity-90 transition-opacity uppercase tracking-wider flex justify-center items-center gap-2 cursor-pointer"
          >
            {loading ? t("registering") : t("register")}
          </button>
        </form>

        <p className="mt-6 text-center text-foreground/70 font-medium">
          {t("already_have_account")}{" "}
          <Link href="/login" className="text-holo-gold hover:underline font-bold">
            {t("login")}
          </Link>
        </p>
      </div>
    </div>
  );
}
