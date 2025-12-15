"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { gorevWebhook } from "@/lib/webhook/client";
import { Gorev, GorevDurum, GorevOncelik } from "@/types";

const gorevSchema = z.object({
  baslik: z.string().min(3, "Başlık en az 3 karakter olmalıdır"),
  aciklama: z.string().min(10, "Açıklama en az 10 karakter olmalıdır"),
  durum: z.enum(["beklemede", "devam_ediyor", "tamamlandi", "iptal"]),
  oncelik: z.enum(["dusuk", "orta", "yuksek", "acil"]),
  atanan_id: z.string().min(1, "Atanan personel seçilmelidir"),
  birim_id: z.string().min(1, "Birim seçilmelidir"),
  baslangic_tarihi: z.string(),
  bitis_tarihi: z.string(),
  etiketler: z.string().optional(),
});

type GorevFormValues = z.infer<typeof gorevSchema>;

interface GorevFormProps {
  gorev?: Gorev;
  personelListesi: { id: string; name: string }[];
  birimListesi: { id: string; ad: string }[];
}

export function GorevForm({ gorev, personelListesi, birimListesi }: GorevFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<GorevFormValues>({
    resolver: zodResolver(gorevSchema),
    defaultValues: gorev
      ? {
          baslik: gorev.baslik,
          aciklama: gorev.aciklama,
          durum: gorev.durum,
          oncelik: gorev.oncelik,
          atanan_id: gorev.atanan_id,
          birim_id: gorev.birim_id,
          baslangic_tarihi: new Date(gorev.baslangic_tarihi).toISOString().split("T")[0],
          bitis_tarihi: new Date(gorev.bitis_tarihi).toISOString().split("T")[0],
          etiketler: gorev.etiketler?.join(", "),
        }
      : {
          durum: "beklemede",
          oncelik: "orta",
          baslangic_tarihi: new Date().toISOString().split("T")[0],
          bitis_tarihi: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],
        },
  });

  const onSubmit = async (data: GorevFormValues) => {
    setLoading(true);
    setError("");

    try {
      const payload = {
        ...data,
        baslangic_tarihi: new Date(data.baslangic_tarihi).toISOString(),
        bitis_tarihi: new Date(data.bitis_tarihi).toISOString(),
        etiketler: data.etiketler
          ? data.etiketler.split(",").map((t) => t.trim())
          : [],
      };

      let response;
      if (gorev) {
        response = await gorevWebhook.guncelle(gorev.id, payload);
      } else {
        response = await gorevWebhook.olustur(payload);
      }

      if (response.success) {
        router.push("/dashboard/gorevler");
        router.refresh();
      } else {
        setError(response.error || "İşlem başarısız oldu");
      }
    } catch (err: any) {
      setError(err.message || "Bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{gorev ? "Görevi Düzenle" : "Yeni Görev Oluştur"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <div className="bg-danger/10 border border-danger text-danger px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="baslik">Görev Başlığı *</Label>
              <Input
                id="baslik"
                {...register("baslik")}
                placeholder="Görev başlığını girin"
              />
              {errors.baslik && (
                <p className="text-sm text-danger">{errors.baslik.message}</p>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="aciklama">Açıklama *</Label>
              <Textarea
                id="aciklama"
                {...register("aciklama")}
                placeholder="Görev açıklamasını girin"
                rows={4}
              />
              {errors.aciklama && (
                <p className="text-sm text-danger">{errors.aciklama.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="oncelik">Öncelik *</Label>
              <Select id="oncelik" {...register("oncelik")}>
                <option value="dusuk">Düşük</option>
                <option value="orta">Orta</option>
                <option value="yuksek">Yüksek</option>
                <option value="acil">Acil</option>
              </Select>
              {errors.oncelik && (
                <p className="text-sm text-danger">{errors.oncelik.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="durum">Durum *</Label>
              <Select id="durum" {...register("durum")}>
                <option value="beklemede">Beklemede</option>
                <option value="devam_ediyor">Devam Ediyor</option>
                <option value="tamamlandi">Tamamlandı</option>
                <option value="iptal">İptal</option>
              </Select>
              {errors.durum && (
                <p className="text-sm text-danger">{errors.durum.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="atanan_id">Atanan Personel *</Label>
              <Select id="atanan_id" {...register("atanan_id")}>
                <option value="">Seçiniz</option>
                {personelListesi.map((personel) => (
                  <option key={personel.id} value={personel.id}>
                    {personel.name}
                  </option>
                ))}
              </Select>
              {errors.atanan_id && (
                <p className="text-sm text-danger">{errors.atanan_id.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="birim_id">Birim *</Label>
              <Select id="birim_id" {...register("birim_id")}>
                <option value="">Seçiniz</option>
                {birimListesi.map((birim) => (
                  <option key={birim.id} value={birim.id}>
                    {birim.ad}
                  </option>
                ))}
              </Select>
              {errors.birim_id && (
                <p className="text-sm text-danger">{errors.birim_id.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="baslangic_tarihi">Başlangıç Tarihi *</Label>
              <Input id="baslangic_tarihi" type="date" {...register("baslangic_tarihi")} />
              {errors.baslangic_tarihi && (
                <p className="text-sm text-danger">{errors.baslangic_tarihi.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="bitis_tarihi">Bitiş Tarihi *</Label>
              <Input id="bitis_tarihi" type="date" {...register("bitis_tarihi")} />
              {errors.bitis_tarihi && (
                <p className="text-sm text-danger">{errors.bitis_tarihi.message}</p>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="etiketler">Etiketler (virgülle ayırın)</Label>
              <Input
                id="etiketler"
                {...register("etiketler")}
                placeholder="aşı, envanter, acil"
              />
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={loading}
            >
              İptal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Kaydediliyor..." : gorev ? "Güncelle" : "Oluştur"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
