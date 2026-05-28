export default function DashboardLoading() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 120px)', gap: '16px' }}>
      <div style={{ width: '48px', height: '48px', border: '4px solid #EEF3E7', borderTop: '4px solid #366306', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <p style={{ fontSize: '14px', color: '#566050', fontFamily: "'Poppins', sans-serif", margin: 0 }}>Loading...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
