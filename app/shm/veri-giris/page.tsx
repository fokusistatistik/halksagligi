'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Save, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

interface AltBirim {
  id: string;
  ad: string;
  kod: string;
  tip: string;
}

interface BransVeri {
  [key: string]: string | number;
}

export default function SHMVeriGirisPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [altBirimler, setAltBirimler] = useState<AltBirim[]>([]);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    shm_alt_birim_id: '',
    personel_id: '', // Bu session'dan gelecek
    tarih: new Date().toISOString().split('T')[0],
    poliklinik_islem_sayisi: 0,
    poliklinik_kontrol_sayisi: 0,
    sorumlu_adi: '',
    sorumlu_unvan: '',
    aciklama: '',
    notlar: ''
  });

  const [bransVerileri, setBransVerileri] = useState<BransVeri>({});

  useEffect(() => {
    loadAltBirimler();
    loadUserSession();
  }, []);

  const loadAltBirimler = async () => {
    try {
      const res = await fetch('/api/shm/alt-birimler');
      const data = await res.json();
      if (data.success) {
        setAltBirimler(data.data);
      }
    } catch (err) {
      console.error('Alt birimler yüklenemedi:', err);
    }
  };

  const loadUserSession = () => {
    // Session'dan personel_id alınacak
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      setFormData(prev => ({ ...prev, personel_id: userData.id }));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name.includes('sayisi') ? parseInt(value) || 0 : value
    }));
  };

  const handleBransChange = (bransAdi: string, deger: string) => {
    setBransVerileri(prev => ({
      ...prev,
      [bransAdi]: deger
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const payload = {
        ...formData,
        brans_verileri: Object.keys(bransVerileri).length > 0 ? bransVerileri : undefined
      };

      const res = await fetch('/api/shm/veri-giris', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Veri girişi başarısız');
      }

      setSuccess('Veri girişi başarıyla kaydedildi!');

      // Form temizle
      setFormData({
        ...formData,
        poliklinik_islem_sayisi: 0,
        poliklinik_kontrol_sayisi: 0,
        sorumlu_adi: '',
        sorumlu_unvan: '',
        aciklama: '',
        notlar: ''
      });
      setBransVerileri({});

      // 3 saniye sonra liste sayfasına yönlendir
      setTimeout(() => {
        router.push('/shm/liste');
      }, 3000);

    } catch (err: any) {
      setError(err.message || 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">SHM Veri Girişi</h1>
              <p className="text-gray-600">Sağlıklı Hayat Merkezi Günlük Veri Girişi</p>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-green-800">{success}</p>
              <p className="text-xs text-green-700 mt-1">Liste sayfasına yönlendiriliyorsunuz...</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6 space-y-6">
          {/* Tarih ve Alt Birim */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="tarih" className="block text-sm font-medium text-gray-700 mb-2">
                Tarih *
              </label>
              <input
                type="date"
                id="tarih"
                name="tarih"
                value={formData.tarih}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg
                         focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="shm_alt_birim_id" className="block text-sm font-medium text-gray-700 mb-2">
                Alt Birim *
              </label>
              <select
                id="shm_alt_birim_id"
                name="shm_alt_birim_id"
                value={formData.shm_alt_birim_id}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg
                         focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">Alt birim seçiniz</option>
                {altBirimler.map(birim => (
                  <option key={birim.id} value={birim.id}>
                    {birim.ad}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Poliklinik Verileri */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Poliklinik Verileri</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="poliklinik_islem_sayisi" className="block text-sm font-medium text-gray-700 mb-2">
                  İşlem Sayısı *
                </label>
                <input
                  type="number"
                  id="poliklinik_islem_sayisi"
                  name="poliklinik_islem_sayisi"
                  value={formData.poliklinik_islem_sayisi}
                  onChange={handleChange}
                  min="0"
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg
                           focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="poliklinik_kontrol_sayisi" className="block text-sm font-medium text-gray-700 mb-2">
                  Kontrol Sayısı *
                </label>
                <input
                  type="number"
                  id="poliklinik_kontrol_sayisi"
                  name="poliklinik_kontrol_sayisi"
                  value={formData.poliklinik_kontrol_sayisi}
                  onChange={handleChange}
                  min="0"
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg
                           focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Branş Verileri (Opsiyonel) */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Branş Verileri (Opsiyonel)</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Branş Adı"
                  className="px-4 py-2.5 border border-gray-300 rounded-lg"
                  onBlur={(e) => {
                    const bransAdi = e.target.value;
                    if (bransAdi) {
                      const nextInput = e.target.parentElement?.querySelector('input[type="text"]:last-child') as HTMLInputElement;
                      if (nextInput) nextInput.focus();
                    }
                  }}
                />
                <input
                  type="text"
                  placeholder="Değer"
                  className="px-4 py-2.5 border border-gray-300 rounded-lg"
                />
              </div>
              <p className="text-xs text-gray-500">
                Branş spesifik verilerinizi girebilirsiniz (örn: Diyetisyen Konsültasyon: 15)
              </p>
            </div>
          </div>

          {/* Sorumlu Bilgileri */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Sorumlu Bilgileri</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="sorumlu_adi" className="block text-sm font-medium text-gray-700 mb-2">
                  Sorumlu Adı
                </label>
                <input
                  type="text"
                  id="sorumlu_adi"
                  name="sorumlu_adi"
                  value={formData.sorumlu_adi}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg
                           focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="sorumlu_unvan" className="block text-sm font-medium text-gray-700 mb-2">
                  Sorumlu Ünvanı
                </label>
                <input
                  type="text"
                  id="sorumlu_unvan"
                  name="sorumlu_unvan"
                  value={formData.sorumlu_unvan}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg
                           focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Açıklama ve Notlar */}
          <div className="border-t pt-6 space-y-4">
            <div>
              <label htmlFor="aciklama" className="block text-sm font-medium text-gray-700 mb-2">
                Açıklama
              </label>
              <textarea
                id="aciklama"
                name="aciklama"
                value={formData.aciklama}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg
                         focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="notlar" className="block text-sm font-medium text-gray-700 mb-2">
                Notlar
              </label>
              <textarea
                id="notlar"
                name="notlar"
                value={formData.notlar}
                onChange={handleChange}
                rows={2}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg
                         focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4 pt-6 border-t">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-primary text-white py-3 px-6 rounded-lg font-medium
                       hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
                       disabled:opacity-50 disabled:cursor-not-allowed transition-all
                       shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Kaydediliyor...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Kaydet
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700
                       hover:bg-gray-50 transition-colors"
            >
              İptal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
