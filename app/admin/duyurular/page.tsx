'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, Megaphone, CheckCircle2, AlertTriangle, Eye } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// Types
interface Birim {
    id: number;
    ad: string;
}

interface Rol {
    id: number;
    ad: string;
}

interface Duyuru {
    id: number;
    baslik: string;
    icerik: string;
    oncelik: 'NORMAL' | 'ACIL' | 'KRITIK';
    hedef_birim?: { ad: string };
    hedef_rol?: { ad: string };
    yayin_tarihi: string;
    _count?: { okunma_loglari: number };
}

// API Calls
async function fetchDuyurular() {
    const res = await fetch('/api/duyuru?mode=management');
    if (!res.ok) throw new Error('Duyurular yüklenemedi');
    const json = await res.json();
    return json.data;
}

async function fetchBirimler() {
    const res = await fetch('/api/birim');
    if (!res.ok) throw new Error('Birimler yüklenemedi');
    const json = await res.json();
    return json.data || []; // Adjust based on actual API response structure
}

async function fetchRoller() {
    const res = await fetch('/api/rol'); // Assuming singular based on dir name
    if (!res.ok) throw new Error('Roller yüklenemedi');
    const json = await res.json();
    return json.data || [];
}

async function createDuyuru(data: any) {
    const res = await fetch('/api/duyuru', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || 'Duyuru oluşturulamadı');
    }
    return res.json();
}

