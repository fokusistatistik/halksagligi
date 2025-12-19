'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { LogOut, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SiteHeader() {
    const pathname = usePathname();
    const { data: session } = useSession();

    // Don't show on public/auth pages
    if (
        pathname.startsWith('/login') ||
        pathname.startsWith('/sifre-')
    ) {
        return null;
    }

    return (
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
                        <Link
                            href="/gorevler"
                            className={`transition-colors hover:text-primary ${pathname.startsWith('/gorevler') ? 'text-primary' : 'text-gray-600'
                                }`}
                        >
                            Görevler
                        </Link>
                        <Link
                            href="/shm"
                            className={`transition-colors hover:text-primary ${pathname.startsWith('/shm') ? 'text-primary' : 'text-gray-600'
                                }`}
                        >
                            SHM
                        </Link>
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

                    <div className="hidden md:flex items-center gap-4 border-l pl-4">
                        <div className="flex flex-col items-end">
                            <span className="text-sm font-medium text-gray-900">
                                {session?.user?.name}
                            </span>
                            <span className="text-xs text-gray-500">
                                {(session?.user as any)?.unvan || session?.user?.rol?.ad}
                            </span>
                        </div>

                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => signOut({ callbackUrl: '/login' })}
                            className="text-gray-500 hover:text-red-600"
                            title="Çıkış Yap"
                        >
                            <LogOut className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
            </div>
        </header>
    );
}
