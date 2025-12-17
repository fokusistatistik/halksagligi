import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { logAktivite } from '@/lib/log';
import { checkRateLimit, getIpFromRequest, RATE_LIMITS } from '@/lib/rate-limit';

const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || 'https://n8n.fokusistatistik.com';

// Login validation schema
const loginSchema = z.object({
  tc_kimlik_no: z.string().regex(/^\d{11}$/, 'Geçerli bir TC Kimlik No giriniz (11 hane)'),
  password: z.string().min(1, 'Şifre gereklidir'),
});

/**
 * POST /api/login
 * Kullanıcı girişi yapar
 * n8n webhook'a proxy yapar ve ilk_giris flag'ini kontrol eder
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validation
    const validated = loginSchema.parse(body);

    // IP adresi al
    const ip = getIpFromRequest(request);

    // Rate limiting kontrolü (15 dakikada 5 istek)
    const rateLimit = checkRateLimit(ip, 'login', RATE_LIMITS.LOGIN);
    if (!rateLimit.allowed) {
      await logAktivite({
        islem: 'login.rate_limit',
        tablo: 'personel',
        aciklama: `Login rate limit aşıldı: TC ${validated.tc_kimlik_no}, IP: ${ip}`,
      });

      return NextResponse.json(
        {
          error: `Çok fazla başarısız giriş denemesi. Lütfen ${rateLimit.retryAfter} saniye sonra tekrar deneyiniz.`,
        },
        {
          status: 429,
          headers: {
            'Retry-After': rateLimit.retryAfter?.toString() || '900',
          },
        }
      );
    }

    // n8n webhook'a istek gönder
    const response = await fetch(`${N8N_WEBHOOK_URL}/webhook/login`, {
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
      // Log: Başarısız login
      await logAktivite({
        islem: 'login.basarisiz',
        tablo: 'personel',
        aciklama: `Başarısız giriş denemesi: TC ${validated.tc_kimlik_no} - ${data.error || 'Bilinmeyen hata'}`,
      });

      return NextResponse.json(
        { error: data.error || 'Giriş başarısız' },
        { status: response.status }
      );
    }

    // Log: Başarılı login
    await logAktivite({
      personel_id: data.personel.id,
      personel_email: data.personel.email,
      islem: 'login',
      tablo: 'personel',
      kayit_id: data.personel.id,
      aciklama: `Başarılı giriş${data.personel.ilk_giris ? ' (İlk giriş)' : ''}`,
    });

    // Başarılı giriş sonrası detaylı bilgileri webhook'a gönder
    try {
      await fetch(`${N8N_WEBHOOK_URL}/webhook/login-success`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'login_basarili',
          auth: {
            user_id: data.personel.id,
            user_email: data.personel.email,
            user_name: `${data.personel.ad} ${data.personel.soyad}`,
            user_tc: data.personel.tc_kimlik_no,
            role_code: data.personel.rol?.kod,
            role_name: data.personel.rol?.ad,
            role_level: data.personel.rol?.seviye,
            birim_id: data.personel.birim_id,
            birim_ad: data.personel.birim?.ad,
            birim_kod: data.personel.birim?.kod,
            birim_tip: data.personel.birim?.tip,
            ilk_giris: data.personel.ilk_giris,
            aktif: data.personel.aktif
          },
          ip_adresi: ip,
          user_agent: request.headers.get('user-agent'),
          timestamp: new Date().toISOString()
        })
      });
    } catch (webhookError) {
      console.error('Login success webhook hatası:', webhookError);
      // Webhook hatası login işlemini engellemez
    }

    // Response oluştur ve cookie'leri set et
    const responseData = {
      success: true,
      personel: data.personel,
      token: data.token,
      ilk_giris: data.personel.ilk_giris || false,
    };

    const nextResponse = NextResponse.json(responseData);

    // Cookie'leri set et (httpOnly için güvenlik)
    nextResponse.cookies.set('auth_token', data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 gün
      path: '/',
    });

    nextResponse.cookies.set('ilk_giris', data.personel.ilk_giris ? 'true' : 'false', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 gün
      path: '/',
    });

    return nextResponse;
  } catch (error: any) {
    console.error('Login hatası:', error);

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
