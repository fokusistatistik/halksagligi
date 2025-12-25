'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  List, Plus, Filter, Calendar, CheckCircle2, XCircle, Clock,
  Eye, Edit2, Trash2, FileText
} from 'lucide-react';

interface VeriGiris {
  id: string;
  tarih: string;
  poliklinik_islem_sayisi: number;
  poliklinik_kontrol_sayisi: number;
  onay_durumu: 'BEKLEMEDE' | 'ONAYLANDI' | 'REDDEDILDI';
  shm_alt_birim: {
    ad: string;
    kod: string;
  };
  created_at: string;
}

export default function SHMListePage() {
  const router = useRouter();
  const [veriGirisleri, setVeriGirisleri] = useState<VeriGiris[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    baslangic_tarihi: '',
    bitis_tarihi: '',
    onay_durumu: ''
  });

  useEffect(() => {
    loadVeriGirisleri();
  }, [filter]);

  const loadVeriGirisleri = async () => {
    try {
      const params = new URLSearchParams();
      if (filter.baslangic_tarihi) params.append('baslangic_tarihi', filter.baslangic_tarihi);
      if (filter.bitis_tarihi) params.append('bitis_tarihi', filter.bitis_tarihi);
      if (filter.onay_durumu) params.append('onay_durumu', filter.onay_durumu);

      const res = await fetch(`/api/shm/veri-giris?${params.toString()}`);
      const data = await res.json();

      if (data.success) {
        setVeriGirisleri(data.data);
      }
    } catch (_err) {
      console.error('Veriler yüklenemedi:', _err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu kaydı silmek istediğinizden emin misiniz?')) return;

    try {
      const res = await fetch(`/api/shm/veri-giris/${id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        setVeriGirisleri(prev => prev.filter(v => v.id !== id));
      } else {
        alert('Kayıt silinemedi');
      }
    } catch (_err) {
      alert('Bir hata oluştu');
    }
  };

  const getOnayDurumuBadge = (durum: string) => {
    switch (durum) {
      case 'ONAYLANDI':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle2 className="w-3 h-3" />
            Onaylandı
          </span>
        );
      case 'REDDEDILDI':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="w-3 h-3" />
            Reddedildi
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3" />
            Beklemede
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <List className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">SHM Veri Girişleri</h1>
                <p className="text-gray-600">Tüm veri girişlerini görüntüleyin ve yönetin</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => router.push('/shm/rapor')}
                className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg
                         hover:bg-gray-200 transition-colors font-medium"
              >
                <FileText className="w-5 h-5" />
                Raporlar
              </button>

              <button
                onClick={() => router.push('/shm/veri-giris')}
                className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg
                         hover:opacity-90 transition-opacity font-medium"
              >
                <Plus className="w-5 h-5" />
                Yeni Veri Girişi
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <h3 className="font-semibold text-gray-900">Filtrele</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Başlangıç Tarihi
              </label>
              <input
                type="date"
                value={filter.baslangic_tarihi}
                onChange={(e) => setFilter(prev => ({ ...prev, baslangic_tarihi: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg
                         focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bitiş Tarihi
              </label>
              <input
                type="date"
                value={filter.bitis_tarihi}
                onChange={(e) => setFilter(prev => ({ ...prev, bitis_tarihi: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg
                         focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Onay Durumu
              </label>
              <select
                value={filter.onay_durumu}
                onChange={(e) => setFilter(prev => ({ ...prev, onay_durumu: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg
                         focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Tümü</option>
                <option value="BEKLEMEDE">Beklemede</option>
                <option value="ONAYLANDI">Onaylandı</option>
                <option value="REDDEDILDI">Reddedildi</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Yükleniyor...</p>
            </div>
          ) : veriGirisleri.length === 0 ? (
            <div className="p-12 text-center">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">Henüz veri girişi bulunmuyor</p>
              <button
                onClick={() => router.push('/shm/veri-giris')}
                className="mt-4 text-primary hover:underline font-medium"
              >
                İlk veri girişini oluşturun
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tarih
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Alt Birim
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      İşlem
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kontrol
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Durum
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {veriGirisleri.map((veri) => (
                    <tr key={veri.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(veri.tarih).toLocaleDateString('tr-TR')}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {veri.shm_alt_birim.ad}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {veri.poliklinik_islem_sayisi}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {veri.poliklinik_kontrol_sayisi}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getOnayDurumuBadge(veri.onay_durumu)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => router.push(`/shm/detay/${veri.id}`)}
                            className="text-primary hover:text-primary/80 p-2 hover:bg-gray-100 rounded"
                            title="Görüntüle"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {veri.onay_durumu === 'BEKLEMEDE' && (
                            <>
                              <button
                                onClick={() => router.push(`/shm/duzenle/${veri.id}`)}
                                className="text-blue-600 hover:text-blue-800 p-2 hover:bg-gray-100 rounded"
                                title="Düzenle"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>

                              <button
                                onClick={() => handleDelete(veri.id)}
                                className="text-red-600 hover:text-red-800 p-2 hover:bg-gray-100 rounded"
                                title="Sil"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
