'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  BarChart3, Download, Calendar, TrendingUp, Users,
  Activity, FileText, ArrowLeft
} from 'lucide-react';

interface RaporIstatistik {
  toplam_islem: number;
  toplam_kontrol: number;
  toplam_kayit: number;
  onaylanmis_kayit: number;
  bekleyen_kayit: number;
}

export default function SHMRaporPage() {
  const router = useRouter();
  const [istatistikler, setIstatistikler] = useState<RaporIstatistik>({
    toplam_islem: 0,
    toplam_kontrol: 0,
    toplam_kayit: 0,
    onaylanmis_kayit: 0,
    bekleyen_kayit: 0
  });
  const [loading, setLoading] = useState(true);
  const [tarihAraligi, setTarihAraligi] = useState({
    baslangic: new Date(new Date().setDate(1)).toISOString().split('T')[0],
    bitis: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    loadIstatistikler();
  }, [tarihAraligi]);

  const loadIstatistikler = async () => {
    try {
      const params = new URLSearchParams({
        baslangic_tarihi: tarihAraligi.baslangic,
        bitis_tarihi: tarihAraligi.bitis
      });

      const res = await fetch(`/api/shm/veri-giris?${params.toString()}`);
      const data = await res.json();

      if (data.success) {
        const veriler = data.data;
        setIstatistikler({
          toplam_kayit: veriler.length,
          toplam_islem: veriler.reduce((sum: number, v: any) => sum + v.poliklinik_islem_sayisi, 0),
          toplam_kontrol: veriler.reduce((sum: number, v: any) => sum + v.poliklinik_kontrol_sayisi, 0),
          onaylanmis_kayit: veriler.filter((v: any) => v.onay_durumu === 'ONAYLANDI').length,
          bekleyen_kayit: veriler.filter((v: any) => v.onay_durumu === 'BEKLEMEDE').length
        });
      }
    } catch (err) {
      console.error('İstatistikler yüklenemedi:', err);
    } finally {
      setLoading(false);
    }
  };

  const exportRapor = () => {
    // CSV export işlevi
    alert('Rapor dışa aktarma özelliği yakında eklenecek');
  };

  const istatistikKartlari = [
    {
      baslik: 'Toplam Kayıt',
      deger: istatistikler.toplam_kayit,
      icon: FileText,
      renk: 'bg-blue-500',
      acikRenk: 'bg-blue-50',
      textRenk: 'text-blue-600'
    },
    {
      baslik: 'Toplam İşlem',
      deger: istatistikler.toplam_islem,
      icon: Activity,
      renk: 'bg-green-500',
      acikRenk: 'bg-green-50',
      textRenk: 'text-green-600'
    },
    {
      baslik: 'Toplam Kontrol',
      deger: istatistikler.toplam_kontrol,
      icon: Users,
      renk: 'bg-purple-500',
      acikRenk: 'bg-purple-50',
      textRenk: 'text-purple-600'
    },
    {
      baslik: 'Onaylanmış',
      deger: istatistikler.onaylanmis_kayit,
      icon: TrendingUp,
      renk: 'bg-emerald-500',
      acikRenk: 'bg-emerald-50',
      textRenk: 'text-emerald-600'
    },
    {
      baslik: 'Bekleyen',
      deger: istatistikler.bekleyen_kayit,
      icon: Calendar,
      renk: 'bg-orange-500',
      acikRenk: 'bg-orange-50',
      textRenk: 'text-orange-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>

              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">SHM Raporları</h1>
                <p className="text-gray-600">İstatistikler ve analizler</p>
              </div>
            </div>

            <button
              onClick={exportRapor}
              className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg
                       hover:opacity-90 transition-opacity font-medium"
            >
              <Download className="w-5 h-5" />
              Rapor İndir
            </button>
          </div>
        </div>

        {/* Tarih Aralığı */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">Tarih Aralığı</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Başlangıç
              </label>
              <input
                type="date"
                value={tarihAraligi.baslangic}
                onChange={(e) => setTarihAraligi(prev => ({ ...prev, baslangic: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg
                         focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bitiş
              </label>
              <input
                type="date"
                value={tarihAraligi.bitis}
                onChange={(e) => setTarihAraligi(prev => ({ ...prev, bitis: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg
                         focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        {/* İstatistik Kartları */}
        {loading ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Yükleniyor...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {istatistikKartlari.map((kart, index) => {
              const Icon = kart.icon;
              return (
                <div key={index} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 ${kart.acikRenk} rounded-lg flex items-center justify-center`}>
                      <Icon className={`w-6 h-6 ${kart.textRenk}`} />
                    </div>
                  </div>

                  <h3 className="text-gray-600 text-sm font-medium mb-1">
                    {kart.baslik}
                  </h3>
                  <p className="text-3xl font-bold text-gray-900">
                    {kart.deger.toLocaleString('tr-TR')}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {/* Grafik Placeholder */}
        <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Günlük Trend</h3>
          <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500">Grafik görselleştirmesi yakında eklenecek</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
