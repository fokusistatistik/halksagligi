import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, hasPermission } from '@/lib/auth/permissions';
import { prisma } from '@/lib/prisma';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user || !(await hasPermission('rol.goruntule'))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const rolId = parseInt(params.id);
    if (isNaN(rolId)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const rol = await prisma.rol.findUnique({
      where: { id: rolId },
      include: {
        yetkiler: {
          include: {
            yetki: true
          }
        },
        _count: {
          select: { personeller: true }
        }
      }
    });

    if (!rol) {
      return NextResponse.json({ error: 'Rol not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: rol });
  } catch (error) {
    console.error('Rol GET error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user || !(await hasPermission('rol.duzenle'))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const rolId = parseInt(params.id);
    if (isNaN(rolId)) {
      return NextResponse.json({ error: 'Geçersiz Rol ID' }, { status: 400 });
    }

    const body = await request.json();
    const { yetkiIds, ...rolData } = body;

    // Remove ID from data if present to avoid update error
    if ('id' in rolData) delete rolData.id;
    if ('yetkiler' in rolData) delete rolData.yetkiler;
    if ('_count' in rolData) delete rolData._count;
    if ('seviye' in rolData) rolData.seviye = parseInt(rolData.seviye);

    // Rol bilgilerini güncelle
    await prisma.rol.update({
      where: { id: rolId },
      data: rolData,
    });

    // Eğer yetki listesi gönderildiyse, yetkileri güncelle
    if (yetkiIds !== undefined && Array.isArray(yetkiIds)) {
      // Mevcut yetkileri sil
      await prisma.rolYetki.deleteMany({
        where: { rol_id: rolId }
      });

      // Yeni yetkileri ekle
      const validYetkiIds = yetkiIds.map((id: any) => parseInt(id)).filter((id: number) => !isNaN(id));

      if (validYetkiIds.length > 0) {
        await prisma.rolYetki.createMany({
          data: validYetkiIds.map((yetkiId: number) => ({
            rol_id: rolId,
            yetki_id: yetkiId
          }))
        });
      }
    }

    // Güncellenmiş rolü döndür
    const updatedRol = await prisma.rol.findUnique({
      where: { id: rolId },
      include: {
        yetkiler: {
          include: {
            yetki: true
          }
        },
        _count: {
          select: { personeller: true }
        }
      }
    });

    return NextResponse.json({ success: true, data: updatedRol });
  } catch (error) {
    console.error('Rol PUT error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user || !(await hasPermission('rol.sil'))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const rolId = parseInt(params.id);
    if (isNaN(rolId)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    // Rol kullanımda mı kontrol et
    const personelCount = await prisma.personel.count({
      where: { rol_id: rolId }
    });

    if (personelCount > 0) {
      return NextResponse.json(
        { error: `Bu rol ${personelCount} kullanıcı tarafından kullanılıyor, silinemez` },
        { status: 400 }
      );
    }

    await prisma.rol.delete({
      where: { id: rolId }
    });

    return NextResponse.json({ success: true, message: 'Rol silindi' });
  } catch (error) {
    console.error('Rol DELETE error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
