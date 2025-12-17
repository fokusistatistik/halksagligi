import { NextRequest, NextResponse } from 'next/server';
import { sifreSifirlaSchema } from '@/lib/validations/password';
import { logAktivite } from '@/lib/log';

const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || 'https://n8n.fokusistatistik.com';

// Rate limiting: IP başına son istek zamanları (in-memory)
// Production'da Redis kullanılmalı
const rateLimitMap = new Map<string, number[]>();

/**
 * Rate limiting kontrolü
 * Aynı IP'den 5 dakikada max 1 istek
 */
function checkRateLimit(ip: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const windowMs = 5 * 60 * 1000; // 5 dakika
  const maxRequests = 1;

  // IP'nin geçmiş isteklerini al
  const requests = rateLimitMap.get(ip) || [];

  // Pencere dışındaki istekleri temizle
  const validRequests = requests.filter((time) => now - time < windowMs);

  if (validRequests.length >= maxRequests) {
    // Limit aşıldı
    const oldestRequest = Math.min(...validRequests);
    const retryAfter = Math.ceil((oldestRequest + windowMs - now) / 1000); // saniye cinsinden
    return { allowed: false, retryAfter };
  }

  // Yeni isteği ekle
  validRequests.push(now);
  rateLimitMap.set(ip, validRequests);

  // Eski girişleri temizle (memory leak önlemi)
  if (rateLimitMap.size > 10000) {
    const sortedEntries = Array.from(rateLimitMap.entries())
      .sort((a, b) => Math.max(...b[1]) - Math.max(...a[1]));
    rateLimitMap.clear();
    sortedEntries.slice(0, 5000).forEach(([key, value]) => {
      rateLimitMap.set(key, value);
    });
  }

  return { allowed: true };
}

/**
 * POST /api/sifre-sifirla
 * Şifre sıfırlama talebi oluşturur ve email gönderir
 * n8n webhook'a proxy yapar
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validation
    const validated = sifreSifirlaSchema.parse(body);

    // IP adresi al
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

    // Rate limiting kontrolü
    const rateLimit = checkRateLimit(ip);
    if (!rateLimit.allowed) {
      await logAktivite({
        islem: 'sifre.sifirla.rate_limit',
        tablo: 'personel',
        aciklama: `Rate limit aşıldı: ${ip}`,
      });

      return NextResponse.json(
        {
          error: `Çok fazla istek. Lütfen ${rateLimit.retryAfter} saniye sonra tekrar deneyiniz.`,
        },
        {
          status: 429,
          headers: {
            'Retry-After': rateLimit.retryAfter?.toString() || '300',
          },
        }
      );
    }

    // n8n webhook'a istek gönder
    const response = await fetch(`${N8N_WEBHOOK_URL}/webhook/sifre-sifirla`, {
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
      // Log: Başarısız şifre sıfırlama talebi
      await logAktivite({
        islem: 'sifre.sifirla.basarisiz',
        tablo: 'personel',
        aciklama: `Şifre sıfırlama başarısız: ${validated.tc_kimlik_no} - ${validated.email}`,
      });

      return NextResponse.json(
        { error: data.error || 'Şifre sıfırlama talebi oluşturulamadı' },
        { status: response.status }
      );
    }

    // Log: Başarılı şifre sıfırlama talebi
    await logAktivite({
      personel_id: data.personel_id,
      personel_email: validated.email,
      islem: 'sifre.sifirla.talep',
      tablo: 'personel',
      kayit_id: data.personel_id,
      aciklama: `Şifre sıfırlama talebi oluşturuldu`,
    });

    return NextResponse.json({
      success: true,
      message: 'Şifre sıfırlama bağlantısı email adresinize gönderildi',
    });
  } catch (error: any) {
    console.error('Şifre sıfırlama hatası:', error);

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
