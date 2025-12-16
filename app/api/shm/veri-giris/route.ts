import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { logAktivite, getIpFromHeaders, getUserAgentFromHeaders } from '@/lib/log';

const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || 'https://n8n.fokusistatistik.com';

// Veri giriş validation schema
const veriGirisSchema = z.object({
  shm_alt_birim_id: z.string().uuid('Geçerli bir alt birim seçiniz'),
  personel_id: z.string().uuid('Geçerli bir personel ID giriniz'),
  tarih: z.string().refine((val) => !isNaN(Date.parse(val)), 'Geçerli bir tarih giriniz'),
  poliklinik_islem_sayisi: z.number().int().min(0, 'İşlem sayısı negatif olamaz'),
  poliklinik_kontrol_sayisi: z.number().int().min(0, 'Kontrol sayısı negatif olamaz'),
  brans_verileri: z.record(z.any()).optional(),
  sorumlu_adi: z.string().optional(),
  sorumlu_unvan: z.string().optional(),
  aciklama: z.string().optional(),
  notlar: z.string().optional()
});

/**
 * GET /api/shm/veri-giris
 * Veri girişlerini listeler (filtreleme destekli)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const altBirimId = searchParams.get('alt_birim_id');
    const personelId = searchParams.get('personel_id');
    const baslangicTarihi = searchParams.get('baslangic_tarihi');
    const bitisTarihi = searchParams.get('bitis_tarihi');
    const onayDurumu = searchParams.get('onay_durumu');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const whereClause: any = {};

    if (altBirimId) whereClause.shm_alt_birim_id = altBirimId;
    if (personelId) whereClause.personel_id = personelId;
    if (onayDurumu) whereClause.onay_durumu = onayDurumu;

    if (baslangicTarihi || bitisTarihi) {
      whereClause.tarih = {};
      if (baslangicTarihi) whereClause.tarih.gte = new Date(baslangicTarihi);
      if (bitisTarihi) whereClause.tarih.lte = new Date(bitisTarihi);
    }

    const [veriGirisleri, toplam] = await Promise.all([
      prisma.sHMVeriGiris.findMany({
        where: whereClause,
        include: {
          shm_alt_birim: {
            select: {
              id: true,
              ad: true,
              kod: true,
              tip: true
            }
          }
        },
        orderBy: { tarih: 'desc' },
        take: limit,
        skip: offset
      }),
      prisma.sHMVeriGiris.count({ where: whereClause })
    ]);

    return NextResponse.json({
      success: true,
      data: veriGirisleri,
      pagination: {
        toplam,
        limit,
        offset,
        sayfa: Math.floor(offset / limit) + 1,
        toplamSayfa: Math.ceil(toplam / limit)
      }
    });
  } catch (_error) {
    return NextResponse.json(
      { error: 'Veri girişleri yüklenemedi' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/shm/veri-giris
 * Yeni veri girişi oluşturur ve webhook'a gönderir
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = veriGirisSchema.parse(body);

    // Aynı gün aynı kişi aynı birimde kayıt var mı kontrol et
    const mevcutKayit = await prisma.sHMVeriGiris.findFirst({
      where: {
        shm_alt_birim_id: validated.shm_alt_birim_id,
        personel_id: validated.personel_id,
        tarih: new Date(validated.tarih)
      }
    });

    if (mevcutKayit) {
      return NextResponse.json(
        { error: 'Bu tarih için zaten veri girişi yapılmış' },
        { status: 400 }
      );
    }

    // Veri girişini oluştur
    const veriGiris = await prisma.sHMVeriGiris.create({
      data: {
        ...validated,
        tarih: new Date(validated.tarih),
        onay_durumu: 'BEKLEMEDE'
      },
      include: {
        shm_alt_birim: true
      }
    });

    // Webhook'a gönder (async, blocking değil)
    try {
      const webhookResponse = await fetch(`${N8N_WEBHOOK_URL}/webhook/shm-veri-giris`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          veri_giris: veriGiris,
          timestamp: new Date().toISOString()
        })
      });

      if (webhookResponse.ok) {
        await prisma.sHMVeriGiris.update({
          where: { id: veriGiris.id },
          data: {
            webhook_gonderildi: true,
            webhook_gonderim_tarihi: new Date(),
            webhook_yanit: await webhookResponse.json()
          }
        });
      }
    } catch (webhookError) {
      console.error('Webhook hatası:', webhookError);
      // Webhook hatası veri girişini engellemez
    }

    // Aktivite logu
    await logAktivite({
      personel_id: validated.personel_id,
      islem: 'shm.veri_giris.olustur',
      tablo: 'shm_veri_giris',
      kayit_id: veriGiris.id,
      yeni_veri: veriGiris,
      ip_adresi: getIpFromHeaders(request.headers),
      user_agent: getUserAgentFromHeaders(request.headers)
    });

    return NextResponse.json({
      success: true,
      data: veriGiris,
      message: 'Veri girişi başarıyla oluşturuldu'
    }, { status: 201 });

  } catch (error: any) {
    console.error('Veri giriş hatası:', error);

    if (error.errors) {
      return NextResponse.json(
        { error: 'Geçersiz veri', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Veri girişi oluşturulamadı' },
      { status: 500 }
    );
  }
}
