// User Roles
export type UserRole = "admin" | "halk_sagligi_mudur" | "birim_mudur" | "personel";

// User Interface
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  birim_id?: string;
  telefon?: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Birim (Department) Types
export type BirimType = "ASM" | "HALK_SAGLIGI" | "DIGER";

export interface Birim {
  id: string;
  ad: string;
  kod: string;
  tip: BirimType;
  mudur_id?: string;
  adres?: string;
  telefon?: string;
  aktif: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Task Status and Priority
export type GorevDurum = "beklemede" | "devam_ediyor" | "tamamlandi" | "iptal";
export type GorevOncelik = "dusuk" | "orta" | "yuksek" | "acil";

// Task (Görev) Interface
export interface Gorev {
  id: string;
  baslik: string;
  aciklama: string;
  durum: GorevDurum;
  oncelik: GorevOncelik;
  atanan_id: string;
  atanan?: User;
  olusturan_id: string;
  olusturan?: User;
  birim_id: string;
  birim?: Birim;
  baslangic_tarihi: Date;
  bitis_tarihi: Date;
  tamamlanma_yuzdesi: number;
  ust_gorev_id?: string;
  dosyalar?: string[];
  etiketler?: string[];
  yorumlar?: GorevYorum[];
  createdAt: Date;
  updatedAt: Date;
}

// Task Comment
export interface GorevYorum {
  id: string;
  gorev_id: string;
  kullanici_id: string;
  kullanici?: User;
  icerik: string;
  dosyalar?: string[];
  createdAt: Date;
}

// Calendar Event
export interface TakvimEtkinlik {
  id: string;
  baslik: string;
  aciklama?: string;
  baslangic: Date;
  bitis: Date;
  tip: "gorev" | "toplanti" | "izin" | "diger";
  katilimcilar?: string[];
  konum?: string;
  birim_id?: string;
  renk?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ASM Data Entry
export interface ASMVeri {
  id: string;
  asm_id: string;
  tarih: Date;
  muayene_sayisi: number;
  asi_sayisi: number;
  gebe_takip: number;
  bebek_izlem: number;
  kronik_hasta_takip: number;
  ev_ziyaret: number;
  saglik_tarama: number;
  notlar?: string;
  giren_personel_id: string;
  onaylayan_mudur_id?: string;
  onay_durumu: "beklemede" | "onaylandi" | "reddedildi";
  createdAt: Date;
  updatedAt: Date;
}

// Dashboard Statistics
export interface DashboardStats {
  toplam_gorev: number;
  tamamlanan_gorev: number;
  devam_eden_gorev: number;
  geciken_gorev: number;
  toplam_personel: number;
  aktif_birim: number;
  bu_ay_gorev: number;
  tamamlanma_orani: number;
}

// Report Types
export type RaporTip = "gorev" | "birim" | "personel" | "asm";
export type RaporFormat = "pdf" | "excel" | "csv";

export interface Rapor {
  id: string;
  ad: string;
  tip: RaporTip;
  format: RaporFormat;
  baslangic_tarihi: Date;
  bitis_tarihi: Date;
  filtreler?: Record<string, any>;
  olusturan_id: string;
  dosya_url?: string;
  durum: "olusturuluyor" | "hazir" | "hata";
  createdAt: Date;
}

// Notification
export interface Bildirim {
  id: string;
  kullanici_id: string;
  baslik: string;
  mesaj: string;
  tip: "bilgi" | "uyari" | "hata" | "basari";
  okundu: boolean;
  link?: string;
  createdAt: Date;
}

// Webhook Response
export interface WebhookResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// API Response
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Form State
export interface FormState {
  isLoading: boolean;
  error?: string;
  success?: string;
}

// Pagination
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
