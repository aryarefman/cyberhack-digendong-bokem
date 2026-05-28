'use client';
import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = () => {
      const saved = localStorage.getItem('aromasys_user');
      if (saved) {
        try { setUser(JSON.parse(saved)); } catch {}
      }
      setLoading(false);
    };
    Promise.resolve().then(init);
  }, []);

  async function login(email, password) {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Email atau password salah' };
      }
      setUser(data.user);
      localStorage.setItem('aromasys_user', JSON.stringify(data.user));
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Gagal terhubung ke server database.' };
    }
  }

  async function register(name, email, password, role) {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Gagal mendaftar' };
      }
      setUser(data.user);
      localStorage.setItem('aromasys_user', JSON.stringify(data.user));
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Gagal terhubung ke server database.' };
    }
  }

  function logout() {
    setUser(null);
    localStorage.removeItem('aromasys_user');
    localStorage.removeItem('aromasys_notifications');
  }

  function canEdit() {
    return user && (user.role === 'QC' || user.role === 'Admin');
  }

  function canDelete() {
    return user && (user.role === 'QC' || user.role === 'Admin');
  }

  function canViewAudit() {
    return user && (user.role === 'PPIC' || user.role === 'Admin');
  }

  function isAdmin() {
    return user && user.role === 'Admin';
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register, canEdit, canDelete, canViewAudit, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
