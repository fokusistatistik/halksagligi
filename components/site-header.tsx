'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { LogOut, Bell, ChevronDown, BarChart3, Building2, HeartPulse, MapPin, Settings as SettingsIcon, Menu, X } from 'lucide-react';
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
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
                <div className="mx-auto max-w-[1920px] flex h-14 md:h-16 items-center justify-between px-2 sm:px-4 lg:px-6 xl:px-8">
                    {/* Left Section - Logos */}
                    <div className="flex items-center gap-2 md:gap-3 lg:gap-4 min-w-0">
                        <Link href="/" className="flex items-center gap-1 md:gap-2 shrink-0">
                            <img
                                src="https://static.fokusistatistik.com/resimler/kism.png"
                                alt="Kocaeli İSM"
                                className="h-8 md:h-10 lg:h-12 w-auto"
                            />
                            <span className="text-gray-300 mx-0.5 md:mx-1 hidden sm:inline">|</span>
                            <img
                                src="https://static.fokusistatistik.com/halksagligi/genel/asyalogo2.png"
                                alt="ASYA"
                                className="h-8 md:h-10 lg:h-12 w-auto"
                            />
                            <span className="text-gray-300 mx-0.5 md:mx-1 hidden sm:inline">|</span>
                            <img
                                src="https://static.fokusistatistik.com/resimler/saha.jpg"
                                alt="SAHA"
                                className="h-7 md:h-9 lg:h-10 w-auto rounded-md"
                            />
                        </Link>

                        {/* Desktop Navigation */}
                        <nav className="hidden lg:flex items-center gap-4 xl:gap-6 text-sm font-medium ml-4 xl:ml-8">
                            <Link
                                href="/"
                                className={`transition-colors hover:text-primary whitespace-nowrap ${pathname === '/' ? 'text-primary' : 'text-gray-600'
                                    }`}
                            >
                                Ana Sayfa
                            </Link>

                            {session?.user?.rol?.seviye >= 4 && (
                                <Link
                                    href="/mudurluk/gorev-yonetim"
                                    className={`transition-colors hover:text-primary whitespace-nowrap ${pathname.startsWith('/mudurluk/gorev-yonetim') ? 'text-primary' : 'text-gray-600'
                                        }`}
                                >
                                    Görev Yönetimi
                                </Link>
                            )}

                            {/* Modüller Dropdown */}
                            <div className="relative">
                                <button
                                    onClick={() => setShowModulesMenu(!showModulesMenu)}
                                    className="flex items-center gap-1 transition-colors hover:text-primary text-gray-600 whitespace-nowrap"
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
                                    className={`transition-colors hover:text-primary whitespace-nowrap ${pathname.startsWith('/admin') ? 'text-primary' : 'text-gray-600'
                                        }`}
                                >
                                    Yönetim
                                </Link>
                            )}
                        </nav>
                    </div>

                    {/* Right Section - User Info & Actions */}
                    <div className="flex items-center gap-1 md:gap-2 lg:gap-3 xl:gap-4 shrink-0">
                        {/* Mobile Menu Button */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="lg:hidden"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </Button>

                        {/* Notifications */}
                        <Button variant="ghost" size="icon" className="hidden sm:flex text-gray-500 hover:text-gray-700">
                            <Bell className="h-5 w-5" />
                            <span className="sr-only">Bildirimler</span>
                        </Button>

                        {/* Desktop User Menu */}
                        <div className="hidden lg:flex items-center gap-2 xl:gap-3 border-l pl-2 xl:pl-4 relative">
                            <button
                                onClick={() => setShowUserMenu(!showUserMenu)}
                                className="flex items-center gap-2 xl:gap-3 group"
                            >
                                <img
                                    src={userPhotoUrl}
                                    alt={user?.name || 'Kullanıcı'}
                                    className="h-9 w-9 xl:h-10 xl:w-10 rounded-full border-2 border-gray-200 object-cover group-hover:border-primary transition-colors"
                                />
                                <div className="hidden xl:flex flex-col items-start">
                                    <span className="text-sm font-semibold text-gray-900 group-hover:text-primary transition-colors">
                                        {user?.name}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                        {user?.rol?.ad}
                                    </span>
                                </div>
                                <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                            </button>

                            {/* User Dropdown Menu */}
                            {showUserMenu && (
                                <div
                                    className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
                                    onMouseLeave={() => setShowUserMenu(false)}
                                >
                                    <Link
                                        href="/settings"
                                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                        onClick={() => setShowUserMenu(false)}
                                    >
                                        <SettingsIcon className="h-4 w-4" />
                                        Ayarlar
                                    </Link>
                                    <hr className="my-1 border-gray-100" />
                                    <button
                                        onClick={() => {
                                            setShowUserMenu(false);
                                            handleLogout();
                                        }}
                                        className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                    >
                                        <LogOut className="h-4 w-4" />
                                        Çıkış Yap
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Mobile User Avatar */}
                        <button
                            onClick={() => setShowUserMenu(!showUserMenu)}
                            className="lg:hidden"
                        >
                            <img
                                src={userPhotoUrl}
                                alt={user?.name || 'Kullanıcı'}
                                className="h-9 w-9 rounded-full border-2 border-gray-200 object-cover"
                            />
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="lg:hidden border-t bg-white">
                        <nav className="px-4 py-3 space-y-1">
                            <Link
                                href="/"
                                className={`block px-3 py-2 rounded-md text-sm font-medium ${pathname === '/' ? 'bg-primary/10 text-primary' : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Ana Sayfa
                            </Link>

                            {session?.user?.rol?.seviye >= 4 && (
                                <Link
                                    href="/mudurluk/gorev-yonetim"
                                    className={`block px-3 py-2 rounded-md text-sm font-medium ${pathname.startsWith('/mudurluk/gorev-yonetim') ? 'bg-primary/10 text-primary' : 'text-gray-600 hover:bg-gray-50'
                                        }`}
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Görev Yönetimi
                                </Link>
                            )}

                            <div className="pt-2 pb-1">
                                <div className="text-xs font-semibold text-gray-400 px-3 mb-1">MODÜLLER</div>
                                {MODULES.map((module) => (
                                    <Link
                                        key={module.name}
                                        href={module.href}
                                        className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-gray-600 hover:bg-gray-50"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        <module.icon className="h-4 w-4" />
                                        <span>{module.name}</span>
                                        <span className="text-xs px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 ml-auto">
                                            {module.status}
                                        </span>
                                    </Link>
                                ))}
                            </div>

                            {session?.user?.rol?.kod === 'ADMIN' && (
                                <Link
                                    href="/admin"
                                    className={`block px-3 py-2 rounded-md text-sm font-medium ${pathname.startsWith('/admin') ? 'bg-primary/10 text-primary' : 'text-gray-600 hover:bg-gray-50'
                                        }`}
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Yönetim
                                </Link>
                            )}

                            <hr className="my-2" />

                            <Link
                                href="/settings"
                                className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-gray-600 hover:bg-gray-50"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <SettingsIcon className="h-4 w-4" />
                                Ayarlar
                            </Link>

                            <button
                                onClick={() => {
                                    setMobileMenuOpen(false);
                                    handleLogout();
                                }}
                                className="flex items-center gap-2 w-full text-left px-3 py-2 rounded-md text-sm text-red-600 hover:bg-red-50"
                            >
                                <LogOut className="h-4 w-4" />
                                Çıkış Yap
                            </button>
                        </nav>
                    </div>
                )}
            </header>

            {/* Logout Confirmation Modal */}
            {showLogoutConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
                    <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
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
