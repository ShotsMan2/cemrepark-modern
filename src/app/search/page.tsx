import { prisma } from "@/lib/prisma";
import SearchClient from "./SearchClient";
import { getSettings } from "@/data/settings";

export const dynamic = "force-dynamic";

export async function generateMetadata({ searchParams }) {
  const resolvedParams = await searchParams;
  const query = resolvedParams.q || "";
  const settings = getSettings();
  const siteAdi = settings.siteAdi || "Cemre Park";
  const title = query ? `Arama: ${query}` : "Tüm Ürünler";
  return {
    title: `${title} | ${siteAdi}`,
    description: `${siteAdi} online mağazasında ${title} sonuçlarını inceleyin.`,
  };
}

export default async function SearchPage({ searchParams }) {
  const resolvedParams = await searchParams;
  const query = resolvedParams.q || "";
  const isSearch = resolvedParams.type === "search";

  let lowerQuery = query.toLowerCase();

  const termMappings = {
    "hijab dress": "elbise",
    "فستان محجبات": "elbise",
    "two-piece set": "takım",
    "طقم قطعتين": "takım",
    "coat & jacket": "kaban",
    "معاطف وجواكت": "kaban",
    trousers: "pantolon",
    بنطلونات: "pantolon",
    "evening dress": "abiye",
    "فستان سهرة": "abiye",
    tunic: "tunik",
    تونيك: "tunik",
  };

  let mappedQuery = lowerQuery;
  for (const [key, val] of Object.entries(termMappings)) {
    if (lowerQuery.includes(key)) {
      mappedQuery = val;
      break;
    }
  }

  // Find all Turkish product names from translations that contain the query
  let matchedTurkishNames = [];
  if (query.trim().length > 0) {
    try {
      const enDict = require("@/utils/locales/en.json");
      const arDict = require("@/utils/locales/ar.json");

      const allDicts = [enDict, arDict];

      for (const dict of allDicts) {
        for (const [trName, translatedName] of Object.entries(dict)) {
          if (
            translatedName &&
            typeof translatedName === "string" &&
            translatedName.toLowerCase().includes(lowerQuery)
          ) {
            matchedTurkishNames.push(trName);
          }
        }
      }
    } catch (e) {
      console.error("Error loading dictionaries in search page", e);
    }
  }

  // Deduplicate matched names
  matchedTurkishNames = [...new Set(matchedTurkishNames)];

  let results = [];
  if (!query) {
    results = await prisma.product.findMany();
  } else {
    // Prisma SQLite'da contains default olarak ASCII case-insensitive'dir
    const orConditions: any[] = [
      { ad: { contains: mappedQuery } },
      { kategori: { contains: mappedQuery } },
      { etiket: { contains: mappedQuery } },
      { ad: { contains: lowerQuery } },
      { kategori: { contains: lowerQuery } },
      { etiket: { contains: lowerQuery } },
    ];

    if (matchedTurkishNames.length > 0) {
      orConditions.push({ ad: { in: matchedTurkishNames } });
      orConditions.push({ kategori: { in: matchedTurkishNames } }); // just in case category matches
    }

    results = await prisma.product.findMany({
      where: {
        OR: orConditions,
      },
    });
  }

  return (
    <div className="min-h-screen pt-32 pb-24 relative bg-gradient-to-br from-gray-50 via-pink-50/50 to-purple-50/50 dark:from-[#08060d] dark:via-[#0d0518] dark:to-[#0a0814]">
      {/* Background Glow */}
      <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-primary opacity-[0.06] rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-purple opacity-[0.06] rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary opacity-[0.03] rounded-full blur-[150px] pointer-events-none"></div>

      <SearchClient initialResults={results} query={query} isSearch={isSearch} />
    </div>
  );
}
