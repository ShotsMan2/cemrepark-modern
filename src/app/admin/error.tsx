'use client';

import { useEffect } from 'react';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Admin Error:', error);
  }, [error]);

  return (
    <div className="w-full h-[80vh] flex items-center justify-center p-6">
      <div className="max-w-lg w-full bg-white rounded-3xl shadow-lg border border-slate-100 p-8 text-center space-y-6">
        <div className="w-24 h-24 bg-rose-100 rounded-3xl flex items-center justify-center mx-auto transform rotate-3">
          <svg className="w-12 h-12 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-800">Panel Hatası</h2>
          <p className="text-slate-500 text-sm">
            Yönetim panelinde beklenmeyen bir sorun oluştu. Detaylar konsola kaydedildi.
          </p>
        </div>
        
        <div className="flex flex-col space-y-3 pt-6">
          <button
            onClick={() => reset()}
            className="w-full py-3.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-medium transition-all shadow-md focus:ring-2 focus:ring-offset-2 focus:ring-slate-900"
          >
            Yeniden Yükle
          </button>
          <button
            onClick={() => window.location.href = '/admin'}
            className="w-full py-3.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-all"
          >
            Dashboard'a Dön
          </button>
        </div>
      </div>
    </div>
  );
}
