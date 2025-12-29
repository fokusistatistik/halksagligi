# Sistem Mimarisi - Kocaeli İl Sağlık Müdürlüğü Halk Sağlığı Yönetim Sistemi

**Versiyon:** 1.1.0
**Tarih:** 2025-12-29
**Geliştirici:** FOKUS İstatistik

---

## 📐 Genel Bakış

Bu sistem, **hibrit mimari** yaklaşımı ile geliştirilmiştir. Yönetimsel işlemler yerel veritabanında (SQLite), operasyonel veri girişleri ise merkezi webhook sistemi (n8n) üzerinden yönetilir.

---

## 🏗️ Mimari Yapı

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT (Next.js 14)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Admin      │  │    Görev     │  │  Operasyonel │      │
│  │   Paneli     │  │   Yönetimi   │  │   Modüller   │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
└─────────┼──────────────────┼──────────────────┼─────────────┘
          │                  │                  │
          ▼                  ▼                  ▼
┌─────────────────────┐            ┌─────────────────────────┐
│   SQLite Database   │            │  n8n Webhook System     │
│   (Yerel Yönetim)   │            │  (Operasyonel Veriler)  │
├─────────────────────┤            ├─────────────────────────┤
│ • Auth (NextAuth)   │            │ • ASM Veri Girişi       │
│ • Personel          │            │ • SHM Veri Girişi       │
│ • Birimler          │            │ • İstatistik Modülü     │
│ • Roller & Yetkiler │            │ • İlçe Sağlık Modülü    │
│ • Görev Yönetimi    │            │ • Onay İşlemleri        │
│ • Takvim            │            │ • PostgreSQL Backend    │
│ • Aktivite Log      │            │ • Raporlama API         │
└─────────────────────┘            └─────────────────────────┘
```

---

## 🗄️ Database Stratejisi

### SQLite (Yerel Veritabanı)

**Amaç:** Yönetimsel ve kimlik doğrulama işlemleri

**Tablolar:**
- `personel` - Kullanıcı hesapları ve profil bilgileri
- `roller` - Rol tanımları (ADMIN, BASKAN, ANALIST, vb.)
- `yetkiler` - Yetki tanımları
- `rol_yetki` - Rol-Yetki ilişkileri
- `birimler` - Organizasyonel birim yapısı
- `aktivite_log` - Sistem audit logları
- `password_reset_tokens` - Şifre sıfırlama token'ları

**Avantajları:**
- ✅ Hızlı auth işlemleri (yerel)
- ✅ Kurulum kolaylığı
- ✅ Yedekleme basitliği
- ✅ Zero-latency yönetim işlemleri

**Kullanım Senaryoları:**
- Kullanıcı girişi (NextAuth.js)
- Admin paneli işlemleri
- Görev oluşturma/atama
- Takvim yönetimi
- Profil güncellemeleri

---

### n8n Webhook (PostgreSQL Backend)

**Amaç:** Operasyonel veri girişi ve raporlama

**Endpoint:** `https://n8n.fokusistatistik.com/webhook`

**Modüller:**
1. **ASM (Aile Sağlığı Merkezi)**
   - Günlük veri girişi
   - Muayene, aşı, gebe takip verileri
   - Onay akışı

2. **SHM (Sağlık Hizmetleri Müdürlüğü)**
   - Alt birim veri yönetimi
   - Toplu veri girişi
   - İstatistiksel raporlama

3. **İstatistik Modülü**
   - Veri analizi
   - Grafiksel raporlar
   - Periyodik raporlama

4. **İlçe Sağlık Modülü**
   - İlçe bazlı veri toplama
   - Merkezi raporlama
   - Veri konsolidasyonu

**Avantajları:**
- ✅ Merkezi veri yönetimi
- ✅ Workflow automation
- ✅ Gelişmiş raporlama (PostgreSQL)
- ✅ Ölçeklenebilirlik
- ✅ Veri bütünlüğü ve yedekleme

**Veri Akışı:**
```
Client → API Proxy → n8n Webhook → PostgreSQL
                         ↓
                    Onay Sistemi
                         ↓
                    Email/SMS Bildirimleri
```

---

## 🔐 Kimlik Doğrulama Mimarisi

### NextAuth.js (Credentials Provider)

**Akış:**
```
1. Kullanıcı TC Kimlik No + Şifre girer
   ↓
2. NextAuth CredentialsProvider tetiklenir
   ↓
3. SQLite'dan personel kaydı sorgulanır
   ↓
4. bcryptjs ile şifre doğrulanır
   ↓
5. JWT token oluşturulur
   ↓
6. Session cookie set edilir
   ↓
7. Middleware her request'te session kontrolü yapar
```

