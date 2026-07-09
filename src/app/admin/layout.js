import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Admin Panel - Cemre Park",
};

export default async function AdminLayout({ children }) {
  // It's safe to check here but Next.js might evaluate this on login page.
  // Wait, if they are on /admin and not logged in, we shouldn't redirect them away, they need to log in!
  // The client side handles login UI on /admin. So we can just return children.
  // Actually, wait, let's leave layout.js alone if /admin handles login.
  return (
    <div className="admin-wrapper">
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .admin-wrapper .clip-angled {
          clip-path: none !important;
          border-radius: 8px !important;
        }
      `,
        }}
      />
      {children}
    </div>
  );
}
