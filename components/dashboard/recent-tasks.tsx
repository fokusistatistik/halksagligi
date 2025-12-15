"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { Gorev, GorevDurum, GorevOncelik } from "@/types";
import { Clock, ArrowRight } from "lucide-react";
import Link from "next/link";

interface RecentTasksProps {
  tasks: Gorev[];
}

const durumColors: Record<GorevDurum, string> = {
  beklemede: "bg-warning",
  devam_ediyor: "bg-blue-500",
  tamamlandi: "bg-success",
  iptal: "bg-gray-400",
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

export function RecentTasks({ tasks }: RecentTasksProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Son Görevler</CardTitle>
            <CardDescription>En son eklenen veya güncellenen görevler</CardDescription>
          </div>
          <Link href="/dashboard/gorevler">
            <Button variant="ghost" size="sm">
              Tümünü Gör
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {tasks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Henüz görev bulunmuyor
            </div>
          ) : (
            tasks.map((task) => (
              <div
                key={task.id}
                className="flex items-start space-x-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
              >
                <div
                  className={`h-2 w-2 rounded-full mt-2 ${durumColors[task.durum]}`}
                ></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <Link
                      href={`/dashboard/gorevler/${task.id}`}
                      className="font-medium text-foreground hover:text-primary"
                    >
                      {task.baslik}
                    </Link>
                    <Badge variant={oncelikColors[task.oncelik]} className="shrink-0">
                      {oncelikLabels[task.oncelik]}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {task.aciklama}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatDate(task.bitis_tarihi)}
                    </span>
                    {task.atanan && (
                      <span>
                        Atanan: <span className="font-medium">{task.atanan.name}</span>
                      </span>
                    )}
                    {task.birim && (
                      <span className="font-medium">{task.birim.ad}</span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
