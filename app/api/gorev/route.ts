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
        const targetUserIdStr = searchParams.get('userId');
        const targetUserId = targetUserIdStr ? parseInt(targetUserIdStr) : null;

        // Yetki kontrolü: Başkan ve üstü herkesi görebilir, diğerleri sadece kendisiyle ilgili olanları
        const isManagement = user.rol?.seviye >= 9;

        let where: any = {};

        if (targetUserId && !isNaN(targetUserId) && isManagement) {
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
                    { sorumlu_id: parseInt(user.id) },
                    { olusturan_id: parseInt(user.id) }
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
                destek_verenler: {
                    select: { id: true, ad: true, soyad: true, profil_foto_url: true }
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

        // Yetki kontrolü: Sadece belli seviye üstü görev atayabilir (örn: seviye >= 7 - Birim Yöneticisi ve üstü)
        if (user.rol?.seviye < 7) {
            return NextResponse.json({ error: 'Görev atama yetkiniz yok' }, { status: 403 });
        }

        // Generate Kod (GÖREV-YY-000001)
        const currentYear = new Date().getFullYear().toString().slice(-2);
        const prefix = `GÖREV-${currentYear}-`;

        const lastGorev = await prisma.gorev.findFirst({
            where: {
                kod: { startsWith: prefix }
            },
            orderBy: {
                kod: 'desc'
            },
            select: { kod: true }
        });

        let nextSeq = 1;
        if (lastGorev && lastGorev.kod) {
            const parts = lastGorev.kod.split('-');
            const lastSeqStr = parts[parts.length - 1];
            const lastSeq = parseInt(lastSeqStr);
            if (!isNaN(lastSeq)) {
                nextSeq = lastSeq + 1;
            }
        }

        const newKod = `${prefix}${nextSeq.toString().padStart(6, '0')}`;

        // Validate required fields
        if (!body.sorumlu_id) {
            return NextResponse.json({ success: false, error: 'Sorumlu personel seçilmedi' }, { status: 400 });
        }

        const sorumluId = parseInt(body.sorumlu_id);
        const olusturanId = parseInt(user.id);

        // birim_id can be null/undefined for some users
        let birimId: number | null = null;
        if (body.birim_id) {
            birimId = parseInt(body.birim_id);
        } else if (user.birim_id) {
            birimId = parseInt(user.birim_id);
        }

        // Debug logging
        console.log('ID Conversion Debug:', {
            'body.sorumlu_id': body.sorumlu_id,
            'user.id': user.id,
            'user.birim_id': user.birim_id,
            'body.birim_id': body.birim_id,
            'sorumluId': sorumluId,
            'olusturanId': olusturanId,
            'birimId': birimId,
            'sorumluId isNaN': isNaN(sorumluId),
            'olusturanId isNaN': isNaN(olusturanId),
            'birimId isNaN': birimId !== null && isNaN(birimId)
        });

        if (isNaN(sorumluId) || isNaN(olusturanId) || (birimId !== null && isNaN(birimId))) {
            return NextResponse.json({ success: false, error: 'Geçersiz ID değerleri' }, { status: 400 });
        }

        const gorev = await prisma.gorev.create({
            data: {
                kod: newKod,
                baslik: body.baslik,
                aciklama: body.aciklama,
                oncelik: body.oncelik || 'ORTA',
                kategori: body.kategori || 'DIGER',
                durum: 'DEVAM_EDEN',
                is_suresiz: body.is_suresiz || false,
                baslangic_tarihi: body.baslangic_tarihi ? new Date(body.baslangic_tarihi) : null,
                bitis_tarihi: body.bitis_tarihi ? new Date(body.bitis_tarihi) : null,
                sorumlu_id: sorumluId,
                olusturan_id: olusturanId,
                birim_id: birimId,
                gorsel_1: body.gorsel_1,
                gorsel_1_not: body.gorsel_1_not,
                gorsel_2: body.gorsel_2,
                gorsel_2_not: body.gorsel_2_not,
                gorsel_3: body.gorsel_3,
                gorsel_3_not: body.gorsel_3_not,
                destek_verenler: {
                    connect: body.destek_verenler?.map((id: string) => {
                        const parsedId = parseInt(id);
                        return isNaN(parsedId) ? null : { id: parsedId };
                    }).filter(Boolean) || []
                }
            },
            include: {
                destek_verenler: {
                    select: { id: true, ad: true, soyad: true, profil_foto_url: true }
                }
            }
        });

        // Aktivite logu ekle
        await prisma.aktiviteLog.create({
            data: {
                personel_id: parseInt(user.id),
                personel_email: user.email,
                islem: 'gorev.olustur',
                tablo: 'gorevler',
                kayit_id: gorev.id.toString(), // Convert to string as schema demands
                aciklama: `${newKod} - ${gorev.baslik} başlıklı görev oluşturuldu.`
            }
        });

        // İlk log güncellemesi (Başlangıç notu)
        await prisma.gorevGuncelleme.create({
            data: {
                gorev_id: gorev.id,
                personel_id: parseInt(user.id),
                mesaj: `Görev oluşturuldu. Kod: ${newKod}. ${body.notlar ? `Not: ${body.notlar}` : ''}`,
            }
        });

        return NextResponse.json({ success: true, data: gorev });
    } catch (error) {
        console.error('Gorev create error:', error);
        return NextResponse.json({ success: false, error: 'Görev oluşturulamadı' }, { status: 500 });
    }
}
