import Link from "next/link";

export default function FavoritesPage() {
  return (
    <div className="container py-5 mt-5 text-center">
      <h1 className="geo-section-title mb-4">Favorilerim</h1>
      <div className="alert alert-info">
        Henüz favorilere eklediğiniz bir ürün bulunmuyor.
      </div>
      <Link href="/" className="btn btn-dark mt-3">
        Ürünleri Keşfet
      </Link>
    </div>
  );
}
