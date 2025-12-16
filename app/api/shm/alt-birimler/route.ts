import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/shm/alt-birimler
 * SHM alt birimlerini listeler
 */
export async function GET(_request: NextRequest) {
  try {
    const altBirimler = await prisma.sHMAltBirim.findMany({
      where: { aktif: true },
      include: {
        shm_birim: {
          select: {
            id: true,
            ad: true,
            kod: true
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
      { error: 'Alt birimler yüklenemedi' },
      { status: 500 }
    );
  }
}
