'use client';
import { useState, useRef } from 'react';
import Link from 'next/link';
import {
  Upload,
  FileImage,
  FileText,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  X,
  Eye
} from 'lucide-react';
import './upload.css';

const ACCEPTED_IMAGE_FORMATS = ['image/png', 'image/jpeg', 'image/webp'];
const ACCEPTED_PDF_FORMAT = 'application/pdf';
const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export default function FloorPlanUploadPage() {
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [error, setError] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [success, setSuccess] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const imageInputRef = useRef(null);
  const pdfInputRef = useRef(null);

  function validateFile(file, acceptedFormats) {
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return `File size exceeds ${MAX_FILE_SIZE_MB}MB limit. Please select a smaller file.`;
    }
    if (!acceptedFormats.includes(file.type)) {
      const formatNames = acceptedFormats.map(f => f.split('/')[1].toUpperCase()).join(', ');
      return `Unsupported format. Accepted formats: ${formatNames}`;
    }
    return null;
  }

  function handleImageDrop(e) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) handleImageSelect(file);
  }

  function handleImageSelect(file) {
    setError(null);
    const validationError = validateFile(file, ACCEPTED_IMAGE_FORMATS);
    if (validationError) {
      setError(validationError);
      return;
    }
    setImageFile(file);

    // Generate preview
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  }

  function handlePdfSelect(file) {
    setError(null);
    const validationError = validateFile(file, [ACCEPTED_PDF_FORMAT]);
    if (validationError) {
      setError(validationError);
      return;
    }
    setPdfFile(file);
  }

  function handleImageInputChange(e) {
    const file = e.target.files?.[0];
    if (file) handleImageSelect(file);
  }

  function handlePdfInputChange(e) {
    const file = e.target.files?.[0];
    if (file) handlePdfSelect(file);
  }

  function removeImage() {
    setImageFile(null);
    setImagePreview(null);
    if (imageInputRef.current) imageInputRef.current.value = '';
  }

  function removePdf() {
    setPdfFile(null);
    if (pdfInputRef.current) pdfInputRef.current.value = '';
  }

  async function handleUpload() {
    if (!imageFile) {
      setError('Please select a floor plan image to upload.');
      return;
    }

    setError(null);
    setIsUploading(true);
    setUploadProgress(10);

    try {
      // Step 1: Convert image to base64 data URL
      setUploadProgress(20);
      const imageDataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(imageFile);
      });

      setUploadProgress(40);

      let zones = [];

      // Step 2: If PDF is provided, call API to extract zones
      if (pdfFile) {
        setUploadProgress(50);
        const formData = new FormData();
        formData.append('image', imageFile);
        formData.append('pdf', pdfFile);

        const res = await fetch('/api/floor-plan-upload', {
          method: 'POST',
          body: formData,
        });

        setUploadProgress(80);

        const data = await res.json();
        if (!data.success) {
          throw new Error(data.error || 'Failed to process floor plan files.');
        }
        zones = data.zones || [];
      }

      setUploadProgress(90);

      // Step 3: Store in localStorage
      const floorPlanData = {
        imageDataUrl,
        zones,
        uploadedAt: new Date().toISOString(),
      };
      localStorage.setItem('aromasys_floor_plan', JSON.stringify(floorPlanData));

      setUploadProgress(100);
      setSuccess(true);
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message || 'An error occurred during upload. Please try again.');
    } finally {
      setIsUploading(false);
    }
  }

  // Success state
  if (success) {
    return (
      <div className="fp-upload-page animate-fade">
        <Link href="/digital-twin/floor-plan" className="fp-upload-back-link">
          <ArrowLeft size={16} /> Back to Floor Plan
        </Link>

        <div className="fp-upload-card">
          <div className="fp-upload-success-state">
            <CheckCircle2 size={56} className="fp-upload-success-icon" />
            <h2 className="fp-upload-success-title">Floor Plan Uploaded Successfully!</h2>
            <p className="fp-upload-success-text">
              Your floor plan image has been saved and is ready to use.
              {pdfFile && ' Zone information has been extracted from the PDF.'}
            </p>
            <Link href="/digital-twin/floor-plan" className="btn btn-primary fp-upload-view-btn">
              <Eye size={16} /> View Floor Plan
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fp-upload-page animate-fade">
      {/* Back Link */}
      <Link href="/digital-twin/floor-plan" className="fp-upload-back-link">
        <ArrowLeft size={16} /> Back to Floor Plan
      </Link>

      {/* Page Header */}
      <div className="fp-upload-header">
        <h1 className="page-title">Upload Floor Plan</h1>
        <p className="fp-upload-subtitle">
          Upload a floor plan image and optionally a PDF with zone metadata for AI-powered zone extraction.
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="fp-upload-error">
          <AlertCircle size={18} />
          <span>{error}</span>
          <button className="fp-upload-error-close" onClick={() => setError(null)} aria-label="Dismiss error">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Upload Cards */}
      <div className="fp-upload-grid">
        {/* Image Upload Card */}
        <div className="card fp-upload-card">
          <div className="fp-upload-card-header">
            <FileImage size={20} className="fp-upload-card-icon" />
            <div>
              <h3 className="fp-upload-card-title">Floor Plan Image</h3>
              <p className="fp-upload-card-desc">PNG, JPG, or WEBP — max 10MB</p>
            </div>
          </div>

          {imageFile ? (
            <div className="fp-upload-file-preview">
              {imagePreview && (
                <img src={imagePreview} alt="Floor plan preview" className="fp-upload-image-thumb" />
              )}
              <div className="fp-upload-file-info">
                <span className="fp-upload-file-name">{imageFile.name}</span>
                <span className="fp-upload-file-size">
                  {(imageFile.size / (1024 * 1024)).toFixed(2)} MB
                </span>
              </div>
              <button className="btn btn-ghost btn-sm fp-upload-remove-btn" onClick={removeImage} aria-label="Remove image">
                <X size={14} /> Remove
              </button>
            </div>
          ) : (
            <div
              className={`fp-upload-dropzone ${dragOver ? 'fp-upload-dropzone-active' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleImageDrop}
            >
              <div className="upload-icon-circle">
                <Upload size={24} />
              </div>
              <p className="fp-upload-dropzone-title">
                Drop your image here or <span className="fp-upload-link">click to browse</span>
              </p>
              <p className="fp-upload-dropzone-formats">PNG, JPG, WEBP — max 10MB</p>
              <input
                ref={imageInputRef}
                type="file"
                className="fp-upload-file-input"
                accept=".png,.jpg,.jpeg,.webp"
                onChange={handleImageInputChange}
              />
            </div>
          )}
        </div>

        {/* PDF Upload Card */}
        <div className="card fp-upload-card">
          <div className="fp-upload-card-header">
            <FileText size={20} className="fp-upload-card-icon fp-upload-card-icon-pdf" />
            <div>
              <h3 className="fp-upload-card-title">Zone Metadata (Optional)</h3>
              <p className="fp-upload-card-desc">PDF with floor plan info — max 10MB</p>
            </div>
          </div>

          {pdfFile ? (
            <div className="fp-upload-file-preview">
              <div className="fp-upload-pdf-icon-box">
                <FileText size={32} />
              </div>
              <div className="fp-upload-file-info">
                <span className="fp-upload-file-name">{pdfFile.name}</span>
                <span className="fp-upload-file-size">
                  {(pdfFile.size / (1024 * 1024)).toFixed(2)} MB
                </span>
              </div>
              <button className="btn btn-ghost btn-sm fp-upload-remove-btn" onClick={removePdf} aria-label="Remove PDF">
                <X size={14} /> Remove
              </button>
            </div>
          ) : (
            <div className="fp-upload-dropzone fp-upload-dropzone-pdf">
              <div className="upload-icon-circle fp-upload-icon-circle-pdf">
                <FileText size={24} />
              </div>
              <p className="fp-upload-dropzone-title">
                <span className="fp-upload-link">Click to select a PDF</span>
              </p>
              <p className="fp-upload-dropzone-formats">AI will extract zone information from the PDF</p>
              <input
                ref={pdfInputRef}
                type="file"
                className="fp-upload-file-input"
                accept=".pdf"
                onChange={handlePdfInputChange}
              />
            </div>
          )}
        </div>
      </div>

      {/* Upload Progress */}
      {isUploading && (
        <div className="fp-upload-progress-section">
          <div className="fp-upload-progress-bar">
            <div className="fp-upload-progress-fill" style={{ width: `${uploadProgress}%` }}></div>
          </div>
          <p className="fp-upload-progress-text">
            {uploadProgress < 50 ? 'Processing image...' :
             uploadProgress < 80 ? 'Extracting zone information with AI...' :
             'Saving floor plan...'}
          </p>
        </div>
      )}

      {/* Submit Button */}
      <div className="fp-upload-actions">
        <Link href="/digital-twin/floor-plan" className="btn btn-secondary">
          Cancel
        </Link>
        <button
          className="btn btn-primary"
          onClick={handleUpload}
          disabled={!imageFile || isUploading}
        >
          {isUploading ? 'Uploading...' : 'Upload Floor Plan'}
        </button>
      </div>
    </div>
  );
}
