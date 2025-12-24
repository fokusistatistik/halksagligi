# Kocaeli İl Sağlık Müdürlüğü - Halk Sağlığı Yönetim Sistemi

Halk Sağlığı Başkanlığı için geliştirilmiş, hibrit mimari ile çalışan modern yönetim platformu.

## 🏥 Proje Hakkında

Bu sistem, Kocaeli İl Sağlık Müdürlüğü Halk Sağlığı Başkanlığı'nın yönetimsel ve operasyonel süreçlerini dijitalleştirmek üzere geliştirilmiştir.

**Hibrit Mimari:**
- **SQLite:** Yönetim işlemleri (Admin, Görev Yönetimi, Auth)
- **n8n Webhook:** Operasyonel veri girişleri (ASM, SHM, İstatistik, İlçe Sağlık)

---

## ✨ Özellikler

### 🔐 Kimlik Doğrulama (SQLite)
- NextAuth.js ile güvenli oturum yönetimi
- Rol tabanlı erişim kontrolü (RBAC)
- 6 farklı rol: ADMIN, BASKAN, ANALIST, BIRIM_YONETICISI, PERSONEL, MISAFIR
- İlk giriş şifre değiştirme zorunluluğu
- Email tabanlı şifre sıfırlama

### 📋 Görev Yönetimi (SQLite)
- Görev oluşturma, atama ve takip
- Öncelik ve durum yönetimi (beklemede, devam ediyor, tamamlandı)
- Görev devretme sistemi
- Takvim entegrasyonu
- Yorum ve dosya eklentileri
- Birim bazlı görev izolasyonu

### 📅 Takvim Sistemi (Planlanan)
- Görev ve etkinlik takvimi
- Günlük/Haftalık/Aylık görünümler
- Toplantı planlama

### 🏥 Operasyonel Modüller (n8n Webhook)

#### ASM Modülü (Geliştirilecek)
- Günlük veri girişi (muayene, aşı, gebe takip)
- Onay akışı (BEKLEMEDE → ONAYLANDI/REDDEDILDI)
- Performans takibi

#### SHM Modülü (Kısmi Hazır)
- Basit veri girişi mevcut
- Webhook entegrasyonu devam ediyor
- Liste ve rapor sayfaları var

#### İstatistik Modülü (Planlanan)
- Veri analiz dashboardları
- Grafiksel raporlar
- Export (PDF/Excel/CSV)

#### İlçe Sağlık Modülü (Planlanan)
- İlçe bazlı veri toplama
- Saha ekipleri yönetimi
- Coğrafi haritalar

### ⚙️ Admin Paneli (SQLite)
- Kullanıcı yönetimi (CRUD)
- Birim yönetimi (organizasyon yapısı)
- Rol ve yetki tanımlama
- Aktivite logları görüntüleme

---

## 🛠️ Teknoloji Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Dil**: TypeScript
- **Stil**: Tailwind CSS + Custom Design System
- **UI Bileşenleri**: Radix UI + shadcn/ui
- **Form Yönetimi**: React Hook Form + Zod
- **İkonlar**: Lucide React
- **PWA**: next-pwa

### Backend (SQLite - Yönetim)
- **Database**: SQLite 3
- **ORM**: Prisma
- **Auth**: NextAuth.js (Credentials Provider)
- **Şifreleme**: bcryptjs (10 rounds)
- **Session**: JWT (30 gün)

### Backend (n8n - Operasyonel)
- **Webhook Server**: n8n.fokusistatistik.com
- **Database**: PostgreSQL (n8n backend)
- **API Format**: REST/JSON
- **Retry Logic**: Exponential backoff

---

## 📦 Kurulum

### Gereksinimler
- Node.js 18.17.0+
- npm 9.0.0+

### Adımlar

1. **Bağımlılıkları yükleyin:**
```bash
npm install
```

2. **Environment variables ayarlayın (`.env.local`):**
```env
# Database (SQLite)
DATABASE_URL="file:./prisma/dev.db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="<openssl rand -base64 32 ile üret>"

# n8n Webhook (Operasyonel modüller için)
N8N_WEBHOOK_URL="https://n8n.fokusistatistik.com"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
```

3. **Veritabanını hazırlayın:**
```bash
# Prisma client oluştur
npx prisma generate

# Database migrate
npx prisma migrate dev --name init

# Seed data (roller, yetkiler, admin kullanıcı)
npm run db:seed
```

4. **Development sunucusunu başlatın:**
```bash
npm run dev
```

5. **Tarayıcıda açın:** `http://localhost:3000`

**İlk Giriş:**
- Email: `admin@saglik.gov.tr`
- Şifre: `admin123` (ilk girişte değiştirilmeli)

---

## 🚀 Production Build

```bash
# Build
npm run build

# Start
npm start

# PM2 ile (önerilen)
pm2 start npm --name "halksagligi" -- start
```

