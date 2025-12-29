# Görev Kartı Geliştirmeleri - Implementation Plan

## 1. Görev Kartlarında Düzenle İkonu
- **Konum:** Görev kartının sağ üst köşesi
- **Koşul:** Sadece `user.rol.seviye >= 9` (Başkan ve üstü)
- **İkon:** Edit/Pencil ikonu
- **Aksiyon:** Görev düzenleme modalını açar

## 2. Son Tarih Renklendirmesi (Pastel Renkler)
Kalan gün sayısına göre:
- **Geçmiş:** `bg-gray-800 text-white` (Siyah)
- **Bugün (0 gün):** `bg-red-800 text-white` (Koyu kırmızı)
- **1-2 gün:** `bg-red-400 text-white` (Açık kırmızı)
- **3-7 gün:** `bg-orange-300 text-gray-800` (Turuncu pastel)
- **8+ gün:** `bg-yellow-200 text-gray-800` (Sarımsı pastel)

## 3. Öncelik Seviyesi Gösterimi
- **Acil:** 
  - Border: `border-red-500`
  - Background: `bg-red-50`
  - Animasyon: `animate-pulse` (hafif kıpırdama)
  - Badge: Kırmızı
- **Yüksek:**
  - Border: `border-orange-500`
  - Background: `bg-orange-50`
  - Badge: Turuncu
- **Orta:**
  - Border: `border-yellow-500`
  - Background: `bg-yellow-50`
  - Badge: Sarı
- **Düşük:**
  - Border: `border-green-500`
  - Background: `bg-green-50`
  - Badge: Yeşil

## 4. Tarih Validasyonları
### Yeni Görev Oluşturma Modalı:
- Başlangıç tarihi: `min={new Date().toISOString().split('T')[0]}`
- Bitiş tarihi: `min={newGorev.baslangic_tarihi || new Date().toISOString().split('T')[0]}`
- Validation: Bitiş >= Başlangıç

### Görev Düzenleme Modalı:
- Aynı validasyonlar

## 5. Düzenleme Değişikliklerini Süreç Günlüğüne Kaydetme
API'de zaten var, frontend'de değişiklik takibi eklenecek:
- Durum değişikliği
- Sorumlu değişikliği
- Tarih değişiklikleri
- Öncelik değişiklikleri

## 6. Destek Veren Personelleri Modalda Gösterme
- **Konum:** Görev detay modalında, sorumlu personelin altında
- **Görünüm:** Avatar listesi
- **Bilgi:** İsim + profil fotoğrafı

## Helper Functions Needed:
```typescript
// Kalan gün hesaplama
const getDaysRemaining = (date: string | Date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};

// Tarih renk sınıfı
const getDateColorClass = (date: string | Date) => {
  const days = getDaysRemaining(date);
  if (days < 0) return 'bg-gray-800 text-white';
  if (days === 0) return 'bg-red-800 text-white';
  if (days <= 2) return 'bg-red-400 text-white';
  if (days <= 7) return 'bg-orange-300 text-gray-800';
  return 'bg-yellow-200 text-gray-800';
};

// Öncelik renk sınıfı
const getPriorityColorClass = (priority: string) => {
  switch(priority) {
    case 'ACIL': return 'border-red-500 bg-red-50';
    case 'YUKSEK': return 'border-orange-500 bg-orange-50';
    case 'ORTA': return 'border-yellow-500 bg-yellow-50';
    case 'DUSUK': return 'border-green-500 bg-green-50';
    default: return 'border-blue-500 bg-blue-50';
  }
};
```
