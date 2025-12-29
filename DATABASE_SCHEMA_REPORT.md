# Database Schema Raporu - Halk Sağlığı Yönetim Sistemi

**Versiyon:** 2.2 (v1.1.0 Updates)
**Tarih:** 2025-12-29
**Sistem:** Kocaeli İSM Halk Sağlığı Yönetim Platformu (SAHA)

---

## Genel Bakış

Bu sistem **hibrit database mimarisi** kullanır:

- **SQLite:** Yönetimsel işlemler (Auth, Personel, Birim, Görev, Roller/Yetkiler)
- **PostgreSQL (n8n):** Operasyonel veri girişleri (ASM, SHM, İstatistik, İlçe Sağlık)

Bu döküman **SQLite** veritabanı şemasını açıklar.

---

## SQLite Database - Genel Bilgiler

**Database Tipi:** SQLite 3
**ORM:** Prisma
**Konum:** `prisma/dev.db` (development), `/var/lib/halksagligi/prod.db` (production)
**Encoding:** UTF-8
**Auto Vacuum:** Enabled

---

## Database Tabloları

### 1. personel

Sistem kullanıcıları ve profil bilgileri.

```prisma
model Personel {
  id String @id @default(uuid())

  // KİŞİSEL BİLGİLER
  tc_kimlik_no String @unique
  ad           String
  soyad        String
  email        String @unique
  password     String // bcrypt hash
  telefon      String

  // İLİŞKİLER
  rol_id          String
  rol             Rol        @relation(fields: [rol_id], references: [id])
  birim_id        String
  birim           Birim      @relation(fields: [birim_id], references: [id])
  yonetici_id     String?
  yonetici        Personel?  @relation("YoneticiAlt", fields: [yonetici_id], references: [id], onDelete: SetNull)
  alt_personeller Personel[] @relation("YoneticiAlt")

  // OPSİYONEL BİLGİLER
  profil_foto_url String?
  sicil_no        String?
  unvan           String?
  dogum_tarihi    DateTime?
  cinsiyet        String? // Enum: ERKEK, KADIN, BELIRTMEK_ISTEMIYORUM
  adres           String?
  il              String?   @default("Kocaeli")
  ilce            String?

  // İŞ BİLGİLERİ
  ise_baslama_tarihi DateTime?
  sozlesme_turu      String? // Enum: KADROLU, SOZLESMELI, GECICI, STAJYER

  // ACİL DURUM
  acil_durum_kisi    String?
  acil_durum_telefon String?

  // SİSTEM BİLGİLERİ
  aktif            Boolean   @default(true)
  ilk_giris        Boolean   @default(true) // Şifre değişimi için
  notlar           String?
  son_giris_tarihi DateTime?
  son_giris_ip     String?

  // ZAMAN DAMGALARI
  created_at    DateTime @default(now())
  updated_at    DateTime @updatedAt
  created_by_id String?
  updated_by_id String?

  @@index([email])
  @@index([tc_kimlik_no])
  @@index([rol_id])
  @@index([birim_id])
  @@map("personel")
}
```

**Önemli Alanlar:**
- `tc_kimlik_no`: Unique, login için kullanılır
- `password`: bcrypt hash (10 rounds)
- `ilk_giris`: true ise kullanıcı şifre değiştirmek zorunda
- `rol_id`: Rol tablosuna foreign key
- `birim_id`: Birim tablosuna foreign key

**İlişkiler:**
- Her personelin bir rolü var (many-to-one)
- Her personelin bir birimi var (many-to-one)
- Personelin yöneticisi olabilir (self-referencing)

---

### 2. roller

Sistem rolleri ve seviye tanımları.

