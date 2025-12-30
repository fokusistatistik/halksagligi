'use client';

import { useState, useEffect } from 'react';
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
import { Activity, Users, Building2, Landmark } from 'lucide-react';
// Kocaeli Map Component
const KocaeliMap = ({ selectedDistrict, onSelect, districtData }: { selectedDistrict: string, onSelect: (d: string) => void, districtData: any[] }) => {
    const districts = [
        { id: 'kandira', name: 'Kandıra', x: 70, y: 27, r: 15 },
        { id: 'izmit', name: 'İzmit', x: 54, y: 69, r: 18 },
        { id: 'kartepe', name: 'Kartepe', x: 63, y: 72, r: 16 },
        { id: 'basiskele', name: 'Başiskele', x: 50, y: 77, r: 15 },
        { id: 'derince', name: 'Derince', x: 44, y: 68, r: 14 },
        { id: 'korfez', name: 'Körfez', x: 37, y: 68, r: 15 },
        { id: 'golcuk', name: 'Gölcük', x: 42, y: 75, r: 14 },
        { id: 'karamursel', name: 'Karamürsel', x: 25, y: 80, r: 13 },
        { id: 'dilovasi', name: 'Dilovası', x: 19, y: 66, r: 13 },
        { id: 'gebze', name: 'Gebze', x: 10, y: 65, r: 18 },
        { id: 'cayirova', name: 'Çayırova', x: 6, y: 60, r: 13 },
        { id: 'darica', name: 'Darıca', x: 6, y: 70, r: 13 },
    ];

    const activeDistrictData = districts.find(d => d.name === selectedDistrict);

    return (
        <div className="relative w-full flex flex-col bg-slate-900 rounded-2xl overflow-hidden border-2 border-slate-800 shadow-2xl">
            {/* Map Container */}
            <div className="relative w-full" style={{ aspectRatio: '1076 / 800' }}>
                {/* Map Title Overlay */}
                <div className="absolute top-6 left-0 right-0 z-20 flex flex-col items-center justify-center pointer-events-none">
                    <h2 className="text-2xl font-black text-white tracking-widest drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                        OPERASYONEL DURUM HARİTASI
                    </h2>
                    <p className="text-cyan-100/80 text-xs font-bold uppercase tracking-[0.2em] drop-shadow-md mt-1">
                        İl Geneli Kurumsal Dağılım ve Performans İzleme
                    </p>
                    <div className="mt-2 bg-black/40 backdrop-blur-sm px-3 py-1 rounded-full border border-white/10">
                        <p className="text-white/60 text-[12px] uppercase font-semibold">
                            ⚠️ Sitede kayıtlı bilgiler gösterilmektedir
                        </p>
                    </div>
                </div>

                {/* SVG Map */}
                <svg
                    viewBox="0 0 1076 800"
                    className="w-full h-full"
                    preserveAspectRatio="xMidYMid meet"
                    onClick={() => selectedDistrict !== 'all' && onSelect('all')} // Click background to deselect
                >
                    <image
                        href="https://static.fokusistatistik.com/halksagligi/genel/kocaelimap.jpg"
                        x="0"
                        y="0"
                        width="1076"
                        height="800"
                        preserveAspectRatio="xMidYMid meet"
                        className="opacity-90"
                    />

                    <rect x="0" y="0" width="1076" height="800" fill="rgba(15, 23, 42, 0.15)" />

                    {districts.map((d) => {
                        const scaledX = (d.x / 100) * 1076;
                        const scaledY = (d.y / 100) * 800;
                        const scaledR = (d.r / 100) * 40;

                        return (
                            <g
                                key={d.id}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onSelect(d.name);
                                }}
                                className="cursor-pointer transition-all duration-300 hover:opacity-100"
                            >
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

                                <circle
                                    cx={scaledX}
                                    cy={scaledY}
                                    r={scaledR}
                                    className={`
                                        transition-all duration-300
                                        ${selectedDistrict === d.name
                                            ? 'fill-cyan-500 stroke-white stroke-[3]'
                                            : 'fill-white/20 stroke-white/50 stroke-[2] hover:fill-cyan-500/40 hover:stroke-white'
                                        }
                                    `}
                                    style={{ filter: 'drop-shadow(0 0 10px rgba(0,0,0,0.6))' }}
                                />

                                <g transform={`translate(${scaledX}, ${scaledY - scaledR - 15})`}>
                                    <rect
                                        x="-35"
                                        y="-12"
                                        width="70"
                                        height="20"
                                        rx="10"
                                        className={`${selectedDistrict === d.name ? 'fill-cyan-600' : 'fill-slate-900/90'}`}
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

                {/* Info Popup - Positioned absolutely relative to container based on district percentage */}
                {selectedDistrict && selectedDistrict !== 'all' && activeDistrictData && (
                    <div
                        className="absolute z-30 p-4 bg-slate-900/95 border border-cyan-500/50 rounded-xl animate-in fade-in zoom-in-95 duration-300 shadow-2xl shadow-cyan-900/20 pointer-events-none min-w-[200px]"
                        style={{
                            left: `${activeDistrictData.x}%`,
                            top: `${activeDistrictData.y}%`,
                            transform: 'translate(-50%, 30px)' // Shift down below the point
                        }}
                    >
                        {/* Triangle Arrow */}
                        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-slate-900 border-t border-l border-cyan-500/50 rotate-45"></div>

                        <div className="flex flex-col items-center gap-2 text-center">
                            <h4 className="text-lg font-black text-white uppercase border-b border-white/10 w-full pb-1">{selectedDistrict}</h4>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-left w-full">
                                {districtData.find(x => x.name === selectedDistrict)?.tsm > 0 && (
                                    <>
                                        <span className="text-slate-400 text-[10px] uppercase">İlçe Sağlık Müdürlüğü</span>
                                        <span className="text-white font-bold text-xs text-right">{districtData.find(x => x.name === selectedDistrict)?.tsm}</span>
                                    </>
                                )}
                                {districtData.find(x => x.name === selectedDistrict)?.asm > 0 && (
                                    <>
                                        <span className="text-slate-400 text-[10px] uppercase">ASM</span>
                                        <span className="text-white font-bold text-xs text-right">{districtData.find(x => x.name === selectedDistrict)?.asm}</span>
                                    </>
                                )}
                                {districtData.find(x => x.name === selectedDistrict)?.shm > 0 && (
                                    <>
                                        <span className="text-slate-400 text-[10px] uppercase">SHM</span>
                                        <span className="text-white font-bold text-xs text-right">{districtData.find(x => x.name === selectedDistrict)?.shm}</span>
                                    </>
                                )}
                                {districtData.find(x => x.name === selectedDistrict)?.diger > 0 && (
                                    <>
                                        <span className="text-slate-400 text-[10px] uppercase">Diğer</span>
                                        <span className="text-white font-bold text-xs text-right">{districtData.find(x => x.name === selectedDistrict)?.diger}</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default function DashboardOverview({ userRole }: { userRole?: { seviye: number } }) {
    const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
    const [stats, setStats] = useState({
        totalPersonel: 0,
        activeTasks: 0,
        internalUnitCount: 0,
        externalUnitCount: 0,
        districtData: [] as any[],
        taskDistribution: [] as any[]
    });
    const canViewDashboard = userRole && userRole.seviye >= 7;

    useEffect(() => {
        if (canViewDashboard) {
            fetchStats();
        }
    }, [canViewDashboard]);

    const fetchStats = async () => {
        try {
            const res = await fetch('/api/dashboard/stats');
            const data = await res.json();
            if (data.success) {
                setStats(data.data);
            }
        } catch (error) {
            console.error('Stats fetch failed', error);
        }
    };

    const handleDistrictSelect = (districtName: string) => {
        if (selectedDistrict === districtName) {
            setSelectedDistrict('all'); // Deselect if clicked again
        } else {
            setSelectedDistrict(districtName);
        }
    };

    return (
        <div className="space-y-6">
            {/* KPI Cards */}
            {canViewDashboard && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Toplam Personel</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalPersonel}</div>
                            <p className="text-xs text-muted-foreground">Aktif çalışan sayısı</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Aktif Görevler</CardTitle>
                            <Activity className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.activeTasks}</div>
                            <p className="text-xs text-muted-foreground">Devam eden işler</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Dış Birim Sayısı</CardTitle>
                            <Building2 className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.externalUnitCount}</div>
                            <p className="text-xs text-muted-foreground">İlçe Sağlık, ASM, SHM, vs</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">İç Birim Sayısı</CardTitle>
                            <Landmark className="h-4 w-4 text-indigo-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.internalUnitCount}</div>
                            <p className="text-xs text-muted-foreground">Müdürlük birimleri</p>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Main Map View */}
            {canViewDashboard && (
                <div className="hidden min-[1200px]:grid grid-cols-1 gap-6">
                    <Card className="border-none shadow-2xl bg-slate-950 overflow-hidden rounded-[2.5rem]">
                        <CardContent className="p-0 relative">
                            <KocaeliMap selectedDistrict={selectedDistrict} onSelect={handleDistrictSelect} districtData={stats.districtData} />
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Sub Charts */}
            {canViewDashboard && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card className="rounded-[2.5rem] shadow-xl border-none bg-white">
                        <CardHeader>
                            <CardTitle className="text-lg font-black text-slate-900">Görev Dağılımı</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center justify-center pt-0">
                            <div className="h-[250px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={stats.taskDistribution}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={90}
                                            paddingAngle={8}
                                            dataKey="value"
                                        >
                                            {stats.taskDistribution.map((entry, index) => (
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

                    <Card className="lg:col-span-2 rounded-[2.5rem] shadow-xl border-none bg-white">
                        <CardHeader>
                            <CardTitle className="text-lg font-black text-slate-900">
                                {selectedDistrict === 'all' ? 'İlçelere Göre Kurum Dağılımı' : `${selectedDistrict} Kurum Dağılımı`}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[250px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={stats.districtData} // Show all data always
                                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                                        <Tooltip
                                            cursor={{ fill: '#f8fafc' }}
                                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                                        />
                                        <Bar dataKey="tsm" stackId="a" fill="#8b5cf6" name="İlçe Sağlık" radius={[0, 0, 0, 0]} barSize={20} />
                                        <Bar dataKey="asm" stackId="a" fill="#3b82f6" name="ASM" radius={[0, 0, 0, 0]} barSize={20} />
                                        <Bar dataKey="shm" stackId="a" fill="#f43f5e" name="SHM" radius={[0, 0, 0, 0]} barSize={20} />
                                        <Bar dataKey="diger" stackId="a" fill="#94a3b8" name="Diğer" radius={[4, 4, 0, 0]} barSize={20} />
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
