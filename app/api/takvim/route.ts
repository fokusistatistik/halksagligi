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

        const where: any = {
            durum: { not: 'IPTAL' }, // İptal edilenleri gösterme
            deleted_at: null
        };

        if (targetUserId && isManagement) {
            where.personel_id = parseInt(targetUserId); // Ensure int
        } else if (isManagement && !targetUserId) {
            // Yönetici tüm personel takvimlerini görebilir
        } else {
            where.personel_id = parseInt(user.id);
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

        // Herkes sadece kendisine etkinlik oluşturabilir
        const targetPersonelId = user.id;

        const repeatCount = body.repeatCount || 1;
        const repeatType = body.repeatType; // 'HAFTALIK' | 'AYLIK'

        if (repeatCount > 12) {
            return NextResponse.json({ error: 'Maksimum tekrar sayısı 12 olabilir' }, { status: 400 });
        }

        // Generate Kod Prefix (TAKVİM-YY-)
        const currentYear = new Date().getFullYear().toString().slice(-2);
        const prefix = `TAKVİM-${currentYear}-`;

        // Get Last Code
        const lastEtkinlik = await prisma.takvimEtkinlik.findFirst({
            where: {
                kod: { startsWith: prefix }
            },
            orderBy: {
                kod: 'desc'
            },
            select: { kod: true }
        });

        let nextSeq = 1;
        if (lastEtkinlik && lastEtkinlik.kod) {
            const parts = lastEtkinlik.kod.split('-');
            const lastSeqStr = parts[parts.length - 1];
            const lastSeq = parseInt(lastSeqStr);
            if (!isNaN(lastSeq)) {
                nextSeq = lastSeq + 1;
            }
        }

        const createdEvents = [];

        for (let i = 0; i < repeatCount; i++) {
            // Calculate Dates
            const startDate = new Date(body.baslangic);
            const endDate = new Date(body.bitis);

            if (i > 0) {
                if (repeatType === 'HAFTALIK') {
                    startDate.setDate(startDate.getDate() + (i * 7));
                    endDate.setDate(endDate.getDate() + (i * 7));
                } else if (repeatType === 'AYLIK') {
                    startDate.setMonth(startDate.getMonth() + i);
                    endDate.setMonth(endDate.getMonth() + i);
                }
            }

            const codeSeq = nextSeq + i;
            const newKod = `${prefix}${codeSeq.toString().padStart(7, '0')}`;

            const etkinlik = await prisma.takvimEtkinlik.create({
                data: {
                    kod: newKod,
                    baslik: body.baslik,
                    aciklama: body.aciklama,
                    tip: body.tip || 'DIGER',
                    yer: body.yer || 'KURUM_ICI',
                    durum: 'AKTIF',
                    renk: body.renk,
                    baslangic: startDate,
                    bitis: endDate,
                    tum_gun: body.tum_gun || false,
                    personel_id: parseInt(targetPersonelId),
                    olusturan_id: parseInt(user.id)
                }
            });
            createdEvents.push(etkinlik);
        }

        return NextResponse.json({ success: true, data: createdEvents[0], count: createdEvents.length });
    } catch (error) {
        console.error('Takvim create error:', error);
        return NextResponse.json({ success: false, error: 'Etkinlik oluşturulamadı' }, { status: 500 });
    }
}
