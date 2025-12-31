'use client';

import { Search, Users } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import { Gorev, Personel } from '../types';

interface TaskFiltersProps {
    isLevel9: boolean;
    filterSorumlu: string;
    setFilterSorumlu: (val: string) => void;
    personeller: Personel[];
    activeTab: string;
    subTab: string;
    setSubTab: (val: 'DEVAM_EDEN' | 'TAMAMLANDI') => void;
    gorevler: Gorev[];
}

export function TaskFilters({
    isLevel9,
    filterSorumlu,
    setFilterSorumlu,
    personeller,
    activeTab,
    subTab,
    setSubTab,
    gorevler
}: TaskFiltersProps) {
    return (
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
                                <span>{filterSorumlu === 'all' ? 'Tüm Sorumlular' : personeller.find(p => p.id.toString() === filterSorumlu)?.ad + ' ' + personeller.find(p => p.id.toString() === filterSorumlu)?.soyad}</span>
                            </div>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tüm Sorumlular</SelectItem>
                            {personeller.map(p => (
                                <SelectItem key={p.id} value={p.id.toString()}>{p.ad} {p.soyad}</SelectItem>
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
    );
}
