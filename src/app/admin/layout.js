export const metadata = {
  title: "Admin Panel - Cemre Park",
};

export default function AdminLayout({ children }) {
  return (
    <div className="admin-wrapper">
      <style dangerouslySetInnerHTML={{__html: `
        .admin-wrapper .clip-angled {
          clip-path: none !important;
          border-radius: 8px !important;
        }
      `}} />
      {children}
    </div>
  );
}
