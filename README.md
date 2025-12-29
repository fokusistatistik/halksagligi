# Kocaeli İl Sağlık Müdürlüğü - Halk Sağlığı Yönetim Sistemi (SAHA)

Halk Sağlığı Başkanlığı için geliştirilmiş, hibrit mimari ile çalışan modern yönetim platformu.

## 🏥 Proje Hakkında

Bu sistem, Kocaeli İl Sağlık Müdürlüğü Halk Sağlığı Başkanlığı'nın yönetimsel ve operasyonel süreçlerini dijitalleştirmek üzere geliştirilmiştir.

**Hibrit Mimari:**
- **SQLite:** Yönetim işlemleri (Admin, Görev Yönetimi, Takvim, Auth)
- **n8n Webhook:** Operasyonel veri girişleri (ASM, SHM, İstatistik, İlçe Sağlık)

---

## ✨ Özellikler

### 🔐 Kimlik Doğrulama (SQLite)
- NextAuth.js ile güvenli oturum yönetimi
- Rol tabanlı erişim kontrolü (RBAC)
- 6 farklı rol: ADMIN, BASKAN, ANALIST, BIRIM_YONETICISI, PERSONEL, MISAFIR
- İlk giriş şifre değiştirme zorunluluğu
- Email tabanlı şifre sıfırlama

### 📋 Görev & Takvim Yönetimi (SQLite) ✅ YENİ
- **Görev Yönetimi:**
  - Görev oluşturma, atama ve takip
  - Öncelik ve durum yönetimi (BEKLEYEN, DEVAM_EDEN, TAMAMLANDI, IPTAL)
  - Kategori bazlı organizasyon (DENETIM, EGITIM, TOPLANTI, DIGER)
  - Görev güncellemeleri ve feedback sistemi (GorevGuncelleme)
  - Görsel ekleme desteği (URL bazlı)
  - Birim bazlı görev izolasyonu
  - Rol bazlı yetkilendirme (Başkan/Yöneticiler tüm görevleri görebilir)

- **Takvim Sistemi:**
  - Kişisel ve kurumsal etkinlik yönetimi
  - Etkinlik tipleri: TOPLANTI, EGITIM, IZIN, DENETIM, DIGER
  - Tam gün / saatlik etkinlikler
  - Yöneticiler alt personelin takvimine etkinlik ekleyebilir
  - Otomatik renklendirme sistemi

- **Gelişmiş UI:**
  - 4 sekme: Görevler, Takvim, Günlük Aktivite, Süreç İzleme
  - İnteraktif görev kartları (öncelik ve durum göstergeleri)
  - Günlük timeline görünümü (08:00-18:00)
  - Görev detay modalı (feedback ekleme, durum güncelleme)
  - Yeni görev/etkinlik oluşturma modalları

### 📊 Dashboard & Harita Sistemi ✅ YENİ
- **Operasyonel Harita:**
  - Kocaeli uydu haritası (1076x800px orijinal oran)
  - İnteraktif ilçe seçimi (12 ilçe)
  - Gerçek zamanlı performans göstergeleri
  - ASM/SHM sayıları ve verimlilik skorları
  - Responsive tasarım (mobil + masaüstü)

- **Rol Bazlı Dashboard:**
  - Seviye 7+ (Birim Yöneticisi ve üstü): Tüm kartlar ve harita
  - Seviye 7 altı: Sadece hoşgeldiniz + hızlı erişim modülleri
  - KPI kartları: Toplam Personel, Aktif Görevler, Bekleyen Onaylar, Genel Performans
  - Görev dağılımı (Pie Chart)
  - İlçelere göre kurum dağılımı (Bar Chart)

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
- **UI Bileşenleri**: Radix UI + shadcn/ui (Avatar, Dialog, Select)
- **Form Yönetimi**: React Hook Form + Zod
- **Grafikler**: Recharts (PieChart, BarChart)
- **İkonlar**: Lucide React
- **PWA**: next-pwa
- **Bildirimler**: react-hot-toast

### Backend (SQLite - Yönetim)
- **Database**: SQLite 3
- **ORM**: Prisma (v5.22.0)
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

2. **Environment variables ayarlayın (`.env`):**
```env
# Database (SQLite)
DATABASE_URL="file:./dev.db"

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

# Database push (migration yerine)
npx prisma db push

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
# .next klasörünü temizle
rm -rf .next

# Build (TypeScript hataları ignore edilir)
NODE_ENV=production npm run build

# Start
npm start

# PM2 ile (önerilen)
pm2 start npm --name "halksagligi-test" -- start
pm2 save
pm2 startup
```

