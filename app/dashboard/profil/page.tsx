import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getCurrentUser } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { getInitials } from "@/lib/utils";

export default async function ProfilPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Profil</h1>
        <p className="text-muted-foreground mt-1">
          Hesap bilgilerinizi görüntüleyin ve düzenleyin
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Card */}
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="h-24 w-24 rounded-full bg-primary text-white flex items-center justify-center text-3xl font-bold mx-auto mb-4">
                {getInitials(user.name || "U")}
              </div>
              <h3 className="text-xl font-semibold">{user.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">{user.email}</p>
              <p className="text-sm text-primary font-medium mt-2">
                {(user as any).role === "admin" ? "Yönetici" :
                 (user as any).role === "halk_sagligi_mudur" ? "Halk Sağlığı Müdürü" :
                 (user as any).role === "birim_mudur" ? "Birim Müdürü" : "Personel"}
              </p>
              <Button className="w-full mt-4" variant="outline">
                Profil Fotoğrafı Değiştir
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Profile Form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Kişisel Bilgiler</CardTitle>
            <CardDescription>Profil bilgilerinizi güncelleyin</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Ad Soyad</Label>
                  <Input id="name" defaultValue={user.name || ""} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-posta</Label>
                  <Input id="email" type="email" defaultValue={user.email || ""} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefon">Telefon</Label>
                  <Input id="telefon" type="tel" placeholder="+90 5XX XXX XX XX" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="birim">Birim</Label>
                  <Input id="birim" defaultValue="Halk Sağlığı Başkanlığı" disabled />
                </div>
              </div>
              <div className="flex justify-end gap-4 pt-4">
                <Button type="button" variant="outline">
                  İptal
                </Button>
                <Button type="submit">
                  Değişiklikleri Kaydet
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle>Şifre Değiştir</CardTitle>
          <CardDescription>Hesap güvenliğiniz için şifrenizi güncelleyin</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4 max-w-md">
            <div className="space-y-2">
              <Label htmlFor="current-password">Mevcut Şifre</Label>
              <Input id="current-password" type="password" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">Yeni Şifre</Label>
              <Input id="new-password" type="password" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Yeni Şifre (Tekrar)</Label>
              <Input id="confirm-password" type="password" />
            </div>
            <Button type="submit">Şifreyi Güncelle</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
