'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import { AlertCircle, CheckCircle2, Activity, Users } from 'lucide-react';

// Mock Data
const districtData = [
    { name: 'Başiskele', asm: 12, shm: 1, puan: 85 },
    { name: 'Çayırova', asm: 10, shm: 1, puan: 78 },
    { name: 'Darıca', asm: 15, shm: 2, puan: 92 },
    { name: 'Derince', asm: 14, shm: 1, puan: 88 },
    { name: 'Dilovası', asm: 6, shm: 0, puan: 72 },
    { name: 'Gebze', asm: 25, shm: 3, puan: 90 },
    { name: 'Gölcük', asm: 16, shm: 1, puan: 84 },
    { name: 'İzmit', asm: 30, shm: 4, puan: 95 },
    { name: 'Kandıra', asm: 8, shm: 0, puan: 80 },
    { name: 'Karamürsel', asm: 9, shm: 1, puan: 82 },
    { name: 'Kartepe', asm: 13, shm: 1, puan: 86 },
    { name: 'Körfez', asm: 18, shm: 2, puan: 89 },
];

const performansData = [
    { name: 'Tamamlanan', value: 450, color: '#10b981' },
    { name: 'Devam Eden', value: 120, color: '#f59e0b' },
    { name: 'Bekleyen', value: 80, color: '#ef4444' },
];