```prisma
model Rol {
  id String @id @default(uuid())

  kod      String  @unique // Sistem kodu (ADMIN, BASKAN, vb.)
  ad       String  // Görünen ad
  aciklama String?
  seviye   Int     // 1-10 arası (yüksek = daha fazla yetki)
  renk     String  @default("#64748b") // Hex renk kodu
  icon     String? // Lucide icon adı

  aktif Boolean @default(true)

  personeller Personel[]
  yetkiler    RolYetki[]

  created_at DateTime @default(now())
  updated_at DateTime @updatedAt

  @@index([kod])
  @@index([seviye])
  @@map("roller")
}
```

**Standart Roller:**

| Kod | Ad | Seviye | Kullanım |
|-----|-----|--------|----------|
| ADMIN | Admin | 10 | Tüm yetkiler, sistem yönetimi |
| BASKAN | Başkan | 9 | Halk Sağlığı Başkanı, üst düzey yönetim |
| ANALIST | Analist | 8 | Müdürlük birimlerinde veri analizi ve raporlama |
| BIRIM_YONETICISI | Birim Yöneticisi | 7 | Dış birimlerde (ASM, SHM) yönetim |
| PERSONEL | Personel | 4 | Standart çalışan, görev ve veri girişi |
| MISAFIR | Misafir | 1 | Salt okunur erişim |

---

### 3. yetkiler

Sistem yetkileri (43 adet).

```prisma
model Yetki {
  id String @id @default(uuid())

  kod      String  @unique // Örn: personel.ekle, gorev.olustur
  ad       String
  kategori String  // SISTEM, PERSONEL, BIRIM, GOREV, ASM, SHM, RAPOR, vb.
  aciklama String?

  roller RolYetki[]

  created_at DateTime @default(now())
  updated_at DateTime @updatedAt

  @@index([kod])
  @@index([kategori])
  @@map("yetkiler")
}
```

**Yetki Kategorileri:**

1. **SISTEM** (5 yetki)
   - sistem.ayarlar
   - sistem.log_goruntule
   - sistem.yedekleme
   - sistem.guncelleme
   - sistem.bakim

2. **PERSONEL** (5 yetki)
   - personel.goruntule
   - personel.ekle
   - personel.duzenle
   - personel.sil
   - personel.profil_duzenle

3. **ROL** (4 yetki)
   - rol.goruntule
   - rol.ekle
   - rol.duzenle
   - rol.yetki_ata

4. **BIRIM** (5 yetki)
   - birim.goruntule
   - birim.ekle
   - birim.duzenle
   - birim.sil
   - birim.personel_ata

5. **GOREV** (6 yetki)
   - gorev.goruntule
   - gorev.olustur
   - gorev.duzenle
   - gorev.sil
   - gorev.ata
   - gorev.devret

6. **ASM** (4 yetki)
   - asm.veri_giris
   - asm.veri_duzenle
   - asm.veri_onay
   - asm.rapor

7. **SHM** (4 yetki)
   - shm.veri_giris
   - shm.veri_duzenle
   - shm.veri_onay
   - shm.rapor

8. **RAPOR** (5 yetki)
   - rapor.gorev
   - rapor.personel
   - rapor.birim
   - rapor.asm
   - rapor.shm

9. **TAKVIM** (3 yetki)
   - takvim.goruntule
   - takvim.etkinlik_ekle
   - takvim.etkinlik_duzenle

10. **BILDIRIM** (2 yetki)
    - bildirim.gonder
    - bildirim.toplu_gonder

---

### 4. rol_yetki

Rol ve yetki ilişkileri (many-to-many).

```prisma
model RolYetki {
  rol_id   String
  rol      Rol    @relation(fields: [rol_id], references: [id], onDelete: Cascade)
  yetki_id String
  yetki    Yetki  @relation(fields: [yetki_id], references: [id], onDelete: Cascade)

  created_at DateTime @default(now())

  @@id([rol_id, yetki_id])
  @@map("rol_yetki")
}
```

**Özellikler:**
- Composite primary key (rol_id, yetki_id)
- Cascade delete (rol veya yetki silinirse ilişki de silinir)

