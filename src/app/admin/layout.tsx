import AdminShell from "./components/AdminShell";

export const metadata = {
  title: "Admin Panel - Cemre Park",
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-wrapper bg-background min-h-screen text-foreground font-inter selection:bg-primary/30">
      <style
        dangerouslySetInnerHTML={{
          __html: `
        /* Premium Admin overrides */
        .admin-wrapper {
          --local-glass-bg: var(--glass-bg);
          --local-border: var(--glass-border);
        }
        .admin-wrapper aside,
        .admin-wrapper header,
        .admin-wrapper .glass-panel {
          background-color: var(--local-glass-bg) !important;
          backdrop-filter: blur(30px) saturate(200%) !important;
          -webkit-backdrop-filter: blur(30px) saturate(200%) !important;
          border-color: var(--local-border) !important;
          box-shadow: var(--shadow-subtle) !important;
        }
        .admin-wrapper input,
        .admin-wrapper select,
        .admin-wrapper textarea {
          background-color: rgba(var(--foreground), 0.03) !important;
          border: 1px solid var(--local-border) !important;
          color: var(--foreground) !important;
          border-radius: 12px !important;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }
        .admin-wrapper input:focus,
        .admin-wrapper select:focus,
        .admin-wrapper textarea:focus {
          border-color: hsl(var(--primary)) !important;
          box-shadow: 0 0 0 4px hsla(var(--primary), 0.15) !important;
          background-color: transparent !important;
        }
        .admin-wrapper table {
          color: var(--foreground) !important;
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
        }
        .admin-wrapper th {
          background-color: rgba(var(--foreground), 0.03) !important;
          color: var(--foreground) !important;
          border-bottom: 2px solid var(--local-border) !important;
          font-family: var(--font-heading), sans-serif;
          font-weight: 700 !important;
          padding: 16px 20px;
          text-transform: uppercase;
          font-size: 0.75rem;
          letter-spacing: 0.05em;
        }
        .admin-wrapper td {
          border-bottom: 1px solid var(--local-border) !important;
          color: rgba(var(--foreground), 0.8) !important;
          padding: 20px;
          transition: background-color 0.2s ease;
        }
        .admin-wrapper tr:hover td {
          background-color: rgba(var(--foreground), 0.02) !important;
        }
        .admin-wrapper .bg-black\\/40,
        .admin-wrapper .bg-white\\/5 {
          background-color: var(--local-glass-bg) !important;
        }
        .admin-wrapper .text-foreground {
          color: var(--foreground) !important;
        }
        .admin-wrapper .border-white\\/10,
        .admin-wrapper .border-white\\/5 {
          border-color: var(--local-border) !important;
        }
        /* Custom scrollbar for tables */
        .admin-wrapper .overflow-x-auto::-webkit-scrollbar {
          height: 8px;
        }
        .admin-wrapper .overflow-x-auto::-webkit-scrollbar-thumb {
          background: hsl(var(--primary));
          border-radius: 8px;
        }
      `,
        }}
      />
      <AdminShell>{children}</AdminShell>
    </div>
  );
}
