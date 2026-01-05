export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { prisma } from '@/lib/prisma';

// Etkinlik İptal Et
export async function PUT(_request: Request, { params }: { params: { id: string } }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
        }

        const user = session.user as any;
        const etkinlikId = parseInt(params.id);

        // Etkinliği bul
        const etkinlik = await prisma.takvimEtkinlik.findUnique({
            where: { id: etkinlikId }
        });

        if (!etkinlik) {
            return NextResponse.json({ error: 'Etkinlik bulunamadı' }, { status: 404 });
        }

        // Sadece kendi etkinliğini iptal edebilir
        if (etkinlik.personel_id !== parseInt(user.id)) {
            return NextResponse.json({ error: 'Bu etkinliği iptal etme yetkiniz yok' }, { status: 403 });
        }

        const body = await _request.json();

        const updateData: any = {};

        // İptal isteği mi?
        if (body.action === 'cancel') {
            updateData.durum = 'IPTAL';
        } else {
            // Normal güncelleme
            if (body.baslik) updateData.baslik = body.baslik;
            if (body.aciklama) updateData.aciklama = body.aciklama;
            if (body.baslangic) updateData.baslangic = new Date(body.baslangic);
            if (body.bitis) updateData.bitis = new Date(body.bitis);
            if (body.yer) updateData.yer = body.yer;
            if (body.tip) updateData.tip = body.tip;
        }

        // İptal et veya güncelle
        const updated = await prisma.takvimEtkinlik.update({
            where: { id: etkinlikId },
            data: updateData
        });

        return NextResponse.json({ success: true, data: updated });
    } catch (error) {
        console.error('Etkinlik iptal error:', error);
        return NextResponse.json({ success: false, error: 'Etkinlik iptal edilemedi' }, { status: 500 });
    }
}
