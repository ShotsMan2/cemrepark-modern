'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('App Error:', error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6 bg-gray-50/50">
      <div className="max-w-md w-full bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-gray-100 p-8 text-center space-y-6 transform transition-all hover:scale-[1.02]">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900">Bir Şeyler Yanlış Gitti</h2>
        <p className="text-gray-500 text-sm">
          Beklenmedik bir hata oluştu. Lütfen tekrar deneyin veya ana sayfaya dönün.
        </p>
        
        <div className="flex flex-col space-y-3 pt-4">
          <button
            onClick={() => reset()}
            className="w-full py-3 px-4 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white rounded-xl font-medium transition-all shadow-md hover:shadow-lg focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Tekrar Dene
          </button>
          <Link
            href="/"
            className="w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-all"
          >
            Ana Sayfaya Dön
          </Link>
        </div>
      </div>
    </div>
  );
}
