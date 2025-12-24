'use client';

import { AlertTriangle } from 'lucide-react';

export default function GlobalError({
  error: _error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="tr">
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-2">Kritik Hata</h2>
            <p className="text-gray-600 mb-6">
              Uygulamada kritik bir hata oluştu. Lütfen sayfayı yenileyin.
            </p>

            <button
              onClick={reset}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:opacity-90"
            >
              Sayfayı Yenile
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
