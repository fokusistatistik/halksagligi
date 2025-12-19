# Modül Geliştirme Yönergesi (Module Development Guidelines)

Bu proje "Modül Bazlı Geliştirme" (Module-Based Development) yaklaşımını benimser. Yeni özellikler ve işlevler, bağımsız ve yetki tabanlı modüller halinde geliştirilmelidir.

## 1. Modül Yapısı
Her modül, `app/` dizini altında kendi klasörüne sahip olmalı ve aşağıdaki standartlara uymalıdır:

- **Dizin Yapısı**: `app/[kategori]/[modul-adi]/`
  - Örn: `app/mudurluk/gorev-yonetim/`
- **Yetki Kontrolü**: Her modül, sayfa (`page.tsx`) veya düzen (`layout.tsx`) seviyesinde kullanıcı yetkisini ve birim tipini kontrol etmelidir.
- **Alt Modüller**: Modül içindeki alt işlevler (örn: Takvim, Rapor) ayrı bileşenler veya alt rotalar olarak düzenlenmelidir.

## 2. Mevcut Modüller

### A. Görevlendirme ve Takip Modülü (Müdürlük)
- **Konum**: `app/mudurluk/gorev-yonetim`
- **Erişim Yetkisi**: Sadece `BirimTip = "MUDURLUK"` olan personeller erişebilir.
- **Kapsam**:
  - Görev Verme / Atama
  - Görev Takibi
  - Takvim ve Planlama
  - Süreç İzleme
  - Günlük Aktivite Takibi

## 3. Geliştirme Kuralları
1. **İzolasyon**: Modüller mümkün olduğunca birbirinden bağımsız çalışmalıdır.
2. **Yeniden Kullanım**: Ortak bileşenler (`components/ui`) kullanılmalı, modüle özel bileşenler modül klasörü içinde tutulmamalı (genel `components` altında `[modul-adi]` klasörü açılabilir).
3. **Güvenlik**: Sunucu tarafı oturum kontrolü (`getServerSession` veya `useSession`) her zaman yapılmalıdır.

---
*Son Güncelleme: 2025*
