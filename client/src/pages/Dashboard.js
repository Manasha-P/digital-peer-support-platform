import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Row, Col } from 'react-bootstrap';

const supporters = [
  { name: 'Anjali R.',    role: 'Anxiety & Stress',   rating: 4.9, sessions: 134, online: true,  avatar: 'A', color: 'avatar-teal'   },
  { name: 'Vikram S.',    role: 'Depression Support',  rating: 4.8, sessions: 98,  online: true,  avatar: 'V', color: 'avatar-blue'   },
  { name: 'Meera P.',     role: 'Grief & Loss',        rating: 5.0, sessions: 62,  online: false, avatar: 'M', color: 'avatar-purple' },
  { name: 'Karthik N.',   role: 'Work-Life Balance',   rating: 4.7, sessions: 77,  online: true,  avatar: 'K', color: 'avatar-green'  },
];

const sessions = [
  { supporter: 'Anjali R.',  topic: 'Exam anxiety',          time: 'Today, 3:00 PM',    status: 'upcoming', color: 'avatar-teal'   },
  { supporter: 'Vikram S.',  topic: 'Work stress discussion', time: 'Yesterday, 11 AM',  status: 'completed', color: 'avatar-blue'  },
  { supporter: 'Meera P.',   topic: 'Family relationship',    time: 'Jan 20, 9:00 AM',   status: 'completed', color: 'avatar-purple' },
];

const navItems = [
  { icon: '🏠', label: 'Dashboard',  key: 'dashboard' },
  { icon: '💬', label: 'Messages',   key: 'messages'  },
  { icon: '📅', label: 'Sessions',   key: 'sessions'  },
  { icon: '🤝', label: 'Supporters', key: 'supporters'},
  { icon: '🔔', label: 'Alerts',     key: 'alerts'    },
  { icon: '⚙️', label: 'Settings',   key: 'settings'  },
];

function StatusBadge({ status }) {
  const map = {
    upcoming:  { bg: '#EFF6FF', color: 'var(--primary)', label: 'Upcoming'  },
    completed: { bg: '#ECFDF5', color: 'var(--success)', label: 'Completed' },
    cancelled: { bg: '#FEF2F2', color: 'var(--danger)',  label: 'Cancelled' },
  };
  const s = map[status] || map.upcoming;
  return (
    <span style={{ background: s.bg, color: s.color, padding: '4px 10px', borderRadius: 99, fontSize: '0.76rem', fontWeight: 600 }}>
      {s.label}
    </span>
  );
}

