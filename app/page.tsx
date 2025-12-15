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
        <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
          <Building2 className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Kocaeli İl Sağlık Müdürlüğü
        </h1>
        <p className="text-gray-600 mb-6">Görev Yönetim Sistemi</p>
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="mt-4 text-sm text-gray-500">Yükleniyor...</p>
      </div>
    </div>
  );
}
