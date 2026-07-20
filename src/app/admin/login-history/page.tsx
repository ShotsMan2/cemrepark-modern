import prisma from "@/lib/prisma";
import React from "react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import ExportButton from "../components/ExportButton";

export const metadata = {
  title: "Login History - Admin Panel",
};

export default async function LoginHistoryPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || (session.user as any)?.role !== "admin") {
    redirect("/admin");
  }

  const logs = await prisma.loginHistory.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      user: {
        select: { email: true, name: true },
      },
    },
  });

  return (
    <div className="p-8 space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-neon-pink to-pink-600 uppercase tracking-widest">
            Giriş Geçmişi
          </h2>
          <p className="text-foreground/50 text-sm mt-1">
            Kullanıcı oturum açma kayıtları (Son 100 işlem)
          </p>
        </div>
        <ExportButton 
          data={logs.map(log => ({
            "Tarih": new Date(log.createdAt).toLocaleString("tr-TR"),
            "Kullanıcı": log.user?.name || log.user?.email || "Bilinmiyor",
            "Durum": log.success ? "Başarılı" : "Başarısız",
            "IP Adresi": log.ipAddress || "Bilinmiyor",
            "Tarayıcı / Cihaz": log.userAgent || "-"
          }))}
          filename="login_history.csv"
        />
      </div>

      <div className="glass-panel p-0 clip-angled border border-glass-border overflow-hidden shadow-2xl bg-black/40 backdrop-blur-xl">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-glass-border text-xs uppercase tracking-widest text-foreground/50 bg-foreground/5">
                <th className="py-4 px-6">Tarih</th>
                <th className="py-4 px-6">Kullanıcı</th>
                <th className="py-4 px-6 text-center">Durum</th>
                <th className="py-4 px-6">IP Adresi</th>
                <th className="py-4 px-6">Tarayıcı / Cihaz</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-foreground/60">
                    Kayıt bulunamadı.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="border-b border-glass-border hover:bg-foreground/5 transition-all duration-300 group">
                    <td className="py-4 px-6 text-foreground/50 font-mono text-xs group-hover:text-foreground transition-colors">
                      {new Date(log.createdAt).toLocaleString("tr-TR")}
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-black text-foreground flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-pink-500/20 flex items-center justify-center text-xs text-pink-400 uppercase border border-pink-500/30">
                          {log.user?.email ? log.user.email.substring(0, 2) : "?"}
                        </div>
                        <div className="flex flex-col">
                          <span>{log.user?.name || "Bilinmiyor"}</span>
                          <span className="text-[10px] text-foreground/60 font-mono">{log.user?.email || "Silinmiş Kullanıcı"}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      {log.success ? (
                        <span className="inline-flex items-center gap-1.5 bg-green-500/10 text-green-400 border border-green-500/20 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></div>
                          BAŞARILI
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 bg-red-500/10 text-red-400 border border-red-500/20 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-[0_0_10px_rgba(239,68,68,0.1)]">
                          <div className="w-1.5 h-1.5 rounded-full bg-red-400"></div>
                          REDDEDİLDİ
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-foreground/60 font-mono text-xs">
                      <div className="flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path>
                        </svg>
                        {log.ipAddress || "Bilinmiyor"}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-foreground/50 text-xs truncate max-w-[200px]" title={log.userAgent || ""}>
                      {log.userAgent || "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
