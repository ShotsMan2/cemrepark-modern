"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useStore } from "@/context/StoreContext";

export default function HesabimPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t } = useStore();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading" || status === "unauthenticated") {
    return (
      <div className="min-h-screen pt-32 pb-24 bg-background flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neon-pink"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-24 bg-background relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 relative z-10">
        <h1 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-widest mb-4 text-center">
          {t("my_account")}
        </h1>
        <div className="w-24 h-1 bg-neon-pink mx-auto mb-12"></div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="glass-panel p-8 clip-angled">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-neon-pink to-holo-gold flex items-center justify-center text-xl font-bold text-black uppercase">
                {session?.user?.name ? session.user.name.charAt(0) : session?.user?.email.charAt(0)}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                  {session?.user?.name || t("user_default_name")}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 font-medium">{session?.user?.email}</p>
                {session?.user?.phoneNumber && (
                  <p className="text-gray-600 dark:text-gray-400 font-medium">{session.user.phoneNumber}</p>
                )}
              </div>
            </div>

            <button
              onClick={() => signOut({ callbackUrl: `${window.location.origin}/login` })}
              className="mt-4 bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/20 text-gray-900 dark:text-white px-6 py-3 uppercase tracking-wider font-bold hover:bg-neon-pink hover:text-white hover:border-neon-pink transition-all duration-300 clip-angled w-full cursor-pointer"
            >
              {t("logout")}
            </button>
          </div>

          <div className="glass-panel p-8 clip-angled">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 uppercase tracking-wider border-b border-black/10 dark:border-white/10 pb-4">
              {t("quick_links")}
            </h2>
            <div className="space-y-4">
              <Link
                href="/hesabim/siparislerim"
                className="flex items-center text-gray-600 dark:text-gray-400 hover:text-neon-pink dark:hover:text-neon-pink transition-colors font-medium"
              >
                <span className="w-2 h-2 rounded-full bg-holo-gold mr-3"></span>
                {t("my_orders")}
              </Link>
              <Link
                href="/favorites"
                className="flex items-center text-gray-600 dark:text-gray-400 hover:text-neon-pink dark:hover:text-neon-pink transition-colors font-medium"
              >
                <span className="w-2 h-2 rounded-full bg-holo-gold mr-3"></span>
                {t("my_favorites")}
              </Link>
              <Link
                href="/hesabim/ayarlar"
                className="flex items-center text-gray-600 dark:text-gray-400 hover:text-neon-pink dark:hover:text-neon-pink transition-colors font-medium"
              >
                <span className="w-2 h-2 rounded-full bg-holo-gold mr-3"></span>
                {t("account_settings")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
