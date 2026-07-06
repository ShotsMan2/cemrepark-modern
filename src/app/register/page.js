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
    <div className="min-h-screen pt-32 pb-20 flex items-center justify-center bg-black px-4">
      <div className="max-w-md w-full glass-panel p-8 rounded-xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neon-pink to-holo-gold"></div>
        <h2 className="text-3xl font-black text-white mb-6 text-center">{t("register_title")}</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-400 text-sm font-bold mb-2 uppercase tracking-wider">
              {t("name_surname")}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-black/50 border border-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-neon-pink transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-gray-400 text-sm font-bold mb-2 uppercase tracking-wider">
              {t("email_title")}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black/50 border border-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-neon-pink transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-gray-400 text-sm font-bold mb-2 uppercase tracking-wider">
              {t("password_label")}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black/50 border border-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-neon-pink transition-colors"
              required
              minLength={6}
            />
            <p className="text-xs text-gray-500 mt-1">{t("password_hint")}</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-neon-pink to-holo-gold text-black font-bold py-3 px-4 rounded-lg hover:opacity-90 transition-opacity uppercase tracking-wider flex justify-center items-center gap-2"
          >
            {loading ? t("registering") : t("register")}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-400">
          {t("already_have_account")}{" "}
          <Link href="/login" className="text-holo-gold hover:underline">
            {t("login")}
          </Link>
        </p>
      </div>
    </div>
  );
}