**Özellikler:**
- ✅ JWT tabanlı session (30 gün)
- ✅ İlk giriş şifre değiştirme zorunluluğu
- ✅ Şifre sıfırlama email sistemi
- ✅ Rol tabanlı erişim kontrolü (RBAC)
- ✅ Birim bazlı veri izolasyonu

**Güvenlik:**
- bcrypt hash (10 rounds)
- httpOnly cookies
- CSRF koruması (sameSite: 'lax')
- Rate limiting (login, password reset)
- Audit logging (tüm auth işlemleri)

---

## 📦 Modül Yapısı

### 1. Yönetim Modülleri (SQLite)

#### A. Admin Paneli
**Konum:** `/app/admin`

**Özellikler:**
- Kullanıcı yönetimi (CRUD)
- Birim yönetimi (organizasyon yapısı)
- Rol ve yetki tanımlama
- Sistem ayarları
- Aktivite logları görüntüleme

**Yetkiler:**
- Sadece ADMIN rolü tam erişim
- BASKAN rolü kısıtlı erişim (raporlama)

---

#### B. Görev Yönetimi Modülü
**Konum:** `/app/mudurluk/gorev-yonetim`

**Özellikler:**
- Görev oluşturma ve atama
- Görev durumu takibi (beklemede, devam ediyor, tamamlandı)
- Öncelik yönetimi (düşük, orta, yüksek, acil)
- Görev devretme sistemi
- Takvim entegrasyonu
- Yorum ve not ekleme
- Dosya eklentileri

**Roller:**
- ADMIN, BASKAN: Tüm görevleri görebilir, atayabilir
- ANALIST: Kendi birimindeki görevleri yönetir
- BIRIM_YONETICISI: Kendi birimindeki görevleri görür
- PERSONEL: Kendine atanan görevleri görür

**Veri Yapısı:**
```typescript
interface Gorev {
  id: string;
  baslik: string;
  aciklama: string;
  durum: 'DEVAM_EDEN' | 'TAMAMLANDI' | 'IPTAL';
  oncelik: 'DUSUK' | 'ORTA' | 'YUKSEK' | 'ACIL';
  sorumlu_id: string;
  olusturan_id: string;
  destek_verenler: string[]; // ID listesi
  birim_id: string;
  baslangic_tarihi: Date;
  bitis_tarihi?: Date;
  is_suresiz: boolean;
}
```

---

### 2. Operasyonel Modüller (n8n Webhook)

#### A. ASM Modülü
**Konum:** `/app/asm` (Geliştirilecek)

**Durum:** 🚧 Arayüz hazırlanıyor, webhook entegrasyonu yapılacak

**Veri Girişi:**
- Günlük muayene sayıları
- Aşı uygulamaları
- Gebe takip verileri
- Bebek izlem
- Kronik hasta takip
- Ev ziyaretleri
- Sağlık taramaları

**Webhook Endpoint:** `/webhook/asm-veri-giris`

**Onay Akışı:**
```
ASM Personeli → Veri Girişi (BEKLEMEDE)
                    ↓
ASM Yöneticisi → Onay/Red
                    ↓
ONAYLANDI → PostgreSQL kayıt → Raporlamaya dahil
```

---

#### B. SHM Modülü
**Konum:** `/app/shm` (Kısmi hazır)

**Durum:** 🔄 Basit veri girişi mevcut, geliştirilecek

**Mevcut Sayfalar:**
- `/app/shm/veri-giris` - Veri giriş formu
- `/app/shm/liste` - Girilen veriler listesi
- `/app/shm/rapor` - Basit raporlama

**Webhook Endpoints:**
- `/webhook/shm-veri-giris` - Yeni veri
- `/webhook/shm-veri-guncelle` - Güncelleme
- `/webhook/shm-veri-onay` - Onay işlemi

**Veri Yapısı:**
```typescript
interface SHMVeriGiris {
  birim_id: string;
  personel_id: string;
  tarih: Date;
  veri: Record<string, any>; // Esnek JSON yapı
  onay_durumu: 'BEKLEMEDE' | 'ONAYLANDI' | 'REDDEDILDI';
  red_gerekce?: string;
}
```

---

#### C. İstatistik Modülü
**Konum:** `/app/istatistik` (Planlanıyor)

**Durum:** ⏳ Henüz hazır değil

**Planlanan Özellikler:**
- Veri analiz dashboardları
- Grafiksel raporlar (Recharts)
- Karşılaştırmalı analizler
- Trend analizi
- Export (PDF, Excel, CSV)

**Webhook Endpoint:** `/webhook/istatistik-rapor`

---

#### D. İlçe Sağlık Modülü
**Konum:** `/app/ilce-saglik` (Planlanıyor)

**Durum:** ⏳ Henüz hazır değil

