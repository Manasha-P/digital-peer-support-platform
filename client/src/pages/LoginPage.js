import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <div className="auth-page">
      <div style={{ width: '100%', maxWidth: 460 }}>
        {/* Back */}
        <Link
          to="/"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            color: 'var(--gray)', textDecoration: 'none', fontSize: '0.88rem',
            marginBottom: 24, fontWeight: 500,
          }}
        >
          ← Back to Home
        </Link>

        <div className="auth-card">
          {/* Logo */}
          <div className="d-flex align-items-center gap-2 mb-4">
            <div className="brand-icon">💙</div>
            <span style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: '1.25rem', color: 'var(--primary)' }}>
              PeerSupport
            </span>
          </div>

          <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: '1.7rem', fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 6 }}>
            Welcome back
          </h2>
          <p style={{ color: 'var(--gray)', fontSize: '0.92rem', marginBottom: 28 }}>
            Sign in to continue your journey
          </p>

          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div style={{ marginBottom: 16 }}>
              <label className="form-label-custom">Email Address</label>
              <input
                type="email"
                className="form-control-custom"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: 20 }}>
              <div className="d-flex justify-content-between align-items-center mb-1">
                <label className="form-label-custom" style={{ marginBottom: 0 }}>Password</label>
                <Link
                  to="#"
                  style={{ fontSize: '0.82rem', color: 'var(--primary)', textDecoration: 'none', fontWeight: 500 }}
                >
                  Forgot password?
                </Link>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-control-custom"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  required
                  style={{ paddingRight: 44 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem',
                    color: 'var(--gray)',
                  }}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="btn-primary-custom"
              style={{ width: '100%', justifyContent: 'center', padding: '13px', fontSize: '0.97rem', opacity: loading ? 0.8 : 1 }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span
                    style={{
                      width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)',
                      borderTopColor: 'white', borderRadius: '50%',
                      display: 'inline-block', animation: 'spin 0.7s linear infinite',
                    }}
                  ></span>
                  Signing in...
                </>
              ) : (
                'Sign In →'
              )}
            </button>
          </form>

          <div className="divider-text">or continue with</div>

          {/* Social */}
          <button
            style={{
              width: '100%', padding: '11px', borderRadius: 10,
              border: '2px solid var(--border)', background: 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: 10, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
              fontWeight: 600, fontSize: '0.92rem', color: 'var(--dark)',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
          >
            <span style={{ fontSize: '1.2rem' }}>🔵</span>
            Continue with Google
          </button>

          <p style={{ textAlign: 'center', marginTop: 24, fontSize: '0.88rem', color: 'var(--gray)' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}>
              Sign up free
            </Link>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}