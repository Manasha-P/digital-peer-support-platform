import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import PencilIcon from '../../components/common/PencilIcon';
import { theme } from '../../styles/theme';
import { authAPI } from '../../utils/api';

export default function RegisterPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const role = location.pathname.includes('supporter') ? 'supporter' : 'user';
  
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: 'College Student',
    topics: [],
    bio: '',
    experience: '',
    qualifications: [],
    terms: false
  });
  const [loading, setLoading] = useState(false);

  const userTypes = [
    'College Student',
    'High School Student',
    'Working Professional',
    'Graduate Student',
    'Other'
  ];

  const topics = [
    'Anxiety', 'Depression', 'Stress', 'Relationships', 'Academic', 
    'Career', 'Loneliness', 'Grief', 'Self-esteem', 'Mindfulness'
  ];

  const handleNext = () => {
    if (step === 1) {
      if (!form.name || !form.email || !form.password || !form.confirmPassword) {
        toast.error('Please fill in all fields');
        return;
      }
      if (form.password !== form.confirmPassword) {
        toast.error('Passwords do not match');
        return;
      }
      if (form.password.length < 6) {
        toast.error('Password must be at least 6 characters');
        return;
      }
    }
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    if (!form.terms) {
      toast.error('Please accept the terms and conditions');
      return;
    }

    setLoading(true);
    
    try {
      // Prepare user data
      const userData = {
        name: form.name,
        email: form.email,
        password: form.password,
        role: role,
        userType: form.userType
      };

      // Add supporter-specific fields
      if (role === 'supporter') {
        userData.topics = form.topics;
        userData.bio = form.bio;
        userData.experience = form.experience;
        userData.qualifications = form.qualifications;
      }

      console.log('Submitting registration:', userData);
      
      const response = await authAPI.register(userData);
      console.log('Registration response:', response.data);

      if (response.data.success) {
        if (role === 'supporter') {
          toast.success('Application submitted! An admin will review your application within 1-2 business days.');
          navigate('/waiting-approval');
        } else {
          toast.success('Registration successful! Please check your email to verify your account.');
          navigate('/login');
        }
      }
    } catch (error) {
      console.error('Registration failed:', error);
      toast.error(error.response?.data?.message || 'Registration failed. Please try again.');
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
        maxWidth: '600px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto'
      }}>
        {/* Header */}
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
              fontSize: '24px',
              fontWeight: 700,
              color: theme.colors.primary
            }}>
              {role === 'supporter' ? 'Become a Supporter' : 'Create Account'}
            </span>
          </div>
          <p style={{
            fontSize: '14px',
            color: theme.colors.gray600
          }}>
            Step {step} of {role === 'supporter' ? 3 : 2}: {
              step === 1 ? 'Basic Information' : 
              step === 2 ? (role === 'supporter' ? 'Professional Details' : 'Additional Info') :
              'Review & Submit'
            }
          </p>
        </div>

        {/* Progress Bar */}
        <div style={{
          width: '100%',
          height: '4px',
          background: theme.colors.gray200,
          borderRadius: theme.borderRadius.full,
          marginBottom: '32px',
          position: 'relative'
        }}>
          <div style={{
            width: role === 'supporter' 
              ? `${(step / 3) * 100}%` 
              : `${(step / 2) * 100}%`,
            height: '100%',
            background: theme.colors.primary,
            borderRadius: theme.borderRadius.full,
            transition: 'width 0.3s'
          }} />
        </div>

        {/* Step 1: Basic Info */}
        {step === 1 && (
          <div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 500,
                color: theme.colors.gray700,
                marginBottom: '6px'
              }}>
                Full Name
              </label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="John Doe"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: `1px solid ${theme.colors.gray300}`,
                  borderRadius: theme.borderRadius.md,
                  fontSize: '14px'
                }}
              />
            </div>

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
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: `1px solid ${theme.colors.gray300}`,
                  borderRadius: theme.borderRadius.md,
                  fontSize: '14px'
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 500,
                color: theme.colors.gray700,
                marginBottom: '6px'
              }}>
                Password
              </label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
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
                Confirm Password
              </label>
              <input
                type="password"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                placeholder="••••••••"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: `1px solid ${theme.colors.gray300}`,
                  borderRadius: theme.borderRadius.md,
                  fontSize: '14px'
                }}
              />
            </div>
          </div>
        )}

        {/* Step 2: Additional Info */}
        {step === 2 && (
          <div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 500,
                color: theme.colors.gray700,
                marginBottom: '6px'
              }}>
                I am a...
              </label>
              <select
                value={form.userType}
                onChange={(e) => setForm({ ...form, userType: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: `1px solid ${theme.colors.gray300}`,
                  borderRadius: theme.borderRadius.md,
                  fontSize: '14px',
                  background: theme.colors.white
                }}
              >
                {userTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {role === 'supporter' && (
              <>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: theme.colors.gray700,
                    marginBottom: '6px'
                  }}>
                    Areas of Expertise (select multiple)
                  </label>
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '8px',
                    padding: '8px 0'
                  }}>
                    {topics.map(topic => (
                      <span
                        key={topic}
                        onClick={() => {
                          const newTopics = form.topics.includes(topic)
                            ? form.topics.filter(t => t !== topic)
                            : [...form.topics, topic];
                          setForm({ ...form, topics: newTopics });
                        }}
                        style={{
                          padding: '8px 16px',
                          borderRadius: theme.borderRadius.full,
                          fontSize: '13px',
                          fontWeight: 500,
                          cursor: 'pointer',
                          background: form.topics.includes(topic) ? theme.colors.primary : theme.colors.gray100,
                          color: form.topics.includes(topic) ? theme.colors.white : theme.colors.gray700,
                          border: form.topics.includes(topic) ? 'none' : `1px solid ${theme.colors.gray300}`,
                          transition: 'all 0.2s'
                        }}
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: theme.colors.gray700,
                    marginBottom: '6px'
                  }}>
                    Years of Experience
                  </label>
                  <select
                    value={form.experience}
                    onChange={(e) => setForm({ ...form, experience: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: `1px solid ${theme.colors.gray300}`,
                      borderRadius: theme.borderRadius.md,
                      fontSize: '14px'
                    }}
                  >
                    <option value="">Select experience</option>
                    <option value="0-1">Less than 1 year</option>
                    <option value="1-3">1-3 years</option>
                    <option value="3-5">3-5 years</option>
                    <option value="5+">5+ years</option>
                  </select>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: theme.colors.gray700,
                    marginBottom: '6px'
                  }}>
                    Bio / Introduction
                  </label>
                  <textarea
                    rows={4}
                    value={form.bio}
                    onChange={(e) => setForm({ ...form, bio: e.target.value })}
                    placeholder="Tell us about yourself, your experience, and why you want to be a supporter..."
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: `1px solid ${theme.colors.gray300}`,
                      borderRadius: theme.borderRadius.md,
                      fontSize: '14px',
                      resize: 'vertical'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: theme.colors.gray700,
                    marginBottom: '6px'
                  }}>
                    Qualifications (optional)
                  </label>
                  <input
                    value={form.qualifications.join(', ')}
                    onChange={(e) => setForm({ 
                      ...form, 
                      qualifications: e.target.value.split(',').map(q => q.trim()).filter(q => q) 
                    })}
                    placeholder="e.g. M.A. in Psychology, CBT Certified (comma separated)"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: `1px solid ${theme.colors.gray300}`,
                      borderRadius: theme.borderRadius.md,
                      fontSize: '14px'
                    }}
                  />
                </div>
              </>
            )}
          </div>
        )}

        {/* Step 3: Review (Supporters only) */}
        {step === 3 && role === 'supporter' && (
          <div>
            <div style={{
              background: theme.colors.gray50,
              borderRadius: theme.borderRadius.md,
              padding: '24px',
              marginBottom: '24px'
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: theme.colors.primary, marginBottom: '16px' }}>
                Review Your Application
              </h3>
              
              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '13px', color: theme.colors.gray500 }}>Name</div>
                <div style={{ fontSize: '15px', fontWeight: 500, color: theme.colors.gray800 }}>{form.name}</div>
              </div>
              
              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '13px', color: theme.colors.gray500 }}>Email</div>
                <div style={{ fontSize: '15px', fontWeight: 500, color: theme.colors.gray800 }}>{form.email}</div>
              </div>
              
              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '13px', color: theme.colors.gray500 }}>User Type</div>
                <div style={{ fontSize: '15px', fontWeight: 500, color: theme.colors.gray800 }}>{form.userType}</div>
              </div>
              
              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '13px', color: theme.colors.gray500 }}>Areas of Expertise</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                  {form.topics.length > 0 ? form.topics.map(topic => (
                    <span key={topic} style={{
                      padding: '4px 12px',
                      background: theme.colors.primary,
                      color: theme.colors.white,
                      borderRadius: theme.borderRadius.full,
                      fontSize: '12px'
                    }}>
                      {topic}
                    </span>
                  )) : <span style={{ color: theme.colors.gray500 }}>None selected</span>}
                </div>
              </div>
              
              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '13px', color: theme.colors.gray500 }}>Experience</div>
                <div style={{ fontSize: '15px', fontWeight: 500, color: theme.colors.gray800 }}>{form.experience || 'Not specified'}</div>
              </div>

              {form.qualifications.length > 0 && (
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ fontSize: '13px', color: theme.colors.gray500 }}>Qualifications</div>
                  <div style={{ fontSize: '15px', fontWeight: 500, color: theme.colors.gray800 }}>{form.qualifications.join(', ')}</div>
                </div>
              )}

              {form.bio && (
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ fontSize: '13px', color: theme.colors.gray500 }}>Bio</div>
                  <div style={{ fontSize: '14px', color: theme.colors.gray700 }}>{form.bio}</div>
                </div>
              )}
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                cursor: 'pointer'
              }}>
                <input
                  type="checkbox"
                  checked={form.terms}
                  onChange={(e) => setForm({ ...form, terms: e.target.checked })}
                  style={{
                    width: '18px',
                    height: '18px',
                    cursor: 'pointer'
                  }}
                />
                <span style={{
                  fontSize: '14px',
                  color: theme.colors.gray600
                }}>
                  I confirm that the information provided is accurate and I agree to the{' '}
                  <button
                    type="button"
                    onClick={() => window.open('/terms', '_blank')}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: theme.colors.primary,
                      textDecoration: 'underline',
                      cursor: 'pointer'
                    }}
                  >
                    Terms of Service
                  </button>
                </span>
              </label>
            </div>
          </div>
        )}

        {/* Step 2 for regular users (Terms) */}
        {step === 2 && role === 'user' && (
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              cursor: 'pointer',
              marginBottom: '20px'
            }}>
              <input
                type="checkbox"
                checked={form.terms}
                onChange={(e) => setForm({ ...form, terms: e.target.checked })}
                style={{
                  width: '18px',
                  height: '18px',
                  cursor: 'pointer'
                }}
              />
              <span style={{
                fontSize: '14px',
                color: theme.colors.gray600
              }}>
                I agree to the{' '}
                <button
                  type="button"
                  onClick={() => window.open('/terms', '_blank')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: theme.colors.primary,
                    textDecoration: 'underline',
                    cursor: 'pointer'
                  }}
                >
                  Terms of Service
                </button>
                {' '}and{' '}
                <button
                  type="button"
                  onClick={() => window.open('/privacy', '_blank')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: theme.colors.primary,
                    textDecoration: 'underline',
                    cursor: 'pointer'
                  }}
                >
                  Privacy Policy
                </button>
              </span>
            </label>
          </div>
        )}

        {/* Navigation Buttons */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
          {step > 1 && (
            <button
              onClick={handleBack}
              style={{
                flex: 1,
                padding: '14px',
                background: theme.colors.white,
                color: theme.colors.gray700,
                border: `1px solid ${theme.colors.gray300}`,
                borderRadius: theme.borderRadius.md,
                fontSize: '15px',
                fontWeight: 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s'
              }}
            >
              <PencilIcon name="arrow-left" size={16} color={theme.colors.gray600} />
              Back
            </button>
          )}
          
          {(step < (role === 'supporter' ? 3 : 2)) ? (
            <button
              onClick={handleNext}
              style={{
                flex: step > 1 ? 2 : 1,
                padding: '14px',
                background: theme.colors.primary,
                color: theme.colors.white,
                border: 'none',
                borderRadius: theme.borderRadius.md,
                fontSize: '15px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s'
              }}
            >
              Next Step
              <PencilIcon name="arrow-right" size={16} color={theme.colors.white} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                flex: step > 1 ? 2 : 1,
                padding: '14px',
                background: loading ? theme.colors.gray300 : theme.colors.success,
                color: theme.colors.white,
                border: 'none',
                borderRadius: theme.borderRadius.md,
                fontSize: '15px',
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s',
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? 'Submitting...' : (
                <>
                  <PencilIcon name="check" size={16} color={theme.colors.white} />
                  {role === 'supporter' ? 'Submit Application' : 'Create Account'}
                </>
              )}
            </button>
          )}
        </div>

        {/* Login Link */}
        <div style={{
          marginTop: '24px',
          textAlign: 'center'
        }}>
          <p style={{ color: theme.colors.gray600, fontSize: '14px' }}>
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
          </p>
        </div>
      </div>
    </div>
  );
}