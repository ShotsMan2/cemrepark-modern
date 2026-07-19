import AdminShell from "./components/AdminShell";

export const metadata = {
  title: "Admin Panel - Cemre Park",
};

export default async function AdminLayout({ children }) {
  return (
    <div className="admin-wrapper bg-background min-h-screen text-foreground font-inter">
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
          backdrop-filter: blur(24px) !important;
          border-color: var(--local-border) !important;
          box-shadow: var(--shadow-subtle) !important;
        }
        .admin-wrapper input,
        .admin-wrapper select,
        .admin-wrapper textarea {
          background-color: transparent !important;
          border: 1px solid var(--local-border) !important;
          color: var(--foreground) !important;
          border-radius: 8px !important;
        }
        .admin-wrapper input:focus,
        .admin-wrapper select:focus,
        .admin-wrapper textarea:focus {
          border-color: var(--neon-pink) !important;
          box-shadow: 0 0 0 2px rgba(216, 92, 138, 0.2) !important;
        }
        .admin-wrapper table {
          color: var(--foreground) !important;
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
        }
        .admin-wrapper th {
          background-color: rgba(120, 120, 120, 0.05) !important;
          color: var(--foreground) !important;
          border-bottom: 2px solid var(--local-border) !important;
          font-family: var(--font-outfit), sans-serif;
          font-weight: 600 !important;
          padding: 12px 16px;
        }
        .admin-wrapper td {
          border-bottom: 1px solid var(--local-border) !important;
          color: rgba(var(--foreground), 0.8) !important;
          padding: 16px;
        }
        .admin-wrapper tr:hover td {
          background-color: rgba(120, 120, 120, 0.05) !important;
        }
        .admin-wrapper .bg-black\\/40,
        .admin-wrapper .bg-white\\/5 {
          background-color: var(--local-glass-bg) !important;
        }
        .admin-wrapper .text-white {
          color: var(--foreground) !important;
        }
        .admin-wrapper .border-white\\/10,
        .admin-wrapper .border-white\\/5 {
          border-color: var(--local-border) !important;
        }
        /* Custom scrollbar for tables */
        .admin-wrapper .overflow-x-auto::-webkit-scrollbar {
          height: 6px;
        }
        .admin-wrapper .overflow-x-auto::-webkit-scrollbar-thumb {
          background: var(--neon-pink);
          border-radius: 6px;
        }
      `,
        }}
      />
      <AdminShell>{children}</AdminShell>
    </div>
  );
}
