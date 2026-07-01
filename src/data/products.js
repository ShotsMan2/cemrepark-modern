import fs from 'fs';
import path from 'path';

// Bu dosya Server Component'ler tarafından çağrıldığında dinamik olarak güncel JSON verisini okur.
export function getProducts() {
  const filePath = path.join(process.cwd(), 'src', 'data', 'products.json');
  try {
    const fileContents = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(fileContents);
  } catch (error) {
    console.error("products.json okunamadı:", error);
    return [];
  }
}

// Geriye dönük uyumluluk için statik getter (Burası sayfa yenilendiğinde güncel veriyi çeker)
export const products = new Proxy([], {
  get: (target, prop) => {
    const currentProducts = getProducts();
    return currentProducts[prop];
  }
});

export function getProductById(id) {
  const allProducts = getProducts();
  return allProducts.find(p => p.id === parseInt(id));
}

export function searchProducts(query) {
  const allProducts = getProducts();
  if (!query) return allProducts;
  
  let lowerQuery = query.toLowerCase();

  // Create a mapping from popular search english/arabic terms to their turkish counterparts
  const termMappings = {
    "hijab dress": "elbise",
    "فستان محجبات": "elbise",
    "two-piece set": "takım",
    "طقم قطعتين": "takım",
    "coat & jacket": "kaban",
    "معاطف وجواكت": "kaban",
    "trousers": "pantolon",
    "بنطلونات": "pantolon",
    "evening dress": "abiye",
    "فستان سهرة": "abiye",
    "tunic": "tunik",
    "تونيك": "tunik"
  };

  let mappedQuery = lowerQuery;
  for (const [key, val] of Object.entries(termMappings)) {
    if (lowerQuery.includes(key)) {
      mappedQuery = val;
      break;
    }
  }

  return allProducts.filter(p => {
    const textToSearch = [
      p.ad,
      p.etiket || "",
      p.kategori || ""
    ].join(" ").toLowerCase();

    return textToSearch.includes(lowerQuery) || textToSearch.includes(mappedQuery);
  });
}
