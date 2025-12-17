# 📊 DATABASE SCHEMA & PERMISSIONS REPORT
## Kocaeli İl Sağlık Müdürlüğü - SAHA Sistemi

> **Oluşturulma Tarihi:** 2025-12-17
> **Database:** PostgreSQL
> **ORM:** Prisma 5.22.0

---

## 📋 İÇİNDEKİLER

1. [Database Tabloları](#-database-tabloları)
2. [Rol Sistemi](#-rol-sistemi)
3. [Yetki Sistemi](#-yetki-sistemi)
4. [Enum Değerleri](#-enum-değerleri)
5. [İlişkiler ve Kısıtlar](#-i̇lişkiler-ve-kısıtlar)
6. [Kullanım Örnekleri](#-kullanım-örnekleri)

---

## 🗄️ DATABASE TABLOLARI

### 1. **personel** (Kullanıcılar)
Sistemdeki tüm çalışanların bilgilerini tutar.

| Alan | Tip | Zorunlu | Açıklama |
|------|-----|---------|----------|
| `id` | UUID | ✅ | Primary Key |
| `tc_kimlik_no` | VARCHAR(11) | ✅ | Unique, TC Kimlik No |
| `ad` | VARCHAR(50) | ✅ | İsim |
| `soyad` | VARCHAR(50) | ✅ | Soyisim |
| `email` | VARCHAR(100) | ✅ | Unique, Email |
| `password` | VARCHAR(255) | ✅ | Bcrypt hash |
| `telefon` | VARCHAR(15) | ✅ | Telefon |
| `rol_id` | UUID | ✅ | FK → roller |
| `birim_id` | UUID | ✅ | FK → birimler |
| `yonetici_id` | UUID | ❌ | Self FK, Yöneticisi |
| `profil_foto_url` | VARCHAR(255) | ❌ | Profil fotoğrafı |
| `sicil_no` | VARCHAR(50) | ❌ | Sicil numarası |
| `unvan` | VARCHAR(100) | ❌ | Unvan |
| `dogum_tarihi` | DATE | ❌ | Doğum tarihi |
| `cinsiyet` | ENUM | ❌ | ERKEK/KADIN/BELIRTMEK_ISTEMIYORUM |
| `adres` | TEXT | ❌ | Adres |
| `il` | VARCHAR(50) | ❌ | İl (default: Kocaeli) |
| `ilce` | VARCHAR(50) | ❌ | İlçe |
| `ise_baslama_tarihi` | DATE | ❌ | İşe başlama |
| `sozlesme_turu` | ENUM | ❌ | KADROLU/SOZLESMELI/GECICI/STAJYER |
| `acil_durum_kisi` | VARCHAR(100) | ❌ | Acil durum kişisi |
| `acil_durum_telefon` | VARCHAR(15) | ❌ | Acil telefon |
| `aktif` | BOOLEAN | ✅ | Aktif mi? (default: true) |
| `ilk_giris` | BOOLEAN | ✅ | İlk giriş mi? (default: true) |
| `notlar` | TEXT | ❌ | Notlar |
| `son_giris_tarihi` | TIMESTAMP | ❌ | Son giriş tarihi |
| `son_giris_ip` | VARCHAR(45) | ❌ | Son giriş IP |
| `created_at` | TIMESTAMP | ✅ | Oluşturulma |
| `updated_at` | TIMESTAMP | ✅ | Güncellenme |

**İndeksler:**
- `email` (unique)
- `tc_kimlik_no` (unique)
- `rol_id`
- `birim_id`

---

### 2. **roller** (Roles)
Kullanıcı rollerini tanımlar.

| Alan | Tip | Zorunlu | Açıklama |
|------|-----|---------|----------|
| `id` | UUID | ✅ | Primary Key |
| `kod` | VARCHAR(50) | ✅ | Unique, Sistem kodu (ADMIN, BASKAN, vb.) |
| `ad` | VARCHAR(100) | ✅ | Görünen ad |
| `aciklama` | TEXT | ❌ | Açıklama |
| `seviye` | INTEGER | ✅ | Yetki seviyesi (1-10) |
| `renk` | VARCHAR(7) | ✅ | Hex renk kodu (default: #64748b) |
| `icon` | VARCHAR(50) | ❌ | Lucide icon adı |
| `aktif` | BOOLEAN | ✅ | Aktif mi? (default: true) |
| `created_at` | TIMESTAMP | ✅ | Oluşturulma |
| `updated_at` | TIMESTAMP | ✅ | Güncellenme |

**İndeksler:**
- `kod` (unique)
- `seviye`

---

### 3. **yetkiler** (Permissions)
Sistemdeki tüm yetkileri tanımlar.

| Alan | Tip | Zorunlu | Açıklama |
|------|-----|---------|----------|
| `id` | UUID | ✅ | Primary Key |
| `kod` | VARCHAR(100) | ✅ | Unique, Yetki kodu (personel.ekle) |
| `ad` | VARCHAR(100) | ✅ | Görünen ad |
| `kategori` | VARCHAR(50) | ✅ | Kategori (SISTEM, PERSONEL, BIRIM, vb.) |
| `aciklama` | TEXT | ❌ | Açıklama |
| `created_at` | TIMESTAMP | ✅ | Oluşturulma |
| `updated_at` | TIMESTAMP | ✅ | Güncellenme |

**İndeksler:**
- `kod` (unique)
- `kategori`

---

### 4. **rol_yetki** (Role-Permission Junction)
Rollerin hangi yetkilere sahip olduğunu tanımlar.

| Alan | Tip | Zorunlu | Açıklama |
|------|-----|---------|----------|
| `rol_id` | UUID | ✅ | FK → roller |
| `yetki_id` | UUID | ✅ | FK → yetkiler |
| `created_at` | TIMESTAMP | ✅ | Oluşturulma |

**Composite Primary Key:** `[rol_id, yetki_id]`

---

### 5. **birimler** (Units/Departments)
Tüm birimleri (ASM, SHM, vb.) tanımlar.

| Alan | Tip | Zorunlu | Açıklama |
|------|-----|---------|----------|
| `id` | UUID | ✅ | Primary Key |
| `ad` | VARCHAR(200) | ✅ | Birim adı |
| `kod` | VARCHAR(50) | ✅ | Unique, Birim kodu |
| `tip` | ENUM | ✅ | Birim tipi |
| `ust_birim_id` | UUID | ❌ | Self FK, Üst birim |
| `sorumlu_kisi_id` | UUID | ❌ | Sorumlu kişi |
| `adres` | TEXT | ❌ | Adres |
| `telefon` | VARCHAR(15) | ❌ | Telefon |
| `email` | VARCHAR(100) | ❌ | Email |
| `aktif` | BOOLEAN | ✅ | Aktif mi? (default: true) |
| `acilis_tarihi` | DATE | ❌ | Açılış tarihi |
| `notlar` | TEXT | ❌ | Notlar |
| `created_at` | TIMESTAMP | ✅ | Oluşturulma |
| `updated_at` | TIMESTAMP | ✅ | Güncellenme |

**İndeksler:**
- `kod` (unique)
- `tip`
- `ust_birim_id`

---

### 6. **shm_alt_birimler** (SHM Sub-Units)
SHM'lerin alt birimlerini tanımlar.

| Alan | Tip | Zorunlu | Açıklama |
|------|-----|---------|----------|
| `id` | UUID | ✅ | Primary Key |
| `ad` | VARCHAR(200) | ✅ | Alt birim adı |
| `kod` | VARCHAR(50) | ✅ | Unique, Alt birim kodu |
| `tip` | ENUM | ✅ | Alt birim tipi |
| `shm_birim_id` | UUID | ✅ | FK → birimler |
| `sorumlu_id` | UUID | ❌ | Sorumlu personel |
| `sorumlu_ad` | VARCHAR(100) | ❌ | Sorumlu adı |
| `sorumlu_unvan` | VARCHAR(100) | ❌ | Sorumlu unvanı |
| `aktif` | BOOLEAN | ✅ | Aktif mi? (default: true) |
| `aciklama` | TEXT | ❌ | Açıklama |
| `created_at` | TIMESTAMP | ✅ | Oluşturulma |
| `updated_at` | TIMESTAMP | ✅ | Güncellenme |

**İndeksler:**
- `kod` (unique)
- `shm_birim_id`
- `tip`

---

### 7. **shm_veri_giris** (SHM Data Entry)
SHM veri girişlerini tutar.

| Alan | Tip | Zorunlu | Açıklama |
|------|-----|---------|----------|
| `id` | UUID | ✅ | Primary Key |
| `shm_alt_birim_id` | UUID | ✅ | FK → shm_alt_birimler |
| `personel_id` | UUID | ✅ | Veri giren personel |
| `tarih` | DATE | ✅ | Veri tarihi |
| `poliklinik_islem_sayisi` | INTEGER | ✅ | İşlem sayısı (default: 0) |
| `poliklinik_kontrol_sayisi` | INTEGER | ✅ | Kontrol sayısı (default: 0) |
| `brans_verileri` | JSON | ❌ | Branş bazlı veriler |
| `sorumlu_adi` | VARCHAR(100) | ❌ | Sorumlu adı |
| `sorumlu_unvan` | VARCHAR(100) | ❌ | Sorumlu unvanı |
| `aciklama` | TEXT | ❌ | Açıklama |
| `notlar` | TEXT | ❌ | Notlar |
| `webhook_gonderildi` | BOOLEAN | ✅ | Webhook gönderildi mi? |
| `webhook_gonderim_tarihi` | TIMESTAMP | ❌ | Webhook tarihi |
| `webhook_yanit` | JSON | ❌ | Webhook yanıtı |
| `onay_durumu` | ENUM | ✅ | BEKLEMEDE/ONAYLANDI/REDDEDILDI |
| `onaylayan_personel_id` | UUID | ❌ | Onaylayan personel |
| `onay_tarihi` | TIMESTAMP | ❌ | Onay tarihi |
| `onay_notu` | TEXT | ❌ | Onay notu |
| `created_at` | TIMESTAMP | ✅ | Oluşturulma |
| `updated_at` | TIMESTAMP | ✅ | Güncellenme |

**Unique Constraint:** `[shm_alt_birim_id, tarih, personel_id]`

**İndeksler:**
- `shm_alt_birim_id`
- `personel_id`
- `tarih`
- `onay_durumu`

---

### 8. **aktivite_log** (Audit Trail)
Tüm sistem işlemlerini loglar.

| Alan | Tip | Zorunlu | Açıklama |
|------|-----|---------|----------|
| `id` | UUID | ✅ | Primary Key |
| `personel_id` | UUID | ❌ | İşlem yapan personel |
| `personel_email` | VARCHAR(100) | ❌ | Personel email |
| `islem` | VARCHAR(100) | ✅ | İşlem tipi (personel.ekle) |
| `tablo` | VARCHAR(50) | ✅ | Tablo adı |
| `kayit_id` | VARCHAR(255) | ❌ | İşlem yapılan kayıt ID |
| `eski_veri` | JSON | ❌ | İşlem öncesi veri |
| `yeni_veri` | JSON | ❌ | İşlem sonrası veri |
| `aciklama` | TEXT | ❌ | Açıklama |
| `ip_adresi` | VARCHAR(45) | ❌ | IP adresi |
| `user_agent` | VARCHAR(255) | ❌ | User agent |
| `created_at` | TIMESTAMP | ✅ | Oluşturulma |

**İndeksler:**
- `personel_id`
- `islem`
- `created_at`

---

### 9. **password_reset_tokens** (Password Reset)
Şifre sıfırlama tokenlerini tutar.

| Alan | Tip | Zorunlu | Açıklama |
|------|-----|---------|----------|
| `id` | UUID | ✅ | Primary Key |
| `personel_id` | UUID | ✅ | Personel ID |
| `tc_kimlik_no` | VARCHAR(11) | ✅ | TC Kimlik No |
| `email` | VARCHAR(100) | ✅ | Email |
| `token` | UUID | ✅ | Unique, Reset token |
| `expires_at` | TIMESTAMP | ✅ | Geçerlilik süresi |
| `kullanildi` | BOOLEAN | ✅ | Kullanıldı mı? (default: false) |
| `ip_adresi` | VARCHAR(45) | ❌ | İstek IP |
| `created_at` | TIMESTAMP | ✅ | Oluşturulma |

**İndeksler:**
- `token` (unique)
- `personel_id`

---

## 👥 ROL SİSTEMİ

### Tanımlı Roller

| Rol Kodu | Ad | Seviye | Renk | Icon | Açıklama |
|----------|-----|--------|------|------|----------|
| **ADMIN** | Sistem Yöneticisi | 10 | #DC2626 | shield-alert | Tüm sistem yetkilerine sahip süper kullanıcı |
| **BASKAN** | Halk Sağlığı Başkanı | 9 | #7C3AED | crown | Halk Sağlığı Başkanlığı yöneticisi, tüm birimleri yönetir |
| **ISTATISTIKCI** | İstatistik Uzmanı | 8 | #2563EB | bar-chart-3 | Veri analizi, raporlama ve istatistik işlemlerinden sorumlu |
| **BIRIM_YONETICISI** | Birim Yöneticisi | 7 | #059669 | briefcase | ASM veya başkanlık birim yöneticisi |
| **PERSONEL** | Personel | 4 | #0891B2 | user | Standart personel, görev takibi ve veri girişi yapar |
| **DIS_BIRIM** | Dış Birim Kullanıcısı | 2 | #64748B | building | ASM gibi dış birimlerin sınırlı erişimi |
| **MISAFIR** | Misafir | 1 | #94A3B8 | eye | Sadece genel raporları görüntüleyebilir, salt okunur erişim |

### Rol Hiyerarşisi

```
Level 10 ┌──────────────────────┐
         │  ADMIN              │ ← Tüm yetkiler
         └──────────────────────┘
                  ↓
Level 9  ┌──────────────────────┐
         │  BASKAN             │ ← Yönetim + Onay
         └──────────────────────┘
                  ↓
Level 8  ┌──────────────────────┐
         │  ISTATISTIKCI       │ ← Veri + Rapor
         └──────────────────────┘
                  ↓
Level 7  ┌──────────────────────┐
         │  BIRIM_YONETICISI   │ ← Birim Yönetimi
         └──────────────────────┘
                  ↓
Level 4  ┌──────────────────────┐
         │  PERSONEL           │ ← Veri Girişi
         └──────────────────────┘
                  ↓
Level 2  ┌──────────────────────┐
         │  DIS_BIRIM          │ ← Sınırlı Erişim
         └──────────────────────┘
                  ↓
Level 1  ┌──────────────────────┐
         │  MISAFIR            │ ← Salt Okunur
         └──────────────────────┘
```

---

## 🔐 YETKİ SİSTEMİ

### Yetki Kategorileri

#### 1. **SISTEM** (3 yetki)
- `sistem.ayarlar` - Sistem Ayarları
- `sistem.loglar` - Sistem Logları
- `sistem.veritabani` - Veritabanı Yönetimi

#### 2. **PERSONEL** (5 yetki)
- `personel.goruntule` - Personel Görüntüleme
- `personel.ekle` - Personel Ekleme
- `personel.duzenle` - Personel Düzenleme
- `personel.sil` - Personel Silme
- `personel.profil_duzenle` - Kendi Profilini Düzenleme

#### 3. **ROL** (6 yetki)
- `rol.goruntule` - Rol Görüntüleme
- `rol.ekle` - Rol Ekleme
- `rol.duzenle` - Rol Düzenleme
- `rol.sil` - Rol Silme
- `yetki.goruntule` - Yetki Görüntüleme
- `yetki.ata` - Yetki Atama

#### 4. **BIRIM** (4 yetki)
- `birim.goruntule` - Birim Görüntüleme
- `birim.ekle` - Birim Ekleme
- `birim.duzenle` - Birim Düzenleme
- `birim.sil` - Birim Silme

#### 5. **GOREV** (6 yetki)
- `gorev.goruntule` - Görev Görüntüleme
- `gorev.olustur` - Görev Oluşturma
- `gorev.duzenle` - Görev Düzenleme
- `gorev.sil` - Görev Silme
- `gorev.devret` - Görev Devretme
- `gorev.onay` - Görev Onaylama

#### 6. **ASM** (4 yetki)
- `asm.veri_giris` - ASM Veri Girişi
- `asm.veri_goruntule` - ASM Veri Görüntüleme
- `asm.veri_duzenle` - ASM Veri Düzenleme
- `asm.veri_onay` - ASM Veri Onaylama

#### 7. **SHM** (6 yetki)
- `shm.veri_giris` - SHM Veri Girişi
- `shm.veri_goruntule` - SHM Veri Görüntüleme
- `shm.veri_duzenle` - SHM Veri Düzenleme
- `shm.veri_onay` - SHM Veri Onaylama
- `shm.rapor` - SHM Raporlama
- `shm.yonetim` - SHM Yönetim

#### 8. **RAPOR** (5 yetki)
- `rapor.genel` - Genel Raporlar
- `rapor.personel` - Personel Raporları
- `rapor.birim` - Birim Raporları
- `rapor.asm` - ASM Raporları
- `rapor.export` - Rapor Dışa Aktarma

#### 9. **TAKVIM** (2 yetki)
- `takvim.goruntule` - Takvim Görüntüleme
- `takvim.duzenle` - Takvim Düzenleme

#### 10. **BILDIRIM** (2 yetki)
- `bildirim.gonder` - Bildirim Gönderme
- `bildirim.toplu_gonder` - Toplu Bildirim Gönderme

**TOPLAM:** 53 yetki

---

## 🔄 ROL-YETKİ EŞLEŞMELERİ

### ADMIN (10)
```
✓ TÜM YETKİLER (53 yetki)
```

### BASKAN (23 yetki)
```
PERSONEL: goruntule, ekle, duzenle, profil_duzenle
ROL: goruntule
YETKİ: goruntule
BİRİM: goruntule, ekle, duzenle
GÖREV: goruntule, olustur, duzenle, onay
ASM: veri_goruntule, veri_onay
SHM: veri_goruntule, veri_onay, rapor, yonetim
RAPOR: genel, personel, birim, asm, export
TAKVİM: goruntule, duzenle
BİLDİRİM: gonder, toplu_gonder
```

### ISTATISTIKCI (16 yetki)
```
PERSONEL: goruntule, profil_duzenle
BİRİM: goruntule
GÖREV: goruntule
ASM: veri_goruntule, veri_giris, veri_duzenle
SHM: veri_goruntule, veri_giris, veri_duzenle, rapor
RAPOR: genel, personel, birim, asm, export
TAKVİM: goruntule
```

### BIRIM_YONETICISI (12 yetki)
```
PERSONEL: goruntule, profil_duzenle
BİRİM: goruntule
GÖREV: goruntule, olustur, duzenle, onay
ASM: veri_goruntule, veri_onay
SHM: veri_goruntule, veri_onay
RAPOR: genel, birim
TAKVİM: goruntule
```

### PERSONEL (10 yetki)
```
PERSONEL: goruntule, profil_duzenle
GÖREV: goruntule, olustur
ASM: veri_goruntule, veri_giris
SHM: veri_goruntule, veri_giris
RAPOR: genel
TAKVİM: goruntule
```

### DIS_BIRIM (3 yetki)
```
ASM: veri_goruntule, veri_giris
RAPOR: genel
```

### MISAFIR (1 yetki)
```
RAPOR: genel
```

---

## 📊 ENUM DEĞERLERİ

### Cinsiyet
```typescript
enum Cinsiyet {
  ERKEK
  KADIN
  BELIRTMEK_ISTEMIYORUM
}
```

### SozlesmeTuru
```typescript
enum SozlesmeTuru {
  KADROLU
  SOZLESMELI
  GECICI
  STAJYER
}
```

### BirimTip
```typescript
enum BirimTip {
  BASKANLIK_BIRIMI   // Halk Sağlığı Başkanlığı ana birimler
  ASM                // Aile Sağlığı Merkezi
  TOPLUM_SAGLIGI     // Toplum Sağlığı Merkezi
  SHM                // Sağlıklı Hayat Merkezi
  IDARI_BIRIM        // İdari birimler
  DESTEK_BIRIM       // Destek hizmetleri
  DIS_BIRIM          // Dışarıdan erişen birimler
}
```

### SHMAltBirimTip (11 tip)
```typescript
enum SHMAltBirimTip {
  BESLENME_DANISMANLIGI                   // Beslenme Danışmanlığı
  KRONIK_HASTALIKLAR_FIZIKSEL_AKTIVITE    // Kronik Hastalıklar ve Fiziksel Aktivite
  KADIN_UREME_SAGLIGI                     // Kadın ve Üreme Sağlığı
  KANSER_ERKEN_TESHIS                     // Kanser Erken Teşhis, Tarama ve Eğitim
  RUH_SAGLIGI                             // Ruh Sağlığı Danışmanlığı
  COCUK_ERGEN_SAGLIGI                     // Çocuk ve Ergen Sağlığı
  TUTUN_MADDE_BAGIMLILIGI                 // Tütün ve Madde Bağımlılığı
  ENFEKSIYON_KONTROL                      // Enfeksiyon Kontrol Hizmetleri
  AGIZ_DIS_SAGLIGI                        // Koruyucu Ağız ve Diş Sağlığı
  TIBBI_HIZMETLER                         // Tıbbi Hizmetler
  IDARI_HIZMETLER                         // İdari Hizmetler
}
```

### OnayDurumu
```typescript
enum OnayDurumu {
  BEKLEMEDE
  ONAYLANDI
  REDDEDILDI
}
```

---

## 🔗 İLİŞKİLER VE KISITLAR

### One-to-Many İlişkiler

```
rol → personel        (Bir role birden fazla personel)
birim → personel      (Bir birimde birden fazla personel)
birim → alt_birimler  (Bir birimde birden fazla alt birim)
birim → shm_alt_birimler (Bir SHM'de birden fazla alt birim)
shm_alt_birim → veri_girisleri (Bir alt birimde birden fazla veri girişi)
```

### Many-to-Many İlişkiler

```
rol ←→ yetki   (rol_yetki junction table üzerinden)
```

### Self-Referencing İlişkiler

```
personel → yonetici (Personel kendi yöneticisini gösterir)
birim → ust_birim   (Birim kendi üst birimini gösterir)
```

### Cascade Delete Rules

```
ON DELETE CASCADE:
- rol_yetki → rol
- rol_yetki → yetki
- shm_alt_birim → shm_birim
- shm_veri_giris → shm_alt_birim

ON DELETE SET NULL:
- personel → yonetici
- birim → ust_birim
```

### Unique Constraints

```
personel:
  - tc_kimlik_no
  - email

rol:
  - kod

yetki:
  - kod

birim:
  - kod

shm_alt_birim:
  - kod

shm_veri_giris:
  - [shm_alt_birim_id, tarih, personel_id] (Composite unique)

password_reset_tokens:
  - token
```

---

## 💡 KULLANIM ÖRNEKLERİ

### Yetki Kontrolü

```typescript
// Kullanıcının belirli bir yetkiye sahip olup olmadığını kontrol et
async function hasPermission(userId: string, permissionCode: string): Promise<boolean> {
  const user = await prisma.personel.findUnique({
    where: { id: userId },
    include: {
      rol: {
        include: {
          yetkiler: {
            include: {
              yetki: true
            }
          }
        }
      }
    }
  });

  return user?.rol.yetkiler.some(ry => ry.yetki.kod === permissionCode) || false;
}

// Kullanım:
const canEditPersonel = await hasPermission(userId, 'personel.duzenle');
```

### Birim Bazlı Veri Filtreleme

```typescript
// Kullanıcının sadece kendi biriminin verilerini getir
async function getMyUnitData(userId: string) {
  const user = await prisma.personel.findUnique({
    where: { id: userId },
    select: { birim_id: true, rol: { select: { kod: true } } }
  });

  // Admin ve Başkan tüm verileri görebilir
  if (['ADMIN', 'BASKAN'].includes(user.rol.kod)) {
    return prisma.sHMVeriGiris.findMany();
  }

  // Diğerleri sadece kendi birimlerini görebilir
  return prisma.sHMVeriGiris.findMany({
    where: {
      shm_alt_birim: {
        shm_birim_id: user.birim_id
      }
    }
  });
}
```

### Audit Log Kaydetme

```typescript
// Her işlemde audit log kaydet
async function logActivity(data: {
  personelId: string;
  email: string;
  islem: string;
  tablo: string;
  kayitId?: string;
  eskiVeri?: any;
  yeniVeri?: any;
  ipAdresi?: string;
  userAgent?: string;
}) {
  await prisma.aktiviteLog.create({
    data: {
      personel_id: data.personelId,
      personel_email: data.email,
      islem: data.islem,
      tablo: data.tablo,
      kayit_id: data.kayitId,
      eski_veri: data.eskiVeri,
      yeni_veri: data.yeniVeri,
      ip_adresi: data.ipAdresi,
      user_agent: data.userAgent
    }
  });
}

// Kullanım:
await logActivity({
  personelId: user.id,
  email: user.email,
  islem: 'personel.duzenle',
  tablo: 'personel',
  kayitId: updatedPersonel.id,
  eskiVeri: oldData,
  yeniVeri: newData,
  ipAdresi: req.ip,
  userAgent: req.headers['user-agent']
});
```

### Onay Bekleyen Kayıtları Getir

```typescript
// Onay bekleyen tüm SHM veri girişlerini getir
async function getPendingApprovals() {
  return prisma.sHMVeriGiris.findMany({
    where: {
      onay_durumu: 'BEKLEMEDE'
    },
    include: {
      shm_alt_birim: {
        include: {
          shm_birim: true
        }
      }
    },
    orderBy: {
      created_at: 'desc'
    }
  });
}
```

---

## 📈 İSTATİSTİKLER

### Tablo Sayıları
- **9** ana tablo
- **4** enum tipi
- **53** toplam yetki
- **7** kullanıcı rolü

### İndeks Sayıları
- **23+** indeks (performans için)
- **7** unique constraint
- **1** composite unique constraint

### İlişki Sayıları
- **10+** One-to-Many ilişki
- **1** Many-to-Many ilişki
- **2** Self-Referencing ilişki

---

## 🔒 GÜVENLİK ÖZELLİKLERİ

✅ **Şifre Hashleme:** bcryptjs ile 10 round
✅ **Audit Trail:** Tüm işlemler loglanır
✅ **Role-Based Access Control (RBAC):** Rol-tabanlı yetkilendirme
✅ **Unit-Based Data Isolation:** Birim bazlı veri izolasyonu
✅ **Password Reset Tokens:** Güvenli şifre sıfırlama
✅ **IP Tracking:** IP adresi takibi
✅ **Session Management:** JWT tabanlı oturum yönetimi

---

## 📝 NOTLAR

1. **İlk Giriş Kontrolü:** `ilk_giris` flag'i ile kullanıcılar ilk girişte şifre değiştirmeye zorlanır.

2. **Soft Delete:** Kullanıcılar ve birimler `aktif` flag'i ile soft delete edilir.

3. **Webhook Entegrasyonu:** SHM veri girişleri n8n webhook'a otomatik gönderilir.

4. **Cascading Deletes:** Alt birimler silindiğinde veri girişleri de otomatik silinir.

5. **Unique Constraint:** Aynı gün aynı personel aynı alt birime sadece 1 kayıt girebilir.

6. **Hierarchical Structure:** Birimler ve personeller hiyerarşik yapıdadır.

7. **JSON Fields:** Esnek veri yapıları için JSON alanlar kullanılır (brans_verileri, webhook_yanit).

---

**Son Güncelleme:** 2025-12-17
**Versiyon:** 1.0.0
**Hazırlayan:** Claude AI
**Proje:** SAHA - Sağlık Hizmetleri Analitiği
