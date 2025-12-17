import { NextRequest, NextResponse } from 'next/server';
import { sifreDegistirSchema } from '@/lib/validations/password';
import { logAktivite } from '@/lib/log';

const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || 'https://n8n.fokusistatistik.com';

/**
 * POST /api/sifre-degistir
 * Kullanıcının şifresini değiştirir (ilk giriş veya normal şifre değiştirme)
 * n8n webhook'a proxy yapar
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validation
    const validated = sifreDegistirSchema.parse(body);

    // IP adresi al
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

    // n8n webhook'a istek gönder
    const response = await fetch(`${N8N_WEBHOOK_URL}/webhook/sifre-degistir`, {
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
      // Log: Başarısız şifre değiştirme
      await logAktivite({
        personel_email: data.email || 'unknown',
        islem: 'sifre.degistir.basarisiz',
        tablo: 'personel',
        aciklama: `Şifre değiştirme başarısız: ${data.error || 'Bilinmeyen hata'}`,
      });

      return NextResponse.json(
        { error: data.error || 'Şifre değiştirilemedi' },
        { status: response.status }
      );
    }

    // Log: Başarılı şifre değiştirme
    await logAktivite({
      personel_id: data.personel_id,
      personel_email: data.email,
      islem: 'sifre.degistir',
      tablo: 'personel',
      kayit_id: data.personel_id,
      aciklama: `Şifre başarıyla değiştirildi${data.ilk_giris ? ' (İlk giriş)' : ''}`,
    });

    // Response oluştur ve ilk_giris cookie'sini güncelle
    const nextResponse = NextResponse.json({
      success: true,
      message: 'Şifre başarıyla değiştirildi',
    });

    // İlk giriş ise cookie'yi false yap
    if (data.ilk_giris) {
      nextResponse.cookies.set('ilk_giris', 'false', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 gün
        path: '/',
      });
    }

    return nextResponse;
  } catch (error: any) {
    console.error('Şifre değiştirme hatası:', error);

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
