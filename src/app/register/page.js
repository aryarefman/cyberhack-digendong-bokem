'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import Link from 'next/link';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import '../login/login.css';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('Operator');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  
  const { user, register } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) router.push('/dashboard');
  }, [user, router]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    // Validations
    if (!name) {
      setError('Nama lengkap harus diisi');
      return;
    }
    if (!email) {
      setError('Email harus diisi');
      return;
    }
    if (password.length < 8) {
      setError('Password minimal 8 karakter');
      return;
    }
    if (password !== confirmPassword) {
      setError('Password konfirmasi tidak cocok');
      return;
    }

    const result = await register(name, email, password, role);
    if (!result.success) {
      setError(result.error);
    }
  }

  if (user) return null;

  return (
    <div className="auth-container">
      {/* Left Panel: Curved Atmospheric Image with Quote Text */}
      <div 
        className="auth-image-side curve-right" 
        style={{ backgroundImage: 'url("/register_bg.png")' }}
        aria-hidden="true"
      >
        <span className="auth-overlay-tagline">
          Smart Warehouse, Smarter Decisions
        </span>
      </div>

      {/* Right Panel: Sign Up Form */}
      <div className="auth-form-side">
        <div className="auth-form-wrapper">
          {/* Back Button */}
          <Link href="/" className="back-link">
            <span style={{ display: 'inline-flex', alignItems: 'center' }}>
              <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 1L1 4L4 7" stroke="#313131" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M1 4H11" stroke="#313131" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </span>
            <span>Back</span>
          </Link>

          {/* Header */}
          <div className="auth-header">
            <h1 className="auth-title">Sign Up</h1>
            <p className="auth-subtitle">Sign up for a new enterprise account</p>
          </div>

          {/* Error Message */}
          {error && <div className="auth-error-message">{error}</div>}

          {/* Form */}
          <form onSubmit={handleSubmit} className="login-form-element">
            {/* Full Name Outlined Input */}
            <div className="material-input-group">
              <input
                id="register-name"
                type="text"
                placeholder=" "
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
              <label htmlFor="register-name">Full Name</label>
            </div>

            {/* Email Outlined Input */}
            <div className="material-input-group">
              <input
                id="register-email"
                type="email"
                placeholder=" "
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
              <label htmlFor="register-email">Email</label>
            </div>

            {/* Password Outlined Input with eye toggle */}
            <div className="material-input-group">
              <div className="material-input-group-wrapper">
                <input
                  id="register-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder=" "
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="icon-suffix"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <label htmlFor="register-password">Password</label>
            </div>

            {/* Confirm Password Outlined Input with eye toggle */}
            <div className="material-input-group">
              <div className="material-input-group-wrapper">
                <input
                  id="register-confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder=" "
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="icon-suffix"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <label htmlFor="register-confirm-password">Confirm Password</label>
            </div>

            {/* Role Select Dropdown */}
            <div className="material-input-group">
              <select
                id="register-role"
                value={role}
                onChange={e => setRole(e.target.value)}
              >
                <option value="Operator">Operator</option>
                <option value="QC">QC (Quality Control)</option>
                <option value="PPIC">PPIC (Production Planning)</option>
                <option value="Admin">Admin</option>
              </select>
              <label htmlFor="register-role">Role</label>
            </div>

            {/* CTA Button */}
            <button type="submit" className="auth-btn-submit">
              Sign Up
            </button>
          </form>

          {/* Switch page */}
          <div className="auth-footer-nav">
            <span>Already have an account?</span>
            <Link href="/login" className="auth-switch-link">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
