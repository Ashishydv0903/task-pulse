import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Lock, Mail, User, Zap, KeyRound, CheckCircle } from 'lucide-react';

export const AuthModal = ({ isOpen, onClose, initialMode = 'login' }) => {
  const [mode, setMode] = useState(initialMode); // 'login' | 'register' | 'forgot' | 'reset'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login, register, forgotPassword, resetPassword: resetPass } = useAuth();

  if (!isOpen) return null;

  const handleDemoFill = () => {
    setEmail('demo@example.com');
    setPassword('password123');
    setError('');
    setSuccessMsg('');
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setSubmitting(true);

    try {
      const res = await forgotPassword(email);
      if (res.success) {
        setMode('reset');
        setSuccessMsg(res.message || `A 6-digit OTP code has been sent to ${email}. Check your inbox!`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to request OTP code. Please check email address.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    if (!otp || otp.trim().length !== 6) {
      setError('Please enter the 6-digit OTP code sent to your email.');
      return;
    }

    setError('');
    setSuccessMsg('');
    setSubmitting(true);

    try {
      await resetPass(email, otp, password);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired OTP code.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (mode === 'forgot') return handleForgotSubmit(e);
    if (mode === 'reset') return handleResetSubmit(e);

    setError('');
    setSuccessMsg('');
    setSubmitting(true);

    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        if (!name.trim()) {
          setError('Name is required');
          setSubmitting(false);
          return;
        }
        await register(name, email, password);
      }
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed. Please check credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-primary)' }}>
              {mode === 'login' && 'Welcome Back'}
              {mode === 'register' && 'Create Account'}
              {mode === 'forgot' && 'Send OTP Code'}
              {mode === 'reset' && 'Verify 6-Digit OTP'}
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              {mode === 'login' && 'Access your private workspace'}
              {mode === 'register' && 'Start organizing your tasks in seconds'}
              {mode === 'forgot' && 'Enter your email to receive a 6-digit OTP verification code'}
              {mode === 'reset' && 'Enter the OTP code from your email to set a new password'}
            </p>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Tab Switcher for Login / Register */}
        {(mode === 'login' || mode === 'register') && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', background: 'var(--bg-primary)', padding: '0.25rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.25rem' }}>
            <button
              type="button"
              className={`btn btn-sm ${mode === 'login' ? 'btn-primary' : ''}`}
              onClick={() => { setMode('login'); setError(''); setSuccessMsg(''); }}
              style={{ borderRadius: 'var(--radius-sm)' }}
            >
              Log In
            </button>
            <button
              type="button"
              className={`btn btn-sm ${mode === 'register' ? 'btn-primary' : ''}`}
              onClick={() => { setMode('register'); setError(''); setSuccessMsg(''); }}
              style={{ borderRadius: 'var(--radius-sm)' }}
            >
              Register
            </button>
          </div>
        )}

        {error && (
          <div style={{ background: 'var(--danger-bg)', color: 'var(--danger)', padding: '0.625rem 1rem', borderRadius: 'var(--radius-sm)', fontSize: '0.875rem', marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        {successMsg && (
          <div style={{ background: 'var(--success-bg)', color: 'var(--success)', padding: '0.875rem 1rem', borderRadius: 'var(--radius-sm)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '600' }}>
              <CheckCircle size={18} /> {successMsg}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          
          {mode === 'register' && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  className="form-control"
                  placeholder="Alex Rivera"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ paddingLeft: '2.5rem' }}
                  required
                />
              </div>
            </div>
          )}

          {(mode === 'login' || mode === 'register' || mode === 'forgot' || mode === 'reset') && (
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="email"
                  className="form-control"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ paddingLeft: '2.5rem' }}
                  readOnly={mode === 'reset'}
                  required
                />
              </div>
            </div>
          )}

          {mode === 'reset' && (
            <div className="form-group">
              <label className="form-label">6-Digit OTP Code *</label>
              <div style={{ position: 'relative' }}>
                <KeyRound size={18} color="var(--accent-primary)" style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. 849201"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  style={{ paddingLeft: '2.5rem', letterSpacing: '4px', fontSize: '1.1rem', fontWeight: '700' }}
                  maxLength={6}
                  required
                  autoFocus
                />
              </div>
            </div>
          )}

          {(mode === 'login' || mode === 'register' || mode === 'reset') && (
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label">{mode === 'reset' ? 'New Password' : 'Password'}</label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => { setMode('forgot'); setError(''); setSuccessMsg(''); }}
                    style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', fontSize: '0.75rem', cursor: 'pointer', fontWeight: '600' }}
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div style={{ position: 'relative' }}>
                <Lock size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="password"
                  className="form-control"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingLeft: '2.5rem' }}
                  required
                  minLength={6}
                />
              </div>
            </div>
          )}

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem' }} disabled={submitting}>
            {submitting ? 'Processing...' : (
              mode === 'login' ? 'Log In to Workspace' :
              mode === 'register' ? 'Create Free Account' :
              mode === 'forgot' ? 'Send 6-Digit OTP Email' : 'Verify OTP & Reset Password'
            )}
          </button>

          {/* Back to Login button */}
          {(mode === 'forgot' || mode === 'reset') && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => { setMode('login'); setError(''); setSuccessMsg(''); }}
              style={{ width: '100%', marginTop: '0.75rem', fontSize: '0.8125rem' }}
            >
              ← Back to Login
            </button>
          )}

          {/* Quick Demo Credentials Fill Button */}
          {mode === 'login' && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleDemoFill}
              style={{ width: '100%', marginTop: '0.75rem', borderStyle: 'dashed', fontSize: '0.8125rem' }}
            >
              <Zap size={14} color="var(--warning)" />
              <span>Auto-fill Demo Credentials</span>
            </button>
          )}

        </form>

      </div>
    </div>
  );
};
