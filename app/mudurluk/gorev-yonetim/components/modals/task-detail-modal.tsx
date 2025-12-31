'use client';

import { useState, useEffect } from 'react';
import {
    X,
    MessageSquare,
    Settings,
    XCircle
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/lib/toast';
import { Gorev, Personel } from '../../types';

interface TaskDetailModalProps {
    task: Gorev | null;
    open: boolean;
    onClose: () => void;
    onUpdate: (updatedTask: Gorev | null) => void;
    user: any;
    personeller: Personel[];
    isManagement: boolean;
    isLevel9: boolean;

}

const formatDate = (date: string | Date | null | undefined) => {
    if (!date) return '';
    return new Date(date).toISOString().split('T')[0];
};

export function TaskDetailModal({
    task,
    open,
    onClose,
    onUpdate,
    user,
    personeller,
    isManagement,
    isLevel9
}: TaskDetailModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [updateData, setUpdateData] = useState<any>({
        durum: '',
        mesaj: '',
        tamamlanma_notu: '',
        gorsel_url: '',
        // Settings
        baslik: '',
        aciklama: '',
        oncelik: '',
        sorumlu_id: '',
        baslangic_tarihi: '',
        bitis_tarihi: '',
        destek_verenler: []
    });

    useEffect(() => {
        if (task) {
            setUpdateData({
                durum: task.durum,
                mesaj: '',
                tamamlanma_notu: task.tamamlanma_notu || '',
                gorsel_url: '',
                baslik: task.baslik,
                aciklama: task.aciklama,
                oncelik: task.oncelik,
                sorumlu_id: task.sorumlu?.id.toString() || '',
                baslangic_tarihi: formatDate(task.baslangic_tarihi),
                bitis_tarihi: formatDate(task.bitis_tarihi),
                destek_verenler: task.destek_verenler?.map(d => d.id.toString()) || []
            });
        }
    }, [task]);

    const handleStatusSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!task) return;
        setIsLoading(true);
        try {
            const payload = {
                durum: updateData.durum,
                mesaj: updateData.mesaj,
                tamamlanma_notu: updateData.tamamlanma_notu,
                gorsel_url: updateData.gorsel_url
            };
            const res = await fetch(`/api/gorev/${task.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (data.success) {
                toast.success('Durum güncellendi');
                setUpdateData((prev: any) => ({ ...prev, mesaj: '', gorsel_url: '' }));

                if (data.data) {
                    if (updateData.durum === 'TAMAMLANDI' || updateData.durum === 'IPTAL') {
                        onUpdate(null); // Close modal indirectly via parent logic if needed, or better call onClose
                        onClose();
                    } else {
                        onUpdate(data.data);
                    }
                }
            } else {
                toast.error(data.error || 'Hata oluştu');
            }
        } catch (_error) {
            toast.error('Bağlantı hatası');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSettingsSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!task) return;
        setIsLoading(true);
        try {
            const payload = {
                baslik: updateData.baslik,
                aciklama: updateData.aciklama,
                oncelik: updateData.oncelik,
                sorumlu_id: updateData.sorumlu_id,
                baslangic_tarihi: updateData.baslangic_tarihi,
                bitis_tarihi: updateData.bitis_tarihi,
                destek_verenler: updateData.destek_verenler
            };
            const res = await fetch(`/api/gorev/${task.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (data.success) {
                toast.success('Ayarlar kaydedildi');
                if (data.data) {
                    onUpdate(data.data);
                }
            } else {
                toast.error(data.error || 'Hata oluştu');
            }
        } catch (_error) {
            toast.error('Bağlantı hatası');
        } finally {
            setIsLoading(false);
        }
    };

    if (!task) return null;

    return (
        <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
            <DialogContent className="sm:max-w-[1000px] p-0 overflow-hidden max-h-[95vh] flex flex-col">
                <DialogHeader className="sr-only">
                    <DialogTitle>Görev Detayı: {task.baslik}</DialogTitle>
                    <DialogDescription>Görev detayları ve işlem menüsü</DialogDescription>
                </DialogHeader>

                {/* Header */}
                <div className="bg-gray-900 text-white p-3 shrink-0 relative">
                    <div className="absolute top-2 right-2 z-50">
                        <button
                            onClick={onClose}
                            className="bg-white/90 hover:bg-white text-gray-900 p-1.5 rounded-full shadow-lg transition-all hover:scale-110"
                            title="Kapat"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="flex flex-col gap-2 pr-10">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                            <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-white border-white/20 text-[9px] uppercase font-bold tracking-wider rounded-md">
                                    {task.kategori}
                                </Badge>
                                <Badge className={`text-[9px] font-bold ${task.oncelik === 'ACIL' ? 'bg-red-500 hover:bg-red-600' :
                                    task.oncelik === 'YUKSEK' ? 'bg-orange-500 hover:bg-orange-600' :
                                        'bg-blue-500 hover:bg-blue-600'
                                    } `}>
                                    {task.oncelik}
                                </Badge>
                                <Badge variant="secondary" className="text-[9px] bg-white/10 text-white hover:bg-white/20">
                                    {task.durum}
                                </Badge>
                            </div>
                            <div className="flex items-center gap-3 text-[9px] text-gray-400">
                                <span>📅 {new Date(task.baslangic_tarihi || task.created_at).toLocaleDateString('tr-TR')}</span>
                                <span>→</span>
                                <span>{task.bitis_tarihi ? new Date(task.bitis_tarihi).toLocaleDateString('tr-TR') : 'Süresiz'}</span>
                            </div>
                        </div>
                        <h2 className="text-base font-black tracking-tight leading-tight">{task.baslik}</h2>
                        <p className="text-[11px] text-gray-400 font-medium leading-snug">
                            {task.aciklama}
                        </p>
                        <div className="flex items-center gap-3 pt-2 border-t border-white/10">
                            <div className="flex items-center gap-2">
                                <Avatar className="w-6 h-6 border-2 border-gray-800">
                                    <AvatarImage src={task.sorumlu?.profil_foto_url} />
                                    <AvatarFallback className="text-[10px] bg-gray-700">{task.sorumlu?.ad?.[0]}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <div className="text-[10px] font-bold text-gray-200">
                                        {task.sorumlu?.ad} {task.sorumlu?.soyad}
                                    </div>
                                    <div className="text-[8px] text-gray-500 uppercase font-black">Sorumlu</div>
                                </div>
                            </div>
                            {task.destek_verenler && task.destek_verenler.length > 0 && (
                                <div className="flex items-center gap-2 ml-auto">
                                    <span className="text-[8px] text-gray-500 font-bold uppercase">Destek:</span>
                                    <div className="flex items-center gap-1">
                                        {task.destek_verenler?.map((p, idx) => (
                                            <span key={p.id} className="text-[9px] text-gray-300 font-medium">
                                                {p.ad} {p.soyad}{idx < (task.destek_verenler?.length || 0) - 1 ? ',' : ''}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">

                    {/* Süreç Günlüğü ve Durum Güncelleme */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                        {/* Süreç Günlüğü */}
                        <div className="bg-white p-3 rounded-xl border shadow-sm">
                            <h4 className="font-black text-gray-900 flex items-center gap-2 border-b pb-2 mb-2 text-xs">
                                <MessageSquare className="w-3 h-3" /> SÜREÇ GÜNLÜĞÜ
                            </h4>
                            <div className="max-h-[280px] overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                                {task.guncellemeler.map((u, i) => (
                                    <div key={i} className="bg-gray-50 p-2 rounded-lg border text-sm">
                                        <div className="flex justify-between mb-0.5">
                                            <span className="font-bold text-[10px] text-primary">{u.personel.ad} {u.personel.soyad}</span>
                                            <span className="text-[9px] text-gray-400">{new Date(u.created_at).toLocaleString('tr-TR', { dateStyle: 'short', timeStyle: 'short' })}</span>
                                        </div>
                                        <p className="text-gray-600 text-[10px] leading-snug">{u.mesaj}</p>
                                    </div>
                                ))}
                                {task.guncellemeler.length === 0 && <div className="text-center text-[10px] text-gray-400 py-4">Henüz kayıt yok.</div>}
                            </div>
                        </div>

                        {/* Durum Güncelleme */}
                        <div className="bg-white p-4 rounded-xl border shadow-sm">
                            <h4 className="font-black text-gray-900 border-b pb-2 mb-4 text-sm uppercase">DURUM GÜNCELLE</h4>
                            <form onSubmit={handleStatusSubmit} className="space-y-3">
                                <div className="space-y-1">
                                    <Label className="text-xs">Aksiyon</Label>
                                    <Select value={updateData.durum} onValueChange={(val) => setUpdateData({ ...updateData, durum: val })}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="DEVAM_EDEN">Devam Ediyor</SelectItem>
                                            <SelectItem value="TAMAMLANDI">Tamamlandı</SelectItem>
                                            {isManagement && <SelectItem value="IPTAL">İptal Et</SelectItem>}
                                        </SelectContent>
                                    </Select>
                                </div>
                                {(updateData.durum === 'TAMAMLANDI' || updateData.durum === 'IPTAL') && (
                                    <Textarea placeholder="Sonuç notu..." required={updateData.durum === 'TAMAMLANDI'} value={updateData.tamamlanma_notu} onChange={e => setUpdateData({ ...updateData, tamamlanma_notu: e.target.value })} className="text-xs" />
                                )}
                                <Textarea placeholder="Süreç notu ekle..." value={updateData.mesaj} onChange={e => setUpdateData({ ...updateData, mesaj: e.target.value })} className="text-xs min-h-[80px]" />

                                <div className="space-y-1">
                                    <Label className="text-xs">Görsel Kanıt (URL)</Label>
                                    <Input className="h-9 text-xs" placeholder="https://..." value={updateData.gorsel_url || ''} onChange={(e) => setUpdateData({ ...updateData, gorsel_url: e.target.value })} />
                                </div>

                                <Button type="submit" disabled={isLoading || (!isManagement && task.sorumlu.id !== user?.id && task.olusturan.id !== user?.id)} className="w-full bg-primary font-bold text-sm">
                                    {isLoading ? 'Güncelleniyor...' : 'DURUMU GÜNCELLE'}
                                </Button>

                                {(!isManagement && task.sorumlu.id !== user?.id && task.olusturan.id !== user?.id) && (
                                    <p className="text-[9px] text-gray-400 italic text-center">Yetkiniz yok.</p>
                                )}
                            </form>
                        </div>
                    </div>

                    {/* Separated Settings for Management */}
                    {isManagement && (
                        <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm mt-4">
                            <h4 className="font-black text-gray-900 border-b pb-2 mb-3 flex items-center gap-2 text-xs">
                                <Settings className="w-4 h-4" /> GÖREV AYARLARI (DÜZENLEME)
                            </h4>
                            <form onSubmit={handleSettingsSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                                {isLevel9 && (
                                    <>
                                        <div className="col-span-2 space-y-1">
                                            <Label>Başlık</Label>
                                            <Input value={updateData.baslik} onChange={e => setUpdateData({ ...updateData, baslik: e.target.value })} className="font-bold" />
                                        </div>
                                        <div className="col-span-2 space-y-1">
                                            <Label>Açıklama</Label>
                                            <Textarea value={updateData.aciklama} onChange={e => setUpdateData({ ...updateData, aciklama: e.target.value })} />
                                        </div>
                                    </>
                                )}

                                <div className="space-y-1">
                                    <Label>Öncelik</Label>
                                    <Select value={updateData.oncelik} onValueChange={(val: any) => setUpdateData({ ...updateData, oncelik: val })}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="DUSUK">Düşük</SelectItem>
                                            <SelectItem value="ORTA">Orta</SelectItem>
                                            <SelectItem value="YUKSEK">Yüksek</SelectItem>
                                            <SelectItem value="ACIL">Acil</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1">
                                    <Label>Sorumlu Personel</Label>
                                    <Select value={updateData.sorumlu_id} onValueChange={(val) => setUpdateData({ ...updateData, sorumlu_id: val })}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {personeller.map(p => <SelectItem key={p.id} value={p.id.toString()}>{p.ad} {p.soyad}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1">
                                    <Label>Başlangıç</Label>
                                    <Input type="date" value={updateData.baslangic_tarihi} onChange={e => setUpdateData({ ...updateData, baslangic_tarihi: e.target.value })} />
                                </div>
                                <div className="space-y-1">
                                    <Label>Bitiş</Label>
                                    <Input type="date" value={updateData.bitis_tarihi} onChange={e => setUpdateData({ ...updateData, bitis_tarihi: e.target.value })} min={updateData.baslangic_tarihi} />
                                </div>

                                <div className="col-span-full space-y-2 pt-2 border-t mt-2">
                                    <Label>Destek Personeli Ekle/Çıkar</Label>
                                    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                                        <Select value="" onValueChange={(val) => {
                                            const destekList = updateData.destek_verenler || [];
                                            if (!destekList.includes(val)) setUpdateData({ ...updateData, destek_verenler: [...destekList, val] });
                                            else setUpdateData({ ...updateData, destek_verenler: destekList.filter((x: string) => x !== val) });
                                        }}>
                                            <SelectTrigger className="w-[300px] h-9"><SelectValue placeholder="Personel Seç..." /></SelectTrigger>
                                            <SelectContent>
                                                {personeller.filter(p => p.id.toString() !== updateData.sorumlu_id).map(p => (
                                                    <SelectItem key={p.id} value={p.id.toString()}>{(updateData.destek_verenler || []).includes(p.id.toString()) ? '✓ ' : ''} {p.ad} {p.soyad}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <div className="flex flex-wrap gap-2">
                                            {(updateData.destek_verenler || []).map((id: string) => {
                                                const p = personeller.find(x => x.id.toString() === id);
                                                if (!p) return null;
                                                return (
                                                    <Badge key={id} variant="secondary" className="cursor-pointer hover:bg-red-100 flex items-center gap-1" onClick={() => setUpdateData((prev: any) => ({ ...prev, destek_verenler: (prev.destek_verenler || []).filter((x: string) => x !== id) }))}>
                                                        {p.ad} {p.soyad} <XCircle className="w-3 h-3" />
                                                    </Badge>
                                                )
                                            })}
                                        </div>
                                    </div>
                                </div>

                                <div className="col-span-full pt-4 flex justify-end">
                                    <Button type="submit" size="lg" disabled={isLoading} className="bg-gray-900 text-white font-bold px-8 shadow-xl hover:bg-black">
                                        {isLoading ? 'KAYDEDİLİYOR...' : 'AYARLARI KAYDET'}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
