import { Suspense } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Filter, Search } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { Gorev, GorevDurum, GorevOncelik } from "@/types";

// Mock data - gerçek uygulamada webhook'tan gelecek
async function getGorevler() {
  // TODO: Webhook'tan veri çek
  const gorevler: Gorev[] = [
    {
      id: "1",
      baslik: "ASM Aşı Envanter Kontrolü",
      aciklama: "Tüm ASM birimlerinde aşı stok kontrolü yapılması ve rapor hazırlanması",
      durum: "devam_ediyor",
      oncelik: "yuksek",
      atanan_id: "user1",
      olusturan_id: "user2",
      birim_id: "birim1",
      baslangic_tarihi: new Date("2024-01-15"),
      bitis_tarihi: new Date("2024-02-01"),
      tamamlanma_yuzdesi: 45,
      etiketler: ["aşı", "envanter"],
      createdAt: new Date("2024-01-15"),
      updatedAt: new Date("2024-01-20"),
      atanan: { id: "user1", name: "Ayşe Yılmaz", email: "ayse@example.com", role: "personel", createdAt: new Date(), updatedAt: new Date() },
      birim: { id: "birim1", ad: "ASM Merkez", kod: "ASM001", tip: "ASM", aktif: true, createdAt: new Date(), updatedAt: new Date() },
    },
    {
      id: "2",
      baslik: "Gebe Takip Sistemi Eğitimi",
      aciklama: "Yeni gebe takip sisteminin personele anlatılması",
      durum: "beklemede",
      oncelik: "orta",
      atanan_id: "user3",
      olusturan_id: "user2",
      birim_id: "birim2",
      baslangic_tarihi: new Date("2024-01-20"),
      bitis_tarihi: new Date("2024-01-25"),
      tamamlanma_yuzdesi: 0,
      etiketler: ["eğitim", "gebe"],
      createdAt: new Date("2024-01-18"),
      updatedAt: new Date("2024-01-18"),
      atanan: { id: "user3", name: "Mehmet Kaya", email: "mehmet@example.com", role: "personel", createdAt: new Date(), updatedAt: new Date() },
      birim: { id: "birim2", ad: "ASM Doğu", kod: "ASM002", tip: "ASM", aktif: true, createdAt: new Date(), updatedAt: new Date() },
    },
    {
      id: "3",
      baslik: "Aylık Performans Raporu Hazırlama",
      aciklama: "Ocak ayı birim performans raporlarının hazırlanması",
      durum: "tamamlandi",
      oncelik: "yuksek",
      atanan_id: "user4",
      olusturan_id: "user2",
      birim_id: "birim3",
      baslangic_tarihi: new Date("2024-01-01"),
      bitis_tarihi: new Date("2024-01-15"),
      tamamlanma_yuzdesi: 100,
      etiketler: ["rapor", "performans"],
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-15"),
      atanan: { id: "user4", name: "Fatma Demir", email: "fatma@example.com", role: "birim_mudur", createdAt: new Date(), updatedAt: new Date() },
      birim: { id: "birim3", ad: "Halk Sağlığı", kod: "HS001", tip: "HALK_SAGLIGI", aktif: true, createdAt: new Date(), updatedAt: new Date() },
    },
  ];

  return gorevler;
}

const durumColors: Record<GorevDurum, { bg: string; text: string }> = {
  beklemede: { bg: "bg-warning/10", text: "text-warning" },
  devam_ediyor: { bg: "bg-blue-500/10", text: "text-blue-500" },
  tamamlandi: { bg: "bg-success/10", text: "text-success" },
  iptal: { bg: "bg-gray-400/10", text: "text-gray-400" },
};

const durumLabels: Record<GorevDurum, string> = {
  beklemede: "Beklemede",
  devam_ediyor: "Devam Ediyor",
  tamamlandi: "Tamamlandı",
  iptal: "İptal",
};

const oncelikColors: Record<GorevOncelik, "default" | "secondary" | "success" | "warning" | "danger" | "outline"> = {
  dusuk: "outline",
  orta: "warning",
  yuksek: "danger",
  acil: "danger",
};

const oncelikLabels: Record<GorevOncelik, string> = {
  dusuk: "Düşük",
  orta: "Orta",
  yuksek: "Yüksek",
  acil: "ACİL",
};

export default async function GorevlerPage() {
  const gorevler = await getGorevler();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Görevler</h1>
          <p className="text-muted-foreground mt-1">
            Tüm görevleri görüntüleyin ve yönetin
          </p>
        </div>
        <Link href="/dashboard/gorevler/yeni">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Yeni Görev
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Görev ara..."
                className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filtrele
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Task List */}
      <div className="grid gap-4">
        {gorevler.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Henüz görev bulunmuyor</p>
              <Link href="/dashboard/gorevler/yeni">
                <Button className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  İlk Görevi Oluştur
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          gorevler.map((gorev) => (
            <Card key={gorev.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-3">
                      <div
                        className={`h-12 w-1 rounded-full ${
                          gorev.oncelik === "acil" || gorev.oncelik === "yuksek"
                            ? "bg-danger"
                            : gorev.oncelik === "orta"
                            ? "bg-warning"
                            : "bg-gray-300"
                        }`}
                      ></div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <Link
                            href={`/dashboard/gorevler/${gorev.id}`}
                            className="text-xl font-semibold text-foreground hover:text-primary"
                          >
                            {gorev.baslik}
                          </Link>
                          <div className="flex gap-2 shrink-0">
                            <Badge variant={oncelikColors[gorev.oncelik]}>
                              {oncelikLabels[gorev.oncelik]}
                            </Badge>
                            <Badge
                              className={`${durumColors[gorev.durum].bg} ${durumColors[gorev.durum].text}`}
                            >
                              {durumLabels[gorev.durum]}
                            </Badge>
                          </div>
                        </div>

                        <p className="text-muted-foreground mt-2 line-clamp-2">
                          {gorev.aciklama}
                        </p>

                        <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-muted-foreground">
                          {gorev.atanan && (
                            <span>
                              <span className="font-medium text-foreground">Atanan:</span>{" "}
                              {gorev.atanan.name}
                            </span>
                          )}
                          {gorev.birim && (
                            <span>
                              <span className="font-medium text-foreground">Birim:</span>{" "}
                              {gorev.birim.ad}
                            </span>
                          )}
                          <span>
                            <span className="font-medium text-foreground">Bitiş:</span>{" "}
                            {formatDate(gorev.bitis_tarihi)}
                          </span>
                          {gorev.durum === "devam_ediyor" && (
                            <span>
                              <span className="font-medium text-foreground">İlerleme:</span>{" "}
                              %{gorev.tamamlanma_yuzdesi}
                            </span>
                          )}
                        </div>

                        {gorev.etiketler && gorev.etiketler.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {gorev.etiketler.map((etiket, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 text-xs bg-muted rounded-md"
                              >
                                #{etiket}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