---

## 📁 Proje Yapısı

```
halksagligi/
├── app/                           # Next.js App Router
│   ├── api/                       # API Routes
│   │   ├── auth/[...nextauth]/   # NextAuth endpoint
│   │   ├── admin/                # Admin API endpoints
│   │   ├── personel/             # Personel CRUD API
│   │   ├── birim/                # Birim CRUD API
│   │   ├── shm/veri-giris/       # SHM veri API
│   │   ├── sifre-degistir/       # Şifre değiştirme
│   │   ├── sifre-sifirla/        # Şifre sıfırlama
│   │   └── webhook-proxy/        # n8n webhook proxy
│   ├── admin/                     # Admin paneli
│   │   ├── birimler/             # Birim yönetimi
│   │   └── kullanicilar/         # Kullanıcı yönetimi
│   ├── mudurluk/                  # Yönetim modülleri
│   │   └── gorev-yonetim/        # Görev yönetimi
│   ├── shm/                       # SHM modülü (kısmi)
│   │   ├── veri-giris/           # Veri giriş formu
│   │   ├── liste/                # Veri listesi
│   │   └── rapor/                # Raporlama
│   ├── asm/                       # ASM modülü (planlanan)
│   ├── istatistik/                # İstatistik modülü (planlanan)
│   ├── ilce-saglik/               # İlçe Sağlık (planlanan)
│   ├── login/                     # Giriş sayfası
│   ├── sifre-degistir/            # Şifre değiştirme
│   ├── sifre-sifirla/             # Şifremi unuttum
│   └── sifre-yenile/              # Token ile şifre yenileme
├── components/                    # React bileşenleri
│   ├── ui/                        # UI primitives (Radix UI)
│   ├── dashboard/                 # Dashboard bileşenleri
│   ├── password-input.tsx         # Şifre input (güç göstergeli)
│   ├── site-header.tsx            # Header
│   └── site-footer.tsx            # Footer
├── lib/                           # Yardımcı fonksiyonlar
│   ├── auth/                      # Auth yardımcıları
│   │   ├── options.ts            # NextAuth config
│   │   ├── permissions.ts        # RBAC yetki kontrolü
│   │   └── session.ts            # Session helper
│   ├── validations/               # Zod validation schemas
│   │   └── password.ts           # Şifre validasyonu
│   ├── webhook/                   # n8n webhook client
│   ├── prisma.ts                  # Prisma client
│   ├── rate-limit.ts              # Rate limiting
│   ├── log.ts                     # Audit logging
│   └── utils.ts                   # Genel utilities
├── prisma/                        # Database
│   ├── schema.prisma              # Prisma schema (SQLite)
│   ├── seed.ts                    # Seed data script
│   └── dev.db                     # SQLite database (dev)
├── types/                         # TypeScript tanımları
│   ├── index.ts                   # Genel type'lar
│   └── next-auth.d.ts             # NextAuth type extensions
├── hooks/                         # Custom React hooks
├── middleware.ts                  # Next.js middleware (auth check)
└── [Dokümantasyon]                # Proje dökümanları
    ├── ARCHITECTURE.md            # Sistem mimarisi
    ├── README.md                  # Ana doküman (bu dosya)
    ├── DATABASE_SCHEMA_REPORT.md  # Database schema
    ├── DEPLOYMENT.md              # Deployment rehberi
    ├── SIFRE_SISTEMI_DOKUMAN.md   # Şifre sistemi
    └── MODUL_GELISTIRME_YONERGESI.md
```

---

## 🔗 n8n Webhook Endpoints (Operasyonel Modüller)

Sistem, operasyonel veri girişleri için n8n webhook sistemi kullanır.

**Base URL:** `https://n8n.fokusistatistik.com/webhook`

### Planlanan Endpoint'ler:

#### ASM Modülü
- `/asm-veri-giris` - Günlük veri girişi
- `/asm-veri-onay` - Veri onay işlemi
- `/asm-rapor` - Raporlama

#### SHM Modülü
- `/shm-veri-giris` - Veri girişi
- `/shm-veri-guncelle` - Veri güncelleme
- `/shm-veri-onay` - Onay işlemi

#### İstatistik Modülü
- `/istatistik-rapor` - Analiz raporları
- `/istatistik-grafik` - Grafik verileri

#### İlçe Sağlık Modülü
- `/ilce-saglik-veri` - Veri toplama
- `/ilce-saglik-rapor` - Raporlama

**Not:** Webhook entegrasyonları geliştirilme aşamasındadır.

---

## 👥 Kullanıcı Rolleri ve Yetkileri

