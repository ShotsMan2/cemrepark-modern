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
        html:not(.dark) .admin-wrapper {
          background-color: #f9fafb !important;
          color: #1f2937 !important;
        }
        html:not(.dark) .admin-wrapper .clip-angled {
          clip-path: none !important;
          border-radius: 8px !important;
        }
        /* Background screen overrides */
        html:not(.dark) .admin-wrapper .bg-\\[\\#0a0a0a\\],
        html:not(.dark) .admin-wrapper .bg-black\\/40,
        html:not(.dark) .admin-wrapper .bg-black\\/30,
        html:not(.dark) .admin-wrapper .bg-black\\/20,
        html:not(.dark) .admin-wrapper .bg-black\\/50,
        html:not(.dark) .admin-wrapper .bg-white\\/5,
        html:not(.dark) .admin-wrapper .bg-\\[\\#111\\] {
          background-color: #ffffff !important;
        }
        html:not(.dark) .admin-wrapper .min-h-screen {
          background-color: #f3f4f6 !important;
          color: #1f2937 !important;
        }
        /* Ambient light opacity adjustment for light mode */
        html:not(.dark) .admin-wrapper .bg-neon-pink.opacity-\\[0\\.03\\],
        html:not(.dark) .admin-wrapper .bg-neon-pink.opacity-\\[0\\.05\\],
        html:not(.dark) .admin-wrapper .bg-red-500.opacity-\\[0\\.05\\] {
          background-color: #ff007f !important;
          opacity: 0.05 !important;
        }
        /* Sidebar styling overrides */
        html:not(.dark) .admin-wrapper aside {
          background-color: #ffffff !important;
          border-right: 1px solid #e5e7eb !important;
          box-shadow: 2px 0 8px rgba(0, 0, 0, 0.04) !important;
        }
        html:not(.dark) .admin-wrapper aside h2.text-white,
        html:not(.dark) .admin-wrapper aside .text-white {
          color: #111827 !important;
        }
        html:not(.dark) .admin-wrapper aside .border-t.border-white\\/10 {
          border-top: 1px solid #e5e7eb !important;
        }
        html:not(.dark) .admin-wrapper aside .bg-holo-gold\\/20 {
          background-color: rgba(212, 175, 55, 0.15) !important;
        }
        html:not(.dark) .admin-wrapper aside nav button:not(.bg-neon-pink) {
          color: #4b5563 !important;
        }
        html:not(.dark) .admin-wrapper aside nav button:not(.bg-neon-pink):hover {
          background-color: #f3f4f6 !important;
          color: #111827 !important;
        }
        /* Header styling overrides */
        html:not(.dark) .admin-wrapper header {
          background-color: rgba(255, 255, 255, 0.85) !important;
          border-bottom: 1px solid #e5e7eb !important;
          backdrop-filter: blur(12px) !important;
        }
        html:not(.dark) .admin-wrapper header h1 {
          color: #111827 !important;
        }
        html:not(.dark) .admin-wrapper header button.text-gray-400 {
          color: #4b5563 !important;
        }
        html:not(.dark) .admin-wrapper header button.text-gray-400:hover {
          color: #111827 !important;
        }
        html:not(.dark) .admin-wrapper header .border-b.border-white\\/5 {
          border-bottom: 1px solid #e5e7eb !important;
        }
        html:not(.dark) .admin-wrapper header button.border-white\\/20 {
          border-color: #d1d5db !important;
          color: #374151 !important;
        }
        html:not(.dark) .admin-wrapper header button.border-white\\/20:hover {
          border-color: #ff007f !important;
          color: #ff007f !important;
        }
        /* Notification dropdown overlay */
        html:not(.dark) .admin-wrapper .glass-panel.border-white\\/10 {
          background-color: #ffffff !important;
          border-color: #e5e7eb !important;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1) !important;
        }
        html:not(.dark) .admin-wrapper .border-b.border-white\\/10 {
          border-bottom: 1px solid #e5e7eb !important;
        }
        html:not(.dark) .admin-wrapper .bg-white\\/5.hover\\:bg-white\\/10 {
          background-color: #f9fafb !important;
          border-left: 3px solid #ff007f !important;
        }
        html:not(.dark) .admin-wrapper .bg-white\\/5.hover\\:bg-white\\/10:hover {
          background-color: #f3f4f6 !important;
        }
        /* Cards & Glass panel elements */
        html:not(.dark) .admin-wrapper .glass-panel {
          background-color: #ffffff !important;
          border: 1px solid #e5e7eb !important;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03) !important;
        }
        /* Typography overrides */
        html:not(.dark) .admin-wrapper .text-white,
        html:not(.dark) .admin-wrapper .text-gray-100,
        html:not(.dark) .admin-wrapper .text-gray-200 {
          color: #111827 !important;
        }
        html:not(.dark) .admin-wrapper .text-gray-300,
        html:not(.dark) .admin-wrapper .text-gray-400,
        html:not(.dark) .admin-wrapper .text-gray-500 {
          color: #4b5563 !important;
        }
        /* Forms, inputs, and selections styling */
        html:not(.dark) .admin-wrapper input,
        html:not(.dark) .admin-wrapper select,
        html:not(.dark) .admin-wrapper textarea {
          background-color: #ffffff !important;
          border: 1px solid #d1d5db !important;
          color: #111827 !important;
          border-radius: 6px !important;
        }
        html:not(.dark) .admin-wrapper input::placeholder,
        html:not(.dark) .admin-wrapper textarea::placeholder {
          color: #9ca3af !important;
        }
        html:not(.dark) .admin-wrapper input:focus,
        html:not(.dark) .admin-wrapper select:focus,
        html:not(.dark) .admin-wrapper textarea:focus {
          border-color: #ff007f !important;
          box-shadow: 0 0 0 2px rgba(255, 0, 127, 0.1) !important;
        }
        html:not(.dark) .admin-wrapper label {
          color: #374151 !important;
        }
        /* Option elements under select drop down */
        html:not(.dark) .admin-wrapper select option {
          background-color: #ffffff !important;
          color: #111827 !important;
        }
        /* Tables layout override */
        html:not(.dark) .admin-wrapper table {
          color: #1f2937 !important;
        }
        html:not(.dark) .admin-wrapper th {
          background-color: #f9fafb !important;
          color: #374151 !important;
          border-bottom: 2px solid #e5e7eb !important;
          font-weight: 600 !important;
        }
        html:not(.dark) .admin-wrapper td {
          border-bottom: 1px solid #e5e7eb !important;
          color: #4b5563 !important;
        }
        html:not(.dark) .admin-wrapper tr.hover\\:bg-white\\/5:hover {
          background-color: #f9fafb !important;
        }
        html:not(.dark) .admin-wrapper tr td.group-hover\\:text-neon-pink {
          color: #111827 !important;
        }
        html:not(.dark) .admin-wrapper tr:hover td.group-hover\\:text-neon-pink {
          color: #ff007f !important;
        }
        /* Border and spacing dividers */
        html:not(.dark) .admin-wrapper .divide-white\\/5 > *,
        html:not(.dark) .admin-wrapper .divide-y > *,
        html:not(.dark) .admin-wrapper .border-white\\/5 {
          border-color: #e5e7eb !important;
        }
        html:not(.dark) .admin-wrapper .border-gray-700 {
          border-color: #d1d5db !important;
        }
        /* Tags & Badges overrides */
        html:not(.dark) .admin-wrapper .bg-white\\/10 {
          background-color: #f3f4f6 !important;
          color: #4b5563 !important;
          border-radius: 4px !important;
        }
        /* Status labels */
        html:not(.dark) .admin-wrapper span[class*="bg-green-500\\/20"] {
          background-color: rgba(34, 197, 94, 0.15) !important;
          color: #15803d !important;
        }
        html:not(.dark) .admin-wrapper span[class*="bg-holo-gold\\/20"] {
          background-color: rgba(212, 175, 55, 0.15) !important;
          color: #854d0e !important;
        }
        /* Recharts SVG and elements styles overrides */
        html:not(.dark) .admin-wrapper .recharts-cartesian-grid-horizontal line,
        html:not(.dark) .admin-wrapper .recharts-cartesian-grid-vertical line {
          stroke: #e5e7eb !important;
        }
        html:not(.dark) .admin-wrapper .recharts-text {
          fill: #4b5563 !important;
        }
        html:not(.dark) .admin-wrapper .recharts-default-tooltip {
          background-color: #ffffff !important;
          border: 1px solid #e5e7eb !important;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05) !important;
        }
        html:not(.dark) .admin-wrapper .recharts-tooltip-label {
          color: #111827 !important;
          font-weight: 600 !important;
        }
        /* Custom Tooltip in DashboardView */
        html:not(.dark) .admin-wrapper .bg-black\\/90 {
          background-color: #ffffff !important;
          border: 1px solid #e5e7eb !important;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1) !important;
        }
        html:not(.dark) .admin-wrapper .bg-black\\/90 p.text-white {
          color: #111827 !important;
        }
        /* SweetAlert Overrides */
        html:not(.dark) .swal2-popup {
          background-color: #ffffff !important;
          color: #1f2937 !important;
          border: 1px solid #e5e7eb !important;
          box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1) !important;
        }
        html:not(.dark) .swal2-title, html:not(.dark) .swal2-html-container {
          color: #1f2937 !important;
        }
        /* AI chat section details */
        html:not(.dark) .admin-wrapper .bg-black\\/40.border.border-white\\/5 {
          background-color: #ffffff !important;
          border-color: #e5e7eb !important;
          box-shadow: 0 2px 4px rgba(0,0,0,0.02) !important;
        }
        html:not(.dark) .admin-wrapper .bg-white\\/5.p-4.border-l-2 {
          background-color: #f9fafb !important;
          border-color: #ff007f !important;
        }
        html:not(.dark) .admin-wrapper .bg-white\\/5.p-4.border-l-2 p {
          color: #374151 !important;
        }
        html:not(.dark) .admin-wrapper .w-full.md\\:w-32.h-2.bg-gray-800 {
          background-color: #e5e7eb !important;
        }
      `,
        }}
      />
      {children}
    </div>
  );
}
