
'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, CheckCircle2, AlertCircle, Info, Calendar } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Duyuru {
    id: number;
    baslik: string;
    icerik: string;
    oncelik: 'NORMAL' | 'ACIL' | 'KRITIK';
    yayin_tarihi: string;
    yayinlayan: { ad: string; soyad: string; unvan: string };
    okundu: boolean;
    okunma_tarihi: string | null;
}

export default function DuyurularPage() {
    const queryClient = useQueryClient();
    const [filter, setFilter] = useState<'all' | 'unread'>('all');

    const { data: duyurular = [], isLoading } = useQuery<Duyuru[]>({
        queryKey: ['duyurular-timeline', filter],
        queryFn: async () => {
            const res = await fetch(`/api/duyuru?mode=user&type=${filter}`);
            const json = await res.json();
            return json.success ? json.data : [];
        }
    });

    const markReadMutation = useMutation({
        mutationFn: async (id: number) => {
            await fetch(`/api/duyuru/${id}/okundu`, { method: 'POST' });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['duyurular-timeline'] });
            queryClient.invalidateQueries({ queryKey: ['duyurular'] }); // Header'daki zili de güncelle
        }
    });

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'ACIL': return 'border-orange-500 bg-orange-50 text-orange-900';
            case 'KRITIK': return 'border-red-600 bg-red-50 text-red-900';
            default: return 'border-blue-200 bg-white text-gray-900';
        }
    };

    const getIcon = (priority: string) => {
        switch (priority) {
            case 'ACIL': return <AlertCircle className="w-5 h-5 text-orange-600" />;
            case 'KRITIK': return <Bell className="w-5 h-5 text-red-600" />;
            default: return <Info className="w-5 h-5 text-blue-500" />;
        }
    };

    return (
        <div className="container mx-auto py-8 max-w-4xl px-4">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg text-blue-700">
                        <Bell className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Duyurularım</h1>
                        <p className="text-sm text-gray-500">Kurumsal bildirim ve duyuru akışı</p>
                    </div>
                </div>

                <div className="flex gap-2">
                    <Button
                        variant={filter === 'all' ? 'default' : 'outline'}
                        onClick={() => setFilter('all')}
                        className="text-xs"
                    >
                        Tümü
                    </Button>
                    <Button
                        variant={filter === 'unread' ? 'default' : 'outline'}
                        onClick={() => setFilter('unread')}
                        className="text-xs"
                    >
                        Okunmamış
                    </Button>
                </div>
            </div>

            {isLoading ? (
                <div className="text-center py-20 text-gray-400 animate-pulse">Yükleniyor...</div>
            ) : duyurular.length === 0 ? (
                <div className="text-center py-20 border-2 border-dashed rounded-xl bg-gray-50">
                    <div className="mx-auto w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mb-3">
                        <Bell className="w-6 h-6 text-gray-400" />
                    </div>
                    <h3 className="font-bold text-gray-900">Hiç duyuru yok</h3>
                    <p className="text-sm text-gray-500 mt-1">Şu an için size iletilen yeni bir duyuru bulunmuyor.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {/* Timeline */}
                    <div className="absolute left-8 top-0 bottom-0 w-px bg-gray-200 -z-10 hidden md:block" />

                    {duyurular.map((duyuru) => (
                        <div key={duyuru.id} className={`group relative transition-all duration-300 hover:-translate-y-1`}>

                            {/* Card */}
                            <Card className={`border-l-4 shadow-sm overflow-hidden ${getPriorityColor(duyuru.oncelik)} ${!duyuru.okundu ? 'ring-2 ring-blue-400 ring-offset-2' : 'opacity-90 grayscale-[0.3]'}`}>
                                <CardHeader className="pb-2 flex flex-row items-start justify-between space-y-0 gap-4">
                                    <div className="flex items-start gap-3">
                                        <div className="mt-1 shrink-0">
                                            {getIcon(duyuru.oncelik)}
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg font-bold leading-tight">
                                                {duyuru.baslik}
                                            </CardTitle>
                                            <div className="flex items-center gap-2 mt-1.5 text-xs text-gray-500 font-medium">
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    {new Date(duyuru.yayin_tarihi).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                                <span>•</span>
                                                <span className="font-bold text-gray-700">
                                                    {duyuru.yayinlayan?.ad} {duyuru.yayinlayan?.soyad}
                                                </span>
                                                <span>•</span>
                                                <span className="opacity-75">{duyuru.yayinlayan?.unvan || 'Yönetici'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {duyuru.okundu ? (
                                        <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100 border-0">
                                            <CheckCircle2 className="w-3 h-3 mr-1" />
                                            Okundu
                                        </Badge>
                                    ) : (
                                        <Button
                                            size="sm"
                                            className="h-7 text-xs bg-blue-600 hover:bg-blue-700"
                                            onClick={() => markReadMutation.mutate(duyuru.id)}
                                            disabled={markReadMutation.isPending}
                                        >
                                            Okundu İşaretle
                                        </Button>
                                    )}
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                        {duyuru.icerik}
                                    </p>
                                    {duyuru.okunma_tarihi && (
                                        <div className="mt-3 pt-3 border-t border-gray-200/50 text-[10px] text-gray-400 text-right italic">
                                            Okunma: {new Date(duyuru.okunma_tarihi).toLocaleString('tr-TR')}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
