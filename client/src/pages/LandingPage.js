import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PencilIcon from '../components/common/PencilIcon';
import { theme } from '../styles/theme';
import { globalStyles } from '../styles/globalStyles';

export default function LandingPage() {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: 'messages',
      title: 'Anonymous Support',
      description: 'Connect with peer supporters anonymously in a safe, judgment-free environment.',
      color: '#1e3a8a'
    },
    {
      icon: 'calendar',
      title: 'Flexible Scheduling',
      description: 'Book sessions at your convenience with supporters who understand your schedule.',
      color: '#1e3a8a'
    },
    {
      icon: 'mood',
      title: 'Wellness Tracking',
      description: 'Track your mood and wellness journey with our built-in tracker.',
      color: '#1e3a8a'
    },
    {
      icon: 'star',
      title: 'Verified Supporters',
      description: 'All supporters are verified and trained to provide quality peer support.',
      color: '#1e3a8a'
    },
    {
      icon: 'notifications',
      title: 'Real-time Notifications',
      description: 'Get instant updates on session requests, messages, and reminders.',
      color: '#1e3a8a'
    },
    {
      icon: 'completed',
      title: 'Progress Tracking',
      description: 'Monitor your progress and see how far you\'ve come in your wellness journey.',
      color: '#1e3a8a'
    }
  ];

  const stats = [
    { value: '500+', label: 'Active Supporters' },
    { value: '10k+', label: 'Sessions Completed' },
    { value: '4.9/5', label: 'Average Rating' },
    { value: '24/7', label: 'Support Available' }
  ];

  const testimonials = [
    {
      name: 'Sarah J.',
      role: 'College Student',
      content: 'PeerBridge helped me through my anxiety during finals week. The supporter was understanding and gave me practical coping strategies.',
      rating: 5
    },
    {
      name: 'Michael C.',
      role: 'Working Professional',
      content: 'I was skeptical at first, but the sessions really helped me manage work-related stress. Highly recommended!',
      rating: 5
    },
    {
      name: 'Emily R.',
      role: 'Graduate Student',
      content: 'Having someone who listens without judgment made all the difference. Grateful for this platform.',
      rating: 5
    }
  ];

  const handleGetStarted = () => {
    navigate('/role-select');
  };

  const handleLearnMore = () => {
    const featuresSection = document.getElementById('features');
    featuresSection?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div style={{ background: theme.colors.gray50, minHeight: '100vh' }}>
      {/* Navigation */}
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        background: isScrolled ? theme.colors.white : 'transparent',
        boxShadow: isScrolled ? theme.shadows.md : 'none',
        transition: 'all 0.3s',
        zIndex: 1000,
        padding: '16px 0'
      }}>
        <div style={globalStyles.container}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                background: theme.colors.primary,
                borderRadius: theme.borderRadius.md,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <PencilIcon name="messages" size={24} color={theme.colors.white} />
              </div>
              <span style={{
                fontSize: '24px',
                fontWeight: 700,
                color: theme.colors.primary
              }}>
                PeerBridge
              </span>
            </div>

            {/* Navigation Links */}
            <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
              <a href="#features" style={{ color: theme.colors.gray700, textDecoration: 'none', fontSize: '16px' }}>Features</a>
              <a href="#how-it-works" style={{ color: theme.colors.gray700, textDecoration: 'none', fontSize: '16px' }}>How It Works</a>
              <a href="#testimonials" style={{ color: theme.colors.gray700, textDecoration: 'none', fontSize: '16px' }}>Testimonials</a>
              <button
                onClick={() => navigate('/login')}
                style={globalStyles.button.secondary}
              >
                Sign In
              </button>
              <button
                onClick={handleGetStarted}
                style={globalStyles.button.primary}
              >
                Get Started
                <PencilIcon name="check" size={16} color={theme.colors.white} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{
        padding: '120px 0 80px',
        background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.primaryDark} 100%)`,
        color: theme.colors.white
      }}>
        <div style={globalStyles.container}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '60px',
            alignItems: 'center'
          }}>
            <div>
              <h1 style={{
                fontSize: '52px',
                fontWeight: 700,
                color: theme.colors.white,
                lineHeight: 1.2,
                marginBottom: '20px'
              }}>
                Your Safe Space for
                <span style={{ display: 'block', color: '#fbbf24' }}>Peer Support</span>
              </h1>
              <p style={{
                fontSize: '18px',
                color: 'rgba(255,255,255,0.9)',
                lineHeight: 1.6,
                marginBottom: '32px',
                maxWidth: '500px'
              }}>
                Connect with trained peer supporters anonymously. Get the support you need, when you need it.
              </p>
              <div style={{ display: 'flex', gap: '16px' }}>
                <button
                  onClick={handleGetStarted}
                  style={{
                    ...globalStyles.button.primary,
                    background: theme.colors.white,
                    color: theme.colors.primary,
                    padding: '16px 32px',
                    fontSize: '16px'
                  }}
                >
                  Start Your Journey
                  <PencilIcon name="arrow" size={18} color={theme.colors.primary} />
                </button>
                <button
                  onClick={handleLearnMore}
                  style={{
                    ...globalStyles.button.secondary,
                    background: 'transparent',
                    color: theme.colors.white,
                    borderColor: 'rgba(255,255,255,0.3)',
                    padding: '16px 32px',
                    fontSize: '16px'
                  }}
                >
                  Learn More
                </button>
              </div>
            </div>
            <div style={{
              background: 'rgba(255,255,255,0.1)',
              borderRadius: theme.borderRadius['2xl'],
              padding: '40px',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)'
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                {[1, 2, 3, 4].map(i => (
                  <div key={i} style={{
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: theme.borderRadius.lg,
                    padding: '20px',
                    textAlign: 'center'
                  }}>
                    <PencilIcon 
                      name={i === 1 ? 'messages' : i === 2 ? 'calendar' : i === 3 ? 'mood' : 'completed'} 
                      size={32} 
                      color={theme.colors.white} 
                    />
                    <div style={{ marginTop: '12px', fontSize: '14px', color: theme.colors.white }}>
                      {i === 1 ? 'Anonymous' : i === 2 ? 'Flexible' : i === 3 ? 'Track' : 'Progress'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section style={{ padding: '60px 0', background: theme.colors.white }}>
        <div style={globalStyles.container}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '30px'
          }}>
            {stats.map(stat => (
              <div key={stat.label} style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: '36px',
                  fontWeight: 700,
                  color: theme.colors.primary,
                  marginBottom: '8px'
                }}>
                  {stat.value}
                </div>
                <div style={{
                  fontSize: '16px',
                  color: theme.colors.gray600
                }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" style={{ padding: '80px 0', background: theme.colors.gray50 }}>
        <div style={globalStyles.container}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 style={globalStyles.typography.h2}>
              Why Choose PeerBridge?
            </h2>
            <p style={{
              ...globalStyles.typography.body,
              maxWidth: '600px',
              margin: '20px auto 0'
            }}>
              Our platform is designed to provide safe, anonymous, and effective peer support
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '30px'
          }}>
            {features.map(feature => (
              <div key={feature.title} style={{
                ...globalStyles.card,
                transition: 'transform 0.3s, box-shadow 0.3s',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = theme.shadows.lg;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = theme.shadows.md;
              }}
              >
                <div style={{
                  width: '60px',
                  height: '60px',
                  background: `${feature.color}10`,
                  borderRadius: theme.borderRadius.md,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '20px'
                }}>
                  <PencilIcon name={feature.icon} size={28} color={feature.color} />
                </div>
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: 600,
                  color: theme.colors.primary,
                  marginBottom: '12px'
                }}>
                  {feature.title}
                </h3>
                <p style={{
                  fontSize: '14px',
                  color: theme.colors.gray600,
                  lineHeight: 1.6,
                  margin: 0
                }}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" style={{ padding: '80px 0', background: theme.colors.white }}>
        <div style={globalStyles.container}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 style={globalStyles.typography.h2}>
              How It Works
            </h2>
            <p style={{
              ...globalStyles.typography.body,
              maxWidth: '600px',
              margin: '20px auto 0'
            }}>
              Get started in three simple steps
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '40px',
            position: 'relative'
          }}>
            {[
              {
                step: 1,
                icon: 'user',
                title: 'Create Account',
                description: 'Sign up anonymously and tell us a bit about yourself'
              },
              {
                step: 2,
                icon: 'find',
                title: 'Find a Supporter',
                description: 'Browse and choose from our verified peer supporters'
              },
              {
                step: 3,
                icon: 'messages',
                title: 'Start Session',
                description: 'Connect and start your journey towards better wellness'
              }
            ].map((item, index) => (
              <div key={item.step} style={{ textAlign: 'center', position: 'relative' }}>
                {index < 2 && (
                  <div style={{
                    position: 'absolute',
                    top: '40px',
                    right: '-20px',
                    width: '40px',
                    height: '2px',
                    background: theme.colors.primary,
                    opacity: 0.3,
                    display: 'none'
                  }} />
                )}
                <div style={{
                  width: '80px',
                  height: '80px',
                  background: theme.colors.primary,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 24px',
                  position: 'relative'
                }}>
                  <span style={{
                    position: 'absolute',
                    top: -8,
                    right: -8,
                    width: '24px',
                    height: '24px',
                    background: theme.colors.warning,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: theme.colors.white,
                    fontSize: '12px',
                    fontWeight: 700
                  }}>
                    {item.step}
                  </span>
                  <PencilIcon name={item.icon} size={32} color={theme.colors.white} />
                </div>
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: 600,
                  color: theme.colors.primary,
                  marginBottom: '12px'
                }}>
                  {item.title}
                </h3>
                <p style={{
                  fontSize: '14px',
                  color: theme.colors.gray600,
                  lineHeight: 1.6,
                  margin: 0
                }}>
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" style={{ padding: '80px 0', background: theme.colors.gray50 }}>
        <div style={globalStyles.container}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 style={globalStyles.typography.h2}>
              What Our Users Say
            </h2>
            <p style={{
              ...globalStyles.typography.body,
              maxWidth: '600px',
              margin: '20px auto 0'
            }}>
              Real stories from real people
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '30px'
          }}>
            {testimonials.map(t => (
              <div key={t.name} style={{
                ...globalStyles.card,
                position: 'relative'
              }}>
                <div style={{
                  position: 'absolute',
                  top: '20px',
                  right: '20px',
                  fontSize: '40px',
                  color: theme.colors.primary,
                  opacity: 0.1
                }}>
                  "
                </div>
                <div style={{ marginBottom: '20px' }}>
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} filled={i < t.rating} />
                  ))}
                </div>
                <p style={{
                  fontSize: '15px',
                  color: theme.colors.gray700,
                  lineHeight: 1.6,
                  marginBottom: '20px',
                  fontStyle: 'italic'
                }}>
                  "{t.content}"
                </p>
                <div>
                  <div style={{
                    fontWeight: 600,
                    color: theme.colors.primary
                  }}>
                    {t.name}
                  </div>
                  <div style={{
                    fontSize: '13px',
                    color: theme.colors.gray500
                  }}>
                    {t.role}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        padding: '80px 0',
        background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.primaryDark} 100%)`,
        color: theme.colors.white
      }}>
        <div style={globalStyles.container}>
          <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{
              fontSize: '36px',
              fontWeight: 700,
              color: theme.colors.white,
              marginBottom: '20px'
            }}>
              Ready to Start Your Journey?
            </h2>
            <p style={{
              fontSize: '18px',
              color: 'rgba(255,255,255,0.9)',
              marginBottom: '32px'
            }}>
              Join thousands of others who have found support through PeerBridge
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
              <button
                onClick={handleGetStarted}
                style={{
                  ...globalStyles.button.primary,
                  background: theme.colors.white,
                  color: theme.colors.primary,
                  padding: '16px 32px',
                  fontSize: '16px'
                }}
              >
                Get Started Now
                <PencilIcon name="check" size={18} color={theme.colors.primary} />
              </button>
              <button
                onClick={() => navigate('/login')}
                style={{
                  ...globalStyles.button.secondary,
                  background: 'transparent',
                  color: theme.colors.white,
                  borderColor: 'rgba(255,255,255,0.3)',
                  padding: '16px 32px',
                  fontSize: '16px'
                }}
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        padding: '60px 0 30px',
        background: theme.colors.gray900,
        color: theme.colors.white
      }}>
        <div style={globalStyles.container}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr 1fr 1fr',
            gap: '40px',
            marginBottom: '40px'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  background: theme.colors.white,
                  borderRadius: theme.borderRadius.md,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <PencilIcon name="messages" size={24} color={theme.colors.primary} />
                </div>
                <span style={{
                  fontSize: '20px',
                  fontWeight: 700,
                  color: theme.colors.white
                }}>
                  PeerBridge
                </span>
              </div>
              <p style={{
                fontSize: '14px',
                color: theme.colors.gray400,
                lineHeight: 1.6,
                marginBottom: '20px'
              }}>
                Your safe space for anonymous peer support. Connect, share, and heal together.
              </p>
            </div>

            <div>
              <h4 style={{ fontSize: '16px', fontWeight: 600, color: theme.colors.white, marginBottom: '20px' }}>
                Quick Links
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {['About Us', 'How It Works', 'Supporters', 'FAQ'].map(item => (
                  <li key={item} style={{ marginBottom: '12px' }}>
                    <a href="#" style={{ color: theme.colors.gray400, textDecoration: 'none', fontSize: '14px' }}>
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 style={{ fontSize: '16px', fontWeight: 600, color: theme.colors.white, marginBottom: '20px' }}>
                Resources
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {['Blog', 'Guides', 'Community', 'Support'].map(item => (
                  <li key={item} style={{ marginBottom: '12px' }}>
                    <a href="#" style={{ color: theme.colors.gray400, textDecoration: 'none', fontSize: '14px' }}>
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 style={{ fontSize: '16px', fontWeight: 600, color: theme.colors.white, marginBottom: '20px' }}>
                Legal
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Contact'].map(item => (
                  <li key={item} style={{ marginBottom: '12px' }}>
                    <a href="#" style={{ color: theme.colors.gray400, textDecoration: 'none', fontSize: '14px' }}>
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div style={{
            paddingTop: '30px',
            borderTop: `1px solid ${theme.colors.gray800}`,
            textAlign: 'center',
            color: theme.colors.gray500,
            fontSize: '14px'
          }}>
            © 2024 PeerBridge. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

// Star component for ratings
const Star = ({ filled }) => (
  <span style={{
    fontSize: '18px',
    color: filled ? '#fbbf24' : theme.colors.gray300,
    marginRight: '2px'
  }}>
    ★
  </span>
);