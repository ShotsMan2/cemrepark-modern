import Link from "next/link";

export default function AdminPage() {
  return (
    <div>
      <p>Burası yeni Next.js altyapısına taşınan Admin panelinin başlangıç noktasıdır.</p>
      <div style={{ marginTop: "20px" }}>
        <Link href="/" style={{ color: "blue", textDecoration: "underline" }}>
          Ana Sayfaya Dön
        </Link>
      </div>
    </div>
  );
}
