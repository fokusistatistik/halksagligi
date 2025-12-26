# VERITABANI KURULUM TALİMATLARI

## 🗄️ SQLite Kurulumu (Yönetim Sistemi)

Bu proje **SQLite** veritabanı kullanmaktadır. Harici bir veritabanı kurulumuna gerek yoktur.

### 1. Environment Variables Ayarlama

`.env` dosyasını oluşturun:

```env
# Database (SQLite)
DATABASE_URL="file:./dev.db"
```

### 2. Veritabanını Oluşturma

Projeyi ilk kez kurarken:

```bash
# 1. Prisma dosyalarını oluştur
npx prisma generate

# 2. Veritabanını push et (Schema'yı veritabanına uygula)
npx prisma db push

# 3. Seed verilerini yükle (Admin kullanıcısı, Roller, Yetkiler)
npm run db:seed
```

**Seed işlemi neleri oluşturur?**
- `dev.db` dosyası `prisma/` klasöründe oluşturulur.
- 6 Temel Rol (Admin, Başkan, Analist, Birim Yöneticisi, Personel, Misafir)
- 43 Yetki Tanımı
- Örnek Birimler
- Admin Kullanıcısı

**Admin Giriş Bilgileri:**
- Email: `admin@saglik.gov.tr`
- Şifre: `admin123`

---

## 🐘 PostgreSQL (Opsiyonel - n8n İçin)

Projenin operasyonel modülleri (ASM, İstatistik vb.) veri toplama ve işleme için n8n ve PostgreSQL kullanır. Bu sistem ana uygulamadan bağımsız çalışır.

Eğer n8n workflowlarını localde test edecekseniz PostgreSQL gerekebilir.

### Docker ile PostgreSQL (Sadece n8n için)

```bash
docker run --name kocaeli-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=kocaeli_saglik \
  -p 5432:5432 \
  -d postgres:15
```

---

## 🛠️ Prisma Komutları

```bash
# Veritabanı durumunu görüntüle (GUI)
npx prisma studio

# Schema değişikliklerini uygula
npx prisma db push

# Client'ı güncelle
npx prisma generate

# Veritabanını tamamen sıfırla (DİKKAT!)
rm prisma/dev.db
npx prisma db push
npm run db:seed
```

---

## 🚨 Sorun Giderme

### "Unable to open the database file" Hatası
- `.env` dosyasındaki `DATABASE_URL`'in doğru olduğundan emin olun (`file:./dev.db`).
- Klasör izinlerini kontrol edin.

### "Prisma Client not initialized" Hatası
- `npx prisma generate` komutunu çalıştırın.
