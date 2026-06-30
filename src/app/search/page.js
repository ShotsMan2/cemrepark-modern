import { searchProducts } from "../../data/products";
import SearchClient from "./SearchClient";

export const dynamic = 'force-dynamic';

export default async function SearchPage({ searchParams }) {
  const resolvedParams = await searchParams;
  const query = resolvedParams.q || "";
  const isSearch = resolvedParams.type === 'search';
  const results = searchProducts(query);

  return (
    <div className="min-h-screen pt-32 pb-24 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-holo-gold opacity-[0.03] rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-neon-pink opacity-[0.03] rounded-full blur-[100px] pointer-events-none"></div>

      <SearchClient initialResults={results} query={query} isSearch={isSearch} />
    </div>
  );
}
