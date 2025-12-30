# Database Backup - 2025-12-30

## 📦 İçerik

Bu klasör, sistemin tam yedeğini içerir:

### 1. Database Dosyası
- **Dosya:** `dev-backup-2025-12-30.db`
- **Tip:** SQLite Database
- **İçerik:** Tüm kullanıcılar, roller, yetkiler, birimler ve seed verileri

### 2. Prisma Schema
- Ana dizindeki `prisma/schema.prisma` dosyası database yapısını içerir

### 3. Seed Dosyası
- Ana dizindeki `prisma/seed.ts` dosyası demo verileri oluşturur

## 🔄 Restore İşlemi

### Yeni Bir Sistemde Kurulum:

1. **Projeyi klonlayın:**
   ```bash
   git clone <repo-url>
   cd halksagligi
   ```

2. **Bağımlılıkları yükleyin:**
   ```bash
   npm install
   ```

3. **Environment dosyasını oluşturun:**
   ```bash
   cp .env.example .env
   ```

4. **Database'i restore edin:**
   ```bash
   # Backup dosyasını prisma klasörüne kopyalayın
   cp database-backup/dev-backup-2025-12-30.db prisma/dev.db
   ```

   VEYA

   **Yeni database oluşturun:**
   ```bash
   # Prisma migration'ları çalıştırın
   npx prisma migrate deploy
   
   # Seed verilerini yükleyin
   npm run db:seed
   ```

5. **Prisma Client'ı oluşturun:**
   ```bash
   npx prisma generate
   ```

6. **Uygulamayı başlatın:**
   ```bash
   npm run dev
   ```

## 🔑 Demo Kullanıcılar

**Şifre (Hepsi için):** `admin123`

1. **Sistem Yöneticisi**
   - TC: `11111111111`
   - Email: admin@saglik.gov.tr

2. **Başkan**
   - TC: `22222222222`
   - Ad: Ahmet Yılmaz

3. **Birim Yöneticisi (İzmit)**
   - TC: `33333333333`
   - Ad: Mehmet Demir

4. **Birim Yöneticisi (Akçakoca SHM)**
   - TC: `44444444444`
   - Ad: Ayşe Kaya

## 📊 Database İçeriği

- ✅ 6 Rol
- ✅ 43 Yetki
- ✅ Rol-Yetki Eşleştirmeleri
- ✅ Birimler (İlçe Sağlık, ASM, SHM, vb.)
- ✅ Demo Kullanıcılar
- ✅ Tüm sistem tabloları

## 🛠️ Teknik Detaylar

- **Database:** SQLite
- **ORM:** Prisma
- **Framework:** Next.js 14
- **Auth:** NextAuth.js
- **Backup Tarihi:** 30 Aralık 2025

## ⚠️ Önemli Notlar

1. Production ortamında `.env` dosyasındaki `NEXTAUTH_SECRET` değerini mutlaka değiştirin
2. Database dosyası hassas veriler içerir, güvenli bir yerde saklayın
3. Düzenli yedekleme yapın
4. Production'da PostgreSQL veya MySQL kullanmanız önerilir

## 📞 Destek

Herhangi bir sorun yaşarsanız, lütfen proje yöneticisiyle iletişime geçin.
