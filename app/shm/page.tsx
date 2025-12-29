'use client';

import { useSession } from 'next-auth/react';
import { HeartPulse, FileText, ClipboardList } from 'lucide-react';
import Link from 'next/link';

export default function SHMDashboard() {
    const { data: session } = useSession();

    return (
        <div className="container mx-auto px-4 py-8 space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <HeartPulse className="w-8 h-8 text-rose-600" />
                    SHM Yönetim Paneli
                </h1>
                <p className="text-gray-600">
                    Hoş geldiniz, {session?.user?.name}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Link href="/shm/veri-giris" className="group">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full hover:shadow-md transition-all group-hover:border-rose-200">
                        <div className="w-12 h-12 bg-rose-100 rounded-lg flex items-center justify-center text-rose-600 mb-4 group-hover:bg-rose-600 group-hover:text-white transition-colors">
                            <ClipboardList className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Veri Girişi</h3>
                        <p className="text-gray-500 text-sm">Aylık SHM verilerini girmek için tıklayınız.</p>
                    </div>
                </Link>

                <Link href="/shm/list" className="group">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full hover:shadow-md transition-all group-hover:border-rose-200">
                        <div className="w-12 h-12 bg-rose-100 rounded-lg flex items-center justify-center text-rose-600 mb-4 group-hover:bg-rose-600 group-hover:text-white transition-colors">
                            <FileText className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Veri Listeleri</h3>
                        <p className="text-gray-500 text-sm">Geçmiş dönem verilerini görüntüleyin ve takip edin.</p>
                    </div>
                </Link>
            </div>
        </div>
    );
}
