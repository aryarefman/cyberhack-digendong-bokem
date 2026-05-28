import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: '16px', padding: '48px', textAlign: 'center', background: '#D7E5D8' }}>
      <h1 style={{ fontSize: '72px', fontWeight: 700, color: '#366306', margin: 0, fontFamily: "'Poppins', sans-serif" }}>404</h1>
      <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#202224', margin: 0 }}>Page Not Found</h2>
      <p style={{ fontSize: '14px', color: '#566050', margin: 0, maxWidth: '400px' }}>
        The page you are looking for does not exist or has been moved.
      </p>
      <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: '#366306', color: '#fff', borderRadius: '8px', fontSize: '14px', fontWeight: 600, textDecoration: 'none', marginTop: '8px' }}>
        Go to Dashboard
      </Link>
    </div>
  );
}
