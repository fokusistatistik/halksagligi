"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        setError("E-posta veya şifre hatalı");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      setError("Bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center items-center gap-4 mb-4">
            <div className="h-16 w-16 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white text-2xl font-bold">TC</span>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-primary">
            T.C. Sağlık Bakanlığı
          </CardTitle>
          <CardDescription className="text-lg font-semibold text-secondary">
            Kocaeli İl Sağlık Müdürlüğü
          </CardDescription>
          <p className="text-sm text-muted-foreground">
            Halk Sağlığı Başkanlığı - Görev Yönetim Sistemi
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-danger/10 border border-danger text-danger px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">E-posta Adresi</Label>
              <Input
                id="email"
                type="email"
                placeholder="ornek@saglik.gov.tr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Şifre</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                autoComplete="current-password"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
            </Button>
            <div className="text-center">
              <a
                href="#"
                className="text-sm text-primary hover:underline"
                onClick={(e) => e.preventDefault()}
              >
                Şifremi unuttum
              </a>
            </div>
          </form>
          <div className="mt-6 pt-6 border-t text-center">
            <p className="text-xs text-muted-foreground">
              Sistem kullanımı için yetkili personel olmak gerekmektedir.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
