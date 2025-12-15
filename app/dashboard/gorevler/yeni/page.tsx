import { GorevForm } from "@/components/forms/gorev-form";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

// Mock data - gerçek uygulamada webhook'tan gelecek
async function getData() {
  return {
    personelListesi: [
      { id: "user1", name: "Ayşe Yılmaz" },
      { id: "user2", name: "Mehmet Kaya" },
      { id: "user3", name: "Fatma Demir" },
      { id: "user4", name: "Ali Öztürk" },
    ],
    birimListesi: [
      { id: "birim1", ad: "ASM Merkez" },
      { id: "birim2", ad: "ASM Doğu" },
      { id: "birim3", ad: "ASM Batı" },
      { id: "birim4", ad: "Halk Sağlığı" },
    ],
  };
}

export default async function YeniGorevPage() {
  const { personelListesi, birimListesi } = await getData();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/gorevler">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Yeni Görev Oluştur</h1>
          <p className="text-muted-foreground mt-1">
            Personele yeni görev atayın
          </p>
        </div>
      </div>

      <GorevForm personelListesi={personelListesi} birimListesi={birimListesi} />
    </div>
  );
}
