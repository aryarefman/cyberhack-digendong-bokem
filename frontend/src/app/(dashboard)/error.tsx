'use client';

export default function DashboardError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
      <div className="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center">
        <span className="text-3xl">⚠️</span>
      </div>
      <div className="text-center space-y-2">
        <h2 className="text-xl font-bold text-[#1C1B1F]">Terjadi Kesalahan</h2>
        <p className="text-sm text-[#79747E] max-w-sm">{error.message || 'Halaman ini mengalami error yang tidak terduga.'}</p>
      </div>
      <button onClick={reset}
        className="px-6 py-3 rounded-full bg-[#2C742F] text-white font-bold text-sm hover:bg-[#366306] transition-all shadow-md">
        Coba Lagi
      </button>
    </div>
  );
}
