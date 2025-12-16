'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Building2, CheckCircle, AlertCircle } from 'lucide-react';

interface Birim {
  id: string;
  ad: string;
  kod: string;
  tip: string;
  aktif: boolean;
  telefon?: string;
  email?: string;
  created_at: string;
}

export default function AdminBirimlerPage() {
  const [birimler, setBirimler] = useState<Birim[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBirim, setEditingBirim] = useState<Birim | null>(null);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    ad: '',
    kod: '',
    tip: 'SHM',
    telefon: '',
    email: '',
    aktif: true
  });

  useEffect(() => {
    loadBirimler();
  }, []);

  const loadBirimler = async () => {
    try {
      const res = await fetch('/api/admin/birimler');
      const data = await res.json();
      if (data.success) {
        setBirimler(data.data);
      }
    } catch (err) {
      console.error('Birimler yüklenemedi:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const url = editingBirim
        ? `/api/admin/birimler/${editingBirim.id}`
        : '/api/admin/birimler';

      const method = editingBirim ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'İşlem başarısız');
      }

      setSuccess(editingBirim ? 'Birim güncellendi' : 'Birim oluşturuldu');
      setShowModal(false);
      resetForm();
      loadBirimler();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu birimi silmek istediğinizden emin misiniz?')) return;

    try {
      const res = await fetch(`/api/admin/birimler/${id}`, {
        method: 'DELETE'
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }

      setSuccess('Birim silindi');
      loadBirimler();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const openEditModal = (birim: Birim) => {
    setEditingBirim(birim);
    setFormData({
      ad: birim.ad,
      kod: birim.kod,
      tip: birim.tip,
      telefon: birim.telefon || '',
      email: birim.email || '',
      aktif: birim.aktif
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      ad: '',
      kod: '',
      tip: 'SHM',
      telefon: '',
      email: '',
      aktif: true
    });
    setEditingBirim(null);
  };

  const getBirimTipBadge = (tip: string) => {
    const colors: any = {
      SHM: 'bg-green-100 text-green-800',
      ASM: 'bg-blue-100 text-blue-800',
      BASKANLIK_BIRIMI: 'bg-purple-100 text-purple-800',
      TOPLUM_SAGLIGI: 'bg-orange-100 text-orange-800'
    };

    const labels: any = {
      SHM: 'Sağlıklı Hayat Merkezi',
      ASM: 'Aile Sağlığı Merkezi',
      BASKANLIK_BIRIMI: 'Başkanlık Birimi',
      TOPLUM_SAGLIGI: 'Toplum Sağlığı Merkezi'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[tip] || 'bg-gray-100 text-gray-800'}`}>
        {labels[tip] || tip}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Birim Yönetimi</h1>
                <p className="text-gray-600">ASM ve SHM birimlerini yönetin</p>
              </div>
            </div>

            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg
                       hover:opacity-90 transition-opacity font-medium"
            >
              <Plus className="w-5 h-5" />
              Yeni Birim
            </button>
          </div>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-sm text-green-800">{success}</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Yükleniyor...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Birim Adı
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Kod
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Tip
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      İletişim
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Durum
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {birimler.map((birim) => (
                    <tr key={birim.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {birim.ad}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {birim.kod}
                      </td>
                      <td className="px-6 py-4">
                        {getBirimTipBadge(birim.tip)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <div>{birim.telefon}</div>
                        <div className="text-xs text-gray-500">{birim.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        {birim.aktif ? (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Aktif
                          </span>
                        ) : (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            Pasif
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(birim)}
                            className="text-blue-600 hover:text-blue-800 p-2 hover:bg-gray-100 rounded"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(birim.id)}
                            className="text-red-600 hover:text-red-800 p-2 hover:bg-gray-100 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">
                {editingBirim ? 'Birim Düzenle' : 'Yeni Birim Oluştur'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Birim Adı *
                  </label>
                  <input
                    type="text"
                    value={formData.ad}
                    onChange={(e) => setFormData({ ...formData, ad: e.target.value })}
                    required
                    placeholder="Örn: İzmit Sağlıklı Hayat Merkezi"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Birim Kodu *
                  </label>
                  <input
                    type="text"
                    value={formData.kod}
                    onChange={(e) => setFormData({ ...formData, kod: e.target.value.toUpperCase() })}
                    required
                    placeholder="Örn: SHM-IZMIT"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Birim Tipi *
                  </label>
                  <select
                    value={formData.tip}
                    onChange={(e) => setFormData({ ...formData, tip: e.target.value })}
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                  >
                    <option value="SHM">Sağlıklı Hayat Merkezi</option>
                    <option value="ASM">Aile Sağlığı Merkezi</option>
                    <option value="TOPLUM_SAGLIGI">Toplum Sağlığı Merkezi</option>
                    <option value="BASKANLIK_BIRIMI">Başkanlık Birimi</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefon
                  </label>
                  <input
                    type="tel"
                    value={formData.telefon}
                    onChange={(e) => setFormData({ ...formData, telefon: e.target.value })}
                    placeholder="0262 XXX XX XX"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="birim@saglik.gov.tr"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.aktif}
                      onChange={(e) => setFormData({ ...formData, aktif: e.target.checked })}
                      className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                    />
                    <span className="text-sm font-medium text-gray-700">Aktif</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="submit"
                  className="flex-1 bg-primary text-white py-2.5 px-4 rounded-lg font-medium hover:opacity-90"
                >
                  {editingBirim ? 'Güncelle' : 'Oluştur'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-6 py-2.5 border border-gray-300 rounded-lg font-medium hover:bg-gray-50"
                >
                  İptal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
