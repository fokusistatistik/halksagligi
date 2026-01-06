'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchGorevler, fetchEtkinlikler, fetchPersoneller, createGorev, createEtkinlik, cancelEtkinlik, updateEtkinlik } from './api';
import {
    ClipboardList,
    Calendar as CalendarIcon,
    Activity,
    Plus,
    Clock,
    CheckCircle2,
    XCircle,
    ChevronLeft,
    ChevronRight,
    AlertCircle,
    Edit,
    AlertTriangle,
    MessageSquare
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

import { TaskDetailModal } from './components/modals/task-detail-modal';
import { TaskFilters } from './components/task-filters';
import { Gorev, Etkinlik } from './types';

export default function GorevYonetimPage() {
    // --- State ---
    const { data: session } = useSession();
    const user = session?.user as any;
    const isManagement = user?.rol?.seviye >= 7;
    const isLevel9 = user?.rol?.seviye >= 9;

    const [activeTab, setActiveTab] = useState('list');
    const [subTab, setSubTab] = useState<'DEVAM_EDEN' | 'TAMAMLANDI'>('DEVAM_EDEN');
    const [createStep, setCreateStep] = useState(1);
    const [createEventStep, setCreateEventStep] = useState(1);
    const [createPeriodicStep, setCreatePeriodicStep] = useState(1);
    // Filters
    const [filterSorumlu, setFilterSorumlu] = useState<string>('all');
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
    const [viewDate, setViewDate] = useState(new Date());

    // Modals
    const [isGorevModalOpen, setIsGorevModalOpen] = useState(false);
    const [isEtkinlikModalOpen, setIsEtkinlikModalOpen] = useState(false);
    const [isPeriodicModalOpen, setIsPeriodicModalOpen] = useState(false);
    const [isEditingEtkinlik, setIsEditingEtkinlik] = useState(false);

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

    const [newPeriodicEtkinlik, setNewPeriodicEtkinlik] = useState({
        baslik: '',
        aciklama: '',
        tip: 'TOPLANTI',
        yer: 'KURUM_ICI' as 'KURUM_ICI' | 'KURUM_DISI',
        date: new Date().toISOString().split('T')[0],
        startTime: '09:00',
        endTime: '10:00',
        repeatType: 'HAFTALIK',
        repeatCount: 1,
        personel_id: ''
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

    const queryClient = useQueryClient();
    const [selectedGorevId, setSelectedGorevId] = useState<string | null>(null);
    const [selectedEtkinlikId, setSelectedEtkinlikId] = useState<string | null>(null);

    // Queries
    const { data: gorevler = [], isLoading: gorevLoading } = useQuery({
        queryKey: ['gorevler', filterSorumlu],
        queryFn: () => fetchGorevler(filterSorumlu),
    });

    const { data: etkinlikler = [], isLoading: etkinlikLoading } = useQuery({
        queryKey: ['etkinlikler', viewDate.toISOString(), filterSorumlu],
        queryFn: () => fetchEtkinlikler(viewDate, filterSorumlu),
    });

    const { data: personeller = [] } = useQuery({
        queryKey: ['personeller'],
        queryFn: fetchPersoneller
    });

    // Loading state for UI compatibility
    const loading = gorevLoading || etkinlikLoading;

    // Derived State
    const selectedGorev = gorevler.find(g => g.id === selectedGorevId) || null;
    const selectedEtkinlik = etkinlikler.find(e => e.id === selectedEtkinlikId) || null;

    // Bridge Wrappers (to maintain compatibility with existing JSX calls)
    const setSelectedGorev = (g: Gorev | null) => setSelectedGorevId(g ? g.id : null);
    const setSelectedEtkinlik = (e: Etkinlik | null) => setSelectedEtkinlikId(e ? e.id : null);

    // Mutations
    const createGorevMutation = useMutation({
        mutationFn: createGorev,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['gorevler'] });
            toast.success('Görev başarıyla oluşturuldu');
            setIsGorevModalOpen(false);
            setCreateStep(1);
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
        },
        onError: () => toast.error('Görev oluşturulamadı')
    });

    const createEtkinlikMutation = useMutation({
        mutationFn: createEtkinlik,
        onSuccess: () => {
            // Etkinlik tarihine git
            if (isPeriodicModalOpen && newPeriodicEtkinlik.date) {
                const eventDate = new Date(newPeriodicEtkinlik.date);
                setViewDate(eventDate);
                setSelectedDate(eventDate);
                setIsPeriodicModalOpen(false);
                setCreatePeriodicStep(1);
            } else if (newEtkinlik.baslangic) {
                const eventDate = new Date(newEtkinlik.baslangic);
                setViewDate(eventDate);
                setSelectedDate(eventDate);
            }

            queryClient.invalidateQueries({ queryKey: ['etkinlikler'] });
            toast.success('Etkinlik başarıyla oluşturuldu');
            setIsEtkinlikModalOpen(false);
            setCreateEventStep(1);

            setNewEtkinlik({
                baslik: '',
                aciklama: '',
                tip: 'TOPLANTI',
                yer: 'KURUM_ICI',
                baslangic: '',
                bitis: '',
                personel_id: ''
            });
        },
        onError: (err: any) => {
            toast.error(err.message || 'Etkinlik oluşturulamadı');
        }
    });

    const cancelEtkinlikMutation = useMutation({
        mutationFn: cancelEtkinlik,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['etkinlikler'] });
            toast.success('Etkinlik iptal edildi');
            setSelectedEtkinlikId(null);
        },
        onError: () => toast.error('İptal edilemedi')
    });

    const updateEtkinlikMutation = useMutation({
        mutationFn: updateEtkinlik,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['etkinlikler'] });
            toast.success('Etkinlik güncellendi');
            setIsEtkinlikModalOpen(false);
            setIsEditingEtkinlik(false);
            setSelectedEtkinlikId(null);
            setNewEtkinlik({
                baslik: '',
                aciklama: '',
                tip: 'TOPLANTI',
                yer: 'KURUM_ICI',
                baslangic: '',
                bitis: '',
                personel_id: ''
            });
        },
        onError: () => toast.error('Güncelleme başarısız')
    });



    useEffect(() => {
        if (user?.id && !newGorev.sorumlu_id) {
            setNewGorev(prev => ({ ...prev, sorumlu_id: user.id }));
        }
    }, [user]);

    useEffect(() => {
        if (personeller.length > 0 && !newGorev.sorumlu_id) {
            setNewGorev(prev => ({ ...prev, sorumlu_id: personeller[0].id.toString() }));
        }
    }, [personeller]);

    const handleCreateStep1 = (e: React.FormEvent) => {
        e.preventDefault();
        setCreateStep(2);
    };

    const handleCreateConfirm = () => {
        createGorevMutation.mutate(newGorev);
    };

    const handlePeriodicSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setCreatePeriodicStep(2);
    };

    const handlePeriodicConfirm = () => {
        const startDateTime = new Date(`${newPeriodicEtkinlik.date}T${newPeriodicEtkinlik.startTime}`);
        const endDateTime = new Date(`${newPeriodicEtkinlik.date}T${newPeriodicEtkinlik.endTime}`);

        createEtkinlikMutation.mutate({
            baslik: newPeriodicEtkinlik.baslik,
            aciklama: newPeriodicEtkinlik.aciklama,
            tip: newPeriodicEtkinlik.tip,
            yer: newPeriodicEtkinlik.yer,
            baslangic: startDateTime.toISOString(),
            bitis: endDateTime.toISOString(),
            personel_id: newPeriodicEtkinlik.personel_id,
            repeatCount: newPeriodicEtkinlik.repeatCount,
            repeatType: newPeriodicEtkinlik.repeatType
        });
        setCreatePeriodicStep(1); // Reset for next time
    };

    const handleEtkinlikSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEditingEtkinlik && selectedEtkinlikId) {
            updateEtkinlikMutation.mutate({ id: selectedEtkinlikId, payload: newEtkinlik });
        } else {
            setCreateEventStep(2);
        }
    };

    const handleEtkinlikConfirm = () => {
        createEtkinlikMutation.mutate(newEtkinlik);
    };

    const handleEditEtkinlik = (etkinlik: Etkinlik) => {
        setNewEtkinlik({
            baslik: etkinlik.baslik,
            aciklama: etkinlik.aciklama || '',
            tip: etkinlik.tip,
            yer: etkinlik.yer || 'KURUM_ICI',
            baslangic: new Date(etkinlik.baslangic).toISOString().slice(0, 16),
            bitis: new Date(etkinlik.bitis).toISOString().slice(0, 16),
            personel_id: etkinlik.personel_id
        });
        setIsEditingEtkinlik(true);
        setSelectedEtkinlikId(etkinlik.id);
        setIsEtkinlikModalOpen(true);
    };

    const handleTaskUpdate = (updatedTask: Gorev | null) => {
        if (!updatedTask) {
            setSelectedGorevId(null);
        }
        queryClient.invalidateQueries({ queryKey: ['gorevler'] });
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

    const handleCancelEtkinlik = (etkinlikId: string) => {
        if (confirm('Etkinliği iptal etmek istediğinize emin misiniz?')) {
            cancelEtkinlikMutation.mutate(etkinlikId);
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
                            <div className="flex gap-2">
                                <Button
                                    onClick={() => {
                                        setNewPeriodicEtkinlik({ ...newPeriodicEtkinlik, personel_id: user?.id || '' });
                                        setCreatePeriodicStep(1);
                                        setIsPeriodicModalOpen(true);
                                    }}
                                    className="h-9 px-4 bg-teal-600 text-white hover:bg-teal-700 rounded-lg font-bold text-xs shadow-lg shadow-teal-600/20 transition-all hover:scale-105 active:scale-95"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    PERİYODİK ETKİNLİK
                                </Button>
                                <Button
                                    onClick={() => {
                                        setNewEtkinlik({ ...newEtkinlik, personel_id: user?.id || '' });
                                        setIsEditingEtkinlik(false);
                                        setCreateEventStep(1);
                                        setIsEtkinlikModalOpen(true);
                                    }}
                                    className="h-9 px-4 bg-purple-600 text-white hover:bg-purple-700 rounded-lg font-bold text-xs shadow-lg shadow-purple-600/20 transition-all hover:scale-105 active:scale-95"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    YENİ ETKİNLİK
                                </Button>
                            </div>
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
                <TaskFilters
                    isLevel9={isLevel9}
                    filterSorumlu={filterSorumlu}
                    setFilterSorumlu={setFilterSorumlu}
                    personeller={personeller}
                    activeTab={activeTab}
                    subTab={subTab}
                    setSubTab={setSubTab}
                    gorevler={gorevler}
                />

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
                                                {gorev.durum === 'TAMAMLANDI' ? (
                                                    <div className="px-4 py-2 text-[10px] font-bold bg-green-100 text-green-700 flex items-center justify-between border-t border-green-200">
                                                        <div className="flex items-center gap-1">
                                                            <CheckCircle2 className="w-3 h-3" />
                                                            Tamamlandı
                                                        </div>
                                                        {gorev.tamamlanma_tarihi && (
                                                            <span className="opacity-90">
                                                                {new Date(gorev.tamamlanma_tarihi).toLocaleDateString('tr-TR')}
                                                            </span>
                                                        )}
                                                    </div>
                                                ) : gorev.durum === 'IPTAL' ? (
                                                    <div className="px-4 py-2 text-[10px] font-bold bg-gray-100 text-gray-500 flex items-center justify-between border-t border-gray-200">
                                                        <div className="flex items-center gap-1">
                                                            <XCircle className="w-3 h-3" />
                                                            İptal Edildi
                                                        </div>
                                                        {gorev.tamamlanma_tarihi && (
                                                            <span className="opacity-90">
                                                                {new Date(gorev.tamamlanma_tarihi).toLocaleDateString('tr-TR')}
                                                            </span>
                                                        )}
                                                    </div>
                                                ) : gorev.bitis_tarihi ? (
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
                                                ) : (
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
                                                const dayOfWeek = date.getDay();
                                                const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

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
                                                    const eventStart = new Date(e.baslangic);
                                                    eventStart.setHours(0, 0, 0, 0);
                                                    const eventEnd = new Date(e.bitis);
                                                    eventEnd.setHours(23, 59, 59, 999);

                                                    const current = new Date(date);
                                                    current.setHours(0, 0, 0, 0);

                                                    return current.getTime() >= eventStart.getTime() && current.getTime() <= eventEnd.getTime();
                                                });

                                                const totalCount = dayTasks.length + dayEvents.length;
                                                const displayLimit = 5;

                                                days.push(
                                                    <div
                                                        key={d}
                                                        onClick={() => setSelectedDate(date)}
                                                        className={`p-2 rounded-xl border text-xs relative cursor-pointer transition-all hover:shadow-md flex flex-col gap-1 min-h-[115px] ${isSelected ? 'ring-2 ring-primary border-primary bg-primary/5' : 'border-gray-100 bg-white'
                                                            } ${isToday ? 'bg-blue-50/50' : ''} ${isWeekend ? 'bg-gray-100/60' : ''}`}
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
                                                sDate.setHours(0, 0, 0, 0);

                                                const eventStart = new Date(e.baslangic);
                                                eventStart.setHours(0, 0, 0, 0);

                                                const eventEnd = new Date(e.bitis);
                                                eventEnd.setHours(23, 59, 59, 999);

                                                return sDate.getTime() >= eventStart.getTime() && sDate.getTime() <= eventEnd.getTime();
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
                                        {etkinlikler.filter(e => {
                                            if (!selectedDate) return false;
                                            const sDate = new Date(selectedDate);
                                            sDate.setHours(0, 0, 0, 0);
                                            const eventStart = new Date(e.baslangic);
                                            eventStart.setHours(0, 0, 0, 0);
                                            const eventEnd = new Date(e.bitis);
                                            eventEnd.setHours(23, 59, 59, 999);
                                            return sDate.getTime() >= eventStart.getTime() && sDate.getTime() <= eventEnd.getTime();
                                        }).length === 0 && (
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

            <Dialog open={isPeriodicModalOpen} onOpenChange={setIsPeriodicModalOpen}>
                <DialogContent>
                    {createPeriodicStep === 1 && (
                        <form onSubmit={handlePeriodicSubmit}> (etc...)
                            <DialogHeader>
                                <DialogTitle>Periyodik Etkinlik Oluştur</DialogTitle>
                                <DialogDescription>Belirli bir düzende tekrar eden etkinlik serisi oluşturun.</DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="space-y-1">
                                    <Label>Etkinlik Başlığı</Label>
                                    <Input
                                        required
                                        minLength={5}
                                        maxLength={50}
                                        value={newPeriodicEtkinlik.baslik}
                                        onChange={(e) => setNewPeriodicEtkinlik({ ...newPeriodicEtkinlik, baslik: e.target.value })}
                                        placeholder="En az 5, en fazla 50 karakter"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <Label>Etkinlik Tipi</Label>
                                        <Select value={newPeriodicEtkinlik.tip} onValueChange={(val) => setNewPeriodicEtkinlik({ ...newPeriodicEtkinlik, tip: val })}>
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
                                                    name="periodic_yer"
                                                    checked={newPeriodicEtkinlik.yer === 'KURUM_ICI'}
                                                    onChange={() => setNewPeriodicEtkinlik({ ...newPeriodicEtkinlik, yer: 'KURUM_ICI' })}
                                                />
                                                Kurum İçi
                                            </label>
                                            <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="periodic_yer"
                                                    checked={newPeriodicEtkinlik.yer === 'KURUM_DISI'}
                                                    onChange={() => setNewPeriodicEtkinlik({ ...newPeriodicEtkinlik, yer: 'KURUM_DISI' })}
                                                />
                                                Kurum Dışı
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <Label>Tarih (İlk Etkinlik)</Label>
                                    <Input
                                        type="date"
                                        required
                                        min={new Date().toISOString().split('T')[0]}
                                        value={newPeriodicEtkinlik.date}
                                        onChange={(e) => setNewPeriodicEtkinlik({ ...newPeriodicEtkinlik, date: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <Label>Başlangıç Saati</Label>
                                        <Input
                                            type="time"
                                            required
                                            value={newPeriodicEtkinlik.startTime}
                                            onChange={(e) => setNewPeriodicEtkinlik({ ...newPeriodicEtkinlik, startTime: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label>Bitiş Saati</Label>
                                        <Input
                                            type="time"
                                            required
                                            value={newPeriodicEtkinlik.endTime}
                                            onChange={(e) => setNewPeriodicEtkinlik({ ...newPeriodicEtkinlik, endTime: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 bg-teal-50 p-3 rounded-lg border border-teal-100">
                                    <div className="space-y-1">
                                        <Label className="text-teal-900">Tekrar Tipi</Label>
                                        <Select value={newPeriodicEtkinlik.repeatType} onValueChange={(val) => setNewPeriodicEtkinlik({ ...newPeriodicEtkinlik, repeatType: val })}>
                                            <SelectTrigger className="border-teal-200"><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="HAFTALIK">Haftalık</SelectItem>
                                                <SelectItem value="AYLIK">Aylık</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-teal-900">Tekrar Sayısı (Max 12)</Label>
                                        <Input
                                            type="number"
                                            min={2}
                                            max={12}
                                            required
                                            className="border-teal-200"
                                            value={newPeriodicEtkinlik.repeatCount}
                                            onChange={(e) => setNewPeriodicEtkinlik({ ...newPeriodicEtkinlik, repeatCount: parseInt(e.target.value) })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <Label>Notlar (Opsiyonel)</Label>
                                    <Textarea
                                        maxLength={1000}
                                        value={newPeriodicEtkinlik.aciklama}
                                        onChange={(e) => setNewPeriodicEtkinlik({ ...newPeriodicEtkinlik, aciklama: e.target.value })}
                                        placeholder="En fazla 1000 karakter"
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit" className="bg-teal-600 hover:bg-teal-700">İlerle</Button>
                            </DialogFooter>
                        </form>
                    )}
                    {createPeriodicStep === 2 && (
                        <div className="space-y-6 py-4">
                            <DialogHeader>
                                <DialogTitle>Onay: Periyodik Etkinlik</DialogTitle>
                                <DialogDescription>Etkinlik detaylarını kontrol edip onaylayın.</DialogDescription>
                            </DialogHeader>
                            <div className="bg-teal-50 p-6 rounded-xl border border-teal-200 space-y-4 text-sm">
                                <h3 className="font-bold text-lg text-teal-900">{newPeriodicEtkinlik.baslik}</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <span className="block text-xs font-bold text-teal-700 uppercase">Tip & Yer</span>
                                        <span>{newPeriodicEtkinlik.tip} - {newPeriodicEtkinlik.yer === 'KURUM_ICI' ? 'Kurum İçi' : 'Kurum Dışı'}</span>
                                    </div>
                                    <div>
                                        <span className="block text-xs font-bold text-teal-700 uppercase">Döngü</span>
                                        <span>{newPeriodicEtkinlik.repeatCount} Kez ({newPeriodicEtkinlik.repeatType})</span>
                                    </div>
                                    <div>
                                        <span className="block text-xs font-bold text-teal-700 uppercase">Zaman</span>
                                        <span>{newPeriodicEtkinlik.startTime} - {newPeriodicEtkinlik.endTime}</span>
                                    </div>
                                    <div>
                                        <span className="block text-xs font-bold text-teal-700 uppercase">Başlangıç</span>
                                        <span>{new Date(newPeriodicEtkinlik.date).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                {newPeriodicEtkinlik.aciklama && (
                                    <div className="pt-2 border-t border-teal-200/50">
                                        <span className="block text-xs font-bold text-teal-700 uppercase">Notlar</span>
                                        <p className="text-gray-700">{newPeriodicEtkinlik.aciklama}</p>
                                    </div>
                                )}
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <Button variant="outline" onClick={() => setCreatePeriodicStep(1)}>Geri Dön</Button>
                                <Button onClick={handlePeriodicConfirm} className="bg-teal-600 hover:bg-teal-700 font-bold">
                                    <CheckCircle2 className="w-4 h-4 mr-2" />
                                    ONAYLA VE OLUŞTUR
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            <Dialog open={isEtkinlikModalOpen} onOpenChange={setIsEtkinlikModalOpen}>
                <DialogContent>
                    {createEventStep === 1 && (
                        <form onSubmit={handleEtkinlikSubmit}>
                            <DialogHeader>
                                <DialogTitle>{isEditingEtkinlik ? 'Etkinliği Düzenle' : 'Yeni Etkinlik Oluştur'}</DialogTitle>
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
                                        <Label>Başlangıç {isEditingEtkinlik && <span className="text-red-500 text-[10px]">(Değiştirilemez)</span>}</Label>
                                        <Input
                                            type="datetime-local"
                                            required
                                            disabled={isEditingEtkinlik}
                                            min={new Date().toISOString().slice(0, 16)}
                                            value={newEtkinlik.baslangic}
                                            onChange={(e) => setNewEtkinlik({ ...newEtkinlik, baslangic: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label>Bitiş {isEditingEtkinlik && <span className="text-red-500 text-[10px]">(Değiştirilemez)</span>}</Label>
                                        <Input
                                            type="datetime-local"
                                            required
                                            disabled={isEditingEtkinlik}
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
                            <DialogFooter className="flex gap-2 justify-end">
                                {isEditingEtkinlik && (
                                    <Button type="button" variant="danger" onClick={() => {
                                        if (selectedEtkinlikId) {
                                            if (confirm("Etkinliği iptal etmek istediğinize emin misiniz?")) {
                                                cancelEtkinlikMutation.mutate(selectedEtkinlikId);
                                                setIsEtkinlikModalOpen(false);
                                            }
                                        }
                                    }}>
                                        Etkinliği İptal Et
                                    </Button>
                                )}
                                <Button type="submit">{isEditingEtkinlik ? 'Güncelle' : 'İlerle'}</Button>
                            </DialogFooter>
                        </form>
                    )}

                    {createEventStep === 2 && !isEditingEtkinlik && (
                        <div className="space-y-6 py-4">
                            <DialogHeader>
                                <DialogTitle>Onay: Yeni Etkinlik</DialogTitle>
                                <DialogDescription>Lütfen bilgileri kontrol edip onaylayın.</DialogDescription>
                            </DialogHeader>
                            <div className="bg-purple-50 p-6 rounded-xl border border-purple-200 space-y-4 text-sm">
                                <h3 className="font-bold text-lg text-purple-900">{newEtkinlik.baslik}</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <span className="block text-xs font-bold text-purple-700 uppercase">Tip & Yer</span>
                                        <span>{newEtkinlik.tip} - {newEtkinlik.yer === 'KURUM_ICI' ? 'Kurum İçi' : 'Kurum Dışı'}</span>
                                    </div>
                                    <div>
                                        <span className="block text-xs font-bold text-purple-700 uppercase">Zaman</span>
                                        <span className="text-xs">
                                            {new Date(newEtkinlik.baslangic).toLocaleString()}
                                            <br />
                                            {new Date(newEtkinlik.bitis).toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                                {newEtkinlik.aciklama && (
                                    <div className="pt-2 border-t border-purple-200/50">
                                        <span className="block text-xs font-bold text-purple-700 uppercase">Notlar</span>
                                        <p className="text-gray-700">{newEtkinlik.aciklama}</p>
                                    </div>
                                )}
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <Button variant="outline" onClick={() => setCreateEventStep(1)}>Geri Dön</Button>
                                <Button onClick={handleEtkinlikConfirm} className="bg-purple-600 hover:bg-purple-700 font-bold">
                                    <CheckCircle2 className="w-4 h-4 mr-2" />
                                    ONAYLA VE OLUŞTUR
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Event Detail Modal */}
            < Dialog open={!!selectedEtkinlik
            } onOpenChange={(open) => !open && setSelectedEtkinlik(null)}>
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
                                    <>
                                        <Button
                                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                                            onClick={() => {
                                                setIsEtkinlikModalOpen(false); // Close detail modal (auto handled by state but ensuring logic flow)
                                                handleEditEtkinlik(selectedEtkinlik);
                                            }}
                                        >
                                            <Edit className="w-4 h-4 mr-2" />
                                            Düzenle
                                        </Button>
                                        <Button
                                            className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                                            onClick={() => handleCancelEtkinlik(selectedEtkinlik.id)}
                                        >
                                            <XCircle className="w-4 h-4 mr-2" />
                                            İptal
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog >

            <TaskDetailModal
                task={selectedGorev}
                open={!!selectedGorev}
                onClose={() => setSelectedGorev(null)}
                onUpdate={handleTaskUpdate}
                user={user}
                personeller={personeller}
                isManagement={isManagement}
                isLevel9={isLevel9}
            />
        </div >

    );
}
