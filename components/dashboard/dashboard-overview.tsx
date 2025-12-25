'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

// Real-time system data
// Redundant system health data removed


// Kocaeli Map Component with proper rendering
const KocaeliMap = ({ selectedDistrict, onSelect }: { selectedDistrict: string, onSelect: (d: string) => void }) => {
    const districts = [
        { id: 'kandira', name: 'Kandıra', x: 65, y: 15, r: 8 },
        { id: 'izmit', name: 'İzmit', x: 50, y: 45, r: 10 },
        { id: 'derince', name: 'Derince', x: 45, y: 50, r: 7 },
        { id: 'korfez', name: 'Körfez', x: 35, y: 52, r: 8 },
        { id: 'dilovasi', name: 'Dilovası', x: 25, y: 58, r: 6 },
        { id: 'gebze', name: 'Gebze', x: 18, y: 65, r: 10 },
        { id: 'cayirova', name: 'Çayırova', x: 12, y: 72, r: 7 },
        { id: 'darica', name: 'Darıca', x: 8, y: 80, r: 7 },
        { id: 'kartepe', name: 'Kartepe', x: 60, y: 52, r: 8 },
        { id: 'basiskele', name: 'Başiskele', x: 52, y: 60, r: 8 },
        { id: 'golcuk', name: 'Gölcük', x: 42, y: 68, r: 8 },
        { id: 'karamursel', name: 'Karamürsel', x: 32, y: 78, r: 7 },
    ];

    return (
        <div className="relative w-full h-full bg-gradient-to-br from-blue-50 via-white to-blue-50 rounded-xl border border-blue-100">
            {/* Map Title */}
            <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-700 shadow-sm z-10">
                🗺️ Kocaeli İl Haritası
            </div>

            {/* SVG Map */}
            <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
                {/* Background sea effect */}
                <defs>
                    <linearGradient id="seaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#dbeafe" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#bfdbfe" stopOpacity="0.5" />
                    </linearGradient>
                </defs>

                {/* Kocaeli Map Background Image */}
                <image
                    href="https://static.fokusistatistik.com/resimler/kocaeli-il-haritasi.png?v=3"
                    x="0"
                    y="0"
                    width="100"
                    height="100"
                    preserveAspectRatio="xMidYMid meet"
                    className="opacity-70"
                />

                {/* Sea area (Marmara) - Keep it subtle behind the map if needed, or remove for clarity */}
                {/* <rect x="0" y="0" width="100" height="100" fill="url(#seaGradient)" opacity="0.2" /> */}

                {/* Connection lines */}
                {districts.map((d, i) => {
                    if (i < districts.length - 1) {
                        const next = districts[i + 1];
                        return (
                            <line
                                key={`line-${d.id}`}
                                x1={d.x}
                                y1={d.y}
                                x2={next.x}
                                y2={next.y}
                                stroke="#cbd5e1"
                                strokeWidth="0.3"
                                strokeDasharray="1 1"
                                opacity="0.4"
                            />
                        );
                    }
                    return null;
                })}

                {/* Districts */}
                {districts.map((d) => (
                    <g
                        key={d.id}
                        onClick={() => onSelect(d.name)}
                        className="cursor-pointer transition-all duration-200"
                        style={{ transformOrigin: `${d.x}% ${d.y}%` }}
                    >
                        {/* Glow effect for selected */}
                        {selectedDistrict === d.name && (
                            <circle
                                cx={d.x}
                                cy={d.y}
                                r={d.r + 2}
                                fill="#3b82f6"
                                opacity="0.2"
                                className="animate-pulse"
                            />
                        )}

                        {/* Main circle */}
                        <circle
                            cx={d.x}
                            cy={d.y}
                            r={d.r}
                            className={`
                                transition-all duration-200
                                ${selectedDistrict === d.name
                                    ? 'fill-blue-600 stroke-white stroke-[1.5]'
                                    : 'fill-white stroke-blue-400 stroke-[0.8] hover:fill-blue-100'
                                }
                            `}
                            filter={selectedDistrict === d.name ? 'drop-shadow(0 0 4px rgba(59, 130, 246, 0.5))' : ''}
                        />

                        {/* District name */}
                        <text
                            x={d.x}
                            y={d.y}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            className={`
                                text-[2.5px] font-bold select-none pointer-events-none
                                ${selectedDistrict === d.name ? 'fill-white' : 'fill-gray-700'}
                            `}
                        >
                            {d.name.length > 7 ? d.name.substring(0, 5) + '.' : d.name}
                        </text>
                    </g>
                ))}
            </svg>

            {/* Selected District Info */}
            {selectedDistrict && selectedDistrict !== 'all' && (
                <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-gray-100 max-w-xs z-10">
                    <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                        <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                        {selectedDistrict}
                    </h4>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                            <span className="text-gray-500 block">ASM Sayısı</span>
                            <span className="font-bold text-lg text-gray-900">
                                {districtData.find(x => x.name === selectedDistrict)?.asm || 0}
                            </span>
                        </div>
                        <div>
                            <span className="text-gray-500 block">SHM Sayısı</span>
                            <span className="font-bold text-lg text-gray-900">
                                {districtData.find(x => x.name === selectedDistrict)?.shm || 0}
                            </span>
                        </div>
                        <div className="col-span-2 pt-2 border-t">
                            <span className="text-gray-500 block">Performans Skoru</span>
                            <div className="flex items-center gap-2 mt-1">
                                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full"
                                        style={{ width: `${districtData.find(x => x.name === selectedDistrict)?.puan || 0}%` }}
                                    />
                                </div>
                                <span className="font-bold text-green-600">
                                    %{districtData.find(x => x.name === selectedDistrict)?.puan || 0}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Live System Status Component - Removed based on user request


export default function DashboardOverview() {
    const [selectedDistrict, setSelectedDistrict] = useState<string>('all');

    return (
        <div className="space-y-6">
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
            {/* Map and Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Map - Takes 2 columns */}
                <div className="lg:col-span-2">
                    <Card className="h-[500px]">
                        <CardHeader>
                            <CardTitle>Coğrafi Dağılım</CardTitle>
                        </CardHeader>
                        <CardContent className="h-[420px]">
                            <KocaeliMap selectedDistrict={selectedDistrict} onSelect={setSelectedDistrict} />
                        </CardContent>
                    </Card>
                </div>

                {/* Pie Chart - Moved here next to the map */}
                <div>
                    <Card className="h-[500px]">
                        <CardHeader>
                            <CardTitle>Görev Dağılımı</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center justify-center h-[420px]">
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={performansData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={70}
                                            outerRadius={100}
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

            {/* Expanded Bar Chart Row */}
            <div className="grid grid-cols-1 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>İlçelere Göre Kurum Dağılımı</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[400px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={districtData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                    <YAxis />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Legend />
                                    <Bar dataKey="asm" stackId="a" fill="#3b82f6" name="ASM" radius={[0, 0, 0, 0]} />
                                    <Bar dataKey="shm" stackId="a" fill="#f43f5e" name="SHM" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
