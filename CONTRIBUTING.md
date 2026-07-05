# Katkıda Bulunma Rehberi

Cemre Park e-ticaret platformuna katkıda bulunmak istediğiniz için teşekkür ederiz! 🎉

## Başlamadan Önce

Lütfen bu projeyle ilgili tüm çalışmalarınızda aşağıdaki kurallara uyun:

1. **Kod Kalitesi**: Mevcut kod stiliyle tutarlı olun, ESLint ve Prettier kullanın
2. **Commit Mesajları**: Anlamlı ve açıklayıcı commit mesajları yazın
3. **Testler**: Mümkünse yeni özellikler için test ekleyin

## Kurulum

1. Projeyi forklayın ve klonlayın
2. Bağımlılıkları yükleyin: `npm install`
3. .env dosyasını oluşturun: `cp .env.example .env`
4. Veritabanını oluşturun: `npx prisma db push`
5. Geliştirme sunucusunu başlatın: `npm run dev`

## Geliştirme Adımları

1. Yeni bir branch oluşturun: `git checkout -b ozellik/yeni-ozellik`
2. Değişikliklerinizi yapın
3. Formatlama ve lint kontrolü yapın:
   ```bash
   npm run format
   npm run lint
   ```
4. Build'i test edin: `npm run build`
5. Değişikliklerinizi commit edin ve pushlayın
6. Pull Request oluşturun

## Pull Request Kontrol Listesi

- [ ] Kodunuz mevcut stile uygun
- [ ] Tüm lint hataları düzeltildi
- [ ] Build başarılı
- [ ] Değişiklikler açıklayıcı bir şekilde açıklandı

## Teknik Bilgiler

- **Framework**: Next.js 16 (App Router)
- **Veritabanı**: SQLite (Geliştirme) / PostgreSQL (Üretim)
- **ORM**: Prisma
- **Stil**: Tailwind CSS
- **Dil**: JavaScript / TypeScript (geçiş aşamasında)
