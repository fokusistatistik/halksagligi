import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Plus } from "lucide-react";

export default function TakvimPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Takvim</h1>
          <p className="text-muted-foreground mt-1">
            Görevler ve etkinlikler takvimi
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Etkinlik Ekle
        </Button>
      </div>

      {/* Calendar Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Ocak 2024</CardTitle>
          <CardDescription>Görevler ve etkinlikler</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-96 border-2 border-dashed rounded-lg">
            <div className="text-center">
              <Calendar className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium">Takvim Görünümü</p>
              <p className="text-sm text-muted-foreground mt-2">
                FullCalendar veya React Big Calendar entegrasyonu buraya eklenecek
              </p>
              <p className="text-xs text-muted-foreground mt-4">
                Görevler, toplantılar ve etkinlikler takvim üzerinde görüntülenecek
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Bu Hafta</p>
              <p className="text-3xl font-bold mt-2">12</p>
              <p className="text-xs text-muted-foreground mt-1">Görev ve etkinlik</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Bugün</p>
              <p className="text-3xl font-bold mt-2">3</p>
              <p className="text-xs text-muted-foreground mt-1">Planlanmış etkinlik</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Yaklaşan</p>
              <p className="text-3xl font-bold mt-2">8</p>
              <p className="text-xs text-muted-foreground mt-1">Gelecek hafta</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
