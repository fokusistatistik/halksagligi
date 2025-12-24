'use client';

import Link from 'next/link';
import { ExternalLink } from 'lucide-react';

export default function SiteFooter() {
    const currentYear = 2025;

    return (
        <footer className="w-full border-t bg-white py-6 mt-auto">
            <div className="container mx-auto px-4 flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row md:py-0">
                <div className="flex flex-col items-center gap-2 md:flex-row md:gap-4 md:px-0">
                    <img
                        src="https://static.fokusistatistik.com/resimler/favicon.png"
                        alt="FOKUS İstatistik Logo"
                        className="h-8 w-8"
                    />
                    <div className="text-center md:text-left">
                        <p className="text-sm font-medium text-gray-900">
                            &copy; {currentYear} Tüm hakları saklıdır.
                        </p>
                        <p className="text-xs text-gray-500">
                            Kocaeli İl Sağlık Müdürlüğü
                        </p>
                    </div>
                </div>

                <div className="flex flex-col items-center gap-2 md:items-end">
                    <Link
                        href="https://www.fokusistatistik.com"
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 text-sm font-medium text-gray-600 transition-colors hover:text-blue-600"
                    >
                        <span>FOKUS İstatistik tarafından yapıldı</span>
                        <ExternalLink className="h-3 w-3" />
                    </Link>

                    <div className="flex items-center gap-1 text-xs text-gray-400">
                        <span>by Emre Bostanoğlu</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
