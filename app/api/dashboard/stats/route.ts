import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth/permissions';

export async function GET() {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 1. Toplam Personel Sayısı
        const totalPersonel = await prisma.personel.count({
            where: { aktif: true }
        });

        // 2. Görev Dağılımı (Pie Chart için)
        const taskStats = await prisma.gorev.groupBy({
            by: ['durum'],
            _count: { durum: true }
        });

        const statusLabelMap: Record<string, string> = {
            'TAMAMLANDI': 'Tamamlanan',
            'DEVAM_EDEN': 'Devam Eden',
            'BEKLEYEN': 'Bekleyen',
            'IPTAL': 'İptal'
        };

        const statusColorMap: Record<string, string> = {
            'TAMAMLANDI': '#10b981', // Green
            'DEVAM_EDEN': '#f59e0b', // Amber
            'BEKLEYEN': '#ef4444',   // Red
            'IPTAL': '#64748b'       // Slate
        };

        const taskDistribution = taskStats.map(stat => ({
            name: statusLabelMap[stat.durum] || stat.durum,
            value: stat._count.durum,
            color: statusColorMap[stat.durum] || '#cbd5e1'
        }));

        // Aktif görev: Devam Eden + Bekleyen
        const activeTasks = taskStats
            .filter(t => ['DEVAM_EDEN', 'BEKLEYEN'].includes(t.durum))
            .reduce((acc, curr) => acc + curr._count.durum, 0);

        // 3. İç Birim Sayısı (Dis Birim Tipi Olmayanlar)
        const internalUnitCount = await prisma.birim.count({
            where: {
                aktif: true,
                dis_birim_tip: null
            }
        });

        // 4. Dış Birim Sayısı (ASM, TSM vb.)
        const externalUnitCount = await prisma.birim.count({
            where: {
                aktif: true,
                dis_birim_tip: { not: null }
            }
        });

        // 5. İlçelere Göre Birim Dağılımı (Harita ve Grafikler için)
        const units = await prisma.birim.findMany({
            where: {
                aktif: true,
                ilce: { not: null },
                dis_birim_tip: { not: null }
            },
            select: {
                ilce: true,
                dis_birim_tip: true
            }
        });

        const knownDistricts = ['Başiskele', 'Çayırova', 'Darıca', 'Derince', 'Dilovası', 'Gebze', 'Gölcük', 'İzmit', 'Kandıra', 'Karamürsel', 'Kartepe', 'Körfez'];
        const districtMap: Record<string, { asm: number, shm: number, tsm: number, diger: number }> = {};

        knownDistricts.forEach(d => {
            districtMap[d] = { asm: 0, shm: 0, tsm: 0, diger: 0 };
        });

        units.forEach(u => {
            const dist = u.ilce?.trim();
            if (dist && districtMap[dist]) {
                if (u.dis_birim_tip === 'ASM') districtMap[dist].asm++;
                else if (u.dis_birim_tip === 'SHM') districtMap[dist].shm++;
                else if (u.dis_birim_tip === 'ILCE_SAGLIK') districtMap[dist].tsm++;
                else districtMap[dist].diger++;
            }
        });

        const districtData = Object.entries(districtMap).map(([name, counts]) => ({
            name,
            asm: counts.asm,
            shm: counts.shm,
            tsm: counts.tsm,
            diger: counts.diger
        }));

        return NextResponse.json({
            success: true,
            data: {
                totalPersonel,
                activeTasks,
                internalUnitCount,
                externalUnitCount,
                districtData,
                taskDistribution
            }
        });

    } catch (error) {
        console.error('Dashboard stats error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
