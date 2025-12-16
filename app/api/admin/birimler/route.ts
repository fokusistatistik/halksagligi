import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { prisma } from '@/lib/prisma';
import { logAktivite } from '@/lib/log';
import { z } from 'zod';

// Validation schema
const birimSchema = z.object({
  ad: z.string().min(3, 'Birim adı en az 3 karakter olmalıdır'),
  kod: z.string().min(2, 'Birim kodu en az 2 karakter olmalıdır').toUpperCase(),
  tip: z.enum(['SHM', 'ASM', 'TOPLUM_SAGLIGI', 'BASKANLIK_BIRIMI']),
  telefon: z.string().optional(),
  email: z.string().email('Geçerli bir email giriniz').optional().or(z.literal('')),
  aktif: z.boolean().default(true)
});

// GET - Tüm birimleri listele
export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Yetkisiz erişim' },
        { status: 401 }
      );
    }

    // Admin yetkisi kontrolü
    if (session.user.rol.kod !== 'ADMIN' && session.user.rol.kod !== 'BASKAN') {
      return NextResponse.json(
        { success: false, error: 'Bu işlem için yetkiniz yok' },
        { status: 403 }
      );
    }

    const birimler = await prisma.birim.findMany({
      orderBy: { created_at: 'desc' },
      select: {
        id: true,
        ad: true,
        kod: true,
        tip: true,
        telefon: true,
        email: true,
        aktif: true,
        created_at: true,
        _count: {
          select: {
            personeller: true,
            shm_alt_birimler: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: birimler
    });

  } catch (error: any) {
    console.error('Birimler listesi hatası:', error);
    return NextResponse.json(
      { success: false, error: 'Birimler listelenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// POST - Yeni birim oluştur
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Yetkisiz erişim' },
        { status: 401 }
      );
    }

    // Admin yetkisi kontrolü
    if (session.user.rol.kod !== 'ADMIN' && session.user.rol.kod !== 'BASKAN') {
      return NextResponse.json(
        { success: false, error: 'Bu işlem için yetkiniz yok' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validated = birimSchema.parse(body);

    // Kod benzersizliği kontrolü
    const existingBirim = await prisma.birim.findUnique({
      where: { kod: validated.kod }
    });

    if (existingBirim) {
      return NextResponse.json(
        { success: false, error: 'Bu kod ile bir birim zaten mevcut' },
        { status: 400 }
      );
    }

    // Birim oluştur
    const yeniBirim = await prisma.birim.create({
      data: {
        ad: validated.ad,
        kod: validated.kod,
        tip: validated.tip as any,
        telefon: validated.telefon || null,
        email: validated.email || null,
        aktif: validated.aktif
      }
    });

    // Eğer SHM ise, otomatik olarak 11 alt birim oluştur
    if (validated.tip === 'SHM') {
      const shmAltBirimler = [
        { ad: 'Beslenme Danışmanlığı', kod: `${validated.kod}-BESLENME`, tip: 'BESLENME_DANISMANLIGI' },
        { ad: 'Kronik Hastalıklar ve Fiziksel Aktivite', kod: `${validated.kod}-KRONIK`, tip: 'KRONIK_HASTALIKLAR_FIZIKSEL_AKTIVITE' },
        { ad: 'Kadın ve Üreme Sağlığı', kod: `${validated.kod}-KADIN`, tip: 'KADIN_UREME_SAGLIGI' },
        { ad: 'Kanser Erken Teşhis, Tarama ve Eğitim', kod: `${validated.kod}-KANSER`, tip: 'KANSER_ERKEN_TESHIS' },
        { ad: 'Ruh Sağlığı Danışmanlığı', kod: `${validated.kod}-RUH`, tip: 'RUH_SAGLIGI' },
        { ad: 'Çocuk ve Ergen Sağlığı', kod: `${validated.kod}-COCUK`, tip: 'COCUK_ERGEN_SAGLIGI' },
        { ad: 'Tütün ve Madde Bağımlılığı', kod: `${validated.kod}-TUTUN`, tip: 'TUTUN_MADDE_BAGIMLILIGI' },
        { ad: 'Enfeksiyon Kontrol Hizmetleri', kod: `${validated.kod}-ENFEKSIYON`, tip: 'ENFEKSIYON_KONTROL' },
        { ad: 'Koruyucu Ağız ve Diş Sağlığı', kod: `${validated.kod}-AGIZ`, tip: 'AGIZ_DIS_SAGLIGI' },
        { ad: 'Tıbbi Hizmetler', kod: `${validated.kod}-TIBBI`, tip: 'TIBBI_HIZMETLER' },
        { ad: 'İdari Hizmetler', kod: `${validated.kod}-IDARI`, tip: 'IDARI_HIZMETLER' }
      ];

      await prisma.sHMAltBirim.createMany({
        data: shmAltBirimler.map(alt => ({
          ...alt,
          shm_birim_id: yeniBirim.id,
          aktif: true,
          tip: alt.tip as any
        }))
      });
    }

    // Activity log
    await logAktivite({
      personel_id: session.user.id,
      personel_email: session.user.email ?? undefined,
      islem: 'birim.olustur',
      tablo: 'birimler',
      kayit_id: yeniBirim.id,
      yeni_veri: yeniBirim,
      ip_adresi: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined
    });

    // Webhook'a gönder
    const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || 'https://n8n.fokusistatistik.com';

    try {
      await fetch(`${N8N_WEBHOOK_URL}/webhook/birim-olustur`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'birim_olusturuldu',
          birim: yeniBirim,
          auth: {
            user_id: session.user.id,
            user_email: session.user.email,
            user_name: session.user.name,
            role: session.user.rol.kod,
            birim_id: session.user.birim?.id
          },
          timestamp: new Date().toISOString()
        })
      });
    } catch (webhookError) {
      console.error('Webhook hatası:', webhookError);
    }

    return NextResponse.json({
      success: true,
      data: yeniBirim,
      message: validated.tip === 'SHM' ? 'Birim ve alt birimler oluşturuldu' : 'Birim oluşturuldu'
    });

  } catch (error: any) {
    console.error('Birim oluşturma hatası:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Birim oluşturulurken bir hata oluştu' },
      { status: 500 }
    );
  }
}
