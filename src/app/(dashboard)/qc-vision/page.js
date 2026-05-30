'use client';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { ScanSearch, Camera, UploadCloud, Play, AlertTriangle, CheckCircle, RefreshCcw, Loader2 } from 'lucide-react';
import './qc-vision.css';

export default function QcVisionPage() {
  const { user } = useAuth();
  
  const [mode, setMode] = useState('upload'); // 'upload' or 'camera'
  const [imagePreview, setImagePreview] = useState(null); // base64 string
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);

  // Clean up media stream when component unmounts or mode changes
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  useEffect(() => {
    if (mode === 'camera' && !imagePreview) {
      startCamera();
    } else {
      stopCamera();
    }
  }, [mode, imagePreview]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("Gagal mengakses kamera. Pastikan izin diberikan.");
      setMode('upload');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const captureImage = () => {
    if (!videoRef.current) return;
    
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    
    const base64Image = canvas.toDataURL('image/jpeg');
    setImagePreview(base64Image);
    stopCamera();
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError("Mohon unggah file gambar yang valid.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (mode !== 'upload') return;
    
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetCapture = () => {
    setImagePreview(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const runInspection = async () => {
    if (!imagePreview) return;

    setIsProcessing(true);
    setResult(null);
    setError(null);

    try {
      // Convert base64 to Blob
      const base64Data = imagePreview.split(',')[1];
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'image/jpeg' });
      
      const formData = new FormData();
      formData.append('file', blob, 'capture.jpg');

      const response = await fetch('/api/qc-vision', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Gagal menjalankan inspeksi.');
      }

      setResult(data);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Terjadi kesalahan saat menghubungi server.');
    } finally {
      setIsProcessing(false);
    }
  };

  // RBAC Constraint
  if (!user || !['QC', 'PPIC', 'Admin'].includes(user.role)) {
    return (
      <main className="dashboard-main p-6">
        <div className="card">
          <div className="empty-state">
            <AlertTriangle />
            <h2 className="empty-state-title">Akses Ditolak</h2>
            <p className="empty-state-text">Anda tidak memiliki izin untuk mengakses halaman QC Vision.</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="dashboard-main p-6 animate-fade">
      <div className="page-header">
        <h1 className="page-title">
          <ScanSearch />
          QC Vision Inspection
        </h1>
        <p className="page-subtitle">Pemeriksaan kualitas visual otomatis menggunakan AI untuk bahan baku botani.</p>
      </div>

      <div className="qc-vision-content">
        {/* Left Col: Capture Area */}
        <div className="card qc-vision-capture-card">
          <div className="card-header">
            <h2 className="card-title">Input Gambar</h2>
          </div>

          <div 
            className="qc-vision-viewport"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            {imagePreview ? (
              <img src={imagePreview} alt="Captured" className="qc-vision-image-preview" />
            ) : mode === 'camera' ? (
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                className="qc-vision-video"
              />
            ) : (
              <div className="qc-vision-placeholder">
                <UploadCloud />
                <span className="qc-vision-placeholder-text">Tarik dan lepas gambar di sini</span>
                <span className="qc-vision-placeholder-subtext">atau klik untuk memilih file</span>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  accept="image/*" 
                  className="qc-vision-file-input"
                  onChange={handleFileUpload}
                />
              </div>
            )}
          </div>

          {error && (
            <div className="alert-banner alert-critical">
              <AlertTriangle size={18} />
              <span className="alert-banner-text">{error}</span>
            </div>
          )}

          <div className="qc-vision-controls">
            {!imagePreview && (
              <div className="qc-vision-mode-toggle">
                <button 
                  className={`btn ${mode === 'upload' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                  onClick={() => setMode('upload')}
                >
                  <UploadCloud size={16} /> Upload
                </button>
                <button 
                  className={`btn ${mode === 'camera' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                  onClick={() => setMode('camera')}
                >
                  <Camera size={16} /> Kamera
                </button>
              </div>
            )}

            <div className="qc-vision-action">
              {imagePreview ? (
                <div className="flex gap-2">
                  <button className="btn btn-secondary" onClick={resetCapture} disabled={isProcessing}>
                    <RefreshCcw size={16} /> Ulangi
                  </button>
                  <button className="btn btn-primary" onClick={runInspection} disabled={isProcessing}>
                    {isProcessing ? (
                      <><Loader2 className="spinner" /> Memproses...</>
                    ) : (
                      <><Play size={16} /> Jalankan AI</>
                    )}
                  </button>
                </div>
              ) : mode === 'camera' ? (
                <button className="btn btn-primary w-full" onClick={captureImage}>
                  <Camera size={16} /> Ambil Foto
                </button>
              ) : null}
            </div>
          </div>
        </div>

        {/* Right Col: Result Area */}
        <div className="card qc-vision-results-card">
          <div className="card-header">
            <h2 className="card-title">Hasil Inspeksi</h2>
          </div>

          {isProcessing ? (
            <div className="qc-vision-result-empty">
              <Loader2 className="spinner spinner-lg text-brand-primary" />
              <span className="mt-3 text-body-sm">AI sedang menganalisis...</span>
            </div>
          ) : result ? (
            <div className="animate-scale">
              {result.status === 'ACCEPTED' ? (
                <div className="alert-banner alert-info mb-4" style={{ background: 'var(--color-status-safe-bg)', borderLeftColor: 'var(--color-status-safe)', color: 'var(--color-status-safe)' }}>
                  <CheckCircle size={20} />
                  <span className="alert-banner-text font-bold">ACCEPTED</span>
                </div>
              ) : (
                <div className="alert-banner alert-critical mb-4">
                  <AlertTriangle size={20} />
                  <span className="alert-banner-text font-bold">REJECTED</span>
                </div>
              )}

              <div className="mb-4">
                <span className="field-label">Laporan Gemini (Confidence: {result.confidence}%)</span>
                <p className="text-body-sm p-3 bg-bg-elevated rounded-md border border-border-default">
                  {result.reason}
                </p>
              </div>

              <div className="qc-vision-result-metric mb-3">
                <div className="flex justify-between">
                  <span className="qc-vision-metric-label">Roboflow Detections</span>
                  <span className="qc-vision-metric-value text-sm">{result.roboflowLabel}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="qc-vision-result-empty">
              <ScanSearch />
              <span>Belum ada hasil.<br/>Jalankan inspeksi untuk melihat laporan.</span>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
