import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Building2, Settings, Shield } from "lucide-react";
import Link from "next/link";

export default function AdminPage() {
  const adminMenus = [
    {
      id: 1,
      baslik: "Kullanıcı Yönetimi",
      aciklama: "Kullanıcıları ekle, düzenle ve sil",
      icon: Users,
      href: "/admin/kullanicilar",
      renk: "bg-primary",
    },
    {
      id: 2,
      baslik: "Birim Yönetimi",
      aciklama: "ASM ve diğer birimleri yönet",
      icon: Building2,
      href: "/admin/birimler",
      renk: "bg-secondary",
    },
    {
      id: 3,
      baslik: "Yetki Yönetimi",
      aciklama: "Roller ve yetkileri tanımla",
      icon: Shield,
      href: "/admin/yetkiler",
      renk: "bg-warning",
    },
    {
      id: 4,
      baslik: "Sistem Ayarları",
      aciklama: "Genel sistem yapılandırması",
      icon: Settings,
      href: "/admin/ayarlar",
      renk: "bg-success",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Yönetim Paneli</h1>
        <p className="text-muted-foreground mt-1">
          Sistem yönetimi ve yapılandırma
        </p>
      </div>

      {/* Admin Menus */}
      <div className="grid gap-4 md:grid-cols-2">
        {adminMenus.map((menu) => (
          <Card key={menu.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start gap-4">
                <div className={`h-14 w-14 rounded-lg ${menu.renk} flex items-center justify-center`}>
                  <menu.icon className="h-7 w-7 text-white" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-xl">{menu.baslik}</CardTitle>
                  <CardDescription className="mt-2">{menu.aciklama}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Link href={menu.href}>
                <Button className="w-full">Yönet</Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <Users className="h-8 w-8 mx-auto text-primary mb-2" />
              <p className="text-sm text-muted-foreground">Toplam Kullanıcı</p>
              <p className="text-3xl font-bold mt-2">47</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <Building2 className="h-8 w-8 mx-auto text-secondary mb-2" />
              <p className="text-sm text-muted-foreground">Aktif Birim</p>
              <p className="text-3xl font-bold mt-2">12</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <Shield className="h-8 w-8 mx-auto text-warning mb-2" />
              <p className="text-sm text-muted-foreground">Yetki Grubu</p>
              <p className="text-3xl font-bold mt-2">4</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <Settings className="h-8 w-8 mx-auto text-success mb-2" />
              <p className="text-sm text-muted-foreground">Sistem Durumu</p>
              <p className="text-lg font-bold mt-2 text-success">Aktif</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
