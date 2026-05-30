export default function DashboardLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="spinner" style={{ width: 40, height: 40, borderWidth: 3 }} />
      <p className="text-sm text-[#79747E] font-medium">Memuat halaman...</p>
    </div>
  );
}