**Rol Yetki Dağılımı:**
- **ADMIN:** 43 yetki (tümü)
- **BASKAN:** 23 yetki
- **ANALIST:** 19 yetki
- **BIRIM_YONETICISI:** 16 yetki
- **PERSONEL:** 10 yetki
- **MISAFIR:** 2 yetki (görüntüleme)

---

### 5. birimler

Organizasyon yapısı (müdürlük ve dış birimler).

```prisma
model Birim {
  id String @id @default(uuid())

  ad            String
  kod           String  @unique // Örn: KORFEZ-ASM
  tip           String  // MUDURLUK, DIS_BIRIM
  dis_birim_tip String? // ASM, HSM, VSD, ILCE_SAGLIK

  // Hiyerarşi
  ust_birim_id String?
  ust_birim    Birim?  @relation("BirimHiyerarsi", fields: [ust_birim_id], references: [id], onDelete: SetNull)
  alt_birimler Birim[] @relation("BirimHiyerarsi")

  // Sorumlu
  sorumlu_kisi_id String?

  // İletişim
  adres   String?
  telefon String?
  email   String?

  // Durum
  aktif         Boolean   @default(true)
  acilis_tarihi DateTime?
  notlar        String?

  // İlişkiler
  personeller    Personel[]
  veri_girisleri SHMVeriGiris[] @relation("BirimVeriGiris")

  created_at DateTime @default(now())
  updated_at DateTime @updatedAt

  @@index([kod])
  @@index([tip])
  @@index([dis_birim_tip])
  @@index([ust_birim_id])
  @@map("birimler")
}
```

**Birim Tipleri:**

**1. MUDURLUK**
- Merkezi yönetim birimleri
- `dis_birim_tip`: NULL
- Örnekler: Halk Sağlığı Müdürlüğü, ASM Şubesi, SHM Şubesi

**2. DIS_BIRIM**
- Sahada veri toplayan birimler
- `dis_birim_tip`: Zorunlu
- `ust_birim_id`: Zorunlu (müdürlük birimine bağlı)
- Alt tipler:
  - **ASM:** Aile Sağlığı Merkezi
  - **HSM:** Halk Sağlığı Merkezi
  - **VSD:** Verem Savaş Dispanseri
  - **ILCE_SAGLIK:** İlçe Sağlık Müdürlüğü

**Örnek Hiyerarşi:**
```
Halk Sağlığı Müdürlüğü (MUDURLUK)
├── ASM Şubesi (MUDURLUK)
│   ├── İzmit Alikahya ASM (DIS_BIRIM - ASM)
│   └── Gebze Merkez ASM (DIS_BIRIM - ASM)
├── HSM Şubesi (MUDURLUK)
│   └── Kocaeli HSM (DIS_BIRIM - HSM)
└── VSD Şubesi (MUDURLUK)
    └── Kocaeli VSD (DIS_BIRIM - VSD)
```

---

### 6. aktivite_log

Audit trail - Tüm kritik işlemler loglanır.

```prisma
model AktiviteLog {
  id String @id @default(uuid())

  personel_id    String?
  personel_email String?

  islem    String  // personel.ekle, rol.guncelle, veri.onayla, vb.
  tablo    String  // personel, rol, birim, shm_veri_giris
  kayit_id String? // İşlem yapılan kaydın ID'si
  aciklama String?

  created_at DateTime @default(now())

  @@index([personel_id])
  @@index([islem])
  @@index([created_at])
  @@map("aktivite_log")
}
```

**Loglanan İşlem Örnekleri:**
- `login` - Başarılı giriş
- `login.basarisiz` - Başarısız giriş denemesi
- `personel.ekle` - Yeni personel ekleme
- `personel.duzenle` - Personel bilgisi güncelleme
- `birim.olustur` - Yeni birim oluşturma
- `gorev.ata` - Görev atama
- `shm.veri_onay` - SHM veri onaylama
- `sifre.degistir` - Şifre değiştirme

---

### 7. password_reset_tokens

Şifre sıfırlama token'ları.

