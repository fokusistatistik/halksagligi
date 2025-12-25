export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { prisma } from '@/lib/prisma';

// Görevleri listele
export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
        }

        const user = session.user as any;
        const { searchParams } = new URL(request.url);
        const targetUserId = searchParams.get('userId');

        // Yetki kontrolü: Başkan ve üstü herkesi görebilir, diğerleri sadece kendisiyle ilgili olanları
        const isManagement = user.rol?.seviye >= 9;

        let where: any = {};

        if (targetUserId && isManagement) {
            // Yönetici başkasının görevlerini istiyor
            where = {
                OR: [
                    { sorumlu_id: targetUserId },
                    { olusturan_id: targetUserId }
                ]
            };
        } else if (isManagement && !targetUserId) {
            // Yönetici tüm görevleri istiyor (veya filtreli)
            // Varsayılan olarak tümünü getir
            where = {};
        } else {
            // Normal kullanıcı sadece kendi görevlerini görür
            where = {
                OR: [
                    { sorumlu_id: user.id },
                    { olusturan_id: user.id }
                ]
            };
        }

        const gorevler = await prisma.gorev.findMany({
            where,
            include: {
                sorumlu: {
                    select: { id: true, ad: true, soyad: true, profil_foto_url: true, unvan: true }
                },
                olusturan: {
                    select: { id: true, ad: true, soyad: true }
                },
                guncellemeler: {
                    orderBy: { created_at: 'desc' },
                    include: {
                        personel: {
                            select: { ad: true, soyad: true }
                        }
                    }
                }
            },
            orderBy: { created_at: 'desc' }
        });

        return NextResponse.json({ success: true, data: gorevler });
    } catch (error) {
        console.error('Gorev list error:', error);
        return NextResponse.json({ success: false, error: 'Görevler yüklenemedi' }, { status: 500 });
    }
}

// Yeni görev oluştur
export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
        }

        const user = session.user as any;
        const body = await request.json();

        // Yetki kontrolü: Sadece belli seviye üstü görev atayabilir (örn: seviye >= 7)
        if (user.rol?.seviye < 7) {
            return NextResponse.json({ error: 'Görev atama yetkiniz yok' }, { status: 403 });
        }

        const gorev = await prisma.gorev.create({
            data: {
                baslik: body.baslik,
                aciklama: body.aciklama,
                oncelik: body.oncelik || 'ORTA',
                kategori: body.kategori || 'DIGER',
                durum: 'BEKLEYEN',
                baslangic_tarihi: body.baslangic_tarihi ? new Date(body.baslangic_tarihi) : null,
                bitis_tarihi: body.bitis_tarihi ? new Date(body.bitis_tarihi) : null,
                sorumlu_id: body.sorumlu_id,
                olusturan_id: user.id,
                birim_id: body.birim_id || user.birim_id
            }
        });

        // Aktivite logu ekle
        await prisma.aktiviteLog.create({
            data: {
                personel_id: user.id,
                personel_email: user.email,
                islem: 'gorev.olustur',
                tablo: 'gorevler',
                kayit_id: gorev.id,
                aciklama: `${gorev.baslik} başlıklı görev oluşturuldu.`
            }
        });

        return NextResponse.json({ success: true, data: gorev });
    } catch (error) {
        console.error('Gorev create error:', error);
        return NextResponse.json({ success: false, error: 'Görev oluşturulamadı' }, { status: 500 });
    }
}