| Rol | Seviye | Açıklama | Yetkiler |
|-----|--------|----------|----------|
| **ADMIN** | 10 | Sistem yöneticisi | Tüm yetkiler (43 adet) |
| **BASKAN** | 9 | Halk Sağlığı Başkanı | Personel, görev, veri onayı, raporlama |
| **ANALIST** | 8 | Müdürlük birimi analisti | Veri girişi, analiz, raporlama (müdürlük birimlerinde) |
| **BIRIM_YONETICISI** | 7 | Dış birim yöneticisi | Birim verileri, onay, raporlama (dış birimlerde) |
| **PERSONEL** | 4 | Standart personel | Görev görüntüleme, veri girişi |
| **MISAFIR** | 1 | Misafir kullanıcı | Salt okunur (raporlar, takvim) |

### Yetki Kategorileri:
- **SISTEM:** Sistem ayarları, log görüntüleme
- **PERSONEL:** Personel CRUD işlemleri
- **ROL:** Rol ve yetki yönetimi
- **BIRIM:** Birim CRUD işlemleri
- **GOREV:** Görev yönetimi
- **ASM:** ASM veri girişi ve onayı
- **SHM:** SHM veri girişi ve onayı
- **RAPOR:** Raporlama ve export
- **TAKVIM:** Takvim yönetimi
- **BILDIRIM:** Bildirim gönderme

---

## 🎨 Tasarım

- **Birincil Renk**: #E30613 (T.C. Sağlık Bakanlığı kırmızısı)
- **İkincil Renk**: #003366 (Lacivert)
- **Responsive**: Desktop, Tablet, Mobil
- **PWA**: Offline desteği (planlanan)

---

## 🔒 Güvenlik

### Authentication
- NextAuth.js (Credentials Provider)
- JWT token (30 gün expiry)
- bcrypt şifreleme (10 rounds)
- İlk giriş şifre değiştirme zorunluluğu
- Email tabanlı şifre sıfırlama

### Authorization
- Rol tabanlı erişim kontrolü (RBAC)
- 43 farklı yetki tanımı
- Birim bazlı veri izolasyonu
- Middleware seviyesinde auth check

### Data Security
- Input validation (Zod schemas)
- SQL injection koruması (Prisma ORM)
- XSS koruması (React escaping)
- CSRF koruması (sameSite cookies)
- Rate limiting (login, password reset)

### Audit Trail
- Tüm kritik işlemler loglanır
- IP adresi ve User-Agent kaydı
- Kim, ne, ne zaman tracking

---

## 📝 Changelog

### v1.0.0 (2025-12-24)

#### ✅ Tamamlanan Özellikler
- **Auth Sistemi**
  - NextAuth.js entegrasyonu (SQLite)
  - İlk giriş şifre değiştirme
  - Email tabanlı şifre sıfırlama
  - JWT session yönetimi

- **Admin Paneli**
  - Kullanıcı yönetimi (CRUD)
  - Birim yönetimi (organizasyon yapısı)
  - Rol ve yetki sistemi
  - Aktivite logları

- **Görev Yönetimi**
  - Görev oluşturma ve atama
  - Durum takibi (beklemede, devam ediyor, tamamlandı)
  - Öncelik yönetimi
  - Takvim entegrasyonu (temel)

- **SHM Modülü (Kısmi)**
  - Basit veri giriş formu
  - Veri listesi sayfası
  - Basit raporlama
  - Webhook proxy hazır

#### 🔄 Geliştirilme Aşamasında
- ASM modülü (arayüz hazırlanıyor)
- SHM modülü webhook entegrasyonu
- İstatistik modülü
- İlçe Sağlık modülü

#### 📋 Yapılacaklar (Roadmap)
- [ ] ASM modülü tamamlanması
- [ ] n8n webhook entegrasyonları
- [ ] Gelişmiş raporlama dashboardları
- [ ] Mobil responsive iyileştirmeler
- [ ] PWA offline support
- [ ] Real-time bildirimler

---

## 📚 Dokümantasyon

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Sistem mimarisi ve hibrit yapı
- **[DATABASE_SCHEMA_REPORT.md](./DATABASE_SCHEMA_REPORT.md)** - SQLite database şeması
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Production deployment rehberi
- **[SIFRE_SISTEMI_DOKUMAN.md](./SIFRE_SISTEMI_DOKUMAN.md)** - Şifre yönetim sistemi
- **[MODUL_GELISTIRME_YONERGESI.md](./MODUL_GELISTIRME_YONERGESI.md)** - Modül geliştirme kuralları
- **[VERITABANI_KURULUM.md](./VERITABANI_KURULUM.md)** - Veritabanı kurulum talimatları

---

## 📞 Destek ve İletişim

**Geliştirici:** FOKUS İstatistik
**Email:** support@fokusistatistik.com
**Versiyon:** 1.0.0
**Son Güncelleme:** 2025-12-24

---

**Lisans:** Kocaeli İl Sağlık Müdürlüğü için özel geliştirilmiştir.
