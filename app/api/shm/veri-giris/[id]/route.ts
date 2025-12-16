import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { logAktivite, getIpFromHeaders, getUserAgentFromHeaders } from '@/lib/log';

const updateSchema = z.object({
  poliklinik_islem_sayisi: z.number().int().min(0).optional(),
  poliklinik_kontrol_sayisi: z.number().int().min(0).optional(),
  brans_verileri: z.record(z.any()).optional(),
  sorumlu_adi: z.string().optional(),
  sorumlu_unvan: z.string().optional(),
  aciklama: z.string().optional(),
  notlar: z.string().optional()
});

/**
 * GET /api/shm/veri-giris/[id]
 * Tek bir veri girişini getirir
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const veriGiris = await prisma.sHMVeriGiris.findUnique({
      where: { id: params.id },
      include: {
        shm_alt_birim: true
      }
    });

    if (!veriGiris) {
      return NextResponse.json(
        { error: 'Veri girişi bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: veriGiris
    });
  } catch (_error) {
    return NextResponse.json(
      { error: 'Veri girişi yüklenemedi' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/shm/veri-giris/[id]
 * Veri girişini günceller
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const validated = updateSchema.parse(body);

    const mevcutKayit = await prisma.sHMVeriGiris.findUnique({
      where: { id: params.id }
    });

    if (!mevcutKayit) {
      return NextResponse.json(
        { error: 'Veri girişi bulunamadı' },
        { status: 404 }
      );
    }

    // Onaylanmış kayıtlar güncellenemez
    if (mevcutKayit.onay_durumu === 'ONAYLANDI') {
      return NextResponse.json(
        { error: 'Onaylanmış kayıtlar güncellenemez' },
        { status: 403 }
      );
    }

    const updated = await prisma.sHMVeriGiris.update({
      where: { id: params.id },
      data: validated,
      include: {
        shm_alt_birim: true
      }
    });

    // Aktivite logu
    await logAktivite({
      personel_id: mevcutKayit.personel_id,
      islem: 'shm.veri_giris.guncelle',
      tablo: 'shm_veri_giris',
      kayit_id: params.id,
      eski_veri: mevcutKayit,
      yeni_veri: updated,
      ip_adresi: getIpFromHeaders(request.headers),
      user_agent: getUserAgentFromHeaders(request.headers)
    });

    return NextResponse.json({
      success: true,
      data: updated,
      message: 'Veri girişi güncellendi'
    });
  } catch (error: any) {
    if (error.errors) {
      return NextResponse.json(
        { error: 'Geçersiz veri', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Veri girişi güncellenemedi' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/shm/veri-giris/[id]
 * Veri girişini siler
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const mevcutKayit = await prisma.sHMVeriGiris.findUnique({
      where: { id: params.id }
    });

    if (!mevcutKayit) {
      return NextResponse.json(
        { error: 'Veri girişi bulunamadı' },
        { status: 404 }
      );
    }

    // Onaylanmış kayıtlar silinemez
    if (mevcutKayit.onay_durumu === 'ONAYLANDI') {
      return NextResponse.json(
        { error: 'Onaylanmış kayıtlar silinemez' },
        { status: 403 }
      );
    }

    await prisma.sHMVeriGiris.delete({
      where: { id: params.id }
    });

    // Aktivite logu
    await logAktivite({
      personel_id: mevcutKayit.personel_id,
      islem: 'shm.veri_giris.sil',
      tablo: 'shm_veri_giris',
      kayit_id: params.id,
      eski_veri: mevcutKayit,
      ip_adresi: getIpFromHeaders(request.headers),
      user_agent: getUserAgentFromHeaders(request.headers)
    });

    return NextResponse.json({
      success: true,
      message: 'Veri girişi silindi'
    });
  } catch (_error) {
    return NextResponse.json(
      { error: 'Veri girişi silinemedi' },
      { status: 500 }
    );
  }
}
