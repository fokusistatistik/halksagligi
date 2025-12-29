
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixIzmit() {
    try {
        const izmits = await prisma.birim.findMany({
            where: {
                ad: {
                    contains: 'İzmit İlçe Sağlık Müdürlüğü'
                }
            }
        })

        console.log(`Bulunan birim sayısı: ${izmits.length}`)

        for (const izmit of izmits) {
            console.log('Birim:', izmit)

            if (izmit.tip === 'MUDURLUK') {
                const koordIlce = await prisma.birim.findFirst({
                    where: {
                        kod: 'KOORD-ILCE'
                    }
                });

                await prisma.birim.update({
                    where: { id: izmit.id },
                    data: {
                        tip: 'DIS_BIRIM',
                        dis_birim_tip: 'ILCE_SAGLIK',
                        ust_birim_id: koordIlce ? koordIlce.id : izmit.ust_birim_id
                    }
                })
                console.log(`Birim ${izmit.id} güncellendi.`)
            }
        }
    } catch (e) {
        console.error(e)
    } finally {
        await prisma.$disconnect()
    }
}

fixIzmit()
