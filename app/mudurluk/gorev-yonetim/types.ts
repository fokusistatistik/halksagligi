export type Gorev = {
    id: string;
    kod?: string; // GÖREV-YY-000001
    baslik: string;
    aciklama: string;
    durum: 'BEKLEYEN' | 'DEVAM_EDEN' | 'TAMAMLANDI' | 'IPTAL';
    oncelik: 'DUSUK' | 'ORTA' | 'YUKSEK' | 'ACIL';
    kategori: string;
    baslangic_tarihi?: string;
    bitis_tarihi?: string;
    tamamlanma_tarihi?: string;
    tamamlayan_id?: string;
    tamamlanma_notu?: string;
    gorsel_1?: string;
    gorsel_1_not?: string;
    gorsel_2?: string;
    gorsel_2_not?: string;
    gorsel_3?: string;
    gorsel_3_not?: string;
    sorumlu: { id: string, ad: string, soyad: string, profil_foto_url?: string, unvan?: string };
    olusturan: { id: string, ad: string, soyad: string };
    destek_verenler?: { id: string, ad: string, soyad: string, profil_foto_url?: string }[];
    guncellemeler: any[];
    created_at: string;
    is_suresiz?: boolean;
};

export type Etkinlik = {
    id: string;
    kod?: string; // TAKVİM-YY-0000001
    baslik: string;
    aciklama?: string;
    tip: string;
    yer?: 'KURUM_ICI' | 'KURUM_DISI';
    durum?: string;
    renk?: string;
    baslangic: string;
    bitis: string;
    personel_id: string;
    olusturan: { ad: string, soyad: string };
};

export type Personel = {
    id: string | number;
    ad: string;
    soyad: string;
    profil_foto_url?: string;
    unvan?: string;
};
