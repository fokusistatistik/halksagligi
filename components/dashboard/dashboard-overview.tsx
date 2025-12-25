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

// Kocaeli Map Component - 1076x800 aspect ratio
const KocaeliMap = ({ selectedDistrict, onSelect }: { selectedDistrict: string, onSelect: (d: string) => void }) => {
    const districts = [
        { id: 'kandira', name: 'Kandıra', x: 74, y: 22, r: 12 },
        { id: 'izmit', name: 'İzmit', x: 57, y: 67, r: 14 },
        { id: 'kartepe', name: 'Kartepe', x: 72, y: 70, r: 12 },
        { id: 'basiskele', name: 'Başiskele', x: 58, y: 78, r: 11 },
        { id: 'derince', name: 'Derince', x: 50, y: 67, r: 11 },
        { id: 'korfez', name: 'Körfez', x: 42, y: 67, r: 12 },
        { id: 'golcuk', name: 'Gölcük', x: 45, y: 76, r: 11 },
        { id: 'karamursel', name: 'Karamürsel', x: 28, y: 82, r: 10 },
        { id: 'dilovasi', name: 'Dilovası', x: 32, y: 67, r: 10 },
        { id: 'gebze', name: 'Gebze', x: 20, y: 65, r: 14 },
        { id: 'cayirova', name: 'Çayırova', x: 12, y: 62, r: 10 },
        { id: 'darica', name: 'Darıca', x: 14, y: 75, r: 10 },
    ];

    return (
        <div className="relative w-full flex flex-col bg-slate-900 rounded-2xl overflow-hidden border-2 border-slate-800 shadow-2xl">
            {/* Map Container - Maintains 1076x800 aspect ratio */}
            <div className="relative w-full" style={{ aspectRatio: '1076 / 800' }}>
                {/* Map Overlay Info */}
                <div className="absolute top-4 left-4 z-10">
                    <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700/50 px-4 py-2 rounded-xl text-xs font-bold text-white shadow-2xl flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        KOCAELİ OPERASYONEL SAHA GÖRÜNÜMÜ
                    </div>
                </div>

                {/* SVG Map - Full coverage without zoom */}
                <svg
                    viewBox="0 0 1076 800"
                    className="w-full h-full"
                    preserveAspectRatio="xMidYMid meet"
                >
                    {/* Background Satellite Image */}
                    <image
                        href="https://static.fokusistatistik.com/halksagligi/genel/kocaelimap.jpg"
                        x="0"
                        y="0"
                        width="1076"
                        height="800"
                        preserveAspectRatio="xMidYMid meet"
                        className="opacity-90"
                    />

                    {/* Subtle Overlay */}
                    <rect x="0" y="0" width="1076" height="800" fill="rgba(15, 23, 42, 0.15)" />

                    {/* Districts Layer - Scaled for 1076x800 */}
                    {districts.map((d) => {
                        const scaledX = (d.x / 100) * 1076;
                        const scaledY = (d.y / 100) * 800;
                        const scaledR = (d.r / 100) * 40;

                        return (
                            <g
                                key={d.id}
                                onClick={() => onSelect(d.name)}
                                className="cursor-pointer transition-all duration-300 hover:opacity-100"
                            >
                                {/* Outer Glow for selected */}
                                {selectedDistrict === d.name && (
                                    <circle
                                        cx={scaledX}
                                        cy={scaledY}
                                        r={scaledR + 15}
                                        fill="white"
                                        opacity="0.2"
                                        className="animate-ping"
                                    />
                                )}

                                {/* Main Bubble */}
                                <circle
                                    cx={scaledX}
                                    cy={scaledY}
                                    r={scaledR}
                                    className={`
                                        transition-all duration-300
                                        ${selectedDistrict === d.name
                                            ? 'fill-primary stroke-white stroke-[3]'
                                            : 'fill-white/20 stroke-white/50 stroke-[2] hover:fill-primary/40 hover:stroke-white'
                                        }
                                    `}
                                    style={{ filter: 'drop-shadow(0 0 10px rgba(0,0,0,0.6))' }}
                                />

                                {/* District Label */}
                                <g transform={`translate(${scaledX}, ${scaledY - scaledR - 15})`}>
                                    <rect
                                        x="-35"
                                        y="-12"
                                        width="70"
                                        height="20"
                                        rx="10"
                                        className={`${selectedDistrict === d.name ? 'fill-primary' : 'fill-slate-900/90'}`}
                                    />
                                    <text
                                        textAnchor="middle"
                                        dominantBaseline="middle"
                                        className={`
                                            text-xs font-black tracking-tight select-none pointer-events-none uppercase
                                            ${selectedDistrict === d.name ? 'fill-white' : 'fill-white/90'}
                                        `}
                                    >
                                        {d.name}
                                    </text>
                                </g>
                            </g>
                        );
                    })}
                </svg>
            </div>

            {/* Bottom HUD - Outside map area */}
            {selectedDistrict && selectedDistrict !== 'all' && (
                <div className="p-6 bg-slate-900/95 border-t border-slate-800 animate-in slide-in-from-bottom-4 duration-500">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <div className="bg-primary/20 p-4 rounded-2xl">
                                <Activity className="w-8 h-8 text-primary" />
                            </div>
                            <div>
                                <h4 className="text-2xl font-black text-white tracking-tighter uppercase">{selectedDistrict}</h4>
                                <p className="text-primary text-[10px] font-black tracking-[0.2em]">BÖLGESEL PERFORMANS ANALİZİ</p>
                            </div>
                        </div>

                        <div className="flex gap-8 items-center border-l border-slate-800 pl-8">
                            <div className="text-center">
                                <span className="text-slate-500 text-[10px] font-bold block mb-1">ASM</span>
                                <span className="text-2xl font-black text-white">
                                    {districtData.find(x => x.name === selectedDistrict)?.asm || 0}
                                </span>
                            </div>
                            <div className="text-center">
                                <span className="text-slate-500 text-[10px] font-bold block mb-1">SHM</span>
                                <span className="text-2xl font-black text-white">
                                    {districtData.find(x => x.name === selectedDistrict)?.shm || 0}
                                </span>
                            </div>
                            <div className="w-32">
                                <div className="flex justify-between items-end mb-1">
                                    <span className="text-slate-500 text-[10px] font-bold">VERİMLİLİK</span>
                                    <span className="text-primary font-black text-sm">
                                        %{districtData.find(x => x.name === selectedDistrict)?.puan || 0}
                                    </span>
                                </div>
                                <div className="h-2 bg-slate-800 rounded-full overflow-hidden p-0.5">
                                    <div
                                        className="h-full bg-gradient-to-r from-primary/50 to-primary rounded-full"
                                        style={{ width: `${districtData.find(x => x.name === selectedDistrict)?.puan || 0}%` }}
                                    />
                                </div>
                            </div>
                        </div>

                        <button className="bg-white text-slate-900 px-6 py-3 rounded-xl font-black text-xs hover:bg-primary hover:text-white transition-all shadow-xl">
                            DETAYLI RAPOR
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default function DashboardOverview({ userRole }: { userRole?: { seviye: number } }) {
    const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
    const canViewDashboard = userRole && userRole.seviye >= 7;

    return (
        <div className="space-y-6">
            {/* KPI Cards - Only for role level 7+ */}
            {canViewDashboard && (
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
            )}

            {/* Main Map View - Full Width */}
            {canViewDashboard && (
                <div className="grid grid-cols-1 gap-6">
                    <Card className="border-none shadow-2xl bg-slate-950 overflow-hidden rounded-[2.5rem]">
                        <CardHeader className="bg-slate-900/50 backdrop-blur-md border-b border-slate-800 py-6 px-10">
                            <div className="flex justify-between items-center">
                                <div>
                                    <CardTitle className="text-2xl font-black text-white tracking-tighter">OPERASYONEL DURUM HARİTASI</CardTitle>
                                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">İl Geneli Kurumsal Dağılım ve Performans İzleme</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <KocaeliMap selectedDistrict={selectedDistrict} onSelect={setSelectedDistrict} />
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Sub Charts Row - Only for role level 7+ */}
            {canViewDashboard && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Pie Chart */}
                    <Card className="rounded-[2.5rem] shadow-xl border-none bg-white">
                        <CardHeader>
                            <CardTitle className="text-lg font-black text-slate-900">Görev Dağılımı</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center justify-center pt-0">
                            <div className="h-[250px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={performansData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={90}
                                            paddingAngle={8}
                                            dataKey="value"
                                        >
                                            {performansData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                                        />
                                        <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 'bold' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Bar Chart - Takes 2 Columns */}
                    <Card className="lg:col-span-2 rounded-[2.5rem] shadow-xl border-none bg-white">
                        <CardHeader>
                            <CardTitle className="text-lg font-black text-slate-900">İlçelere Göre Kurum Dağılımı</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[250px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={districtData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                                        <Tooltip
                                            cursor={{ fill: '#f8fafc' }}
                                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                                        />
                                        <Bar dataKey="asm" stackId="a" fill="#3b82f6" name="ASM" radius={[0, 0, 0, 0]} barSize={20} />
                                        <Bar dataKey="shm" stackId="a" fill="#f43f5e" name="SHM" radius={[4, 4, 0, 0]} barSize={20} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
