
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/permissions';
import { prisma } from '@/lib/prisma';

/**
 * POST - Duyuruyu okundu işaretle
 */
export async function POST(
    _: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = await getCurrentUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const duyuruId = parseInt(params.id);

        // Zaten okundu mu kontrol et
        const existing = await prisma.duyuruOkuma.findUnique({
            where: {
                duyuru_id_personel_id: {
                    duyuru_id: duyuruId,
                    personel_id: user.id
                }
            }
        });

        if (existing) {
            return NextResponse.json({ success: true, message: 'Zaten okundu' });
        }

        // Kayıt oluştur
        await prisma.duyuruOkuma.create({
            data: {
                duyuru_id: duyuruId,
                personel_id: user.id
            }
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Duyuru Okundu Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
