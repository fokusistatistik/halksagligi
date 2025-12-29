import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, hasPermission } from '@/lib/auth/permissions'
import { prisma } from '@/lib/prisma'

export async function GET(_request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || !(await hasPermission('rol.goruntule'))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const roller = await prisma.rol.findMany({
      include: {
        yetkiler: {
          include: {
            yetki: true
          }
        },
        _count: {
          select: { personeller: true }
        }
      },
      orderBy: { seviye: 'desc' }
    })

    return NextResponse.json({ success: true, data: roller })
  } catch (_error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || !(await hasPermission('rol.ekle'))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { yetkiIds, ...rolData } = body

    // Temizle
    if ('id' in rolData) delete rolData.id
    if ('yetkiler' in rolData) delete rolData.yetkiler
    if ('_count' in rolData) delete rolData._count

    // Rol oluştur
    const rol = await prisma.rol.create({ data: rolData })

    // Yetkileri ekle
    if (yetkiIds && Array.isArray(yetkiIds) && yetkiIds.length > 0) {
      const validYetkiIds = yetkiIds
        .map((id: any) => parseInt(id))
        .filter((id: number) => !isNaN(id))

      if (validYetkiIds.length > 0) {
        await prisma.rolYetki.createMany({
          data: validYetkiIds.map((yetkiId: number) => ({
            rol_id: rol.id,
            yetki_id: yetkiId
          }))
        })
      }
    }

    // Oluşturulan rolü yetkileriyle döndür
    const newRol = await prisma.rol.findUnique({
      where: { id: rol.id },
      include: {
        yetkiler: { include: { yetki: true } },
        _count: { select: { personeller: true } }
      }
    })

    return NextResponse.json({ success: true, data: newRol }, { status: 201 })
  } catch (error) {
    console.error('Rol POST error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
