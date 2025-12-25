'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
    ClipboardList,
    Calendar as CalendarIcon,
    Activity,
    LineChart,
    Plus,
    Clock,
    CheckCircle2,
    Users,
    ChevronLeft,
    ChevronRight,
    Search,
    MessageSquare,
    Briefcase,
    CalendarDays,
    AlertCircle,
    XCircle,
    Camera,
    Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/lib/toast';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from '@/components/ui/textarea';

// --- Types ---
type Gorev = {
    id: string;
    baslik: string;
    aciklama: string;
    durum: 'BEKLEYEN' | 'DEVAM_EDEN' | 'TAMAMLANDI' | 'IPTAL';
    oncelik: 'DUSUK' | 'ORTA' | 'YUKSEK' | 'ACIL';
    kategori: string;
    baslangic_tarihi?: string;
    bitis_tarihi?: string;
    sorumlu: { id: string, ad: string, soyad: string, profil_foto_url?: string, unvan?: string };
    olusturan: { id: string, ad: string, soyad: string };
    guncellemeler: any[];
    created_at: string;
};

type Etkinlik = {
    id: string;
    baslik: string;
    aciklama?: string;
    tip: string;
    renk?: string;
    baslangic: string;
    bitis: string;
    personel_id: string;
    olusturan: { ad: string, soyad: string };
};