```prisma
model PasswordResetToken {
  id           String   @id @default(uuid())

  personel_id  String
  tc_kimlik_no String
  email        String

  token        String   @unique @default(uuid())
  expires_at   DateTime // 1 saat geçerli
  kullanildi   Boolean  @default(false)
  ip_adresi    String?

  created_at   DateTime @default(now())

  @@index([token])
  @@index([personel_id])
  @@map("password_reset_tokens")
}
```

**Özellikler:**
- Token UUID formatında (tahmin edilemez)
- 1 saat expire süresi
- Tek kullanımlık (`kullanildi` flag)
- IP adresi kaydı (güvenlik)

**Şifre Sıfırlama Akışı:**
```
1. Kullanıcı email + TC girer
2. Token oluşturulur, email gönderilir
3. Kullanıcı linke tıklar
4. Token doğrulanır (expire kontrolü)
5. Yeni şifre set edilir
6. Token kullanıldı olarak işaretlenir
```

---

### 8. shm_veri_giris

Dış birim veri girişleri (ASM, SHM, vb.).

**Not:** Bu tablo **yerel referans** için SQLite'ta tutulabilir, ancak asıl veriler **n8n webhook → PostgreSQL**'e gider.

```prisma
model SHMVeriGiris {
  id String @id @default(uuid())

  birim_id    String
  birim       Birim  @relation("BirimVeriGiris", fields: [birim_id], references: [id], onDelete: Cascade)
  personel_id String

  tarih DateTime
  veri  String? // JSON string (SQLite JSON desteği yok)

  aciklama String?
  notlar   String?

  // Webhook senkronizasyonu
  webhook_gonderildi      Boolean   @default(false)
  webhook_gonderim_tarihi DateTime?
  webhook_yanit           String? // JSON string

  // Onay durumu
  onay_durumu           String   @default("BEKLEMEDE") // BEKLEMEDE, ONAYLANDI, REDDEDILDI
  onaylayan_personel_id String?
  onay_tarihi           DateTime?
  onay_notu             String?
  red_gerekce           String?

  created_at    DateTime @default(now())
  updated_at    DateTime @updatedAt
  created_by_id String?
  updated_by_id String?

  @@unique([birim_id, tarih, personel_id])
  @@index([birim_id])
  @@index([personel_id])
  @@index([tarih])
  @@index([onay_durumu])
  @@map("shm_veri_giris")
}
```

**Veri Akışı:**
```
1. Frontend → API → SQLite (kayıt)
2. API → n8n webhook (async)
3. n8n → PostgreSQL (merkezi veritabanı)
4. Webhook yanıtı → SQLite (webhook_yanit)
```

**Onay Durumları:**
- **BEKLEMEDE:** Yeni girilen veri, onay bekliyor
- **ONAYLANDI:** Yetkili personel tarafından onaylandı
- **REDDEDILDI:** Yetkili personel tarafından reddedildi (`red_gerekce` zorunlu)

---

### 9. gorevler

Görev takip ve yönetim sistemi.

```prisma
model Gorev {
  id String @id @default(uuid())

  baslik      String
  aciklama    String?
  durum       String   @default("DEVAM_EDEN") // Enum: GorevDurum
  oncelik     String   @default("ORTA")     // Enum: GorevOncelik
  kategori    String?  // Enum: GorevKategori
  
  baslangic_tarihi DateTime?
  bitis_tarihi     DateTime?
  is_suresiz       Boolean   @default(false) // Bitiş tarihi olmayan işler
  
  tamamlanma_tarihi DateTime?
  tamamlayan_id     String?
  tamamlanma_notu   String?

  // İLİŞKİLER
  olusturan_id String
  olusturan    Personel @relation("OlusturanGorev", fields: [olusturan_id], references: [id])
  
  sorumlu_id   String
  sorumlu      Personel @relation("SorumluGorev", fields: [sorumlu_id], references: [id])

  destek_verenler Personel[] @relation("DestekVerenGorev") // Many-to-many

  birim_id     String?
  birim        Birim?   @relation(fields: [birim_id], references: [id])

  // Geri bildirimler ve görseller
  guncellemeler GorevGuncelleme[]
  
  // Görsel alanları (URL)
  gorsel_1     String?
  gorsel_2     String?
  gorsel_3     String?

  created_at DateTime @default(now())
  updated_at DateTime @updatedAt

  @@index([sorumlu_id])
  @@index([olusturan_id])
  @@index([durum])
  @@map("gorevler")
}
```

