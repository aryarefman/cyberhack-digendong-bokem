'use client';
import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { 
  ShieldCheck, 
  Download, 
  Lock, 
  Calendar, 
  User, 
  AlertCircle 
} from 'lucide-react';
import './audit.css';

export default function AuditPage() {
  const { canViewAudit } = useAuth();
  const router = useRouter();
  
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uniqueUsers, setUniqueUsers] = useState([]);
  
  const [roleFilter, setRoleFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [toast, setToast] = useState(null);

  // Redirect if user cannot view audit
  useEffect(() => {
    if (!canViewAudit()) {
      router.push('/dashboard');
    }
  }, [canViewAudit, router]);

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      if (roleFilter && log.role.toLowerCase() !== roleFilter.toLowerCase()) {
        return false;
      }
      if (actionFilter) {
        const act = log.action.toLowerCase();
        if (actionFilter === 'create' && !act.includes('tambah') && !act.includes('create') && !act.includes('add')) return false;
        if (actionFilter === 'update' && !act.includes('ubah') && !act.includes('edit') && !act.includes('update')) return false;
        if (actionFilter === 'delete' && !act.includes('hapus') && !act.includes('delete') && !act.includes('remove')) return false;
      }
      return true;
    });
  }, [logs, roleFilter, actionFilter]);

  // Load initial unique users from full logs list
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const res = await fetch('/api/audit');
        const data = await res.json();
        if (data.success) {
          const users = [...new Set(data.logs.map(l => l.user))];
          setUniqueUsers(users);
        }
      } catch (err) {
        console.error('Error fetching initial users:', err);
      }
    };
    loadUsers();
  }, []);

  // Fetch dynamic logs based on current filters
  const fetchAuditLogs = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const queryParams = new URLSearchParams();
      if (dateFrom) queryParams.append('dateFrom', dateFrom);
      if (dateTo) queryParams.append('dateTo', dateTo);

      const res = await fetch(`/api/audit?${queryParams.toString()}`);
      const data = await res.json();
      if (data.success) {
        setLogs(data.logs);
      } else {
        setError('Failed to load audit logs.');
      }
    } catch (err) {
      console.error('Error fetching audit logs:', err);
      setError('Unable to connect to the server. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    Promise.resolve().then(fetchAuditLogs);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateFrom, dateTo]);

  // Export Log Handler
  const handleExport = () => {
    if (!logs || logs.length === 0) {
      setToast('No log data available to export!');
      setTimeout(() => setToast(null), 3000);
      return;
    }
    
    // Construct CSV Header & Rows
    const headers = ['ID', 'Waktu', 'User', 'Role', 'Aksi', 'Detail Perubahan', 'Modul'];
    const rows = logs.map(log => [
      log.id,
      `"${(log.timestamp || '').replace(/"/g, '""')}"`,
      `"${(log.user || '').replace(/"/g, '""')}"`,
      `"${(log.role || '').replace(/"/g, '""')}"`,
      `"${(log.action || '').replace(/"/g, '""')}"`,
      `"${(log.detail || '').replace(/"/g, '""')}"`,
      `"${(log.module || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `aromasys_audit_logs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setToast('Audit logs successfully exported to CSV!');
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="audit-page animate-fade">
      {/* Header */}
      <div className="flex justify-between items-center" style={{ marginBottom: 'var(--space-5)', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="page-title" style={{ fontSize: '32px', fontWeight: '700', color: '#202224', fontFamily: "'Poppins', sans-serif", margin: '0 0 8px 0' }}>Audit Trail</h1>
          <p className="page-subtitle" style={{ marginTop: 0, fontSize: '15px', color: '#212121', lineHeight: '1.4' }}>Immutable system activity log recorded in real-time (Live Neon DB)</p>
        </div>
        <button className="btn btn-secondary" onClick={handleExport} style={{ height: '42px', padding: '0 20px', borderRadius: '8px', border: '1px solid #366306', color: '#366306', background: 'transparent', fontWeight: '600', cursor: 'pointer', fontFamily: "'Poppins', sans-serif", display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Download size={16} /> Export Log
        </button>
      </div>

      {/* Info Banner */}
      <div className="alert-banner alert-info flex items-center gap-3" style={{ marginBottom: 'var(--space-5)', background: '#EEF3E7', borderLeft: '4px solid #366306', padding: '12px 16px', borderRadius: '6px' }}>
        <Lock size={18} style={{ color: '#366306' }} />
        <span className="alert-banner-text" style={{ fontSize: '13px', color: '#062012' }}>
          The audit trail is <strong>permanent &amp; cryptographically chained</strong> — activity logs cannot be edited, deleted, or manipulated by any system user.
        </span>
      </div>

      {/* Filters */}
      <div className="card audit-filters" style={{ background: '#FFFFFF', borderRadius: '12px' }}>
        <div className="audit-filter-row">
          <div className="audit-filter-field">
            <User size={16} className="audit-field-icon" style={{ color: '#737969' }} />
            <select 
              className="select" 
              value={roleFilter} 
              onChange={e => setRoleFilter(e.target.value)} 
              style={{ maxWidth: '160px', paddingLeft: '36px' }}
            >
              <option value="">All Roles</option>
              <option value="Admin">Admin</option>
              <option value="Manager">Manager</option>
              <option value="Operator">Operator</option>
            </select>
          </div>

          <div className="audit-filter-field">
            <ShieldCheck size={16} className="audit-field-icon" style={{ color: '#737969' }} />
            <select 
              className="select" 
              value={actionFilter} 
              onChange={e => setActionFilter(e.target.value)} 
              style={{ maxWidth: '160px', paddingLeft: '36px' }}
            >
              <option value="">All Actions</option>
              <option value="create">Create / Add</option>
              <option value="update">Update / Edit</option>
              <option value="delete">Delete / Remove</option>
            </select>
          </div>

          <div className="audit-filter-field">
            <Calendar size={16} className="audit-field-icon" style={{ color: '#737969' }} />
            <input
              type="date"
              className="input"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
              style={{ maxWidth: '180px', paddingLeft: '36px' }}
              title="Start Date"
            />
          </div>

          <div className="audit-filter-field">
            <Calendar size={16} className="audit-field-icon" style={{ color: '#737969' }} />
            <input
              type="date"
              className="input"
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
              style={{ maxWidth: '180px', paddingLeft: '36px' }}
              title="End Date"
            />
          </div>

          {(roleFilter || actionFilter || dateFrom || dateTo) && (
            <button 
              className="btn btn-ghost btn-sm text-secondary" 
              onClick={() => {
                setRoleFilter('');
                setActionFilter('');
                setDateFrom('');
                setDateTo('');
              }}
            >
              Reset Filters
            </button>
          )}
        </div>
        <span className="audit-count" style={{ fontSize: '13px', color: '#737969', fontWeight: '500' }}>
          Found <strong>{filteredLogs.length}</strong> log entries
        </span>
      </div>

      {/* Log Table */}
      <div className="card audit-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th scope="col">TIMESTAMP</th>
              <th scope="col">ACTOR</th>
              <th scope="col">ACTION STATEMENT</th>
              <th scope="col">METADATA</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', padding: '48px 0' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
                    <div style={{ width: '40px', height: '40px', border: '3px solid #EEF3E7', borderTop: '3px solid #366306', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ fontSize: '14px', fontWeight: '600', color: '#202224', fontFamily: "'Poppins', sans-serif", margin: '0 0 4px 0' }}>Connecting to Neon PostgreSQL...</p>
                      <p style={{ fontSize: '12px', fontWeight: '400', color: '#737969', fontFamily: "'Inter', sans-serif", margin: 0 }}>Fetching cryptographic audit logs...</p>
                    </div>
                  </div>
                  <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', padding: '48px 0' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
                    <AlertCircle size={48} style={{ color: 'var(--color-status-critical, #BA1A1A)' }} />
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ fontSize: '14px', fontWeight: '600', color: '#202224', fontFamily: "'Poppins', sans-serif", margin: '0 0 4px 0' }}>Failed to Load Audit Logs</p>
                      <p style={{ fontSize: '12px', fontWeight: '400', color: '#737969', fontFamily: "'Inter', sans-serif", margin: 0 }}>{error}</p>
                    </div>
                    <button className="btn btn-primary" onClick={fetchAuditLogs} style={{ marginTop: '8px' }}>
                      Retry
                    </button>
                  </div>
                </td>
              </tr>
            ) : filteredLogs.length > 0 ? (
              filteredLogs.map(log => (
                <tr key={log.id}>
                  <td className="mono text-secondary" style={{ fontSize: '13px', whiteSpace: 'nowrap' }}>{log.timestamp}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {log.avatar ? (
                        <img
                          src={log.avatar}
                          alt={`${log.user} avatar`}
                          className="audit-avatar"
                        />
                      ) : (
                        <div className="audit-avatar-placeholder" aria-label={`${log.user} initials`}>
                          {log.user ? log.user.charAt(0).toUpperCase() : '?'}
                        </div>
                      )}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontWeight: 600, color: '#202224' }}>{log.user}</span>
                        <span className="badge badge-role" style={{ alignSelf: 'flex-start', background: '#EEF3E7', color: '#366306', border: '1px solid rgba(54,99,6,0.1)' }}>{log.role}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <span className={`badge ${
                        log.action.includes('Hapus') || log.action.includes('Delete') ? 'badge-danger' :
                        log.action.includes('Edit') || log.action.includes('Ubah') ? 'badge-warning' :
                        'badge-info'
                      }`} style={{ alignSelf: 'flex-start' }}>{log.action}</span>
                      <span className="audit-detail" style={{ fontSize: '13px', color: '#404040', lineHeight: '1.4' }}>{log.detail}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span className="audit-module mono" style={{ fontSize: '12px', background: '#F4F5F7', padding: '2px 6px', borderRadius: '4px', alignSelf: 'flex-start' }}>{log.module}</span>
                      <span style={{ fontSize: '11px', color: '#737969' }}>ID: #{log.id}</span>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
                  <div className="empty-state">
                    <AlertCircle size={40} style={{ color: 'var(--color-text-disabled)' }} />
                    <h4 className="empty-state-title">No logs found</h4>
                    <p className="empty-state-text">No activity matches the current filtering criteria.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Simple Toast Notification */}
      {toast && (
        <div className="toast-notification toast-success animate-slide-right">
          <div className="toast-content">
            <ShieldCheck size={20} className="toast-icon" />
            <span className="toast-message">{toast}</span>
          </div>
        </div>
      )}
    </div>
  );
}
