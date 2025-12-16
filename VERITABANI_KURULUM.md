# VERİTABANI KURULUM TALİMATLARI

## 🗄️ PostgreSQL Kurulumu

### Option 1: Local PostgreSQL (Önerilen - Development)

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# macOS (Homebrew)
brew install postgresql
brew services start postgresql

# Windows
# https://www.postgresql.org/download/windows/ adresinden indirin
```

### Option 2: Docker ile PostgreSQL

```bash
# PostgreSQL container başlat
docker run --name kocaeli-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=kocaeli_saglik \
  -p 5432:5432 \
  -d postgres:15

# Container durumunu kontrol et
docker ps

# Container'ı durdur
docker stop kocaeli-postgres

# Container'ı başlat
docker start kocaeli-postgres
```

### Option 3: Cloud PostgreSQL (Production)

**Vercel Postgres:**
```bash
# Vercel CLI kur
npm i -g vercel

# Vercel'e login
vercel login

# Postgres database oluştur
vercel postgres create
```

**Supabase, Railway, Render vb. platformlar da kullanılabilir.**

---

## ⚙️ Veritabanı Yapılandırması

### 1. Environment Variables Ayarlama

`.env.local` dosyasını düzenleyin:

```env
# Local PostgreSQL
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/kocaeli_saglik?schema=public"

# Docker PostgreSQL
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/kocaeli_saglik?schema=public"

# Cloud PostgreSQL (örnek)
DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require"
```

### 2. Prisma Client Generate

```bash
npx prisma generate
```

### 3. Migration Çalıştırma

```bash
# Development migration (ilk kurulum)
npx prisma migrate dev --name init

# Production migration
npx prisma migrate deploy
```

### 4. Seed Data Ekleme

```bash
npm run db:seed
```

**Seed data içeriği:**
- ✅ 7 Rol (Admin, Başkan, İstatistikçi, Birim Yöneticisi, Personel, Dış Birim, Misafir)
- ✅ 40+ Yetki tanımı
- ✅ Rol-Yetki eşleştirmeleri
- ✅ 4 Temel birim (Halk Sağlığı Başkanlığı + 3 ASM)
- ✅ İlk admin kullanıcısı

**Admin Giriş Bilgileri:**
```
Email: admin@saglik.gov.tr
Şifre: admin123
```

---

## 🔍 Prisma Studio (Veritabanı GUI)

```bash
npm run prisma:studio
```

Tarayıcıda `http://localhost:5555` adresinde açılır.

---

## 🛠️ Faydalı Komutlar

```bash
# Prisma client yeniden generate et
npm run prisma:generate

# Migration oluştur
npm run prisma:migrate

# Seed data ekle
npm run db:seed

# Prisma Studio aç
npm run prisma:studio

# Database'i sıfırla (DİKKAT: Tüm veriler silinir!)
npx prisma migrate reset

# Schema değişikliklerini database'e push et (migration olmadan)
npm run db:push
```

---

## 📝 Schema Güncellemeleri

`prisma/schema.prisma` dosyasında değişiklik yaptıktan sonra:

```bash
# 1. Migration oluştur
npx prisma migrate dev --name degisiklik_aciklamasi

# 2. Client yeniden generate et
npx prisma generate

# 3. TypeScript type'ları güncellenir
```

---

## 🚨 Sorun Giderme

### Connection Error

```bash
# PostgreSQL çalışıyor mu kontrol et
# macOS/Linux:
pg_isready

# Docker:
docker ps | grep postgres

# Service durumu (Ubuntu/Debian):
sudo systemctl status postgresql
```

### Migration Hataları

```bash
# Migration'ları sıfırla ve yeniden başla
npx prisma migrate reset

# Seed data'yı yeniden çalıştır
npm run db:seed
```

### Prisma Client Hataları

```bash
# Cache'i temizle ve yeniden generate et
rm -rf node_modules/.prisma
npx prisma generate
```

---

## 📊 Database Schema Özeti

**Tablolar:**
- `personel` - Personel bilgileri (kullanıcılar)
- `roller` - Rol tanımları
- `yetkiler` - Yetki tanımları
- `rol_yetki` - Rol-Yetki ilişkisi
- `birimler` - Birim/Departman yapısı
- `aktivite_log` - Sistem aktivite logları

**İlişkiler:**
- Personel → Rol (many-to-one)
- Personel → Birim (many-to-one)
- Personel → Yönetici (self-referencing, many-to-one)
- Rol → Yetkiler (many-to-many through rol_yetki)
- Birim → Üst Birim (self-referencing, many-to-one)

---

## 🔐 Güvenlik Notları

1. **Production'da:**
   - `.env.local` dosyasını **asla** commit etmeyin
   - Güçlü veritabanı şifreleri kullanın
   - SSL bağlantısı kullanın (`sslmode=require`)

2. **Admin şifresini değiştirin:**
   ```bash
   # Prisma Studio'da veya API üzerinden admin şifresini güncelleyin
   ```

3. **Backup:**
   ```bash
   # PostgreSQL backup
   pg_dump -U postgres kocaeli_saglik > backup.sql

   # Restore
   psql -U postgres kocaeli_saglik < backup.sql
   ```

---

## ✅ Kontrol Listesi

- [ ] PostgreSQL kuruldu
- [ ] DATABASE_URL ayarlandı
- [ ] `npx prisma generate` çalıştırıldı
- [ ] `npx prisma migrate dev` çalıştırıldı
- [ ] `npm run db:seed` çalıştırıldı
- [ ] Admin ile giriş yapıldı (admin@saglik.gov.tr / admin123)
- [ ] Prisma Studio'da veriler görüntülendi
- [ ] Admin şifresi değiştirildi

---

## 📞 Destek

Sorun yaşarsanız:
1. Hata mesajını kontrol edin
2. Yukarıdaki sorun giderme adımlarını deneyin
3. Prisma dokümanlarına bakın: https://www.prisma.io/docs