**Önemli Alanlar:**
- `durum`: Görevin anlık durumu (Varsayılan: DEVAM_EDEN)
- `is_suresiz`: Sürekli devam eden, bitiş tarihi olmayan rutin işler için
- `sorumlu_id`: Görevi yapacak asıl personel
- `destek_verenler`: Göreve yardımcı olacak diğer personeller (Çoklu seçim)
- `olusturan_id`: Görevi veren yönetici/personel

---

### 10. gorev_guncellemeleri

Görevler üzerindeki ilerleme notları ve dosya ekleri.

```prisma
model GorevGuncelleme {
  id String @id @default(uuid())
  
  gorev_id    String
  gorev       Gorev    @relation(fields: [gorev_id], references: [id], onDelete: Cascade)
  
  personel_id String
  personel    Personel @relation(fields: [personel_id], references: [id])
  
  mesaj       String
  gorsel_url  String?
  
  created_at DateTime @default(now())

  @@index([gorev_id])
  @@map("gorev_guncellemeleri")
}
```

---

### 11. takvim_etkinlikleri

Kişisel ve birim bazlı takvim etkinlikleri.

```prisma
model TakvimEtkinlik {
  id String @id @default(uuid())

  baslik      String
  aciklama    String?
  tip         String   // Enum: EtkinlikTip
  renk        String?  // Frontend için hex renk
  
  baslangic   DateTime
  bitis       DateTime
  
  tum_gun     Boolean @default(false)

  // İLİŞKİLER
  personel_id String
  personel    Personel @relation("PersonelEtkinlik", fields: [personel_id], references: [id], onDelete: Cascade)
  
  olusturan_id String
  olusturan    Personel @relation("OlusturanEtkinlik", fields: [olusturan_id], references: [id])

  created_at DateTime @default(now())
  updated_at DateTime @updatedAt

  @@index([personel_id])
  @@index([baslangic])
  @@map("takvim_etkinlikleri")
}
```

---


## Enum Tipleri

SQLite native enum desteklemez, string olarak saklanır.

### Cinsiyet
```typescript
type Cinsiyet = 'ERKEK' | 'KADIN' | 'BELIRTMEK_ISTEMIYORUM';
```

### Sözleşme Türü
```typescript
type SozlesmeTuru = 'KADROLU' | 'SOZLESMELI' | 'GECICI' | 'STAJYER';
```

### Birim Tipi
```typescript
type BirimTip = 'MUDURLUK' | 'DIS_BIRIM';
```

### Dış Birim Tipi
```typescript
type DisBirimTip = 'ASM' | 'HSM' | 'VSD' | 'ILCE_SAGLIK';
```

### Onay Durumu
```typescript
type OnayDurumu = 'BEKLEMEDE' | 'ONAYLANDI' | 'REDDEDILDI';
```

---

### Görev Durumları
```typescript
type GorevDurum = 'DEVAM_EDEN' | 'TAMAMLANDI' | 'IPTAL';
// Not: BEKLEYEN durumu v2.1 itibariyle kaldırılmış ve DEVAM_EDEN ile birleştirilmiştir.
```

### Görev Öncelikleri
```typescript
type GorevOncelik = 'DUSUK' | 'ORTA' | 'YUKSEK' | 'ACIL';
```

### Görev Kategorileri
```typescript
type GorevKategori = 'DENETIM' | 'EGITIM' | 'TOPLANTI' | 'DIGER';
```

