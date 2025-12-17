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
      aciklama: 'Dış birimlerde (ASM, HSM, VSD, İlçe Sağlık) birim yöneticisi - Tüm verileri görür, girer ve onaylar'
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

  // MÜDÜRLÜK BİRİMLERİ
  const halkSagligiBirim = await prisma.birim.upsert({
    where: { kod: 'MUDURLUK-MERKEZ' },
    update: {},
    create: {
      ad: 'Halk Sağlığı Müdürlüğü',
      kod: 'MUDURLUK-MERKEZ',
      tip: 'MUDURLUK',
      adres: 'Kocaeli İl Sağlık Müdürlüğü',
      telefon: '0262 XXX XX XX',
      email: 'halksagligi@saglik.gov.tr',
      aktif: true
    }
  })

  const asmSubesi = await prisma.birim.upsert({
    where: { kod: 'MUDURLUK-ASM-SUBE' },
    update: {},
    create: {
      ad: 'ASM Şubesi',
      kod: 'MUDURLUK-ASM-SUBE',
      tip: 'MUDURLUK',
      ust_birim_id: halkSagligiBirim.id,
      telefon: '0262 XXX XX XX',
      aktif: true
    }
  })

  const hsmSubesi = await prisma.birim.upsert({
    where: { kod: 'MUDURLUK-HSM-SUBE' },
    update: {},
    create: {
      ad: 'HSM Şubesi (Sağlıklı Hayat Merkezi)',
      kod: 'MUDURLUK-HSM-SUBE',
      tip: 'MUDURLUK',
      ust_birim_id: halkSagligiBirim.id,
      telefon: '0262 XXX XX XX',
      aktif: true
    }
  })

  const vsdSubesi = await prisma.birim.upsert({
    where: { kod: 'MUDURLUK-VSD-SUBE' },
    update: {},
    create: {
      ad: 'VSD Şubesi (Verem Savaş)',
      kod: 'MUDURLUK-VSD-SUBE',
      tip: 'MUDURLUK',
      ust_birim_id: halkSagligiBirim.id,
      telefon: '0262 XXX XX XX',
      aktif: true
    }
  })

  // DIŞ BİRİMLER - ASM Örnekleri
  await prisma.birim.upsert({
    where: { kod: 'ASM-IZMIT-ALIKAHYA' },
    update: {},
    create: {
      ad: 'İzmit Alikahya Aile Sağlığı Merkezi',
      kod: 'ASM-IZMIT-ALIKAHYA',
      tip: 'DIS_BIRIM',
      dis_birim_tip: 'ASM',
      ust_birim_id: asmSubesi.id,
      telefon: '0262 XXX XX XX',
      aktif: true
    }
  })

  await prisma.birim.upsert({
    where: { kod: 'ASM-GEBZE-MERKEZ' },
    update: {},
    create: {
      ad: 'Gebze Merkez Aile Sağlığı Merkezi',
      kod: 'ASM-GEBZE-MERKEZ',
      tip: 'DIS_BIRIM',
      dis_birim_tip: 'ASM',
      ust_birim_id: asmSubesi.id,
      telefon: '0262 XXX XX XX',
      aktif: true
    }
  })

  // DIŞ BİRİMLER - HSM Örneği
  await prisma.birim.upsert({
    where: { kod: 'HSM-KOCAELI' },
    update: {},
    create: {
      ad: 'Kocaeli Sağlıklı Hayat Merkezi',
      kod: 'HSM-KOCAELI',
      tip: 'DIS_BIRIM',
      dis_birim_tip: 'HSM',
      ust_birim_id: hsmSubesi.id,
      telefon: '0262 XXX XX XX',
      email: 'hsm@saglik.gov.tr',
      aktif: true
    }
  })

  // DIŞ BİRİMLER - VSD Örneği
  await prisma.birim.upsert({
    where: { kod: 'VSD-KOCAELI' },
    update: {},
    create: {
      ad: 'Kocaeli Verem Savaş Dispanseri',
      kod: 'VSD-KOCAELI',
      tip: 'DIS_BIRIM',
      dis_birim_tip: 'VSD',
      ust_birim_id: vsdSubesi.id,
      telefon: '0262 XXX XX XX',
      aktif: true
    }
  })

  // DIŞ BİRİMLER - İlçe Sağlık Örneği
  await prisma.birim.upsert({
    where: { kod: 'ILCE-GEBZE' },
    update: {},
    create: {
      ad: 'Gebze İlçe Sağlık Müdürlüğü',
      kod: 'ILCE-GEBZE',
      tip: 'DIS_BIRIM',
      dis_birim_tip: 'ILCE_SAGLIK',
      ust_birim_id: halkSagligiBirim.id,
      telefon: '0262 XXX XX XX',
      aktif: true
    }
  })

  console.log('✅ Birimler oluşturuldu (Müdürlük ve Dış Birimler)')

  // ============================================
  // 5. İLK ADMIN KULLANICISI OLUŞTUR
  // ============================================
  console.log('👤 Admin kullanıcısı oluşturuluyor...')

  const adminRol = createdRoller.find(r => r.kod === 'ADMIN')
  const hashedPassword = await bcrypt.hash('admin123', 10)

  await prisma.personel.upsert({
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
