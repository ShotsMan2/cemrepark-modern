"use client";

import React, { useState, useMemo } from "react";

export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  pageSize?: number;
}

export default function DataTable<T extends Record<string, any>>({
  data,
  columns,
  pageSize = 10,
}: DataTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>(
    null
  );
  const [globalFilter, setGlobalFilter] = useState("");

  const handleSort = (key: string) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const filteredData = useMemo(() => {
    if (!globalFilter) return data;
    const lowerFilter = globalFilter.toLowerCase();
    return data.filter((row) =>
      Object.values(row).some((val) => String(val).toLowerCase().includes(lowerFilter))
    );
  }, [data, globalFilter]);

  const sortedData = useMemo(() => {
    let sortableItems = [...filteredData];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [filteredData, sortConfig]);

  const totalPages = Math.ceil(sortedData.length / pageSize);
  const currentData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedData.slice(startIndex, startIndex + pageSize);
  }, [sortedData, currentPage, pageSize]);

  return (
    <div className="w-full" data-testid="data-table">
      <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          placeholder="Ara..."
          value={globalFilter}
          onChange={(e) => {
            setGlobalFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="p-2 border rounded border-glass-border bg-background/50 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          data-testid="data-table-search"
        />
      </div>

      <div className="overflow-x-auto rounded-lg border border-glass-border">
        <table className="min-w-full divide-y divide-glass-border">
          <thead className="bg-foreground/5">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-foreground/70 cursor-pointer hover:bg-foreground/10"
                  onClick={() => handleSort(col.key)}
                  data-testid={`col-${col.key}`}
                >
                  <div className="flex items-center gap-1">
                    {col.header}
                    {sortConfig?.key === col.key && (
                      <span className="text-primary">
                        {sortConfig.direction === "asc" ? "▲" : "▼"}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-background divide-y divide-glass-border">
            {currentData.length > 0 ? (
              currentData.map((row, idx) => (
                <tr key={idx} className="hover:bg-foreground/5 transition-colors">
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className="px-6 py-4 whitespace-nowrap text-sm text-foreground"
                    >
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-4 text-center text-sm text-foreground/50"
                >
                  Kayıt bulunamadı.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center mt-4 gap-4">
        <div className="text-sm text-foreground/60">Toplam {sortedData.length} kayıt</div>
        <div className="flex items-center gap-2">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            className="px-3 py-1.5 border border-glass-border rounded hover:bg-foreground/10 disabled:opacity-50 transition-colors text-sm font-medium"
            data-testid="data-table-prev"
          >
            Önceki
          </button>
          <span className="px-3 py-1 text-sm text-foreground font-medium">
            Sayfa {currentPage} / {totalPages || 1}
          </span>
          <button
            disabled={currentPage === totalPages || totalPages === 0}
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            className="px-3 py-1.5 border border-glass-border rounded hover:bg-foreground/10 disabled:opacity-50 transition-colors text-sm font-medium"
            data-testid="data-table-next"
          >
            Sonraki
          </button>
        </div>
      </div>
    </div>
  );
}