**Not:** `next.config.mjs` içinde `ignoreBuildErrors: true` ve `ignoreDuringBuilds: true` aktif edilmiştir.

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
│   │   ├── gorev/                # Görev CRUD API ✅ YENİ
│   │   │   └── [id]/             # Görev detay/güncelleme
│   │   ├── takvim/               # Takvim API ✅ YENİ
│   │   ├── shm/veri-giris/       # SHM veri API
│   │   ├── sifre-degistir/       # Şifre değiştirme
│   │   ├── sifre-sifirla/        # Şifre sıfırlama
│   │   └── webhook-proxy/        # n8n webhook proxy
│   ├── admin/                     # Admin paneli
│   │   ├── birimler/             # Birim yönetimi
│   │   └── kullanicilar/         # Kullanıcı yönetimi
│   ├── mudurluk/                  # Yönetim modülleri
│   │   └── gorev-yonetim/        # Görev & Takvim Yönetimi ✅ YENİ
│   ├── shm/                       # SHM modülü (kısmi)
│   │   ├── veri-giris/           # Veri giriş formu
│   │   ├── liste/                # Veri listesi
│   │   └── rapor/                # Raporlama
│   ├── asm/                       # ASM modülü (planlanan)
│   ├── istatistik/                # İstatistik modülü (planlanan)
│   ├── ilce-saglik/               # İlçe Sağlık (planlanan)
│   ├── login/                     # Giriş sayfası
│   ├── settings/                  # Kullanıcı ayarları ✅ YENİ
│   ├── sifre-degistir/            # Şifre değiştirme
│   ├── sifre-sifirla/             # Şifremi unuttum
│   └── sifre-yenile/              # Token ile şifre yenileme
├── components/                    # React bileşenleri
│   ├── ui/                        # UI primitives (Radix UI)
│   │   ├── avatar.tsx            # Avatar component ✅ YENİ
│   │   ├── dialog.tsx            # Dialog/Modal component ✅ YENİ
│   │   └── select.tsx            # Select dropdown ✅ YENİ
│   ├── dashboard/                 # Dashboard bileşenleri
│   │   └── dashboard-overview.tsx # Ana dashboard + harita ✅ GÜNCELLENDI
│   ├── password-input.tsx         # Şifre input (güç göstergeli)
│   ├── site-header.tsx            # Header (KISM | ASYA | SAHA) ✅ GÜNCELLENDI
│   ├── site-footer.tsx            # Footer
│   └── chatbot.tsx                # AI Chatbot
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
│   ├── schema.prisma              # Prisma schema (SQLite) ✅ GÜNCELLENDI
│   │                              # + Gorev, GorevGuncelleme, TakvimEtkinlik
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
    ├── MODUL_GELISTIRME_YONERGESI.md # Modül geliştirme
    └── VERITABANI_KURULUM.md      # DB kurulum
