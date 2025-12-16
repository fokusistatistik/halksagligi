import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { logAktivite, getIpFromHeaders, getUserAgentFromHeaders } from '@/lib/log';

const onaySchema = z.object({
  veri_giris_id: z.string().uuid(),
  onaylayan_personel_id: z.string().uuid(),
  onay_durumu: z.enum(['ONAYLANDI', 'REDDEDILDI']),
  onay_notu: z.string().optional()
});

/**
 * POST /api/shm/veri-giris/onay
 * Veri girişini onayla veya reddet
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = onaySchema.parse(body);

    const mevcutKayit = await prisma.sHMVeriGiris.findUnique({
      where: { id: validated.veri_giris_id }
    });

    if (!mevcutKayit) {
      return NextResponse.json(
        { error: 'Veri girişi bulunamadı' },
        { status: 404 }
      );
    }

    if (mevcutKayit.onay_durumu !== 'BEKLEMEDE') {
      return NextResponse.json(
        { error: 'Bu kayıt zaten onaylanmış veya reddedilmiş' },
        { status: 400 }
      );
    }

    const updated = await prisma.sHMVeriGiris.update({
      where: { id: validated.veri_giris_id },
      data: {
        onay_durumu: validated.onay_durumu,
        onaylayan_personel_id: validated.onaylayan_personel_id,
        onay_tarihi: new Date(),
        onay_notu: validated.onay_notu
      },
      include: {
        shm_alt_birim: true
      }
    });

    // Aktivite logu
    await logAktivite({
      personel_id: validated.onaylayan_personel_id,
      islem: `shm.veri_giris.${validated.onay_durumu.toLowerCase()}`,
      tablo: 'shm_veri_giris',
      kayit_id: validated.veri_giris_id,
      eski_veri: mevcutKayit,
      yeni_veri: updated,
      aciklama: validated.onay_notu,
      ip_adresi: getIpFromHeaders(request.headers),
      user_agent: getUserAgentFromHeaders(request.headers)
    });

    return NextResponse.json({
      success: true,
      data: updated,
      message: validated.onay_durumu === 'ONAYLANDI'
        ? 'Veri girişi onaylandı'
        : 'Veri girişi reddedildi'
    });
  } catch (error: any) {
    if (error.errors) {
      return NextResponse.json(
        { error: 'Geçersiz veri', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Onay işlemi başarısız' },
      { status: 500 }
    );
  }
}
