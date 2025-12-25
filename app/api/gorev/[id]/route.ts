export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { prisma } from '@/lib/prisma';

// Görev güncelle (Durum değişikliği, Geri bildirim ekleme)
export async function PUT(request: Request, { params }: { params: { id: string } }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
        }

        const user = session.user as any;
        const body = await request.json();
        const gorevId = params.id;

        const existingGorev = await prisma.gorev.findUnique({
            where: { id: gorevId }
        });

        if (!existingGorev) {
            return NextResponse.json({ error: 'Görev bulunamadı' }, { status: 404 });
        }

        // Yetki kontrolü: Başkasına ait görevi sadece yöneticiler (seviye >= 9) veya oluşturan güncelleyebilir
        // Sorumlu kişi sadece durumu güncelleyebilir ve geri bildirim ekleyebilir.

        const isOwner = existingGorev.olusturan_id === user.id;
        const isResponsible = existingGorev.sorumlu_id === user.id;
        const isManagement = user.rol?.seviye >= 9;

        if (!isOwner && !isResponsible && !isManagement) {
            return NextResponse.json({ error: 'Bu görevi inceleme/güncelleme yetkiniz yok' }, { status: 403 });
        }

        // 1. Eğer geri bildirim/güncelleme mesajı varsa ekle
        if (body.mesaj) {
            await prisma.gorevGuncelleme.create({
                data: {
                    gorev_id: gorevId,
                    personel_id: user.id,
                    mesaj: body.mesaj,
                    gorsel_url: body.gorsel_url
                }
            });
        }

        // 2. Görev detaylarını güncelle
        const updateData: any = {};
        if (body.durum) {
            updateData.durum = body.durum;
            if (body.durum === 'TAMAMLANDI') {
                updateData.tamamlanma_tarihi = new Date();
            }
        }

        // Sadece sahip veya yönetici ana detayları değiştirebilir
        if (isOwner || isManagement) {
            if (body.baslik) updateData.baslik = body.baslik;
            if (body.aciklama) updateData.aciklama = body.aciklama;
            if (body.oncelik) updateData.oncelik = body.oncelik;
            if (body.sorumlu_id) updateData.sorumlu_id = body.sorumlu_id;
            if (body.bitis_tarihi) updateData.bitis_tarihi = new Date(body.bitis_tarihi);
        }

        const updatedGorev = await prisma.gorev.update({
            where: { id: gorevId },
            data: updateData,
            include: {
                guncellemeler: true
            }
        });

        return NextResponse.json({ success: true, data: updatedGorev });
    } catch (error) {
        console.error('Gorev update error:', error);
        return NextResponse.json({ success: false, error: 'Görev güncellenemedi' }, { status: 500 });
    }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
        }

        const user = session.user as any;
        const gorevId = params.id;

        const existingGorev = await prisma.gorev.findUnique({
            where: { id: gorevId }
        });

        if (!existingGorev) {
            return NextResponse.json({ error: 'Görev bulunamadı' }, { status: 404 });
        }

        // Sadece oluşturan veya yönetici silebilir
        if (existingGorev.olusturan_id !== user.id && user.rol?.seviye < 9) {
            return NextResponse.json({ error: 'Bu görevi silme yetkiniz yok' }, { status: 403 });
        }

        await prisma.gorev.delete({
            where: { id: gorevId }
        });

        return NextResponse.json({ success: true, message: 'Görev başarıyla silindi' });
    } catch (error) {
        console.error('Gorev delete error:', error);
        return NextResponse.json({ success: false, error: 'Görev silinemedi' }, { status: 500 });
    }
}