export default function Dashboard() {
  const [active, setActive] = useState('dashboard');

  return (
    <div style={{ display: 'flex', background: 'var(--bg)', minHeight: '100vh' }}>
      {/* ─── SIDEBAR ─── */}
      <aside className="sidebar">
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="navbar-brand-custom" style={{ color: 'white' }}>
            <div className="brand-icon">💙</div>
            PeerSupport
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '0 12px' }}>
          {navItems.map(item => (
            <button
              key={item.key}
              className={`sidebar-nav-item ${active === item.key ? 'active' : ''}`}
              onClick={() => setActive(item.key)}
              style={{ borderRadius: 10, marginBottom: 2 }}
            >
              <span className="sidebar-icon">{item.icon}</span>
              {item.label}
              {item.key === 'alerts' && (
                <span
                  style={{
                    marginLeft: 'auto', background: 'var(--danger)',
                    color: 'white', borderRadius: 99,
                    fontSize: '0.7rem', padding: '2px 7px', fontWeight: 700,
                  }}
                >
                  3
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* User at bottom */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="d-flex align-items-center gap-3">
            <div className="avatar avatar-md avatar-blue">M</div>
            <div>
              <div style={{ color: 'white', fontWeight: 600, fontSize: '0.88rem' }}>Manasha P</div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.76rem' }}>User</div>
            </div>
            <Link to="/" style={{ marginLeft: 'auto', color: 'rgba(255,255,255,0.35)', fontSize: '1rem', textDecoration: 'none' }}>
              ↩
            </Link>
          </div>
        </div>
      </aside>

      {/* ─── MAIN CONTENT ─── */}
      <main className="main-content" style={{ padding: '32px', flex: 1 }}>

        {/* Top bar */}
        <div className="d-flex align-items-center justify-content-between mb-4">
          <div>
            <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 2 }}>
              Good morning, Manasha 👋
            </h1>
            <p style={{ color: 'var(--gray)', fontSize: '0.9rem', margin: 0 }}>
              Here's what's happening with your support journey today.
            </p>
          </div>
          <div className="d-flex align-items-center gap-3">
            <button
              style={{
                position: 'relative', background: 'white', border: '1px solid var(--border)',
                borderRadius: 10, width: 40, height: 40,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', fontSize: '1rem',
              }}
            >
              🔔
              <span className="notif-dot"></span>
            </button>
            <div className="avatar avatar-md avatar-blue">M</div>
          </div>
        </div>

        {/* ─── STAT CARDS ─── */}
        <Row className="g-3 mb-4">
          {[
            { icon: '📅', label: 'Total Sessions',       value: '12',    sub: '+2 this month',  iconClass: 'stat-icon-blue'   },
            { icon: '✅', label: 'Completed Sessions',    value: '10',    sub: '83% completion', iconClass: 'stat-icon-green'  },
            { icon: '⭐', label: 'Average Rating Given',  value: '4.8',   sub: 'Based on 10',    iconClass: 'stat-icon-yellow' },
            { icon: '💬', label: 'Unread Messages',       value: '3',     sub: '2 conversations',iconClass: 'stat-icon-purple' },
          ].map((stat, i) => (
            <Col xs={6} xl={3} key={i}>
              <div className="stat-card animate-fadeInUp" style={{ animationDelay: `${i * 0.08}s`, opacity: 0 }}>
                <div className={`stat-icon ${stat.iconClass}`}>{stat.icon}</div>
                <div>
                  <div style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: '1.6rem', lineHeight: 1, letterSpacing: '-0.5px' }}>
                    {stat.value}
                  </div>
                  <div style={{ color: 'var(--gray)', fontSize: '0.82rem', marginTop: 3 }}>{stat.label}</div>
                  <div style={{ color: 'var(--success)', fontSize: '0.75rem', fontWeight: 600, marginTop: 2 }}>{stat.sub}</div>
                </div>
              </div>
            </Col>
          ))}
        </Row>

        <Row className="g-4">
          {/* ─── UPCOMING SESSION ─── */}
          <Col lg={8}>

            {/* Upcoming banner */}
            <div
              style={{
                background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                borderRadius: 'var(--radius-lg)',
                padding: '20px 24px',
                marginBottom: 20,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 12,
              }}
            >
              <div className="d-flex align-items-center gap-3">
                <div className="avatar avatar-md avatar-teal" style={{ border: '2px solid rgba(255,255,255,0.4)' }}>A</div>
                <div>
                  <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.78rem', fontWeight: 600, marginBottom: 2 }}>NEXT SESSION</div>
                  <div style={{ color: 'white', fontWeight: 700, fontSize: '1rem' }}>Anjali R. · Exam Anxiety</div>
                  <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.82rem', marginTop: 2 }}>📅 Today at 3:00 PM · 30 min</div>
                </div>
              </div>
              <Link
                to="/chat"
                style={{
                  background: 'white', color: 'var(--primary)',
                  padding: '10px 20px', borderRadius: 10,
                  fontWeight: 700, fontSize: '0.88rem',
                  textDecoration: 'none', whiteSpace: 'nowrap',
                }}
              >
                Join Session →
              </Link>
            </div>

            {/* Session history */}
            <div>
              <div className="section-title">
                All Sessions
                <Link to="#" style={{ color: 'var(--primary)', fontSize: '0.82rem', fontWeight: 600, textDecoration: 'none' }}>
                  View all →
                </Link>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {sessions.map((s, i) => (
                  <div key={i} className="session-card">
                    <div className={`avatar avatar-md ${s.color}`}>{s.supporter[0]}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--dark)' }}>{s.supporter}</div>
                      <div style={{ color: 'var(--gray)', fontSize: '0.82rem', marginTop: 2 }}>{s.topic}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <StatusBadge status={s.status} />
                      <div style={{ color: 'var(--gray)', fontSize: '0.76rem', marginTop: 4 }}>{s.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Col>

          {/* ─── SIDE PANEL ─── */}
          <Col lg={4}>
            {/* Find Supporters */}
            <div>
              <div className="section-title">
                Find a Supporter
                <Link to="#" style={{ color: 'var(--primary)', fontSize: '0.82rem', fontWeight: 600, textDecoration: 'none' }}>
                  View all
                </Link>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {supporters.map((s, i) => (
                  <Link key={i} to="/chat" className="supporter-card">
                    <div style={{ position: 'relative' }}>
                      <div className={`avatar avatar-md ${s.color}`}>{s.avatar}</div>
                      {s.online && (
                        <span
                          className="online-dot"
                          style={{
                            position: 'absolute', bottom: 0, right: 0,
                            width: 10, height: 10,
                            border: '2px solid white',
                          }}
                        ></span>
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--dark)' }}>{s.name}</div>
                      <div style={{ color: 'var(--gray)', fontSize: '0.78rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {s.role}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--dark)' }}>⭐ {s.rating}</div>
                      <div style={{ color: 'var(--gray)', fontSize: '0.75rem' }}>{s.sessions} sessions</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Mood Check */}
            <div
              className="card-custom"
              style={{ padding: '20px', marginTop: 20 }}
            >
              <div style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: '0.95rem', marginBottom: 12 }}>
                🌤 Daily Mood Check-in
              </div>
              <p style={{ color: 'var(--gray)', fontSize: '0.82rem', marginBottom: 14 }}>
                How are you feeling today?
              </p>
              <div className="d-flex gap-2 justify-content-between">
                {['😞', '😕', '😐', '🙂', '😊'].map((emoji, i) => (
                  <button
                    key={i}
                    style={{
                      background: i === 3 ? 'var(--primary-light)' : 'var(--bg)',
                      border: i === 3 ? '2px solid var(--primary)' : '2px solid var(--border)',
                      borderRadius: 10, padding: '10px 8px', cursor: 'pointer',
                      fontSize: '1.3rem', flex: 1, transition: 'all 0.2s',
                    }}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          </Col>
        </Row>
      </main>
    </div>
  );
}