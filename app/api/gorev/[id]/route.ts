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
        const gorevId = parseInt(params.id);
        const userId = parseInt(user.id);

        if (isNaN(gorevId)) {
            return NextResponse.json({ error: 'Geçersiz görev ID' }, { status: 400 });
        }

        const existingGorev = await prisma.gorev.findUnique({
            where: { id: gorevId },
            include: { destek_verenler: true }
        });

        if (!existingGorev) {
            return NextResponse.json({ error: 'Görev bulunamadı' }, { status: 404 });
        }

        const isOwner = existingGorev.olusturan_id === userId;
        const isResponsible = existingGorev.sorumlu_id === userId;
        const isManagement = user.rol?.seviye >= 7; // Birim Yöneticisi ve üstü
        const isSupport = existingGorev.destek_verenler.some(p => p.id === userId);

        if (!isOwner && !isResponsible && !isManagement && !isSupport) {
            return NextResponse.json({ error: 'Bu görevi inceleme/güncelleme yetkiniz yok' }, { status: 403 });
        }

        // İptal yetkisi kontrolü (Sadece yöneticiler)
        if (body.durum === 'IPTAL' && !isManagement) {
            return NextResponse.json({ error: 'Görevi sadece yöneticiler iptal edebilir' }, { status: 403 });
        }

        // 1. Eğer geri bildirim/güncelleme mesajı varsa ekle
        if (body.mesaj) {
            await prisma.gorevGuncelleme.create({
                data: {
                    gorev_id: gorevId,
                    personel_id: userId,
                    mesaj: body.mesaj,
                    gorsel_url: body.gorsel_url
                }
            });
        }

        // Destek personel is only allowed to add notes (already handled above), cannot change task details
        if (isSupport && !isOwner && !isResponsible && !isManagement) {
            // Sadece mesaj ekleyebilir, başka update yapamaz
            return NextResponse.json({ success: true, message: 'Not eklendi' });
        }

        // 2. Görev detaylarını güncelle
        const updateData: any = {};

        // Durum güncelleme
        if (body.durum) {
            updateData.durum = body.durum;

            // Tamamlanma veya İptal durumunda kayıt al
            if (['TAMAMLANDI', 'IPTAL'].includes(body.durum)) {
                updateData.tamamlanma_tarihi = new Date();
                updateData.tamamlayan_id = userId;
                if (body.tamamlanma_notu) {
                    updateData.tamamlanma_notu = body.tamamlanma_notu;
                    // Ayrıca log olarak da ekle
                    await prisma.gorevGuncelleme.create({
                        data: {
                            gorev_id: gorevId,
                            personel_id: userId,
                            mesaj: `Görev ${body.durum === 'IPTAL' ? 'iptal edildi' : 'tamamlandı'}. Not: ${body.tamamlanma_notu}`,
                        }
                    });
                }
            } else if (existingGorev.durum !== body.durum) {
                // Durum değişikliği logu (Otomatik)
                await prisma.gorevGuncelleme.create({
                    data: {
                        gorev_id: gorevId,
                        personel_id: userId,
                        mesaj: `Görev durumu değiştirildi: ${existingGorev.durum} -> ${body.durum}`,
                    }
                });
            }
        }

        // Görseller (Sil-Güncelle)
        if (body.gorsel_1 !== undefined) updateData.gorsel_1 = body.gorsel_1;
        if (body.gorsel_1_not !== undefined) updateData.gorsel_1_not = body.gorsel_1_not;
        if (body.gorsel_2 !== undefined) updateData.gorsel_2 = body.gorsel_2;
        if (body.gorsel_2_not !== undefined) updateData.gorsel_2_not = body.gorsel_2_not;
        if (body.gorsel_3 !== undefined) updateData.gorsel_3 = body.gorsel_3;
        if (body.gorsel_3_not !== undefined) updateData.gorsel_3_not = body.gorsel_3_not;

        // Sadece sahip veya yönetici ana detayları değiştirebilir
        if (isOwner || isManagement) {
            const changes: string[] = [];

            if (body.baslik && body.baslik !== existingGorev.baslik) {
                updateData.baslik = body.baslik;
                changes.push(`Başlık değiştirildi`);
            }
            if (body.aciklama && body.aciklama !== existingGorev.aciklama) {
                updateData.aciklama = body.aciklama;
                changes.push(`Açıklama güncellendi`);
            }
            if (body.oncelik && body.oncelik !== existingGorev.oncelik) {
                updateData.oncelik = body.oncelik;
                changes.push(`Öncelik: ${existingGorev.oncelik} → ${body.oncelik}`);
            }
            if (body.sorumlu_id && parseInt(body.sorumlu_id) !== existingGorev.sorumlu_id) {
                updateData.sorumlu_id = parseInt(body.sorumlu_id);
                changes.push(`Sorumlu değiştirildi`);
            }
            if (body.baslangic_tarihi) {
                updateData.baslangic_tarihi = new Date(body.baslangic_tarihi);
                changes.push(`Başlangıç tarihi güncellendi`);
            }

            if (body.bitis_tarihi !== undefined) {
                updateData.bitis_tarihi = body.bitis_tarihi ? new Date(body.bitis_tarihi) : null;
                changes.push(`Bitiş tarihi güncellendi`);
            }

            // Destek personellerini güncelle
            if (body.destek_verenler) {
                updateData.destek_verenler = {
                    set: body.destek_verenler.map((id: string) => ({ id: parseInt(id) })).filter((item: any) => !isNaN(item.id))
                };
                changes.push(`Destek personelleri güncellendi`);
            }

            // Eğer ayar değişikliği varsa log ekle
            if (changes.length > 0) {
                await prisma.gorevGuncelleme.create({
                    data: {
                        gorev_id: gorevId,
                        personel_id: parseInt(user.id),
                        mesaj: `Görev ayarları güncellendi: ${changes.join(', ')}`,
                    }
                });
            }
        }

        const updatedGorev = await prisma.gorev.update({
            where: { id: gorevId },
            data: updateData,
            include: {
                guncellemeler: {
                    orderBy: { created_at: 'desc' },
                    include: { personel: { select: { ad: true, soyad: true } } }
                },
                destek_verenler: {
                    select: { id: true, ad: true, soyad: true, profil_foto_url: true }
                },
                sorumlu: {
                    select: { id: true, ad: true, soyad: true, profil_foto_url: true, unvan: true }
                },
                olusturan: {
                    select: { id: true, ad: true, soyad: true }
                }
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
        const gorevId = parseInt(params.id);

        if (isNaN(gorevId)) {
            return NextResponse.json({ error: 'Geçersiz görev ID' }, { status: 400 });
        }

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
