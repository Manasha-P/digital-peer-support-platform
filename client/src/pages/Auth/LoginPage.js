import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import PencilIcon from '../../components/common/PencilIcon';
import { theme } from '../../styles/theme';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../utils/api';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Load Google Sign-In script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = initializeGoogleSignIn;
    document.body.appendChild(script);

    return () => {
      const script = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
      if (script) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const initializeGoogleSignIn = () => {
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: '983142365022-6g032m6gcsnpoi134tk0s5n5qa24d6ga.apps.googleusercontent.com',
        callback: handleGoogleResponse,
      });
      
      window.google.accounts.id.renderButton(
        document.getElementById('googleSignInDiv'),
        { 
          theme: 'outline', 
          size: 'large', 
          width: '100%',
          text: 'continue_with',
          shape: 'rectangular'
        }
      );
    }
  };

  const handleGoogleResponse = async (response) => {
    setLoading(true);
    try {
      console.log('Google response received');
      
      const res = await authAPI.googleAuth({ credential: response.credential });
      console.log('Backend response:', res.data);
      
      if (res.data.success) {
        await login(res.data.user, res.data.token);
        
        if (res.data.user.role === 'supporter' && !res.data.user.isApproved) {
          navigate('/waiting-approval');
          toast.info('Your application is still pending approval');
          return;
        }
        
        if (res.data.user.role === 'admin') {
          navigate('/admin');
        } else if (res.data.user.role === 'supporter') {
          navigate('/supporter');
        } else {
          navigate('/dashboard');
        }
        
        toast.success(`Welcome, ${res.data.user.name}!`);
      }
    } catch (error) {
      console.error('Google login error:', error);
      toast.error(error.response?.data?.message || 'Google sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const response = await authAPI.login(form);
      
      if (response.data.success) {
        await login(response.data.user, response.data.token);
        
        if (response.data.user.role === 'supporter' && !response.data.user.isApproved) {
          navigate('/waiting-approval');
          toast.info('Your application is still pending approval');
          return;
        }
        
        if (response.data.user.role === 'admin') {
          navigate('/admin');
        } else if (response.data.user.role === 'supporter') {
          navigate('/supporter');
        } else {
          navigate('/dashboard');
        }
        
        toast.success(`Welcome back, ${response.data.user.name}!`);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.primaryDark} 100%)`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px'
    }}>
      <div style={{
        background: theme.colors.white,
        borderRadius: theme.borderRadius.xl,
        padding: '40px',
        maxWidth: '400px',
        width: '100%',
        boxShadow: theme.shadows.xl
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            marginBottom: '16px'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              background: theme.colors.primary,
              borderRadius: theme.borderRadius.md,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <PencilIcon name="messages" size={28} color={theme.colors.white} />
            </div>
            <span style={{
              fontSize: '28px',
              fontWeight: 700,
              color: theme.colors.primary
            }}>
              PeerBridge
            </span>
          </div>
          <h1 style={{
            fontSize: '24px',
            fontWeight: 600,
            color: theme.colors.primary,
            marginBottom: '8px'
          }}>
            Welcome Back
          </h1>
          <p style={{
            fontSize: '14px',
            color: theme.colors.gray600
          }}>
            Sign in to continue your journey
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: 500,
              color: theme.colors.gray700,
              marginBottom: '6px'
            }}>
              Email Address
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@example.com"
              required
              style={{
                width: '100%',
                padding: '12px 16px',
                border: `1px solid ${theme.colors.gray300}`,
                borderRadius: theme.borderRadius.md,
                fontSize: '14px'
              }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: 500,
              color: theme.colors.gray700,
              marginBottom: '6px'
            }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: `1px solid ${theme.colors.gray300}`,
                  borderRadius: theme.borderRadius.md,
                  fontSize: '14px',
                  paddingRight: '40px'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                <PencilIcon name={showPassword ? 'eye-off' : 'eye'} size={18} color={theme.colors.gray500} />
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              background: loading ? theme.colors.gray300 : theme.colors.primary,
              color: theme.colors.white,
              border: 'none',
              borderRadius: theme.borderRadius.md,
              fontSize: '16px',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              marginBottom: '16px'
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* OR Divider */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '20px'
        }}>
          <div style={{ flex: 1, height: '1px', background: theme.colors.gray200 }} />
          <span style={{ fontSize: '14px', color: theme.colors.gray500 }}>OR</span>
          <div style={{ flex: 1, height: '1px', background: theme.colors.gray200 }} />
        </div>

        {/* Google Sign-In Button Container */}
        <div id="googleSignInDiv" style={{ width: '100%', marginBottom: '24px' }}></div>

        {/* Sign Up Link */}
        <div style={{
          textAlign: 'center'
        }}>
          <p style={{ color: theme.colors.gray600, fontSize: '14px' }}>
            Don't have an account?{' '}
            <button
              onClick={() => navigate('/role-select')}
              style={{
                background: 'none',
                border: 'none',
                color: theme.colors.primary,
                fontWeight: 600,
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}