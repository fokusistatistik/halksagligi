# Kocaeli İl Sağlık Müdürlüğü - Görev Yönetim Sistemi

Halk Sağlığı Başkanlığı için geliştirilmiş, modern ve profesyonel görev takip ve yönetim platformu.

## 🏥 Proje Hakkında

Bu sistem, Kocaeli İl Sağlık Müdürlüğü Halk Sağlığı Başkanlığı'nın görev yönetimi, personel takibi, ASM veri girişi ve raporlama ihtiyaçlarını karşılamak üzere geliştirilmiştir.

## ✨ Özellikler

### 🔐 Kimlik Doğrulama
- NextAuth.js ile güvenli oturum yönetimi
- Rol tabanlı erişim kontrolü (RBAC)
- 4 farklı kullanıcı rolü: Admin, Halk Sağlığı Müdürü, Birim Müdürü, Personel

### 📋 Görev Yönetimi
- Görev oluşturma, atama ve takip
- Öncelik ve durum yönetimi
- Görev devretme sistemi
- Yorum ve not ekleme
- Dosya eklentileri

### 📅 Takvim Sistemi
- Görev ve etkinlik takvimi
- Günlük/Haftalık/Aylık görünümler
- Toplantı planlama

### 🏥 ASM Birimi
- Günlük veri girişi (muayene, aşı, gebe takip vb.)
- Gerçek zamanlı istatistikler
- Performans takibi
- Onay sistemi

### 📊 Raporlama
- Görev performans raporları
- Birim bazlı analizler
- Personel verimlilik raporları
- ASM veri raporları
- PDF/Excel export

### ⚙️ Admin Paneli
- Kullanıcı yönetimi
- Birim yönetimi
- Yetki tanımlama
- Sistem ayarları

## 🛠️ Teknoloji Stack

- **Framework**: Next.js 15 (App Router)
- **Dil**: TypeScript
- **Stil**: Tailwind CSS
- **UI Bileşenleri**: Custom shadcn/ui
- **Durum Yönetimi**: Zustand + React Query
- **Form**: React Hook Form + Zod
- **Kimlik Doğrulama**: NextAuth.js
- **Backend**: n8n Webhook (n8n.fokusistatistik.com)

## 📦 Kurulum

### Gereksinimler
- Node.js 18+
- npm

### Adımlar

1. Bağımlılıkları yükleyin:
```bash
npm install
```

2. Environment variables ayarlayın (`.env.local`):
```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here
NEXT_PUBLIC_WEBHOOK_BASE_URL=https://n8n.fokusistatistik.com/webhook
WEBHOOK_API_KEY=your-webhook-api-key-here
```

3. Development sunucusunu başlatın:
```bash
npm run dev
```

4. Tarayıcıda açın: `http://localhost:3000`

## 🚀 Production Build

```bash
npm run build
npm start
```

## 📁 Proje Yapısı

```
halksagligi/
├── app/                      # Next.js App Router
│   ├── api/auth/            # NextAuth endpoints
│   ├── dashboard/           # Dashboard sayfaları
│   │   ├── gorevler/        # Görev yönetimi
│   │   ├── takvim/          # Takvim
│   │   ├── asm/             # ASM modülü
│   │   ├── raporlar/        # Raporlama
│   │   └── profil/          # Kullanıcı profili
│   ├── admin/               # Admin paneli
│   └── login/               # Giriş sayfası
├── components/              # React bileşenleri
│   ├── ui/                  # UI primitives
│   ├── dashboard/           # Dashboard bileşenleri
│   ├── forms/               # Form bileşenleri
│   └── shared/              # Paylaşılan bileşenler
├── lib/                     # Yardımcı fonksiyonlar
│   ├── auth/                # Kimlik doğrulama
│   ├── webhook/             # Webhook client
│   └── utils.ts             # Genel yardımcılar
├── types/                   # TypeScript tanımları
└── hooks/                   # Custom React hooks
```

## 🔗 Webhook Endpoints

Sistem, n8n webhook sistemi ile entegre çalışır. Ana endpoint'ler:

- `/gorev-olustur` - Yeni görev oluştur
- `/gorev-guncelle` - Görev güncelle
- `/asm-veri-giris` - ASM veri girişi
- `/kullanici-giris` - Kullanıcı girişi
- `/dashboard-istatistikler` - Dashboard verileri

## 👥 Kullanıcı Rolleri

1. **Admin**: Tüm sistem yönetimi
2. **Halk Sağlığı Müdürü**: Personel ve görev yönetimi
3. **Birim Müdürü**: Birim bazlı yönetim
4. **Personel**: Görev görüntüleme ve güncelleme

## 🎨 Tasarım

- **Birincil Renk**: #E30613 (T.C. Sağlık Bakanlığı kırmızısı)
- **İkincil Renk**: #003366 (Lacivert)
- **Responsive**: Desktop, Tablet, Mobil

## 🔒 Güvenlik

- JWT tabanlı session
- Role-based access control
- Webhook API key koruması
- Input validation (Zod)

## 📝 Changelog

### v1.0.0
- ✅ Temel proje yapısı
- ✅ Kimlik doğrulama
- ✅ Dashboard ve görev yönetimi
- ✅ ASM modülü
- ✅ Raporlama ve admin paneli

---

**Not:** Webhook entegrasyonları için n8n workflow'larının hazırlanması gerekmektedir.
