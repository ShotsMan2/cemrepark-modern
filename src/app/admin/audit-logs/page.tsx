import prisma from "@/lib/prisma";
import React from "react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import ExportButton from "../components/ExportButton";

export const metadata = {
  title: "Audit Logs - Admin Panel",
};

export default async function AuditLogsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || (session.user as any)?.role !== "admin") {
    redirect("/admin");
  }

  const logs = await prisma.auditLog.findMany({
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
          <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-indigo-600 uppercase tracking-widest">
            Audit Logs
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            Sistem aktivite ve değişiklik kayıtları (Son 100 işlem)
          </p>
        </div>
        <ExportButton 
          data={logs.map(log => ({
            "Tarih": new Date(log.createdAt).toLocaleString("tr-TR"),
            "Kullanıcı": log.user?.name || log.user?.email || "Bilinmiyor",
            "Aksiyon": log.action,
            "Detay": log.details || "-",
            "IP Adresi": log.ipAddress || "Bilinmiyor"
          }))}
          filename="audit_logs.csv"
        />
      </div>

      <div className="glass-panel p-0 clip-angled border border-white/5 overflow-hidden shadow-2xl bg-black/40 backdrop-blur-xl">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-xs uppercase tracking-widest text-gray-400 bg-white/5">
                <th className="py-4 px-6">Tarih</th>
                <th className="py-4 px-6">Kullanıcı</th>
                <th className="py-4 px-6">Aksiyon</th>
                <th className="py-4 px-6">Detay</th>
                <th className="py-4 px-6">IP Adresi</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500">
                    Kayıt bulunamadı.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="border-b border-white/5 hover:bg-white/5 transition-all duration-300 group">
                    <td className="py-4 px-6 text-gray-400 font-mono text-xs group-hover:text-white transition-colors">
                      {new Date(log.createdAt).toLocaleString("tr-TR")}
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-black text-white flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-xs text-indigo-400 uppercase border border-indigo-500/30">
                          {log.user?.email ? log.user.email.substring(0, 2) : "?"}
                        </div>
                        <div className="flex flex-col">
                          <span>{log.user?.name || "Bilinmiyor"}</span>
                          <span className="text-[10px] text-gray-500 font-mono">{log.user?.email || "Sistem / Anonim"}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-[0_0_10px_rgba(99,102,241,0.1)]">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-gray-300 max-w-xs truncate" title={log.details || ""}>
                      {log.details || "-"}
                    </td>
                    <td className="py-4 px-6 text-gray-500 font-mono text-xs flex items-center gap-1 mt-2">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path>
                      </svg>
                      {log.ipAddress || "Bilinmiyor"}
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
