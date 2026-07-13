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
      <div className="glass-panel p-6 clip-angled border border-white/5">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white uppercase tracking-widest">Güvenlik & Log Yönetimi</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setLogType("login")}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-widest transition-colors ${
                logType === "login"
                  ? "bg-neon-pink text-white"
                  : "bg-white/10 text-gray-400 hover:bg-white/20"
              }`}
            >
              Giriş Geçmişi
            </button>
            <button
              onClick={() => setLogType("audit")}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-widest transition-colors ${
                logType === "audit"
                  ? "bg-purple-500 text-white"
                  : "bg-white/10 text-gray-400 hover:bg-white/20"
              }`}
            >
              Sistem Logları
            </button>
          </div>
        </div>

        <p className="text-gray-400 text-sm mb-6">
          Toplam <span className="font-bold text-white">{total}</span> kayıt bulundu.
        </p>

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
                    <tr key={log.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4 text-gray-300">{formatDate(log.createdAt)}</td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-white">{log.user?.email || "Bilinmiyor"}</div>
                        <div className="text-xs text-gray-500">{log.ipAddress || "IP Yok"}</div>
                      </td>
                      {logType === "login" ? (
                        <td className="py-3 px-4 text-center">
                          {log.success ? (
                            <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs font-bold uppercase">
                              Başarılı
                            </span>
                          ) : (
                            <span className="bg-red-500/20 text-red-400 px-2 py-1 rounded text-xs font-bold uppercase">
                              Başarısız
                            </span>
                          )}
                        </td>
                      ) : (
                        <td className="py-3 px-4 text-purple-400 font-bold">{log.action}</td>
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
