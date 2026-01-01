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
        profil_foto_url: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    // State for full user profile (readonly fields)
    const [userProfile, setUserProfile] = useState<any>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            if (session?.user) {
                try {
                    // Fetch full profile from API to get all fields accurately
                    const user = session.user as any;
                    const res = await fetch(`/api/personel/${user.id}`);
                    const data = await res.json();

                    if (data.success && data.data) {
                        const profile = data.data;
                        setUserProfile(profile);
                        setFormData({
                            ad: profile.ad || '',
                            soyad: profile.soyad || '',
                            email: profile.email || '',
                            telefon: profile.telefon || '',
                            adres: profile.adres || '',
                            il: profile.il || 'Kocaeli',
                            ilce: profile.ilce || '',
                            unvan: profile.unvan || '',
                            profil_foto_url: profile.profil_foto_url || '',
                            currentPassword: '',
                            newPassword: '',
                            confirmPassword: ''
                        });
                    }
                } catch (error) {
                    console.error('Profile fetch error:', error);
                    toast.error('Profil bilgileri yüklenemedi');
                }
            }
        };

        fetchProfile();
    }, [session]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Şifre validasyonu
        if (formData.newPassword) {
            if (!formData.currentPassword) {
                toast.error('Şifre değiştirmek için mevcut şifrenizi girmelisiniz.');
                return;
            }
            if (formData.newPassword.length < 8) {
                toast.error('Yeni şifre en az 8 karakter olmalıdır.');
                return;
            }
            if (formData.newPassword !== formData.confirmPassword) {
                toast.error('Yeni şifreler eşleşmiyor.');
                return;
            }
        }

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

                // Update local profile state immediately
                setUserProfile({ ...userProfile, ...formData });

                // Update session (only standard fields supported by NextAuth JWT)
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

    // Use fetched profile for display, fallback to session user
    const displayUser = userProfile || (session.user as any);

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value.replace(/\D/g, '');
        if (val.startsWith('0')) val = val.substring(1);
        if (val.length > 10) val = val.slice(0, 10);

        let formatted = val;
        if (val.length > 6) {
            formatted = `${val.slice(0, 3)} ${val.slice(3, 6)} ${val.slice(6, 8)} ${val.slice(8)}`;
        } else if (val.length > 3) {
            formatted = `${val.slice(0, 3)} ${val.slice(3, 6)} ${val.slice(6)}`;
        } else if (val.length > 3) {
            formatted = `${val.slice(0, 3)} ${val.slice(3)}`;
        }

        setFormData({ ...formData, telefon: formatted });
    };

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
                                    src={displayUser.profil_foto_url || 'https://static.fokusistatistik.com/resimler/default-avatar.png'}
                                    alt={displayUser.ad || 'User'}
                                    className="w-full h-full rounded-full object-cover border-4 border-primary/10"
                                />
                                <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 border-2 border-white rounded-full"></div>
                            </div>
                            <CardTitle>{displayUser.ad} {displayUser.soyad}</CardTitle>
                            <CardDescription>{displayUser.rol?.ad || 'Kullanıcı'}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3 text-sm text-gray-600">
                                <Shield className="w-4 h-4 text-primary" />
                                <span>{displayUser.birim?.ad || 'Birim Atanmamış'}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-600">
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                                <span>Sistem Erişimi Aktif</span>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-800 space-y-2">
                        <div className="flex items-center gap-2 font-semibold">
                            <AlertCircle className="w-4 h-4" />
                            Güvenlik Hatırlatması
                        </div>
                        <p className="leading-relaxed opacity-90">
                            Şifrenizi veya TC Kimlik numaranızı değiştirmek için sistem yöneticisiyle iletişime geçiniz.
                        </p>
                        <p className="leading-relaxed opacity-90 border-t border-blue-200 pt-2 mt-2">
                            Rol, yetki ve birim değişikliği talepleriniz için de lütfen sistem yöneticiniz ile iletişime geçiniz.
                        </p>
                    </div>
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
                                {/* Minimal System Info */}
                                <div className="flex flex-wrap items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 mb-6 text-xs gap-4">
                                    <div className="flex items-center gap-6">
                                        <div>
                                            <span className="text-gray-400 block mb-0.5 font-medium uppercase tracking-wider">Rol / Yetki</span>
                                            <span className="font-semibold text-gray-700">{displayUser.rol?.ad || '-'}</span>
                                        </div>
                                        <div className="h-6 w-px bg-gray-200 hidden sm:block"></div>
                                        <div>
                                            <span className="text-gray-400 block mb-0.5 font-medium uppercase tracking-wider">Bağlı Birim</span>
                                            <span className="font-semibold text-gray-700">{displayUser.birim?.ad || '-'}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-gray-400 block mb-0.5 font-medium uppercase tracking-wider text-right">TC Kimlik No</span>
                                        <span className="font-mono text-gray-700 bg-white px-2 py-1 rounded border shadow-sm">{displayUser.tc_kimlik_no || '-'}</span>
                                    </div>
                                </div>

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
                                            onChange={handlePhoneChange}
                                            placeholder="5xx xxx xx xx"
                                            maxLength={13}
                                        />
                                        <p className="text-[10px] text-gray-500">Başında 0 olmadan 10 hane giriniz (Örn: 532 123 45 67).</p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="unvan">Ünvan / Görev</Label>
                                    <Input
                                        id="unvan"
                                        value={formData.unvan}
                                        onChange={(e) => setFormData({ ...formData, unvan: e.target.value })}
                                        placeholder="Örn: Veri Hazırlama Personeli"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="profil_foto_url">Profil Fotoğrafı URL</Label>
                                    <Input
                                        id="profil_foto_url"
                                        value={formData.profil_foto_url}
                                        onChange={(e) => setFormData({ ...formData, profil_foto_url: e.target.value })}
                                        placeholder="https://..."
                                    />
                                    <p className="text-[10px] text-gray-500">Profil fotoğrafınızın herkese açık URL&apos;sini buraya giriniz.</p>
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
                                        placeholder="Mahalle, sokak, kapı no..."
                                        value={formData.adres}
                                        onChange={(e) => setFormData({ ...formData, adres: e.target.value })}
                                    />
                                </div>

                                {/* Password Change Section */}
                                <div className="p-4 bg-yellow-50/50 rounded-lg border border-yellow-100 space-y-4">
                                    <h3 className="text-sm font-semibold text-yellow-800 flex items-center gap-2">
                                        <Shield className="w-4 h-4" /> Şifre Değiştir (İsteğe Bağlı)
                                    </h3>
                                    <div className="grid grid-cols-1 gap-3">
                                        <Input
                                            type="password"
                                            placeholder="Mevcut Şifreniz"
                                            value={formData.currentPassword || ''}
                                            onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                                            className="bg-white"
                                        />
                                        <Input
                                            type="password"
                                            placeholder="Yeni Şifre (En az 8 karakter)"
                                            value={formData.newPassword || ''}
                                            onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                                            className="bg-white"
                                        />
                                        <Input
                                            type="password"
                                            placeholder="Yeni Şifre Tekrar"
                                            value={formData.confirmPassword || ''}
                                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                            className="bg-white"
                                        />
                                    </div>
                                    <p className="text-xs text-yellow-600">Şifre değiştirmek istemiyorsanız bu alanları boş bırakınız.</p>
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
