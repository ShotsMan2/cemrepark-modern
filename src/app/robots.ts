export default function robots() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin/",
        "/api/",
        "/checkout/",
        "/hesabim/",
        "/forgot-password/",
        "/reset-password/",
      ],
      crawlDelay: 1,
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
