'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import DashboardOverview from '@/components/dashboard/dashboard-overview';
import { Settings, Building2, BarChart3, HeartPulse, MapPin, ClipboardCheck, Loader2 } from 'lucide-react';

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
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) return;

    const checkRedirect = async () => {
      const user = session.user;
      const rolKod = user.rol?.kod;
      const birim = user.birim;

      // 1. ADMIN ve BASKAN her zaman Dashboard'ı görür
      if (rolKod === 'ADMIN' || rolKod === 'BASKAN') {
        return;
      }

      setIsRedirecting(true);

      // 2. Özel Birim/Şube Kontrolleri
      if (birim) {
        // SHM (Dış veya İç Koordinasyon)
        if (birim.dis_birim_tip === 'SHM' || birim.kod === 'KOORD-SHM') {
          router.replace('/shm');
          return;
        }
        // ASM (Dış veya İç Koordinasyon)
        if (birim.dis_birim_tip === 'ASM' || birim.kod === 'KOORD-ASM') {
          router.replace('/asm');
          return;
        }
        // İlçe Sağlık (Dış veya İç Koordinasyon)
        if (birim.dis_birim_tip === 'ILCE_SAGLIK' || birim.kod === 'KOORD-ILCE') {
          router.replace('/ilce-saglik');
          return;
        }

        // 3. Genel "Dış Birim" Kısıtlaması
        // Eğer yukarıdaki özel durumlara girmediyse ama Dış Birim ise
        if (birim.tip === 'DIS_BIRIM') {
          // Dış birim olup özel sayfası olmayanlar için fallback
          router.replace('/settings');
          return;
        }
      }

      // 4. İç Birim Standart Personel Kısıtlaması
      // "Rolü birim yöneticisi olmayan ... dashboard göremez"
      // Müdürlükte olup Birim Yöneticisi olmayanlar Görev Modülüne veya Profil'e gitsin
      if (rolKod !== 'BIRIM_YONETICISI') {
        router.replace('/mudurluk/gorev-yonetim');
        return;
      }

      // Eğer buraya kadar geldiyse Dashboard'ı görebilir (Örn: Merkez Birim Yöneticisi)
      setIsRedirecting(false);
    };

    checkRedirect();

  }, [session, status, router]);

  if (status === 'loading' || isRedirecting) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-gray-500">Yönlendiriliyor...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Giriş yapılıyor...</p>
      </div>
    );
  }

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

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Welcome Section Removed */}

      {/* Main Dashboard */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Genel Bakış ve İstatistikler</h2>
          <span className="text-xs text-gray-500">Son güncelleme: {new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</span>
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
