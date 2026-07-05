# Cemre Park E-Ticaret Platformu

Moda ve tesettür giyim sektöründe hizmet veren Cemre Park markasının modern e-ticaret platformu.

## 🚀 Teknik Yığın

- **Framework**: Next.js 16 (App Router)
- **Veritabanı**: SQLite (Geliştirme) / PostgreSQL (Üretim)
- **ORM**: Prisma
- **Stil**: Tailwind CSS
- **Kimlik Doğrulama**: NextAuth.js
- **UI Bileşenleri**: SweetAlert2, Swiper, AOS, Recharts
- **Güvenlik**: bcrypt (şifre hash'leme), Güvenlik Başlıkları

## 📋 Özellikler

### Ön Yüz
- Ana sayfa banner yönetimi
- Ürün listeleme ve detayları
- Sepet yönetimi
- Favoriler
- Kullanıcı hesabı
- İletişim formu
- Kurumsal sayfalar

### Admin Paneli
- Gösterge paneli (Dashboard)
- Ürün yönetimi (Ekle/Güncelle/Sil)
- Sipariş yönetimi
- Müşteri yönetimi
- Banner/slider yönetimi
- Sayfa yönetimi
- Ayarlar yönetimi
- Mesaj yönetimi

## 🛠️ Kurulum

1. Depoyu klonlayın
```bash
git clone <repo-url>
cd CemreParkWebSitesi
```

2. Bağımlılıkları yükleyin
```bash
npm install
```

3. Çevre değişkenlerini ayarlayın
```bash
cp .env.example .env
```

`.env` dosyasını düzenleyin ve gerekli değişkenleri doldurun.

4. Veritabanını oluşturun
```bash
npx prisma db push
```

5. Geliştirme sunucusunu başlatın
```bash
npm run dev
```

Uygulama [http://localhost:3000](http://localhost:3000) adresinde çalışacaktır.

## 🐳 Docker ile Kurulum

1. Docker ve Docker Compose kurulu olduğundan emin olun
2. Aşağıdaki komutları çalıştırın:
```bash
# Docker imajını oluşturun
docker-compose build

# Konteynerı başlatın
docker-compose up -d
```

Uygulama [http://localhost:3000](http://localhost:3000) adresinde çalışacaktır.

## 📝 Scriptler

- `npm run dev`: Geliştirme sunucusunu başlatır
- `npm run build`: Üretim için derler
- `npm start`: Üretim sunucusunu başlatır
- `npm run lint`: Kod kalitesini kontrol eder
- `npm run lint:fix`: Lint hatalarını otomatik olarak düzeltir
- `npm run format`: Kod formatını düzenler
- `npm run format:check`: Formatlama kontrolü yapar

## 🔐 Güvenlik

- Şifreler bcrypt ile hash'lenir
- Tüm yönetimsel API istekleri oturum ile doğrulanır
- XSS, Clickjacking gibi tehditlere karşı güvenlik başlıkları kullanılır

## 📂 Proje Yapısı

```
CemreParkWebSitesi/
├── prisma/                # Prisma şeması ve veritabanı
├── public/                # Statik dosyalar (resimler, fontlar vb.)
├── src/
│   ├── app/               # Next.js App Router
│   │   ├── admin/         # Admin paneli sayfaları
│   │   └── api/           # API route'ları
│   ├── components/        # React bileşenleri
│   ├── context/           # Context sağlayıcıları
│   ├── data/              # Statik veriler
│   ├── lib/               # Yardımcı kütüphaneler
│   └── utils/             # Yardımcı fonksiyonlar
└── package.json
```

## 📄 Lisans

Bu proje özel bir lisans altında korunmaktadır.
