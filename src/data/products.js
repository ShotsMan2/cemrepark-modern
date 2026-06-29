export const products = [
  { id: 1, ad: "Volan Detaylı Etekli Takım", fiyat: 2500.0, gorsel: "/assets/siteimg/yeni1.jpg" },
  { id: 2, ad: "Büyük Beden Jakarlı Tunik", fiyat: 1400.0, gorsel: "/assets/siteimg/yeni2.jpg" },
  { id: 3, ad: "Modal Nakışlı Tunik", fiyat: 1500.0, gorsel: "/assets/siteimg/yeni3.jpg" },
  { id: 4, ad: "Modal Pantolonlu Takım", fiyat: 2500.0, gorsel: "/assets/siteimg/yeni1.jpg" },
  { id: 5, ad: "Beray Taş İşlemeli Takım", fiyat: 2750.0, gorsel: "/assets/siteimg/yeni2.jpg" },
  { id: 6, ad: "Eylül Düğmeli Gömlek", fiyat: 1300.0, gorsel: "/assets/siteimg/yeni3.jpg" },
  { id: 7, ad: "Çıtçıt Düğmeli Uzun Tunik", fiyat: 1700.0, gorsel: "/assets/siteimg/yeni1.jpg" },
  { id: 8, ad: "Organize 3'lü Takım", fiyat: 3500.0, gorsel: "/assets/siteimg/yeni2.jpg" },
  { id: 9, ad: "Apoletli Trenç", fiyat: 2000.0, gorsel: "/assets/siteimg/yeni3.jpg" },
  { id: 10, ad: "Desenli Jile Takım", fiyat: 2750.0, gorsel: "/assets/siteimg/yeni1.jpg" },
  { id: 11, ad: "Saten Etekli Takım", fiyat: 2500.0, gorsel: "/assets/siteimg/yeni2.jpg" },
  { id: 12, ad: "Fermuarlı Etekli Takım", fiyat: 2500.0, gorsel: "/assets/siteimg/yeni3.jpg" },
  { id: 13, ad: "Boncuklu Etekli Takım", fiyat: 2500.0, gorsel: "/assets/siteimg/yeni1.jpg" },
  { id: 14, ad: "Pekşen Pantolonlu Takım", fiyat: 2500.0, gorsel: "/assets/siteimg/yeni2.jpg" },
  { id: 15, ad: "Kampanyalı Etekli Takımlar (3 Model)", fiyat: 1500.0, gorsel: "/assets/siteimg/yeni3.jpg" },
  { id: 16, ad: "Tensel Etekli Takım", fiyat: 2500.0, gorsel: "/assets/siteimg/yeni1.jpg" },
  { id: 17, ad: "Taş İşlemeli Etekli Takım", fiyat: 2500.0, gorsel: "/assets/siteimg/yeni2.jpg" },
  { id: 18, ad: "Spor Bsn Etekli Takım", fiyat: 2500.0, gorsel: "/assets/siteimg/yeni3.jpg" },
  { id: 19, ad: "Güpürlü Elbise", fiyat: 3000.0, gorsel: "/assets/siteimg/yeni1.jpg" },
  { id: 20, ad: "Jileli Elbise", fiyat: 1750.0, gorsel: "/assets/siteimg/yeni2.jpg" },
  { id: 21, ad: "Jileli Bronşlu Elbise", fiyat: 2750.0, gorsel: "/assets/siteimg/yeni3.jpg" },
  { id: 22, ad: "Bol Paça Pantolon", fiyat: 600.0, gorsel: "/assets/siteimg/yeni1.jpg" },
  { id: 23, ad: "İspanyol Paça Dabil Pantolon", fiyat: 600.0, gorsel: "/assets/siteimg/yeni2.jpg" },
  { id: 24, ad: "Beyoğlu Taşlı Pantolon", fiyat: 600.0, gorsel: "/assets/siteimg/yeni3.jpg" }
];

export function getProductById(id) {
  return products.find(p => p.id === parseInt(id));
}

export function searchProducts(query) {
  if (!query) return products;
  return products.filter(p => p.ad.toLowerCase().includes(query.toLowerCase()));
}
