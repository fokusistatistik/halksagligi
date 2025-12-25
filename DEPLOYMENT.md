# Deployment Guide - Kocaeli İSM Görev Yönetim Sistemi

## Test Environment Deployment (test.fokusistatistik.com)

### Pre-deployment Checklist

- [ ] Database backup yapıldı
- [ ] Environment variables hazırlandı (.env dosyası)
- [ ] n8n webhook endpoints test edildi
- [ ] Build test yapıldı (npm run build)
- [ ] Prisma migrations hazır
- [ ] Admin credentials belirlendi

### Environment Variables

Aşağıdaki environment variables dosyayı `.env.example`'dan `.env`'ye kopyalayarak oluşturun:

```bash
cp .env.example .env
```

**MUTLAKA DEĞİŞTİRİLMESİ GEREKENLER:**

```bash
# Database (SQLite for Management)
DATABASE_URL="file:/var/lib/halksagligi/prod.db"

# NextAuth
NEXTAUTH_SECRET="<openssl rand -base64 32 ile üret>"
NEXTAUTH_URL="https://test.fokusistatistik.com"

# JWT
JWT_SECRET="<openssl rand -base64 32 ile üret>"

# n8n Webhook (Operational Data)
N8N_WEBHOOK_URL="https://n8n.fokusistatistik.com"

# App URL
NEXT_PUBLIC_APP_URL="https://test.fokusistatistik.com"
NODE_ENV="production"
```

### Installation Steps

#### 1. Dependencies Kurulumu

```bash
npm install
```

#### 2. Database Setup (SQLite)

```bash
# Prisma client oluştur
npx prisma generate

# Database push (SQLite için migrate yerine)
npx prisma db push

# Seed data (ilk kurulum için)
npx prisma db seed
```

**NOT:** Seed işlemi aşağıdaki verileri oluşturur:
- 6 rol (ADMIN, BASKAN, ANALIST, BIRIM_YONETICISI, PERSONEL, MISAFIR)
- 43 yetki (tüm kategoriler)
- Admin kullanıcı (Email: admin@saglik.gov.tr, Şifre: admin123)
- Test birimleri
- Görev ve Takvim modelleri (Gorev, GorevGuncelleme, TakvimEtkinlik)

#### 3. Build

```bash
# .next klasörünü temizle
rm -rf .next

# Production build (TypeScript hataları ignore edilir)
NODE_ENV=production npm run build
```

Build işlemi başarılı olmalı. `next.config.mjs` içinde `ignoreBuildErrors: true` ayarı aktif.

#### 4. Start Production Server

**Option A: PM2 ile (Önerilen)**

```bash
# PM2 yükle (global)
npm install -g pm2

# Uygulamayı başlat
pm2 start npm --name "halksagligi" -- start

# Otomatik restart ayarla
pm2 startup
pm2 save
```

**Option B: Docker ile**

```bash
# Docker image build
docker build -t halksagligi:latest .

# Container çalıştır
docker run -d \
  --name halksagligi \
  -p 3000:3000 \
  --env-file .env \
  halksagligi:latest
```

**Option C: Standalone**

```bash
npm start
```

### Post-deployment Verification

#### 1. Health Check

```bash
curl https://test.fokusistatistik.com
```

Ana sayfa yüklenmeli ve login sayfasına redirect etmeli.

#### 2. Database Connection

```bash
curl https://test.fokusistatistik.com/api/health
```

(Not: Health check endpoint eklenirse)

#### 3. Login Test

- URL: `https://test.fokusistatistik.com/login`
- TC: `17422776208`
- Şifre: `Eb0302174.`

Başarılı giriş yapabilmeli.

#### 4. Webhook Test

Login yaptıktan sonra n8n'de aşağıdaki webhook'ların tetiklendiğini kontrol edin:
- `/webhook/login` - Login proxy
- `/webhook/login-success` - Başarılı giriş detayları

### Nginx Configuration (Reverse Proxy)