**Planlanan Özellikler:**
- İlçe bazlı veri toplama
- Saha ekipleri yönetimi
- Mobil veri girişi desteği
- Coğrafi haritalar
- İlçe performans raporları

**Webhook Endpoint:** `/webhook/ilce-saglik-veri`

---

## 🔄 Veri Senkronizasyonu

### SQLite → n8n Webhook Entegrasyonu

**Senaryo:** Görev atama sonrası bildirim

```
1. Admin görev oluşturur (SQLite)
   ↓
2. API `/api/webhook-proxy/gorev` tetiklenir
   ↓
3. n8n webhook'a görev detayları gönderilir
   ↓
4. n8n email/SMS bildirimi gönderir
   ↓
5. n8n PostgreSQL'e de kaydeder (yedek)
```

**Webhook Proxy Yapısı:**
```typescript
// app/api/webhook-proxy/gorev/route.ts
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const gorev = await req.json();

  // n8n'e gönder
  const response = await fetch(`${N8N_URL}/webhook/gorev-olustur`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      gorev,
      auth: {
        user_id: session.user.id,
        user_name: session.user.name,
        // ...
      }
    })
  });

  return response;
}
```

---

## 🛡️ Güvenlik Katmanları

### 1. Authentication Layer (NextAuth)
- JWT token validation
- Session expiry kontrolü
- Şifre politikası enforcement

### 2. Authorization Layer (RBAC)
```typescript
// lib/auth/permissions.ts
const PERMISSIONS = {
  'gorev.olustur': ['ADMIN', 'BASKAN', 'ANALIST'],
  'gorev.sil': ['ADMIN', 'BASKAN'],
  'personel.ekle': ['ADMIN'],
  'shm.veri_giris': ['ADMIN', 'BASKAN', 'ANALIST', 'BIRIM_YONETICISI'],
  'shm.veri_onay': ['ADMIN', 'BASKAN', 'ANALIST', 'BIRIM_YONETICISI'],
  // ...
};
```

### 3. Data Isolation (Birim Bazlı)
```typescript
// Kullanıcı sadece kendi biriminin verilerini görebilir
const veriler = await prisma.sHMVeriGiris.findMany({
  where: {
    birim_id: session.user.birim.id // Otomatik filtre
  }
});
```

### 4. Audit Trail
- Tüm kritik işlemler loglanır
- Kim, ne, ne zaman, nereden
- IP adresi ve User-Agent kaydı

---

## 📊 Performans ve Ölçeklenebilirlik

### SQLite Optimizasyonları
- Index'leme stratejisi
- Connection pooling (Prisma)
- Query optimization

### n8n Webhook Optimizasyonları
- Async işlemler (await olmadan)
- Retry mekanizması (exponential backoff)
- Rate limiting
- Response caching

### Frontend Optimizasyonları
- Server-side rendering (Next.js)
- React Query caching
- Lazy loading
- Code splitting
- PWA desteği

---

## 🚀 Deployment Stratejisi

### Development
```bash
# SQLite local
DATABASE_URL="file:./dev.db"

# n8n test environment
N8N_WEBHOOK_URL="https://n8n-test.fokusistatistik.com"
```

### Production
```bash
# SQLite production
DATABASE_URL="file:/var/lib/halksagligi/prod.db"

# n8n production
N8N_WEBHOOK_URL="https://n8n.fokusistatistik.com"

# NextAuth secrets
NEXTAUTH_SECRET="<strong-secret>"
NEXTAUTH_URL="https://halksagligi.kocaeli.saglik.gov.tr"
```

---

## 🔮 Gelecek Geliştirmeler

### Kısa Vadeli (Q1 2025)
- [ ] ASM modülü tamamlanması
- [ ] İstatistik modülü geliştirme
- [ ] Mobil responsive iyileştirmeler
- [ ] PWA offline support

### Orta Vadeli (Q2 2025)
- [ ] İlçe Sağlık modülü
- [ ] Gelişmiş raporlama dashboardları
- [ ] Real-time bildirimler (WebSocket)
- [ ] Dosya yönetimi sistemi

### Uzun Vadeli (2025+)
- [ ] AI destekli veri analizi
- [ ] Tahminsel raporlama
- [ ] Mobil uygulama (React Native)
- [ ] API gateway (mikroservis mimarisi)

---

## 📞 Teknik Destek

**Geliştirici:** FOKUS İstatistik
**Email:** support@fokusistatistik.com
**Versiyon:** 1.0.0
**Son Güncelleme:** 2025-12-24

---

**Notlar:**
- Bu doküman sistem mimarisinin genel yapısını açıklar
- Detaylı API dokümanları için `API.md` (geliştirilecek)
- Database schema için `DATABASE_SCHEMA_REPORT.md`
- Deployment için `DEPLOYMENT.md`
