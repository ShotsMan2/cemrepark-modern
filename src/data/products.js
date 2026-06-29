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
  
  const lowerQuery = query.toLowerCase();
  return allProducts.filter(p => 
    p.ad.toLowerCase().includes(lowerQuery) || 
    (p.etiket && p.etiket.toLowerCase().includes(lowerQuery)) ||
    (p.kategori && p.kategori.toLowerCase().includes(lowerQuery))
  );
}
