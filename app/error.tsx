'use client';

import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8 text-red-600" />
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-2">Bir Hata Oluştu</h2>
        <p className="text-gray-600 mb-6">
          {error.message || 'Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.'}
        </p>

        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:opacity-90"
          >
            Tekrar Dene
          </button>
          <a
            href="/"
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Ana Sayfa
          </a>
        </div>

        {error.digest && (
          <p className="mt-6 text-xs text-gray-500">
            Hata Kodu: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
