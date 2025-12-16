import { getServerSession } from 'next-auth'
import { authOptions } from './options'
import { prisma } from '@/lib/prisma'

/**
 * Get the current user session with full details
 */
export async function getCurrentUser() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return null

  const user = await prisma.personel.findUnique({
    where: { email: session.user.email },
    include: {
      rol: {
        include: {
          yetkiler: {
            include: {
              yetki: true
            }
          }
        }
      },
      birim: true
    }
  })

  return user
}

/**
 * Check if user has a specific permission
 */
export async function hasPermission(yetkiKodu: string): Promise<boolean> {
  const user = await getCurrentUser()
  if (!user) return false

  // Admin tüm yetkilere sahip
  if (user.rol.kod === 'ADMIN') return true

  // Kullanıcının yetkilerini kontrol et
  const yetkiler = user.rol.yetkiler.map((ry: any) => ry.yetki.kod)
  return yetkiler.includes(yetkiKodu)
}

/**
 * Check if user has ANY of the given permissions
 */
export async function hasAnyPermission(yetkiKodlari: string[]): Promise<boolean> {
  for (const kod of yetkiKodlari) {
    if (await hasPermission(kod)) return true
  }
  return false
}

/**
 * Check if user has ALL of the given permissions
 */
export async function hasAllPermissions(yetkiKodlari: string[]): Promise<boolean> {
  for (const kod of yetkiKodlari) {
    if (!(await hasPermission(kod))) return false
  }
  return true
}

/**
 * Check if user has minimum role level
 */
export async function hasMinRoleLevel(minSeviye: number): Promise<boolean> {
  const user = await getCurrentUser()
  if (!user) return false
  return user.rol.seviye >= minSeviye
}

/**
 * Check if user is admin
 */
export async function isAdmin(): Promise<boolean> {
  const user = await getCurrentUser()
  if (!user) return false
  return user.rol.kod === 'ADMIN'
}

/**
 * Check if user is Başkan
 */
export async function isBaskan(): Promise<boolean> {
  const user = await getCurrentUser()
  if (!user) return false
  return ['ADMIN', 'BASKAN'].includes(user.rol.kod)
}

/**
 * Check if user is Birim Yöneticisi or higher
 */
export async function isBirimYoneticisi(): Promise<boolean> {
  const user = await getCurrentUser()
  if (!user) return false
  return ['ADMIN', 'BASKAN', 'BIRIM_YONETICISI'].includes(user.rol.kod)
}

/**
 * Check if user can access a specific birim
 */
export async function canAccessBirim(targetBirimId: string): Promise<boolean> {
  const user = await getCurrentUser()
  if (!user) return false

  // Admin ve Başkan her birime erişebilir
  if (['ADMIN', 'BASKAN', 'ISTATISTIKCI'].includes(user.rol.kod)) return true

  // Diğerleri sadece kendi birimlerine
  return user.birim_id === targetBirimId
}

/**
 * Check if user can manage (edit/delete) a personel
 */
export async function canManagePersonel(targetPersonelId: string): Promise<boolean> {
  const user = await getCurrentUser()
  if (!user) return false

  // Admin her personeli yönetebilir
  if (user.rol.kod === 'ADMIN') return true

  // Başkan her personeli yönetebilir
  if (user.rol.kod === 'BASKAN') return true

  // Birim yöneticisi kendi birimindeki personeli yönetebilir
  if (user.rol.kod === 'BIRIM_YONETICISI') {
    const targetPersonel = await prisma.personel.findUnique({
      where: { id: targetPersonelId },
      select: { birim_id: true }
    })
    return targetPersonel?.birim_id === user.birim_id
  }

  // Personel sadece kendini düzenleyebilir (profil)
  return user.id === targetPersonelId
}

/**
 * Require authentication or throw error
 */
export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('Unauthorized')
  }
  return user
}

/**
 * Require specific permission or throw error
 */
export async function requirePermission(yetkiKodu: string) {
  const has = await hasPermission(yetkiKodu)
  if (!has) {
    throw new Error('Forbidden: Yetkiniz yok')
  }
}

/**
 * Require admin role or throw error
 */
export async function requireAdmin() {
  const admin = await isAdmin()
  if (!admin) {
    throw new Error('Forbidden: Sadece admin erişebilir')
  }
}

/**
 * Get birim filter for queries
 * Returns birim_id filter if user should be restricted to their own unit
 * Returns undefined if user can see all units
 */
export async function getBirimFilter(): Promise<{ birim_id?: string } | undefined> {
  const user = await getCurrentUser()
  if (!user) return undefined

  // Admin, Başkan, ve İstatistikçi tüm birimleri görebilir
  if (['ADMIN', 'BASKAN', 'ISTATISTIKCI'].includes(user.rol.kod)) {
    return {} // No filter - can see all
  }

  // Diğer roller sadece kendi birimlerini görebilir
  return { birim_id: user.birim_id }
}

/**
 * Check if user is restricted to their own unit
 */
export async function isRestrictedToOwnBirim(): Promise<boolean> {
  const user = await getCurrentUser()
  if (!user) return true

  // Admin, Başkan, ve İstatistikçi kısıtlı değil
  return !['ADMIN', 'BASKAN', 'ISTATISTIKCI'].includes(user.rol.kod)
}

/**
 * Get SHM data filter based on user's unit
 * For SHM staff: only their SHM's sub-units
 * For admins: all sub-units
 */
export async function getSHMDataFilter() {
  const user = await getCurrentUser()
  if (!user) return { shm_birim_id: 'none' } // Return impossible filter

  // Admin, Başkan, İstatistikçi - tüm SHM verilerini görebilir
  if (['ADMIN', 'BASKAN', 'ISTATISTIKCI'].includes(user.rol.kod)) {
    return {} // No filter
  }

  // SHM çalışanı - sadece kendi SHM'sinin alt birimlerini görebilir
  // Kullanıcının biriminin tipi SHM ise
  if (user.birim.tip === 'SHM') {
    return {
      shm_alt_birim: {
        shm_birim_id: user.birim_id
      }
    }
  }

  // ASM veya diğer birim tipleri SHM verisine erişemez
  return { shm_birim_id: 'none' } // Return impossible filter
}

/**
 * Validate that user can create/edit data for a specific SHM alt birim
 */
export async function canAccessSHMAltBirim(altBirimId: string): Promise<boolean> {
  const user = await getCurrentUser()
  if (!user) return false

  // Admin, Başkan, İstatistikçi - tüm alt birimlere erişebilir
  if (['ADMIN', 'BASKAN', 'ISTATISTIKCI'].includes(user.rol.kod)) {
    return true
  }

  // Alt birimin hangi SHM'ye ait olduğunu kontrol et
  const altBirim = await prisma.sHMAltBirim.findUnique({
    where: { id: altBirimId },
    select: { shm_birim_id: true }
  })

  if (!altBirim) return false

  // Kullanıcının birimi ile eşleşiyor mu?
  return altBirim.shm_birim_id === user.birim_id
}
