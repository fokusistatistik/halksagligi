# SAHA Database Schema Raporu v2.0

**Tarih:** 2025-12-17
**Sistem:** SAHA (Sağlık Hizmetleri Analitiği)

---

## Genel Bakış

SAHA sistemi, Kocaeli İl Sağlık Müdürlüğü için veri yönetim platformudur.

### Temel Değişiklikler (v2.0)

1. **Birim Yapısı Revize Edildi**
   - Sadece 2 tip: `MUDURLUK` ve `DIS_BIRIM`
   - Dış birim alt tipleri: ASM, HSM, VSD, ILCE_SAGLIK
   - Her dış birim bir müdürlük birimine bağlı
   - `shm_alt_birimler` tablosu kaldırıldı

2. **Roller Güncellendi**
   - `DIS_BIRIM` rolü kaldırıldı
   - `ISTATISTIKCI` + `BIRIM_YONETICISI` → `ANALIST` (level 8)
   - 6 rol: ADMIN (10), BASKAN (9), ANALIST (8), BIRIM_YONETICISI (7), PERSONEL (4), MISAFIR (1)

3. **Audit Log Basitleştirildi**
   - `eski_veri`, `yeni_veri`, `ip_adresi`, `user_agent` kaldırıldı
   - Sadece temel bilgiler

4. **Veri Girişi Revize Edildi**
   - `birim_id` kullanımı (sh_birim_id yerine)
   - Esnek `veri` JSON alanı
   - `red_gerekce` eklendi

---

## Database Tabloları

### 1. personel
Sistem kullanıcıları. Her personelin bir birimi var.

**Önemli Alanlar:**
- `rol_id`: Roller tablosuna referans
- `birim_id`: Birimler tablosuna referans
- `password`: bcrypt hash

### 2. roller
6 rol tanımı (seviye 1-10).

| Rol | Seviye | Kullanım |
|-----|--------|----------|
| ADMIN | 10 | Tüm yetkiler |
| BASKAN | 9 | Halk Sağlığı Başkanı |
| ANALIST | 8 | Müdürlük birimlerinde, eski İstatistikçi+Birim Yöneticisi |
| BIRIM_YONETICISI | 7 | Sadece dış birimlerde |
| PERSONEL | 4 | Standart personel |
| MISAFIR | 1 | Salt okunur |

### 3. yetkiler
43 yetki, 10 kategori (SISTEM, PERSONEL, ROL, BIRIM, GOREV, ASM, SHM, RAPOR, TAKVIM, BILDIRIM).

### 4. rol_yetki
Roller ve yetkiler arasındaki many-to-many ilişki.

### 5. birimler (YENİ YAPI)

```sql
CREATE TABLE birimler (
  id UUID PRIMARY KEY,
  ad VARCHAR(200) NOT NULL,
  kod VARCHAR(50) UNIQUE NOT NULL,
  tip ENUM('MUDURLUK', 'DIS_BIRIM') NOT NULL,
  dis_birim_tip ENUM('ASM', 'HSM', 'VSD', 'ILCE_SAGLIK'),
  ust_birim_id UUID REFERENCES birimler(id),
  ...
);
```

**Kurallar:**
- **MUDURLUK:** Kendi modüllerini görür, `dis_birim_tip` NULL
- **DIS_BIRIM:** `dis_birim_tip` zorunlu, `ust_birim_id` zorunlu

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

### 6. aktivite_log (BASİTLEŞTİRİLDİ)

```sql
CREATE TABLE aktivite_log (
  id UUID PRIMARY KEY,
  personel_id UUID,
  personel_email VARCHAR(100),
  islem VARCHAR(100) NOT NULL,
  tablo VARCHAR(50) NOT NULL,
  kayit_id VARCHAR(255),
  aciklama TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 7. shm_veri_giris (GÜNCELLENDİ)

```sql
CREATE TABLE shm_veri_giris (
  id UUID PRIMARY KEY,
  birim_id UUID NOT NULL,  -- Dış birim
  personel_id UUID NOT NULL,
  tarih DATE NOT NULL,
  veri JSONB,  -- Esnek veri yapısı
  onay_durumu ENUM('BEKLEMEDE', 'ONAYLANDI', 'REDDEDILDI'),
  red_gerekce TEXT,  -- YENİ
  ...
  UNIQUE(birim_id, tarih, personel_id)
);
```

### 8. password_reset_tokens
Şifre sıfırlama için.

---

## Enum Tipleri

```sql
-- Birim Tipleri
BirimTip: 'MUDURLUK', 'DIS_BIRIM'
DisBirimTip: 'ASM', 'HSM', 'VSD', 'ILCE_SAGLIK'

