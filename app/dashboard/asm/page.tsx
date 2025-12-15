import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/dashboard/stat-card";
import {
  Users,
  Baby,
  Syringe,
  Home,
  Activity,
  TrendingUp,
  Plus,
} from "lucide-react";
import Link from "next/link";

// Mock data - gerçek uygulamada webhook'tan gelecek
async function getASMData() {
  return {
    bugunVeri: {
      muayene_sayisi: 45,
      asi_sayisi: 23,
      gebe_takip: 12,
      bebek_izlem: 8,
      ev_ziyaret: 5,
      saglik_tarama: 15,
    },
    aylikIstatistik: {
      toplam_muayene: 1234,
      toplam_asi: 567,
      toplam_gebe: 234,
      toplam_bebek: 189,
    },
  };
}

export default async function ASMPage() {
  const { bugunVeri, aylikIstatistik } = await getASMData();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-foreground">ASM Birimi</h1>
          <p className="text-muted-foreground mt-1">
            Aile Sağlığı Merkezi Veri Yönetimi
          </p>
        </div>
        <Link href="/dashboard/asm/veri-giris">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Yeni Veri Girişi
          </Button>
        </Link>
      </div>

      {/* Bugünkü Veriler */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Bugünkü Veriler</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <StatCard
            title="Muayene"
            value={bugunVeri.muayene_sayisi}
            icon={Users}
            description="Bugün yapılan"
            colorClass="bg-primary"
          />
          <StatCard
            title="Aşı"
            value={bugunVeri.asi_sayisi}
            icon={Syringe}
            description="Bugün yapılan"
            colorClass="bg-success"
          />
          <StatCard
            title="Gebe Takip"
            value={bugunVeri.gebe_takip}
            icon={Activity}
            description="Bugün yapılan"
            colorClass="bg-blue-500"
          />
          <StatCard
            title="Bebek İzlem"
            value={bugunVeri.bebek_izlem}
            icon={Baby}
            description="Bugün yapılan"
            colorClass="bg-purple-500"
          />
          <StatCard
            title="Ev Ziyareti"
            value={bugunVeri.ev_ziyaret}
            icon={Home}
            description="Bugün yapılan"
            colorClass="bg-warning"
          />
          <StatCard
            title="Sağlık Tarama"
            value={bugunVeri.saglik_tarama}
            icon={TrendingUp}
            description="Bugün yapılan"
            colorClass="bg-secondary"
          />
        </div>
      </div>

      {/* Aylık İstatistikler */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Bu Ay Özet</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <Users className="h-8 w-8 mx-auto text-primary mb-2" />
                <p className="text-sm text-muted-foreground">Toplam Muayene</p>
                <p className="text-3xl font-bold mt-2">{aylikIstatistik.toplam_muayene}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <Syringe className="h-8 w-8 mx-auto text-success mb-2" />
                <p className="text-sm text-muted-foreground">Toplam Aşı</p>
                <p className="text-3xl font-bold mt-2">{aylikIstatistik.toplam_asi}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <Activity className="h-8 w-8 mx-auto text-blue-500 mb-2" />
                <p className="text-sm text-muted-foreground">Gebe Takip</p>
                <p className="text-3xl font-bold mt-2">{aylikIstatistik.toplam_gebe}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <Baby className="h-8 w-8 mx-auto text-purple-500 mb-2" />
                <p className="text-sm text-muted-foreground">Bebek İzlem</p>
                <p className="text-3xl font-bold mt-2">{aylikIstatistik.toplam_bebek}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Hızlı İşlemler</CardTitle>
          <CardDescription>ASM veri yönetimi işlemleri</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            <Link
              href="/dashboard/asm/veri-giris"
              className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="font-medium">Veri Girişi</div>
              <div className="text-sm text-muted-foreground mt-1">Günlük veri kaydet</div>
            </Link>
            <Link
              href="/dashboard/asm/gecmis"
              className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="font-medium">Geçmiş Veriler</div>
              <div className="text-sm text-muted-foreground mt-1">Eski kayıtları görüntüle</div>
            </Link>
            <Link
              href="/dashboard/asm/raporlar"
              className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="font-medium">Raporlar</div>
              <div className="text-sm text-muted-foreground mt-1">İstatistik ve analizler</div>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
