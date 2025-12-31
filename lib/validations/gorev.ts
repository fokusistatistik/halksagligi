import { z } from 'zod';

export const gorevCreateSchema = z.object({
    baslik: z.string().min(1, "Başlık zorunludur").max(191),
    aciklama: z.string().optional(),
    oncelik: z.enum(['DUSUK', 'ORTA', 'YUKSEK', 'ACIL']).default('ORTA'),
    kategori: z.string().optional(),
    sorumlu_id: z.union([z.string().min(1, "Sorumlu seçiniz"), z.number()]).transform(val => Number(val)),

    // Date transformations
    baslangic_tarihi: z.string().or(z.date()).optional().transform(val => val ? new Date(val) : undefined),
    bitis_tarihi: z.string().or(z.date()).optional().nullable().transform(val => val ? new Date(val) : undefined),

    is_suresiz: z.boolean().default(false),

    // Support team IDs
    destek_verenler: z.array(z.union([z.string(), z.number()])).optional().transform(arr => arr?.map(Number) || []),

    // Media
    gorsel_1: z.string().optional().nullable(),
    gorsel_1_not: z.string().optional().nullable(),
    gorsel_2: z.string().optional().nullable(),
    gorsel_2_not: z.string().optional().nullable(),
    gorsel_3: z.string().optional().nullable(),
    gorsel_3_not: z.string().optional().nullable(),
});

export const gorevUpdateSchema = gorevCreateSchema.partial().extend({
    durum: z.enum(['BEKLEYEN', 'DEVAM_EDEN', 'TAMAMLANDI', 'IPTAL']).optional(),
    tamamlanma_notu: z.string().optional().nullable(),
    gorsel_url: z.string().optional().nullable(), // For status update evidence
    mesaj: z.string().optional(), // For log message
});

export const routeParamsSchema = z.object({
    id: z.coerce.number().int().positive(),
});
