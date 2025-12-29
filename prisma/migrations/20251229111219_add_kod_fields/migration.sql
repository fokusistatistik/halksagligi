-- CreateTable
CREATE TABLE "personel" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "tc_kimlik_no" TEXT NOT NULL,
    "ad" TEXT NOT NULL,
    "soyad" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "telefon" TEXT NOT NULL,
    "rol_id" INTEGER NOT NULL,
    "birim_id" INTEGER,
    "yonetici_id" INTEGER,
    "profil_foto_url" TEXT,
    "sicil_no" TEXT,
    "unvan" TEXT,
    "dogum_tarihi" DATETIME,
    "cinsiyet" TEXT,
    "adres" TEXT,
    "il" TEXT DEFAULT 'Kocaeli',
    "ilce" TEXT,
    "ise_baslama_tarihi" DATETIME,
    "sozlesme_turu" TEXT,
    "acil_durum_kisi" TEXT,
    "acil_durum_telefon" TEXT,
    "aktif" BOOLEAN NOT NULL DEFAULT true,
    "ilk_giris" BOOLEAN NOT NULL DEFAULT true,
    "notlar" TEXT,
    "son_giris_tarihi" DATETIME,
    "son_giris_ip" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "created_by_id" INTEGER,
    "updated_by_id" INTEGER,
    CONSTRAINT "personel_rol_id_fkey" FOREIGN KEY ("rol_id") REFERENCES "roller" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "personel_birim_id_fkey" FOREIGN KEY ("birim_id") REFERENCES "birimler" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "personel_yonetici_id_fkey" FOREIGN KEY ("yonetici_id") REFERENCES "personel" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "roller" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "kod" TEXT NOT NULL,
    "ad" TEXT NOT NULL,
    "aciklama" TEXT,
    "seviye" INTEGER NOT NULL,
    "renk" TEXT NOT NULL DEFAULT '#64748b',
    "icon" TEXT,
    "aktif" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "yetkiler" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "kod" TEXT NOT NULL,
    "ad" TEXT NOT NULL,
    "kategori" TEXT NOT NULL,
    "aciklama" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "rol_yetki" (
    "rol_id" INTEGER NOT NULL,
    "yetki_id" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("rol_id", "yetki_id"),
    CONSTRAINT "rol_yetki_rol_id_fkey" FOREIGN KEY ("rol_id") REFERENCES "roller" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "rol_yetki_yetki_id_fkey" FOREIGN KEY ("yetki_id") REFERENCES "yetkiler" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "birimler" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "ad" TEXT NOT NULL,
    "kod" TEXT NOT NULL,
    "tip" TEXT NOT NULL,
    "dis_birim_tip" TEXT,
    "ilce" TEXT,
    "ust_birim_id" INTEGER,
    "sorumlu_kisi_id" INTEGER,
    "adres" TEXT,
    "telefon" TEXT,
    "email" TEXT,
    "aktif" BOOLEAN NOT NULL DEFAULT true,
    "notlar" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "birimler_ust_birim_id_fkey" FOREIGN KEY ("ust_birim_id") REFERENCES "birimler" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "aktivite_log" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "personel_id" INTEGER,
    "personel_email" TEXT,
    "islem" TEXT NOT NULL,
    "tablo" TEXT NOT NULL,
    "kayit_id" TEXT,
    "aciklama" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "shm_veri_giris" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "birim_id" INTEGER NOT NULL,
    "personel_id" INTEGER NOT NULL,
    "tarih" DATETIME NOT NULL,
    "veri" TEXT,
    "aciklama" TEXT,
    "notlar" TEXT,
    "webhook_gonderildi" BOOLEAN NOT NULL DEFAULT false,
    "webhook_gonderim_tarihi" DATETIME,
    "webhook_yanit" TEXT,
    "onay_durumu" TEXT NOT NULL DEFAULT 'BEKLEMEDE',
    "onaylayan_personel_id" INTEGER,
    "onay_tarihi" DATETIME,
    "onay_notu" TEXT,
    "red_gerekce" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "created_by_id" INTEGER,
    "updated_by_id" INTEGER,
    CONSTRAINT "shm_veri_giris_birim_id_fkey" FOREIGN KEY ("birim_id") REFERENCES "birimler" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "password_reset_tokens" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "personel_id" INTEGER NOT NULL,
    "tc_kimlik_no" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires_at" DATETIME NOT NULL,
    "kullanildi" BOOLEAN NOT NULL DEFAULT false,
    "ip_adresi" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "gorevler" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "baslik" TEXT NOT NULL,
    "aciklama" TEXT,
    "durum" TEXT NOT NULL DEFAULT 'BEKLEYEN',
    "oncelik" TEXT NOT NULL DEFAULT 'ORTA',
    "kategori" TEXT,
    "baslangic_tarihi" DATETIME,
    "bitis_tarihi" DATETIME,
    "is_suresiz" BOOLEAN NOT NULL DEFAULT false,
    "tamamlayan_id" INTEGER,
    "tamamlanma_notu" TEXT,
    "gorsel_1" TEXT,
    "gorsel_1_not" TEXT,
    "gorsel_2" TEXT,
    "gorsel_2_not" TEXT,
    "gorsel_3" TEXT,
    "gorsel_3_not" TEXT,
    "olusturan_id" INTEGER NOT NULL,
    "sorumlu_id" INTEGER NOT NULL,
    "birim_id" INTEGER,
    "kod" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "gorevler_tamamlayan_id_fkey" FOREIGN KEY ("tamamlayan_id") REFERENCES "personel" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "gorevler_olusturan_id_fkey" FOREIGN KEY ("olusturan_id") REFERENCES "personel" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "gorevler_sorumlu_id_fkey" FOREIGN KEY ("sorumlu_id") REFERENCES "personel" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "gorevler_birim_id_fkey" FOREIGN KEY ("birim_id") REFERENCES "birimler" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "gorev_guncellemeleri" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "gorev_id" INTEGER NOT NULL,
    "personel_id" INTEGER NOT NULL,
    "mesaj" TEXT NOT NULL,
    "gorsel_url" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "gorev_guncellemeleri_gorev_id_fkey" FOREIGN KEY ("gorev_id") REFERENCES "gorevler" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "gorev_guncellemeleri_personel_id_fkey" FOREIGN KEY ("personel_id") REFERENCES "personel" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "takvim_etkinlikleri" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "baslik" TEXT NOT NULL,
    "aciklama" TEXT,
    "tip" TEXT NOT NULL,
    "renk" TEXT,
    "kod" TEXT,
    "durum" TEXT NOT NULL DEFAULT 'AKTIF',
    "yer" TEXT NOT NULL DEFAULT 'KURUM_ICI',
    "baslangic" DATETIME NOT NULL,
    "bitis" DATETIME NOT NULL,
    "tum_gun" BOOLEAN NOT NULL DEFAULT false,
    "personel_id" INTEGER NOT NULL,
    "olusturan_id" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "takvim_etkinlikleri_personel_id_fkey" FOREIGN KEY ("personel_id") REFERENCES "personel" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "takvim_etkinlikleri_olusturan_id_fkey" FOREIGN KEY ("olusturan_id") REFERENCES "personel" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_DestekVerenGorev" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_DestekVerenGorev_A_fkey" FOREIGN KEY ("A") REFERENCES "gorevler" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_DestekVerenGorev_B_fkey" FOREIGN KEY ("B") REFERENCES "personel" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "personel_tc_kimlik_no_key" ON "personel"("tc_kimlik_no");

-- CreateIndex
CREATE UNIQUE INDEX "personel_email_key" ON "personel"("email");

-- CreateIndex
CREATE INDEX "personel_email_idx" ON "personel"("email");

-- CreateIndex
CREATE INDEX "personel_tc_kimlik_no_idx" ON "personel"("tc_kimlik_no");

-- CreateIndex
CREATE INDEX "personel_rol_id_idx" ON "personel"("rol_id");

-- CreateIndex
CREATE INDEX "personel_birim_id_idx" ON "personel"("birim_id");

-- CreateIndex
CREATE UNIQUE INDEX "roller_kod_key" ON "roller"("kod");

-- CreateIndex
CREATE INDEX "roller_kod_idx" ON "roller"("kod");

-- CreateIndex
CREATE INDEX "roller_seviye_idx" ON "roller"("seviye");

-- CreateIndex
CREATE UNIQUE INDEX "yetkiler_kod_key" ON "yetkiler"("kod");

-- CreateIndex
CREATE INDEX "yetkiler_kod_idx" ON "yetkiler"("kod");

-- CreateIndex
CREATE INDEX "yetkiler_kategori_idx" ON "yetkiler"("kategori");

-- CreateIndex
CREATE UNIQUE INDEX "birimler_kod_key" ON "birimler"("kod");

-- CreateIndex
CREATE INDEX "birimler_kod_idx" ON "birimler"("kod");

-- CreateIndex
CREATE INDEX "birimler_tip_idx" ON "birimler"("tip");

-- CreateIndex
CREATE INDEX "birimler_dis_birim_tip_idx" ON "birimler"("dis_birim_tip");

-- CreateIndex
CREATE INDEX "birimler_ust_birim_id_idx" ON "birimler"("ust_birim_id");

-- CreateIndex
CREATE INDEX "aktivite_log_personel_id_idx" ON "aktivite_log"("personel_id");

-- CreateIndex
CREATE INDEX "aktivite_log_islem_idx" ON "aktivite_log"("islem");

-- CreateIndex
CREATE INDEX "aktivite_log_created_at_idx" ON "aktivite_log"("created_at");

-- CreateIndex
CREATE INDEX "shm_veri_giris_birim_id_idx" ON "shm_veri_giris"("birim_id");

-- CreateIndex
CREATE INDEX "shm_veri_giris_personel_id_idx" ON "shm_veri_giris"("personel_id");

-- CreateIndex
CREATE INDEX "shm_veri_giris_tarih_idx" ON "shm_veri_giris"("tarih");

-- CreateIndex
CREATE INDEX "shm_veri_giris_onay_durumu_idx" ON "shm_veri_giris"("onay_durumu");

-- CreateIndex
CREATE UNIQUE INDEX "shm_veri_giris_birim_id_tarih_personel_id_key" ON "shm_veri_giris"("birim_id", "tarih", "personel_id");

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_tokens_token_key" ON "password_reset_tokens"("token");

-- CreateIndex
CREATE INDEX "password_reset_tokens_token_idx" ON "password_reset_tokens"("token");

-- CreateIndex
CREATE INDEX "password_reset_tokens_personel_id_idx" ON "password_reset_tokens"("personel_id");

-- CreateIndex
CREATE UNIQUE INDEX "gorevler_kod_key" ON "gorevler"("kod");

-- CreateIndex
CREATE INDEX "gorevler_sorumlu_id_idx" ON "gorevler"("sorumlu_id");

-- CreateIndex
CREATE INDEX "gorevler_olusturan_id_idx" ON "gorevler"("olusturan_id");

-- CreateIndex
CREATE INDEX "gorevler_durum_idx" ON "gorevler"("durum");

-- CreateIndex
CREATE INDEX "gorevler_kod_idx" ON "gorevler"("kod");

-- CreateIndex
CREATE INDEX "gorev_guncellemeleri_gorev_id_idx" ON "gorev_guncellemeleri"("gorev_id");

-- CreateIndex
CREATE UNIQUE INDEX "takvim_etkinlikleri_kod_key" ON "takvim_etkinlikleri"("kod");

-- CreateIndex
CREATE INDEX "takvim_etkinlikleri_personel_id_idx" ON "takvim_etkinlikleri"("personel_id");

-- CreateIndex
CREATE INDEX "takvim_etkinlikleri_baslangic_idx" ON "takvim_etkinlikleri"("baslangic");

-- CreateIndex
CREATE INDEX "takvim_etkinlikleri_kod_idx" ON "takvim_etkinlikleri"("kod");

-- CreateIndex
CREATE UNIQUE INDEX "_DestekVerenGorev_AB_unique" ON "_DestekVerenGorev"("A", "B");

-- CreateIndex
CREATE INDEX "_DestekVerenGorev_B_index" ON "_DestekVerenGorev"("B");
