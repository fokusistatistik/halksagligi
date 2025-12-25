'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import DashboardOverview from '@/components/dashboard/dashboard-overview';
import { Settings, Building2, BarChart3, HeartPulse, MapPin, ClipboardCheck } from 'lucide-react';

function ModuleIcon({ name }: { name: string }) {
  const icons: any = {
    Settings: <Settings className="w-6 h-6" />,
    ClipboardCheck: <ClipboardCheck className="w-6 h-6" />,
    Building2: <Building2 className="w-6 h-6" />,
    BarChart3: <BarChart3 className="w-6 h-6" />,
    HeartPulse: <HeartPulse className="w-6 h-6" />,
    MapPin: <MapPin className="w-6 h-6" />,
  };
  return icons[name] || <Settings className="w-6 h-6" />;
}

export default function HomePage() {
  const { data: session } = useSession();

  const modules = [
    {
      title: 'Yönetim',
      description: 'Personel, birim ve sistem ayarları yönetimi',
      icon: 'Settings',
      href: '/admin',
      color: 'bg-indigo-600',
      allowedRoles: ['ADMIN'],
    },
    {
      title: 'Görev Yönetim',
      description: 'Görev atama, takip ve planlama modülü (Müdürlük)',
      icon: 'ClipboardCheck',
      href: '/mudurluk/gorev-yonetim',
      color: 'bg-emerald-600',
      allowedRoles: ['ADMIN', 'MUDURLUK'],
    },
    {
      title: 'ASM',
      description: 'Aile Sağlığı Merkezleri işlemleri ve takibi',
      icon: 'Building2',
      href: '/asm',
      color: 'bg-blue-600',
      allowedRoles: ['ADMIN', 'USER'],
    },
    {
      title: 'İstatistik',
      description: 'Veri analizi, raporlar ve gösterge panelleri',
      icon: 'BarChart3',
      href: '/istatistik',
      color: 'bg-purple-600',
      allowedRoles: ['ADMIN', 'USER'],
    },
    {
      title: 'SHM',
      description: 'Sağlıklı Hayat Merkezleri veri girişi ve takibi',
      icon: 'HeartPulse',
      href: '/shm',
      color: 'bg-rose-600',
      allowedRoles: ['ADMIN', 'USER'],
    },
    {
      title: 'İlçe Sağlık',
      description: 'İlçe Sağlık Müdürlükleri koardinasyon modülü',
      icon: 'MapPin',
      href: '/ilce-saglik',
      color: 'bg-teal-600',
      allowedRoles: ['ADMIN', 'USER'],
    },
  ];

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Yönlendiriliyor...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Hoş geldiniz, {session?.user?.name}
          </h1>
          <p className="text-gray-600 mt-1">
            Halk Sağlığı Yönetim Sistemi (V1 Beta)
          </p>
        </div>

      </div>

      {/* Main Dashboard */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Genel Bakış ve İstatistikler</h2>
          <span className="text-xs text-gray-500">Son güncelleme: 14:05</span>
        </div>
        <DashboardOverview userRole={session?.user?.rol as any} />
      </section>

      {/* Quick Access Modules */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Hızlı Erişim Modülleri</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {modules.map((module) => {
            const isAdmin = session?.user?.rol?.kod === 'ADMIN';
            if (module.title === 'Yönetim' && !isAdmin) return null;

            return (
              <Link
                key={module.title}
                href={module.href}
                className="block group"
              >
                <div className="h-full bg-white rounded-xl shadow-sm border border-gray-100 p-4 transition-all duration-200 hover:shadow-md hover:border-blue-200 group-hover:-translate-y-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`${module.color} w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-sm`}>
                      <ModuleIcon name={module.icon} />
                    </div>
                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {module.title}
                    </h3>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-2">
                    {module.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
