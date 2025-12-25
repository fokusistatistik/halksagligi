'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Mail, Phone, MapPin, Shield, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from '@/lib/toast';

export default function SettingsPage() {
    const { data: session, update } = useSession();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        ad: '',
        soyad: '',
        email: '',
        telefon: '',
        adres: '',
        il: '',
        ilce: '',
        unvan: '',
    });

    useEffect(() => {
        if (session?.user) {
            const user = session.user as any;
            setFormData({
                ad: user.name?.split(' ')[0] || '',
                soyad: user.name?.split(' ').slice(1).join(' ') || '',
                email: user.email || '',
                telefon: user.telefon || '',
                adres: user.adres || '',
                il: user.il || 'Kocaeli',
                ilce: user.ilce || '',
                unvan: user.unvan || '',
            });
        }
    }, [session]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const user = session?.user as any;
            const res = await fetch(`/api/personel/${user.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (data.success) {
                toast.success('Ayarlarınız başarıyla güncellendi');
                // Session'ı güncelle
                await update({
                    ...session,
                    user: {
                        ...session?.user,
                        name: `${formData.ad} ${formData.soyad}`,
                        email: formData.email,
                    }
                });
            } else {
                toast.error(data.error || 'Güncelleme sırasında bir hata oluştu');
            }
        } catch (error) {
            console.error('Settings update error:', error);
            toast.error('Bağlantı hatası oluştu');
        } finally {
            setLoading(false);
        }
    };

    if (!session) return null;

    const user = session.user as any;

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                    <User className="w-8 h-8 text-primary" />
                    Profil ve Hesap Ayarları
                </h1>
                <p className="text-gray-600 mt-1">Kendi bilgilerinizi görüntüleyin ve düzenleyin</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Profile Summary */}
                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <CardHeader className="text-center">
                            <div className="relative mx-auto w-24 h-24 mb-4">
                                <img
                                    src={user.profil_foto_url || 'https://static.fokusistatistik.com/resimler/default-avatar.png'}
                                    alt={user.name}
                                    className="w-full h-full rounded-full object-cover border-4 border-primary/10"
                                />
                                <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 border-2 border-white rounded-full"></div>
                            </div>
                            <CardTitle>{user.name}</CardTitle>
                            <CardDescription>{user.rol?.ad || 'Kullanıcı'}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3 text-sm text-gray-600">
                                <Shield className="w-4 h-4 text-primary" />
                                <span>{user.birim?.ad || 'Birim Atanmamış'}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-600">
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                                <span>Sistem Erişimi Aktif</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-blue-50 border-blue-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm flex items-center gap-2 text-blue-800">
                                <AlertCircle className="w-4 h-4" />
                                Güvenlik Hatırlatması
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-xs text-blue-700 leading-relaxed">
                                Şifrenizi veya TC Kimlik numaranızı değiştirmek için sistem yöneticisiyle iletişime geçiniz.
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column - Edit Form */}
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Kişisel Bilgiler</CardTitle>
                            <CardDescription>Profilinizde görünen temel bilgileri buradan güncelleyebilirsiniz.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="ad">Ad</Label>
                                        <Input
                                            id="ad"
                                            value={formData.ad}
                                            onChange={(e) => setFormData({ ...formData, ad: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="soyad">Soyad</Label>
                                        <Input
                                            id="soyad"
                                            value={formData.soyad}
                                            onChange={(e) => setFormData({ ...formData, soyad: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="flex items-center gap-2">
                                            <Mail className="w-3.5 h-3.5" /> E-posta
                                        </Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="telefon" className="flex items-center gap-2">
                                            <Phone className="w-3.5 h-3.5" /> Telefon
                                        </Label>
                                        <Input
                                            id="telefon"
                                            value={formData.telefon}
                                            onChange={(e) => setFormData({ ...formData, telefon: e.target.value })}
                                            placeholder="05xx xxx xx xx"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="unvan">Ünvan / Görev</Label>
                                    <Input
                                        id="unvan"
                                        value={formData.unvan}
                                        onChange={(e) => setFormData({ ...formData, unvan: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="adres" className="flex items-center gap-2">
                                        <MapPin className="w-3.5 h-3.5" /> Adres Bilgileri
                                    </Label>
                                    <div className="grid grid-cols-2 gap-4 mb-2">
                                        <Input
                                            placeholder="İl"
                                            value={formData.il}
                                            onChange={(e) => setFormData({ ...formData, il: e.target.value })}
                                        />
                                        <Input
                                            placeholder="İlçe"
                                            value={formData.ilce}
                                            onChange={(e) => setFormData({ ...formData, ilce: e.target.value })}
                                        />
                                    </div>
                                    <textarea
                                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                        placeholder="Tam adres..."
                                        value={formData.adres}
                                        onChange={(e) => setFormData({ ...formData, adres: e.target.value })}
                                    />
                                </div>

                                <div className="flex justify-end pt-4">
                                    <Button type="submit" disabled={loading} className="w-full md:w-auto">
                                        {loading ? 'Güncelleniyor...' : 'Değişiklikleri Kaydet'}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
