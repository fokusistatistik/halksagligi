# 🚀 Deployment Guide - Kocaeli Halk Sağlığı Yönetim Sistemi

## 📋 Ön Gereksinimler

- Node.js 18.17.0 veya üzeri
- npm 9.0.0 veya üzeri
- Git

## 🔧 Kurulum Adımları

### 1. Repository'yi Klonlayın

```bash
git clone <repository-url>
cd halksagligi
```

### 2. Bağımlılıkları Yükleyin

```bash
npm install
```

### 3. Environment Dosyasını Yapılandırın

```bash
# .env.example dosyasını kopyalayın
cp .env.example .env

# .env dosyasını düzenleyin
```

**.env Dosyası İçeriği:**

```env
# Database
DATABASE_URL="file:./prisma/dev.db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-key-change-this-in-production"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# N8N Webhook (Opsiyonel)
N8N_WEBHOOK_URL="https://n8n.fokusistatistik.com"
```

### 4. Database Kurulumu

#### Seçenek A: Backup'tan Restore (Önerilen)

```bash
# Backup dosyasını kopyalayın
cp database-backup/dev-backup-2025-12-30.db prisma/dev.db

# Prisma Client'ı oluşturun
npx prisma generate
```

#### Seçenek B: Sıfırdan Kurulum

```bash
# Migration'ları çalıştırın
npx prisma migrate deploy

# Seed verilerini yükleyin
npm run db:seed

# Prisma Client'ı oluşturun
npx prisma generate
```

### 5. Uygulamayı Başlatın

#### Development Modu:

```bash
npm run dev
```

Uygulama http://localhost:3000 adresinde çalışacaktır.

#### Production Build:

```bash
# Build oluşturun
npm run build

# Production modunda başlatın
npm start
```

## 🔐 İlk Giriş

**Demo Kullanıcılar (Şifre: admin123)**

1. **Sistem Yöneticisi**
   - TC: `11111111111`
   - Email: admin@saglik.gov.tr

2. **Başkan**
   - TC: `22222222222`

3. **Birim Yöneticisi**
   - TC: `33333333333`

## 🌐 Production Deployment

### Vercel Deployment

1. **Vercel'e Deploy:**

```bash
# Vercel CLI yükleyin
npm i -g vercel

# Deploy edin
vercel
```

2. **Environment Variables:**

Vercel dashboard'da aşağıdaki değişkenleri ekleyin:
- `DATABASE_URL`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `NEXT_PUBLIC_APP_URL`

### Docker Deployment

```bash
# Docker image oluşturun
docker build -t halksagligi .

# Container'ı çalıştırın
docker run -p 3000:3000 halksagligi
```

## 📊 Database Yönetimi

### Prisma Studio (Database GUI)

```bash
npm run db:studio
```

### Migration Oluşturma

```bash
npx prisma migrate dev --name migration_name
```

### Database Reset

```bash
npx prisma migrate reset
npm run db:seed
```

## 🔄 Güncelleme

```bash
# Son değişiklikleri çekin
git pull origin main

# Bağımlılıkları güncelleyin
npm install

# Migration'ları çalıştırın
npx prisma migrate deploy

# Prisma Client'ı yeniden oluşturun
npx prisma generate

# Uygulamayı yeniden başlatın
npm run build
npm start
```

## 🛡️ Güvenlik

### Production Checklist:

- [ ] `NEXTAUTH_SECRET` değerini güçlü bir değerle değiştirin
- [ ] Demo kullanıcıların şifrelerini değiştirin veya silin
- [ ] HTTPS kullanın
- [ ] CORS ayarlarını yapılandırın
- [ ] Rate limiting ekleyin
- [ ] Database backup stratejisi oluşturun
- [ ] Log monitoring ayarlayın

### NEXTAUTH_SECRET Oluşturma:

```bash
openssl rand -base64 32
```

## 📁 Proje Yapısı

```
halksagligi/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   ├── auth/              # Authentication pages
│   └── mudurluk/          # Main application pages
├── components/            # React components
├── lib/                   # Utility functions
├── prisma/               # Database schema & migrations
│   ├── schema.prisma     # Database schema
│   ├── seed.ts           # Seed data
│   └── dev.db            # SQLite database
├── public/               # Static files
└── database-backup/      # Database backups
```

## 🔧 Sorun Giderme

### Database bağlantı hatası:

```bash
# Prisma Client'ı yeniden oluşturun
npx prisma generate

# Database'i kontrol edin
npx prisma studio
```

### Build hatası:

```bash
# Cache'i temizleyin
rm -rf .next
npm run build
```

### Port zaten kullanımda:

```bash
# Farklı port kullanın
PORT=3001 npm run dev
```

## 📞 Destek

Herhangi bir sorun yaşarsanız:
1. GitHub Issues'a bakın
2. Dokümantasyonu kontrol edin
3. Proje yöneticisiyle iletişime geçin

## 📝 Lisans

Bu proje Kocaeli İl Sağlık Müdürlüğü için geliştirilmiştir.

---

**Son Güncelleme:** 30 Aralık 2025
**Versiyon:** 1.0.0-beta
