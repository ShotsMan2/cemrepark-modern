"use client";
import React, { useState } from "react";

interface ExportButtonProps {
  data: Record<string, any>[];
  filename?: string;
  label?: string;
  columns?: { key: string; header: string }[];
}

function convertToCSV(data: Record<string, any>[], columns?: { key: string; header: string }[]): string {
  if (!data || !data.length) return "";
  const firstRow = data[0];
  if (!firstRow) return "";
  const keys = columns ? columns.map((c) => c.key) : Object.keys(firstRow);
  const headers = columns ? columns.map((c) => c.header) : keys;
  const rows = data.map((row) =>
    keys
      .map((key) => {
        let cell = row[key] === null || row[key] === undefined ? "" : row[key];
        if (typeof cell === "string") {
          cell = cell.replace(/"/g, '""');
          if (cell.search(/("|,|\n)/g) >= 0) cell = `"${cell}"`;
        } else if (typeof cell === "number") {
          cell = cell.toLocaleString("tr-TR");
        }
        return cell;
      })
      .join(",")
  );
  return "\uFEFF" + headers.join(",") + "\n" + rows.join("\n");
}

function convertToExcel(data: Record<string, any>[], columns?: { key: string; header: string }[]): Blob {
  const keys = columns ? columns.map((c) => c.key) : Object.keys(data[0] || {});
  const headers = columns ? columns.map((c) => c.header) : keys;
  const xmlParts: string[] = [];
  xmlParts.push('<?xml version="1.0" encoding="UTF-8"?>');
  xmlParts.push('<?mso-application progid="Excel.Sheet"?>');
  xmlParts.push('<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"');
  xmlParts.push(' xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">');
  xmlParts.push('<Worksheet ss:Name="Sheet1"><Table>');
  xmlParts.push("<Row>");
  headers.forEach((h) => {
    xmlParts.push(`<Cell><Data ss:Type="String">${h.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</Data></Cell>`);
  });
  xmlParts.push("</Row>");
  data.forEach((row) => {
    xmlParts.push("<Row>");
    keys.forEach((key) => {
      const val = row[key];
      const type = typeof val === "number" ? "Number" : "String";
      const strVal = val !== null && val !== undefined ? String(val).replace(/&/g, "&amp;").replace(/</g, "&lt;") : "";
      xmlParts.push(`<Cell><Data ss:Type="${type}">${strVal}</Data></Cell>`);
    });
    xmlParts.push("</Row>");
  });
  xmlParts.push("</Table></Worksheet></Workbook>");
  return new Blob([xmlParts.join("")], { type: "application/vnd.ms-excel;charset=utf-8" });
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default function ExportButton({ data, filename = "export", label = "Dışa Aktar", columns }: ExportButtonProps) {
  const [open, setOpen] = useState(false);
  if (!data || !data.length) return null;
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 glass-panel hover:bg-primary/20 hover:border-primary hover:shadow-[0_0_20px_rgba(255,0,127,0.3)] text-foreground px-5 py-2.5 text-sm font-bold uppercase tracking-wider transition-all duration-300 clip-angled"
        aria-label={label}
        aria-haspopup="true"
        aria-expanded={open}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="7 10 12 15 17 10"></polyline>
          <line x1="12" y1="15" x2="12" y2="3"></line>
        </svg>
        {label}
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-48 glass-panel p-2 flex flex-col gap-1 z-50 clip-angled border border-glass-border shadow-2xl" role="menu" aria-label="Export options">
          <button
            onClick={() => { downloadBlob(new Blob([convertToCSV(data, columns)], { type: "text/csv;charset=utf-8" }), `${filename}.csv`); setOpen(false); }}
            className="text-left px-3 py-2 text-xs text-foreground hover:bg-primary/20 hover:text-primary rounded font-bold transition-colors flex items-center gap-2"
            role="menuitem"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3M3 17v-4a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2H5a2 2 0 01-2-2z"></path></svg>
            CSV İndir
          </button>
          <button
            onClick={() => { downloadBlob(convertToExcel(data, columns), `${filename}.xls`); setOpen(false); }}
            className="text-left px-3 py-2 text-xs text-foreground hover:bg-primary/20 hover:text-primary rounded font-bold transition-colors flex items-center gap-2"
            role="menuitem"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            Excel İndir
          </button>
        </div>
      )}
    </div>
  );
}
