export const metadata = {
  title: "Admin Panel - Cemre Park",
};

export default function AdminLayout({ children }) {
  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <header style={{ borderBottom: "1px solid #ccc", paddingBottom: "10px", marginBottom: "20px" }}>
        <h2>Cemre Park Admin Paneli</h2>
      </header>
      <main>
        {children}
      </main>
    </div>
  );
}
