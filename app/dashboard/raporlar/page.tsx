import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, Calendar, TrendingUp } from "lucide-react";

export default function RaporlarPage() {
  const raporTipleri = [
    {
      id: 1,
      baslik: "Görev Performans Raporu",
      aciklama: "Tamamlanan görevler ve performans metrikleri",
      icon: TrendingUp,
    },
    {
      id: 2,
      baslik: "Birim Bazlı Rapor",
      aciklama: "Birimlerin aylık performans raporu",
      icon: FileText,
    },
    {
      id: 3,
      baslik: "Personel Verimlilik Raporu",
      aciklama: "Personel bazlı iş yükü ve verimlilik analizi",
      icon: FileText,
    },
    {
      id: 4,
      baslik: "ASM Veri Raporu",
      aciklama: "ASM birimlerinin aylık veri özeti",
      icon: FileText,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Raporlar</h1>
        <p className="text-muted-foreground mt-1">
          İstatistikler ve detaylı raporlar
        </p>
      </div>

      {/* Rapor Tipleri */}
      <div className="grid gap-4 md:grid-cols-2">
        {raporTipleri.map((rapor) => (
          <Card key={rapor.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <rapor.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{rapor.baslik}</CardTitle>
                    <CardDescription className="mt-1">{rapor.aciklama}</CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button size="sm" className="flex-1">
                  <Calendar className="mr-2 h-4 w-4" />
                  Rapor Oluştur
                </Button>
                <Button size="sm" variant="outline">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Son Raporlar */}
      <Card>
        <CardHeader>
          <CardTitle>Son Oluşturulan Raporlar</CardTitle>
          <CardDescription>En son indirilen ve oluşturulan raporlar</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <FileText className="h-8 w-8 text-primary" />
                  <div>
                    <p className="font-medium">Ocak 2024 Performans Raporu</p>
                    <p className="text-sm text-muted-foreground">
                      Oluşturulma: 15 Ocak 2024
                    </p>
                  </div>
                </div>
                <Button size="sm" variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  İndir
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