-- Diğer
Cinsiyet: 'ERKEK', 'KADIN', 'BELIRTMEK_ISTEMIYORUM'
SozlesmeTuru: 'KADROLU', 'SOZLESMELI', 'GECICI', 'STAJYER'
OnayDurumu: 'BEKLEMEDE', 'ONAYLANDI', 'REDDEDILDI'
```

---

## Rol Yetkileri

### ADMIN (10) - 43 yetki
Tüm yetkiler.

### BASKAN (9) - 23 yetki
Personel, birim, görev yönetimi, veri onayı, raporlama, bildirim.

### ANALIST (8) - 19 yetki
**Müdürlük birimlerinde kullanılır.**
- Tüm verileri görebilir
- Veri giriş, düzenleme, onaylama
- Raporlama (tümü)
- Görev yönetimi

### BIRIM_YONETICISI (7) - 16 yetki
**Sadece dış birimlerde kullanılır.**
- İlgili dış birimin tüm verilerini görür, girer, onaylar
- Görev oluşturma ve onaylama
- Birim raporları

### PERSONEL (4) - 10 yetki
**Dış birimlerde:** Kendi verilerini girer
**Müdürlük birimlerinde:** Bağlı dış birimlerin verilerini yönetir

### MISAFIR (1) - 2 yetki
Genel raporlar, takvim görüntüleme (salt okunur).

---

## Veri Akışı

### Veri Onay Sistemi

```
1. Dış Birim PERSONEL → Veri Girişi (BEKLEMEDE)
                           ↓
2. BIRIM_YONETICISI/ANALIST → Onay/Red
                           ↓
3. ONAYLANDI → Webhook → n8n
```

### Onay Yetkileri

| Rol | Dış Birimde | Müdürlük Biriminde |
|-----|-------------|--------------------|
| PERSONEL | Kendi verileri | Bağlı dış birimlerin verileri |
| BIRIM_YONETICISI | Tüm veriler | ❌ Kullanılmaz |
| ANALIST | ❌ Kullanılmaz | Tüm veriler |
| BASKAN/ADMIN | ✅ | ✅ |

---

## Admin Panel - Birim Yönetimi

**Sayfa:** `/admin/birimler`

Özellikler:
- Müdürlük ve Dış birim listeleme
- Birim ekleme (Tip, alt tip, üst birim seçimi)
- Birim düzenleme
- Birim silme (personel kontrolü)
- Arama ve filtreleme

**API Endpoints:**
- `GET /api/birim` - Tüm birimleri listele
- `POST /api/birim` - Yeni birim oluştur
- `GET /api/birim/[id]` - Birim detayı
- `PUT /api/birim/[id]` - Birim güncelle
- `DELETE /api/birim/[id]` - Birim sil

---

## Migration Adımları

```sql
-- 1. Eski birim tiplerini güncelle
UPDATE birimler SET
  tip = 'MUDURLUK',
  dis_birim_tip = NULL
WHERE tip IN ('BASKANLIK_BIRIMI', 'IDARI_BIRIM', 'DESTEK_BIRIM');

UPDATE birimler SET
  tip = 'DIS_BIRIM',
  dis_birim_tip = 'ASM'
WHERE tip = 'ASM';

UPDATE birimler SET
  tip = 'DIS_BIRIM',
  dis_birim_tip = 'HSM'
WHERE tip = 'SHM';

-- 2. DIS_BIRIM rolünü kaldır
DELETE FROM rol_yetki WHERE rol_id IN (SELECT id FROM roller WHERE kod = 'DIS_BIRIM');
DELETE FROM roller WHERE kod = 'DIS_BIRIM';

-- 3. ISTATISTIKCI'yi ANALIST'e çevir
UPDATE roller SET
  kod = 'ANALIST',
  ad = 'Analist',
  aciklama = 'Müdürlük biriminde tüm verileri görebilir, veri analizi ve raporlama yapar'
WHERE kod = 'ISTATISTIKCI';

-- 4. shm_alt_birimler tablosunu kaldır
DROP TABLE IF EXISTS shm_alt_birimler;
```

---

## Güvenlik

1. **Şifre:** bcrypt (10 rounds)
2. **RBAC:** 6 rol, 43 yetki
3. **Birim İzolasyonu:** Her personel bir birime bağlı
4. **Audit Trail:** Tüm kritik işlemler loglanır
5. **Veri Onay:** BEKLEMEDE → ONAYLANDI/REDDEDILDI

---

## Önemli Notlar

### Her Personel Sadece Bir Birime Sahiptir

- Müdürlük birimi VEYA Dış birim
- Dış birimlerde en fazla BIRIM_YONETICISI rolü
- Müdürlük birimlerinde tüm roller kullanılabilir

### Dış Birim Kuralları

- `ust_birim_id` zorunlu (müdürlük birimi)
- `dis_birim_tip` zorunlu (ASM, HSM, VSD, ILCE_SAGLIK)
- 4 alt tip, ileride artırılabilir

### Yeni Sistem Genişletme

Yeni dış birim tipi eklemek:
1. `DisBirimTip` enum'una ekle
2. Seed dosyasına müdürlük şubesi ekle
3. Frontend'de label ekle

---

**Rapor Sonu**
