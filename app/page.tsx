'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated
    const authToken = localStorage.getItem('auth_token');

    if (!authToken) {
      // Not authenticated, redirect to login
      router.push('/login');
    } else {
      // Authenticated, redirect to dashboard (to be created)
      // For now, show a welcome message
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        {/* Kocaeli İSM Logo */}
        <div className="mx-auto mb-3">
          <img
            src="https://static.fokusistatistik.com/resimler/kism.png"
            alt="Kocaeli İl Sağlık Müdürlüğü"
            className="h-20 mx-auto"
          />
        </div>

        {/* SAHA Logo */}
        <div className="mx-auto mb-4">
          <img
            src="https://static.fokusistatistik.com/resimler/saha.jpg"
            alt="SAHA - Sağlık Hizmetleri Analitiği"
            className="h-24 mx-auto rounded-lg shadow-md"
          />
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          SAHA
        </h1>
        <p className="text-gray-600 font-medium mb-1">Sağlık Hizmetleri Analitiği</p>
        <p className="text-sm text-gray-500 mb-6">Kocaeli İl Sağlık Müdürlüğü</p>
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="mt-4 text-sm text-gray-500">Yükleniyor...</p>
      </div>
    </div>
  );
}
