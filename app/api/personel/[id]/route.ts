import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, canManagePersonel } from '@/lib/auth/permissions'
import { prisma } from '@/lib/prisma'
import { logAktivite, getIpFromHeaders, getUserAgentFromHeaders } from '@/lib/log'
import bcrypt from 'bcryptjs'

export async function GET(
<<<<<<< HEAD
  request: NextRequest,
=======
  _request: NextRequest,
>>>>>>> 688cb8399544cb48ad1e4bd218a7ee9d5f50d8fd
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const personel = await prisma.personel.findUnique({
      where: { id },
      include: { rol: true, birim: true, yonetici: true },
    })

    if (!personel) {
      return NextResponse.json({ error: 'Personel bulunamadı' }, { status: 404 })
    }

    const { password, ...safePersonel } = personel
    return NextResponse.json({ success: true, data: safePersonel })
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    if (!(await canManagePersonel(id))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { password, ...updateData } = body

    if (password) {
      updateData.password = await bcrypt.hash(password, 10)
    }

    const updatedPersonel = await prisma.personel.update({
      where: { id },
      data: { ...updateData, updated_by_id: user.id },
      include: { rol: true, birim: true },
    })

    await logAktivite({
      personel_id: user.id,
      personel_email: user.email,
      islem: 'personel.guncelle',
      tablo: 'personel',
      kayit_id: id,
      yeni_veri: updatedPersonel,
      aciklama: `Personel güncellendi: ${updatedPersonel.ad} ${updatedPersonel.soyad}`,
      ip_adresi: getIpFromHeaders(request.headers),
      user_agent: getUserAgentFromHeaders(request.headers),
    })

    const { password: _, ...safe } = updatedPersonel
    return NextResponse.json({ success: true, data: safe })
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    if (!(await canManagePersonel(id))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await prisma.personel.delete({ where: { id } })

    await logAktivite({
      personel_id: user.id,
      personel_email: user.email,
      islem: 'personel.sil',
      tablo: 'personel',
      kayit_id: id,
      aciklama: `Personel silindi`,
      ip_adresi: getIpFromHeaders(request.headers),
      user_agent: getUserAgentFromHeaders(request.headers),
    })

    return NextResponse.json({ success: true, message: 'Personel silindi' })
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
