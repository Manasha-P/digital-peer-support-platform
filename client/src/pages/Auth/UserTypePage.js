import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';  // Add this import
import PencilIcon from '../../components/common/PencilIcon';
import { theme } from '../../styles/theme';

export default function UserTypePage() {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState('');

  const userTypes = [
    {
      id: 'college',
      label: 'College Student',
      icon: 'academic',
      description: 'Currently enrolled in college or university',
      color: '#1e3a8a'
    },
    {
      id: 'highschool',
      label: 'High School Student',
      icon: 'school',
      description: 'Currently in high school',
      color: '#1e3a8a'
    },
    {
      id: 'professional',
      label: 'Working Professional',
      icon: 'career',
      description: 'Employed full-time or part-time',
      color: '#1e3a8a'
    },
    {
      id: 'graduate',
      label: 'Graduate Student',
      icon: 'graduate',
      description: 'Pursuing masters or PhD',
      color: '#1e3a8a'
    },
    {
      id: 'other',
      label: 'Other',
      icon: 'other',
      description: 'Prefer not to specify',
      color: '#1e3a8a'
    }
  ];

  const handleContinue = () => {
    if (!selectedType) {
      toast.error('Please select your user type');  // Now toast is defined
      return;
    }
    navigate('/register', { state: { userType: selectedType } });
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
      {/* Rest of your component remains the same */}
      <div style={{
        background: theme.colors.white,
        borderRadius: theme.borderRadius['2xl'],
        padding: '48px',
        maxWidth: '800px',
        width: '100%'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
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
              <PencilIcon name="user" size={28} color={theme.colors.white} />
            </div>
            <span style={{
              fontSize: '28px',
              fontWeight: 700,
              color: theme.colors.primary
            }}>
              Tell us about yourself
            </span>
          </div>
          <p style={{
            fontSize: '16px',
            color: theme.colors.gray600,
            maxWidth: '500px',
            margin: '0 auto'
          }}>
            This helps us match you with the right supporters
          </p>
        </div>

        {/* User Types Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '16px',
          marginBottom: '32px'
        }}>
          {userTypes.map(type => (
            <div
              key={type.id}
              onClick={() => setSelectedType(type.id)}
              style={{
                padding: '24px',
                border: `2px solid ${selectedType === type.id ? theme.colors.primary : theme.colors.gray200}`,
                borderRadius: theme.borderRadius.lg,
                cursor: 'pointer',
                transition: 'all 0.2s',
                background: selectedType === type.id ? `${theme.colors.primary}10` : theme.colors.white,
                textAlign: 'center'
              }}
            >
              <div style={{
                width: '48px',
                height: '48px',
                margin: '0 auto 16px',
                background: selectedType === type.id ? theme.colors.primary : theme.colors.gray100,
                borderRadius: theme.borderRadius.md,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <PencilIcon 
                  name={type.icon} 
                  size={24} 
                  color={selectedType === type.id ? theme.colors.white : theme.colors.gray600} 
                />
              </div>
              <h3 style={{
                fontSize: '16px',
                fontWeight: 600,
                color: theme.colors.primary,
                marginBottom: '8px'
              }}>
                {type.label}
              </h3>
              <p style={{
                fontSize: '13px',
                color: theme.colors.gray600,
                margin: 0
              }}>
                {type.description}
              </p>
            </div>
          ))}
        </div>

        {/* Continue Button */}
        <button
          onClick={handleContinue}
          style={{
            width: '100%',
            padding: '16px',
            background: theme.colors.primary,
            color: theme.colors.white,
            border: 'none',
            borderRadius: theme.borderRadius.lg,
            fontSize: '16px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          Continue
          <PencilIcon name="arrow-right" size={18} color={theme.colors.white} />
        </button>

        {/* Skip Link */}
        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <button
            onClick={() => navigate('/register')}
            style={{
              background: 'none',
              border: 'none',
              color: theme.colors.gray500,
              fontSize: '14px',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
}