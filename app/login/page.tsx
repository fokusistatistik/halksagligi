'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogIn, AlertCircle, Building2 } from 'lucide-react';
import PasswordInput from '@/components/password-input';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    tc_kimlik_no: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Giriş başarısız');
      }

      // Token'ı localStorage'a kaydet
      if (data.token) {
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('user', JSON.stringify(data.personel));
      }

      // İlk giriş kontrolü
      if (data.ilk_giris) {
        // İlk giriş ise şifre değiştirme sayfasına yönlendir
        router.push('/sifre-degistir');
      } else {
        // Normal giriş, ana sayfaya yönlendir
        router.push('/');
      }
    } catch (err: any) {
      setError(err.message || 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto mb-4">
            <img
              src="https://static.fokusistatistik.com/resimler/kism.png"
              alt="Kocaeli İl Sağlık Müdürlüğü"
              className="h-24 mx-auto"
            />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Kocaeli İl Sağlık Müdürlüğü
          </h1>
          <p className="text-gray-600">Halk Sağlığı Görev Yönetim Sistemi</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-xl shadow-xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <LogIn className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold text-gray-900">Giriş Yap</h2>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="tc_kimlik_no" className="block text-sm font-medium text-gray-700 mb-2">
                TC Kimlik No
              </label>
              <input
                id="tc_kimlik_no"
                name="tc_kimlik_no"
                type="text"
                value={formData.tc_kimlik_no}
                onChange={handleChange}
                placeholder="11 haneli TC Kimlik No"
                required
                maxLength={11}
                pattern="[0-9]{11}"
                autoComplete="username"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg
                         focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                         transition-all"
              />
            </div>

            <div>
              <PasswordInput
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                label="Şifre"
                placeholder="Şifrenizi giriniz"
                required
                autoComplete="current-password"
              />
            </div>

            {/* Şifremi Unuttum Link */}
            <div className="flex justify-end">
              <Link
                href="/sifre-sifirla"
                className="text-sm text-primary hover:opacity-80 font-medium hover:underline"
              >
                Şifremi Unuttum
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-3 px-4 rounded-lg font-medium
                       hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
                       disabled:opacity-50 disabled:cursor-not-allowed transition-all
                       shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Giriş yapılıyor...
                </span>
              ) : (
                'Giriş Yap'
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            © 2024 Kocaeli İl Sağlık Müdürlüğü
            <br />
            <span className="text-xs">Powered by FOKUS İstatistik</span>
          </p>
        </div>
      </div>
    </div>
  );
}
