import { useNavigate } from 'react-router-dom';
import PencilIcon from '../../components/common/PencilIcon';
import { theme } from '../../styles/theme';

export default function WaitingApprovalPage() {
  const navigate = useNavigate();

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
        padding: '48px',
        maxWidth: '500px',
        width: '100%',
        textAlign: 'center'
      }}>
        {/* Clock Icon */}
        <div style={{
          width: '80px',
          height: '80px',
          margin: '0 auto 24px',
          background: `${theme.colors.warning}15`,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <PencilIcon name="clock" size={40} color={theme.colors.warning} />
        </div>

        <h1 style={{
          fontSize: '28px',
          fontWeight: 700,
          color: theme.colors.primary,
          marginBottom: '12px'
        }}>
          Application Under Review
        </h1>

        <p style={{
          fontSize: '16px',
          color: theme.colors.gray600,
          lineHeight: 1.6,
          marginBottom: '32px'
        }}>
          Thank you for applying to become a supporter! Your application is currently being reviewed by our team. This usually takes 1-2 business days.
        </p>

        {/* Status Card */}
        <div style={{
          background: theme.colors.gray50,
          borderRadius: theme.borderRadius.lg,
          padding: '24px',
          marginBottom: '32px',
          border: `1px solid ${theme.colors.gray200}`
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '16px'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              background: `${theme.colors.warning}20`,
              borderRadius: theme.borderRadius.md,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <PencilIcon name="pending" size={20} color={theme.colors.warning} />
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{
                fontSize: '14px',
                fontWeight: 600,
                color: theme.colors.gray700
              }}>
                Application Status
              </div>
              <span style={{
                display: 'inline-block',
                padding: '4px 12px',
                background: '#fef3c7',
                color: '#92400e',
                borderRadius: theme.borderRadius.full,
                fontSize: '12px',
                fontWeight: 600,
                marginTop: '4px'
              }}>
                Pending Review
              </span>
            </div>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              background: `${theme.colors.info}20`,
              borderRadius: theme.borderRadius.md,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <PencilIcon name="clock" size={20} color={theme.colors.info} />
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{
                fontSize: '14px',
                fontWeight: 600,
                color: theme.colors.gray700
              }}>
                Estimated Time
              </div>
              <div style={{
                fontSize: '13px',
                color: theme.colors.gray600,
                marginTop: '2px'
              }}>
                1-2 business days
              </div>
            </div>
          </div>
        </div>

        {/* What happens next */}
        <div style={{ marginBottom: '32px', textAlign: 'left' }}>
          <h3 style={{
            fontSize: '16px',
            fontWeight: 600,
            color: theme.colors.primary,
            marginBottom: '16px'
          }}>
            What happens next?
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              'Our team reviews your application',
              'You\'ll receive an email notification',
              'Once approved, you can start accepting sessions',
              'You\'ll get access to supporter resources'
            ].map((step, index) => (
              <div key={index} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  background: `${theme.colors.success}10`,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <PencilIcon name="check" size={14} color={theme.colors.success} />
                </div>
                <span style={{
                  fontSize: '14px',
                  color: theme.colors.gray700
                }}>
                  {step}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => navigate('/')}
            style={{
              flex: 1,
              padding: '14px',
              background: theme.colors.white,
              color: theme.colors.primary,
              border: `1px solid ${theme.colors.primary}`,
              borderRadius: theme.borderRadius.lg,
              fontSize: '15px',
              fontWeight: 500,
              cursor: 'pointer'
            }}
          >
            Home
          </button>
          <button
            onClick={() => navigate('/login')}
            style={{
              flex: 1,
              padding: '14px',
              background: theme.colors.primary,
              color: theme.colors.white,
              border: 'none',
              borderRadius: theme.borderRadius.lg,
              fontSize: '15px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <PencilIcon name="arrow-right" size={16} color={theme.colors.white} />
            Go to Login
          </button>
        </div>

        {/* Contact Support */}
        <p style={{
          marginTop: '24px',
          fontSize: '13px',
          color: theme.colors.gray500
        }}>
          Questions?{' '}
          <button
            onClick={() => window.location.href = 'mailto:support@peerbridge.com'}
            style={{
              background: 'none',
              border: 'none',
              color: theme.colors.primary,
              textDecoration: 'underline',
              cursor: 'pointer',
              fontSize: '13px'
            }}
          >
            Contact Support
          </button>
        </p>
      </div>
    </div>
  );
}