export default function GorevYonetimPage() {
    const { data: session } = useSession();
    const user = session?.user as any;
    const isManagement = user?.rol?.seviye >= 9;

    const [_activeTab, setActiveTab] = useState('gorevler');
    const [loading, setLoading] = useState(true);
    const [gorevler, setGorevler] = useState<Gorev[]>([]);
    const [etkinlikler, setEtkinlikler] = useState<Etkinlik[]>([]);
    const [personeller, setPersoneller] = useState<any[]>([]);

    // Day Selection for Daily Activity
    const [selectedDate, setSelectedDate] = useState(new Date());

    // Modal States
    const [isGorevModalOpen, setIsGorevModalOpen] = useState(false);
    const [isEtkinlikModalOpen, setIsEtkinlikModalOpen] = useState(false);
    const [selectedGorev, setSelectedGorev] = useState<Gorev | null>(null);

    const [newGorev, setNewGorev] = useState({
        baslik: '',
        aciklama: '',
        sorumlu_id: '',
        oncelik: 'ORTA',
        kategori: 'DIGER',
        baslangic_tarihi: '',
        bitis_tarihi: ''
    });

    const [newEtkinlik, setNewEtkinlik] = useState({
        baslik: '',
        aciklama: '',
        tip: 'TOPLANTI',
        baslangic: '',
        bitis: '',
        personel_id: ''
    });

    const [gorevUpdate, setGorevUpdate] = useState({
        mesaj: '',
        durum: '',
        gorsel_url: ''
    });

    useEffect(() => {
        if (session) {
            fetchData();
            fetchPersoneller();
        }
    }, [session, selectedDate]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const startOfDay = new Date(selectedDate);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(selectedDate);
            endOfDay.setHours(23, 59, 59, 999);

            const [gRes, eRes] = await Promise.all([
                fetch('/api/gorev'),
                fetch(`/api/takvim?start=${startOfDay.toISOString()}&end=${endOfDay.toISOString()}`)
            ]);

            const gData = await gRes.json();
            const eData = await eRes.json();

            if (gData.success) {
                setGorevler(gData.data);
                if (selectedGorev) {
                    const updated = gData.data.find((g: Gorev) => g.id === selectedGorev.id);
                    if (updated) setSelectedGorev(updated);
                }
            }
            if (eData.success) setEtkinlikler(eData.data);
        } catch (error) {
            console.error('Data fetch error:', error);
            toast.error('Veriler yüklenemedi');
        } finally {
            setLoading(false);
        }
    };

    const fetchPersoneller = async () => {
        try {
            const res = await fetch('/api/personel?limit=100');
            const data = await res.json();
            if (data.success) {
                setPersoneller(data.data);
                if (data.data.length > 0) {
                    setNewGorev(prev => ({ ...prev, sorumlu_id: data.data[0].id }));
                }
            }
        } catch (error) {
            console.error('Personel fetch error:', error);
        }
    };

    const handleGorevSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/gorev', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newGorev)
            });
            const data = await res.json();
            if (data.success) {
                toast.success('Görev başarıyla oluşturuldu');
                setIsGorevModalOpen(false);
                setNewGorev({ baslik: '', aciklama: '', sorumlu_id: personeller[0]?.id || '', oncelik: 'ORTA', kategori: 'DIGER', baslangic_tarihi: '', bitis_tarihi: '' });
                fetchData();
            } else {
                toast.error(data.error || 'Hata oluştu');
            }
        } catch (_error) {
            toast.error('Bağlantı hatası');
        }
    };

    const handleEtkinlikSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/takvim', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newEtkinlik)
            });
            const data = await res.json();
            if (data.success) {
                toast.success('Etkinlik eklendi');
                setIsEtkinlikModalOpen(false);
                setNewEtkinlik({ baslik: '', aciklama: '', tip: 'TOPLANTI', baslangic: '', bitis: '', personel_id: user?.id || '' });
                fetchData();
            } else {
                toast.error(data.error || 'Hata oluştu');
            }
        } catch (_error) {
            toast.error('Bağlantı hatası');
        }
    };

    const handleGorevUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedGorev) return;
        try {
            const res = await fetch(`/api/gorev/${selectedGorev.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(gorevUpdate)
            });
            const data = await res.json();
            if (data.success) {
                toast.success('Görev güncellendi');
                setGorevUpdate({ mesaj: '', durum: '', gorsel_url: '' });
                fetchData();
            } else {
                toast.error(data.error || 'Hata oluştu');
            }
        } catch (_error) {
            toast.error('Bağlantı hatası');
        }
    };

    const handleDateChange = (days: number) => {
        const newDate = new Date(selectedDate);
        newDate.setDate(newDate.getDate() + days);
        setSelectedDate(newDate);
    };

    // --- Sub-Components ---

    const GorevCard = ({ gorev }: { gorev: Gorev }) => {
        const priorityColors = {
            DUSUK: 'bg-slate-100 text-slate-700',
            ORTA: 'bg-blue-100 text-blue-700',
            YUKSEK: 'bg-orange-100 text-orange-700',
            ACIL: 'bg-red-100 text-red-700'
        };

        const statusColors = {
            BEKLEYEN: 'bg-gray-100 text-gray-700',
            DEVAM_EDEN: 'bg-blue-100 text-blue-700',
            TAMAMLANDI: 'bg-green-100 text-green-700',
            IPTAL: 'bg-red-100 text-red-700'
        };

        return (
            <Card className="hover:shadow-md transition-shadow group cursor-pointer" onClick={() => {
                setSelectedGorev(gorev);
                setGorevUpdate(prev => ({ ...prev, durum: gorev.durum }));
            }}>
                <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                        <Badge variant="outline" className={priorityColors[gorev.oncelik]}>
                            {gorev.oncelik}
                        </Badge>
                        <Badge className={statusColors[gorev.durum]}>
                            {gorev.durum.replace('_', ' ')}
                        </Badge>
                    </div>
                    <CardTitle className="text-lg mt-2 group-hover:text-primary transition-colors">{gorev.baslik}</CardTitle>
                    <CardDescription className="line-clamp-2 min-h-[40px]">{gorev.aciklama}</CardDescription>
                </CardHeader>
                <CardContent className="pb-4">
                    <div className="flex items-center gap-2 mt-2">
                        <Avatar className="w-8 h-8">
                            <AvatarImage src={gorev.sorumlu.profil_foto_url} />
                            <AvatarFallback>{gorev.sorumlu.ad[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-gray-900 leading-none">
                                {gorev.sorumlu.ad} {gorev.sorumlu.soyad}
                            </span>
                            <span className="text-[10px] text-gray-500 uppercase tracking-tighter mt-1">{gorev.sorumlu.unvan || 'Personel'}</span>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="pt-0 flex justify-between text-xs text-gray-400 border-t pt-3">
                    <div className="flex items-center gap-1.5 font-medium">
                        <Clock className="w-3.5 h-3.5" />
                        {gorev.bitis_tarihi ? new Date(gorev.bitis_tarihi).toLocaleDateString('tr-TR') : 'Süresiz'}
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                            <MessageSquare className="w-3.5 h-3.5" /> {gorev.guncellemeler?.length || 0}
                        </div>
                    </div>
                </CardFooter>
            </Card>
        );
    };

    const DailyTimeline = () => {
        const hours = Array.from({ length: 11 }, (_, i) => i + 8); // 8-18

        return (
            <div className="bg-white rounded-2xl border shadow-sm p-6 overflow-hidden">
                <div className="flex items-center justify-between mb-8 pb-4 border-b">
                    <div className="flex items-center gap-6">
                        <div className="flex gap-1">
                            <Button variant="outline" size="icon" onClick={() => handleDateChange(-1)} className="rounded-full">
                                <ChevronLeft className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="icon" onClick={() => handleDateChange(1)} className="rounded-full">
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-gray-900 tracking-tight">
                                {selectedDate.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </h3>
                            <p className="text-xs font-bold text-primary uppercase tracking-widest">
                                {selectedDate.toLocaleDateString('tr-TR', { weekday: 'long' })}
                            </p>
                        </div>
                    </div>
                    <Button variant="ghost" className="font-bold text-gray-500 hover:text-primary" onClick={() => setActiveTab('takvim')}>
                        <CalendarDays className="mr-2 h-4 w-4" /> Aylık Takvim
                    </Button>
                </div>

                <div className="space-y-0.5 relative">
                    {hours.map(hour => {
                        const hourEtkinlikler = etkinlikler.filter(e => {
                            const startH = new Date(e.baslangic).getHours();
                            return startH === hour;
                        });

                        return (
                            <div key={hour} className="flex group min-h-[80px]">
                                <div className="w-24 pt-1 text-sm font-black text-gray-300 border-r-2 border-dashed pr-6 text-right transition-colors group-hover:text-primary">
                                    {String(hour).padStart(2, '0')}:00
                                </div>
                                <div className="flex-1 relative border-b group-last:border-b-0 p-4 pl-6">
                                    {hourEtkinlikler.map(e => (
                                        <div
                                            key={e.id}
                                            className="bg-primary/5 border-l-4 border-primary p-3 rounded-r-xl mb-3 shadow-sm group hover:shadow-md transition-all cursor-pointer"
                                            style={{ borderLeftColor: e.renk || 'var(--primary)' }}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div className="font-bold text-sm text-gray-900 group-hover:text-primary transition-colors">{e.baslik}</div>
                                                <Badge variant="secondary" className="text-[10px] py-0">{e.tip}</Badge>
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                                                <Users className="w-3 h-3 text-primary" />
                                                <span className="font-medium">{e.olusturan.ad} {e.olusturan.soyad}</span>
                                            </div>
                                            {e.aciklama && <p className="text-[10px] text-gray-400 mt-2 italic">{e.aciklama}</p>}
                                        </div>
                                    ))}
                                    {hourEtkinlikler.length === 0 && (
                                        <button
                                            onClick={() => {
                                                const d = new Date(selectedDate);
                                                d.setHours(hour, 0, 0, 0);
                                                setNewEtkinlik(prev => ({
                                                    ...prev,
                                                    baslangic: d.toISOString().slice(0, 16),
                                                    bitis: new Date(new Date(d).setHours(hour + 1)).toISOString().slice(0, 16),
                                                    personel_id: user?.id || ''
                                                }));
                                                setIsEtkinlikModalOpen(true);
                                            }}
                                            className="w-full text-gray-50 text-xs py-4 text-left px-2 rounded-lg hover:bg-gray-50 hover:text-gray-300 transition-colors opacity-0 group-hover:opacity-100"
                                        >
                                            + Etkinlik Ekle
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <div className="container mx-auto py-8 space-y-8 min-h-screen">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-1">
                    <h1 className="text-5xl font-black text-gray-900 tracking-tighter flex items-center gap-4">
                        <div className="bg-primary p-3 rounded-2xl text-primary-foreground shadow-2xl rotate-3">
                            <ClipboardList className="w-10 h-10" />
                        </div>
                        SAHA <span className="text-primary tracking-tight font-light">OPERASYON</span>
                    </h1>
                    <p className="text-gray-400 font-bold uppercase tracking-[0.2em] text-xs pl-2 border-l-4 border-primary ml-10">
                        Görev, Performans ve Süreç Takibi
                    </p>
                </div>
                <div className="flex gap-3">
                    <Dialog open={isGorevModalOpen} onOpenChange={setIsGorevModalOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-primary hover:opacity-90 shadow-xl px-8 h-12 rounded-xl font-bold flex gap-2">
                                <Plus className="w-5 h-5" /> Yeni Görev
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px]">
                            <form onSubmit={handleGorevSubmit}>
                                <DialogHeader>
                                    <DialogTitle>Yeni Görev Ata</DialogTitle>
                                    <DialogDescription>Personel sorumluluğuna yeni bir iş süreci ekleyin.</DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="space-y-1">
                                        <Label htmlFor="baslik">Görev Başlığı</Label>
                                        <Input id="baslik" required value={newGorev.baslik} onChange={(e) => setNewGorev({ ...newGorev, baslik: e.target.value })} />
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="sorumlu">Sorumlu Personel</Label>
                                        <Select value={newGorev.sorumlu_id} onValueChange={(val) => setNewGorev({ ...newGorev, sorumlu_id: val })}>
                                            <SelectTrigger><SelectValue placeholder="Personel seçin" /></SelectTrigger>
                                            <SelectContent>
                                                {personeller.map(p => <SelectItem key={p.id} value={p.id}>{p.ad} {p.soyad} - {p.unvan}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <Label>Öncelik</Label>
                                            <Select value={newGorev.oncelik} onValueChange={(val: any) => setNewGorev({ ...newGorev, oncelik: val })}>
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
                                            <Label>Kategori</Label>
                                            <Select value={newGorev.kategori} onValueChange={(val) => setNewGorev({ ...newGorev, kategori: val })}>
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="DENETIM">Denetim</SelectItem>
                                                    <SelectItem value="EGITIM">Eğitim</SelectItem>
                                                    <SelectItem value="TOPLANTI">Toplantı</SelectItem>
                                                    <SelectItem value="DIGER">Diğer</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <Label>Son Tarih</Label>
                                        <Input type="date" value={newGorev.bitis_tarihi} onChange={(e) => setNewGorev({ ...newGorev, bitis_tarihi: e.target.value })} />
                                    </div>
                                    <div className="space-y-1">
                                        <Label>Açıklama</Label>
                                        <Textarea value={newGorev.aciklama} onChange={(e) => setNewGorev({ ...newGorev, aciklama: e.target.value })} />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button type="submit">Görevi Tanımla</Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>

                    <Dialog open={isEtkinlikModalOpen} onOpenChange={setIsEtkinlikModalOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="shadow-lg border-2 h-12 rounded-xl font-bold px-6">
                                <CalendarIcon className="mr-2 w-5 h-5" /> Etkinlik Ekle
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <form onSubmit={handleEtkinlikSubmit}>
                                <DialogHeader>
                                    <DialogTitle>Yeni Takvim Etkinliği</DialogTitle>
                                    <DialogDescription>Toplantı, eğitim veya izin girişi yapın.</DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="space-y-1">
                                        <Label>Etkinlik Adı</Label>
                                        <Input required value={newEtkinlik.baslik} onChange={(e) => setNewEtkinlik({ ...newEtkinlik, baslik: e.target.value })} />
                                    </div>
                                    <div className="space-y-1">
                                        <Label>Tip</Label>
                                        <Select value={newEtkinlik.tip} onValueChange={(val) => setNewEtkinlik({ ...newEtkinlik, tip: val })}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="TOPLANTI">Toplantı</SelectItem>
                                                <SelectItem value="EGITIM">Eğitim</SelectItem>
                                                <SelectItem value="DENETIM">Denetim</SelectItem>
                                                <SelectItem value="IZIN">İzin</SelectItem>
                                                <SelectItem value="DIGER">Diğer</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    {isManagement && (
                                        <div className="space-y-1">
                                            <Label>İlgili Personel</Label>
                                            <Select value={newEtkinlik.personel_id} onValueChange={(val) => setNewEtkinlik({ ...newEtkinlik, personel_id: val })}>
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    {personeller.map(p => <SelectItem key={p.id} value={p.id}>{p.ad} {p.soyad}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <Label>Başlangıç</Label>
                                            <Input type="datetime-local" required value={newEtkinlik.baslangic} onChange={(e) => setNewEtkinlik({ ...newEtkinlik, baslangic: e.target.value })} />
                                        </div>
                                        <div className="space-y-1">
                                            <Label>Bitiş</Label>
                                            <Input type="datetime-local" required value={newEtkinlik.bitis} onChange={(e) => setNewEtkinlik({ ...newEtkinlik, bitis: e.target.value })} />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <Label>Notlar</Label>
                                        <Textarea value={newEtkinlik.aciklama} onChange={(e) => setNewEtkinlik({ ...newEtkinlik, aciklama: e.target.value })} />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button type="submit">Takvime Ekle</Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <Tabs defaultValue="gorevler" className="w-full" onValueChange={setActiveTab}>
                <TabsList className="flex w-full md:w-fit gap-2 p-1 bg-white/40 backdrop-blur-md rounded-2xl border shadow-xl mb-12">
                    <TabsTrigger value="gorevler" className="flex-1 md:flex-none gap-2 px-8 py-3 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-bold transition-all">
                        <ClipboardList className="h-5 w-5" /> Görevler
                    </TabsTrigger>
                    <TabsTrigger value="takvim" className="flex-1 md:flex-none gap-2 px-8 py-3 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-bold transition-all">
                        <CalendarIcon className="h-5 w-5" /> Aylık Takvim
                    </TabsTrigger>
                    <TabsTrigger value="aktivite" className="flex-1 md:flex-none gap-2 px-8 py-3 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-bold transition-all">
                        <Activity className="h-5 w-5" /> Günlük Aktivite
                    </TabsTrigger>
                    <TabsTrigger value="surec" className="flex-1 md:flex-none gap-2 px-8 py-3 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-bold transition-all">
                        <LineChart className="h-5 w-5" /> Süreç İzleme
                    </TabsTrigger>
                </TabsList>

                {/* --- TAB: GÖREVLER --- */}
                <TabsContent value="gorevler" className="mt-8 space-y-10 animate-in fade-in duration-700">
                    {/* Stats Section with Glassmorphism */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            { label: 'TOPLAM GÖREV', val: gorevler.length, color: 'text-blue-600', bg: 'bg-blue-50', icon: ClipboardList },
                            { label: 'DEVAM EDEN', val: gorevler.filter(g => g.durum === 'DEVAM_EDEN').length, color: 'text-orange-600', bg: 'bg-orange-50', icon: Clock },
                            { label: 'TAMAMLANDI', val: gorevler.filter(g => g.durum === 'TAMAMLANDI').length, color: 'text-green-600', bg: 'bg-green-50', icon: CheckCircle2 },
                            { label: 'GECİKENLER', val: gorevler.filter(g => g.durum !== 'TAMAMLANDI' && g.bitis_tarihi && new Date(g.bitis_tarihi) < new Date()).length, color: 'text-red-600', bg: 'bg-red-50', icon: AlertCircle }
                        ].map((stat, i) => (
                            <Card key={i} className={`border-none shadow-sm ${stat.bg} transition-transform hover:-translate-y-1 overflow-hidden relative`}>
                                <stat.icon className={`absolute -right-4 -bottom-4 w-24 h-24 opacity-5 ${stat.color}`} />
                                <CardHeader className="pb-2">
                                    <p className="text-[10px] font-black tracking-[0.2em] opacity-50 uppercase">{stat.label}</p>
                                    <CardTitle className={`text-4xl font-black ${stat.color}`}>{stat.val}</CardTitle>
                                </CardHeader>
                            </Card>
                        ))}
                    </div>

                    <div className="bg-white rounded-3xl border-2 border-gray-50 shadow-2xl overflow-hidden p-8">
                        <div className="flex flex-col md:flex-row gap-6 items-center justify-between mb-10">
                            <h3 className="text-2xl font-black text-gray-900 tracking-tight">Merkezi İş Havuzu</h3>
                            <div className="flex flex-wrap gap-4 items-center w-full md:w-auto">
                                <div className="relative flex-1 md:w-64">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <Input placeholder="Ara..." className="pl-10 rounded-xl bg-gray-50 border-none focus:ring-2" />
                                </div>
                                <Select defaultValue="all">
                                    <SelectTrigger className="w-[140px] rounded-xl border-none bg-gray-50 font-bold">
                                        <SelectValue placeholder="Orijin" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Filtrele</SelectItem>
                                        <SelectItem value="BEKLEYEN">Bekleyen</SelectItem>
                                        <SelectItem value="DEVAM_EDEN">Devam Eden</SelectItem>
                                        <SelectItem value="TAMAMLANDI">Biten</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-pulse">
                                {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-64 bg-gray-100 rounded-3xl" />)}
                            </div>
                        ) : gorevler.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {gorevler.map(gorev => <GorevCard key={gorev.id} gorev={gorev} />)}
                            </div>
                        ) : (
                            <div className="text-center py-32 bg-gray-50/50 rounded-[3rem] border-4 border-dashed border-gray-100">
                                <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl text-gray-300">
                                    <ClipboardList className="w-10 h-10" />
                                </div>
                                <h3 className="text-2xl font-black text-gray-400">Yönetilecek Görev Yok</h3>
                                <p className="text-gray-400 mt-2 font-medium">Hemen yeni bir iş tanımı yaparak süreci başlatın.</p>
                            </div>
                        )}
                    </div>
                </TabsContent>

                {/* --- TAB: TAKVİM --- */}
                <TabsContent value="takvim" className="mt-8 animate-in slide-in-from-top-10 duration-700">
                    <Card className="min-h-[700px] border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white">
                        <div className="grid grid-cols-1 lg:grid-cols-4 h-full">
                            {/* Calendar Sidebar */}
                            <div className="p-10 border-r bg-gray-50/50 backdrop-blur-3xl">
                                <h3 className="text-xl font-black flex items-center gap-3 mb-10 text-gray-900">
                                    <div className="bg-primary/20 p-2 rounded-lg text-primary">
                                        <Users className="w-5 h-5" />
                                    </div>
                                    Organizasyon
                                </h3>

                                <div className="space-y-8">
                                    <div className="space-y-4">
                                        <Label className="text-[10px] uppercase font-black tracking-widest text-gray-400 block pb-2 border-b">Erişilebilir Personeller</Label>
                                        <div className="space-y-2 mt-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                            {personeller.map(p => (
                                                <div key={p.id} className="flex items-center gap-3 p-3 rounded-2xl hover:bg-white hover:shadow-lg transition-all cursor-pointer group">
                                                    <Avatar className="w-10 h-10 border-2 border-transparent group-hover:border-primary/20 shadow-sm transition-all group-hover:scale-110">
                                                        <AvatarImage src={p.profil_foto_url} />
                                                        <AvatarFallback className="text-xs font-black">{p.ad[0]}{p.soyad[0]}</AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex-1 overflow-hidden">
                                                        <div className="text-sm font-black text-gray-900 truncate leading-tight">{p.ad} {p.soyad}</div>
                                                        <div className="text-[10px] text-gray-400 font-bold uppercase truncate tracking-tighter">{p.unvan || 'Kıdemli Personel'}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="pt-8 border-t space-y-4">
                                        <Label className="text-[10px] uppercase font-black tracking-widest text-gray-400">Görsel Lejant</Label>
                                        <div className="grid grid-cols-1 gap-3 mt-4">
                                            {[
                                                { label: 'Kurumsal Toplantı', color: 'bg-blue-500' },
                                                { label: 'Mesleki Eğitim', color: 'bg-purple-500' },
                                                { label: 'Saha Denetimi', color: 'bg-orange-500' },
                                                { label: 'Personel İzni', color: 'bg-green-500' }
                                            ].map((l, i) => (
                                                <div key={i} className="flex items-center gap-3 text-xs font-black text-gray-700">
                                                    <div className={`w-3 h-3 rounded-full ${l.color} shadow-sm`} /> {l.label}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Calendar Main Area */}
                            <div className="col-span-3 p-12">
                                <div className="flex items-center justify-between mb-12">
                                    <div>
                                        <h2 className="text-4xl font-black text-gray-900 tracking-tighter">Aralık 2025</h2>
                                        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs mt-1">Stratejik Planlama Takvimi</p>
                                    </div>
                                    <div className="flex gap-2 bg-gray-50 p-1.5 rounded-2xl shadow-inner">
                                        <Button variant="ghost" size="sm" className="rounded-xl px-6 h-10 font-black text-gray-400">Hafta</Button>
                                        <Button variant="default" size="sm" className="rounded-xl px-8 h-10 font-black bg-white text-gray-900 shadow-xl border-none">Ay</Button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-7 gap-4">
                                    {['PZT', 'SAL', 'ÇAR', 'PER', 'CUM', 'CMT', 'PAZ'].map(d => (
                                        <div key={d} className="p-2 text-center text-[10px] font-black text-gray-400 tracking-widest">{d}</div>
                                    ))}
                                    {Array.from({ length: 35 }, (_, i) => {
                                        const day = i - 0;
                                        const isToday = day === 25;
                                        return (
                                            <div key={i} className={`min-h-[140px] rounded-3xl p-4 relative group transition-all duration-300 border-2 ${day <= 0 || day > 31 ? 'opacity-0 pointer-events-none' : 'hover:border-primary/20 hover:bg-primary/5 cursor-pointer border-transparent bg-gray-50/50'}`}>
                                                {day > 0 && day <= 31 && (
                                                    <>
                                                        <span className={`text-lg font-black ${isToday ? 'text-primary' : 'text-gray-300'}`}>
                                                            {day}
                                                        </span>
                                                        {day === 25 && (
                                                            <div className="mt-3 space-y-2">
                                                                <div className="text-[9px] p-2 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-200 truncate border-none">Kurul Toplantısı</div>
                                                                <div className="text-[9px] p-2 bg-orange-500 text-white rounded-xl font-bold shadow-lg shadow-orange-200 truncate border-none">Saha Denetimi</div>
                                                            </div>
                                                        )}
                                                        <Button
                                                            variant="default"
                                                            size="icon"
                                                            className="absolute top-3 right-3 w-8 h-8 rounded-xl opacity-0 group-hover:opacity-100 transition-all shadow-xl"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setIsEtkinlikModalOpen(true);
                                                            }}
                                                        >
                                                            <Plus className="w-4 h-4" />
                                                        </Button>
                                                    </>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </Card>
                </TabsContent>

                {/* --- TAB: GÜNLÜK AKTİVİTE --- */}
                <TabsContent value="aktivite" className="mt-8 animate-in zoom-in-95 duration-700">
                    <DailyTimeline />
                </TabsContent>

                {/* --- TAB: SÜREÇ İZLEME --- */}
                <TabsContent value="surec" className="mt-8 animate-in slide-in-from-right-20 duration-700">
                    <Card className="min-h-[600px] rounded-[3rem] border-none shadow-2xl p-10 bg-white">
                        <CardHeader className="p-0 mb-12">
                            <CardTitle className="text-3xl font-black text-gray-900">Operasyonel Verimlilik Analizi</CardTitle>
                            <CardDescription className="text-gray-400 font-bold">Birim ve personel bazlı gerçek zamanlı iş yükü dağılımı</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                                <div className="space-y-10">
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-black text-gray-900 flex items-center gap-3">
                                            <div className="bg-orange-100 p-2 rounded-lg text-orange-600"><Briefcase className="w-4 h-4" /></div>
                                            İş Yükü Dağılımı
                                        </h4>
                                        <Badge variant="outline" className="font-bold text-[10px]">REAL-TIME</Badge>
                                    </div>
                                    <div className="space-y-8">
                                        {personeller.slice(0, 6).map((p, i) => (
                                            <div key={p.id} className="space-y-2 group cursor-pointer">
                                                <div className="flex justify-between items-end">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="w-8 h-8 grayscale group-hover:grayscale-0 transition-all">
                                                            <AvatarImage src={p.profil_foto_url} />
                                                            <AvatarFallback className="text-[10px]">{p.ad[0]}</AvatarFallback>
                                                        </Avatar>
                                                        <span className="text-xs font-black text-gray-700">{p.ad} {p.soyad}</span>
                                                    </div>
                                                    <span className="text-primary font-black text-sm">{[14, 9, 7, 11, 8, 12][i % 6]} İş Birimi</span>
                                                </div>
                                                <div className="h-4 bg-gray-50 rounded-full overflow-hidden p-1 shadow-inner">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-primary/80 to-primary rounded-full transition-all duration-1000"
                                                        style={{ width: `${[85, 60, 45, 70, 55, 75][i % 6]}%` }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="bg-gray-50/50 rounded-[2.5rem] border-4 border-dashed border-gray-100 flex items-center justify-center p-12 relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <div className="text-center relative z-10 transition-transform group-hover:scale-110 duration-500">
                                        <div className="bg-white w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl rotate-6 text-primary">
                                            <LineChart className="w-12 h-12" />
                                        </div>
                                        <h3 className="font-black text-2xl text-gray-900 tracking-tighter">AI-Destekli Analitik</h3>
                                        <p className="text-xs text-gray-400 mt-3 font-bold uppercase tracking-widest leading-relaxed">
                                            Tahminleme modelleri ve verimlilik <br /> skorları için veri toplanıyor...
                                        </p>
                                        <div className="mt-8 flex justify-center gap-1">
                                            {[1, 2, 3].map(i => <div key={i} className="w-2 h-2 rounded-full bg-primary/30 animate-pulse" style={{ animationDelay: `${i * 200}ms` }} />)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

            </Tabs>

            {/* Gorev Detail Modal */}
            <Dialog open={!!selectedGorev} onOpenChange={(open) => !open && setSelectedGorev(null)}>
                <DialogContent className="sm:max-w-[700px] rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl">
                    {selectedGorev && (
                        <div className="flex flex-col">
                            {/* Header */}
                            <div className="bg-gray-900 p-8 text-white relative">
                                <div className="flex justify-between items-start mb-6">
                                    <Badge className="bg-primary text-white font-black px-4 py-1.5 rounded-full">{selectedGorev.durum}</Badge>
                                    <Button variant="ghost" className="text-white/50 hover:text-white" onClick={() => setSelectedGorev(null)}>
                                        <XCircle className="w-6 h-6" />
                                    </Button>
                                </div>
                                <h2 className="text-3xl font-black tracking-tight mb-2">{selectedGorev.baslik}</h2>
                                <p className="text-white/50 text-sm font-medium leading-relaxed">{selectedGorev.aciklama}</p>
                            </div>

                            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 bg-white">
                                {/* Left Side: Timeline Feed */}
                                <div className="space-y-6">
                                    <h4 className="font-black text-gray-900 flex items-center gap-2 border-b pb-2">
                                        <MessageSquare className="w-4 h-4" /> Geri Bildirim Akışı
                                    </h4>
                                    <div className="max-h-[300px] overflow-y-auto pr-4 space-y-4 custom-scrollbar">
                                        {selectedGorev.guncellemeler.map((u, i) => (
                                            <div key={i} className="bg-gray-50 p-4 rounded-2xl relative">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="text-xs font-black text-primary">{u.personel.ad} {u.personel.soyad}</span>
                                                    <span className="text-[10px] text-gray-400">{new Date(u.created_at).toLocaleString('tr-TR')}</span>
                                                </div>
                                                <p className="text-xs text-gray-600 font-medium">{u.mesaj}</p>
                                                {u.gorsel_url && (
                                                    <img src={u.gorsel_url} alt="Ek" className="mt-3 rounded-xl w-full h-32 object-cover border" />
                                                )}
                                            </div>
                                        ))}
                                        {selectedGorev.guncellemeler.length === 0 && (
                                            <div className="text-center py-10 opacity-30">Henüz geri bildirim yok.</div>
                                        )}
                                    </div>
                                </div>

                                {/* Right Side: Update Form */}
                                <div className="space-y-6">
                                    <h4 className="font-black text-gray-900 flex items-center gap-2 border-b pb-2">
                                        <Settings className="w-4 h-4" /> Durum ve İlerleme
                                    </h4>
                                    <form onSubmit={handleGorevUpdate} className="space-y-4">
                                        <div className="space-y-1">
                                            <Label className="text-[10px] font-black uppercase text-gray-400">Görevi Güncelle</Label>
                                            <Select value={gorevUpdate.durum} onValueChange={(val) => setGorevUpdate({ ...gorevUpdate, durum: val })}>
                                                <SelectTrigger className="rounded-xl border-2 font-bold"><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="BEKLEYEN">BEKLEYEN</SelectItem>
                                                    <SelectItem value="DEVAM_EDEN">DEVAM EDEN</SelectItem>
                                                    <SelectItem value="TAMAMLANDI">TAMAMLANDI</SelectItem>
                                                    <SelectItem value="IPTAL">İPTAL EDİLDİ</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-[10px] font-black uppercase text-gray-400">Geri Bildirim Mesajı</Label>
                                            <Textarea
                                                className="rounded-xl border-2 min-h-[100px]"
                                                placeholder="İlerleme hakkında bilgi verin..."
                                                value={gorevUpdate.mesaj}
                                                onChange={(e) => setGorevUpdate({ ...gorevUpdate, mesaj: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-[10px] font-black uppercase text-gray-400">Görsel URL (Opsiyonel)</Label>
                                            <div className="flex gap-2">
                                                <Input
                                                    className="rounded-xl border-2"
                                                    placeholder="https://..."
                                                    value={gorevUpdate.gorsel_url}
                                                    onChange={(e) => setGorevUpdate({ ...gorevUpdate, gorsel_url: e.target.value })}
                                                />
                                                <Button type="button" variant="outline" size="icon" className="shrink-0 rounded-xl"><Camera className="w-4 h-4" /></Button>
                                            </div>
                                        </div>
                                        <Button type="submit" className="w-full bg-primary hover:opacity-90 h-12 rounded-xl font-black shadow-lg">GÜNCELLEMEYİ KAYDET</Button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
