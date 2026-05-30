'use client';
import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { motion } from 'framer-motion';
import { ShieldCheck, Download, Lock, AlertCircle } from 'lucide-react';
import { api } from '@/lib/api';
import type { AuditLog } from '@/types';

export default function AuditPage() {
  const { canViewAudit } = useAuth();
  const router = useRouter();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => { if (!canViewAudit()) router.push('/dashboard'); }, [canViewAudit, router]);

  async function loadLogs() {
    try {
      setIsLoading(true); setError(null);
      const data = await api.get<{ success: boolean; logs: AuditLog[] }>('/audit');
      if (data.success) setLogs(data.logs ?? []);
      else setError('Failed to load audit logs.');
    } catch { setError('Could not connect to server.'); }
    finally { setIsLoading(false); }
  }

  useEffect(() => { Promise.resolve().then(loadLogs); }, []);

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      if (roleFilter && log.role?.toLowerCase() !== roleFilter.toLowerCase()) return false;
      if (actionFilter) {
        const act = log.action?.toLowerCase() ?? '';
        if (actionFilter === 'create' && !act.includes('tambah') && !act.includes('create') && !act.includes('add')) return false;
        if (actionFilter === 'update' && !act.includes('ubah') && !act.includes('edit') && !act.includes('update')) return false;
        if (actionFilter === 'delete' && !act.includes('hapus') && !act.includes('delete') && !act.includes('remove')) return false;
      }
      return true;
    });
  }, [logs, roleFilter, actionFilter]);

  const uniqueRoles = useMemo(() => [...new Set(logs.map(l => l.role).filter(Boolean))], [logs]);

  const actionColors: Record<string, string> = {
    'Tambah Stok': 'bg-emerald-100 text-emerald-700',
    'Edit Data': 'bg-blue-100 text-blue-700',
    'Hapus Data': 'bg-red-100 text-[#EA4B48]',
    'Generate Report': 'bg-purple-100 text-purple-700',
    'Upload Dokumen': 'bg-amber-100 text-amber-700',
    'Login': 'bg-stone-100 text-stone-600',
    'Register': 'bg-teal-100 text-teal-700',
  };

  const getActionBadge = (action: string) => actionColors[action] ?? 'bg-stone-100 text-stone-600';

  if (!canViewAudit()) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <Lock className="w-12 h-12 text-[#79747E]" />
      <p className="text-sm font-semibold text-[#1C1B1F]">Access restricted to PPIC and Admin only.</p>
    </div>
  );

  return (
    <div className="space-y-6 pb-16">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#2C742F]/10 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-[#2C742F]" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-[#1C1B1F]">Audit Trail</h1>
            <p className="text-xs text-[#79747E]">{filteredLogs.length} entries</p>
          </div>
        </div>
        <button
          onClick={() => {
            const csv = ['Timestamp,User,Role,Action,Detail,Module', ...filteredLogs.map(l => `"${l.timestamp}","${l.user || l.username}","${l.role}","${l.action}","${l.detail}","${l.module}"`)].join('\n');
            const a = document.createElement('a'); a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
            a.download = 'audit-trail.csv'; a.click();
            setToast('Exported!'); setTimeout(() => setToast(null), 2000);
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-stone-200 text-[#1C1B1F] text-sm font-semibold hover:bg-stone-50 shadow-sm transition-all">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="bg-[#D6E5D7]/40 rounded-xl p-4 border border-lime-400/20 flex flex-wrap gap-3">
        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
          className="border border-stone-200 rounded-xl px-3 py-2 text-sm text-[#1C1B1F] focus:outline-none focus:ring-1 focus:ring-[#2C742F]/30 bg-white">
          <option value="">All Roles</option>
          {uniqueRoles.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        <select value={actionFilter} onChange={e => setActionFilter(e.target.value)}
          className="border border-stone-200 rounded-xl px-3 py-2 text-sm text-[#1C1B1F] focus:outline-none focus:ring-1 focus:ring-[#2C742F]/30 bg-white">
          <option value="">All Actions</option>
          <option value="create">Create / Tambah</option>
          <option value="update">Update / Edit</option>
          <option value="delete">Delete / Hapus</option>
        </select>
        {(roleFilter || actionFilter) && (
          <button onClick={() => { setRoleFilter(''); setActionFilter(''); }}
            className="text-xs font-bold text-[#EA4B48] hover:text-red-700">Clear</button>
        )}
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3">
          <div className="spinner" style={{ width: 36, height: 36, borderWidth: 3 }} />
          <p className="text-sm text-[#79747E]">Loading audit logs...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3">
          <AlertCircle className="w-10 h-10 text-[#EA4B48]" />
          <p className="text-sm font-semibold text-[#1C1B1F]">{error}</p>
          <button onClick={loadLogs} className="px-4 py-2 rounded-full bg-[#2C742F] text-white text-sm font-semibold">Retry</button>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="bg-[#F5FBF3] rounded-2xl shadow-[6px_6px_54px_rgba(0,0,0,0.04)] border border-lime-400/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#2C742F]/5 border-b border-stone-100 sticky top-0 z-10">
                <tr>{['Timestamp', 'User', 'Role', 'Action', 'Detail', 'Module'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-bold text-[#79747E] uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}</tr>
              </thead>
              <tbody>
                {filteredLogs.length === 0 ? (
                  <tr><td colSpan={6} className="py-12 text-center text-sm text-[#79747E]">No logs found</td></tr>
                ) : filteredLogs.map((log, idx) => (
                  <motion.tr key={log.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03, duration: 0.25 }}
                    className="border-b border-stone-50 last:border-0 hover:bg-white/40 transition-colors">
                    <td className="px-4 py-3 text-xs font-mono text-[#79747E] whitespace-nowrap">{log.timestamp}</td>
                    <td className="px-4 py-3 font-semibold text-[#1C1B1F] whitespace-nowrap">{log.user || log.username}</td>
                    <td className="px-4 py-3 text-xs text-[#79747E]">{log.role}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${getActionBadge(log.action)}`}>{log.action}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-[#79747E] max-w-[260px] truncate">{log.detail}</td>
                    <td className="px-4 py-3 text-xs text-[#79747E]">{log.module}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 bg-[#2C742F] text-white px-4 py-2.5 rounded-xl shadow-lg text-sm font-semibold animate-fade">{toast}</div>
      )}
    </div>
  );
}
