import React, { useState, useEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const features = [
  {
    icon: '🤝',
    title: 'Trained Peer Supporters',
    desc: 'Connect with empathetic, verified peer supporters who share lived experiences.',
    color: 'stat-icon-blue',
  },
  {
    icon: '💬',
    title: 'Real-Time Chat',
    desc: 'Secure, instant messaging with your supporter — available anytime you need.',
    color: 'stat-icon-green',
  },
  {
    icon: '📅',
    title: 'Easy Session Booking',
    desc: 'Schedule sessions around your day with a simple, intuitive calendar.',
    color: 'stat-icon-yellow',
  },
  {
    icon: '🔒',
    title: 'Private & Confidential',
    desc: 'End-to-end encrypted conversations. Your privacy is our top priority.',
    color: 'stat-icon-purple',
  },
];

const testimonials = [
  {
    name: 'Priya M.',
    role: 'Student',
    text: 'PeerSupport helped me through my most anxious semester. My supporter truly understood what I was going through.',
    avatar: 'P',
    color: 'avatar-purple',
  },
  {
    name: 'Rohan K.',
    role: 'Working Professional',
    text: 'I was sceptical at first, but the sessions were genuinely transformative. Highly recommend to anyone struggling.',
    avatar: 'R',
    color: 'avatar-blue',
  },
  {
    name: 'Sneha T.',
    role: 'Homemaker',
    text: 'Being able to talk to someone who actually gets it — not just a professional — made all the difference for me.',
    avatar: 'S',
    color: 'avatar-teal',
  },
];

const stats = [
  { value: '2,400+', label: 'Registered Users' },
  { value: '180+',   label: 'Peer Supporters' },
  { value: '8,900+', label: 'Sessions Done' },
  { value: '4.9 ⭐', label: 'Average Rating' },
];

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* ─── NAVBAR ─── */}
      <nav
        className="navbar-custom"
        style={{
          boxShadow: scrolled ? '0 4px 24px rgba(37,99,235,0.10)' : 'none',
          transition: 'box-shadow 0.3s',
        }}
      >
        <Container>
          <div className="d-flex align-items-center justify-content-between w-100">
            <Link to="/" className="navbar-brand-custom">
              <div className="brand-icon">💙</div>
              PeerSupport
            </Link>
            <div className="d-flex align-items-center gap-2">
              <Link to="/login"    className="btn-ghost">Sign In</Link>
              <Link to="/register" className="btn-primary-custom">
                Get Started →
              </Link>
            </div>
          </div>
        </Container>
      </nav>

      {/* ─── HERO ─── */}
      <section className="hero-section">
        <Container style={{ position: 'relative', zIndex: 2 }}>
          <Row className="align-items-center g-5">
            <Col lg={6}>
              <div className="animate-fadeInUp">
                <span className="badge-custom badge-primary mb-3">
                  <span className="online-dot" style={{ width: 7, height: 7 }}></span>
                  Peer Support Platform
                </span>
                <h1
                  style={{
                    fontSize: 'clamp(2.2rem, 5vw, 3.2rem)',
                    lineHeight: 1.18,
                    letterSpacing: '-1.5px',
                    color: 'var(--dark)',
                    marginBottom: '1.2rem',
                  }}
                >
                  You Don't Have to <br />
                  <span
                    style={{
                      background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    Face It Alone
                  </span>
                </h1>
                <p
                  style={{
                    fontSize: '1.08rem',
                    color: 'var(--gray)',
                    lineHeight: 1.7,
                    maxWidth: 480,
                    marginBottom: '2rem',
                  }}
                >
                  Connect with trained peer supporters who truly understand.
                  Get real-time emotional guidance in a safe, confidential space — any time, any day.
                </p>
                <div className="d-flex flex-wrap gap-3 align-items-center">
                  <Link to="/register" className="btn-primary-custom" style={{ padding: '13px 30px', fontSize: '1rem' }}>
                    Start Free Today →
                  </Link>
                  <Link to="/login" className="btn-outline-custom" style={{ padding: '12px 28px', fontSize: '1rem' }}>
                    Sign In
                  </Link>
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--gray)', marginTop: '1rem' }}>
                  ✅ Free to join &nbsp;·&nbsp; 🔒 100% Confidential &nbsp;·&nbsp; 💙 No judgment
                </p>
              </div>
            </Col>

            <Col lg={6}>
              <div className="animate-float" style={{ animationDelay: '0.3s' }}>
                {/* Mock chat preview card */}
                <div
                  className="card-custom animate-fadeInUp animate-delay-2"
                  style={{ padding: '0', overflow: 'hidden', maxWidth: 420, margin: '0 auto' }}
                >
                  {/* Chat header */}
                  <div
                    style={{
                      padding: '16px 20px',
                      background: 'white',
                      borderBottom: '1px solid var(--border)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                    }}
                  >
                    <div className="avatar avatar-md avatar-teal">A</div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--dark)' }}>
                        Anjali (Peer Supporter)
                      </div>
                      <div className="d-flex align-items-center gap-1" style={{ fontSize: '0.78rem', color: 'var(--success)' }}>
                        <span className="online-dot" style={{ width: 7, height: 7 }}></span>
                        Online now
                      </div>
                    </div>
                  </div>
                  {/* Chat messages */}
                  <div style={{ padding: '20px', background: '#F8FAFF', display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div className="message-bubble message-received" style={{ maxWidth: '80%' }}>
                      Hi! I'm Anjali. I'm here to listen. How are you feeling today? 😊
                      <span className="message-time">10:02 AM</span>
                    </div>
                    <div className="message-bubble message-sent" style={{ maxWidth: '80%', alignSelf: 'flex-end' }}>
                      I've been really anxious about exams lately...
                      <span className="message-time" style={{ opacity: 0.7 }}>10:04 AM</span>
                    </div>
                    <div className="message-bubble message-received" style={{ maxWidth: '80%' }}>
                      I completely understand that feeling. I went through the same thing. Let's talk about it — what's worrying you the most?
                      <span className="message-time">10:05 AM</span>
                    </div>
                    <div className="typing-indicator">
                      <div className="typing-dot"></div>
                      <div className="typing-dot"></div>
                      <div className="typing-dot"></div>
                    </div>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* ─── STATS STRIP ─── */}
      <section style={{ background: 'var(--dark)', padding: '40px 0' }}>
        <Container>
          <Row className="text-center g-4">
            {stats.map((s, i) => (
              <Col xs={6} md={3} key={i}>
                <div
                  className="animate-fadeInUp"
                  style={{ animationDelay: `${i * 0.1}s`, opacity: 0 }}
                >
                  <div
                    style={{
                      fontFamily: "'Sora', sans-serif",
                      fontWeight: 800,
                      fontSize: '2rem',
                      color: 'white',
                      letterSpacing: '-1px',
                    }}
                  >
                    {s.value}
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.88rem', marginTop: 4 }}>
                    {s.label}
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* ─── FEATURES ─── */}
      <section style={{ padding: '80px 0', background: 'white' }}>
        <Container>
          <div className="text-center mb-5">
            <span className="badge-custom badge-primary mb-3">Why PeerSupport?</span>
            <h2 style={{ fontSize: '2.2rem', letterSpacing: '-1px', color: 'var(--dark)' }}>
              Everything you need to feel better
            </h2>
            <p style={{ color: 'var(--gray)', maxWidth: 500, margin: '12px auto 0', lineHeight: 1.7 }}>
              Designed with care to make getting support as easy and safe as possible.
            </p>
          </div>
          <Row className="g-4">
            {features.map((f, i) => (
              <Col md={6} lg={3} key={i}>
                <div
                  className="card-custom animate-fadeInUp"
                  style={{ padding: '28px 24px', height: '100%', animationDelay: `${i * 0.1}s`, opacity: 0 }}
                >
                  <div className={`stat-icon ${f.color}`} style={{ marginBottom: 16 }}>
                    {f.icon}
                  </div>
                  <h5 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, marginBottom: 8, fontSize: '1.05rem' }}>
                    {f.title}
                  </h5>
                  <p style={{ color: 'var(--gray)', fontSize: '0.9rem', lineHeight: 1.65, margin: 0 }}>
                    {f.desc}
                  </p>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section style={{ padding: '80px 0', background: 'var(--bg)' }}>
        <Container>
          <div className="text-center mb-5">
            <span className="badge-custom badge-success mb-3">💬 Real Stories</span>
            <h2 style={{ fontSize: '2.2rem', letterSpacing: '-1px', color: 'var(--dark)' }}>
              People who found their way
            </h2>
          </div>
          <Row className="g-4">
            {testimonials.map((t, i) => (
              <Col md={4} key={i}>
                <div
                  className="card-custom animate-fadeInUp"
                  style={{ padding: '28px', height: '100%', animationDelay: `${i * 0.15}s`, opacity: 0 }}
                >
                  <div style={{ marginBottom: 16, color: '#F59E0B', fontSize: '1rem' }}>
                    ★★★★★
                  </div>
                  <p style={{ color: 'var(--dark-3)', lineHeight: 1.7, fontSize: '0.95rem', fontStyle: 'italic', marginBottom: 20 }}>
                    "{t.text}"
                  </p>
                  <div className="d-flex align-items-center gap-3">
                    <div className={`avatar avatar-md ${t.color}`}>{t.avatar}</div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>{t.name}</div>
                      <div style={{ color: 'var(--gray)', fontSize: '0.8rem' }}>{t.role}</div>
                    </div>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* ─── CTA ─── */}
      <section
        style={{
          padding: '80px 0',
          background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Container style={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
          <h2 style={{ fontSize: '2.4rem', color: 'white', letterSpacing: '-1px', marginBottom: '1rem', fontFamily: "'Sora', sans-serif" }}>
            Ready to take the first step?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '1.05rem', marginBottom: '2rem', maxWidth: 440, margin: '0 auto 2rem' }}>
            Join thousands who found comfort and clarity through peer support.
          </p>
          <Link
            to="/register"
            style={{
              background: 'white',
              color: 'var(--primary)',
              padding: '14px 36px',
              borderRadius: '12px',
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 700,
              fontSize: '1rem',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
              transition: 'all 0.2s',
            }}
          >
            Create Free Account →
          </Link>
        </Container>
      </section>

      {/* ─── FOOTER ─── */}
      <footer style={{ background: 'var(--dark)', padding: '32px 0', textAlign: 'center' }}>
        <Container>
          <div className="navbar-brand-custom justify-content-center mb-2" style={{ color: 'white' }}>
            <div className="brand-icon">💙</div>
            PeerSupport
          </div>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.82rem', margin: 0 }}>
            © 2026 Digital Peer Support Platform — Built with MERN Stack by MANASHA P
          </p>
        </Container>
      </footer>
    </div>
  );
}