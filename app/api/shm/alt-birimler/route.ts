import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth/permissions';

/**
 * GET /api/shm/alt-birimler
 * SHM alt birimlerini listeler - kullanıcının birimi bazlı filtreleme ile
 */
export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Yetkisiz erişim' },
        { status: 401 }
      );
    }

    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    // Birim bazlı filtreleme
    let whereClause: any = { aktif: true };

    // Admin, Başkan, İstatistikçi tüm alt birimleri görebilir
    if (!['ADMIN', 'BASKAN', 'ISTATISTIKCI'].includes(user.rol.kod)) {
      // SHM çalışanı sadece kendi SHM'sinin alt birimlerini görebilir
      if (user.birim.tip === 'SHM') {
        whereClause.shm_birim_id = user.birim_id;
      } else {
        // ASM veya diğer birimler SHM alt birimlerini göremez
        return NextResponse.json({
          success: true,
          data: []
        });
      }
    }

    const altBirimler = await prisma.sHMAltBirim.findMany({
      where: whereClause,
      include: {
        shm_birim: {
          select: {
            id: true,
            ad: true,
            kod: true,
            tip: true
          }
        }
      },
      orderBy: { ad: 'asc' }
    });

    return NextResponse.json({
      success: true,
      data: altBirimler
    });
  } catch (_error) {
    return NextResponse.json(
      { success: false, error: 'Alt birimler yüklenemedi' },
      { status: 500 }
    );
  }
}
