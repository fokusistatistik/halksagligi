import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, canManagePersonel } from '@/lib/auth/permissions'
import { prisma } from '@/lib/prisma'
import { logAktivite } from '@/lib/log'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { cleanPhoneNumber } from '@/lib/format-phone'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const parsedId = parseInt(id)
    if (isNaN(parsedId)) return NextResponse.json({ error: 'Geçersiz ID' }, { status: 400 })

    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const personel = await prisma.personel.findUnique({
      where: { id: parsedId },
      include: { rol: true, birim: true, yonetici: true },
    })

    if (!personel) {
      return NextResponse.json({ error: 'Personel bulunamadı' }, { status: 404 })
    }

    const { password: _password, ...safePersonel } = personel
    return NextResponse.json({ success: true, data: safePersonel })
  } catch (_error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const parsedId = parseInt(id)
    if (isNaN(parsedId)) return NextResponse.json({ error: 'Geçersiz ID' }, { status: 400 })

    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    if (!(await canManagePersonel(parsedId))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { password, ...updateData } = body

    // ID Convert
    if (updateData.rol_id) updateData.rol_id = Number(updateData.rol_id)
    if (updateData.birim_id) updateData.birim_id = Number(updateData.birim_id)
    if (updateData.yonetici_id) updateData.yonetici_id = Number(updateData.yonetici_id)

    // Temizleme: Boş string olan (ama zorunlu olmayan) alanları null yap
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === '') {
        updateData[key] = null;
      }
    });

    // Telefon temizleme
    if (updateData.telefon) {
      updateData.telefon = cleanPhoneNumber(updateData.telefon);
    }
    if (updateData.acil_durum_telefon) {
      updateData.acil_durum_telefon = cleanPhoneNumber(updateData.acil_durum_telefon);
    }

    // GÜVENLİK KONTROLÜ
    if (user.rol.kod !== 'ADMIN' && user.rol.kod !== 'BASKAN') {
      // 1. Kendi profilini düzenliyorsa kritik alanları değiştiremez
      if (user.id === parsedId) {
        if (updateData.rol_id || updateData.birim_id || updateData.aktif !== undefined) {
          return NextResponse.json({ error: 'Kendi rol, birim veya durum bilgilerinizi değiştiremezsiniz' }, { status: 403 })
        }
      } else {
        // 2. Başkasını düzenliyorsa, hedef personelin seviyesi kontrol edilir
        const targetPersonel = await prisma.personel.findUnique({
          where: { id: parsedId },
          include: { rol: true }
        });

        // Eşit veya yüksek yetkiliyi düzenleyemez
        if (targetPersonel && targetPersonel.rol.seviye >= user.rol.seviye) {
          return NextResponse.json(
            { error: 'Sizden yüksek veya eşit yetkideki bir personeli düzenleyemezsiniz' },
            { status: 403 }
          )
        }

        // 3. Birim Değişikliği Kısıtı
        if (updateData.birim_id && updateData.birim_id !== user.birim_id) {
          return NextResponse.json(
            { error: 'Personeli başka bir birime taşıma yetkiniz yok' },
            { status: 403 }
          )
        }

        // 4. Rol Değişikliği Kısıtı (Yükseltme yapılamaz)
        if (updateData.rol_id) {
          const atanacakRol = await prisma.rol.findUnique({ where: { id: updateData.rol_id } })
          if (!atanacakRol) {
            return NextResponse.json({ error: 'Geçersiz rol' }, { status: 400 })
          }
          if (atanacakRol.seviye >= user.rol.seviye) {
            return NextResponse.json(
              { error: 'Kendi yetki seviyenizden yüksek veya eşit bir rol atayamazsınız' },
              { status: 403 }
            )
          }
        }
      }
    }

    // Password Change Logic
    if (updateData.newPassword) {
      if (!updateData.currentPassword) {
        return NextResponse.json({ error: 'Mevcut şifrenizi girmelisiniz.' }, { status: 400 });
      }

      // Verify current password
      const currentPersonel = await prisma.personel.findUnique({ where: { id: parsedId } });
      if (!currentPersonel) return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 });

      const isValid = await bcrypt.compare(updateData.currentPassword, currentPersonel.password);
      if (!isValid) {
        return NextResponse.json({ error: 'Mevcut şifreniz hatalı.' }, { status: 400 });
      }

      // Hash new password
      updateData.password = await bcrypt.hash(updateData.newPassword, 10);

      // Remove temp fields
      delete updateData.currentPassword;
      delete updateData.newPassword;
      delete updateData.confirmPassword;
    } else if (password && password.trim() !== '' && await canManagePersonel(parsedId)) {
      // Admin force update
      updateData.password = await bcrypt.hash(password, 10)
    }

    // Prisma işleminden önce veritabanında olmayan geçici alanları kesinlikle temizle
    delete updateData.currentPassword;
    delete updateData.newPassword;
    delete updateData.confirmPassword;

    const updatedPersonel = await prisma.personel.update({
      where: { id: parsedId },
      data: { ...updateData, updated_by_id: user.id },
      include: { rol: true, birim: true },
    })

    await logAktivite({
      personel_id: user.id,
      personel_email: user.email,
      islem: 'personel.guncelle',
      tablo: 'personel',
      kayit_id: id,
      aciklama: `Personel güncellendi: ${updatedPersonel.ad} ${updatedPersonel.soyad}`,
    })

    const { password: _, ...safe } = updatedPersonel
    return NextResponse.json({ success: true, data: safe })
  } catch (error: any) {
    console.error('Personel güncelleme hatası:', error)

    if (error instanceof z.ZodError) {
      const messages = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
      return NextResponse.json({ error: `Doğrulama Hatası: ${messages}` }, { status: 400 })
    }

    // Prisma Unique Constraint Error (P2002)
    if (error.code === 'P2002') {
      const target = error.meta?.target || []
      const fieldName = Array.isArray(target) ? target.join(', ') : String(target)

      let message = 'Bu kayıt zaten mevcut'
      if (fieldName.includes('tc_kimlik_no')) message = 'Bu TC Kimlik No zaten kayıtlı'
      if (fieldName.includes('email')) message = 'Bu email adresi zaten kullanılıyor'

      return NextResponse.json({ error: message }, { status: 400 })
    }

    return NextResponse.json({
      error: 'Internal Server Error',
      message: error.message
    }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const parsedId = parseInt(id)
    if (isNaN(parsedId)) return NextResponse.json({ error: 'Geçersiz ID' }, { status: 400 })

    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    if (!(await canManagePersonel(parsedId))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await prisma.personel.delete({ where: { id: parsedId } })

    await logAktivite({
      personel_id: user.id,
      personel_email: user.email,
      islem: 'personel.sil',
      tablo: 'personel',
      kayit_id: id,
      aciklama: `Personel silindi`,
    })

    return NextResponse.json({ success: true, message: 'Personel silindi' })
  } catch (_error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
