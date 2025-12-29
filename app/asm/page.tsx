'use client';

import { useSession } from 'next-auth/react';
import { Building2, FileText, ClipboardList } from 'lucide-react';
import Link from 'next/link';

export default function ASMDashboard() {
    const { data: session } = useSession();

    return (
        <div className="container mx-auto px-4 py-8 space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <Building2 className="w-8 h-8 text-blue-600" />
                    ASM Yönetim Paneli
                </h1>
                <p className="text-gray-600">
                    Hoş geldiniz, {session?.user?.name}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 mb-4">
                        <ClipboardList className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">ASM İşlemleri</h3>
                    <p className="text-gray-500 text-sm">ASM veri giriş ve takip ekranları burada yer alacaktır.</p>
                    <span className="mt-4 inline-block text-xs font-medium px-2 py-1 bg-gray-100 text-gray-600 rounded">Yakında</span>
                </div>
            </div>
        </div>
    );
}