```nginx
server {
    listen 443 ssl http2;
    server_name test.fokusistatistik.com;

    ssl_certificate /path/to/ssl/cert.pem;
    ssl_certificate_key /path/to/ssl/key.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Timeout settings
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

### n8n Webhook Setup

n8n'de aşağıdaki webhook'ları oluşturun:

#### Authentication Webhooks

1. **Login Proxy** - `/webhook/login`
   - Method: POST
   - Response: Personel bilgileri + token

2. **Login Success** - `/webhook/login-success`
   - Method: POST
   - Payload includes full auth details

#### SHM Webhooks

3. **SHM Veri Giriş** - `/webhook/shm-veri-giris`
   - Method: POST
   - Payload: veri_giris + full auth

4. **SHM Veri Güncelle** - `/webhook/shm-veri-guncelle`
   - Method: POST

5. **SHM Veri Sil** - `/webhook/shm-veri-sil`
   - Method: POST

6. **SHM Veri Onay** - `/webhook/shm-veri-onay`
   - Method: POST

#### Birim Webhooks

7. **Birim Oluştur** - `/webhook/birim-olustur`
   - Method: POST

8. **Birim Güncelle** - `/webhook/birim-guncelle`
   - Method: POST

9. **Birim Sil** - `/webhook/birim-sil`
   - Method: POST

### Monitoring

#### PM2 Monitoring

```bash
# Process listesi
pm2 list

# Logları göster
pm2 logs halksagligi

# Restart
pm2 restart halksagligi

# Stop
pm2 stop halksagligi
```

#### Database Monitoring

```bash
# Prisma Studio (development only)
npx prisma studio
```

### Backup Strategy

#### Database Backup

```bash
# PostgreSQL backup
pg_dump -h HOST -U USER -d DATABASE > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore
psql -h HOST -U USER -d DATABASE < backup_YYYYMMDD_HHMMSS.sql
```

#### Application Backup

```bash
# Code + environment
tar -czf app_backup_$(date +%Y%m%d).tar.gz \
  --exclude=node_modules \
  --exclude=.next \
  --exclude=.git \
  .
```

### Troubleshooting

#### Build Failures

```bash
# Clean install
rm -rf node_modules package-lock.json .next
npm install
npm run build
```

#### Database Connection Issues

```bash
# Test connection
npx prisma db pull

# Check migrations
npx prisma migrate status
```

#### Port Already in Use

```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>
```

### Security Notes

1. **Never commit `.env` file** - It contains sensitive credentials
2. **Use strong secrets** - Generate with `openssl rand -base64 32`
3. **Enable HTTPS** - Always use SSL in production
4. **Rate Limiting** - Already implemented in code
5. **Audit Logging** - All operations logged to `aktivite_log` table
6. **Webhook Security** - Consider adding webhook signature verification

### Unit-Based Permissions

The system enforces strict unit-based permissions:

- **Admin / Başkan / İstatistikçi**: Can access all units and data
- **SHM Görevlisi**: Only their own SHM unit and its sub-units
- **ASM Görevlisi**: Only their own ASM unit
- **Birim Yöneticisi**: Only their own unit

This is enforced at:
- API level (permissions functions)
- Database query level (where clauses)
- Frontend level (UI filtering)

### Webhook Payload Structure

All operational webhooks include complete auth context:

```json
{
  "event": "shm_veri_giris_olusturuldu",
  "auth": {
    "user_id": "uuid",
    "user_email": "email@example.com",
    "user_name": "Ad Soyad",
    "user_tc": "12345678901",
    "role_code": "SHM_GOREVLISI",
    "role_name": "SHM Görevlisi",
    "role_level": 3,
    "birim_id": "uuid",
    "birim_ad": "İzmit SHM",
    "birim_kod": "SHM-IZMIT",
    "birim_tip": "SHM",
    "permissions": [
      {
        "kod": "shm.veri_giris",
        "ad": "SHM Veri Girişi",
        "kategori": "SHM"
      }
    ]
  },
  "ip_adresi": "192.168.1.1",
  "user_agent": "Mozilla/5.0...",
  "timestamp": "2025-12-16T10:30:00.000Z",
  "data": { /* operation specific data */ }
}
```

### Support

For issues or questions:
- Technical Lead: [Contact Info]
- n8n Webhook Issues: [Webhook Admin]
- Database Issues: [DBA Contact]

---

Last Updated: 2025-12-26
Version: 1.0.0-beta (SQLite + Görev/Takvim Modülleri)
