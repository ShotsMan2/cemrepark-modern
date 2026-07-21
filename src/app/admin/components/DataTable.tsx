"use client";
import React, { useState, useMemo, useCallback } from "react";

export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
  hideable?: boolean;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  pageSize?: number;
  selectable?: boolean;
  onSelectionChange?: (selected: T[]) => void;
  bulkActions?: React.ReactNode;
  exportable?: boolean;
  exportFilename?: string;
  rowKey?: string;
}

export default function DataTable<T extends Record<string, any>>({
  data,
  columns,
  pageSize: defaultPageSize = 10,
  selectable = false,
  onSelectionChange,
  bulkActions,
  exportable = false,
  exportFilename = "export",
  rowKey = "id",
}: DataTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>(null);
  const [globalFilter, setGlobalFilter] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set());
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(new Set(columns.map((c) => c.key)));
  const [showColumnToggle, setShowColumnToggle] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [mobileView, setMobileView] = useState(false);

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
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === "asc" ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === "asc" ? 1 : -1;
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

  const visibleCols = useMemo(() => columns.filter((c) => visibleColumns.has(c.key)), [columns, visibleColumns]);

  const toggleSelectAll = useCallback(() => {
    if (selectedIds.size === currentData.length && currentData.length > 0) {
      setSelectedIds(new Set());
      onSelectionChange?.([]);
    } else {
      const allIds = new Set(currentData.map((row) => row[rowKey]));
      setSelectedIds(allIds);
      onSelectionChange?.(currentData);
    }
  }, [currentData, selectedIds, rowKey, onSelectionChange]);

  const toggleSelect = useCallback(
    (id: string | number, row: T) => {
      const newSet = new Set(selectedIds);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      setSelectedIds(newSet);
      const selectedRows = data.filter((r) => newSet.has(r[rowKey]));
      onSelectionChange?.(selectedRows);
    },
    [selectedIds, data, rowKey, onSelectionChange]
  );

  const exportToCSV = useCallback(() => {
    if (!sortedData.length) return;
    const firstRow = sortedData[0];
    if (!firstRow) return;
    const keys = visibleCols.length > 0 ? visibleCols.map((c) => c.key) : Object.keys(firstRow);
    const headers = visibleCols.length > 0 ? visibleCols.map((c) => c.header) : keys;
    const rows = sortedData.map((row) =>
      keys
        .map((key) => {
          let cell = row[key] === null || row[key] === undefined ? "" : row[key];
          if (typeof cell === "string") {
            cell = cell.replace(/"/g, '""');
            if (cell.search(/("|,|\n)/g) >= 0) cell = `"${cell}"`;
          }
          return cell;
        })
        .join(",")
    );
    const csvContent = "\uFEFF" + headers.join(",") + "\n" + rows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${exportFilename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [sortedData, visibleCols, exportFilename]);

  const exportToExcel = useCallback(() => {
    if (!sortedData.length) return;
    const firstRow = sortedData[0];
    if (!firstRow) return;
    const keys = visibleCols.length > 0 ? visibleCols.map((c) => c.key) : Object.keys(firstRow);
    const headers = visibleCols.length > 0 ? visibleCols.map((c) => c.header) : keys;
    const parts: string[] = [];
    parts.push('<?xml version="1.0" encoding="UTF-8"?>');
    parts.push('<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">');
    parts.push('<Worksheet ss:Name="Sheet1"><Table>');
    parts.push("<Row>");
    headers.forEach((h) => parts.push(`<Cell><Data ss:Type="String">${h.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</Data></Cell>`));
    parts.push("</Row>");
    sortedData.forEach((row) => {
      parts.push("<Row>");
      keys.forEach((key) => {
        const val = row[key];
        const type = typeof val === "number" ? "Number" : "String";
        const strVal = val !== null && val !== undefined ? String(val).replace(/&/g, "&amp;").replace(/</g, "&lt;") : "";
        parts.push(`<Cell><Data ss:Type="${type}">${strVal}</Data></Cell>`);
      });
      parts.push("</Row>");
    });
    parts.push("</Table></Worksheet></Workbook>");
    const blob = new Blob([parts.join("")], { type: "application/vnd.ms-excel;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${exportFilename}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [sortedData, visibleCols, exportFilename]);

  const toggleColumn = (key: string) => {
    const newSet = new Set(visibleColumns);
    if (newSet.has(key)) newSet.delete(key); else newSet.add(key);
    setVisibleColumns(newSet);
  };

  const PAGE_SIZES = [10, 25, 50, 100];

  return (
    <div className="w-full" data-testid="data-table" role="region" aria-label="Veri Tablosu">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <input
            type="text"
            placeholder="Ara..."
            value={globalFilter}
            onChange={(e) => { setGlobalFilter(e.target.value); setCurrentPage(1); }}
            className="p-2 border rounded border-glass-border bg-background/50 text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm w-48"
            data-testid="data-table-search"
            aria-label="Tabloda ara"
          />
          <select
            value={pageSize}
            onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
            className="p-2 border rounded border-glass-border bg-background/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label="Sayfa başına kayıt"
          >
            {PAGE_SIZES.map((s) => (
              <option key={s} value={s}>{s} / sayfa</option>
            ))}
          </select>
          <button
            onClick={() => setMobileView(!mobileView)}
            className="lg:hidden p-2 text-foreground/70 hover:text-primary transition-colors border border-glass-border rounded"
            aria-label={mobileView ? "Tablo görünümü" : "Kart görünümü"}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileView ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M3 14h18M3 18h18M3 6h18" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              )}
            </svg>
          </button>
        </div>
        <div className="flex items-center gap-2">
          {selectable && selectedIds.size > 0 && (
            <span className="text-xs text-foreground/70 font-bold mr-2">{selectedIds.size} seçili</span>
          )}
          {bulkActions && selectedIds.size > 0 && (
            <div className="flex items-center gap-2">{bulkActions}</div>
          )}
          {exportable && (
            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="flex items-center gap-1 px-3 py-2 text-xs font-bold border border-glass-border rounded hover:bg-primary/20 hover:text-primary transition-colors"
                aria-label="Dışa aktar"
                aria-haspopup="true"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                Dışa Aktar
              </button>
              {showExportMenu && (
                <div className="absolute right-0 top-full mt-1 w-40 glass-panel p-2 flex flex-col gap-1 z-50 border border-glass-border rounded shadow-2xl" role="menu">
                  <button onClick={() => { exportToCSV(); setShowExportMenu(false); }} className="text-left px-3 py-2 text-xs text-foreground hover:bg-primary/20 hover:text-primary rounded font-bold transition-colors" role="menuitem">CSV İndir</button>
                  <button onClick={() => { exportToExcel(); setShowExportMenu(false); }} className="text-left px-3 py-2 text-xs text-foreground hover:bg-primary/20 hover:text-primary rounded font-bold transition-colors" role="menuitem">Excel İndir</button>
                </div>
              )}
            </div>
          )}
          <div className="relative">
            <button
              onClick={() => setShowColumnToggle(!showColumnToggle)}
              className="flex items-center gap-1 px-3 py-2 text-xs font-bold border border-glass-border rounded hover:bg-primary/20 hover:text-primary transition-colors"
              aria-label="Sütunları göster/gizle"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"></path></svg>
              Sütunlar
            </button>
            {showColumnToggle && (
              <div className="absolute right-0 top-full mt-1 w-48 glass-panel p-2 flex flex-col gap-1 z-50 border border-glass-border rounded shadow-2xl" role="menu" aria-label="Sütun görünürlüğü">
                {columns.filter((c) => c.hideable !== false).map((col) => (
                  <label key={col.key} className="flex items-center gap-2 px-2 py-1.5 text-xs text-foreground hover:bg-foreground/5 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={visibleColumns.has(col.key)}
                      onChange={() => toggleColumn(col.key)}
                      className="accent-primary"
                    />
                    {col.header}
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {mobileView ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" role="list" aria-label="Kart görünümü">
          {currentData.length > 0 ? (
            currentData.map((row, idx) => (
              <div key={idx} className="glass-panel p-4 clip-angled border border-glass-border" role="listitem">
                {selectable && (
                  <div className="flex justify-end mb-2">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(row[rowKey])}
                      onChange={() => toggleSelect(row[rowKey], row)}
                      className="accent-primary"
                      aria-label={`${row[rowKey]} seç`}
                    />
                  </div>
                )}
                {visibleCols.map((col) => (
                  <div key={col.key} className="flex justify-between items-center py-1 border-b border-glass-border/50 last:border-0">
                    <span className="text-xs font-bold text-foreground/50 uppercase tracking-wider">{col.header}</span>
                    <span className="text-sm text-foreground text-right">{col.render ? col.render(row) : row[col.key]}</span>
                  </div>
                ))}
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-8 text-foreground/50">Kayıt bulunamadı.</div>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-glass-border">
          <table className="min-w-full divide-y divide-glass-border" role="grid" aria-label="Veri tablosu">
            <thead className="bg-foreground/5">
              <tr>
                {selectable && (
                  <th className="px-4 py-3 w-10">
                    <input
                      type="checkbox"
                      checked={currentData.length > 0 && selectedIds.size === currentData.length}
                      onChange={toggleSelectAll}
                      className="accent-primary"
                      aria-label="Tümünü seç"
                    />
                  </th>
                )}
                {visibleCols.map((col) => (
                  <th
                    key={col.key}
                    className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-foreground/70 cursor-pointer hover:bg-foreground/10 select-none"
                    onClick={() => handleSort(col.key)}
                    data-testid={`col-${col.key}`}
                    scope="col"
                    aria-sort={sortConfig?.key === col.key ? (sortConfig.direction === "asc" ? "ascending" : "descending") : "none"}
                  >
                    <div className="flex items-center gap-1">
                      {col.header}
                      {sortConfig?.key === col.key && (
                        <span className="text-primary">{sortConfig.direction === "asc" ? "▲" : "▼"}</span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-background divide-y divide-glass-border">
              {currentData.length > 0 ? (
                currentData.map((row, idx) => (
                  <tr key={idx} className={`hover:bg-foreground/5 transition-colors ${selectedIds.has(row[rowKey]) ? "bg-primary/10" : ""}`} role="row" aria-selected={selectedIds.has(row[rowKey])}>
                    {selectable && (
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(row[rowKey])}
                          onChange={() => toggleSelect(row[rowKey], row)}
                          className="accent-primary"
                          aria-label={`${row[rowKey]} seç`}
                        />
                      </td>
                    )}
                    {visibleCols.map((col) => (
                      <td key={col.key} className="px-6 py-4 whitespace-nowrap text-sm text-foreground" role="gridcell">
                        {col.render ? col.render(row) : row[col.key]}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={visibleCols.length + (selectable ? 1 : 0)} className="px-6 py-8 text-center text-sm text-foreground/50" role="alert">
                    <div className="flex flex-col items-center gap-2">
                      <svg className="w-8 h-8 text-foreground/30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                      Kayıt bulunamadı.
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-center mt-4 gap-4">
        <div className="text-sm text-foreground/60">
          Toplam {sortedData.length} kayıt (sayfa {currentPage}/{totalPages || 1})
        </div>
        <div className="flex items-center gap-2">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            className="px-3 py-1.5 border border-glass-border rounded hover:bg-foreground/10 disabled:opacity-50 transition-colors text-sm font-medium"
            data-testid="data-table-prev"
            aria-label="Önceki sayfa"
          >
            Önceki
          </button>
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
            const start = Math.max(1, currentPage - 2);
            const page = start + i;
            if (page > totalPages) return null;
            return (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1.5 text-sm font-bold rounded transition-colors ${page === currentPage ? "bg-primary text-white" : "border border-glass-border hover:bg-foreground/10"}`}
                aria-label={`Sayfa ${page}`}
                aria-current={page === currentPage ? "page" : undefined}
              >
                {page}
              </button>
            );
          })}
          <button
            disabled={currentPage === totalPages || totalPages === 0}
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            className="px-3 py-1.5 border border-glass-border rounded hover:bg-foreground/10 disabled:opacity-50 transition-colors text-sm font-medium"
            data-testid="data-table-next"
            aria-label="Sonraki sayfa"
          >
            Sonraki
          </button>
        </div>
      </div>
    </div>
  );
}
