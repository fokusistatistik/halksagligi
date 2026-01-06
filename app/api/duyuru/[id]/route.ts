import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/permissions';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updateDuyuruSchema = z.object({
    baslik: z.string().min(1).max(100),
    icerik: z.string().min(1).max(300),
    oncelik: z.enum(['NORMAL', 'ACIL', 'KRITIK']),
    hedef_birim_ids: z.array(z.number()).optional(),
    hedef_rol_ids: z.array(z.number()).optional(),
});

/**
 * PUT - Duyuru Güncelle
 */
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = await getCurrentUser();
        // En az admin seviye 5 veya belirli yetkiler
        if (!user || user.rol.seviye < 5) {
            return NextResponse.json({ error: 'Yetkiniz yok' }, { status: 403 });
        }

        const { id } = params;
        // Check if valid number
        const duyuruId = parseInt(id);
        if (isNaN(duyuruId)) {
            return NextResponse.json({ error: 'Geçersiz ID' }, { status: 400 });
        }

        const body = await request.json();
        const validated = updateDuyuruSchema.safeParse(body);

        if (!validated.success) {
            return NextResponse.json(
                { error: validated.error.errors[0].message },
                { status: 400 }
            );
        }

        const { baslik, icerik, oncelik, hedef_birim_ids, hedef_rol_ids } = validated.data;

        // Soft delete kontrolü
        const mevcutDuyuru = await prisma.duyuru.findFirst({
            where: { id: duyuruId, deleted_at: null }
        });
        if (!mevcutDuyuru) {
            return NextResponse.json({ error: 'Duyuru bulunamadı' }, { status: 404 });
        }

        // Authorization check - only creator or high level admin? 
        // Usually creator or superadmin. Let's stick to simple logic: Creator or Level > 8
        if (mevcutDuyuru.yayinlayan_id !== user.id && user.rol.seviye < 8) {
            return NextResponse.json({ error: 'Bu duyuruyu düzenleme yetkiniz yok' }, { status: 403 });
        }

        // Transaction to update properties and relations
        const updatedDuyuru = await prisma.$transaction(async (tx) => {
            // 1. Update basic fields
            await tx.duyuru.update({
                where: { id: duyuruId },
                data: {
                    baslik,
                    icerik,
                    oncelik
                }
            });

            // 2. Update Relations if provided (Full replacement approach)
            if (hedef_birim_ids) {
                // Delete existing
                await tx.duyuruHedefBirim.deleteMany({ where: { duyuru_id: duyuruId } });
                // Create new
                if (hedef_birim_ids.length > 0) {
                    await tx.duyuruHedefBirim.createMany({
                        data: hedef_birim_ids.map(bid => ({
                            duyuru_id: duyuruId,
                            birim_id: bid
                        }))
                    });
                }
            }

            if (hedef_rol_ids) {
                // Delete existing
                await tx.duyuruHedefRol.deleteMany({ where: { duyuru_id: duyuruId } });
                // Create new
                if (hedef_rol_ids.length > 0) {
                    await tx.duyuruHedefRol.createMany({
                        data: hedef_rol_ids.map(rid => ({
                            duyuru_id: duyuruId,
                            rol_id: rid
                        }))
                    });
                }
            }

            // Return updated record
            return await tx.duyuru.findUnique({
                where: { id: duyuruId },
                include: {
                    hedef_birimler: true,
                    hedef_roller: true
                }
            });
        });

        console.log(`Duyuru güncellendi: ${user.ad} ${user.soyad} -> ${duyuruId}`);
        return NextResponse.json({ success: true, data: updatedDuyuru });

    } catch (error) {
        console.error('Duyuru PUT Error:', error);
        return NextResponse.json({ error: 'Güncellenemedi' }, { status: 500 });
    }
}

/**
 * DELETE - Duyuru Sil (Soft Delete)
 */
export async function DELETE(
    _request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = await getCurrentUser();
        if (!user || user.rol.seviye < 5) {
            return NextResponse.json({ error: 'Yetkiniz yok' }, { status: 403 });
        }

        const { id } = params;
        const duyuruId = parseInt(id);
        if (isNaN(duyuruId)) {
            return NextResponse.json({ error: 'Geçersiz ID' }, { status: 400 });
        }

        const mevcutDuyuru = await prisma.duyuru.findFirst({
            where: { id: duyuruId, deleted_at: null }
        });

        if (!mevcutDuyuru) {
            return NextResponse.json({ error: 'Duyuru bulunamadı' }, { status: 404 });
        }

        if (mevcutDuyuru.yayinlayan_id !== user.id && user.rol.seviye < 8) {
            return NextResponse.json({ error: 'Bu duyuruyu silme yetkiniz yok' }, { status: 403 });
        }

        // Soft Delete
        await prisma.duyuru.update({
            where: { id: duyuruId },
            data: {
                deleted_at: new Date()
            }
        });

        console.log(`Duyuru silindi (soft): ${user.ad} ${user.soyad} -> ${duyuruId}`);
        return NextResponse.json({ success: true, message: 'Duyuru silindi' });

    } catch (error) {
        console.error('Duyuru DELETE Error:', error);
        return NextResponse.json({ error: 'Silinemedi' }, { status: 500 });
    }
}
