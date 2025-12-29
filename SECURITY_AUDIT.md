# Güvenlik Denetim Raporu - Kocaeli İSM Halk Sağlığı Yönetim Sistemi

**Tarih:** 29 Aralık 2025
**Denetimi Yapan:** Sistem Yardımcısı (Antigravity)
**Durum:** TASLAK

Bu rapor, projenin mevcut güvenlik duruşunu analiz eder ve kamu sektörü standartlarına uygun olarak alınması gereken önlemleri listeler.

## 1. Tespit Edilen Güçlü Yönler (✅)

*   **Kimlik Doğrulama:**
    *   Kullanıcı şifreleri veritabanında düz metin olarak değil, `bcrypt` algoritması ile hash'lenerek saklanmaktadır.
    *   Modern ve güvenli bir yöntem olan JWT (JSON Web Token) tabanlı oturum yönetimi kullanılmaktadır.
*   **HTTP Başlıkları (Headers):**
    *   `next.config.mjs` dosyasında `Strict-Transport-Security` (HSTS), `X-Frame-Options` (Clickjacking koruması), `X-XSS-Protection` gibi kritik güvenlik başlıkları manuel olarak ve doğru bir şekilde yapılandırılmıştır.
    *   `poweredByHeader: false` ayarı ile sunucu teknolojisi (Next.js) bilgisi gizlenmiştir.
*   **Yetkilendirme (RBAC):**
    *   Rol tabanlı erişim kontrolü (RBAC) hem sayfa düzeyinde (UI) hem de API düzeyinde uygulanmıştır.
    *   Kullanıcıların sadece kendi birimlerine ait verilere erişmesini sağlayan filtreleme mekanizmaları mevcuttur.

## 2. Riskler ve İyileştirme Önerileri (⚠️)

### A. Oturum Yönetimi (Orta Risk)
*   **Sorun:** Oturum süresi (`maxAge`) şu anda 30 gün olarak ayarlanmıştır. Kamu projelerinde ve hassas verilerin olduğu sistemlerde bu süre güvenlik riski oluşturabilir (cihazın başkası tarafından ele geçirilmesi durumunda).
*   **Öneri:** Oturum süresinin **8-12 saat** (bir mesai günü) olarak sınırlandırılması önerilir.

### B. Rate Limiting / Hız Sınırlaması (Yüksek Risk - Production İçin)
*   **Sorun:** Mevcut `lib/rate-limit.ts` dosyası hız sınırlamasını "in-memory" (RAM üzerinde) yapmaktadır. Uygulama birden fazla sunucuda veya serverless ortamda (Vercel vb.) çalıştığında bu koruma etkisiz kalacaktır. Ayrıca sunucu yeniden başlatıldığında limitler sıfırlanır.
*   **Öneri:** Prodüksiyon ortamında **Redis** veya benzeri kalıcı bir veri deposu kullanılarak dağıtık mimariye uygun bir Rate Limiting yapısı kurulmalıdır. (Şu anki tek sunuculu/lokal yapı için mevcut hali kabul edilebilir ancak not edilmelidir).

### C. Derleme (Build) Güvenliği (Düşük/Orta Risk)
*   **Sorun:** `next.config.mjs` dosyasında `typescript.ignoreBuildErrors: true` ve `eslint.ignoreDuringBuilds: true` ayarları aktiftir. Bu, hatalı veya güvensiz kodların canlı ortama (production) çıkmasına izin verebilir.
*   **Öneri:** Bu ayarların `false` yapılarak, derleme aşamasında tip ve kod kalitesi hatalarının zorunlu olarak düzeltilmesi sağlanmalıdır.

### D. Veri Güvenliği (SQLite)
*   **Durum:** Veritabanı olarak SQLite (`dev.db` dosyası) kullanılmaktadır. Dosya tabanlı bir veritabanı olduğu için şifreleme özellikleri sınırlıdır.
*   **Öneri:**
    1.  Prodüksiyon ortamında dosya sistemi izinlerinin çok sıkı ayarlanması (sadece uygulama kullanıcısı okuyabilmeli).
    2.  Hassas verilerin (TCKN vb.) veritabanına yazılmadan önce uygulama katmanında şifrelenmesi (Encryption-at-rest) değerlendirilebilir, ancak bu performans maliyeti yaratır. Mevcut `bcrypt` kullanımı şifreler için yeterlidir.

## 3. Aksiyon Planı

1.  [ ] **`lib/auth/options.ts`**: Oturum süresini (`maxAge`) 12 saate düşür.
2.  [ ] **`next.config.mjs`**: Build hatalarını yoksayan ayarları kaldır/kapat.
3.  [ ] **`README.md`**: "Production Deployment" bölümüne Rate Limiting ve Redis gereksinimi hakkında not ekle.

---
**Özet:** Proje genel güvenlik mimarisi açısından iyi durumdadır, özellikle HTTP başlıkları ve kimlik doğrulama altyapısı sağlamdır. Yukarıdaki ince ayarlar ile kamu standartlarına tam uyum sağlanabilir.
