'use client';

import Link from 'next/link';
import { ExternalLink } from 'lucide-react';

export default function SiteFooter() {
    const currentYear = 2025;

    return (
        <footer className="w-full border-t bg-gradient-to-r from-gray-50 to-white py-8 mt-auto">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    {/* Sağlık Müdürlüğü Tarafı */}
                    <div className="flex items-center gap-4">
                        <img
                            src="https://static.fokusistatistik.com/resimler/kism.png"
                            alt="Kocaeli İl Sağlık Müdürlüğü"
                            className="h-12 w-auto"
                        />
                        <div className="text-left">
                            <p className="text-sm font-semibold text-gray-900">
                                Kocaeli İl Sağlık Müdürlüğü
                            </p>
                            <p className="text-xs text-gray-500">
                                Halk Sağlığı Yönetim Sistemi
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                                v1.0 Beta • &copy; {currentYear}
                            </p>
                        </div>
                    </div>

                    {/* FOKUS Tarafı */}
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <Link
                                href="https://www.fokusistatistik.com"
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-2 text-sm font-medium text-gray-600 transition-colors hover:text-blue-600"
                            >
                                <span>FOKUS İstatistik tarafından geliştirildi</span>
                                <ExternalLink className="h-3.5 w-3.5" />
                            </Link>
                            <p className="text-xs text-gray-400 mt-1">
                                by Emre Bostanoğlu
                            </p>
                        </div>
                        <img
                            src="https://static.fokusistatistik.com/resimler/favicon.png"
                            alt="FOKUS İstatistik"
                            className="h-10 w-10 opacity-80"
                        />
                    </div>
                </div>

                {/* Alt Bilgi Çubuğu */}
                <div className="mt-6 pt-4 border-t border-gray-100">
                    <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-xs text-gray-400">
                        <span>Sistem Durumu: <span className="text-green-600 font-semibold">Aktif</span></span>
                        <span className="hidden md:inline">•</span>
                        <span>Son Güncelleme: 24 Aralık 2025</span>
                        <span className="hidden md:inline">•</span>
                        <Link href="/gizlilik" className="hover:text-gray-600 transition-colors">
                            Gizlilik Politikası
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
