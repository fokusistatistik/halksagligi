# 📦 Proje Taşıma ve Kurulum Rehberi

Bu rehber, projenin (**Veritabanı dahil**) başka bir bilgisayara veya sunucuya taşınması için hazırlanmıştır.

## 🚀 Hızlı Kurulum

### 1. Dosyaları İndirin
Projeyi yeni bilgisayara kopyalayın veya Git üzerinden bu branch'i (`migration-pack`) çekin.

### 2. Çevre Değişkenlerini Ayarlayın
Ana dizinde bulunan `.env.migration` dosyasının adını `.env` olarak değiştirin.
```bash
# Windows (PowerShell)
mv .env.migration .env
# veya manuel olarak adını değiştirin
```

### 3. Bağımlılıkları Yükleyin
Node.js modüllerini yüklemek için terminali açın ve şu komutu girin:
```bash
npm install
```

### 4. Veritabanı İstemcisini Oluşturun
Prisma istemcisini güncellemek için:
```bash
npx prisma generate
```
*Not: `prisma/dev.db` dosyası projeyle birlikte geldiği için `migrate` komutunu çalıştırmanıza gerek yoktur. Veriler hazırdır.*

### 5. Uygulamayı Başlatın
Geliştirme modunda başlatmak için:
```bash
npm run dev
```
Tarayıcınızda `http://localhost:3000` adresine gidin.

---

## 🌍 Sunucu (Production) Build İşlemi

Eğer sunucuya kuruyorsanız, `dev` yerine `build` almanız gerekir:

1. Build alın:
```bash
npm run build
```

2. Başlatın:
```bash
npm start
```

## ⚠️ Önemli Notlar
- **Veritabanı:** `prisma/dev.db` dosyası SQLite veritabanıdır ve tüm kullanıcı/görev verilerini içerir. Bu dosyanın silinmemesine dikkat edin.
- **Resimler:** Eğer `public/uploads` klasörü kullanılıyorsa, bu klasörün de taşındığından emin olun (Git'e eklenmiş durumdadır).
