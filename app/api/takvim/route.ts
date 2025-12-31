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
            durum: { not: 'IPTAL' } // İptal edilenleri gösterme
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

        // Generate Kod (TAKVİM-YY-0000001)
        const currentYear = new Date().getFullYear().toString().slice(-2);
        const prefix = `TAKVİM-${currentYear}-`;

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

        const newKod = `${prefix}${nextSeq.toString().padStart(7, '0')}`;

        const etkinlik = await prisma.takvimEtkinlik.create({
            data: {
                kod: newKod,
                baslik: body.baslik,
                aciklama: body.aciklama,
                tip: body.tip || 'DIGER',
                yer: body.yer || 'KURUM_ICI',
                durum: 'AKTIF',
                renk: body.renk,
                baslangic: new Date(body.baslangic),
                bitis: new Date(body.bitis),
                tum_gun: body.tum_gun || false,
                personel_id: parseInt(targetPersonelId),
                olusturan_id: parseInt(user.id)
            }
        });

        return NextResponse.json({ success: true, data: etkinlik });
    } catch (error) {
        console.error('Takvim create error:', error);
        return NextResponse.json({ success: false, error: 'Etkinlik oluşturulamadı' }, { status: 500 });
    }
}
