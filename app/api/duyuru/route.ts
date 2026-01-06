import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/permissions';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { z } from 'zod';

// Validation Schema
const duyuruSchema = z.object({
    baslik: z.string().min(1).max(100),
    icerik: z.string().min(1).max(300),
    oncelik: z.enum(['NORMAL', 'ACIL', 'KRITIK']).default('NORMAL'),
    hedef_birim_ids: z.array(z.number()).optional(),
    hedef_rol_ids: z.array(z.number()).optional(),
});

/**
 * GET - Kişiye özel duyuruları listele
 * - Admin/Yayınlayan için: Tüm kendi yayınladıkları
 * - Personel için: Okumadıkları + Son 10 okudukları
 */
export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const isManagement = user.rol.seviye >= 8; // Yönetici mi?

        const { searchParams } = new URL(request.url);
        const mode = searchParams.get('mode') || 'user'; // 'management' or 'user' (timeline)
        const type = searchParams.get('type') || 'all'; // 'unread' or 'all'

        if (mode === 'management' && isManagement) {
            // YÖNETİM MODU: Sadece kendi yayınladıklarımı veya tümünü (İleride)
            const duyurular = await prisma.duyuru.findMany({
                where: {
                    yayinlayan_id: user.id,
                    deleted_at: null
                },
                include: {
                    hedef_birimler: {
                        include: { birim: { select: { ad: true } } }
                    },
                    hedef_roller: {
                        include: { rol: { select: { ad: true } } }
                    },
                    _count: { select: { okunma_loglari: true } }
                },
                orderBy: { yayin_tarihi: 'desc' },
                take: 50
            });

            // Format for Frontend
            const formatted = duyurular.map(d => ({
                id: d.id,
                baslik: d.baslik,
                icerik: d.icerik,
                oncelik: d.oncelik,
                yayin_tarihi: d.yayin_tarihi,
                hedef_birim: d.hedef_birimler.length > 0 ? { ad: d.hedef_birimler.map(hb => hb.birim.ad).join(", ") } : null,
                hedef_rol: d.hedef_roller.length > 0 ? { ad: d.hedef_roller.map(hr => hr.rol.ad).join(", ") } : null,
                _count: d._count
            }));

            return NextResponse.json({ success: true, data: formatted });
        } else {
            // KULLANICI MODU: Bana uygun duyurular
            const orConditions: Prisma.DuyuruWhereInput[] = [
                {
                    AND: [
                        { hedef_birimler: { none: {} } },
                        { hedef_roller: { none: {} } },
                        { deleted_at: null }
                    ]
                }
            ];

            if (user.birim_id) {
                // Asserting user.birim_id is number because of logic check
                orConditions.push({
                    hedef_birimler: {
                        some: { birim_id: user.birim_id }
                    }
                });
            }

            if (user.rol.id) {
                orConditions.push({
                    hedef_roller: {
                        some: { rol_id: user.rol.id }
                    }
                });
            }

            const whereClause: Prisma.DuyuruWhereInput = {
                AND: [
                    {
                        // Hedefleme kontrolü: 
                        OR: orConditions
                    },
                    {
                        // Geçerlilik tarihi kontrolü
                        OR: [
                            { gecerlilik_tarihi: null },
                            { gecerlilik_tarihi: { gte: new Date() } }
                        ]
                    }
                ]
            };

            // Eğer sadece okunmamışları istiyorsak
            if (type === 'unread') {
                const unreadDuyurular = await prisma.duyuru.findMany({
                    where: {
                        ...whereClause,
                        okunma_loglari: {
                            none: { personel_id: user.id }
                        }
                    },
                    orderBy: { yayin_tarihi: 'desc' }
                });
                return NextResponse.json({ success: true, data: unreadDuyurular });
            }

            // Timeline için: Tüm bana hitap edenler (Okunup okunmadığı bilgisiyle)
            const duyurular = await prisma.duyuru.findMany({
                where: whereClause,
                include: {
                    yayinlayan: { select: { ad: true, soyad: true, unvan: true } },
                    okunma_loglari: {
                        where: { personel_id: user.id },
                        select: { okundu_tarihi: true }
                    }
                },
                orderBy: { yayin_tarihi: 'desc' },
                take: 20
            });

            // Formatla: okundu mu bilgisini boolean olarak ekle
            const formatted = duyurular.map(d => ({
                ...d,
                okundu: d.okunma_loglari.length > 0,
                okunma_tarihi: d.okunma_loglari.length > 0 ? d.okunma_loglari[0].okundu_tarihi : null,
                okunma_loglari: undefined // Frontende ham log array'ini gönderme
            }));

            return NextResponse.json({ success: true, data: formatted });
        }

    } catch (error) {
        console.error('Duyuru GET Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

/**
 * POST - Yeni Duyuru Oluştur
 */
export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser();
        // Sadece Admin ve belirli seviye üstü duyuru atabilir (Örn: Seviye 5+ Birim Sorumlusu vb.)
        if (!user || user.rol.seviye < 5) {
            return NextResponse.json({ error: 'Yetkiniz yok' }, { status: 403 });
        }

        const body = await request.json();

        // Zod validation
        const result = duyuruSchema.safeParse(body);
        if (!result.success) {
            return NextResponse.json({ error: result.error.errors[0].message }, { status: 400 });
        }

        const { baslik, icerik, oncelik, hedef_birim_ids, hedef_rol_ids } = result.data;

        // Geçerlilik tarihi: Varsayılan 7 gün
        const gecerlilik = new Date();
        gecerlilik.setDate(gecerlilik.getDate() + 7);

        const yeniDuyuru = await prisma.duyuru.create({
            data: {
                baslik,
                icerik,
                oncelik,
                yayinlayan_id: user.id,
                gecerlilik_tarihi: gecerlilik,
                hedef_birimler: {
                    create: hedef_birim_ids?.map(id => ({ birim_id: id })) || []
                },
                hedef_roller: {
                    create: hedef_rol_ids?.map(id => ({ rol_id: id })) || []
                }
            }
        });

        // Log
        console.log(`Duyuru oluşturuldu: ${user.ad} ${user.soyad} -> ${baslik}`);

        return NextResponse.json({ success: true, data: yeniDuyuru });

    } catch (error) {
        console.error('Duyuru POST Error:', error);
        return NextResponse.json({ error: 'Oluşturulamadı' }, { status: 500 });
    }
}
