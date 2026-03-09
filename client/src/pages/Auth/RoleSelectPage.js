import { useNavigate } from 'react-router-dom';
import PencilIcon from '../../components/common/PencilIcon';
import { theme } from '../../styles/theme';
import { globalStyles } from '../../styles/globalStyles';

export default function RoleSelectPage() {
  const navigate = useNavigate();

  const roles = [
    {
      id: 'user',
      title: 'I need support',
      description: 'Connect with peer supporters anonymously',
      icon: 'mood',
      features: ['Anonymous sessions', 'Find supporters', 'Track wellness', '24/7 access'],
      action: 'Continue as User',
      color: theme.colors.primary
    },
    {
      id: 'supporter',
      title: 'I want to support others',
      description: 'Become a trained peer supporter',
      icon: 'messages',
      features: ['Help others', 'Flexible hours', 'Training provided', 'Make a difference'],
      action: 'Apply as Supporter',
      color: theme.colors.primary
    }
  ];

  const handleSelect = (roleId) => {
    if (roleId === 'user') {
      navigate('/register/user');
    } else {
      navigate('/register/supporter');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: theme.colors.gray50,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px'
    }}>
      <div style={{ maxWidth: '1000px', width: '100%' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
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
              fontSize: '32px',
              fontWeight: 700,
              color: theme.colors.primary
            }}>
              PeerBridge
            </span>
          </div>
          <h1 style={{
            fontSize: '36px',
            fontWeight: 700,
            color: theme.colors.primary,
            marginBottom: '12px'
          }}>
            Choose Your Path
          </h1>
          <p style={{
            fontSize: '18px',
            color: theme.colors.gray600,
            maxWidth: '500px',
            margin: '0 auto'
          }}>
            Select how you'd like to use PeerBridge
          </p>
        </div>

        {/* Role Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '30px'
        }}>
          {roles.map(role => (
            <div
              key={role.id}
              onClick={() => handleSelect(role.id)}
              style={{
                ...globalStyles.card,
                padding: '40px',
                cursor: 'pointer',
                transition: 'all 0.3s',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = theme.shadows.xl;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = theme.shadows.md;
              }}
            >
              {/* Background Icon */}
              <div style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                opacity: 0.05
              }}>
                <PencilIcon name={role.icon} size={120} color={theme.colors.primary} />
              </div>

              {/* Content */}
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  background: `${role.color}10`,
                  borderRadius: theme.borderRadius.lg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '24px'
                }}>
                  <PencilIcon name={role.icon} size={40} color={role.color} />
                </div>

                <h2 style={{
                  fontSize: '28px',
                  fontWeight: 700,
                  color: theme.colors.primary,
                  marginBottom: '12px'
                }}>
                  {role.title}
                </h2>

                <p style={{
                  fontSize: '16px',
                  color: theme.colors.gray600,
                  marginBottom: '24px',
                  lineHeight: 1.6
                }}>
                  {role.description}
                </p>

                <div style={{ marginBottom: '32px' }}>
                  {role.features.map(feature => (
                    <div
                      key={feature}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        marginBottom: '12px'
                      }}
                    >
                      <PencilIcon name="check" size={16} color={theme.colors.success} />
                      <span style={{ fontSize: '14px', color: theme.colors.gray700 }}>
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                <button
                  style={{
                    ...globalStyles.button.primary,
                    width: '100%',
                    justifyContent: 'center',
                    padding: '16px',
                    fontSize: '16px'
                  }}
                >
                  {role.action}
                  <PencilIcon name="arrow" size={18} color={theme.colors.white} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Back to Login */}
        <div style={{ textAlign: 'center', marginTop: '32px' }}>
          <span style={{ color: theme.colors.gray600, fontSize: '14px' }}>
            Already have an account?{' '}
            <button
              onClick={() => navigate('/login')}
              style={{
                background: 'none',
                border: 'none',
                color: theme.colors.primary,
                fontWeight: 600,
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              Sign In
            </button>
          </span>
        </div>
      </div>
    </div>
  );
}