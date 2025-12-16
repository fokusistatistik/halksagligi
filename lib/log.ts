import { prisma } from './prisma'

export interface LogActivityParams {
  personel_id?: string
  personel_email?: string
  islem: string
  tablo: string
  kayit_id?: string
  eski_veri?: any
  yeni_veri?: any
  aciklama?: string
  ip_adresi?: string | null
  user_agent?: string | null
}

/**
 * Log an activity to the database
 */
export async function logAktivite(params: LogActivityParams) {
  try {
    await prisma.aktiviteLog.create({
      data: {
        personel_id: params.personel_id,
        personel_email: params.personel_email,
        islem: params.islem,
        tablo: params.tablo,
        kayit_id: params.kayit_id,
        eski_veri: params.eski_veri || null,
        yeni_veri: params.yeni_veri || null,
        aciklama: params.aciklama,
        ip_adresi: params.ip_adresi,
        user_agent: params.user_agent
      }
    })
  } catch (error) {
    console.error('Activity log error:', error)
    // Log hatası uygulamayı durdurmamalı
  }
}

/**
 * Helper to get IP address from request
 */
export function getIpFromHeaders(headers: Headers): string | null {
  return (
    headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    headers.get('x-real-ip') ||
    null
  )
}

/**
 * Helper to get user agent from request
 */
export function getUserAgentFromHeaders(headers: Headers): string | null {
  return headers.get('user-agent')
}