// Stylized Kocaeli Map Component (SVG)
const KocaeliMap = ({ selectedDistrict, onSelect }: { selectedDistrict: string, onSelect: (d: string) => void }) => {
    // Approximate relative positions for stylized bubbles
    const districts = [
        { id: 'kandira', name: 'Kandıra', x: 60, y: 20, r: 15 },
        { id: 'izmit', name: 'İzmit', x: 50, y: 50, r: 12 },
        { id: 'derince', name: 'Derince', x: 40, y: 52, r: 10 },
        { id: 'korfez', name: 'Körfez', x: 30, y: 55, r: 10 },
        { id: 'dilovasi', name: 'Dilovası', x: 22, y: 60, r: 8 },
        { id: 'gebze', name: 'Gebze', x: 15, y: 65, r: 12 },
        { id: 'cayirova', name: 'Çayırova', x: 8, y: 70, r: 8 },
        { id: 'darica', name: 'Darıca', x: 5, y: 80, r: 8 },
        { id: 'kartepe', name: 'Kartepe', x: 65, y: 55, r: 12 },
        { id: 'basiskele', name: 'Başiskele', x: 55, y: 65, r: 10 },
        { id: 'golcuk', name: 'Gölcük', x: 45, y: 70, r: 10 },
        { id: 'karamursel', name: 'Karamürsel', x: 35, y: 80, r: 10 },
    ];

    return (
        <div className="relative w-full aspect-video bg-blue-50 rounded-xl overflow-hidden border border-blue-100 shadow-inner">
            <div className="absolute top-2 left-2 bg-white/80 p-2 rounded text-xs font-semibold text-gray-500">
                Kocaeli İl Haritası (İnteraktif)
            </div>
            <svg viewBox="0 0 100 100" className="w-full h-full">
                {/* Connection Lines (schematic) */}
                <path d="M50,50 L60,20" stroke="#cbd5e1" strokeWidth="0.5" strokeDasharray="2" />
                <path d="M50,50 L40,52 L30,55 L22,60 L15,65 L8,70" stroke="#cbd5e1" strokeWidth="0.5" />

                {districts.map((d) => (
                    <g
                        key={d.id}
                        onClick={() => onSelect(d.name)}
                        className="cursor-pointer transition-all duration-300 hover:opacity-80"
                    >
                        <circle
                            cx={d.x}
                            cy={d.y}
                            r={d.r}
                            className={`
                transition-all duration-300
                ${selectedDistrict === d.name ? 'fill-blue-600 stroke-white stroke-2' : 'fill-white stroke-blue-200'}
              `}
                        />
                        <text
                            x={d.x}
                            y={d.y}
                            dy={0.3}
                            textAnchor="middle"
                            className={`
                text-[3px] font-bold pointer-events-none select-none
                ${selectedDistrict === d.name ? 'fill-white' : 'fill-gray-600'}
              `}
                        >
                            {d.name.substring(0, 3).toUpperCase()}
                        </text>
                    </g>
                ))}
            </svg>
            {selectedDistrict && selectedDistrict !== 'all' && (
                <div className="absolute bottom-4 right-4 bg-white p-3 rounded-lg shadow-lg border border-gray-100 max-w-xs">
                    <h4 className="font-bold text-gray-800">{selectedDistrict}</h4>
                    <div className="text-xs text-gray-600 mt-1">
                        <div className="flex justify-between gap-4">
                            <span>ASM Sayısı:</span>
                            <span className="font-semibold">{districtData.find(x => x.name === selectedDistrict)?.asm || 0}</span>
                        </div>
                        <div className="flex justify-between gap-4">
                            <span>SHM Sayısı:</span>
                            <span className="font-semibold">{districtData.find(x => x.name === selectedDistrict)?.shm || 0}</span>
                        </div>
                        <div className="flex justify-between gap-4 mt-2 pt-2 border-t">
                            <span>Performans:</span>
                            <span className="font-semibold text-green-600">%{districtData.find(x => x.name === selectedDistrict)?.puan || 0}</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default function DashboardOverview() {
    const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
    const [filterType, setFilterType] = useState('all');

    return (
        <div className="space-y-6">
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="flex-1">
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Yıl</label>
                    <Select defaultValue="2025">
                        <SelectTrigger>
                            <SelectValue placeholder="Yıl Seçin" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="2025">2025</SelectItem>
                            <SelectItem value="2024">2024</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex-1">
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Kurum Tipi</label>
                    <Select value={filterType} onValueChange={setFilterType}>
                        <SelectTrigger>
                            <SelectValue placeholder="Tümü" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tümü (ASM + SHM)</SelectItem>
                            <SelectItem value="asm">ASM</SelectItem>
                            <SelectItem value="shm">SHM</SelectItem>
                            <SelectItem value="ilce">İlçe Sağlık</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex-1">
                    <label className="text-xs font-medium text-gray-500 mb-1 block">İlçe Filtresi</label>
                    <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
                        <SelectTrigger>
                            <SelectValue placeholder="İlçe Seçin" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tümü</SelectItem>
                            {districtData.map(d => (
                                <SelectItem key={d.name} value={d.name}>{d.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Toplam Personel</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">1,248</div>
                        <p className="text-xs text-muted-foreground">+2.5% geçen aydan</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Aktif Görevler</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">45</div>
                        <p className="text-xs text-muted-foreground">12 tamamlanmak üzere</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Bekleyen Onaylar</CardTitle>
                        <AlertCircle className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">7</div>
                        <p className="text-xs text-muted-foreground">Acil müdahale gerekli</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Genel Performans</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">%92</div>
                        <p className="text-xs text-muted-foreground">+4% geçen yıldan</p>
                    </CardContent>
                </Card>
            </div>

            {/* Map and Charts Split */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Card className="h-[400px]">
                        <CardHeader>
                            <CardTitle>Coğrafi Dağılım</CardTitle>
                        </CardHeader>
                        <CardContent className="h-[320px] p-0 overflow-hidden">
                            <KocaeliMap selectedDistrict={selectedDistrict} onSelect={setSelectedDistrict} />
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card className="h-[400px]">
                        <CardHeader>
                            <CardTitle>Görev Durumu</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={performansData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {performansData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend verticalAlign="bottom" height={36} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>İlçelere Göre Kurum Dağılımı</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={districtData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="asm" stackId="a" fill="#3b82f6" name="ASM" />
                                <Bar dataKey="shm" stackId="a" fill="#e11d48" name="SHM" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
