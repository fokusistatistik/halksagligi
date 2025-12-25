export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { prisma } from '@/lib/prisma';

// Takvim etkinliklerini listele
export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
        }

        const user = session.user as any;
        const { searchParams } = new URL(request.url);
        const targetUserId = searchParams.get('userId');
        const start = searchParams.get('start'); // Start date filter
        const end = searchParams.get('end'); // End date filter

        const isManagement = user.rol?.seviye >= 9;

        let where: any = {};

        if (targetUserId && isManagement) {
            where.personel_id = targetUserId;
        } else if (isManagement && !targetUserId) {
            // Yönetici tüm personel takvimlerini görebilir
            // where.personel_id kısıtlaması yapmıyoruz
        } else {
            where.personel_id = user.id;
        }

        if (start && end) {
            where.baslangic = {
                gte: new Date(start),
                lte: new Date(end)
            };
        }

        const etkinlikler = await prisma.takvimEtkinlik.findMany({
            where,
            include: {
                olusturan: {
                    select: { ad: true, soyad: true }
                }
            },
            orderBy: { baslangic: 'asc' }
        });

        return NextResponse.json({ success: true, data: etkinlikler });
    } catch (error) {
        console.error('Takvim list error:', error);
        return NextResponse.json({ success: false, error: 'Etkinlikler yüklenemedi' }, { status: 500 });
    }
}

// Yeni etkinlik oluştur
export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
        }

        const user = session.user as any;
        const body = await request.json();

        // Yetki kontrolü: Başkanlar başkasının takvimine ekleme yapabilir
        const isManagement = user.rol?.seviye >= 9;
        const targetPersonelId = body.personel_id || user.id;

        if (targetPersonelId !== user.id && !isManagement) {
            return NextResponse.json({ error: 'Başkasının takvimine etkinlik ekleme yetkiniz yok' }, { status: 403 });
        }

        const etkinlik = await prisma.takvimEtkinlik.create({
            data: {
                baslik: body.baslik,
                aciklama: body.aciklama,
                tip: body.tip || 'DIGER',
                renk: body.renk,
                baslangic: new Date(body.baslangic),
                bitis: new Date(body.bitis),
                tum_gun: body.tum_gun || false,
                personel_id: targetPersonelId,
                olusturan_id: user.id
            }
        });

        return NextResponse.json({ success: true, data: etkinlik });
    } catch (error) {
        console.error('Takvim create error:', error);
        return NextResponse.json({ success: false, error: 'Etkinlik oluşturulamadı' }, { status: 500 });
    }
}
