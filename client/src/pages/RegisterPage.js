import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'user' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (step === 1) { setStep(2); return; }
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <div className="auth-page">
      <div style={{ width: '100%', maxWidth: 480 }}>
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

          {/* Progress */}
          <div style={{ marginBottom: 24 }}>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span style={{ fontSize: '0.8rem', color: 'var(--gray)', fontWeight: 500 }}>
                Step {step} of 2
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600 }}>
                {step === 1 ? '50%' : '100%'}
              </span>
            </div>
            <div className="progress-custom">
              <div className="progress-fill" style={{ width: step === 1 ? '50%' : '100%' }}></div>
            </div>
          </div>

          <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: '1.7rem', fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 6 }}>
            {step === 1 ? 'Create your account' : 'Choose your role'}
          </h2>
          <p style={{ color: 'var(--gray)', fontSize: '0.92rem', marginBottom: 28 }}>
            {step === 1 ? 'Start your journey towards better mental wellness' : 'How would you like to use PeerSupport?'}
          </p>

          <form onSubmit={handleSubmit}>
            {step === 1 ? (
              <>
                {/* Name */}
                <div style={{ marginBottom: 16 }}>
                  <label className="form-label-custom">Full Name</label>
                  <input
                    type="text"
                    className="form-control-custom"
                    placeholder="Your full name"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>
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
                <div style={{ marginBottom: 24 }}>
                  <label className="form-label-custom">Password</label>
                  <input
                    type="password"
                    className="form-control-custom"
                    placeholder="Min. 8 characters"
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    required
                    minLength={8}
                  />
                  <p style={{ fontSize: '0.78rem', color: 'var(--gray)', marginTop: 6 }}>
                    Use at least 8 characters with a number and symbol
                  </p>
                </div>
              </>
            ) : (
              <>
                {/* Role Selection */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
                  {[
                    {
                      value: 'user',
                      icon: '🙋',
                      title: 'I need support',
                      desc: 'Connect with a peer supporter to help you through difficult times.',
                    },
                    {
                      value: 'peer_supporter',
                      icon: '🤝',
                      title: 'I want to support others',
                      desc: 'Become a peer supporter and help others with your lived experience.',
                    },
                  ].map(r => (
                    <div
                      key={r.value}
                      onClick={() => setForm({ ...form, role: r.value })}
                      style={{
                        padding: '16px 18px',
                        border: `2px solid ${form.role === r.value ? 'var(--primary)' : 'var(--border)'}`,
                        borderRadius: 12,
                        cursor: 'pointer',
                        background: form.role === r.value ? 'var(--primary-light)' : 'white',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 14,
                        transition: 'all 0.2s',
                      }}
                    >
                      <span style={{ fontSize: '1.8rem' }}>{r.icon}</span>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--dark)', marginBottom: 2 }}>
                          {r.title}
                        </div>
                        <div style={{ fontSize: '0.82rem', color: 'var(--gray)', lineHeight: 1.5 }}>
                          {r.desc}
                        </div>
                      </div>
                      {form.role === r.value && (
                        <div
                          style={{
                            marginLeft: 'auto', width: 22, height: 22, borderRadius: '50%',
                            background: 'var(--primary)', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', color: 'white', fontSize: '0.75rem', flexShrink: 0,
                          }}
                        >
                          ✓
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Terms */}
                <div
                  style={{
                    background: 'var(--bg)', borderRadius: 10,
                    padding: '12px 14px', fontSize: '0.82rem', color: 'var(--gray)',
                    lineHeight: 1.6, marginBottom: 24,
                  }}
                >
                  🔒 By registering, you agree to our{' '}
                  <Link to="#" style={{ color: 'var(--primary)', fontWeight: 600 }}>Terms of Service</Link>
                  {' '}and{' '}
                  <Link to="#" style={{ color: 'var(--primary)', fontWeight: 600 }}>Privacy Policy</Link>.
                  Your data is always encrypted and confidential.
                </div>
              </>
            )}

            {/* Buttons */}
            <div className="d-flex gap-2">
              {step === 2 && (
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="btn-outline-custom"
                  style={{ flex: 1, justifyContent: 'center', padding: '12px' }}
                >
                  ← Back
                </button>
              )}
              <button
                type="submit"
                className="btn-primary-custom"
                style={{
                  flex: 1, justifyContent: 'center',
                  padding: '13px', fontSize: '0.97rem',
                  opacity: loading ? 0.8 : 1,
                }}
                disabled={loading}
              >
                {loading ? 'Creating account...' : step === 1 ? 'Continue →' : 'Create Account →'}
              </button>
            </div>
          </form>

          <p style={{ textAlign: 'center', marginTop: 24, fontSize: '0.88rem', color: 'var(--gray)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}