### Etkinlik Tipleri
```typescript
type EtkinlikTip = 'TOPLANTI' | 'EGITIM' | 'IZIN' | 'DENETIM' | 'DIGER';
```

---


## İndeksler ve Performans

### Önemli İndeksler

**personel tablosu:**
- `email` (unique, login için)
- `tc_kimlik_no` (unique, login için)
- `rol_id` (foreign key)
- `birim_id` (foreign key)

**roller tablosu:**
- `kod` (unique)
- `seviye` (sıralama ve filtreleme)

**birimler tablosu:**
- `kod` (unique)
- `tip` (filtreleme)
- `dis_birim_tip` (filtreleme)
- `ust_birim_id` (hiyerarşi sorguları)

**shm_veri_giris tablosu:**
- `birim_id` (filtreleme)
- `tarih` (tarih aralığı sorguları)
- `onay_durumu` (durum filtreleme)
- Composite unique: `(birim_id, tarih, personel_id)`

**aktivite_log tablosu:**
- `personel_id` (kullanıcı logları)
- `islem` (işlem tipi filtreleme)
- `created_at` (tarih sıralama)

---

## Veri Bütünlüğü Kuralları

### Cascade Delete

**Rol silindiğinde:**
- `rol_yetki` ilişkileri silinir (Cascade)
- ❌ Personelleri olan rol silinemez (constraint check)

**Birim silindiğinde:**
- ❌ Personelleri olan birim silinemez (constraint check)
- `shm_veri_giris` kayıtları silinir (Cascade)

**Personel silindiğinde:**
- `yonetici_id` NULL yapılır (SetNull)

### Unique Constraints

- `personel.tc_kimlik_no` - Tekrar eden TC olamaz
- `personel.email` - Tekrar eden email olamaz
- `roller.kod` - Tekrar eden rol kodu olamaz
- `birimler.kod` - Tekrar eden birim kodu olamaz
- `yetkiler.kod` - Tekrar eden yetki kodu olamaz
- `shm_veri_giris.(birim_id, tarih, personel_id)` - Aynı gün, aynı birim, aynı personel tek kayıt

---

## Seed Data

### Roller (6 adet)

```sql
INSERT INTO roller (kod, ad, seviye) VALUES
  ('ADMIN', 'Admin', 10),
  ('BASKAN', 'Başkan', 9),
  ('ANALIST', 'Analist', 8),
  ('BIRIM_YONETICISI', 'Birim Yöneticisi', 7),
  ('PERSONEL', 'Personel', 4),
  ('MISAFIR', 'Misafir', 1);
```

### Yetkiler (43 adet)

10 kategori altında 43 yetki tanımı.

### Birimler (Örnek)

```sql
-- Müdürlük
INSERT INTO birimler (ad, kod, tip) VALUES
  ('Halk Sağlığı Müdürlüğü', 'HSM', 'MUDURLUK'),
  ('ASM Şubesi', 'ASM-SUBE', 'MUDURLUK'),
  ('SHM Şubesi', 'SHM-SUBE', 'MUDURLUK');

-- Dış Birimler
INSERT INTO birimler (ad, kod, tip, dis_birim_tip, ust_birim_id) VALUES
  ('İzmit Alikahya ASM', 'IZMIT-ALIKAHYA-ASM', 'DIS_BIRIM', 'ASM', 'asm_sube_id'),
  ('Gebze Merkez ASM', 'GEBZE-MERKEZ-ASM', 'DIS_BIRIM', 'ASM', 'asm_sube_id');
```

### Admin Kullanıcı

```sql
INSERT INTO personel (tc_kimlik_no, ad, soyad, email, password, rol_id, birim_id) VALUES
  ('12345678901', 'Admin', 'User', 'admin@saglik.gov.tr', '$2a$10$...', 'admin_rol_id', 'hsm_id');
```

**Şifre:** `admin123` (bcrypt hash)

---

## Migration Stratejisi

### Development

```bash
# Schema değişikliği yap
npx prisma migrate dev --name degisiklik_aciklamasi

# Client yeniden generate et
npx prisma generate
```

