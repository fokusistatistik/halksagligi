"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { asmWebhook } from "@/lib/webhook/client";

export default function ASMVeriGirisPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    tarih: new Date().toISOString().split("T")[0],
    muayene_sayisi: "",
    asi_sayisi: "",
    gebe_takip: "",
    bebek_izlem: "",
    kronik_hasta_takip: "",
    ev_ziyaret: "",
    saglik_tarama: "",
    notlar: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload = {
        ...formData,
        tarih: new Date(formData.tarih).toISOString(),
        muayene_sayisi: parseInt(formData.muayene_sayisi) || 0,
        asi_sayisi: parseInt(formData.asi_sayisi) || 0,
        gebe_takip: parseInt(formData.gebe_takip) || 0,
        bebek_izlem: parseInt(formData.bebek_izlem) || 0,
        kronik_hasta_takip: parseInt(formData.kronik_hasta_takip) || 0,
        ev_ziyaret: parseInt(formData.ev_ziyaret) || 0,
        saglik_tarama: parseInt(formData.saglik_tarama) || 0,
      };

      const response = await asmWebhook.veriGir(payload);

      if (response.success) {
        router.push("/dashboard/asm");
        router.refresh();
      } else {
        setError(response.error || "Veri girişi başarısız oldu");
      }
    } catch (err: any) {
      setError(err.message || "Bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/asm">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-foreground">ASM Veri Girişi</h1>
          <p className="text-muted-foreground mt-1">Günlük veri kayıt formu</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Günlük Veri Formu</CardTitle>
          <CardDescription>
            Aşağıdaki alanları doldurup günlük verilerinizi kaydedin
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-danger/10 border border-danger text-danger px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="tarih">Tarih *</Label>
                <Input
                  id="tarih"
                  name="tarih"
                  type="date"
                  value={formData.tarih}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="muayene_sayisi">Muayene Sayısı</Label>
                <Input
                  id="muayene_sayisi"
                  name="muayene_sayisi"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={formData.muayene_sayisi}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="asi_sayisi">Aşı Sayısı</Label>
                <Input
                  id="asi_sayisi"
                  name="asi_sayisi"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={formData.asi_sayisi}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gebe_takip">Gebe Takip</Label>
                <Input
                  id="gebe_takip"
                  name="gebe_takip"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={formData.gebe_takip}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bebek_izlem">Bebek İzlem</Label>
                <Input
                  id="bebek_izlem"
                  name="bebek_izlem"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={formData.bebek_izlem}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="kronik_hasta_takip">Kronik Hasta Takip</Label>
                <Input
                  id="kronik_hasta_takip"
                  name="kronik_hasta_takip"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={formData.kronik_hasta_takip}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ev_ziyaret">Ev Ziyareti</Label>
                <Input
                  id="ev_ziyaret"
                  name="ev_ziyaret"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={formData.ev_ziyaret}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="saglik_tarama">Sağlık Tarama</Label>
                <Input
                  id="saglik_tarama"
                  name="saglik_tarama"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={formData.saglik_tarama}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="notlar">Notlar</Label>
                <Textarea
                  id="notlar"
                  name="notlar"
                  placeholder="Varsa özel notlarınızı girin..."
                  rows={4}
                  value={formData.notlar}
                  onChange={handleChange}
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
                {loading ? "Kaydediliyor..." : "Kaydet"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
