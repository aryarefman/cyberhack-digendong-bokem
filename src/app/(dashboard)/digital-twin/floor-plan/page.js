'use client';
import { useState, useEffect, useMemo, useRef } from 'react';
import { useAuth } from '@/lib/auth';
import { ZONES, CATEGORIES } from '@/lib/mockData';
import {
  Plus,
  Sparkles,
  Pencil,
  Trash2,
  X,
  Package,
  Check,
  Bot,
  Lightbulb,
  Snowflake,
  Flame,
  Lock,
  Droplet,
  AlertTriangle,
  ArrowRightLeft,
  Upload,
  ImageIcon,
  FileUp
} from 'lucide-react';
import './floor-plan.css';

// 12 rooms mapping directly to specific database Slots for 100% dynamic connection
const ROOMS = [
  { id: 'A-1', name: 'LOADING DOCK', zone: 'A', theme: 'green', gridStyle: { gridColumn: '1 / 13', gridRow: '1' } },
  { id: 'A-2', name: 'Equipment Set Up', zone: 'A', theme: 'neutral', gridStyle: { gridColumn: '1 / 4', gridRow: '2 / 5' }, iconType: 'machinery' },
  { id: 'B-1', name: 'Tray Setting 1', zone: 'B', theme: 'neutral', gridStyle: { gridColumn: '4 / 7', gridRow: '2' }, hasStatusDot: true },
  { id: 'B-2', name: 'Tray Setting 2', zone: 'B', theme: 'neutral', gridStyle: { gridColumn: '7 / 10', gridRow: '2' } },
  { id: 'D-1', name: 'Cold Storage', zone: 'D', theme: 'green', gridStyle: { gridColumn: '10 / 13', gridRow: '2 / 5' }, iconType: 'snowflake', hasCapacityBar: true },
  { id: 'C-1', name: 'Hot Extraction', zone: 'C', theme: 'green', gridStyle: { gridColumn: '4 / 10', gridRow: '3 / 5' }, iconType: 'flame' },
  { id: 'C-3', name: 'Non-Production Machinery', zone: 'C', theme: 'neutral', gridStyle: { gridColumn: '1 / 4', gridRow: '5' } },
  { id: 'C-4', name: 'Locker Room', zone: 'C', theme: 'neutral', gridStyle: { gridColumn: '4 / 8', gridRow: '5' }, iconType: 'door' },
  { id: 'C-5', name: 'QC & Lab', zone: 'C', theme: 'green', gridStyle: { gridColumn: '8 / 10', gridRow: '5' } },
  { id: 'C-2', name: 'Pot Washing', zone: 'C', theme: 'neutral', gridStyle: { gridColumn: '10 / 13', gridRow: '5 / 7' }, iconType: 'wash' },
  { id: 'A-3', name: 'Receiving', zone: 'A', theme: 'green', gridStyle: { gridColumn: '1 / 4', gridRow: '6' } },
  { id: 'E-1', name: 'Hazard Storage', zone: 'E', theme: 'hazard', gridStyle: { gridColumn: '4 / 10', gridRow: '6' }, isHazard: true, iconType: 'warning' },
];