### Production

```bash
# Migration uygula
npx prisma migrate deploy

# Client generate
npx prisma generate
```

---

## Backup Stratejisi

### SQLite Backup

```bash
# Veritabanı kopyala
cp prisma/dev.db backups/backup_$(date +%Y%m%d_%H%M%S).db

# Veya
sqlite3 prisma/dev.db ".backup 'backups/backup.db'"
```

### Otomatik Backup (Cron)

```bash
# /etc/crontab
0 2 * * * /usr/local/bin/backup-halksagligi.sh
```

**backup-halksagligi.sh:**
```bash
#!/bin/bash
BACKUP_DIR="/var/backups/halksagligi"
DATE=$(date +%Y%m%d_%H%M%S)
DB_PATH="/var/lib/halksagligi/prod.db"

mkdir -p $BACKUP_DIR
cp $DB_PATH $BACKUP_DIR/backup_$DATE.db

# 30 günden eski backup'ları sil
find $BACKUP_DIR -name "backup_*.db" -mtime +30 -delete
```

---

## Güvenlik

### Şifre Güvenliği
- bcrypt hash (10 rounds)
- Minimum 8 karakter
- En az 1 büyük, 1 küçük harf, 1 rakam zorunlu

### Session Güvenliği
- JWT token (NextAuth.js)
- 30 gün expiry
- httpOnly cookies
- sameSite: 'lax' (CSRF koruması)

### Veri Güvenliği
- Prisma ORM (SQL injection koruması)
- Input validation (Zod schemas)
- Rate limiting (login, password reset)

### Audit Trail
- Tüm kritik işlemler `aktivite_log` tablosuna kaydedilir
- IP adresi ve timestamp tracking

---

## Performans Optimizasyonu

### Connection Pooling

Prisma default pool size: 10 connection

```typescript
// lib/prisma.ts
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});
```

### Query Optimizasyonu

```typescript
// İlişkileri gerektiğinde include et
const personel = await prisma.personel.findUnique({
  where: { id },
  include: {
    rol: true,
    birim: true,
  }
});

// Sadece gerekli alanları seç
const personeller = await prisma.personel.findMany({
  select: {
    id: true,
    ad: true,
    soyad: true,
    email: true,
  }
});
```

---

## Genişletme ve Ölçeklenebilirlik

### Yeni Birim Tipi Ekleme

1. `DisBirimTip` enum'una ekle (types/index.ts)
2. Frontend'de label ekle
3. Seed dosyasına müdürlük şubesi ekle

### Yeni Rol Ekleme

1. `prisma/seed.ts`'ye rol ekle
2. Yetkileri tanımla (`rol_yetki` ilişkisi)
3. Frontend'de rol kontrolü ekle

### Yeni Yetki Ekleme

1. `prisma/seed.ts`'ye yetki ekle
2. Kategoriye göre sınıflandır
3. Rollere ata

---

## Sorun Giderme

### Migration Hataları

```bash
# Migration'ları sıfırla
npx prisma migrate reset

# Seed data'yı yeniden çalıştır
npm run db:seed
```

### Prisma Client Hataları

```bash
# Cache temizle
rm -rf node_modules/.prisma
npx prisma generate
```

### Database Lock

```bash
# SQLite database lock'u çöz
fuser -k prisma/dev.db
```

---

## Dokümantasyon Linkleri

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Hibrit mimari ve sistem yapısı
- **[README.md](./README.md)** - Ana proje dokümanı
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Production deployment
- **[VERITABANI_KURULUM.md](./VERITABANI_KURULUM.md)** - Kurulum talimatları

---

**Rapor Sonu**

**Versiyon:** 2.1 (SQLite + Görev/Takvim)
**Son Güncelleme:** 2025-12-26
**Geliştirici:** FOKUS İstatistik

**Not:** Bu rapor Gorev, GorevGuncelleme ve TakvimEtkinlik modellerini içermektedir.
