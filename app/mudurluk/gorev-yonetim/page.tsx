'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
    ClipboardList,
    Calendar as CalendarIcon,
    Activity,
    Plus,
    Clock,
    CheckCircle2,
    XCircle,
    Users,
    ChevronLeft,
    ChevronRight,
    Search,
    MessageSquare,
    AlertCircle,
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
    tamamlanma_tarihi?: string;
    tamamlayan_id?: string;
    tamamlanma_notu?: string;
    gorsel_1?: string;
    gorsel_1_not?: string;
    gorsel_2?: string;
    gorsel_2_not?: string;
    gorsel_3?: string;
    gorsel_3_not?: string;
    sorumlu: { id: string, ad: string, soyad: string, profil_foto_url?: string, unvan?: string };
    olusturan: { id: string, ad: string, soyad: string };
    destek_verenler?: { id: string, ad: string, soyad: string, profil_foto_url?: string }[];
    guncellemeler: any[];
    created_at: string;
    is_suresiz?: boolean;
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
    // --- State ---
    const { data: session } = useSession();
    const user = session?.user as any;
    const isManagement = user?.rol?.seviye >= 7;
    const isLevel9 = user?.rol?.seviye >= 9;

    const [activeTab, setActiveTab] = useState('list');
    const [subTab, setSubTab] = useState<'DEVAM_EDEN' | 'TAMAMLANDI'>('DEVAM_EDEN');
    const [gorevler, setGorevler] = useState<Gorev[]>([]);
    const [etkinlikler, setEtkinlikler] = useState<Etkinlik[]>([]);
    const [personeller, setPersoneller] = useState<any[]>([]);

    // Filters
    const [filterSorumlu, setFilterSorumlu] = useState<string>('all');
    const [dateRange, setDateRange] = useState<Date | undefined>(new Date());

    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
    const [viewDate, setViewDate] = useState(new Date());
    const [dayEvents, setDayEvents] = useState<any[]>([]);

    // Modals
    const [isGorevModalOpen, setIsGorevModalOpen] = useState(false);
    const [isEtkinlikModalOpen, setIsEtkinlikModalOpen] = useState(false);
    const [selectedGorev, setSelectedGorev] = useState<Gorev | null>(null);
    const [gorevUpdate, setGorevUpdate] = useState({ durum: '', mesaj: '', tamamlanma_notu: '', gorsel_url: '' });

    // Forms
    const [newGorev, setNewGorev] = useState({
        baslik: '',
        aciklama: '',
        sorumlu_id: '', // Will default to user.id in effect
        destek_verenler: [] as string[],
        oncelik: 'ORTA',
        kategori: 'DIGER',
        baslangic_tarihi: new Date().toISOString().split('T')[0],
        bitis_tarihi: '',
        is_suresiz: false,
        gorsel_1: '', gorsel_1_not: '',
        gorsel_2: '', gorsel_2_not: '',
        gorsel_3: '', gorsel_3_not: ''
    });

    const [newEtkinlik, setNewEtkinlik] = useState({
        baslik: '',
        aciklama: '',
        tip: 'TOPLANTI',
        baslangic: '',
        bitis: '',
        personel_id: ''
    });

    useEffect(() => {
        if (user?.id && !newGorev.sorumlu_id) {
            setNewGorev(prev => ({ ...prev, sorumlu_id: user.id }));
        }
    }, [user]);

    useEffect(() => {
        if (session) {
            fetchData();
            fetchPersoneller();
        }
    }, [session, filterSorumlu]); // Refetch when filter changes

    const fetchData = async () => {
        setLoading(true);
        try {
            // Build Gorev URL
            let gUrl = '/api/gorev';
            const params = new URLSearchParams();
            if (filterSorumlu && filterSorumlu !== 'all') params.append('userId', filterSorumlu);
            if (params.toString()) gUrl += `?${params.toString()}`;

            // Build Etkinlik URL (Daily)
            const today = selectedDate || new Date();
            const startOfDay = new Date(today);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(today);
            endOfDay.setHours(23, 59, 59, 999);
            const eUrl = `/api/takvim?start=${startOfDay.toISOString()}&end=${endOfDay.toISOString()}`;

            const [gRes, eRes] = await Promise.all([
                fetch(gUrl),
                fetch(eUrl)
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
            if (eData.success) {
                setEtkinlikler(eData.data);
            }
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
                setNewGorev({
                    baslik: '',
                    aciklama: '',
                    sorumlu_id: user?.id || '',
                    oncelik: 'ORTA',
                    kategori: 'DIGER',
                    baslangic_tarihi: new Date().toISOString().split('T')[0],
                    bitis_tarihi: '',
                    is_suresiz: false,
                    destek_verenler: [],
                    gorsel_1: '', gorsel_1_not: '',
                    gorsel_2: '', gorsel_2_not: '',
                    gorsel_3: '', gorsel_3_not: ''
                });
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
                setGorevUpdate({ mesaj: '', durum: '', gorsel_url: '', tamamlanma_notu: '' });
                fetchData();
            } else {
                toast.error(data.error || 'Hata oluştu');
            }
        } catch (_error) {
            toast.error('Bağlantı hatası');
        }
    };

    const handleDateChange = (days: number) => {
        const newDate = new Date(selectedDate || new Date());
        newDate.setDate(newDate.getDate() + days);
        setSelectedDate(newDate);
    };

    // --- Sub-Components ---

    return (
        <div className="min-h-screen bg-gray-50/50 pb-20">
            {/* Header */}
            <div className="bg-white border-b sticky top-0 z-30 shadow-sm/50 backdrop-blur-xl bg-white/80">
                <div className="max-w-[1600px] mx-auto px-4 md:px-6 h-16 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <div className="bg-primary/10 p-2 rounded-lg text-primary">
                            <ClipboardList className="w-5 h-5" />
                        </div>
                        <h1 className="text-lg font-black tracking-tight text-gray-900">Görev Yönetim</h1>
                    </div>

                    <div className="flex items-center gap-2">
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-9">
                            <TabsList className="bg-gray-100/50 h-9 p-0.5 border">
                                <TabsTrigger value="list" className="h-8 text-xs font-bold px-4 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                                    <MessageSquare className="w-3.5 h-3.5 mr-2" />
                                    Merkezi İş Havuzu
                                </TabsTrigger>
                                <TabsTrigger value="calendar" className="h-8 text-xs font-bold px-4 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                                    <CalendarIcon className="w-3.5 h-3.5 mr-2" />
                                    Takvim & Aktivite
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>

                        {isManagement && (
                            <Button
                                onClick={() => {
                                    setNewGorev({
                                        baslik: '',
                                        aciklama: '',
                                        sorumlu_id: user?.id || '',
                                        destek_verenler: [],
                                        oncelik: 'ORTA',
                                        kategori: 'DIGER',
                                        baslangic_tarihi: new Date().toISOString().split('T')[0],
                                        bitis_tarihi: '',
                                        is_suresiz: false,
                                        gorsel_1: '', gorsel_1_not: '',
                                        gorsel_2: '', gorsel_2_not: '',
                                        gorsel_3: '', gorsel_3_not: ''
                                    });
                                    setIsGorevModalOpen(true);
                                }}
                                className="h-9 px-4 bg-gray-900 text-white hover:bg-gray-800 rounded-lg font-bold text-xs shadow-lg shadow-gray-900/20 transition-all hover:scale-105 active:scale-95"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                YENİ GÖREV
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-6 space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {['TOPLAM GÖREV', 'DEVAM EDEN', 'TAMAMLANAN', 'GECİKEN'].map((label, i) => {
                        let count = 0;
                        let color = '';
                        let icon = null;

                        if (i === 0) {
                            count = gorevler.length;
                            color = 'text-blue-600 bg-blue-50 border-blue-100';
                            icon = <ClipboardList className="w-4 h-4" />;
                        } else if (i === 1) {
                            count = gorevler.filter(g => g.durum === 'DEVAM_EDEN' || g.durum === 'BEKLEYEN').length;
                            color = 'text-orange-600 bg-orange-50 border-orange-100';
                            icon = <Activity className="w-4 h-4" />;
                        } else if (i === 2) {
                            count = gorevler.filter(g => g.durum === 'TAMAMLANDI' || g.durum === 'IPTAL').length;
                            color = 'text-green-600 bg-green-50 border-green-100';
                            icon = <CheckCircle2 className="w-4 h-4" />;
                        } else {
                            count = gorevler.filter(g => g.bitis_tarihi && new Date(g.bitis_tarihi) < new Date() && g.durum !== 'TAMAMLANDI' && g.durum !== 'IPTAL').length;
                            color = 'text-red-600 bg-red-50 border-red-100';
                            icon = <AlertCircle className="w-4 h-4" />;
                        }

                        return (
                            <div key={label} className={`p-4 rounded-xl border ${color} flex items-center justify-between`}>
                                <div>
                                    <div className="text-[10px] font-black opacity-60 uppercase tracking-wider mb-1">{label}</div>
                                    <div className="text-2xl font-black tracking-tight leading-none">{count}</div>
                                </div>
                                <div className={`p-2 rounded-lg bg-white/50 backdrop-blur-sm`}>{icon}</div>
                            </div>
                        );
                    })}
                </div>

                {/* Filters Row */}
                <div className="flex items-center justify-between gap-4 bg-white p-2 rounded-xl border shadow-sm">
                    <div className="flex items-center gap-2">
                        <div className="bg-gray-100 p-2 rounded-lg">
                            <Search className="w-4 h-4 text-gray-500" />
                        </div>
                        {isLevel9 && (
                            <Select value={filterSorumlu} onValueChange={setFilterSorumlu}>
                                <SelectTrigger className="w-[200px] h-9 text-xs font-medium border-0 bg-transparent hover:bg-gray-50 rounded-lg transition-colors">
                                    <div className="flex items-center gap-2">
                                        <Users className="w-3.5 h-3.5 text-gray-400" />
                                        <span>{filterSorumlu === 'all' ? 'Tüm Sorumlular' : personeller.find(p => p.id === filterSorumlu)?.ad + ' ' + personeller.find(p => p.id === filterSorumlu)?.soyad}</span>
                                    </div>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tüm Sorumlular</SelectItem>
                                    {personeller.map(p => (
                                        <SelectItem key={p.id} value={p.id}>{p.ad} {p.soyad}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                        <div className="h-6 w-px bg-gray-200 mx-2" />
                        <div className="flex items-center gap-1 bg-gray-100/50 p-1 rounded-lg">
                            <button
                                onClick={() => setSubTab('DEVAM_EDEN')}
                                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${subTab === 'DEVAM_EDEN' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
                            >
                                Devam Edenler ({gorevler.filter(g => ['DEVAM_EDEN', 'BEKLEYEN'].includes(g.durum)).length})
                            </button>
                            <button
                                onClick={() => setSubTab('TAMAMLANDI')}
                                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${subTab === 'TAMAMLANDI' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
                            >
                                Tamamlananlar ({gorevler.filter(g => ['TAMAMLANDI', 'IPTAL'].includes(g.durum)).length})
                            </button>
                        </div>
                    </div>
                </div>

                {activeTab === 'list' && (
                    <div className="space-y-4">
                        {loading ? (
                            <div className="text-center py-20 text-gray-400">Yükleniyor...</div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {gorevler
                                    .filter(g => {
                                        if (subTab === 'DEVAM_EDEN') return ['DEVAM_EDEN', 'BEKLEYEN'].includes(g.durum);
                                        return ['TAMAMLANDI', 'IPTAL'].includes(g.durum);
                                    })
                                    .sort((a, b) => {
                                        const isLateA = a.bitis_tarihi && new Date(a.bitis_tarihi) < new Date() && a.durum !== 'TAMAMLANDI';
                                        const isLateB = b.bitis_tarihi && new Date(b.bitis_tarihi) < new Date() && b.durum !== 'TAMAMLANDI';
                                        if (isLateA && !isLateB) return -1;
                                        if (!isLateA && isLateB) return 1;
                                        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                                    })
                                    .map(gorev => {
                                        const isLate = gorev.bitis_tarihi && new Date(gorev.bitis_tarihi) < new Date() && gorev.durum !== 'TAMAMLANDI' && gorev.durum !== 'IPTAL';

                                        return (
                                            <Card key={gorev.id}
                                                className={`group hover:shadow-lg transition-all cursor-pointer overflow-hidden border-l-4 ${gorev.durum === 'IPTAL' ? 'border-l-gray-300 opacity-60 bg-gray-50' :
                                                    isLate ? 'border-l-red-500 bg-red-50/10' :
                                                        gorev.oncelik === 'ACIL' ? 'border-l-red-500' :
                                                            gorev.oncelik === 'YUKSEK' ? 'border-l-orange-500' :
                                                                'border-l-blue-500'
                                                    }`}
                                                onClick={() => {
                                                    setSelectedGorev(gorev);
                                                    setGorevUpdate({ durum: gorev.durum, mesaj: '', tamamlanma_notu: gorev.tamamlanma_notu || '', gorsel_url: '' });
                                                }}
                                            >
                                                <div className="p-4 space-y-3">
                                                    <div className="flex justify-between items-start">
                                                        <div className="flex gap-2 mb-1">
                                                            <Badge variant="outline" className="text-[9px] uppercase font-bold tracking-wider">
                                                                {gorev.kategori}
                                                            </Badge>
                                                            {isLate && <Badge className="bg-red-100 text-red-700 text-[9px] font-bold">GECİKTİ</Badge>}
                                                            {gorev.durum === 'IPTAL' && <Badge className="bg-gray-200 text-gray-700 text-[9px] font-bold">İPTAL EDİLDİ</Badge>}
                                                        </div>
                                                        <div className="text-[10px] text-gray-400 font-mono">
                                                            {new Date(gorev.created_at).toLocaleDateString('tr-TR')}
                                                        </div>
                                                    </div>

                                                    <h3 className="font-bold text-gray-900 leading-tight line-clamp-2">{gorev.baslik}</h3>

                                                    <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                                                        <Avatar className="w-6 h-6 border cursor-help" title={`Sorumlu: ${gorev.sorumlu.ad} ${gorev.sorumlu.soyad}`}>
                                                            <AvatarImage src={gorev.sorumlu.profil_foto_url} />
                                                            <AvatarFallback className="text-[9px] bg-gray-100">{gorev.sorumlu.ad[0]}</AvatarFallback>
                                                        </Avatar>
                                                        <div className="text-xs text-gray-500 truncate flex-1">
                                                            <span className="font-bold text-gray-700">{gorev.sorumlu.ad} {gorev.sorumlu.soyad}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                {gorev.bitis_tarihi && (
                                                    <div className={`px-4 py-2 text-[10px] font-bold flex items-center gap-1 ${isLate ? 'bg-red-100 text-red-700' : 'bg-gray-50 text-gray-500'}`}>
                                                        <Clock className="w-3 h-3" />
                                                        {new Date(gorev.bitis_tarihi).toLocaleDateString('tr-TR')}
                                                    </div>
                                                )}
                                                {!gorev.bitis_tarihi && (
                                                    <div className="px-4 py-2 text-[10px] font-bold bg-gray-50 text-gray-400 flex items-center gap-1">
                                                        <Clock className="w-3 h-3" /> Süresiz
                                                    </div>
                                                )}
                                            </Card>
                                        );
                                    })
                                }
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'calendar' && (
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-200px)]">
                        <Card className="lg:col-span-3 h-full flex flex-col overflow-hidden shadow-sm border-0 bg-white/50 backdrop-blur-sm">
                            <CardHeader className="py-4 px-6 border-b shrink-0 flex flex-row items-center justify-between">
                                <CardTitle className="text-lg font-black tracking-tight flex items-center gap-2">
                                    <CalendarIcon className="w-5 h-5 text-primary" />
                                    Takvim & Organizasyon
                                </CardTitle>
                                {isManagement && (
                                    <Button size="sm" variant="outline" className="h-8 text-xs font-bold" onClick={() => setIsEtkinlikModalOpen(true)}>
                                        <Plus className="w-3.5 h-3.5 mr-1.5" /> Etkinlik Ekle
                                    </Button>
                                )}
                            </CardHeader>
                            <CardContent className="p-0 flex-1 overflow-auto">
                                <div className="p-6 h-full flex flex-col">
                                    {/* Calendar Header */}
                                    <div className="flex items-center justify-between mb-4 shrink-0">
                                        <h3 className="font-bold text-lg text-gray-900 capitalize">
                                            {viewDate.toLocaleString('tr-TR', { month: 'long', year: 'numeric' })}
                                        </h3>
                                        <div className="flex gap-1">
                                            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => {
                                                const d = new Date(viewDate);
                                                d.setMonth(d.getMonth() - 1);
                                                setViewDate(d);
                                            }}>
                                                <ChevronLeft className="h-4 w-4" />
                                            </Button>
                                            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => {
                                                const d = new Date(viewDate);
                                                d.setMonth(d.getMonth() + 1);
                                                setViewDate(d);
                                            }}>
                                                <ChevronRight className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Grid Header */}
                                    <div className="grid grid-cols-7 mb-2 text-center shrink-0">
                                        {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map(day => (
                                            <div key={day} className="text-xs font-bold text-gray-400 uppercase tracking-wider">{day}</div>
                                        ))}
                                    </div>

                                    {/* Grid Body */}
                                    <div className="grid grid-cols-7 gap-2 flex-1 auto-rows-fr overflow-y-auto">
                                        {(() => {
                                            const year = viewDate.getFullYear();
                                            const month = viewDate.getMonth();
                                            const firstDay = new Date(year, month, 1).getDay(); // 0=Sun, 1=Mon
                                            const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1; // 0=Mon, 6=Sun
                                            const daysInMonth = new Date(year, month + 1, 0).getDate();

                                            const days = [];
                                            // Empty cells
                                            for (let i = 0; i < adjustedFirstDay; i++) {
                                                days.push(<div key={`empty-${i}`} className="bg-gray-50/30 rounded-lg" />);
                                            }
                                            // Days
                                            for (let d = 1; d <= daysInMonth; d++) {
                                                const date = new Date(year, month, d);
                                                const isToday = new Date().toDateString() === date.toDateString();
                                                const isSelected = selectedDate?.toDateString() === date.toDateString();

                                                // Find tasks
                                                const dayTasks = gorevler.filter(g => {
                                                    if (!g.baslangic_tarihi) return false;
                                                    const start = new Date(g.baslangic_tarihi);
                                                    start.setHours(0, 0, 0, 0);
                                                    const current = new Date(date);
                                                    current.setHours(0, 0, 0, 0);

                                                    if (g.is_suresiz) {
                                                        return current.getTime() >= start.getTime() && g.durum !== 'TAMAMLANDI' && g.durum !== 'IPTAL';
                                                    } else if (g.bitis_tarihi) {
                                                        const end = new Date(g.bitis_tarihi);
                                                        end.setHours(23, 59, 59, 999);
                                                        return current.getTime() >= start.getTime() && current.getTime() <= end.getTime();
                                                    } else {
                                                        return current.getTime() === start.getTime();
                                                    }
                                                });

                                                days.push(
                                                    <div
                                                        key={d}
                                                        onClick={() => setSelectedDate(date)}
                                                        className={`p-2 rounded-xl border text-xs relative cursor-pointer transition-all hover:shadow-md flex flex-col gap-1 min-h-[90px] ${isSelected ? 'ring-2 ring-primary border-primary bg-primary/5' : 'border-gray-100 bg-white'
                                                            } ${isToday ? 'bg-blue-50/50' : ''}`}
                                                    >
                                                        <div className={`font-bold flex justify-between items-start ${isToday ? 'text-primary' : 'text-gray-700'}`}>
                                                            <span>{d}</span>
                                                            {dayTasks.length > 0 && <span className="text-[9px] bg-gray-900 text-white px-1 rounded-full">{dayTasks.length}</span>}
                                                        </div>
                                                        <div className="flex flex-col gap-1 overflow-hidden mt-1">
                                                            {dayTasks.slice(0, 2).map(t => (
                                                                <div key={t.id} className={`h-1.5 rounded-full w-full ${t.oncelik === 'ACIL' ? 'bg-red-500' :
                                                                    t.oncelik === 'YUKSEK' ? 'bg-orange-500' : 'bg-blue-500'
                                                                    }`} title={t.baslik} />
                                                            ))}
                                                            {dayTasks.length > 2 && (
                                                                <div className="text-[8px] text-center text-gray-400">+{dayTasks.length - 2} daha</div>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            }
                                            return days;
                                        })()}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="h-full flex flex-col shadow-sm border-0 bg-white/50 backdrop-blur-sm">
                            <CardHeader className="py-4 px-4 border-b shrink-0">
                                <CardTitle className="text-sm font-black uppercase tracking-wider text-gray-500">Günlük Akış</CardTitle>
                                <p className="text-xs text-gray-400">{selectedDate?.toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                            </CardHeader>
                            <CardContent className="p-4 flex-1 overflow-y-auto">
                                <div className="space-y-6">
                                    <div className="space-y-3">
                                        <h4 className="text-xs font-bold text-gray-900 border-b pb-1">Bekleyen İşler</h4>
                                        {gorevler
                                            .filter(g => ['DEVAM_EDEN', 'BEKLEYEN'].includes(g.durum))
                                            .sort((a, b) => {
                                                if (!a.bitis_tarihi) return 1;
                                                if (!b.bitis_tarihi) return -1;
                                                return new Date(a.bitis_tarihi).getTime() - new Date(b.bitis_tarihi).getTime();
                                            })
                                            .map(g => (
                                                <div key={g.id} className="flex items-center gap-3 p-2 rounded-lg bg-gray-50 border border-gray-100 text-left">
                                                    <div className={`w-2 h-2 rounded-full shrink-0 ${g.oncelik === 'ACIL' ? 'bg-red-500' : 'bg-blue-500'}`} />
                                                    <div className="min-w-0">
                                                        <div className="text-xs font-bold text-gray-900 truncate">{g.baslik}</div>
                                                        <div className="text-[10px] text-gray-500">
                                                            Bitiş: {g.bitis_tarihi ? new Date(g.bitis_tarihi).toLocaleDateString('tr-TR') : 'Süresiz'}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        }
                                        {gorevler.filter(g => ['DEVAM_EDEN', 'BEKLEYEN'].includes(g.durum)).length === 0 && (
                                            <div className="text-center py-4 text-xs text-gray-400">Bekleyen iş yok 🎉</div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>

            <Dialog open={isGorevModalOpen} onOpenChange={setIsGorevModalOpen}>
                <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                    <form onSubmit={handleGorevSubmit}>
                        <DialogHeader>
                            <DialogTitle>Yeni Görev Ata</DialogTitle>
                            <DialogDescription>Personel sorumluluğuna yeni bir iş süreci ekleyin.</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <Label htmlFor="baslik">Görev Başlığı <span className="text-red-500">*</span></Label>
                                    <Input id="baslik" required value={newGorev.baslik} onChange={(e) => setNewGorev({ ...newGorev, baslik: e.target.value })} />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="kategori">Kategori</Label>
                                    <Select value={newGorev.kategori} onValueChange={(val) => setNewGorev({ ...newGorev, kategori: val })}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="DENETIM">Denetim</SelectItem>
                                            <SelectItem value="EGITIM">Eğitim</SelectItem>
                                            <SelectItem value="TOPLANTI">Toplantı</SelectItem>
                                            <SelectItem value="PROJE">Proje</SelectItem>
                                            <SelectItem value="KONTROL">Kontrol</SelectItem>
                                            <SelectItem value="TARAMA">Tarama</SelectItem>
                                            <SelectItem value="STAND">Stand</SelectItem>
                                            <SelectItem value="ZIYARET">Ziyaret</SelectItem>
                                            <SelectItem value="DIGER">Diğer</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
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

                            <div className="space-y-1">
                                <Label>Destek Veren Personeller</Label>
                                <Select
                                    value={newGorev.destek_verenler.length > 0 ? newGorev.destek_verenler[0] : ''}
                                    onValueChange={(val) => {
                                        if (!newGorev.destek_verenler.includes(val)) {
                                            setNewGorev(prev => ({ ...prev, destek_verenler: [...prev.destek_verenler, val] }));
                                        }
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder={newGorev.destek_verenler.length > 0 ? `${newGorev.destek_verenler.length} Kişi Seçildi` : "Personel Ekle..."} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {personeller.filter(p => p.id !== newGorev.sorumlu_id).map(p => (
                                            <SelectItem key={p.id} value={p.id} disabled={newGorev.destek_verenler.includes(p.id)}>
                                                {p.ad} {p.soyad}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {newGorev.destek_verenler.map(id => {
                                        const p = personeller.find(x => x.id === id);
                                        return p ? (
                                            <Badge key={id} variant="secondary" className="flex items-center gap-1 cursor-pointer hover:bg-red-100 hover:text-red-700" onClick={() => {
                                                setNewGorev(prev => ({ ...prev, destek_verenler: prev.destek_verenler.filter(x => x !== id) }));
                                            }}>
                                                {p.ad} {p.soyad} <XCircle className="w-3 h-3" />
                                            </Badge>
                                        ) : null;
                                    })}
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
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
                                    <Label>Başlangıç Tarihi <span className="text-red-500">*</span></Label>
                                    <Input type="date" required value={newGorev.baslangic_tarihi} onChange={(e) => setNewGorev({ ...newGorev, baslangic_tarihi: e.target.value })} />
                                </div>
                                <div className="space-y-1">
                                    <div className="flex justify-between items-center">
                                        <Label>Bitiş Tarihi</Label>
                                        <label className="text-[10px] flex items-center gap-1 cursor-pointer">
                                            <input type="checkbox" checked={!newGorev.bitis_tarihi && newGorev.is_suresiz}
                                                onChange={(e) => {
                                                    if (e.target.checked) setNewGorev(prev => ({ ...prev, bitis_tarihi: '', is_suresiz: true }));
                                                    else setNewGorev(prev => ({ ...prev, is_suresiz: false }));
                                                }}
                                            /> Süresiz
                                        </label>
                                    </div>
                                    <Input type="date" value={newGorev.bitis_tarihi} disabled={newGorev.is_suresiz} min={newGorev.baslangic_tarihi}
                                        onChange={(e) => setNewGorev({ ...newGorev, bitis_tarihi: e.target.value })} />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <Label>Açıklama (En az 10 karakter) <span className="text-red-500">*</span></Label>
                                <Textarea minLength={10} required value={newGorev.aciklama} onChange={(e) => setNewGorev({ ...newGorev, aciklama: e.target.value })} />
                            </div>

                            <div className="space-y-4 border-t pt-4">
                                <Label className="text-xs uppercase font-bold text-gray-500">Ek Görseller ve Notlar</Label>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="space-y-2 p-2 bg-gray-50 rounded-lg">
                                            <Label className="text-[10px]">Görsel {i} URL</Label>
                                            <Input className="h-8 text-xs" placeholder="https://"
                                                value={(newGorev as any)[`gorsel_${i} `]}
                                                onChange={(e) => setNewGorev({ ...newGorev, [`gorsel_${i} `]: e.target.value })}
                                            />
                                            <Input className="h-8 text-xs" placeholder="Görsel Notu"
                                                value={(newGorev as any)[`gorsel_${i} _not`]}
                                                onChange={(e) => setNewGorev({ ...newGorev, [`gorsel_${i} _not`]: e.target.value })}
                                            />
                                        </div>
                                    ))}
                                </div>
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

            <Dialog open={!!selectedGorev} onOpenChange={(open) => !open && setSelectedGorev(null)}>
                <DialogContent className="sm:max-w-[900px] p-0 overflow-hidden max-h-[95vh] flex flex-col">
                    <DialogHeader className="hidden">
                        <DialogTitle>Görev Detayı</DialogTitle>
                    </DialogHeader>
                    {selectedGorev && (
                        <div className="flex flex-col h-full bg-gray-50/50">
                            {/* Header */}
                            <div className="bg-gray-900 text-white p-4 shrink-0">
                                <div className="flex justify-between items-start gap-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <Badge variant="outline" className="text-white border-white/20 text-[10px] uppercase font-bold tracking-wider rounded-md">
                                                {selectedGorev.kategori}
                                            </Badge>
                                            <Badge className={`text - [10px] font - bold ${selectedGorev.oncelik === 'ACIL' ? 'bg-red-500 hover:bg-red-600' :
                                                selectedGorev.oncelik === 'YUKSEK' ? 'bg-orange-500 hover:bg-orange-600' :
                                                    'bg-blue-500 hover:bg-blue-600'
                                                } `}>
                                                {selectedGorev.oncelik}
                                            </Badge>
                                            <Badge variant="secondary" className="text-[10px] bg-white/10 text-white hover:bg-white/20">
                                                {selectedGorev.durum}
                                            </Badge>
                                        </div>
                                        <h2 className="text-lg font-black tracking-tight leading-tight mb-2">{selectedGorev.baslik}</h2>
                                        <p className="text-xs text-gray-400 font-medium">
                                            {selectedGorev.aciklama}
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-end gap-2 text-right">
                                        <div className="text-[10px] text-gray-400 font-mono">
                                            {new Date(selectedGorev.created_at).toLocaleDateString('tr-TR')}
                                        </div>
                                        <div className="flex items-center gap-2 bg-white/5 p-1.5 rounded-lg border border-white/10">
                                            <div className="text-right">
                                                <div className="text-[10px] font-bold text-gray-200">
                                                    {selectedGorev.sorumlu?.ad} {selectedGorev.sorumlu?.soyad}
                                                </div>
                                                <div className="text-[9px] text-gray-500 uppercase font-black">Sorumlu</div>
                                            </div>
                                            <Avatar className="w-8 h-8 border-2 border-gray-800">
                                                <AvatarImage src={selectedGorev.sorumlu?.profil_foto_url} />
                                                <AvatarFallback className="text-xs bg-gray-700">{selectedGorev.sorumlu?.ad?.[0]}</AvatarFallback>
                                            </Avatar>
                                        </div>
                                    </div>
                                </div>
                                {selectedGorev.destek_verenler && selectedGorev.destek_verenler.length > 0 && (
                                    <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
                                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Destek Ekibi</span>
                                        <div className="flex -space-x-2">
                                            {selectedGorev.destek_verenler.map(p => (
                                                <Avatar key={p.id} className="w-6 h-6 border-2 border-gray-900">
                                                    <AvatarImage src={p.profil_foto_url} />
                                                    <AvatarFallback className="text-[10px] bg-gray-800 text-white">{p.ad[0]}</AvatarFallback>
                                                </Avatar>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Left Side: Timeline Feed & Images */}
                                <div className="space-y-6">
                                    {/* Images Section */}
                                    <div className="space-y-2">
                                        <h4 className="font-black text-gray-900 text-xs uppercase opacity-40">Görsel Kanıtlar & Ekler</h4>
                                        <div className="grid grid-cols-3 gap-2">
                                            {[1, 2, 3].map(i => {
                                                const url = (selectedGorev as any)[`gorsel_${i} `];
                                                const note = (selectedGorev as any)[`gorsel_${i} _not`];
                                                if (!url) return null;
                                                return (
                                                    <div key={i} className="group relative aspect-square bg-gray-100 rounded-lg overflow-hidden border">
                                                        <img src={url} alt={`Gorsel ${i} `} className="w-full h-full object-cover" />
                                                        {note && <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[9px] p-1 truncate">{note}</div>}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Timeline */}
                                    <h4 className="font-black text-gray-900 flex items-center gap-2 border-b pb-2 pt-2">
                                        <MessageSquare className="w-4 h-4" /> Süreç Günlüğü
                                    </h4>
                                    <div className="max-h-[250px] overflow-y-auto pr-2 space-y-3 custom-scrollbar text-sm">
                                        {selectedGorev.guncellemeler.map((u, i) => (
                                            <div key={i} className="bg-white p-3 rounded-lg relative border border-gray-100 shadow-sm">
                                                <div className="flex items-center justify-between mb-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[10px] font-black text-primary">{u.personel.ad} {u.personel.soyad}</span>
                                                    </div>
                                                    <span className="text-[9px] text-gray-400">{new Date(u.created_at).toLocaleString('tr-TR')}</span>
                                                </div>
                                                <p className="text-xs text-gray-600 leading-snug">{u.mesaj}</p>
                                                {u.gorsel_url && (
                                                    <img src={u.gorsel_url} alt="Ek" className="mt-2 rounded bg-gray-50 h-20 object-contain border" />
                                                )}
                                            </div>
                                        ))}
                                        {selectedGorev.guncellemeler.length === 0 && (
                                            <div className="text-center py-6 opacity-40 text-xs">Henüz işlem kaydı yok.</div>
                                        )}
                                    </div>
                                </div>

                                {/* Right Side: Update Form */}
                                <div className="space-y-4">
                                    <h4 className="font-black text-gray-900 flex items-center gap-2 border-b pb-2">
                                        <Settings className="w-4 h-4" /> Durum Yönetimi
                                    </h4>
                                    <form onSubmit={handleGorevUpdate} className="space-y-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                        <div className="space-y-1">
                                            <Label className="text-[10px] font-black uppercase text-gray-400">Aksiyon</Label>
                                            <Select
                                                value={gorevUpdate.durum}
                                                onValueChange={(val) => setGorevUpdate({ ...gorevUpdate, durum: val })}
                                                disabled={!isManagement && selectedGorev.sorumlu.id !== user?.id && selectedGorev.olusturan.id !== user?.id}
                                            >
                                                <SelectTrigger className="rounded-xl border-2 font-bold h-10"><SelectValue placeholder={selectedGorev.durum} /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="DEVAM_EDEN">Devam Et / İlerleme Kaydet</SelectItem>
                                                    <SelectItem value="TAMAMLANDI">Tamamlandı Olarak İşaretle</SelectItem>
                                                    {isManagement && <SelectItem value="IPTAL">Görevi İptal Et</SelectItem>}
                                                </SelectContent>
                                            </Select>
                                            {(!isManagement && selectedGorev.sorumlu.id !== user?.id && selectedGorev.olusturan.id !== user?.id) && (
                                                <p className="text-[9px] text-gray-400 italic mt-1">Durum güncelleme yetkiniz yok. Sadece not ekleyebilirsiniz.</p>
                                            )}
                                        </div>

                                        {(gorevUpdate.durum === 'TAMAMLANDI' || gorevUpdate.durum === 'IPTAL') && (
                                            <div className="space-y-1 animate-in fade-in">
                                                <Label className="text-[10px] font-black uppercase text-gray-400">Sonuç Notu (Zorunlu)</Label>
                                                <Textarea
                                                    required
                                                    className="rounded-xl border-2 min-h-[60px] border-primary/20 bg-primary/5 text-sm"
                                                    placeholder={gorevUpdate.durum === 'IPTAL' ? 'İptal nedenini belirtiniz...' : 'Tamamlama notu ekleyiniz...'}
                                                    value={gorevUpdate.tamamlanma_notu}
                                                    onChange={(e) => setGorevUpdate({ ...gorevUpdate, tamamlanma_notu: e.target.value })}
                                                />
                                            </div>
                                        )}

                                        <div className="space-y-1">
                                            <Label className="text-[10px] font-black uppercase text-gray-400">Süreç Notu / Geri Bildirim ekle</Label>
                                            <Textarea
                                                className="rounded-xl border-2 min-h-[80px] text-sm"
                                                placeholder="İlerleme detayı veya not..."
                                                value={gorevUpdate.mesaj}
                                                onChange={(e) => setGorevUpdate({ ...gorevUpdate, mesaj: e.target.value })}
                                            />
                                        </div>

                                        <div className="space-y-1">
                                            <Label className="text-[10px] font-black uppercase text-gray-400">Görsel Kanıt (URL)</Label>
                                            <Input
                                                className="h-8 text-xs rounded-lg"
                                                placeholder="https://..."
                                                value={gorevUpdate.gorsel_url || ''}
                                                onChange={(e) => setGorevUpdate({ ...gorevUpdate, gorsel_url: e.target.value })}
                                            />
                                        </div>

                                        <Button type="submit" className="w-full bg-primary hover:opacity-90 h-10 rounded-xl font-bold text-xs shadow-md">KAYDET</Button>
                                    </form>

                                    {selectedGorev.tamamlanma_tarihi && (
                                        <div className="p-4 bg-green-50 rounded-xl border border-green-100 mt-4">
                                            <div className="text-xs text-green-800 font-bold mb-1">Bu görev tamamlanmıştır.</div>
                                            <div className="text-[10px] text-green-600">
                                                Tarih: {new Date(selectedGorev.tamamlanma_tarihi).toLocaleString('tr-TR')}
                                                {selectedGorev.tamamlanma_notu && <br />}
                                                {selectedGorev.tamamlanma_notu && `Not: ${selectedGorev.tamamlanma_notu} `}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>

    );
}