export default function FloorPlanPage() {
  const { user, canEdit, canDelete } = useAuth();

  // Dynamic slots loaded from the PostgreSQL database API
  const [slots, setSlots] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Selection & Popup states
  const [selectedSlotId, setSelectedSlotId] = useState(null);
  const [selectedSlotPopup, setSelectedSlotPopup] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addData, setAddData] = useState({ name: '', category: 'Essence', qty: '', unit: 'kg' });
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [isApplyingAI, setIsApplyingAI] = useState(false);
  const [toast, setToast] = useState(null);

  // Last added inventory item for dynamic AI suggestion
  const [lastIntakeItem, setLastIntakeItem] = useState(null);

  // Custom uploaded floor plan from localStorage
  const [customFloorPlan, setCustomFloorPlan] = useState(null);

  // Upload modal state
  const [showUploadPanel, setShowUploadPanel] = useState(false);
  const [uploadImageFile, setUploadImageFile] = useState(null);
  const [uploadImagePreview, setUploadImagePreview] = useState(null);
  const [uploadPdfFile, setUploadPdfFile] = useState(null);
  const [uploadDragActiveImage, setUploadDragActiveImage] = useState(false);
  const [uploadDragActivePdf, setUploadDragActivePdf] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const imageInputRef = useRef(null);
  const pdfInputRef = useRef(null);

  // Load custom floor plan from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('aromasys_floor_plan');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.imageDataUrl) {
          setCustomFloorPlan(parsed);
        }
      }
    } catch (err) {
      console.error('Error loading custom floor plan:', err);
    }
  }, []);

  // Toast Auto-Dismiss
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Fetch slots from API
  const fetchSlots = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/slots');
      const data = await res.json();
      if (data.success) {
        setSlots(data.slots);
      }
    } catch (err) {
      console.error('Error fetching slots:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch last intake item from inventory API for dynamic AI suggestions
  const fetchLastIntake = async () => {
    try {
      const res = await fetch('/api/inventory');
      const data = await res.json();
      if (data.success && data.items && data.items.length > 0) {
        // Sort by dateIn descending and get the most recent
        const sorted = [...data.items].sort((a, b) => new Date(b.dateIn) - new Date(a.dateIn));
        setLastIntakeItem(sorted[0]);
      }
    } catch (err) {
      console.error('Error fetching last intake:', err);
    }
  };

  useEffect(() => {
    Promise.resolve().then(fetchSlots);
    Promise.resolve().then(fetchLastIntake);
  }, []);

  // Find currently selected slot in database state
  const selectedSlot = useMemo(() => {
    if (!selectedSlotId) return null;
    return slots.find(s => s.id === selectedSlotId) || ROOMS.find(r => r.id === selectedSlotId);
  }, [slots, selectedSlotId]);

  // Helper to get zone colors per desain.md
  function getZoneColors(zoneId) {
    switch (zoneId) {
      case 'D': return { fill: '#E8F4FC', border: '#2980B9', text: '#1A5276' };
      case 'E': return { fill: '#FADBD8', border: '#E74C3C', text: '#922B21' };
      case 'C': return { fill: '#E8F5EE', border: '#1A7A4A', text: '#0F4F30' };
      case 'A': return { fill: '#FEF9E7', border: '#F39C12', text: '#784212' };
      case 'B': return { fill: '#EBF5FB', border: '#2980B9', text: '#1A5276' };
      default: return { fill: '#FFFFFF', border: '#D5D8DC', text: '#1C2833' };
    }
  }

  function handleSlotClick(slot) {
    setSelectedSlotId(slot.id);
    setSelectedSlotPopup(true);
    setShowAddForm(false);
    setAiSuggestion(null);
  }

  function closePopup() {
    setSelectedSlotPopup(false);
    setShowAddForm(false);
    setAiSuggestion(null);
  }

  function getPlacementSuggestion(cat) {
    let suggestion = 'Zona C (Bahan Umum)';
    if (['Kimia', 'Pengawet'].includes(cat)) suggestion = 'Zona E (Bahan Berbahaya)';
    if (['Susu', 'Cokelat'].includes(cat)) suggestion = 'Zona D (Cold Storage)';
    if (['Tepung', 'Gula'].includes(cat)) suggestion = 'Zona A (Bahan Kering)';
    if (['Minyak', 'Pewarna', 'Essence'].includes(cat)) suggestion = 'Zona B (Bahan Cair)';
    return suggestion;
  }

  // Generate dynamic AI recommendation based on last intake and selected room
  const aiRecommendation = useMemo(() => {
    if (!selectedSlot) return null;
    const room = ROOMS.find(r => r.id === selectedSlotId);
    const isOccupied = selectedSlot.item;

    if (lastIntakeItem && !isOccupied) {
      const suggestedZone = getPlacementSuggestion(lastIntakeItem.category);
      const zoneMatch = suggestedZone.includes(`Zona ${selectedSlot.zone}`);
      return {
        itemName: lastIntakeItem.name,
        category: lastIntakeItem.category,
        suggestion: zoneMatch
          ? `Slot ini cocok untuk "${lastIntakeItem.name}" (${lastIntakeItem.category}). ${suggestedZone} sesuai klasifikasi zona.`
          : `Rekomendasi: Pindahkan "${lastIntakeItem.name}" ke ${suggestedZone}. Slot ini berada di Zona ${selectedSlot.zone}.`,
        canApply: zoneMatch,
        targetSlot: selectedSlotId,
        item: lastIntakeItem
      };
    }

    if (!isOccupied) {
      const zoneNames = { A: 'Bahan Kering', B: 'Bahan Cair', C: 'Bahan Umum', D: 'Cold Storage', E: 'Bahan Berbahaya' };
      return {
        itemName: null,
        category: null,
        suggestion: `Slot ini tersedia untuk item kategori ${zoneNames[selectedSlot.zone] || 'Umum'} berdasarkan klasifikasi zona.`,
        canApply: false,
        targetSlot: selectedSlotId,
        item: null
      };
    }

    return null;
  }, [selectedSlot, selectedSlotId, lastIntakeItem]);

  function handleAddItem() {
    setShowAddForm(true);
    const cat = addData.category || 'Essence';
    setAddData(prev => ({ ...prev, category: cat }));
    const suggestion = getPlacementSuggestion(cat);
    setAiSuggestion(`Saran Penempatan: ${suggestion}`);
  }

  function handleCategoryChange(cat) {
    setAddData({ ...addData, category: cat });
    const suggestion = getPlacementSuggestion(cat);
    setAiSuggestion(`Saran Penempatan: ${suggestion}`);
  }

  // Handle direct database write from Digital Twin Panel
  const handleSaveNewItem = async (e) => {
    e.preventDefault();
    if (!addData.name || !addData.qty) {
      alert('Nama bahan dan kuantitas wajib diisi!');
      return;
    }

    try {
      const nextId = `INV-${Date.now().toString().slice(-3)}`;
      const zone = selectedSlot.zone;

      const payload = {
        id: nextId,
        name: addData.name,
        category: addData.category,
        qty: parseFloat(addData.qty),
        unit: addData.unit,
        location: selectedSlot.id,
        zone: zone,
        dateIn: new Date().toISOString().split('T')[0],
        expiry: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'Aman',
        user: { name: user.name, role: user.role }
      };

      const res = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': String(user?.id || ''), 'x-user-role': user?.role || 'Operator' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.success) {
        setToast(`Bahan baku "${addData.name}" berhasil disimpan di slot ${selectedSlot.id}!`);
        setAddData({ name: '', category: 'Essence', qty: '', unit: 'kg' });
        setShowAddForm(false);
        fetchSlots();
        fetchLastIntake();
      } else {
        alert('Gagal menyimpan: ' + data.error);
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan koneksi database.');
    }
  };

  // Handle applying the AI placement suggestion dynamically
  const handleApplyAISuggestion = async () => {
    if (!canEdit() || !aiRecommendation || !aiRecommendation.canApply || !aiRecommendation.item) return;
    setIsApplyingAI(true);
    
    try {
      const item = aiRecommendation.item;
      const targetSlotId = aiRecommendation.targetSlot;

      // Check if slot is already occupied
      const resSlots = await fetch('/api/slots');
      const dataSlots = await resSlots.json();
      const targetSlot = dataSlots.success ? dataSlots.slots.find(s => s.id === targetSlotId) : null;

      if (targetSlot && targetSlot.occupied) {
        setToast(`Gagal: Slot ${targetSlotId} sudah terisi!`);
        setIsApplyingAI(false);
        return;
      }

      const room = ROOMS.find(r => r.id === targetSlotId);
      const payload = {
        id: `INV-AI-${Date.now().toString().slice(-3)}`,
        name: item.name,
        category: item.category,
        qty: item.qty || 100,
        unit: item.unit || 'kg',
        location: targetSlotId,
        zone: room?.zone || 'C',
        dateIn: new Date().toISOString().split('T')[0],
        expiry: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'Aman',
        user: { name: user.name, role: user.role }
      };

      const res = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': String(user?.id || ''), 'x-user-role': user?.role || 'Operator' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.success) {
        setToast(`AI Suggestion Applied: "${item.name}" ditempatkan di ${room?.name || targetSlotId}!`);
        fetchSlots();
        fetchLastIntake();
      } else {
        alert('Gagal menerapkan rekomendasi AI: ' + data.error);
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan jaringan.');
    } finally {
      setIsApplyingAI(false);
    }
  };

  // Handle direct database delete from Digital Twin Panel
  const handleDeleteItem = async (itemId, itemName) => {
    if (!canDelete()) return;
    if (confirm(`Apakah Anda yakin ingin menghapus "${itemName}" dari database?`)) {
      try {
        const res = await fetch(`/api/inventory?id=${itemId}&userName=${encodeURIComponent(user.name)}&userRole=${encodeURIComponent(user.role)}`, {
          method: 'DELETE',
          headers: { 'x-user-id': String(user?.id || ''), 'x-user-role': user?.role || '' }
        });
        const data = await res.json();
        if (data.success) {
          setToast(`Bahan baku ${itemName} berhasil dihapus!`);
          fetchSlots();
          fetchLastIntake();
        } else {
          alert('Gagal menghapus: ' + data.error);
        }
      } catch (err) {
        console.error(err);
        alert('Terjadi kesalahan koneksi database.');
      }
    }
  };

  // Inline upload handlers
  const handleUploadImageDrop = (e) => {
    e.preventDefault();
    setUploadDragActiveImage(false);
    const file = e.dataTransfer.files[0];
    if (file && /\.(png|jpe?g|webp)$/i.test(file.name)) {
      setUploadImageFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => setUploadImagePreview(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleUploadPdfDrop = (e) => {
    e.preventDefault();
    setUploadDragActivePdf(false);
    const file = e.dataTransfer.files[0];
    if (file && /\.pdf$/i.test(file.name)) {
      setUploadPdfFile(file);
    }
  };

  const handleUploadImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadImageFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => setUploadImagePreview(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleUploadPdfChange = (e) => {
    const file = e.target.files[0];
    if (file) setUploadPdfFile(file);
  };

  const handleUploadSubmit = async () => {
    if (!uploadImageFile) return;
    setIsUploading(true);
    try {
      const imageDataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(uploadImageFile);
      });

      let zones = [];

      if (uploadPdfFile) {
        const formData = new FormData();
        formData.append('image', uploadImageFile);
        formData.append('pdf', uploadPdfFile);
        try {
          const res = await fetch('/api/floor-plan-upload', { method: 'POST', body: formData });
          const data = await res.json();
          if (data.success && data.zones) zones = data.zones;
        } catch (err) {
          console.error('PDF processing error:', err);
        }
      }

      const data = {
        imageDataUrl,
        fileName: uploadImageFile.name,
        uploadedAt: new Date().toISOString(),
        zones
      };
      localStorage.setItem('aromasys_floor_plan', JSON.stringify(data));
      setCustomFloorPlan(data);
      setShowUploadPanel(false);
      setUploadImageFile(null);
      setUploadImagePreview(null);
      setUploadPdfFile(null);
      setIsUploading(false);
      setToast('Floor plan uploaded successfully!');
    } catch (err) {
      console.error('Upload error:', err);
      setIsUploading(false);
    }
  };

  // Render proper icon inside rooms based on mockups
  function renderRoomIcon(iconType) {
    switch (iconType) {
      case 'snowflake':
        return <Snowflake className="room-bg-icon room-icon-snowflake" size={20} />;
      case 'flame':
        return <Flame className="room-bg-icon room-icon-flame" size={32} />;
      case 'door':
        return <Lock className="room-bg-icon room-icon-door" size={16} />;
      case 'wash':
        return <Droplet className="room-bg-icon room-icon-wash" size={16} />;
      case 'machinery':
        return <ArrowRightLeft className="room-bg-icon room-icon-machinery" size={16} />;
      default:
        return null;
    }
  }

  // Calculate stats for current selected room
  const selectedRoomStats = useMemo(() => {
    if (!selectedSlot) return { qty: 0, capacityPct: 0, occupied: false };
    const item = selectedSlot.item;
    const capacityPct = item ? Math.min(100, Math.round((item.qty / 500) * 100)) : 0;
    return {
      qty: item ? `${item.qty} ${item.unit}` : '0 kg',
      capacityPct,
      occupied: !!item,
      itemName: item ? item.name : 'Kosong',
      status: item ? item.status : 'N/A'
    };
  }, [selectedSlot]);

  // AI Recommendations: check all occupied slots for zone mismatches and critical statuses
  const allRecommendations = useMemo(() => {
    const recommendations = [];
    for (const slot of slots) {
      if (!slot.occupied || !slot.item) continue;
      const item = slot.item;
      const currentZone = slot.zone;
      const suggestedZone = getPlacementSuggestion(item.category);
      // Extract zone letter from suggestion string like "Zona B (Bahan Cair)"
      const suggestedZoneLetter = suggestedZone.match(/Zona ([A-E])/)?.[1];

      // Check zone mismatch
      if (suggestedZoneLetter && suggestedZoneLetter !== currentZone) {
        recommendations.push({
          itemName: item.name,
          suggestion: `Pindahkan "${item.name}" dari Zona ${currentZone} ke ${suggestedZone}`,
          priority: 'high'
        });
      }

      // Check expired/critical status
      if (item.status === 'Expired' || item.status === 'Kritis') {
        recommendations.push({
          itemName: item.name,
          suggestion: `"${item.name}" berstatus ${item.status}. Segera lakukan pengecekan atau pemindahan.`,
          priority: item.status === 'Expired' ? 'critical' : 'medium'
        });
      }
    }
    return recommendations;
  }, [slots]);

  return (
    <div className="floor-plan animate-fade">
      <div className="floor-plan-header">
        <h1 className="page-title" style={{ fontSize: '32px', fontWeight: '700', color: '#202224', fontFamily: "'Poppins', sans-serif", margin: '0' }}>Interactive Floor Plan</h1>
        <button className="btn btn-secondary btn-sm upload-floor-plan-btn" onClick={() => setShowUploadPanel(!showUploadPanel)}>
          <Upload size={14} /> Upload Floor Plan
        </button>
      </div>

      {/* Upload Floor Plan Modal */}
      {showUploadPanel && (
        <div className="fp-modal-backdrop" onClick={() => { setShowUploadPanel(false); setUploadImageFile(null); setUploadImagePreview(null); setUploadPdfFile(null); }}>
          <div className="fp-modal-card animate-scale" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>Upload Floor Plan</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => { setShowUploadPanel(false); setUploadImageFile(null); setUploadImagePreview(null); setUploadPdfFile(null); }}>
                <X size={16} />
              </button>
            </div>

            <div className="fp-modal-body">
              {/* Left: Image Upload */}
              <div className="fp-modal-section">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <ImageIcon size={18} style={{ color: 'var(--color-brand-primary)' }} />
                  <div>
                    <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>Floor Plan Image</h4>
                    <p style={{ margin: 0, fontSize: '12px', color: 'var(--color-text-secondary)' }}>PNG, JPG, or WEBP</p>
                  </div>
                </div>
                {uploadImageFile ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '12px', background: 'var(--color-bg-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-default)' }}>
                    {uploadImagePreview && <img src={uploadImagePreview} alt="Preview" style={{ width: '100%', maxHeight: '140px', objectFit: 'contain', borderRadius: 'var(--radius-md)' }} />}
                    <span style={{ fontSize: '12px', fontWeight: 500 }}>{uploadImageFile.name}</span>
                    <button className="btn btn-ghost btn-sm" onClick={() => { setUploadImageFile(null); setUploadImagePreview(null); }}>
                      <X size={12} /> Remove
                    </button>
                  </div>
                ) : (
                  <div
                    className={`upload-drop-zone ${uploadDragActiveImage ? 'drop-zone-active' : ''}`}
                    onDragOver={(e) => { e.preventDefault(); setUploadDragActiveImage(true); }}
                    onDragLeave={() => setUploadDragActiveImage(false)}
                    onDrop={handleUploadImageDrop}
                    onClick={() => imageInputRef.current?.click()}
                    style={{ minHeight: '160px' }}
                  >
                    <FileUp size={28} style={{ color: 'var(--color-text-secondary)', marginBottom: '6px' }} />
                    <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-text-secondary)' }}>Drop image or click to browse</p>
                    <span style={{ fontSize: '11px', color: 'var(--color-text-disabled)' }}>PNG, JPG, WEBP (max 10MB)</span>
                    <input ref={imageInputRef} type="file" accept=".png,.jpg,.jpeg,.webp" style={{ display: 'none' }} onChange={handleUploadImageChange} />
                  </div>
                )}
              </div>

              {/* Right: PDF Upload */}
              <div className="fp-modal-section">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <FileUp size={18} style={{ color: 'var(--color-status-critical)' }} />
                  <div>
                    <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>Zone Metadata (PDF)</h4>
                    <p style={{ margin: 0, fontSize: '12px', color: 'var(--color-text-secondary)' }}>Room/zone descriptions</p>
                  </div>
                </div>
                {uploadPdfFile ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '12px', background: 'var(--color-bg-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-default)' }}>
                    <div style={{ width: '48px', height: '48px', background: 'var(--color-status-critical-bg)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-status-critical)' }}>
                      <FileUp size={24} />
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: 500 }}>{uploadPdfFile.name}</span>
                    <button className="btn btn-ghost btn-sm" onClick={() => setUploadPdfFile(null)}>
                      <X size={12} /> Remove
                    </button>
                  </div>
                ) : (
                  <div
                    className={`upload-drop-zone ${uploadDragActivePdf ? 'drop-zone-active' : ''}`}
                    onDragOver={(e) => { e.preventDefault(); setUploadDragActivePdf(true); }}
                    onDragLeave={() => setUploadDragActivePdf(false)}
                    onDrop={handleUploadPdfDrop}
                    onClick={() => pdfInputRef.current?.click()}
                    style={{ minHeight: '160px' }}
                  >
                    <FileUp size={28} style={{ color: 'var(--color-text-secondary)', marginBottom: '6px' }} />
                    <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-text-secondary)' }}>Drop PDF or click to browse</p>
                    <span style={{ fontSize: '11px', color: 'var(--color-text-disabled)' }}>PDF (max 10MB)</span>
                    <input ref={pdfInputRef} type="file" accept=".pdf" style={{ display: 'none' }} onChange={handleUploadPdfChange} />
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '20px', justifyContent: 'flex-end' }}>
              <button className="btn btn-ghost btn-sm" onClick={() => { setShowUploadPanel(false); setUploadImageFile(null); setUploadImagePreview(null); setUploadPdfFile(null); }}>
                Cancel
              </button>
              <button
                className="btn btn-primary btn-sm"
                disabled={!uploadImageFile || isUploading}
                onClick={handleUploadSubmit}
              >
                {isUploading ? 'Uploading...' : 'Upload Floor Plan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floor Plan Grid — Full Width (no sidebar) */}
      <div className="floor-plan-main card" style={{ background: '#F8FAF9', padding: '24px' }}>
        {isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '420px', gap: '16px', background: '#FFFFFF', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border-default)' }}>
            <div className="spinner spinner-lg"></div>
            <p style={{ font: 'var(--text-body-sm)', color: 'var(--color-text-secondary)', fontWeight: 500, letterSpacing: '0.02em', animation: 'pulse 2s infinite' }}>Memuat denah gudang live...</p>
          </div>
        ) : customFloorPlan ? (
          <div className="custom-floor-plan-view">
            <div className="custom-floor-plan-image-container">
              <img
                src={customFloorPlan.imageDataUrl}
                alt="Custom warehouse floor plan"
                className="custom-floor-plan-image"
              />
              {customFloorPlan.zones && customFloorPlan.zones.map(zone => (
                <button
                  key={zone.id}
                  className={`floor-plan-hotspot ${selectedSlotId === zone.id ? 'hotspot-selected' : ''}`}
                  style={{
                    left: `${zone.position.x}%`,
                    top: `${zone.position.y}%`,
                    width: `${zone.position.width}%`,
                    height: `${zone.position.height}%`,
                  }}
                  onClick={() => handleSlotClick({ id: zone.id, zone: zone.id.split('-')[0] || zone.id, occupied: false })}
                  title={zone.name}
                >
                  <span className="hotspot-label">{zone.name}</span>
                </button>
              ))}
            </div>
            <div className="custom-floor-plan-info">
              <ImageIcon size={14} />
              <span>Custom floor plan uploaded {customFloorPlan.uploadedAt ? new Date(customFloorPlan.uploadedAt).toLocaleDateString() : ''}</span>
            </div>
          </div>
        ) : (
          <div className="floor-layout">
            {ROOMS.map(room => {
              const slot = slots.find(s => s.id === room.id) || { id: room.id, occupied: false, zone: room.zone };
              const item = slot.item;
              const isSelected = selectedSlotId === room.id;
              const capacityPct = item ? Math.min(100, Math.round((item.qty / 500) * 100)) : 0;
              const isDock = room.name === 'LOADING DOCK';

              return (
                <button
                  key={room.id}
                  className={`floor-room room-theme-${room.theme} ${item ? 'room-occupied' : 'room-empty'} ${isSelected ? 'room-selected' : ''}`}
                  onClick={() => handleSlotClick(slot)}
                  style={room.gridStyle}
                >
                  <div className="room-header-row">
                    <span className="room-name">
                      {room.isHazard && <AlertTriangle size={14} style={{ display: 'inline', color: 'var(--color-status-critical)', strokeWidth: 2.5 }} />}
                      {room.name}
                    </span>
                    {room.hasStatusDot && !item && (
                      <span className="room-status-dot">
                        <span className="status-dot-active"></span> Active
                      </span>
                    )}
                  </div>

                  {item ? (
                    <div className="room-item-details">
                      <span className="room-item-title">{item.name}</span>
                    </div>
                  ) : (
                    !isDock && <span className="room-empty-label">Kosong</span>
                  )}

                  {room.hasCapacityBar && item && (
                    <div className="room-capacity-container">
                      <span className="room-capacity-text">Capacity: {capacityPct}%</span>
                      <div className="room-capacity-bar">
                        <div style={{ width: `${capacityPct}%`, background: 'var(--color-brand-primary)' }}></div>
                      </div>
                    </div>
                  )}

                  {renderRoomIcon(room.iconType)}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* AI Recommendations Section */}
      {allRecommendations.length > 0 && (
        <div className="card fp-recommendations-section">
          <div className="fp-recommendations-header">
            <Bot size={20} />
            <h3>AI Placement Recommendations</h3>
            <span className="fp-recommendations-count">{allRecommendations.length} suggestions</span>
          </div>
          <div className="fp-recommendations-list">
            {allRecommendations.map((rec, i) => (
              <div key={i} className="fp-recommendation-item">
                <div className="fp-rec-icon">
                  <Lightbulb size={16} />
                </div>
                <div className="fp-rec-content">
                  <span className="fp-rec-item-name">{rec.itemName}</span>
                  <span className="fp-rec-text">{rec.suggestion}</span>
                </div>
                <span className={`fp-rec-priority fp-rec-priority-${rec.priority}`}>{rec.priority}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Popup Card Overlay — shown on room click */}
      {selectedSlotPopup && selectedSlot && (
        <div className="floor-plan-popup-backdrop" onClick={closePopup}>
          <div className="floor-plan-popup-card animate-scale" onClick={(e) => e.stopPropagation()}>
            {/* Popup Header */}
            <div className="popup-header">
              <div className="popup-header-left">
                {selectedSlot.id === 'D-1' ? (
                  <Snowflake size={20} className="popup-header-icon" />
                ) : selectedSlot.id === 'E-1' ? (
                  <AlertTriangle size={20} className="popup-header-icon text-danger" />
                ) : (
                  <Package size={20} className="popup-header-icon" />
                )}
                <div>
                  <h3 className="popup-title">
                    {ROOMS.find(r => r.id === selectedSlot.id)?.name || selectedSlot.id}
                  </h3>
                  <span className="popup-subtitle">
                    Zone {selectedSlot.zone} • {selectedSlot.id === 'D-1' ? '4°C Maintained' : 'Ambient Temp'}
                  </span>
                </div>
              </div>
              <button className="popup-close-btn" onClick={closePopup}>
                <X size={18} />
              </button>
            </div>

            <div className="popup-divider"></div>

            {/* Capacity Utilization */}
            <div className="popup-capacity-section">
              <div className="popup-capacity-labels">
                <span>Capacity Utilization</span>
                <strong>{selectedRoomStats.capacityPct}% full</strong>
              </div>
              <div className="popup-progress-bar">
                <div style={{ width: `${selectedRoomStats.capacityPct}%`, background: selectedSlot.id === 'E-1' ? 'var(--color-status-critical)' : 'var(--color-brand-primary)' }}></div>
              </div>
            </div>

            {/* Stats Row */}
            <div className="popup-stats-row">
              <div className="popup-stat-box">
                <span className="popup-stat-label">Active Drums</span>
                <span className="popup-stat-value">{selectedRoomStats.qty}</span>
              </div>
              <div className="popup-stat-box">
                <span className="popup-stat-label">Alerts</span>
                <span className="popup-stat-value" style={{ color: selectedRoomStats.status === 'Expired' || selectedRoomStats.status === 'Kritis' ? 'var(--color-status-critical)' : 'inherit' }}>
                  {selectedRoomStats.status === 'Expired' || selectedRoomStats.status === 'Kritis' ? '1' : '0'}
                </span>
              </div>
            </div>

            <div className="popup-divider"></div>

            {/* CRUD Section */}
            {selectedRoomStats.occupied ? (
              <div className="popup-crud-section">
                <div className="popup-item-info">
                  <span className="popup-info-label">Item Terdaftar</span>
                  <strong className="popup-info-val">{selectedRoomStats.itemName}</strong>
                </div>
                {canEdit() && canDelete() && (
                  <button 
                    className="btn btn-danger btn-sm" 
                    style={{ width: '100%', marginTop: '12px' }}
                    onClick={() => handleDeleteItem(selectedSlot.item.id, selectedSlot.item.name)}
                  >
                    <Trash2 size={14} /> Hapus Bahan
                  </button>
                )}
              </div>
            ) : (
              <div className="popup-empty-section">
                {!showAddForm ? (
                  canEdit() && (
                    <button className="btn btn-secondary btn-sm" style={{ width: '100%' }} onClick={handleAddItem}>
                      <Plus size={14} /> Input Barang Baru
                    </button>
                  )
                ) : (
                  <form onSubmit={handleSaveNewItem} className="popup-inline-form animate-fade">
                    <div className="form-group" style={{ marginBottom: '10px' }}>
                      <label className="field-label" htmlFor="popup-name">Nama Bahan</label>
                      <input
                        id="popup-name"
                        type="text"
                        className="input"
                        placeholder="Masukkan nama bahan..."
                        value={addData.name}
                        onChange={e => setAddData({ ...addData, name: e.target.value })}
                        required
                      />
                    </div>

                    <div className="form-group" style={{ marginBottom: '10px' }}>
                      <label className="field-label" htmlFor="popup-cat">Kategori</label>
                      <select
                        id="popup-cat"
                        className="select"
                        value={addData.category}
                        onChange={e => handleCategoryChange(e.target.value)}
                      >
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                      <div className="form-group" style={{ flex: 1 }}>
                        <label className="field-label" htmlFor="popup-qty">Kuantitas</label>
                        <input
                          id="popup-qty"
                          type="number"
                          min="1"
                          className="input"
                          placeholder="Kuantitas"
                          value={addData.qty}
                          onChange={e => setAddData({ ...addData, qty: e.target.value })}
                          required
                        />
                      </div>
                      <div className="form-group" style={{ width: '80px' }}>
                        <label className="field-label" htmlFor="popup-unit">Satuan</label>
                        <select
                          id="popup-unit"
                          className="select"
                          value={addData.unit}
                          onChange={e => setAddData({ ...addData, unit: e.target.value })}
                        >
                          <option value="kg">kg</option>
                          <option value="liter">liter</option>
                          <option value="pcs">pcs</option>
                        </select>
                      </div>
                    </div>

                    {aiSuggestion && (
                      <div className="ai-suggestion-badge animate-scale">
                        <Sparkles size={12} className="ai-badge-icon" />
                        <span>{aiSuggestion}</span>
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                      <button type="submit" className="btn btn-primary btn-sm" style={{ flex: 1 }}>
                        Simpan
                      </button>
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowAddForm(false)}>
                        Batal
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Toast Notification System */}
      {toast && (
        <div className="toast-notification toast-success animate-slide-right">
          <div className="toast-content">
            <Check size={20} className="toast-icon" />
            <span className="toast-message">{toast}</span>
          </div>
          <button className="toast-close" onClick={() => setToast(null)}>
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
