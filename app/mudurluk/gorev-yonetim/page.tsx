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
    Settings,
    Edit,
    X,
    AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
} from "@/components/ui/dialog"
import { Textarea } from '@/components/ui/textarea';

// --- Types ---
type Gorev = {
    id: string;
    kod?: string; // GÖREV-YY-000001
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
    kod?: string; // TAKVİM-YY-0000001
    baslik: string;
    aciklama?: string;
    tip: string;
    yer?: 'KURUM_ICI' | 'KURUM_DISI';
    durum?: string;
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
    const [createStep, setCreateStep] = useState(1);
    const [gorevler, setGorevler] = useState<Gorev[]>([]);
    const [etkinlikler, setEtkinlikler] = useState<Etkinlik[]>([]);
    const [personeller, setPersoneller] = useState<any[]>([]);

    // Filters
    const [filterSorumlu, setFilterSorumlu] = useState<string>('all');

    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
    const [viewDate, setViewDate] = useState(new Date());

    // Modals
    const [isGorevModalOpen, setIsGorevModalOpen] = useState(false);
    const [isEtkinlikModalOpen, setIsEtkinlikModalOpen] = useState(false);
    const [selectedGorev, setSelectedGorev] = useState<Gorev | null>(null);
    const [selectedEtkinlik, setSelectedEtkinlik] = useState<Etkinlik | null>(null);
    const [gorevUpdate, setGorevUpdate] = useState<any>({ durum: '', mesaj: '', tamamlanma_notu: '', gorsel_url: '', baslik: '', aciklama: '', oncelik: '', sorumlu_id: '', baslangic_tarihi: '', bitis_tarihi: '', destek_verenler: [] });

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
        yer: 'KURUM_ICI' as 'KURUM_ICI' | 'KURUM_DISI',
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
        if (selectedGorev) {
            setGorevUpdate({
                durum: selectedGorev.durum || 'DEVAM_EDEN', // Default to current status or DEVAM_EDEN
                mesaj: '',
                tamamlanma_notu: '',
                gorsel_url: '',
                // Pre-fill settings
                baslik: selectedGorev.baslik,
                aciklama: selectedGorev.aciklama,
                oncelik: selectedGorev.oncelik,
                sorumlu_id: selectedGorev.sorumlu.id.toString(),
                baslangic_tarihi: selectedGorev.baslangic_tarihi ? new Date(selectedGorev.baslangic_tarihi).toISOString().split('T')[0] : '',
                bitis_tarihi: selectedGorev.bitis_tarihi ? new Date(selectedGorev.bitis_tarihi).toISOString().split('T')[0] : '',
                destek_verenler: selectedGorev.destek_verenler?.map(p => p.id.toString()) || []
            });
        }
    }, [selectedGorev]);

    useEffect(() => {
        if (session) {
            fetchData();
            fetchPersoneller();
        }
    }, [session, filterSorumlu, viewDate]); // Refetch when filter or viewDate changes

    const fetchData = async () => {
        setLoading(true);
        try {
            // Build Gorev URL
            let gUrl = '/api/gorev';
            const params = new URLSearchParams();
            if (filterSorumlu && filterSorumlu !== 'all') params.append('userId', filterSorumlu);
            if (params.toString()) gUrl += `?${params.toString()}`;

            // Build Etkinlik URL (Monthly based on viewDate)
            const startOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
            const endOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0, 23, 59, 59);

            let eUrl = `/api/takvim?start=${startOfMonth.toISOString()}&end=${endOfMonth.toISOString()}`;
            if (filterSorumlu && filterSorumlu !== 'all') {
                eUrl += `&userId=${filterSorumlu}`;
            }

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

    const handleCreateStep1 = (e: React.FormEvent) => {
        e.preventDefault();
        setCreateStep(2);
    };

    const handleCreateConfirm = async () => {
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
                setCreateStep(1);
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
                setNewEtkinlik({ baslik: '', aciklama: '', tip: 'TOPLANTI', yer: 'KURUM_ICI', baslangic: '', bitis: '', personel_id: user?.id || '' });
                fetchData();
            } else {
                toast.error(data.error || 'Hata oluştu');
            }
        } catch (_error) {
            toast.error('Bağlantı hatası');
        }
    };

    const handleStatusSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedGorev) return;
        try {
            const payload = {
                durum: gorevUpdate.durum,
                mesaj: gorevUpdate.mesaj,
                tamamlanma_notu: gorevUpdate.tamamlanma_notu,
                gorsel_url: gorevUpdate.gorsel_url
            };
            const res = await fetch(`/api/gorev/${selectedGorev.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (data.success) {
                toast.success('Durum güncellendi');
                setGorevUpdate((prev: any) => ({ ...prev, mesaj: '', gorsel_url: '' }));
                if (data.data) {
                    // Update list locally to reflect changes immediately
                    setGorevler((prev) => prev.map((g) => (g.id === data.data.id ? data.data : g)));

                    // Eğer tamamlandı veya iptal ise modalı kapat
                    if (gorevUpdate.durum === 'TAMAMLANDI' || gorevUpdate.durum === 'IPTAL') {
                        setSelectedGorev(null);
                    } else {
                        setSelectedGorev(data.data);
                    }
                }
                fetchData();
            } else {
                toast.error(data.error || 'Hata oluştu');
            }
        } catch (_error) {
            toast.error('Bağlantı hatası');
        }
    };

    const handleSettingsSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedGorev) return;
        try {
            // Exclude status related fields, send only settings
            const payload = {
                baslik: gorevUpdate.baslik,
                aciklama: gorevUpdate.aciklama,
                oncelik: gorevUpdate.oncelik,
                sorumlu_id: gorevUpdate.sorumlu_id,
                baslangic_tarihi: gorevUpdate.baslangic_tarihi,
                bitis_tarihi: gorevUpdate.bitis_tarihi,
                destek_verenler: gorevUpdate.destek_verenler
            };
            const res = await fetch(`/api/gorev/${selectedGorev.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (data.success) {
                toast.success('Ayarlar kaydedildi');
                if (data.data) {
                    setSelectedGorev(data.data);
                    setGorevler(prev => prev.map(g => g.id === data.data.id ? data.data : g));
                }
                fetchData();
            } else {
                toast.error(data.error || 'Hata oluştu');
            }
        } catch (_error) {
            toast.error('Bağlantı hatası');
        }
    };

    // Helper to generate Google Calendar Link
    const getGoogleCalendarLink = (e: Etkinlik) => {
        const formatDate = (d: string) => {
            return new Date(d).toISOString().replace(/-|:|\.\d\d\d/g, "");
        };
        const start = formatDate(e.baslangic);
        const end = formatDate(e.bitis);
        const text = encodeURIComponent(e.baslik);
        const details = encodeURIComponent(`${e.kod || ''}\n${e.aciklama || ''}\nTip: ${e.tip}`);
        const location = encodeURIComponent(e.yer === 'KURUM_ICI' ? 'Kurum İçi' : 'Kurum Dışı');

        return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${start}/${end}&details=${details}&location=${location}`;
    };

    const handleCancelEtkinlik = async (etkinlikId: string) => {
        try {
            const res = await fetch(`/api/takvim/${etkinlikId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'cancel' })
            });
            const data = await res.json();
            if (data.success) {
                toast.success('Etkinlik iptal edildi');
                setSelectedEtkinlik(null);
                fetchData();
            } else {
                toast.error(data.error || 'Hata oluştu');
            }
        } catch (_error) {
            toast.error('Bağlantı hatası');
        }
    };

    // --- Helper Functions ---
    const getDaysRemaining = (date: string | Date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const target = new Date(date);
        target.setHours(0, 0, 0, 0);
        return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    };

    const getDateColorClass = (date: string | Date) => {
        const days = getDaysRemaining(date);
        if (days < 0) return 'bg-gray-800 text-white';
        if (days === 0) return 'bg-red-800 text-white';
        if (days <= 2) return 'bg-red-400 text-white';
        if (days <= 7) return 'bg-orange-300 text-gray-800';
        return 'bg-yellow-200 text-gray-800';
    };

    const getPriorityBadgeClass = (priority: string) => {
        switch (priority) {
            case 'ACIL': return 'border-red-500 text-red-700 bg-red-50';
            case 'YUKSEK': return 'border-orange-500 text-orange-700 bg-orange-50';
            case 'ORTA': return 'border-yellow-600 text-yellow-800 bg-yellow-50';
            case 'DUSUK': return 'border-green-600 text-green-800 bg-green-50';
            default: return 'border-blue-500 text-blue-700 bg-blue-50';
        }
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

                        {/* Dynamic Button based on Active Tab */}
                        {activeTab === 'list' && isManagement && (
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
                        {activeTab === 'calendar' && (
                            <Button
                                onClick={() => {
                                    setNewEtkinlik({ ...newEtkinlik, personel_id: user?.id || '' });
                                    setIsEtkinlikModalOpen(true);
                                }}
                                className="h-9 px-4 bg-purple-600 text-white hover:bg-purple-700 rounded-lg font-bold text-xs shadow-lg shadow-purple-600/20 transition-all hover:scale-105 active:scale-95"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                YENİ ETKİNLİK
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
                            // Geciken: Bitiş tarihi bugünden ÖNCE olan görevler (bugün dahil değil)
                            const today = new Date();
                            today.setHours(0, 0, 0, 0); // Bugünün başlangıcı
                            count = gorevler.filter(g => g.bitis_tarihi && new Date(g.bitis_tarihi) < today && g.durum !== 'TAMAMLANDI' && g.durum !== 'IPTAL').length;
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
                        {activeTab === 'list' && (
                            <>
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
                            </>
                        )}
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
                                        // Geciken: Bitiş tarihi bugünden ÖNCE
                                        const today = new Date();
                                        today.setHours(0, 0, 0, 0);
                                        const isLateA = a.bitis_tarihi && new Date(a.bitis_tarihi) < today && a.durum !== 'TAMAMLANDI';
                                        const isLateB = b.bitis_tarihi && new Date(b.bitis_tarihi) < today && b.durum !== 'TAMAMLANDI';
                                        if (isLateA !== isLateB) return isLateA ? -1 : 1;
                                        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                                    })
                                    .map(gorev => {
                                        const isLate = gorev.bitis_tarihi && new Date(gorev.bitis_tarihi) < new Date() && gorev.durum !== 'TAMAMLANDI' && gorev.durum !== 'IPTAL';
                                        const daysRemaining = gorev.bitis_tarihi ? getDaysRemaining(gorev.bitis_tarihi) : null;

                                        return (
                                            <Card key={gorev.id}
                                                className={`group hover:shadow-lg transition-all cursor-pointer overflow-hidden border-l-4 ${gorev.durum === 'IPTAL' ? 'border-l-gray-300 opacity-60 bg-gray-50' :
                                                    isLate ? 'border-l-red-500 bg-red-50/10' :
                                                        gorev.oncelik === 'ACIL' ? 'border-l-red-500 animate-pulse' :
                                                            gorev.oncelik === 'YUKSEK' ? 'border-l-orange-500' :
                                                                gorev.oncelik === 'ORTA' ? 'border-l-yellow-500' :
                                                                    gorev.oncelik === 'DUSUK' ? 'border-l-green-500' :
                                                                        'border-l-blue-500'
                                                    }`}
                                                onClick={() => {
                                                    setSelectedGorev(gorev);
                                                    setGorevUpdate({ durum: gorev.durum, mesaj: '', tamamlanma_notu: gorev.tamamlanma_notu || '', gorsel_url: '' });
                                                }}
                                            >
                                                <div className="p-4 space-y-3">
                                                    <div className="flex justify-between items-start">
                                                        <div className="flex flex-wrap gap-2 mb-1 flex-1">
                                                            <Badge variant="outline" className="text-[9px] uppercase font-bold tracking-wider">
                                                                {gorev.kategori}
                                                            </Badge>
                                                            <Badge variant="outline" className={`text-[9px] font-bold ${getPriorityBadgeClass(gorev.oncelik)}`}>
                                                                {gorev.oncelik}
                                                            </Badge>
                                                            {gorev.kod && <span className="text-[9px] font-mono text-gray-400 self-center">{gorev.kod}</span>}
                                                            {isLate && <Badge className="bg-red-100 text-red-700 text-[9px] font-bold">GECİKTİ</Badge>}
                                                            {gorev.durum === 'IPTAL' && <Badge className="bg-gray-200 text-gray-700 text-[9px] font-bold">İPTAL EDİLDİ</Badge>}
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            {isManagement && gorev.durum !== 'TAMAMLANDI' && gorev.durum !== 'IPTAL' && (
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setSelectedGorev(gorev);
                                                                        setGorevUpdate({ durum: gorev.durum, mesaj: '', tamamlanma_notu: gorev.tamamlanma_notu || '', gorsel_url: '' });
                                                                    }}
                                                                    className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
                                                                    title="Görevi Düzenle"
                                                                >
                                                                    <Edit className="w-3.5 h-3.5 text-gray-500" />
                                                                </button>
                                                            )}
                                                            <div className="text-[10px] text-gray-400 font-mono">
                                                                {new Date(gorev.created_at).toLocaleDateString('tr-TR')}
                                                            </div>
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
                                                    <div className={`px-4 py-2 text-[10px] font-bold flex items-center justify-between ${getDateColorClass(gorev.bitis_tarihi)}`}>
                                                        <div className="flex items-center gap-1">
                                                            <Clock className="w-3 h-3" />
                                                            {new Date(gorev.bitis_tarihi).toLocaleDateString('tr-TR')}
                                                        </div>
                                                        {daysRemaining !== null && (
                                                            <span className="text-[9px] opacity-90">
                                                                {daysRemaining < 0 ? `${Math.abs(daysRemaining)} gün gecikti` :
                                                                    daysRemaining === 0 ? 'Bugün' :
                                                                        `${daysRemaining} gün kaldı`}
                                                            </span>
                                                        )}
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
                            <CardHeader className="py-4 px-6 border-b shrink-0">
                                <CardTitle className="text-lg font-black tracking-tight flex items-center gap-2">
                                    <CalendarIcon className="w-5 h-5 text-primary" />
                                    Takvim & Organizasyon
                                </CardTitle>
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

                                                // Find Events
                                                const dayEvents = etkinlikler.filter(e => {
                                                    const eStart = new Date(e.baslangic);
                                                    const current = new Date(date);
                                                    return eStart.getDate() === current.getDate() &&
                                                        eStart.getMonth() === current.getMonth() &&
                                                        eStart.getFullYear() === current.getFullYear();
                                                });

                                                const totalCount = dayTasks.length + dayEvents.length;
                                                const displayLimit = 3;

                                                days.push(
                                                    <div
                                                        key={d}
                                                        onClick={() => setSelectedDate(date)}
                                                        className={`p-2 rounded-xl border text-xs relative cursor-pointer transition-all hover:shadow-md flex flex-col gap-1 min-h-[90px] ${isSelected ? 'ring-2 ring-primary border-primary bg-primary/5' : 'border-gray-100 bg-white'
                                                            } ${isToday ? 'bg-blue-50/50' : ''}`}
                                                    >
                                                        <div className={`font-bold flex justify-between items-start ${isToday ? 'text-primary' : 'text-gray-700'}`}>
                                                            <span>{d}</span>
                                                            {totalCount > 0 && <span className="text-[9px] bg-gray-900 text-white px-1 rounded-full">{totalCount}</span>}
                                                        </div>
                                                        <div className="flex flex-col gap-1 overflow-hidden mt-1">
                                                            {/* Render Events First (Purple) */}
                                                            {dayEvents.slice(0, displayLimit).map(e => (
                                                                <div
                                                                    key={e.id}
                                                                    onClick={(evt) => { evt.stopPropagation(); setSelectedEtkinlik(e); }}
                                                                    className="h-1.5 rounded-full w-full bg-purple-500 cursor-pointer hover:bg-purple-600"
                                                                    title={`Etkinlik: ${e.baslik}`}
                                                                />
                                                            ))}

                                                            {/* Render Tasks (Colored by Priority) */}
                                                            {dayTasks.slice(0, Math.max(0, displayLimit - dayEvents.length)).map(t => (
                                                                <div key={t.id} className={`h-1.5 rounded-full w-full ${t.oncelik === 'ACIL' ? 'bg-red-500' :
                                                                    t.oncelik === 'YUKSEK' ? 'bg-orange-500' : 'bg-blue-500'
                                                                    }`} title={`Görev: ${t.baslik}`} />
                                                            ))}

                                                            {totalCount > displayLimit && (
                                                                <div className="text-[8px] text-center text-gray-400">+{totalCount - displayLimit} daha</div>
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
                                    {/* Events Section */}
                                    <div className="space-y-2">
                                        <h4 className="text-xs font-bold text-purple-700 uppercase tracking-wider flex items-center gap-2 border-b border-purple-100 pb-1 mb-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                                            Ajanda / Etkinlikler
                                        </h4>
                                        {etkinlikler
                                            .filter(e => {
                                                if (!selectedDate) return false;
                                                const sDate = new Date(selectedDate);
                                                const eStart = new Date(e.baslangic);
                                                return eStart.getDate() === sDate.getDate() &&
                                                    eStart.getMonth() === sDate.getMonth() &&
                                                    eStart.getFullYear() === sDate.getFullYear();
                                            })
                                            .sort((a, b) => new Date(a.baslangic).getTime() - new Date(b.baslangic).getTime())
                                            .map(e => (
                                                <div
                                                    key={e.id}
                                                    onClick={() => setSelectedEtkinlik(e)}
                                                    className="p-3 rounded-xl bg-purple-50/50 border border-purple-100 hover:border-purple-200 transition-all group cursor-pointer"
                                                >
                                                    <div className="flex justify-between items-start mb-1">
                                                        <h5 className="font-bold text-gray-900 text-xs line-clamp-1 group-hover:text-purple-700 transition-colors">{e.baslik}</h5>
                                                        <span className="text-[10px] font-mono font-bold text-purple-600 bg-purple-100 px-1.5 py-0.5 rounded">
                                                            {new Date(e.baslangic).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant="outline" className="text-[9px] h-4 px-1 border-purple-200 text-purple-400 bg-white">{e.tip}</Badge>
                                                        {e.aciklama && <p className="text-[10px] text-gray-400 truncate flex-1">{e.aciklama}</p>}
                                                    </div>
                                                </div>
                                            ))
                                        }
                                        {etkinlikler.filter(e => selectedDate && new Date(e.baslangic).toDateString() === selectedDate.toDateString()).length === 0 && (
                                            <div className="text-center py-2 text-[10px] text-gray-300 italic border border-dashed rounded-lg">Etkinlik bulunmuyor</div>
                                        )}
                                    </div>

                                    {/* Tasks Section */}
                                    <div className="space-y-3">
                                        <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2 border-b pb-1">
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                            Görevler & İşler
                                        </h4>
                                        {gorevler
                                            .filter(g => ['DEVAM_EDEN', 'BEKLEYEN'].includes(g.durum))
                                            .sort((a, b) => {
                                                if (!a.bitis_tarihi) return 1;
                                                if (!b.bitis_tarihi) return -1;
                                                return new Date(a.bitis_tarihi).getTime() - new Date(b.bitis_tarihi).getTime();
                                            })
                                            .map(g => (
                                                <div key={g.id} className="flex items-center gap-3 p-2 rounded-lg bg-gray-50 border border-gray-100 text-left hover:bg-white hover:shadow-sm transition-all cursor-pointer" onClick={() => setSelectedGorev(g)}>
                                                    <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${g.oncelik === 'ACIL' ? 'bg-red-500' : 'bg-blue-500'}`} />
                                                    <div className="min-w-0 flex-1">
                                                        <div className="text-xs font-bold text-gray-900 truncate">{g.baslik}</div>
                                                        <div className="text-[10px] text-gray-500 flex justify-between">
                                                            <span>{g.bitis_tarihi ? new Date(g.bitis_tarihi).toLocaleDateString('tr-TR') : 'Süresiz'}</span>
                                                            <span className="uppercase text-[9px] font-bold opacity-60">{g.kategori}</span>
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
                    {createStep === 1 && (
                        <form onSubmit={handleCreateStep1}>
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
                                            {personeller.map(p => <SelectItem key={p.id} value={p.id.toString()}>{p.ad} {p.soyad} - {p.unvan}</SelectItem>)}
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
                                            {personeller.filter(p => p.id.toString() !== newGorev.sorumlu_id).map(p => (
                                                <SelectItem key={p.id} value={p.id.toString()} disabled={newGorev.destek_verenler.includes(p.id.toString())}>
                                                    {p.ad} {p.soyad}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {newGorev.destek_verenler.map(id => {
                                            const p = personeller.find(x => x.id.toString() === id);
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
                                                    value={(newGorev as any)[`gorsel_${i}`]}
                                                    onChange={(e) => setNewGorev({ ...newGorev, [`gorsel_${i}`]: e.target.value })}
                                                />
                                                <Input className="h-8 text-xs" placeholder="Görsel Notu"
                                                    value={(newGorev as any)[`gorsel_${i}_not`]}
                                                    onChange={(e) => setNewGorev({ ...newGorev, [`gorsel_${i}_not`]: e.target.value })}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit">İlerle</Button>
                            </DialogFooter>
                        </form>
                    )}

                    {createStep === 2 && (
                        <div className="space-y-6 py-4">
                            <DialogHeader className="sr-only">
                                <DialogTitle>Görevi Onayla</DialogTitle>
                            </DialogHeader>
                            <div className="flex items-center gap-3 p-4 bg-orange-50 border border-orange-200 rounded-xl text-orange-800">
                                <AlertTriangle className="w-8 h-8 shrink-0" />
                                <div>
                                    <h4 className="font-bold text-lg">Görevi Onayla</h4>
                                    <p className="text-sm">Lütfen aşağıdaki bilgileri kontrol edip onaylayın. Görev ilgili personele atanacaktır.</p>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-6 rounded-xl border space-y-4 text-sm">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <div className="text-xs font-bold text-gray-500 uppercase">Görev Başlığı</div>
                                        <div className="font-bold text-lg text-gray-900">{newGorev.baslik}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold text-gray-500 uppercase">Kategori & Öncelik</div>
                                        <div className="flex gap-2 mt-1">
                                            <Badge variant="outline">{newGorev.kategori}</Badge>
                                            <Badge>{newGorev.oncelik}</Badge>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-dashed border-gray-300">
                                    <div>
                                        <div className="text-xs font-bold text-gray-500 uppercase">Sorumlu Personel</div>
                                        <div className="font-bold">
                                            {personeller.find(p => p.id.toString() === newGorev.sorumlu_id)?.ad} {personeller.find(p => p.id.toString() === newGorev.sorumlu_id)?.soyad}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold text-gray-500 uppercase">Zamanlama</div>
                                        <div>
                                            {new Date(newGorev.baslangic_tarihi).toLocaleDateString()} - {newGorev.bitis_tarihi ? new Date(newGorev.bitis_tarihi).toLocaleDateString() : 'Süresiz'}
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-dashed border-gray-300">
                                    <div className="text-xs font-bold text-gray-500 uppercase mb-1">Açıklama</div>
                                    <div className="bg-white p-3 rounded border text-gray-700 leading-relaxed font-medium">
                                        {newGorev.aciklama}
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <Button variant="outline" onClick={() => setCreateStep(1)} className="h-12 px-6">Geri Dön & Düzenle</Button>
                                <Button onClick={handleCreateConfirm} className="bg-green-600 hover:bg-green-700 h-12 px-8 font-bold text-base shadow-lg hover:shadow-xl transition-all">
                                    <CheckCircle2 className="w-5 h-5 mr-2" /> ONAYLA VE GÖREVİ ATA
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            <Dialog open={isEtkinlikModalOpen} onOpenChange={setIsEtkinlikModalOpen}>
                <DialogContent>
                    <form onSubmit={handleEtkinlikSubmit}>
                        <DialogHeader>
                            <DialogTitle>Yeni Etkinlik Oluştur</DialogTitle>
                            <DialogDescription>Kişisel takviminize yeni bir etkinlik ekleyin.</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="space-y-1">
                                <Label>Etkinlik Başlığı</Label>
                                <Input
                                    required
                                    minLength={5}
                                    maxLength={50}
                                    value={newEtkinlik.baslik}
                                    onChange={(e) => setNewEtkinlik({ ...newEtkinlik, baslik: e.target.value })}
                                    placeholder="En az 5, en fazla 50 karakter"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <Label>Etkinlik Tipi</Label>
                                    <Select value={newEtkinlik.tip} onValueChange={(val) => setNewEtkinlik({ ...newEtkinlik, tip: val })}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="TOPLANTI">Toplantı</SelectItem>
                                            <SelectItem value="EGITIM">Eğitim</SelectItem>
                                            <SelectItem value="ZIYARET">Ziyaret</SelectItem>
                                            <SelectItem value="STAND">Stand</SelectItem>
                                            <SelectItem value="TARAMA">Tarama</SelectItem>
                                            <SelectItem value="DENETIM">Denetim</SelectItem>
                                            <SelectItem value="IZIN">İzin</SelectItem>
                                            <SelectItem value="DIGER">Diğer</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1">
                                    <Label>Yer</Label>
                                    <div className="flex gap-4 pt-2">
                                        <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                                            <input
                                                type="radio"
                                                name="yer"
                                                checked={newEtkinlik.yer === 'KURUM_ICI'}
                                                onChange={() => setNewEtkinlik({ ...newEtkinlik, yer: 'KURUM_ICI' })}
                                            />
                                            Kurum İçi
                                        </label>
                                        <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                                            <input
                                                type="radio"
                                                name="yer"
                                                checked={newEtkinlik.yer === 'KURUM_DISI'}
                                                onChange={() => setNewEtkinlik({ ...newEtkinlik, yer: 'KURUM_DISI' })}
                                            />
                                            Kurum Dışı
                                        </label>
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <Label>Başlangıç</Label>
                                    <Input
                                        type="datetime-local"
                                        required
                                        min={new Date().toISOString().slice(0, 16)}
                                        value={newEtkinlik.baslangic}
                                        onChange={(e) => setNewEtkinlik({ ...newEtkinlik, baslangic: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label>Bitiş</Label>
                                    <Input
                                        type="datetime-local"
                                        required
                                        min={newEtkinlik.baslangic || new Date().toISOString().slice(0, 16)}
                                        value={newEtkinlik.bitis}
                                        onChange={(e) => setNewEtkinlik({ ...newEtkinlik, bitis: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <Label>Notlar (Opsiyonel)</Label>
                                <Textarea
                                    maxLength={1000}
                                    value={newEtkinlik.aciklama}
                                    onChange={(e) => setNewEtkinlik({ ...newEtkinlik, aciklama: e.target.value })}
                                    placeholder="En fazla 1000 karakter"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="submit">Oluştur</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Event Detail Modal */}
            <Dialog open={!!selectedEtkinlik} onOpenChange={(open) => !open && setSelectedEtkinlik(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex justify-between items-center">
                            <span>Etkinlik Detayı</span>
                            {selectedEtkinlik?.kod && <Badge variant="outline" className="font-mono text-xs">{selectedEtkinlik.kod}</Badge>}
                        </DialogTitle>
                        <DialogDescription className="sr-only">Etkinlik detaylarını görüntüle</DialogDescription>
                    </DialogHeader>
                    {selectedEtkinlik && (
                        <div className="space-y-4 py-4">
                            <h3 className="text-xl font-bold">{selectedEtkinlik.baslik}</h3>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <div className="font-semibold text-gray-500 text-xs mb-1">Zaman</div>
                                    <div className="text-sm">{new Date(selectedEtkinlik.baslangic).toLocaleString('tr-TR')}</div>
                                    <div className="text-gray-400 text-xs my-1">↓</div>
                                    <div className="text-sm">{new Date(selectedEtkinlik.bitis).toLocaleString('tr-TR')}</div>
                                </div>
                                <div className="space-y-2">
                                    <div>
                                        <div className="font-semibold text-gray-500 text-xs">Tip</div>
                                        <Badge className="mt-1">{selectedEtkinlik.tip}</Badge>
                                    </div>
                                    <div>
                                        <div className="font-semibold text-gray-500 text-xs">Yer</div>
                                        <div className="text-sm mt-1">{selectedEtkinlik.yer === 'KURUM_ICI' ? 'Kurum İçi' : 'Kurum Dışı'}</div>
                                    </div>
                                </div>
                            </div>
                            {selectedEtkinlik.aciklama && (
                                <div className="bg-gray-50 p-3 rounded-lg text-sm border">
                                    <div className="font-semibold text-gray-500 text-xs mb-1">Notlar</div>
                                    {selectedEtkinlik.aciklama}
                                </div>
                            )}

                            <div className="flex gap-2 pt-4 border-t">
                                <Button className="flex-1 bg-white text-gray-900 border hover:bg-gray-50" asChild>
                                    <a href={getGoogleCalendarLink(selectedEtkinlik)} target="_blank" rel="noopener noreferrer">
                                        <CalendarIcon className="w-4 h-4 mr-2" />
                                        Google Takvime Ekle
                                    </a>
                                </Button>
                                {selectedEtkinlik.personel_id === user?.id && (
                                    <Button
                                        className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                                        onClick={() => handleCancelEtkinlik(selectedEtkinlik.id)}
                                    >
                                        <XCircle className="w-4 h-4 mr-2" />
                                        Etkinliği İptal Et
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            <Dialog open={!!selectedGorev} onOpenChange={(open) => !open && setSelectedGorev(null)}>
                <DialogContent className="sm:max-w-[1000px] p-0 overflow-hidden max-h-[95vh] flex flex-col">
                    {selectedGorev && (
                        <>
                            <DialogHeader className="sr-only">
                                <DialogTitle>Görev Detayı: {selectedGorev.baslik}</DialogTitle>
                                <DialogDescription>Görev detayları ve işlem menüsü</DialogDescription>
                            </DialogHeader>
                            {/* Header */}
                            <div className="bg-gray-900 text-white p-3 shrink-0 relative">
                                <div className="absolute top-2 right-2 z-50">
                                    <button
                                        onClick={() => setSelectedGorev(null)}
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
                                                {selectedGorev.kategori}
                                            </Badge>
                                            <Badge className={`text-[9px] font-bold ${selectedGorev.oncelik === 'ACIL' ? 'bg-red-500 hover:bg-red-600' :
                                                selectedGorev.oncelik === 'YUKSEK' ? 'bg-orange-500 hover:bg-orange-600' :
                                                    'bg-blue-500 hover:bg-blue-600'
                                                } `}>
                                                {selectedGorev.oncelik}
                                            </Badge>
                                            <Badge variant="secondary" className="text-[9px] bg-white/10 text-white hover:bg-white/20">
                                                {selectedGorev.durum}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-3 text-[9px] text-gray-400">
                                            <span>📅 {new Date(selectedGorev.baslangic_tarihi || selectedGorev.created_at).toLocaleDateString('tr-TR')}</span>
                                            <span>→</span>
                                            <span>{selectedGorev.bitis_tarihi ? new Date(selectedGorev.bitis_tarihi).toLocaleDateString('tr-TR') : 'Süresiz'}</span>
                                        </div>
                                    </div>
                                    <h2 className="text-base font-black tracking-tight leading-tight">{selectedGorev.baslik}</h2>
                                    <p className="text-[11px] text-gray-400 font-medium leading-snug">
                                        {selectedGorev.aciklama}
                                    </p>
                                    <div className="flex items-center gap-3 pt-2 border-t border-white/10">
                                        <div className="flex items-center gap-2">
                                            <Avatar className="w-6 h-6 border-2 border-gray-800">
                                                <AvatarImage src={selectedGorev.sorumlu?.profil_foto_url} />
                                                <AvatarFallback className="text-[10px] bg-gray-700">{selectedGorev.sorumlu?.ad?.[0]}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="text-[10px] font-bold text-gray-200">
                                                    {selectedGorev.sorumlu?.ad} {selectedGorev.sorumlu?.soyad}
                                                </div>
                                                <div className="text-[8px] text-gray-500 uppercase font-black">Sorumlu</div>
                                            </div>
                                        </div>
                                        {selectedGorev.destek_verenler && selectedGorev.destek_verenler.length > 0 && (
                                            <div className="flex items-center gap-2 ml-auto">
                                                <span className="text-[8px] text-gray-500 font-bold uppercase">Destek:</span>
                                                <div className="flex items-center gap-1">
                                                    {selectedGorev.destek_verenler?.map((p, idx) => (
                                                        <span key={p.id} className="text-[9px] text-gray-300 font-medium">
                                                            {p.ad} {p.soyad}{idx < (selectedGorev.destek_verenler?.length || 0) - 1 ? ',' : ''}
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
                                            {selectedGorev.guncellemeler.map((u, i) => (
                                                <div key={i} className="bg-gray-50 p-2 rounded-lg border text-sm">
                                                    <div className="flex justify-between mb-0.5">
                                                        <span className="font-bold text-[10px] text-primary">{u.personel.ad} {u.personel.soyad}</span>
                                                        <span className="text-[9px] text-gray-400">{new Date(u.created_at).toLocaleString('tr-TR', { dateStyle: 'short', timeStyle: 'short' })}</span>
                                                    </div>
                                                    <p className="text-gray-600 text-[10px] leading-snug">{u.mesaj}</p>
                                                </div>
                                            ))}
                                            {selectedGorev.guncellemeler.length === 0 && <div className="text-center text-[10px] text-gray-400 py-4">Henüz kayıt yok.</div>}
                                        </div>
                                    </div>

                                    {/* Durum Güncelleme */}
                                    <div className="bg-white p-4 rounded-xl border shadow-sm">
                                        <h4 className="font-black text-gray-900 border-b pb-2 mb-4 text-sm uppercase">DURUM GÜNCELLE</h4>
                                        <form onSubmit={handleStatusSubmit} className="space-y-3">
                                            <div className="space-y-1">
                                                <Label className="text-xs">Aksiyon</Label>
                                                <Select value={gorevUpdate.durum} onValueChange={(val) => setGorevUpdate({ ...gorevUpdate, durum: val })}>
                                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="DEVAM_EDEN">Devam Ediyor</SelectItem>
                                                        <SelectItem value="TAMAMLANDI">Tamamlandı</SelectItem>
                                                        {isManagement && <SelectItem value="IPTAL">İptal Et</SelectItem>}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            {(gorevUpdate.durum === 'TAMAMLANDI' || gorevUpdate.durum === 'IPTAL') && (
                                                <Textarea placeholder="Sonuç notu..." required value={gorevUpdate.tamamlanma_notu} onChange={e => setGorevUpdate({ ...gorevUpdate, tamamlanma_notu: e.target.value })} className="text-xs" />
                                            )}
                                            <Textarea placeholder="Süreç notu ekle..." value={gorevUpdate.mesaj} onChange={e => setGorevUpdate({ ...gorevUpdate, mesaj: e.target.value })} className="text-xs min-h-[80px]" />

                                            <div className="space-y-1">
                                                <Label className="text-xs">Görsel Kanıt (URL)</Label>
                                                <Input className="h-9 text-xs" placeholder="https://..." value={gorevUpdate.gorsel_url || ''} onChange={(e) => setGorevUpdate({ ...gorevUpdate, gorsel_url: e.target.value })} />
                                            </div>

                                            <Button type="submit" className="w-full bg-primary font-bold text-sm" disabled={!isManagement && selectedGorev.sorumlu.id !== user?.id && selectedGorev.olusturan.id !== user?.id}>DURUMU GÜNCELLE</Button>

                                            {(!isManagement && selectedGorev.sorumlu.id !== user?.id && selectedGorev.olusturan.id !== user?.id) && (
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
                                                        <Input value={gorevUpdate.baslik} onChange={e => setGorevUpdate({ ...gorevUpdate, baslik: e.target.value })} className="font-bold" />
                                                    </div>
                                                    <div className="col-span-2 space-y-1">
                                                        <Label>Açıklama</Label>
                                                        <Textarea value={gorevUpdate.aciklama} onChange={e => setGorevUpdate({ ...gorevUpdate, aciklama: e.target.value })} />
                                                    </div>
                                                </>
                                            )}

                                            <div className="space-y-1">
                                                <Label>Öncelik</Label>
                                                <Select value={gorevUpdate.oncelik} onValueChange={(val: any) => setGorevUpdate({ ...gorevUpdate, oncelik: val })}>
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
                                                <Select value={gorevUpdate.sorumlu_id} onValueChange={(val) => setGorevUpdate({ ...gorevUpdate, sorumlu_id: val })}>
                                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                                    <SelectContent>
                                                        {personeller.map(p => <SelectItem key={p.id} value={p.id.toString()}>{p.ad} {p.soyad}</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-1">
                                                <Label>Başlangıç</Label>
                                                <Input type="date" value={gorevUpdate.baslangic_tarihi} onChange={e => setGorevUpdate({ ...gorevUpdate, baslangic_tarihi: e.target.value })} />
                                            </div>
                                            <div className="space-y-1">
                                                <Label>Bitiş</Label>
                                                <Input type="date" value={gorevUpdate.bitis_tarihi} onChange={e => setGorevUpdate({ ...gorevUpdate, bitis_tarihi: e.target.value })} min={gorevUpdate.baslangic_tarihi} />
                                            </div>

                                            <div className="col-span-full space-y-2 pt-2 border-t mt-2">
                                                <Label>Destek Personeli Ekle/Çıkar</Label>
                                                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                                                    <Select value="" onValueChange={(val) => {
                                                        const destekList = gorevUpdate.destek_verenler || [];
                                                        if (!destekList.includes(val)) setGorevUpdate({ ...gorevUpdate, destek_verenler: [...destekList, val] });
                                                        else setGorevUpdate({ ...gorevUpdate, destek_verenler: destekList.filter((x: string) => x !== val) });
                                                    }}>
                                                        <SelectTrigger className="w-[300px] h-9"><SelectValue placeholder="Personel Seç..." /></SelectTrigger>
                                                        <SelectContent>
                                                            {personeller.filter(p => p.id.toString() !== gorevUpdate.sorumlu_id).map(p => (
                                                                <SelectItem key={p.id} value={p.id.toString()}>{(gorevUpdate.destek_verenler || []).includes(p.id.toString()) ? '✓ ' : ''} {p.ad} {p.soyad}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <div className="flex flex-wrap gap-2">
                                                        {(gorevUpdate.destek_verenler || []).map((id: string) => {
                                                            const p = personeller.find(x => x.id.toString() === id);
                                                            if (!p) return null;
                                                            return (
                                                                <Badge key={id} variant="secondary" className="cursor-pointer hover:bg-red-100 flex items-center gap-1" onClick={() => setGorevUpdate((prev: any) => ({ ...prev, destek_verenler: (prev.destek_verenler || []).filter((x: string) => x !== id) }))}>
                                                                    {p.ad} {p.soyad} <XCircle className="w-3 h-3" />
                                                                </Badge>
                                                            )
                                                        })}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="col-span-full pt-4 flex justify-end">
                                                <Button type="submit" size="lg" className="bg-gray-900 text-white font-bold px-8 shadow-xl hover:bg-black">AYARLARI KAYDET</Button>
                                            </div>
                                        </form>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>

    );
}
