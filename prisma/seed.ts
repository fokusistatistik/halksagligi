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
      kod: 'ISTATISTIKCI',
      ad: 'İstatistik Uzmanı',
      seviye: 8,
      renk: '#2563EB',
      icon: 'bar-chart-3',
      aciklama: 'Veri analizi, raporlama ve istatistik işlemlerinden sorumlu'
    },
    {
      kod: 'BIRIM_YONETICISI',
      ad: 'Birim Yöneticisi',
      seviye: 7,
      renk: '#059669',
      icon: 'briefcase',
      aciklama: 'ASM veya başkanlık birim yöneticisi'
    },
    {
      kod: 'PERSONEL',
      ad: 'Personel',
      seviye: 4,
      renk: '#0891B2',
      icon: 'user',
      aciklama: 'Standart personel, görev takibi ve veri girişi yapar'
    },
    {
      kod: 'DIS_BIRIM',
      ad: 'Dış Birim Kullanıcısı',
      seviye: 2,
      renk: '#64748B',
      icon: 'building',
      aciklama: 'ASM gibi dış birimlerin sınırlı erişimi'
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

    ISTATISTIKCI: [
      'personel.goruntule',
      'birim.goruntule',
      'gorev.goruntule',
      'asm.veri_goruntule', 'asm.veri_giris', 'asm.veri_duzenle',
      'shm.veri_goruntule', 'shm.veri_giris', 'shm.veri_duzenle', 'shm.rapor',
      'rapor.genel', 'rapor.personel', 'rapor.birim', 'rapor.asm', 'rapor.export',
      'takvim.goruntule',
      'personel.profil_duzenle'
    ],

    BIRIM_YONETICISI: [
      'personel.goruntule',
      'birim.goruntule',
      'gorev.goruntule', 'gorev.olustur', 'gorev.duzenle', 'gorev.devret', 'gorev.onay',
      'asm.veri_goruntule', 'asm.veri_giris', 'asm.veri_duzenle', 'asm.veri_onay',
      'shm.veri_goruntule', 'shm.veri_giris', 'shm.veri_duzenle', 'shm.veri_onay', 'shm.rapor',
      'rapor.birim', 'rapor.asm',
      'takvim.goruntule', 'takvim.duzenle',
      'bildirim.gonder',
      'personel.profil_duzenle'
    ],

    PERSONEL: [
      'gorev.goruntule',
      'asm.veri_giris',
      'shm.veri_giris',
      'takvim.goruntule',
      'personel.profil_duzenle'
    ],

    DIS_BIRIM: [
      'asm.veri_giris',
      'asm.veri_goruntule',
      'shm.veri_giris',
      'shm.veri_goruntule',
      'takvim.goruntule',
      'personel.profil_duzenle'
    ],

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

  const halkSagligiBirim = await prisma.birim.upsert({
    where: { kod: 'HS-MERKEZ' },
    update: {},
    create: {
      ad: 'Halk Sağlığı Başkanlığı',
      kod: 'HS-MERKEZ',
      tip: 'BASKANLIK_BIRIMI',
      adres: 'Kocaeli İl Sağlık Müdürlüğü',
      telefon: '0262 XXX XX XX',
      email: 'halksagligi@saglik.gov.tr',
      aktif: true
    }
  })

  const asmMerkez = await prisma.birim.upsert({
    where: { kod: 'ASM-MERKEZ' },
    update: {},
    create: {
      ad: 'ASM Merkez',
      kod: 'ASM-MERKEZ',
      tip: 'ASM',
      ust_birim_id: halkSagligiBirim.id,
      telefon: '0262 XXX XX XX',
      aktif: true
    }
  })

  await prisma.birim.upsert({
    where: { kod: 'ASM-DOGU' },
    update: {},
    create: {
      ad: 'ASM Doğu',
      kod: 'ASM-DOGU',
      tip: 'ASM',
      ust_birim_id: halkSagligiBirim.id,
      telefon: '0262 XXX XX XX',
      aktif: true
    }
  })

  await prisma.birim.upsert({
    where: { kod: 'ASM-BATI' },
    update: {},
    create: {
      ad: 'ASM Batı',
      kod: 'ASM-BATI',
      tip: 'ASM',
      ust_birim_id: halkSagligiBirim.id,
      telefon: '0262 XXX XX XX',
      aktif: true
    }
  })

  // SHM Merkez Birimi
  const shmMerkez = await prisma.birim.upsert({
    where: { kod: 'SHM-MERKEZ' },
    update: {},
    create: {
      ad: 'Sağlıklı Hayat Merkezi',
      kod: 'SHM-MERKEZ',
      tip: 'SHM',
      ust_birim_id: halkSagligiBirim.id,
      telefon: '0262 XXX XX XX',
      email: 'shm@saglik.gov.tr',
      aktif: true
    }
  })

  console.log('✅ Birimler oluşturuldu')

  // ============================================
  // 4.1. SHM ALT BİRİMLERİ OLUŞTUR
  // ============================================
  console.log('🏥 SHM Alt Birimleri oluşturuluyor...')

  const shmAltBirimler = [
    {
      ad: 'Beslenme Danışmanlığı',
      kod: 'SHM-BESLENME',
      tip: 'BESLENME_DANISMANLIGI'
    },
    {
      ad: 'Kronik Hastalıklar ve Fiziksel Aktivite Danışmanlığı',
      kod: 'SHM-KRONIK',
      tip: 'KRONIK_HASTALIKLAR_FIZIKSEL_AKTIVITE'
    },
    {
      ad: 'Kadın ve Üreme Sağlığı Danışmanlığı',
      kod: 'SHM-KADIN',
      tip: 'KADIN_UREME_SAGLIGI'
    },
    {
      ad: 'Kanser Erken Teşhis, Tarama ve Eğitim Merkezi',
      kod: 'SHM-KANSER',
      tip: 'KANSER_ERKEN_TESHIS'
    },
    {
      ad: 'Ruh Sağlığı Danışmanlığı',
      kod: 'SHM-RUH',
      tip: 'RUH_SAGLIGI'
    },
    {
      ad: 'Çocuk ve Ergen Sağlığı Danışmanlığı',
      kod: 'SHM-COCUK',
      tip: 'COCUK_ERGEN_SAGLIGI'
    },
    {
      ad: 'Tütün ve Madde Bağımlılığı Danışmanlığı',
      kod: 'SHM-BAGIMLILI',
      tip: 'TUTUN_MADDE_BAGIMLILIGI'
    },
    {
      ad: 'Enfeksiyon Kontrol Hizmetleri',
      kod: 'SHM-ENFEKSIYON',
      tip: 'ENFEKSIYON_KONTROL'
    },
    {
      ad: 'Koruyucu Ağız ve Diş Sağlığı Danışmanlığı',
      kod: 'SHM-DIS',
      tip: 'AGIZ_DIS_SAGLIGI'
    },
    {
      ad: 'Tıbbi Hizmetler',
      kod: 'SHM-TIBBI',
      tip: 'TIBBI_HIZMETLER'
    },
    {
      ad: 'İdari Hizmetler',
      kod: 'SHM-IDARI',
      tip: 'IDARI_HIZMETLER'
    }
  ]

  for (const altBirim of shmAltBirimler) {
    await prisma.sHMAltBirim.upsert({
      where: { kod: altBirim.kod },
      update: {},
      create: {
        ad: altBirim.ad,
        kod: altBirim.kod,
        tip: altBirim.tip as any,
        shm_birim_id: shmMerkez.id,
        aktif: true
      }
    })
  }

  console.log(`✅ ${shmAltBirimler.length} SHM alt birimi oluşturuldu`)

  // ============================================
  // 5. İLK ADMIN KULLANICISI OLUŞTUR
  // ============================================
  console.log('👤 Admin kullanıcısı oluşturuluyor...')

  const adminRol = createdRoller.find(r => r.kod === 'ADMIN')
  const hashedPassword = await bcrypt.hash('admin123', 10)

  const adminUser = await prisma.personel.upsert({
    where: { email: 'admin@saglik.gov.tr' },
    update: {},
    create: {
      tc_kimlik_no: '12345678901',
      ad: 'Admin',
      soyad: 'Kullanıcı',
      email: 'admin@saglik.gov.tr',
      password: hashedPassword,
      telefon: '0555 XXX XX XX',
      rol_id: adminRol!.id,
      birim_id: halkSagligiBirim.id,
      unvan: 'Sistem Yöneticisi',
      aktif: true
    }
  })

  console.log('✅ Admin kullanıcısı oluşturuldu')
  console.log('')
  console.log('🎉 Seed data tamamlandı!')
  console.log('📧 Admin Email: admin@saglik.gov.tr')
  console.log('🔒 Admin Şifre: admin123')
  console.log('')
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
