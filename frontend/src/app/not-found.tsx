import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#D7E5D8]">
      <div className="text-center space-y-6 max-w-md px-6">
        <div className="text-8xl font-extrabold text-[#2C742F]/20">404</div>
        <h1 className="text-2xl font-extrabold text-[#1C1B1F]">Halaman Tidak Ditemukan</h1>
        <p className="text-sm text-[#79747E] font-medium leading-relaxed">
          Halaman yang kamu cari tidak ada atau sudah dipindahkan.
        </p>
        <Link href="/dashboard"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#2C742F] text-white font-bold text-sm hover:bg-[#366306] transition-all shadow-md">
          Kembali ke Dashboard
        </Link>
      </div>
    </div>
  );
}
