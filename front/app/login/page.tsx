'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { login } from '@/src/lib/auth';

type Severity = 'error' | 'success' | 'info' | 'warning';
interface NotificationState {
  open: boolean;
  message: string;
  severity: Severity;
}

const colors = {
  primary: '#0d9394',
  primaryHover: '#12abb0',
  primaryLight: '#1fb4b9',
  secondary: '#FEBE98',
  background: '#ffffff',
  backgroundSecondary: '#f8fafc',
  surface: '#ffffff',
  text: '#1f2937',
  textSecondary: '#6b7280',
  textMuted: '#9ca3af',
  border: '#e5e7eb',
  borderLight: '#f3f4f6',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
};

export default function LoginPage() {
  const router = useRouter();
  const [isPasswordShown, setIsPasswordShown] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<NotificationState>({
    open: false,
    message: '',
    severity: 'info',
  });

  const handleClickShowPassword = () => setIsPasswordShown(show => !show);

  const showNotification = (message: string, severity: Severity) => {
    setNotification({ open: true, message, severity });
  };

  // Auto-hide notification after 5 seconds
  useEffect(() => {
    if (notification.open) {
      const timer = setTimeout(() => {
        setNotification(prev => ({ ...prev, open: false }));
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification.open]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showNotification('Please enter both email and password', 'warning');
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
      showNotification('Login successful! Redirecting...', 'success');
      setTimeout(() => router.push('/dashboard'), 1000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed';
      showNotification(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    {/* ── Toast notification ── */}
    <AnimatePresence>
      {notification.open && (
        <motion.div
          key="toast"
          initial={{ opacity: 0, y: -24, scale: 0.94 }}
          animate={{ opacity: 1, y: 0,   scale: 1    }}
          exit={{   opacity: 0, y: -20,  scale: 0.94 }}
          transition={{ type: 'spring', stiffness: 380, damping: 28 }}
          style={{
            position: 'fixed', top: 24, right: 24, zIndex: 9999,
            width: 360, borderRadius: 16, overflow: 'hidden',
            background: '#ffffff',
            boxShadow: notification.severity === 'success'
              ? '0 12px 40px rgba(16,185,129,.22), 0 2px 8px rgba(0,0,0,.08)'
              : '0 12px 40px rgba(239,68,68,.22),  0 2px 8px rgba(0,0,0,.08)',
            border: `1px solid ${notification.severity === 'success' ? 'rgba(16,185,129,.25)' : 'rgba(239,68,68,.25)'}`,
          }}
        >
          {/* Coloured top strip */}
          <div style={{
            height: 4,
            background: notification.severity === 'success'
              ? 'linear-gradient(90deg,#10b981,#34d399)'
              : 'linear-gradient(90deg,#ef4444,#f87171)',
          }} />

          <div style={{ padding: '16px 18px', display: 'flex', alignItems: 'flex-start', gap: 14 }}>
            {/* Icon circle */}
            <div style={{
              width: 40, height: 40, borderRadius: 12, flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: notification.severity === 'success' ? 'rgba(16,185,129,.12)' : 'rgba(239,68,68,.10)',
            }}>
              {notification.severity === 'success' ? (
                <motion.svg
                  initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                  transition={{ duration: .4, delay: .1 }}
                  width="22" height="22" viewBox="0 0 24 24" fill="none"
                  stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                >
                  <motion.path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"
                    initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: .4 }} />
                  <motion.polyline points="22 4 12 14.01 9 11.01"
                    initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: .3, delay: .3 }} />
                </motion.svg>
              ) : (
                <motion.svg
                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20, delay: .1 }}
                  width="22" height="22" viewBox="0 0 24 24" fill="none"
                  stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </motion.svg>
              )}
            </div>

            {/* Text */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: 13, fontWeight: 700, marginBottom: 3,
                color: notification.severity === 'success' ? '#065f46' : '#991b1b',
              }}>
                {notification.severity === 'success' ? 'Connexion réussie !' : 'Erreur de connexion'}
              </div>
              <div style={{ fontSize: 13, color: '#4b5563', lineHeight: 1.5 }}>
                {notification.message}
              </div>
            </div>

            {/* Close */}
            <button
              onClick={() => setNotification(p => ({ ...p, open: false }))}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 2, flexShrink: 0, display: 'flex', borderRadius: 6 }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Countdown progress bar */}
          <motion.div
            initial={{ scaleX: 1 }} animate={{ scaleX: 0 }}
            transition={{ duration: 5, ease: 'linear' }}
            style={{
              height: 3, transformOrigin: 'left',
              background: notification.severity === 'success'
                ? 'linear-gradient(90deg,#10b981,#34d399)'
                : 'linear-gradient(90deg,#ef4444,#f87171)',
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>

    <div className="login-container">
      {/* Left Section */}
      <div className="brand-section">
        <motion.div
          className="brand-content"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          <img
            src="/graphic-1.png"
            alt="AI Invoice Management"
            className="brand-image"
          />
        </motion.div>
      </div>

      {/* Right Section - Login Form */}
      <div className="form-section">
        <div className="form-container">
          {/* Header */}
          <motion.div
            className="form-header"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <div className="logo-section">
              <h1 className="logo-text">Mister</h1>
            </div>
            <h2 className="myP">Welcome to Mister! 👋🏻</h2>
          </motion.div>

          {/* Form */}
          <motion.form
            onSubmit={handleLogin}
            className="login-form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <div className="form-group">
              <label htmlFor="email">Email or Username</label>
              <div className="input-wrapper">
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Enter your email or username"
                  required
                  disabled={loading}
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <input
                  id="password"
                  type={isPasswordShown ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="············"
                  required
                  disabled={loading}
                  className="form-input"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={handleClickShowPassword}
                  tabIndex={-1}
                >
                  {isPasswordShown ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="form-options">
              <label className="remember-me">
                <input type="checkbox" />
                <span className="checkmark"></span>
                <span>Remember me</span>
              </label>
              <Link href="/ForgotPassword" className="forgot-link">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              className="submit-button"
              disabled={loading}
              style={{ transform: 'scale(1)', transition: 'all 0.2s ease' }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.transform = 'scale(1.02)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
            >
              {loading ? (
                <div className="button-content">
                  <div className="spinner"></div>
                  <span>Signing in...</span>
                </div>
              ) : (
                <div className="button-content">
                  <span>Login</span>
                </div>
              )}
            </button>
          </motion.form>

          {/* Footer */}
          <motion.div
            className="form-footer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <div className="divider">
              <span>or</span>
            </div>
            <div className="social-buttons">
              <button className="social-btn facebook">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </button>
              <button className="social-btn twitter">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                </svg>
              </button>
              <button className="social-btn github">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              </button>
              <button className="social-btn google">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
              </button>
            </div>
            <p>
              New on our platform?{' '}
              <Link href="/register" className="register-link">
                Create an account
              </Link>
            </p>
          </motion.div>
        </div>
      </div>

      <style jsx>{`
        .login-container {
          min-height: 100vh;
          display: flex;
          background: ${colors.background};
          color: ${colors.text};
        }

        .brand-section {
          flex: 1;
          background: ${colors.primary};
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          clip-path: polygon(0 0, 85% 0, 100% 100%, 0 100%);
        }

        .brand-content {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          width: 100%;
          padding: 2rem;
        }

        .brand-image {
          max-width: 80%;
          max-height: 80%;
          width: auto;
          height: auto;
          object-fit: contain;
          filter: drop-shadow(0 10px 30px rgba(0, 0, 0, 0.3));
          transition: transform 0.3s ease;
        }

        .brand-image:hover {
          transform: scale(1.05);
        }

        .form-section {
          flex: 1;
          display: flex;
          flex-direction: column;
          background: ${colors.surface};
          position: relative;
        }

        .form-container {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 3rem;
          max-width: 450px;
          margin: 0 auto;
          width: 100%;
        }

        .form-header {
          text-align: center;
          margin-bottom: 1.5rem;
        }

        .logo-section {
          margin-bottom: 1.5rem;
        }

        .logo-text {
          font-size: 2rem;
          font-weight: 800;
          background: linear-gradient(135deg, ${colors.primary}, ${colors.primaryHover});
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin: 0;
        }

        .myP {
          margin-bottom: 1.2rem;
        }

        .form-header h2 {
          font-size: 1.5rem;
          font-weight: 700;
          color: ${colors.text};
          margin: 0 0 0.25rem 0;
        }

        .form-header p {
          color: ${colors.textSecondary};
          margin: 0;
          font-size: 1rem;
        }

        .notification {
          padding: 1rem;
          border-radius: 0.5rem;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.875rem;
          font-weight: 500;
          border: 1px solid;
        }

        .notification.success {
          background: rgba(16, 185, 129, 0.1);
          color: ${colors.success};
          border-color: ${colors.success};
        }

        .notification.error {
          background: rgba(239, 68, 68, 0.1);
          color: ${colors.error};
          border-color: ${colors.error};
        }

        .notification.warning {
          background: rgba(245, 158, 11, 0.1);
          color: ${colors.warning};
          border-color: ${colors.warning};
        }

        .notification.info {
          background: rgba(59, 130, 246, 0.1);
          color: ${colors.info};
          border-color: ${colors.info};
        }

        .login-form {
          margin-bottom: 1.5rem;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          color: ${colors.text};
          font-size: 0.875rem;
          font-weight: 500;
        }

        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .form-input {
          width: 100%;
          padding: 0.875rem 1rem;
          border: 1px solid ${colors.border};
          border-radius: 0.5rem;
          background: ${colors.background};
          color: ${colors.text};
          font-size: 1rem;
          transition: all 0.3s ease;
          outline: none;
        }

        .form-input::placeholder {
          color: ${colors.textMuted};
        }

        .form-input:focus {
          border-color: ${colors.primary};
          box-shadow: 0 0 0 3px ${colors.primary}20;
        }

        .form-input:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          background: ${colors.backgroundSecondary};
        }

        .password-toggle {
          position: absolute;
          right: 1rem;
          background: none;
          border: none;
          color: ${colors.textMuted};
          cursor: pointer;
          padding: 0.25rem;
          border-radius: 0.25rem;
          transition: color 0.2s ease;
        }

        .password-toggle:hover {
          color: ${colors.text};
        }

        .form-options {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          font-size: 0.875rem;
        }

        .remember-me {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: ${colors.textSecondary};
          cursor: pointer;
        }

        .remember-me input[type="checkbox"] {
          opacity: 0;
          position: absolute;
        }

        .checkmark {
          width: 1rem;
          height: 1rem;
          border: 1px solid ${colors.border};
          border-radius: 0.25rem;
          background: ${colors.background};
          position: relative;
          transition: all 0.2s ease;
        }

        .remember-me input[type="checkbox"]:checked + .checkmark {
          background: ${colors.primary};
          border-color: ${colors.primary};
        }

        .remember-me input[type="checkbox"]:checked + .checkmark::after {
          content: '✓';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: white;
          font-size: 0.75rem;
          font-weight: bold;
        }

        .forgot-link {
          color: ${colors.primary};
          text-decoration: none;
          font-weight: 500;
          transition: color 0.2s ease;
        }

        .forgot-link:hover {
          color: ${colors.primaryHover};
        }

        .submit-button {
          width: 100%;
          border: none;
          cursor: pointer;
          border-radius: 0.5rem;
          font-weight: 600;
          font-size: 1rem;
          transition: all 0.2s ease;
        }

        .button-content {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          position: relative;
          padding: 0.875rem 3rem;
          background: ${colors.primaryHover};
          color: #fff;
          border: 2px solid ${colors.primary};
          border-radius: 0.5rem;
          font-weight: 600;
          font-size: 1rem;
        }

        .submit-button:hover .button-content {
          background: ${colors.primary};
        }

        .submit-button:disabled .button-content {
          background: ${colors.textMuted};
          border-color: ${colors.textMuted};
          cursor: not-allowed;
        }

        .button-content span {
          font-weight: 700;
          font-size: 1.1rem;
          letter-spacing: 0.8px;
          text-transform: uppercase;
        }

        .spinner {
          width: 1.25rem;
          height: 1.25rem;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-left: 2px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .form-footer {
          text-align: center;
        }

        .divider {
          margin: 1.5rem 0;
          position: relative;
          color: ${colors.textMuted};
          font-size: 0.875rem;
        }

        .divider::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          height: 1px;
          background: ${colors.border};
        }

        .divider span {
          background: ${colors.surface};
          padding: 0 1rem;
          position: relative;
        }

        .social-buttons {
          display: flex;
          justify-content: center;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
        }

        .social-btn {
          width: 2.5rem;
          height: 2.5rem;
          border: none;
          border-radius: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 1rem;
        }

        .social-btn.facebook { background: #1877f2; color: white; }
        .social-btn.twitter  { background: #1da1f2; color: white; }
        .social-btn.github   { background: ${colors.text}; color: ${colors.surface}; }
        .social-btn.google   { background: #ea4335; color: white; }

        .social-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        }

        .form-footer p {
          color: ${colors.textSecondary};
          margin: 0;
          font-size: 0.875rem;
        }

        .register-link {
          color: ${colors.primary};
          text-decoration: none;
          font-weight: 500;
          margin-left: 0.25rem;
          transition: color 0.2s ease;
        }

        .register-link:hover {
          color: ${colors.primaryHover};
        }

        @media (max-width: 1024px) {
          .login-container { flex-direction: column; }
          .brand-section { min-height: 30vh; }
        }

        @media (max-width: 768px) {
          .form-container { padding: 2rem 1.5rem; }
          .brand-image { max-width: 100%; max-height: 60%; }
          .form-options { flex-direction: column; align-items: flex-start; gap: 0.75rem; }
        }

        @media (max-width: 480px) {
          .form-container { padding: 1.5rem 1rem; }
          .logo-text { font-size: 1.75rem; }
          .form-header h2 { font-size: 1.25rem; }
        }
      `}</style>
    </div>
    </>
  );
}
