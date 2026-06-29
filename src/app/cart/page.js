import Link from "next/link";

export default function CartPage() {
  return (
    <div className="container py-5 mt-5 text-center">
      <h1 className="geo-section-title mb-4">Alışveriş Sepetim</h1>
      <div className="alert alert-info">
        Şu anlık sepetiniz boş.
      </div>
      <Link href="/" className="btn btn-dark mt-3">
        Alışverişe Başla
      </Link>
    </div>
  );
}