```

---

## 👥 Kullanıcı Rolleri ve Yetkileri

| Rol | Seviye | Açıklama | Yetkiler |
|-----|--------|----------|----------|
| **ADMIN** | 10 | Sistem yöneticisi | Tüm yetkiler (43 adet) |
| **BASKAN** | 9 | Halk Sağlığı Başkanı | Personel, görev, veri onayı, raporlama, tüm görevleri görme |
| **ANALIST** | 8 | Müdürlük birimi analisti | Veri girişi, analiz, raporlama (müdürlük birimlerinde) |
| **BIRIM_YONETICISI** | 7 | Dış birim yöneticisi | Birim verileri, onay, raporlama, dashboard görme |
| **PERSONEL** | 4 | Standart personel | Görev görüntüleme, veri girişi, kendi görevleri |
| **MISAFIR** | 1 | Misafir kullanıcı | Salt okunur (raporlar, takvim) |

### Dashboard Erişimi:
- **Seviye 7+**: KPI kartları, harita, tüm grafikler görünür
- **Seviye 7 altı**: Sadece hoşgeldiniz mesajı ve hızlı erişim modülleri

---

## 🎨 Tasarım & Branding

- **Logolar**: 
  - KISM (Kocaeli İl Sağlık Müdürlüğü)
  - ASYA (Asya Sağlık Yönetimi) ✅ YENİ
  - SAHA (Sağlık Hizmetleri Analitiği)
- **Favicon**: asyalogo2.png ✅ YENİ
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
- API seviyesinde yetki kontrolü (Görev, Takvim)

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

### v1.1.0 (2025-12-29) ✅ GÜNCEL

#### ✅ Yeni Özellikler
- **Gelişmiş Takvim Görünümü:**
  - Aylık ızgara (Grid) görünümü eklendi
  - Görevlerin takvim üzerinde bar şeklinde görselleştirilmesi
  - "Süresiz" görevlerin sürekli devam eden iş olarak gösterilmesi
  - Günlük akış ve özet yan panel

- **Görev Yönetimi İyileştirmeleri:**
  - **Süresiz İşler:** Bitiş tarihi olmayan rutin görevler için "Süresiz" seçeneği (`is_suresiz`)
  - **Destek Ekibi:** Görevlere ana sorumlu haricinde "Destek Verenler" atayabilme
  - **Merkezi İş Havuzu:** Görev kartlarında görsel iyileştirmeler ve kompakt tasarım
  - **Filtreleme:** Sorumlu kişi ve durum bazlı dinamik filtreleme

#### 🔧 Teknik Güncellemeler
- **Veritabanı Şeması:** `Gorev` modeline `is_suresiz` ve `destek_verenler` alanları eklendi
- **Durum Yönetimi:** `BEKLEYEN` durumu kaldırılarak süreç sadeleştirildi (Varsayılan: `DEVAM_EDEN`)
- **API:** Filtreleme parametreleri (`userId`) optimize edildi

### v1.0.0-beta (2025-12-26)

#### ✅ Yeni Özellikler
- **Görev & Takvim Modülü (Tam Entegre)**
  - Görev oluşturma, atama, takip sistemi
  - Görev güncellemeleri ve feedback (GorevGuncelleme)
  - Takvim etkinlikleri (TakvimEtkinlik)
  - 4 sekmeli UI: Görevler, Takvim, Günlük Aktivite, Süreç İzleme
  - Rol bazlı yetkilendirme (Başkan/Yöneticiler tüm görevleri görebilir)
  - İnteraktif görev kartları ve detay modalları
  - Günlük timeline (08:00-18:00)

- **Dashboard & Harita Optimizasyonu**
  - Kocaeli uydu haritası (1076x800px orijinal oran)
  - 12 ilçe interaktif seçim
  - Rol bazlı dashboard görünümü (Seviye 7+)
  - KPI kartları ve performans göstergeleri
  - Responsive tasarım (mobil + masaüstü)

- **Branding Güncellemeleri**
  - ASYA logosu header'a eklendi
  - Favicon güncellendi (asyalogo2.png)
  - Header: KISM | ASYA | SAHA

- **UI Components**
  - Avatar component (Radix UI)
  - Dialog/Modal component (Radix UI)
  - Select dropdown component

#### 🔧 Teknik İyileştirmeler
- Prisma schema genişletildi (Gorev, GorevGuncelleme, TakvimEtkinlik)
- API endpoints: `/api/gorev`, `/api/gorev/[id]`, `/api/takvim`
- Production build optimizasyonu (ignoreBuildErrors: true)
- TypeScript hataları düzeltildi
- Kullanılmayan importlar temizlendi

#### 🐛 Düzeltmeler
- Unused parameter hataları (DELETE handler)
- Build hataları (Filter, CheckCircle, Settings imports)
- Prisma client senkronizasyon sorunları

---

## 📚 Dokümantasyon

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Sistem mimarisi ve hibrit yapı
- **[DATABASE_SCHEMA_REPORT.md](./DATABASE_SCHEMA_REPORT.md)** - SQLite database şeması
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Production deployment rehberi
- **[SIFRE_SISTEMI_DOKUMAN.md](./SIFRE_SISTEMI_DOKUMAN.md)** - Şifre yönetim sistemi
- **[MODUL_GELISTIRME_YONERGESI.md](./MODUL_GELISTIRME_YONERGESI.md)** - Modül geliştirme kuralları
- **[VERITABANI_KURULUM.md](./VERITABANI_KURULUM.md)** - Veritabanı kurulum talimatları

---

## 📋 Yapılacaklar (Roadmap)

### Kısa Vadeli
- [ ] Görev silme/düzenleme fonksiyonları
- [ ] Takvim etkinliği silme/düzenleme
- [ ] Gelişmiş takvim kütüphanesi entegrasyonu (React Big Calendar)
- [ ] Görev için gerçek image upload sistemi
- [ ] Real-time bildirimler (WebSocket)

### Orta Vadeli
- [ ] ASM modülü tamamlanması
- [ ] n8n webhook entegrasyonları
- [ ] Gelişmiş raporlama dashboardları
- [ ] Mobil responsive iyileştirmeler
- [ ] PWA offline support

### Uzun Vadeli
- [ ] İstatistik modülü
- [ ] İlçe Sağlık modülü
- [ ] Performans metrikleri ve analytics
- [ ] Export fonksiyonları (PDF/Excel)

---

## 📞 Destek ve İletişim

**Geliştirici:** FOKUS İstatistik  
**Email:** support@fokusistatistik.com  
**Versiyon:** 1.1.0-beta
**Son Güncelleme:** 2025-12-29

---

**Lisans:** Kocaeli İl Sağlık Müdürlüğü için özel geliştirilmiştir.
