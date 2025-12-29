import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seed data başlatılıyor...')

  // ============================================
  // 1. ROLLER OLUŞTUR
  // ============================================
  console.log('📋 Roller oluşturuluyor...')

  const roller = [
    {
      kod: 'ADMIN',
      ad: 'Sistem Yöneticisi',
      seviye: 10,
      renk: '#DC2626',
      icon: 'shield-alert',
      aciklama: 'Tüm sistem yetkilerine sahip süper kullanıcı'
    },
    {
      kod: 'BASKAN',
      ad: 'Halk Sağlığı Başkanı',
      seviye: 9,
      renk: '#7C3AED',
      icon: 'crown',
      aciklama: 'Halk Sağlığı Başkanlığı yöneticisi, tüm birimleri yönetir'
    },
    {
      kod: 'ANALIST',
      ad: 'Analist',
      seviye: 8,
      renk: '#2563EB',
      icon: 'bar-chart-3',
      aciklama: 'Müdürlük biriminde tüm verileri görebilir, veri analizi ve raporlama yapar'
    },
    {
      kod: 'BIRIM_YONETICISI',
      ad: 'Birim Yöneticisi',
      seviye: 7,
      renk: '#059669',
      icon: 'briefcase',
      aciklama: 'Dış birimlerde (ASM, SHM, VSD, İlçe Sağlık) birim yöneticisi - Tüm verileri görür, girer ve onaylar'
    },
    {
      kod: 'PERSONEL',
      ad: 'Personel',
      seviye: 4,
      renk: '#0891B2',
      icon: 'user',
      aciklama: 'Standart personel - Dış birimlerde kendi verilerini girer, Müdürlük biriminde bağlı dış birimlerin verilerini yönetir'
    },
    {
      kod: 'MISAFIR',
      ad: 'Misafir',
      seviye: 1,
      renk: '#94A3B8',
      icon: 'eye',
      aciklama: 'Sadece genel raporları görüntüleyebilir, salt okunur erişim'
    }
  ]

  const createdRoller = await Promise.all(
    roller.map(rol =>
      prisma.rol.upsert({
        where: { kod: rol.kod },
        update: rol,
        create: rol
      })
    )
  )

  console.log(`✅ ${createdRoller.length} rol oluşturuldu`)

  // ============================================
  // 2. YETKİLER OLUŞTUR
  // ============================================
  console.log('🔐 Yetkiler oluşturuluyor...')

  const yetkiler = [
    // SİSTEM YETKİLERİ
    { kod: 'sistem.ayarlar', ad: 'Sistem Ayarları', kategori: 'SISTEM' },
    { kod: 'sistem.loglar', ad: 'Sistem Logları', kategori: 'SISTEM' },
    { kod: 'sistem.veritabani', ad: 'Veritabanı Yönetimi', kategori: 'SISTEM' },

    // PERSONEL YETKİLERİ
    { kod: 'personel.goruntule', ad: 'Personel Görüntüleme', kategori: 'PERSONEL' },
    { kod: 'personel.ekle', ad: 'Personel Ekleme', kategori: 'PERSONEL' },
    { kod: 'personel.duzenle', ad: 'Personel Düzenleme', kategori: 'PERSONEL' },
    { kod: 'personel.sil', ad: 'Personel Silme', kategori: 'PERSONEL' },
    { kod: 'personel.profil_duzenle', ad: 'Kendi Profilini Düzenleme', kategori: 'PERSONEL' },

    // ROL VE YETKİ
    { kod: 'rol.goruntule', ad: 'Rol Görüntüleme', kategori: 'ROL' },
    { kod: 'rol.ekle', ad: 'Rol Ekleme', kategori: 'ROL' },
    { kod: 'rol.duzenle', ad: 'Rol Düzenleme', kategori: 'ROL' },
    { kod: 'rol.sil', ad: 'Rol Silme', kategori: 'ROL' },
    { kod: 'yetki.goruntule', ad: 'Yetki Görüntüleme', kategori: 'ROL' },
    { kod: 'yetki.ata', ad: 'Yetki Atama', kategori: 'ROL' },

    // BİRİM YETKİLERİ
    { kod: 'birim.goruntule', ad: 'Birim Görüntüleme', kategori: 'BIRIM' },
    { kod: 'birim.ekle', ad: 'Birim Ekleme', kategori: 'BIRIM' },
    { kod: 'birim.duzenle', ad: 'Birim Düzenleme', kategori: 'BIRIM' },
    { kod: 'birim.sil', ad: 'Birim Silme', kategori: 'BIRIM' },

    // GÖREV YETKİLERİ
    { kod: 'gorev.goruntule', ad: 'Görev Görüntüleme', kategori: 'GOREV' },
    { kod: 'gorev.olustur', ad: 'Görev Oluşturma', kategori: 'GOREV' },
    { kod: 'gorev.duzenle', ad: 'Görev Düzenleme', kategori: 'GOREV' },
    { kod: 'gorev.sil', ad: 'Görev Silme', kategori: 'GOREV' },
    { kod: 'gorev.devret', ad: 'Görev Devretme', kategori: 'GOREV' },
    { kod: 'gorev.onay', ad: 'Görev Onaylama', kategori: 'GOREV' },

    // ASM VERİ YETKİLERİ
    { kod: 'asm.veri_giris', ad: 'ASM Veri Girişi', kategori: 'ASM' },
    { kod: 'asm.veri_goruntule', ad: 'ASM Veri Görüntüleme', kategori: 'ASM' },
    { kod: 'asm.veri_duzenle', ad: 'ASM Veri Düzenleme', kategori: 'ASM' },
    { kod: 'asm.veri_onay', ad: 'ASM Veri Onaylama', kategori: 'ASM' },

    // RAPORLAMA YETKİLERİ
    { kod: 'rapor.genel', ad: 'Genel Raporlar', kategori: 'RAPOR' },
    { kod: 'rapor.personel', ad: 'Personel Raporları', kategori: 'RAPOR' },
    { kod: 'rapor.birim', ad: 'Birim Raporları', kategori: 'RAPOR' },
    { kod: 'rapor.asm', ad: 'ASM Raporları', kategori: 'RAPOR' },
    { kod: 'rapor.export', ad: 'Rapor Dışa Aktarma', kategori: 'RAPOR' },

    // TAKVİM YETKİLERİ
    { kod: 'takvim.goruntule', ad: 'Takvim Görüntüleme', kategori: 'TAKVIM' },
    { kod: 'takvim.duzenle', ad: 'Takvim Düzenleme', kategori: 'TAKVIM' },

    // BİLDİRİM YETKİLERİ
    { kod: 'bildirim.gonder', ad: 'Bildirim Gönderme', kategori: 'BILDIRIM' },
    { kod: 'bildirim.toplu_gonder', ad: 'Toplu Bildirim Gönderme', kategori: 'BILDIRIM' },

    // SHM YETKİLERİ
    { kod: 'shm.veri_giris', ad: 'SHM Veri Girişi', kategori: 'SHM' },
    { kod: 'shm.veri_goruntule', ad: 'SHM Veri Görüntüleme', kategori: 'SHM' },
    { kod: 'shm.veri_duzenle', ad: 'SHM Veri Düzenleme', kategori: 'SHM' },
    { kod: 'shm.veri_onay', ad: 'SHM Veri Onaylama', kategori: 'SHM' },
    { kod: 'shm.rapor', ad: 'SHM Raporlama', kategori: 'SHM' },
    { kod: 'shm.yonetim', ad: 'SHM Yönetim', kategori: 'SHM' }
  ]

  const createdYetkiler = await Promise.all(
    yetkiler.map(yetki =>
      prisma.yetki.upsert({
        where: { kod: yetki.kod },
        update: yetki,
        create: yetki
      })
    )
  )

  console.log(`✅ ${createdYetkiler.length} yetki oluşturuldu`)

  // ============================================
  // 3. ROL-YETKİ EŞLEŞTİRMESİ
  // ============================================
  console.log('🔗 Rol-yetki eşleştirmeleri yapılıyor...')

  const rolYetkiMap: Record<string, string[]> = {
    ADMIN: createdYetkiler.map(y => y.kod), // Tüm yetkiler

    BASKAN: [
      'personel.goruntule', 'personel.ekle', 'personel.duzenle',
      'rol.goruntule', 'yetki.goruntule',
      'birim.goruntule', 'birim.ekle', 'birim.duzenle',
      'gorev.goruntule', 'gorev.olustur', 'gorev.duzenle', 'gorev.onay',
      'asm.veri_goruntule', 'asm.veri_onay',
      'shm.veri_goruntule', 'shm.veri_onay', 'shm.rapor', 'shm.yonetim',
      'rapor.genel', 'rapor.personel', 'rapor.birim', 'rapor.asm', 'rapor.export',
      'takvim.goruntule', 'takvim.duzenle',
      'bildirim.gonder', 'bildirim.toplu_gonder',
      'personel.profil_duzenle'
    ],

    // ANALIST: Eski İstatistikçi + Birim Yöneticisi yetkilerinin birleşimi
    // Müdürlük birimlerinde tüm verileri görebilir
    ANALIST: [
      'personel.goruntule',
      'birim.goruntule',
      'gorev.goruntule', 'gorev.olustur', 'gorev.duzenle', 'gorev.devret', 'gorev.onay',
      'asm.veri_goruntule', 'asm.veri_giris', 'asm.veri_duzenle', 'asm.veri_onay',
      'shm.veri_goruntule', 'shm.veri_giris', 'shm.veri_duzenle', 'shm.veri_onay', 'shm.rapor',
      'rapor.genel', 'rapor.personel', 'rapor.birim', 'rapor.asm', 'rapor.export',
      'takvim.goruntule', 'takvim.duzenle',
      'bildirim.gonder',
      'personel.profil_duzenle'
    ],

    // BIRIM_YONETICISI: Sadece dış birimlerde kullanılır
    // İlgili dış birimin tüm verilerini görür, girer ve onaylar
    BIRIM_YONETICISI: [
      'personel.goruntule',
      'birim.goruntule',
      'gorev.goruntule', 'gorev.olustur', 'gorev.duzenle', 'gorev.onay',
      'asm.veri_goruntule', 'asm.veri_giris', 'asm.veri_duzenle', 'asm.veri_onay',
      'shm.veri_goruntule', 'shm.veri_giris', 'shm.veri_duzenle', 'shm.veri_onay',
      'rapor.birim', 'rapor.asm',
      'takvim.goruntule',
      'bildirim.gonder',
      'personel.profil_duzenle'
    ],

    // PERSONEL:
    // Dış birimlerde: Sadece kendi girdiği verileri görür
    // Müdürlük biriminde: Bağlı dış birimlerin verilerini yönetir
    PERSONEL: [
      'gorev.goruntule',
      'asm.veri_giris', 'asm.veri_goruntule', 'asm.veri_duzenle', 'asm.veri_onay',
      'shm.veri_giris', 'shm.veri_goruntule', 'shm.veri_duzenle', 'shm.veri_onay',
      'takvim.goruntule',
      'personel.profil_duzenle'
    ],

    // MISAFIR:
    MISAFIR: [
      'rapor.genel',
      'takvim.goruntule'
    ]
  }

  for (const [rolKod, yetkiKodlari] of Object.entries(rolYetkiMap)) {
    const rol = createdRoller.find(r => r.kod === rolKod)
    if (!rol) continue

    for (const yetkiKod of yetkiKodlari) {
      const yetki = createdYetkiler.find(y => y.kod === yetkiKod)
      if (!yetki) continue

      await prisma.rolYetki.upsert({
        where: {
          rol_id_yetki_id: {
            rol_id: rol.id,
            yetki_id: yetki.id
          }
        },
        update: {},
        create: {
          rol_id: rol.id,
          yetki_id: yetki.id
        }
      })
    }
  }

  console.log('✅ Rol-yetki eşleştirmeleri tamamlandı')

  // ============================================
  // 4. BİRİMLER OLUŞTUR
  // ============================================
  console.log('🏢 Birimler oluşturuluyor...')

  // MÜDÜRLÜK (MERKEZ)
  const halkSagligiBirim = await prisma.birim.upsert({
    where: { kod: 'MUDURLUK-MERKEZ' },
    update: {},
    create: {
      ad: 'Halk Sağlığı Başkanlığı',
      kod: 'MUDURLUK-MERKEZ',
      tip: 'MUDURLUK',
      ilce: 'İzmit',
      adres: 'Kocaeli İl Sağlık Müdürlüğü',
      telefon: '0262 XXX XX XX',
      email: 'halksagligi@saglik.gov.tr',
      aktif: true
    }
  })

  // KOORDİNASYON BİRİMLERİ (İÇ BİRİMLER)

  // 1. İlçe Sağlık Koordinasyon
  const ilceSaglikKoord = await prisma.birim.upsert({
    where: { kod: 'KOORD-ILCE' },
    update: {},
    create: {
      ad: 'İlçe Sağlık Koordinasyon Birimi',
      kod: 'KOORD-ILCE',
      tip: 'MUDURLUK',
      ilce: 'İzmit',
      ust_birim_id: halkSagligiBirim.id,
      aktif: true
    }
  })

  // 2. SHM Koordinasyon
  const shmKoord = await prisma.birim.upsert({
    where: { kod: 'KOORD-SHM' },
    update: {},
    create: {
      ad: 'Sağlıklı Hayat Merkezleri (SHM) Birimi',
      kod: 'KOORD-SHM',
      tip: 'MUDURLUK',
      ilce: 'İzmit',
      ust_birim_id: halkSagligiBirim.id,
      aktif: true
    }
  })

  // 3. ASM Koordinasyon
  const asmKoord = await prisma.birim.upsert({
    where: { kod: 'KOORD-ASM' },
    update: {},
    create: {
      ad: 'Aile Hekimliği (ASM) Birimi',
      kod: 'KOORD-ASM',
      tip: 'MUDURLUK',
      ilce: 'İzmit',
      ust_birim_id: halkSagligiBirim.id,
      aktif: true
    }
  })

  // DIŞ BİRİMLER

  // İzmit İlçe Sağlık Müdürlüğü -> İlçe Koord'a bağlı
  const izmitIlceSaglik = await prisma.birim.upsert({
    where: { kod: 'ILCE-IZMIT' },
    update: { ust_birim_id: ilceSaglikKoord.id },
    create: {
      ad: 'İzmit İlçe Sağlık Müdürlüğü',
      kod: 'ILCE-IZMIT',
      tip: 'DIS_BIRIM',
      dis_birim_tip: 'ILCE_SAGLIK',
      ilce: 'İzmit',
      ust_birim_id: ilceSaglikKoord.id,
      aktif: true
    }
  })

  // Kartepe İlçe Sağlık Müdürlüğü -> İlçe Koord'a bağlı
  await prisma.birim.upsert({
    where: { kod: 'ILCE-KARTEPE' },
    update: { ust_birim_id: ilceSaglikKoord.id },
    create: {
      ad: 'Kartepe İlçe Sağlık Müdürlüğü',
      kod: 'ILCE-KARTEPE',
      tip: 'DIS_BIRIM',
      dis_birim_tip: 'ILCE_SAGLIK',
      ilce: 'Kartepe',
      ust_birim_id: ilceSaglikKoord.id,
      aktif: true
    }
  })

  // Akçakoca Sağlıklı Hayat Merkezi -> SHM Koord'a bağlı
  const akcakocaSHM = await prisma.birim.upsert({
    where: { kod: 'SHM-IZMIT-AKCAKOCA' },
    update: { ust_birim_id: shmKoord.id },
    create: {
      ad: 'İzmit Akçakoca Sağlıklı Hayat Merkezi',
      kod: 'SHM-IZMIT-AKCAKOCA',
      tip: 'DIS_BIRIM',
      dis_birim_tip: 'SHM',
      ilce: 'İzmit',
      ust_birim_id: shmKoord.id,
      aktif: true
    }
  })

  // Gebze Merkez ASM -> ASM Koord'a bağlı
  await prisma.birim.upsert({
    where: { kod: 'ASM-GEBZE-MERKEZ' },
    update: { ust_birim_id: asmKoord.id },
    create: {
      ad: 'Gebze Merkez 1 Nolu ASM',
      kod: 'ASM-GEBZE-MERKEZ',
      tip: 'DIS_BIRIM',
      dis_birim_tip: 'ASM',
      ilce: 'Gebze',
      ust_birim_id: asmKoord.id,
      aktif: true
    }
  })

  console.log('✅ Birimler oluşturuldu')

  // ============================================
  // 5. KULLANICILAR OLUŞTUR
  // ============================================
  console.log('👤 Kullanıcılar oluşturuluyor...')

  const adminRol = createdRoller.find(r => r.kod === 'ADMIN')
  const baskanRol = createdRoller.find(r => r.kod === 'BASKAN')
  const yoneticiRol = createdRoller.find(r => r.kod === 'BIRIM_YONETICISI')

  const hashedPassword = await bcrypt.hash('admin123', 10)

  // 1. ADMIN (Sistem Admin)
  await prisma.personel.upsert({
    where: { tc_kimlik_no: '11111111111' },
    update: {
      rol_id: adminRol!.id,
      birim_id: halkSagligiBirim.id,
      profil_foto_url: 'https://static.fokusistatistik.com/CRM/yonetim_250001_emre_bostanoglu.jpeg',
    },
    create: {
      tc_kimlik_no: '11111111111',
      ad: 'Sistem',
      soyad: 'Admin',
      email: 'admin@saglik.gov.tr',
      password: hashedPassword,
      telefon: '05550000000',
      rol_id: adminRol!.id,
      birim_id: halkSagligiBirim.id, // Admin Başkanlığa bağlı yapalım veya ayrı
      unvan: 'Sistem Yöneticisi',
      profil_foto_url: 'https://static.fokusistatistik.com/CRM/yonetim_250001_emre_bostanoglu.jpeg',
      aktif: true
    }
  })

  // 2. HALK SAĞLIĞI BAŞKANI (Ahmet Yılmaz)
  await prisma.personel.upsert({
    where: { tc_kimlik_no: '22222222222' },
    update: {},
    create: {
      tc_kimlik_no: '22222222222',
      ad: 'Ahmet',
      soyad: 'Yılmaz',
      email: 'ahmet.yilmaz@saglik.gov.tr',
      password: hashedPassword,
      telefon: '05552222222',
      rol_id: baskanRol!.id,
      birim_id: halkSagligiBirim.id,
      unvan: 'Halk Sağlığı Başkanı',
      profil_foto_url: 'https://ui-avatars.com/api/?name=Ahmet+Yilmaz&background=random',
      aktif: true
    }
  })

  // 3. İZMİT BİRİM YÖNETİCİSİ (Mehmet Demir)
  await prisma.personel.upsert({
    where: { tc_kimlik_no: '33333333333' },
    update: {},
    create: {
      tc_kimlik_no: '33333333333',
      ad: 'Mehmet',
      soyad: 'Demir',
      email: 'mehmet.demir@saglik.gov.tr',
      password: hashedPassword,
      telefon: '05553333333',
      rol_id: yoneticiRol!.id,
      birim_id: izmitIlceSaglik.id,
      unvan: 'Birim Yöneticisi',
      ilce: 'İzmit',
      profil_foto_url: 'https://ui-avatars.com/api/?name=Mehmet+Demir&background=random',
      aktif: true
    }
  })

  // 4. AKÇAKOCA SHM BİRİM YÖNETİCİSİ (Ayşe Kaya)
  await prisma.personel.upsert({
    where: { tc_kimlik_no: '44444444444' },
    update: {},
    create: {
      tc_kimlik_no: '44444444444',
      ad: 'Ayşe',
      soyad: 'Kaya',
      email: 'ayse.kaya@saglik.gov.tr',
      password: hashedPassword,
      telefon: '05554444444',
      rol_id: yoneticiRol!.id,
      birim_id: akcakocaSHM.id,
      unvan: 'Birim Yöneticisi',
      ilce: 'İzmit',
      profil_foto_url: 'https://ui-avatars.com/api/?name=Ayse+Kaya&background=random',
      aktif: true
    }
  })

  console.log('🎉 Seed data tamamlandı!')
  console.log('----------------------------------------------------')
  console.log('🔑 DEMO KULLANICI GİRİŞ BİLGİLERİ (Şifre: admin123)')
  console.log('----------------------------------------------------')
  console.log('1. SİSTEM YÖNETİCİSİ: TC [11111111111] (admin@saglik.gov.tr)')
  console.log('2. BAŞKAN:            TC [22222222222] (Ahmet Yılmaz)')
  console.log('3. BİRİM YÖNETİCİSİ:  TC [33333333333] (Mehmet Demir - İzmit İlçe Sağlık)')
  console.log('4. BİRİM YÖNETİCİSİ:  TC [44444444444] (Ayşe Kaya    - Akçakoca SHM)')
  console.log('----------------------------------------------------')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Seed hatası:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
