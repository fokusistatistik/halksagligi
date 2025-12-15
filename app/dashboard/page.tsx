import { Suspense } from "react";
import { StatCard } from "@/components/dashboard/stat-card";
import { RecentTasks } from "@/components/dashboard/recent-tasks";
import {
  CheckSquare,
  Clock,
  TrendingUp,
  Users,
  Building2,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth/session";
import { redirect } from "next/navigation";

// Mock data - gerçek uygulamada webhook'tan gelecek
async function getDashboardData() {
  // TODO: Webhook'tan veri çek
  return {
    stats: {
      toplam_gorev: 156,
      tamamlanan_gorev: 89,
      devam_eden_gorev: 45,
      geciken_gorev: 12,
      toplam_personel: 47,
      aktif_birim: 12,
      bu_ay_gorev: 34,
      tamamlanma_orani: 68,
    },
    recentTasks: [
      {
        id: "1",
        baslik: "ASM Aşı Envanter Kontrolü",
        aciklama: "Tüm ASM birimlerinde aşı stok kontrolü yapılması ve rapor hazırlanması",
        durum: "devam_ediyor" as const,
        oncelik: "yuksek" as const,
        atanan_id: "user1",
        olusturan_id: "user2",
        birim_id: "birim1",
        baslangic_tarihi: new Date("2024-01-15"),
        bitis_tarihi: new Date("2024-02-01"),
        tamamlanma_yuzdesi: 45,
        createdAt: new Date("2024-01-15"),
        updatedAt: new Date("2024-01-20"),
        atanan: { id: "user1", name: "Ayşe Yılmaz", email: "ayse@example.com", role: "personel" as const, createdAt: new Date(), updatedAt: new Date() },
        birim: { id: "birim1", ad: "ASM Merkez", kod: "ASM001", tip: "ASM" as const, aktif: true, createdAt: new Date(), updatedAt: new Date() },
      },
      {
        id: "2",
        baslik: "Gebe Takip Sistemi Eğitimi",
        aciklama: "Yeni gebe takip sisteminin personele anlatılması",
        durum: "beklemede" as const,
        oncelik: "orta" as const,
        atanan_id: "user3",
        olusturan_id: "user2",
        birim_id: "birim2",
        baslangic_tarihi: new Date("2024-01-20"),
        bitis_tarihi: new Date("2024-01-25"),
        tamamlanma_yuzdesi: 0,
        createdAt: new Date("2024-01-18"),
        updatedAt: new Date("2024-01-18"),
        atanan: { id: "user3", name: "Mehmet Kaya", email: "mehmet@example.com", role: "personel" as const, createdAt: new Date(), updatedAt: new Date() },
        birim: { id: "birim2", ad: "ASM Doğu", kod: "ASM002", tip: "ASM" as const, aktif: true, createdAt: new Date(), updatedAt: new Date() },
      },
      {
        id: "3",
        baslik: "Aylık Performans Raporu Hazırlama",
        aciklama: "Ocak ayı birim performans raporlarının hazırlanması",
        durum: "tamamlandi" as const,
        oncelik: "yuksek" as const,
        atanan_id: "user4",
        olusturan_id: "user2",
        birim_id: "birim3",
        baslangic_tarihi: new Date("2024-01-01"),
        bitis_tarihi: new Date("2024-01-15"),
        tamamlanma_yuzdesi: 100,
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-15"),
        atanan: { id: "user4", name: "Fatma Demir", email: "fatma@example.com", role: "birim_mudur" as const, createdAt: new Date(), updatedAt: new Date() },
        birim: { id: "birim3", ad: "Halk Sağlığı", kod: "HS001", tip: "HALK_SAGLIGI" as const, aktif: true, createdAt: new Date(), updatedAt: new Date() },
      },
    ],
  };
}

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const { stats, recentTasks } = await getDashboardData();

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Hoş Geldiniz, {user.name}
        </h1>
        <p className="text-muted-foreground mt-2">
          Kocaeli İl Sağlık Müdürlüğü Görev Yönetim Sistemi
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Toplam Görev"
          value={stats.toplam_gorev}
          icon={CheckSquare}
          description="Tüm görevler"
          colorClass="bg-primary"
        />
        <StatCard
          title="Devam Eden"
          value={stats.devam_eden_gorev}
          icon={Clock}
          description="Aktif görevler"
          colorClass="bg-blue-500"
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Tamamlanan"
          value={stats.tamamlanan_gorev}
          icon={TrendingUp}
          description="Bu ay tamamlanan"
          colorClass="bg-success"
          trend={{ value: 8, isPositive: true }}
        />
        <StatCard
          title="Geciken Görev"
          value={stats.geciken_gorev}
          icon={AlertCircle}
          description="Acil müdahale gerekli"
          colorClass="bg-danger"
          trend={{ value: 5, isPositive: false }}
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Toplam Personel</p>
                <p className="text-2xl font-bold mt-1">{stats.toplam_personel}</p>
              </div>
              <Users className="h-8 w-8 text-secondary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Aktif Birim</p>
                <p className="text-2xl font-bold mt-1">{stats.aktif_birim}</p>
              </div>
              <Building2 className="h-8 w-8 text-secondary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Bu Ay</p>
                <p className="text-2xl font-bold mt-1">{stats.bu_ay_gorev}</p>
              </div>
              <CheckSquare className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tamamlanma Oranı</p>
                <p className="text-2xl font-bold mt-1">%{stats.tamamlanma_orani}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Tasks */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentTasks tasks={recentTasks} />
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Hızlı İşlemler</CardTitle>
            <CardDescription>Sık kullanılan işlemler</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <a
                href="/dashboard/gorevler/yeni"
                className="block p-3 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <div className="font-medium">Yeni Görev Oluştur</div>
                <div className="text-sm text-muted-foreground">Hızlı görev atama</div>
              </a>
              <a
                href="/dashboard/takvim"
                className="block p-3 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <div className="font-medium">Takvimi Görüntüle</div>
                <div className="text-sm text-muted-foreground">Etkinlik ve görevler</div>
              </a>
              <a
                href="/dashboard/asm"
                className="block p-3 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <div className="font-medium">ASM Veri Girişi</div>
                <div className="text-sm text-muted-foreground">Günlük veri kaydı</div>
              </a>
              <a
                href="/dashboard/raporlar"
                className="block p-3 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <div className="font-medium">Rapor Oluştur</div>
                <div className="text-sm text-muted-foreground">İstatistik ve analiz</div>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
