'use client';
import { useState, useEffect } from 'react';
import {
  Package,
  Thermometer,
  Activity,
  FileBarChart,
  Download,
  CalendarClock,
  Calendar,
  TrendingUp,
  AlertTriangle,
  Truck,
  FileText,
  Table2,
  CheckCircle2,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import './report.css';

const REPORT_TYPES = [
  {
    id: 'inventory',
    label: 'Daily Inventory Status',
    icon: Package,
    description: 'Current botanical stocks, low-level alerts, and pending arrivals.'
  },
  {
    id: 'expiry',
    label: 'FIFO & Expiry Tracker',
    icon: CalendarClock,
    description: 'Track materials nearing expiration and check FIFO queues.'
  },
  {
    id: 'temperature',
    label: 'Cold-Chain Temperature',
    icon: Thermometer,
    description: 'Monitor sensor logs and temperature drift details across zones.'
  },
  {
    id: 'activity',
    label: 'Warehouse Audit Activity',
    icon: Activity,
    description: 'Review administrative logs, commits, and user access records.'
  },
];

export default function ReportPage() {
  const [reportType, setReportType] = useState('inventory');
  const [dateFrom, setDateFrom] = useState('2026-05-01');
  const [dateTo, setDateTo] = useState('2026-05-28');
  const [format, setFormat] = useState('pdf');
  const [generated, setGenerated] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [dateError, setDateError] = useState('');
  const [customNotes, setCustomNotes] = useState('');

  // Live database states
  const [inventory, setInventory] = useState([]);
  const [activities, setActivities] = useState([]);
  const [temperatures, setTemperatures] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // Fetch live context on load
  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const [invRes, auditRes, tempRes] = await Promise.all([
          fetch('/api/inventory'),
          fetch('/api/audit'),
          fetch('/api/cold-chain')
        ]);
        const invData = await invRes.json();
        const auditData = await auditRes.json();
        const tempData = await tempRes.json();

        if (invData.success) setInventory(invData.items);
        if (auditData.success) setActivities(auditData.logs);
        if (tempData.success) setTemperatures(tempData.temperatures);
      } catch (err) {
        console.error('Error loading report data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  // Validate date range
  useEffect(() => {
    if (dateFrom && dateTo && new Date(dateTo) < new Date(dateFrom)) {
      setDateError('End date cannot be earlier than start date');
    } else {
      setDateError('');
    }
  }, [dateFrom, dateTo]);

  function handleGenerate() {
    if (dateError) return;
    setGenerating(true);
    setGenerated(false);
    setTimeout(() => {
      setGenerating(false);
      setGenerated(true);
    }, 1200);
  }

  // Real client-side CSV/Excel generator and downloader
  function handleDownload() {
    // PDF format: open browser print dialog so user can save as PDF
    if (format === 'pdf') {
      window.print();
      return;
    }

    // Excel/CSV format: generate and download CSV file
    let csvContent = "\uFEFF"; // UTF-8 BOM for Excel compatibility

    if (reportType === 'inventory') {
      csvContent += "ID,Nama Bahan,Kategori,Jumlah Satuan,Lokasi,Tgl Masuk,Expired,Status\n";
      inventory.forEach(i => {
        csvContent += `"${i.id}","${i.name}","${i.category}","${i.qty} ${i.unit}","${i.location}","${i.dateIn}","${i.expiry}","${i.status}"\n`;
      });
    } else if (reportType === 'expiry') {
      csvContent += "ID,Nama Bahan,Tgl Expired,Sisa Hari,Status\n";
      inventory.forEach(i => {
        const diff = Math.ceil((new Date(i.expiry) - new Date()) / (1000 * 60 * 60 * 24));
        const daysLabel = diff <= 0 ? `${Math.abs(diff)} hari lalu` : `${diff} hari`;
        csvContent += `"${i.id}","${i.name}","${i.expiry}","${daysLabel}","${i.status}"\n`;
      });
    } else if (reportType === 'activity') {
      csvContent += "Timestamp,Username,Role,Action,Detail,Module\n";
      activities.forEach(log => {
        csvContent += `"${log.timestamp}","${log.username}","${log.role}","${log.action}","${log.detail}","${log.module}"\n`;
      });
    } else if (reportType === 'temperature') {
      csvContent += "Zone,Hour,Temperature,Timestamp\n";
      Object.entries(temperatures).forEach(([zoneId, readings]) => {
        readings.forEach(r => {
          csvContent += `"${r.zone}","${r.hour}","${r.temperature}°C","${r.timestamp}"\n`;
        });
      });
    }

    // Append custom notes if present
    if (customNotes.trim()) {
      csvContent += "\n\n\"--- Custom Notes ---\"\n";
      csvContent += `"${customNotes.replace(/"/g, '""')}"\n`;
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Laporan_${reportType}_${dateFrom}_to_${dateTo}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const selectedReport = REPORT_TYPES.find(r => r.id === reportType);

  // Check if there's data for the selected period (simplified check)
  const hasDataForPeriod = () => {
    if (reportType === 'inventory' || reportType === 'expiry') return inventory.length > 0;
    if (reportType === 'activity') return activities.length > 0;
    if (reportType === 'temperature') return Object.keys(temperatures).length > 0;
    return false;
  };

  // Custom preview contents based on type
  const renderPreviewTable = () => {
    if (reportType === 'inventory') {
      return (
        <table className="data-table">
          <thead>
            <tr>
              <th scope="col">ID</th>
              <th scope="col">Material Name</th>
              <th scope="col">Category</th>
              <th scope="col">Quantity</th>
              <th scope="col">Status</th>
            </tr>
          </thead>
          <tbody>
            {inventory.slice(0, 5).map(item => (
              <tr key={item.id}>
                <td className="mono">{item.id}</td>
                <td style={{ fontWeight: 600 }}>{item.name}</td>
                <td>{item.category}</td>
                <td className="mono">{item.qty} {item.unit}</td>
                <td>
                  <span className={`badge ${item.status === 'Aman' ? 'badge-safe' : item.status === 'Warning' ? 'badge-warning' : 'badge-danger'}`}>
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }

    if (reportType === 'expiry') {
      return (
        <table className="data-table">
          <thead>
            <tr>
              <th scope="col">ID</th>
              <th scope="col">Material Name</th>
              <th scope="col">Expiry Date</th>
              <th scope="col">Days Remaining</th>
              <th scope="col">Status</th>
            </tr>
          </thead>
          <tbody>
            {inventory.slice(0, 5).map(item => {
              const diff = Math.ceil((new Date(item.expiry) - new Date()) / (1000 * 60 * 60 * 24));
              return (
                <tr key={item.id}>
                  <td className="mono">{item.id}</td>
                  <td style={{ fontWeight: 600 }}>{item.name}</td>
                  <td className="mono">{item.expiry}</td>
                  <td className="mono" style={{ fontWeight: 600, color: diff <= 7 ? 'var(--color-status-critical)' : 'inherit' }}>
                    {diff <= 0 ? 'Expired' : `${diff} hari`}
                  </td>
                  <td>
                    <span className={`badge ${item.status === 'Aman' ? 'badge-safe' : item.status === 'Warning' ? 'badge-warning' : 'badge-danger'}`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      );
    }

    if (reportType === 'activity') {
      return (
        <table className="data-table">
          <thead>
            <tr>
              <th scope="col">Timestamp</th>
              <th scope="col">User</th>
              <th scope="col">Action</th>
              <th scope="col">Detail</th>
            </tr>
          </thead>
          <tbody>
            {activities.slice(0, 5).map(log => (
              <tr key={log.id}>
                <td className="mono">{log.timestamp}</td>
                <td style={{ fontWeight: 600 }}>{log.username} <span style={{ fontSize: '10px', color: 'var(--color-text-secondary)' }}>({log.role})</span></td>
                <td><span className="badge badge-info">{log.action}</span></td>
                <td>{log.detail}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }

    if (reportType === 'temperature') {
      const readings = Object.values(temperatures).flatMap(r => r).slice(0, 5);
      return (
        <table className="data-table">
          <thead>
            <tr>
              <th scope="col">Zone</th>
              <th scope="col">Hour</th>
              <th scope="col">Sensor Temp</th>
              <th scope="col">Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {readings.map((r, i) => (
              <tr key={i}>
                <td style={{ fontWeight: 600 }}>Zona {r.zone}</td>
                <td className="mono">{r.hour}</td>
                <td className="mono" style={{ fontWeight: 600 }}>{r.temperature}°C</td>
                <td className="mono" style={{ fontSize: '11px' }}>{r.timestamp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }
  };

  return (
    <div className="report-page animate-fade">
      <div className="page-header">
        <h1 className="page-title">Auto-Report</h1>
        <p className="page-subtitle">
          Generate automated reports from your connected warehouse database in CSV/Excel format.
        </p>
      </div>

      <div className="report-layout">
        {/* Left Panel: Configuration Form */}
        <div className="report-config">
          <div className="report-config-header">
            <div className="report-config-icon">
              <FileBarChart size={20} aria-hidden="true" />
            </div>
            <div>
              <h3 className="report-config-title">Report Configuration</h3>
              <p className="report-config-subtitle">Define parameters for automated generation</p>
            </div>
          </div>

          {/* Report Type Selection */}
          <div className="report-section-label">Report Type</div>
          <div className="report-type-list">
            {REPORT_TYPES.map(rt => (
              <div
                key={rt.id}
                className={`report-type-card ${reportType === rt.id ? 'active' : ''}`}
                onClick={() => { setReportType(rt.id); setGenerated(false); }}
                role="radio"
                aria-checked={reportType === rt.id}
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { setReportType(rt.id); setGenerated(false); } }}
              >
                <div className="report-type-radio">
                  <div className="report-type-radio-dot" />
                </div>
                <div className="report-type-info">
                  <span className="report-type-name">{rt.label}</span>
                  <span className="report-type-desc">{rt.description}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Timeframe */}
          <div className="report-section-label">Timeframe</div>
          <div className="report-date-grid">
            <div className="report-date-wrapper">
              <Calendar size={15} className="report-date-icon" aria-hidden="true" />
              <input
                type="date"
                className={`report-date-input ${dateError ? 'input-error' : ''}`}
                value={dateFrom}
                onChange={e => setDateFrom(e.target.value)}
                aria-label="Start date"
              />
            </div>
            <div className="report-date-wrapper">
              <Calendar size={15} className="report-date-icon" aria-hidden="true" />
              <input
                type="date"
                className={`report-date-input ${dateError ? 'input-error' : ''}`}
                value={dateTo}
                onChange={e => setDateTo(e.target.value)}
                aria-label="End date"
              />
            </div>
            {dateError && (
              <div className="report-date-error" role="alert">
                <AlertCircle size={14} aria-hidden="true" />
                <span>{dateError}</span>
              </div>
            )}
          </div>

          {/* Export Format */}
          <div className="report-format-section">
            <div className="report-section-label">Export Format</div>
            <div className="report-format-group">
              <button
                type="button"
                className={`report-format-btn ${format === 'pdf' ? 'active' : ''}`}
                onClick={() => setFormat('pdf')}
                aria-pressed={format === 'pdf'}
              >
                <FileText size={17} aria-hidden="true" />
                PDF Report
              </button>
              <button
                type="button"
                className={`report-format-btn ${format === 'excel' ? 'active' : ''}`}
                onClick={() => setFormat('excel')}
                aria-pressed={format === 'excel'}
              >
                <Table2 size={17} aria-hidden="true" />
                Excel Data
              </button>
            </div>
          </div>

          {/* Generate Button */}
          <button
            className="report-generate-btn"
            onClick={handleGenerate}
            disabled={generating || isLoading || !!dateError}
            type="button"
          >
            <FileBarChart size={22} aria-hidden="true" />
            {generating ? 'Generating...' : 'Generate Report'}
          </button>
        </div>

        {/* Right Panel: Preview */}
        <div className="report-preview-panel">
          {!generated && !generating && (
            <div className="empty-state">
              <FileBarChart size={48} aria-hidden="true" />
              <h4 className="empty-state-title">Awaiting Configuration</h4>
              <p className="empty-state-text">Select a report type on the left and click Generate to see the preview here.</p>
            </div>
          )}

          {generating && (
            <div className="report-generating animate-fade">
              <div className="spinner spinner-lg" />
              <p>Gathering data and compiling report...</p>
            </div>
          )}

          {generated && !hasDataForPeriod() && (
            <div className="empty-state">
              <AlertCircle size={48} aria-hidden="true" />
              <h4 className="empty-state-title">No Data Found</h4>
              <p className="empty-state-text">No records were found for the selected period. Try adjusting the date range or report type.</p>
            </div>
          )}

          {generated && hasDataForPeriod() && (
            <>
              {/* Preview Header */}
              <div className="report-preview-header">
                <span className="report-preview-title">{selectedReport.label}</span>
                <div className="report-preview-badge">
                  <CheckCircle2 size={16} aria-hidden="true" />
                  <span>Live Preview</span>
                </div>
              </div>

              {/* KPI Bento Grid */}
              <div className="report-kpi-grid">
                <div className="report-kpi-card">
                  <div className="report-kpi-label">
                    <Package size={16} aria-hidden="true" />
                    <span>Total Raw Botanical</span>
                  </div>
                  <div className="report-kpi-value">
                    {inventory.reduce((sum, item) => sum + (item.unit === 'kg' ? item.qty : 0), 0).toLocaleString()}
                    <span className="kpi-unit">kg</span>
                  </div>
                  <div className="report-kpi-trend">
                    <TrendingUp size={12} aria-hidden="true" />
                    +2.4% vs yesterday
                  </div>
                </div>

                <div className="report-kpi-card has-accent">
                  <div className="kpi-accent-bar" />
                  <div className="report-kpi-label">
                    <AlertTriangle size={16} aria-hidden="true" />
                    <span>Low Stock Alerts</span>
                  </div>
                  <div className="report-kpi-value">
                    {inventory.filter(i => i.status === 'Warning' || i.status === 'Expired').length}
                    <span className="kpi-unit">items</span>
                  </div>
                  <div className="report-kpi-note">Action required today</div>
                </div>

                <div className="report-kpi-card">
                  <div className="report-kpi-label">
                    <Truck size={16} aria-hidden="true" />
                    <span>Pending Arrivals</span>
                  </div>
                  <div className="report-kpi-value">
                    12<span className="kpi-unit">pallets</span>
                  </div>
                  <div className="report-kpi-note">Expected by 14:00</div>
                </div>
              </div>

              {/* Chart Area: Top Botanical Reserves */}
              <div className="report-chart-area">
                <h4 className="report-chart-title">Top Botanical Reserves</h4>
                <div className="report-bar-row">
                  <div className="report-bar-labels">
                    <span className="report-bar-name">Lavender Oil (Grade A)</span>
                    <span className="report-bar-value">850 kg / 1000 kg</span>
                  </div>
                  <div className="report-bar-track">
                    <div className="report-bar-fill" style={{ width: '85%', background: 'var(--color-brand-primary)' }} />
                  </div>
                </div>
                <div className="report-bar-row">
                  <div className="report-bar-labels">
                    <span className="report-bar-name">Peppermint Extract</span>
                    <span className="report-bar-value">620 kg / 800 kg</span>
                  </div>
                  <div className="report-bar-track">
                    <div className="report-bar-fill" style={{ width: '77%', background: '#8fb157' }} />
                  </div>
                </div>
                <div className="report-bar-row">
                  <div className="report-bar-labels">
                    <span className="report-bar-name">Sandalwood Base</span>
                    <span className="report-bar-value warning">120 kg / 500 kg (Crit Low)</span>
                  </div>
                  <div className="report-bar-track">
                    <div className="report-bar-fill" style={{ width: '24%', background: 'var(--color-status-warning)' }} />
                  </div>
                </div>
                <div className="report-bar-row">
                  <div className="report-bar-labels">
                    <span className="report-bar-name">Eucalyptus Crude</span>
                    <span className="report-bar-value">450 kg / 600 kg</span>
                  </div>
                  <div className="report-bar-track">
                    <div className="report-bar-fill" style={{ width: '75%', background: '#4e7d22' }} />
                  </div>
                </div>
              </div>

              {/* AI Summary Notes */}
              <div className="report-ai-summary">
                <h4 className="report-ai-summary-title">
                  <Sparkles size={14} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} aria-hidden="true" />
                  Copilot Summary
                </h4>
                <p className="report-ai-summary-text">
                  Inventory levels are generally stable across primary botanical categories. However, Sandalwood Base has fallen below the 25% safety threshold. Recommend expediting PO #4892 from supplier to avoid production delays next week. Lavender reserves remain optimal following yesterday&apos;s shipment.
                </p>
              </div>

              {/* Custom Notes Section */}
              <div className="report-ai-summary" style={{ marginTop: 'var(--space-3)' }}>
                <h4 className="report-ai-summary-title">
                  <FileText size={14} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} aria-hidden="true" />
                  Custom Notes / Observations
                </h4>
                <textarea
                  className="report-custom-notes"
                  placeholder="Add your custom notes or observations here. These will be included when downloading the report..."
                  value={customNotes}
                  onChange={(e) => setCustomNotes(e.target.value)}
                  rows={4}
                  style={{
                    width: '100%',
                    marginTop: '8px',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid var(--color-border)',
                    background: 'var(--color-bg-secondary)',
                    color: 'var(--color-text-primary)',
                    fontSize: '13px',
                    fontFamily: 'inherit',
                    resize: 'vertical',
                    outline: 'none'
                  }}
                  aria-label="Custom notes for report"
                />
              </div>

              {/* Sample Data Table */}
              <div className="report-chart-area" style={{ padding: '20px' }}>
                <h4 className="report-chart-title" style={{ fontSize: '16px', marginBottom: 'var(--space-4)' }}>Sample Data Detail</h4>
                <div style={{ overflowX: 'auto' }}>
                  {renderPreviewTable()}
                </div>

              </div>

              {/* Download Button */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--space-3)' }}>
                <button
                  className="report-download-btn"
                  onClick={handleDownload}
                  disabled={!generated}
                  type="button"
                >
                  <Download size={14} aria-hidden="true" />
                  {format === 'pdf' ? 'Print / Save as PDF' : 'Download Excel (CSV)'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