export default function DuyuruYonetimPage() {
    const queryClient = useQueryClient();

    // UI State
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        baslik: '',
        icerik: '',
        oncelik: 'NORMAL',
        hedef_birim_id: 'all',
        hedef_rol_id: 'all'
    });

    // Queries
    const { data: duyurular, isLoading: isLoadingDuyurular } = useQuery({
        queryKey: ['admin-duyurular'],
        queryFn: fetchDuyurular
    });

    const { data: birimler } = useQuery({
        queryKey: ['birimler-list'],
        queryFn: fetchBirimler
    });

    const { data: roller } = useQuery({
        queryKey: ['roller-list'],
        queryFn: fetchRoller
    });

    // Mutations
    const createMutation = useMutation({
        mutationFn: createDuyuru,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-duyurular'] });
            toast.success('Duyuru başarıyla yayınlandı');
            setIsConfirmOpen(false);
            setIsCreateModalOpen(false);
            // Reset form
            setFormData({
                baslik: '',
                icerik: '',
                oncelik: 'NORMAL',
                hedef_birim_id: 'all',
                hedef_rol_id: 'all'
            });
        },
        onError: (err: any) => {
            toast.error(err.message);
        }
    });

    const handleCreateClick = (e: React.FormEvent) => {
        e.preventDefault();
        setIsConfirmOpen(true);
    };

    const handleConfirmSend = () => {
        const payload = {
            baslik: formData.baslik,
            icerik: formData.icerik,
            oncelik: formData.oncelik,
            hedef_birim_id: formData.hedef_birim_id === 'all' ? null : parseInt(formData.hedef_birim_id),
            hedef_rol_id: formData.hedef_rol_id === 'all' ? null : parseInt(formData.hedef_rol_id),
        };
        createMutation.mutate(payload);
    };

    const getTargetText = () => {
        if (formData.hedef_birim_id === 'all' && formData.hedef_rol_id === 'all') return "Tüm Personel";
        const parts = [];
        if (formData.hedef_birim_id !== 'all') {
            const birim = birimler?.find((b: any) => b.id.toString() === formData.hedef_birim_id);
            if (birim) parts.push(`Birim: ${birim.ad}`);
        }
        if (formData.hedef_rol_id !== 'all') {
            const rol = roller?.find((r: any) => r.id.toString() === formData.hedef_rol_id);
            if (rol) parts.push(`Rol: ${rol.ad}`);
        }
        return parts.join(' & ');
    };

    return (
        <div className="space-y-6 p-6">
            <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Megaphone className="w-6 h-6 text-purple-600" />
                        Duyuru Yönetimi
                    </h1>
                    <p className="text-muted-foreground text-sm">
                        Sistem genelinde veya birimlere özel duyurular yayınlayın
                    </p>
                </div>
                <Button onClick={() => setIsCreateModalOpen(true)} className="bg-purple-600 hover:bg-purple-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Yeni Duyuru
                </Button>
            </div>

            {/* Liste */}
            <div className="grid gap-4">
                {isLoadingDuyurular ? (
                    <div className="text-center py-10 text-muted-foreground">
                        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                        Duyurular yükleniyor...
                    </div>
                ) : duyurular?.length === 0 ? (
                    <div className="text-center py-10 bg-gray-50 rounded-lg border border-dashed">
                        <p className="text-muted-foreground">Henüz yayınlanmış bir duyuru yok.</p>
                    </div>
                ) : (
                    duyurular?.map((duyuru: any) => (
                        <Card key={duyuru.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-bold text-lg">{duyuru.baslik}</h3>
                                            <Badge variant={
                                                duyuru.oncelik === 'KRITIK' ? 'destructive' :
                                                    duyuru.oncelik === 'ACIL' ? 'secondary' : 'outline' // using secondary typically orange/yellow depending on theme, or define custom class
                                            } className={
                                                duyuru.oncelik === 'ACIL' ? 'bg-orange-500 hover:bg-orange-600 text-white border-none' : ''
                                            }>
                                                {duyuru.oncelik}
                                            </Badge>
                                        </div>
                                        <p className="text-gray-600 line-clamp-2">{duyuru.icerik}</p>
                                        <div className="flex gap-4 text-xs text-muted-foreground mt-2">
                                            <span>Yayın: {new Date(duyuru.yayin_tarihi).toLocaleDateString("tr-TR")}</span>
                                            <span>•</span>
                                            <span>Hedef: {
                                                !duyuru.hedef_birim && !duyuru.hedef_rol ? 'Tüm Personel' :
                                                    [duyuru.hedef_birim?.ad, duyuru.hedef_rol?.ad].filter(Boolean).join(' - ')
                                            }</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-2 text-sm text-gray-500 bg-gray-50 p-2 rounded border">
                                        <div className="flex items-center gap-2 font-medium">
                                            <Eye className="w-4 h-4" />
                                            Okunma
                                        </div>
                                        <div className="text-2xl font-bold text-gray-900">
                                            {duyuru._count?.okunma_loglari || 0}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {/* Create Modal */}
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Yeni Duyuru Oluştur</DialogTitle>
                        <DialogDescription>
                            Tüm kullanıcılar veya belirli gruplar için yeni bir duyuru yayınlayın.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleCreateClick} className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Başlık</Label>
                            <Input
                                required
                                maxLength={100}
                                placeholder="Duyuru başlığı..."
                                value={formData.baslik}
                                onChange={e => setFormData({ ...formData, baslik: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>İçerik</Label>
                            <Textarea
                                required
                                maxLength={300}
                                className="h-32"
                                placeholder="Duyuru içeriği..."
                                value={formData.icerik}
                                onChange={e => setFormData({ ...formData, icerik: e.target.value })}
                            />
                            <div className="text-xs text-right text-muted-foreground">
                                {formData.icerik.length}/300
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Öncelik</Label>
                                <Select
                                    value={formData.oncelik}
                                    onValueChange={val => setFormData({ ...formData, oncelik: val as any })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="NORMAL">Normal</SelectItem>
                                        <SelectItem value="ACIL">Acil</SelectItem>
                                        <SelectItem value="KRITIK">Kritik</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded border">
                            <div className="col-span-2 text-sm font-medium text-gray-700 mb-2">Hedef Kitle Seçimi (Opsiyonel)</div>

                            <div className="space-y-2">
                                <Label className="text-xs">Hedef Birim</Label>
                                <Select
                                    value={formData.hedef_birim_id}
                                    onValueChange={val => setFormData({ ...formData, hedef_birim_id: val })}
                                >
                                    <SelectTrigger className="bg-white">
                                        <SelectValue placeholder="Tüm Birimler" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Tüm Birimler</SelectItem>
                                        {birimler?.map((b: any) => (
                                            <SelectItem key={b.id} value={String(b.id)}>{b.ad}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs">Hedef Rol</Label>
                                <Select
                                    value={formData.hedef_rol_id}
                                    onValueChange={val => setFormData({ ...formData, hedef_rol_id: val })}
                                >
                                    <SelectTrigger className="bg-white">
                                        <SelectValue placeholder="Tüm Roller" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Tüm Roller</SelectItem>
                                        {roller?.map((r: any) => (
                                            <SelectItem key={r.id} value={String(r.id)}>{r.ad}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="col-span-2 text-xs text-muted-foreground mt-1">
                                * Herhangi bir seçim yapmazsanız duyuru <strong>Herkese</strong> gönderilir.
                            </div>
                        </div>

                        <DialogFooter className="gap-2">
                            <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>İptal</Button>
                            <Button type="submit" className="bg-purple-600 hover:bg-purple-700">İlerle</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Confirmation Dialog (Nested not recommended actually, but can overlay or swap content. 
                Shadcn Dialog inside Dialog can be tricky. Let's use conditional rendering instead or a separate alert dialog) 
            */}
            <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-orange-600">
                            <AlertTriangle className="h-5 w-5" />
                            Yayın Onayı
                        </DialogTitle>
                        <DialogDescription>
                            Bu işlem geri alınamaz. Duyuru aşağıdaki kitleye anında iletilecektir.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="bg-orange-50 p-4 rounded-lg border border-orange-200 text-sm space-y-2">
                        <p><strong>Başlık:</strong> {formData.baslik}</p>
                        <p><strong>Hedef:</strong> {getTargetText()}</p>
                        <p><strong>Öncelik:</strong> {formData.oncelik}</p>
                    </div>

                    <DialogFooter className="gap-2 pt-2">
                        <Button variant="outline" onClick={() => setIsConfirmOpen(false)}>Vazgeç</Button>
                        <Button onClick={handleConfirmSend} disabled={createMutation.isPending} className="bg-purple-600 hover:bg-purple-700 font-bold">
                            {createMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            ONAYLA VE YAYINLA
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </div>
    );
}
