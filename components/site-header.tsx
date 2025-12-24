'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { LogOut, Bell, Menu, ChevronDown, FileText, BarChart3, Building2, Users, HeartPulse, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Modül menüsü
const MODULES = [
    { name: 'ASM', href: '/asm', icon: HeartPulse, description: 'Aile Sağlığı Merkezi', status: 'Yakında' },
    { name: 'SHM', href: '/shm', icon: Building2, description: 'Sağlık Hizmetleri Müdürlüğü', status: 'Beta' },
    { name: 'İstatistik', href: '/istatistik', icon: BarChart3, description: 'Veri Analizi', status: 'Yakında' },
    { name: 'İlçe Sağlık', href: '/ilce-saglik', icon: MapPin, description: 'İlçe Sağlık Müdürlüğü', status: 'Yakında' },
];

export default function SiteHeader() {
    const pathname = usePathname();
    const { data: session } = useSession();
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [showModulesMenu, setShowModulesMenu] = useState(false);

    // Don't show on public/auth pages
    if (
        pathname.startsWith('/login') ||
        pathname.startsWith('/sifre-')
    ) {
        return null;
    }

    const handleLogout = () => {
        setShowLogoutConfirm(true);
    };

    const confirmLogout = () => {
        signOut({ callbackUrl: '/login' });
    };

    const user = session?.user as any;
    const userPhotoUrl = user?.profil_foto_url || 'https://static.fokusistatistik.com/resimler/default-avatar.png';

    return (
        <>
            <header className="sticky top-0 z-40 w-full border-b bg-white shadow-sm">
                <div className="container flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-6">
                        <Link href="/" className="flex items-center gap-2">
                            <img
                                src="https://static.fokusistatistik.com/resimler/kism.png"
                                alt="Kocaeli İSM"
                                className="h-10 w-auto"
                            />
                            <span className="text-gray-300 mx-2">|</span>
                            <img
                                src="https://static.fokusistatistik.com/resimler/saha.jpg"
                                alt="SAHA"
                                className="h-10 w-auto rounded-md"
                            />
                        </Link>

                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
                            <Link
                                href="/"
                                className={`transition-colors hover:text-primary ${pathname === '/' ? 'text-primary' : 'text-gray-600'
                                    }`}
                            >
                                Ana Sayfa
                            </Link>

                            {session?.user?.rol?.kod === 'ADMIN' && (
                                <Link
                                    href="/mudurluk/gorev-yonetim"
                                    className={`transition-colors hover:text-primary ${pathname.startsWith('/mudurluk/gorev-yonetim') ? 'text-primary' : 'text-gray-600'
                                        }`}
                                >
                                    Görev Yönetimi
                                </Link>
                            )}

                            {/* Modüller Dropdown */}
                            <div className="relative">
                                <button
                                    onClick={() => setShowModulesMenu(!showModulesMenu)}
                                    className="flex items-center gap-1 transition-colors hover:text-primary text-gray-600"
                                >
                                    Modüller
                                    <ChevronDown className={`h-4 w-4 transition-transform ${showModulesMenu ? 'rotate-180' : ''}`} />
                                </button>

                                {showModulesMenu && (
                                    <div
                                        className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
                                        onMouseLeave={() => setShowModulesMenu(false)}
                                    >
                                        {MODULES.map((module) => (
                                            <Link
                                                key={module.name}
                                                href={module.href}
                                                className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                                            >
                                                <module.icon className="h-5 w-5 text-primary mt-0.5" />
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium text-gray-900">{module.name}</span>
                                                        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                                                            {module.status}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-gray-500 mt-0.5">{module.description}</p>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {session?.user?.rol?.kod === 'ADMIN' && (
                                <Link
                                    href="/admin"
                                    className={`transition-colors hover:text-primary ${pathname.startsWith('/admin') ? 'text-primary' : 'text-gray-600'
                                        }`}
                                >
                                    Yönetim
                                </Link>
                            )}
                        </nav>
                    </div>

                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-700">
                            <Bell className="h-5 w-5" />
                            <span className="sr-only">Bildirimler</span>
                        </Button>

                        <div className="hidden md:flex items-center gap-3 border-l pl-4">
                            {/* User Photo */}
                            <img
                                src={userPhotoUrl}
                                alt={user?.name || 'Kullanıcı'}
                                className="h-10 w-10 rounded-full border-2 border-gray-200 object-cover"
                            />

                            {/* User Info */}
                            <div className="flex flex-col items-start">
                                <span className="text-sm font-semibold text-gray-900">
                                    {user?.name}
                                </span>
                                <span className="text-xs text-gray-500">
                                    {user?.rol?.ad}
                                </span>
                            </div>

                            {/* Logout Button */}
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleLogout}
                                className="text-gray-500 hover:text-red-600 hover:bg-red-50"
                                title="Çıkış Yap"
                            >
                                <LogOut className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Logout Confirmation Modal */}
            {showLogoutConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Çıkış Yap</h3>
                        <p className="text-gray-600 mb-6">
                            Sistemden çıkış yapmak istediğinizden emin misiniz?
                        </p>
                        <div className="flex gap-3 justify-end">
                            <Button
                                variant="outline"
                                onClick={() => setShowLogoutConfirm(false)}
                            >
                                İptal
                            </Button>
                            <Button
                                onClick={confirmLogout}
                                className="bg-red-600 hover:bg-red-700 text-white"
                            >
                                Çıkış Yap
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
