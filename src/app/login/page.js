"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Swal from "sweetalert2";
import { useStore } from "@/context/StoreContext";

export default function LoginPage() {
  const router = useRouter();
  const { t } = useStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    setLoading(false);

    if (res?.error) {
      Swal.fire({
        icon: "error",
        title: t("login_failed"),
        text: t("login_invalid_credentials"),
        background: "rgba(10, 10, 10, 0.9)",
        color: "#fff",
      });
    } else {
      router.push("/hesabim");
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-20 flex items-center justify-center bg-background relative overflow-hidden px-4">
      <div className="max-w-md w-full glass-panel p-8 rounded-xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neon-pink to-holo-gold"></div>
        <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-6 text-center">{t("login_title")}</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-600 dark:text-gray-400 text-sm font-bold mb-2 uppercase tracking-wider">
              {t("email_title")}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black/5 dark:bg-black/50 border border-black/10 dark:border-gray-700 text-gray-900 dark:text-white px-4 py-3 rounded-lg focus:outline-none focus:border-neon-pink transition-colors font-medium"
              required
            />
          </div>

          <div>
            <label className="block text-gray-600 dark:text-gray-400 text-sm font-bold mb-2 uppercase tracking-wider">
              {t("password_label")}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black/5 dark:bg-black/50 border border-black/10 dark:border-gray-700 text-gray-900 dark:text-white px-4 py-3 rounded-lg focus:outline-none focus:border-neon-pink transition-colors font-medium"
              required
            />
          </div>

          <div className="flex items-center justify-between">
            <Link
              href="/forgot-password"
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-holo-gold dark:hover:text-holo-gold transition-colors font-semibold"
            >
              {t("forgot_password")}
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-neon-pink to-holo-gold text-black font-bold py-3 px-4 rounded-lg hover:opacity-90 transition-opacity uppercase tracking-wider flex justify-center items-center gap-2 cursor-pointer"
          >
            {loading ? t("logging_in") : t("login")}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-600 dark:text-gray-400 font-medium">
          {t("dont_have_account")}{" "}
          <Link href="/register" className="text-holo-gold hover:underline font-bold">
            {t("register")}
          </Link>
        </p>
      </div>
    </div>
  );
}
