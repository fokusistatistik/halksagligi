import { NextRequest, NextResponse } from 'next/server';
import { sifreYenileSchema } from '@/lib/validations/password';
import { logAktivite } from '@/lib/log';

const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || 'https://n8n.fokusistatistik.com';

/**
 * POST /api/sifre-yenile
 * Token ile şifre yeniler
 * n8n webhook'a proxy yapar
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validation
    const validated = sifreYenileSchema.parse(body);

    // IP adresi al
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

    // n8n webhook'a istek gönder
    const response = await fetch(`${N8N_WEBHOOK_URL}/webhook/sifre-yenile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...validated,
        ip_adresi: ip,
        user_agent: request.headers.get('user-agent'),
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      // Log: Başarısız şifre yenileme
      await logAktivite({
        islem: 'sifre.yenile.basarisiz',
        tablo: 'personel',
        aciklama: `Şifre yenileme başarısız: ${data.error || 'Bilinmeyen hata'}`,
      });

      return NextResponse.json(
        { error: data.error || 'Şifre yenilenemedi' },
        { status: response.status }
      );
    }

    // Log: Başarılı şifre yenileme
    await logAktivite({
      personel_id: data.personel_id,
      personel_email: data.email,
      islem: 'sifre.yenile',
      tablo: 'personel',
      kayit_id: data.personel_id,
      aciklama: `Şifre token ile yenilendi`,
    });

    return NextResponse.json({
      success: true,
      message: 'Şifre başarıyla yenilendi',
    });
  } catch (error: any) {
    console.error('Şifre yenileme hatası:', error);

    // Zod validation hatası
    if (error.errors) {
      return NextResponse.json(
        { error: 'Geçersiz veri', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Bir hata oluştu' },
      { status: 500 }
    );
  }
}
