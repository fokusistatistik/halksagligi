# 🚀 Proje Taşıma ve Kurulum Rehberi

Bu döküman, projeyi (frontend, backend ve veritabanı dahil) yeni bir bilgisayara eksiksiz bir şekilde taşımak ve çalıştırmak için hazırlanmıştır.

## 📋 Ön Hazırlık

Yeni bilgisayarda şunların yüklü olduğundan emin olun:
1.  **Node.js** (LTS sürümü önerilir, örn: v18 veya v20)
2.  **Git**
3.  **VS Code** (Önerilen editör)

## 📦 Kurulum Adımları

### 1. Projeyi İndirin
Terminali açın ve projeyi klonlayın (veya dosyaları kopyaladıysanız klasöre gidin):
```bash
git clone https://github.com/KULLANICI_ADI/REPO_ADI.git
cd halksagligi
```

### 2. Doğru Versiyona Geçin (ÖNEMLİ)
En son geliştirmelerin olduğu dala (branch) geçiş yapın:
```bash
git checkout refactor/gorev-yonetim-v2
```

### 3. Kütüphaneleri Yükleyin
```bash
npm install
```

### 4. Çevre Değişkenlerini (.env) Ayarlayın
Ana dizinde `.env` isminde bir dosya oluşturun ve içine aşağıdakileri yapıştırın:
```env
# Veritabanı Yolu (SQLite)
DATABASE_URL="file:./dev.db"

# NextAuth Ayarları (Geliştirme ortamı için rastgele bir string olabilir)
NEXTAUTH_SECRET="gizli-anahtar-buraya"
NEXTAUTH_URL="http://localhost:3000"
```

### 5. Veritabanını Hazırlayın
Proje ile birlikte `prisma/dev.db` dosyası gelmiş olabilir. Ancak verilerin güncelliğini garanti etmek için `database-backup` klasöründeki yedeği kullanabilirsiniz.

**Yedekten Geri Yükleme (Önerilen):**
```bash
# Windows (PowerShell)
copy database-backup\dev-transfer.db prisma\dev.db
```

**Veritabanı İstemcisini Oluşturun:**
```bash
npx prisma generate
```

### 6. Uygulamayı Başlatın
```bash
npm run dev
```
Uygulama `http://localhost:3000` adresinde çalışacaktır.

---

## ✅ Kontrol Listesi
- [ ] `npm install` hatasız tamamlandı mı?
- [ ] `.env` dosyası oluşturuldu mu?
- [ ] `prisma/dev.db` dosyası mevcut mu?
- [ ] `npx prisma generate` çalıştırıldı mı?

🎉 **Tebrikler!** Sistem başarıyla taşındı. Periyodik etkinlikler, takvim düzenlemeleri ve yeni görev yönetim özellikleri kullanıma hazırdır.
