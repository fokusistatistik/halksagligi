'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Building2 } from 'lucide-react';

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
        <div className="mx-auto mb-6">
          <img
            src="https://static.fokusistatistik.com/resimler/kism.png"
            alt="Kocaeli İl Sağlık Müdürlüğü"
            className="h-24 mx-auto"
          />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Kocaeli İl Sağlık Müdürlüğü
        </h1>
        <p className="text-gray-600 mb-6">Halk Sağlığı Görev Yönetim Sistemi</p>
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="mt-4 text-sm text-gray-500">Yükleniyor...</p>
      </div>
    </div>
  );
}
