"use client";

import React, { useState, useEffect } from "react";

export default function LogsPage() {
  const [activeTab, setActiveTab] = useState<"login" | "audit">("login");
  const [logs, setLogs] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 50;

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const skip = (page - 1) * pageSize;
      const response = await fetch(
        `/api/admin/logs?type=${activeTab}&take=${pageSize}&skip=${skip}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch logs");
      }
      const data = await response.json();
      setLogs(data.logs || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error("Error fetching logs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [activeTab, page]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-foreground">System Logs</h1>
          <p className="text-sm text-foreground/60 dark:text-foreground/50 mt-1">
            Monitor authentication and administrative activities
          </p>
        </div>
        <div className="flex space-x-1 bg-foreground/10 p-1 rounded-lg">
          <button
            onClick={() => {
              setActiveTab("login");
              setPage(1);
            }}
            className={`px-4 py-2 rounded-md font-medium text-sm transition-colors ${
              activeTab === "login"
                ? "bg-white dark:bg-gray-700 shadow text-brand-600 dark:text-brand-400"
                : "text-gray-600 dark:text-foreground/50 hover:text-gray-900 dark:hover:text-foreground"
            }`}
          >
            Login History
          </button>
          <button
            onClick={() => {
              setActiveTab("audit");
              setPage(1);
            }}
            className={`px-4 py-2 rounded-md font-medium text-sm transition-colors ${
              activeTab === "audit"
                ? "bg-white dark:bg-gray-700 shadow text-brand-600 dark:text-brand-400"
                : "text-gray-600 dark:text-foreground/50 hover:text-gray-900 dark:hover:text-foreground"
            }`}
          >
            Audit Logs
          </button>
        </div>
      </div>

      <div className="bg-background shadow-sm rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-foreground/60 dark:text-foreground/50 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-foreground/60 dark:text-foreground/50 uppercase tracking-wider">
                  User
                </th>
                {activeTab === "login" ? (
                  <>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-foreground/60 dark:text-foreground/50 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-foreground/60 dark:text-foreground/50 uppercase tracking-wider">
                      IP Address
                    </th>
                  </>
                ) : (
                  <>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-foreground/60 dark:text-foreground/50 uppercase tracking-wider">
                      Action
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-foreground/60 dark:text-foreground/50 uppercase tracking-wider">
                      Details
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-foreground/60 dark:text-foreground/50 uppercase tracking-wider">
                      IP Address
                    </th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="bg-background divide-y divide-gray-200 dark:divide-gray-800">
              {loading ? (
                <tr>
                  <td
                    colSpan={activeTab === "login" ? 4 : 5}
                    className="px-6 py-12 text-center text-sm text-foreground/60 dark:text-foreground/50"
                  >
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
                      <p>Loading records...</p>
                    </div>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td
                    colSpan={activeTab === "login" ? 4 : 5}
                    className="px-6 py-12 text-center text-sm text-foreground/60 dark:text-foreground/50"
                  >
                    No records found for {activeTab === "login" ? "login history" : "audit logs"}.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr
                    key={log.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-foreground/70">
                      {new Date(log.createdAt).toLocaleString("tr-TR")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900 dark:text-foreground">
                          {log.user?.name || "Unknown User"}
                        </span>
                        <span className="text-xs text-foreground/60 dark:text-foreground/50">
                          {log.user?.email || "-"}
                        </span>
                      </div>
                    </td>

                    {activeTab === "login" ? (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              log.success
                                ? "bg-success text-success dark:bg-success/30 dark:text-success"
                                : "bg-danger text-danger dark:bg-danger/30 dark:text-danger"
                            }`}
                          >
                            {log.success ? "Success" : "Failed"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground/60 dark:text-foreground/50 font-mono">
                          {log.ipAddress || "-"}
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-info text-info dark:bg-info/30 dark:text-info">
                            {log.action}
                          </span>
                        </td>
                        <td
                          className="px-6 py-4 text-sm text-gray-600 dark:text-foreground/70 max-w-xs truncate"
                          title={log.details}
                        >
                          {log.details || "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground/60 dark:text-foreground/50 font-mono">
                          {log.ipAddress || "-"}
                        </td>
                      </>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && total > pageSize && (
          <div className="bg-gray-50 dark:bg-gray-800/50 px-6 py-4 flex flex-col sm:flex-row items-center justify-between border-t border-gray-200 dark:border-gray-800 gap-4">
            <div className="text-sm text-foreground/60 dark:text-foreground/50">
              Showing{" "}
              <span className="font-medium text-gray-900 dark:text-foreground">
                {(page - 1) * pageSize + 1}
              </span>{" "}
              to{" "}
              <span className="font-medium text-gray-900 dark:text-foreground">
                {Math.min(page * pageSize, total)}
              </span>{" "}
              of <span className="font-medium text-gray-900 dark:text-foreground">{total}</span>{" "}
              records
            </div>
            <nav className="inline-flex rounded-md shadow-sm space-x-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="inline-flex items-center px-3 py-2 rounded-md border border-glass-border bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-foreground/70 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(Math.min(Math.ceil(total / pageSize), page + 1))}
                disabled={page >= Math.ceil(total / pageSize)}
                className="inline-flex items-center px-3 py-2 rounded-md border border-glass-border bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-foreground/70 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
}
