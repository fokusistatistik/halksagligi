
import { useState } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface Duyuru {
    id: number;
    baslik: string;
    icerik: string;
    oncelik: 'NORMAL' | 'ACIL' | 'KRITIK';
    yayin_tarihi: string;
    yayinlayan: { ad: string; soyad: string; unvan: string };
    okundu: boolean;
}

export function AnnouncementSystem() {
    const [open, setOpen] = useState(false);
    const queryClient = useQueryClient();

    // Duyuruları çek
    const { data: duyurular = [] } = useQuery<Duyuru[]>({
        queryKey: ['duyurular'],
        queryFn: async () => {
            const res = await fetch('/api/duyuru?type=all');
            const json = await res.json();
            return json.success ? json.data : [];
        },
        refetchInterval: 60000 // 1 dakikada bir otomatik yenile (Polling)
    });

    // Okunmamış sayısı
    const unreadCount = duyurular.filter(d => !d.okundu).length;

    // Okundu işaretleme
    const markReadMutation = useMutation({
        mutationFn: async (id: number) => {
            await fetch(`/api/duyuru/${id}/okundu`, { method: 'POST' });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['duyurular'] });
        }
    });

    const handleMarkRead = (id: number, okundu: boolean) => {
        if (!okundu) {
            markReadMutation.mutate(id);
        }
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative text-gray-500 hover:text-gray-900">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-2 right-2 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse" />
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 md:w-96 p-0 mr-4" align="end">
                <div className="flex items-center justify-between p-4 border-b bg-gray-50/50">
                    <h4 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                        <Bell className="w-4 h-4 text-primary" />
                        Duyurular
                    </h4>
                    <span className="text-[10px] text-gray-400 font-mono">Son 20 Duyuru</span>
                </div>

                <div className="max-h-[400px] overflow-y-auto">
                    {duyurular.length === 0 ? (
                        <div className="py-8 text-center text-xs text-gray-400">
                            Henüz duyuru bulunmuyor.
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {duyurular.map((duyuru) => (
                                <div
                                    key={duyuru.id}
                                    onClick={() => handleMarkRead(duyuru.id, duyuru.okundu)}
                                    className={`p-4 transition-colors cursor-pointer hover:bg-gray-50 ${!duyuru.okundu ? 'bg-blue-50/30' : ''}`}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <div className="flex items-center gap-2">
                                            {!duyuru.okundu && (
                                                <div className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
                                            )}
                                            <h5 className={`text-sm ${!duyuru.okundu ? 'font-bold text-gray-900' : 'font-medium text-gray-600'}`}>
                                                {duyuru.baslik}
                                            </h5>
                                        </div>
                                        {duyuru.oncelik !== 'NORMAL' && (
                                            <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${duyuru.oncelik === 'ACIL' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'
                                                }`}>
                                                {duyuru.oncelik}
                                            </span>
                                        )}
                                    </div>

                                    <p className="text-xs text-gray-600 leading-relaxed mb-2 line-clamp-3">
                                        {duyuru.icerik}
                                    </p>

                                    <div className="flex justify-between items-center text-[10px] text-gray-400">
                                        <span>{duyuru.yayinlayan?.ad} {duyuru.yayinlayan?.soyad}</span>
                                        <span className="font-mono">{new Date(duyuru.yayin_tarihi).toLocaleDateString('tr-TR')}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
}
