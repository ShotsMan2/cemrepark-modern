import { useState, useEffect } from "react";
import Swal from "sweetalert2";

export default function SecurityView() {
  const [logType, setLogType] = useState("login"); // login or audit
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchLogs(logType);
  }, [logType]);

  const fetchLogs = async (type) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/logs?type=${type}&take=50&skip=0`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
        setTotal(data.total || 0);
      } else {
        Swal.fire("Hata", "Loglar alınamadı", "error");
      }
    } catch (error) {
      console.error("Log fetch error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleString("tr-TR");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
        <div>
          <h2 className="text-2xl font-black text-white uppercase tracking-widest">Güvenlik Kontrol Merkezi</h2>
          <p className="text-gray-400 text-sm mt-1">Sistem erişim ve değişiklik kayıtları ({total} kayıt)</p>
        </div>
      </div>

      {/* Enterprise Filter & Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="glass-panel p-6 clip-angled border border-white/5 relative overflow-hidden flex flex-col justify-center">
          <div className="absolute top-0 right-0 w-16 h-16 bg-neon-pink/10 rounded-bl-full"></div>
          <h3 className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">Görüntülenen Kategori</h3>
          <p className="text-2xl font-black text-white">{logType === "login" ? "Giriş Geçmişi" : "Sistem Logları"}</p>
        </div>
        <div className="glass-panel p-6 clip-angled border border-white/5 relative overflow-hidden md:col-span-2 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-bl-full"></div>
          <div className="relative z-10">
            <h3 className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-3">Veri Kaynağı Seçimi</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setLogType("login")}
                className={`px-6 py-2.5 text-xs font-black uppercase tracking-widest transition-all duration-300 rounded-xl shadow-lg border ${
                  logType === "login"
                    ? "bg-gradient-to-r from-neon-pink to-pink-600 text-white border-pink-500 shadow-neon-pink/30 scale-105"
                    : "bg-white/5 text-gray-400 border-white/5 hover:bg-white/10 hover:text-white"
                }`}
              >
                Oturumlar
              </button>
              <button
                onClick={() => setLogType("audit")}
                className={`px-6 py-2.5 text-xs font-black uppercase tracking-widest transition-all duration-300 rounded-xl shadow-lg border ${
                  logType === "audit"
                    ? "bg-gradient-to-r from-purple-500 to-indigo-600 text-white border-indigo-500 shadow-purple-500/30 scale-105"
                    : "bg-white/5 text-gray-400 border-white/5 hover:bg-white/10 hover:text-white"
                }`}
              >
                Aktiviteler
              </button>
            </div>
          </div>
          <div className="relative z-10 w-full md:w-auto">
            <div className="relative">
              <input type="text" placeholder="IP, Email veya İşlem Ara..." className="w-full md:w-64 bg-black/50 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-neon-pink/50 focus:ring-1 focus:ring-neon-pink/50 transition-all placeholder:text-gray-600" />
              <svg className="w-4 h-4 text-gray-500 absolute left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </div>
          </div>
        </div>
      </div>

      <div className="glass-panel p-0 clip-angled border border-white/5 overflow-hidden shadow-2xl">

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neon-pink"></div>
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-xs uppercase tracking-widest text-gray-400">
                  <th className="py-3 px-4">Tarih</th>
                  <th className="py-3 px-4">Kullanıcı / IP</th>
                  {logType === "login" ? (
                    <th className="py-3 px-4 text-center">Durum</th>
                  ) : (
                    <th className="py-3 px-4">Aksiyon</th>
                  )}
                  {logType === "audit" && <th className="py-3 px-4">Detay</th>}
                </tr>
              </thead>
              <tbody className="text-sm">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-gray-500">
                      Kayıt bulunamadı.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="border-b border-white/5 hover:bg-white/5 transition-all duration-300 group">
                      <td className="py-4 px-6 text-gray-400 font-mono text-xs group-hover:text-white transition-colors">{formatDate(log.createdAt)}</td>
                      <td className="py-4 px-6">
                        <div className="font-black text-white flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] text-holo-gold uppercase">
                            {log.user?.email ? log.user.email.substring(0, 2) : "?"}
                          </div>
                          {log.user?.email || "Sistem / Anonim"}
                        </div>
                        <div className="text-xs text-gray-500 mt-1 font-mono flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path></svg>
                          {log.ipAddress || "Bilinmeyen IP"}
                        </div>
                      </td>
                      {logType === "login" ? (
                        <td className="py-4 px-6 text-center">
                          {log.success ? (
                            <span className="inline-flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
                              BAŞARILI
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 bg-red-500/10 text-red-400 border border-red-500/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-[0_0_10px_rgba(239,68,68,0.1)]">
                              <div className="w-1.5 h-1.5 rounded-full bg-red-400"></div>
                              REDDEDİLDİ
                            </span>
                          )}
                        </td>
                      ) : (
                        <td className="py-4 px-6">
                          <span className="bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider">
                            {log.action}
                          </span>
                        </td>
                      )}
                      {logType === "audit" && <td className="py-3 px-4 text-gray-400 truncate max-w-xs">{log.details || "-"}</td>}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
