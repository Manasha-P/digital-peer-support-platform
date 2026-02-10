import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';

const initialMessages = [
  { id: 1, from: 'them', text: "Hi! I'm Anjali. I'm here to listen without any judgment. How are you feeling today? 😊", time: '10:00 AM' },
  { id: 2, from: 'me',   text: "Hi Anjali! I've been feeling really overwhelmed with exams coming up.", time: '10:02 AM' },
  { id: 3, from: 'them', text: "I completely understand that. Exam stress can feel really heavy. I went through something very similar during my own final year. What subject is worrying you the most?", time: '10:03 AM' },
  { id: 4, from: 'me',   text: "It's all of them honestly. I can't seem to focus and I keep having negative thoughts.", time: '10:05 AM' },
  { id: 5, from: 'them', text: "That's a really common experience and it makes complete sense. Let's try something — can you name one small thing you've already studied that you feel okay about?", time: '10:06 AM' },
  { id: 6, from: 'me',   text: "I guess I'm okay with the first two chapters of Math.", time: '10:08 AM' },
  { id: 7, from: 'them', text: "That's great! You already have a foundation. 🌟 We can work from there. Breaking it down into small wins really helps reduce overwhelm. Want me to help you create a gentle study plan?", time: '10:09 AM' },
];

const contacts = [
  { name: 'Anjali R.',   role: 'Anxiety & Stress',  avatar: 'A', color: 'avatar-teal',   online: true,  last: "Let's try something...", time: '10:09', unread: 0  },
  { name: 'Vikram S.',   role: 'Depression Support', avatar: 'V', color: 'avatar-blue',   online: true,  last: "How was your week?",     time: 'Yesterday', unread: 2  },
  { name: 'Meera P.',    role: 'Grief & Loss',       avatar: 'M', color: 'avatar-purple', online: false, last: "Session tomorrow 9AM",   time: 'Mon', unread: 0  },
  { name: 'Karthik N.',  role: 'Work-Life Balance',  avatar: 'K', color: 'avatar-green',  online: true,  last: "You're doing great!",    time: 'Sun', unread: 1  },
];

export default function ChatPage() {
  const [messages, setMessages]   = useState(initialMessages);
  const [input, setInput]         = useState('');
  const [typing, setTyping]       = useState(false);
  const [active, setActive]       = useState(0);
  const messagesEndRef             = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const sendMessage = () => {
    if (!input.trim()) return;
    const newMsg = { id: messages.length + 1, from: 'me', text: input.trim(), time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) };
    setMessages(prev => [...prev, newMsg]);
    setInput('');
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      const replies = [
        "That's a really thoughtful share. Thank you for trusting me with that. 💙",
        "I hear you. It's okay to feel that way. You're not alone in this.",
        "Let's take this one step at a time. You're doing better than you think! 🌟",
        "That makes complete sense. How long have you been feeling this way?",
      ];
      setMessages(prev => [
        ...prev,
        {
          id: prev.length + 2,
          from: 'them',
          text: replies[Math.floor(Math.random() * replies.length)],
          time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }, 1800);
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div style={{ display: 'flex', background: 'var(--bg)', height: '100vh', overflow: 'hidden' }}>
      {/* ─── SIDEBAR ─── */}
      <aside className="sidebar">
        {/* Logo */}
        <div className="sidebar-logo">
          <Link to="/" className="navbar-brand-custom" style={{ color: 'white', textDecoration: 'none' }}>
            <div className="brand-icon">💙</div>
            PeerSupport
          </Link>
        </div>
        {[
          { icon: '🏠', label: 'Dashboard', to: '/dashboard' },
          { icon: '💬', label: 'Messages',  to: '/chat', active: true },
          { icon: '📅', label: 'Sessions',  to: '/dashboard' },
          { icon: '🤝', label: 'Supporters',to: '/dashboard' },
          { icon: '⚙️', label: 'Settings',  to: '/dashboard' },
        ].map((item, i) => (
          <Link
            key={i}
            to={item.to}
            className={`sidebar-nav-item ${item.active ? 'active' : ''}`}
            style={{ borderRadius: 10, margin: '1px 12px', textDecoration: 'none' }}
          >
            <span className="sidebar-icon">{item.icon}</span>
            {item.label}
          </Link>
        ))}
        <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.08)', marginTop: 'auto' }}>
          <div className="d-flex align-items-center gap-3">
            <div className="avatar avatar-md avatar-blue">M</div>
            <div>
              <div style={{ color: 'white', fontWeight: 600, fontSize: '0.88rem' }}>Manasha P</div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.76rem' }}>User</div>
            </div>
          </div>
        </div>
      </aside>

      {/* ─── CONTACTS LIST ─── */}
      <div
        style={{
          width: 300,
          background: 'white',
          borderRight: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          flexShrink: 0,
        }}
      >
        {/* Header */}
        <div style={{ padding: '20px', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: '1.1rem', fontWeight: 800, marginBottom: 12 }}>
            Messages
          </h2>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray)', fontSize: '0.9rem' }}>🔍</span>
            <input
              type="text"
              placeholder="Search conversations..."
              style={{
                width: '100%', padding: '9px 12px 9px 34px',
                border: '2px solid var(--border)', borderRadius: 10,
                fontFamily: "'DM Sans', sans-serif", fontSize: '0.88rem',
                background: 'var(--bg)', outline: 'none', color: 'var(--dark)',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--primary)'}
              onBlur={e  => e.target.style.borderColor = 'var(--border)'}
            />
          </div>
        </div>

        {/* Contacts */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {contacts.map((c, i) => (
            <div
              key={i}
              onClick={() => setActive(i)}
              style={{
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                cursor: 'pointer',
                background: active === i ? 'var(--primary-light)' : 'transparent',
                borderLeft: active === i ? '3px solid var(--primary)' : '3px solid transparent',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { if (active !== i) e.currentTarget.style.background = 'var(--bg)'; }}
              onMouseLeave={e => { if (active !== i) e.currentTarget.style.background = 'transparent'; }}
            >
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <div className={`avatar avatar-md ${c.color}`}>{c.avatar}</div>
                {c.online && (
                  <span
                    className="online-dot"
                    style={{ position: 'absolute', bottom: 0, right: 0, width: 10, height: 10, border: '2px solid white' }}
                  ></span>
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="d-flex justify-content-between align-items-center">
                  <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--dark)' }}>{c.name}</span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--gray)', flexShrink: 0 }}>{c.time}</span>
                </div>
                <div className="d-flex justify-content-between align-items-center mt-1">
                  <span style={{ color: 'var(--gray)', fontSize: '0.8rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 150 }}>
                    {c.last}
                  </span>
                  {c.unread > 0 && (
                    <span
                      style={{
                        background: 'var(--primary)', color: 'white', borderRadius: 99,
                        fontSize: '0.7rem', padding: '2px 7px', fontWeight: 700, flexShrink: 0,
                      }}
                    >
                      {c.unread}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── CHAT AREA ─── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        {/* Chat Header */}
        <div className="chat-header" style={{ flexShrink: 0 }}>
          <div style={{ position: 'relative' }}>
            <div className={`avatar avatar-md ${contacts[active].color}`}>{contacts[active].avatar}</div>
            {contacts[active].online && (
              <span
                className="online-dot"
                style={{ position: 'absolute', bottom: 0, right: 0, width: 10, height: 10, border: '2px solid white' }}
              ></span>
            )}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: '0.98rem', color: 'var(--dark)' }}>
              {contacts[active].name}
            </div>
            <div style={{ fontSize: '0.78rem', color: contacts[active].online ? 'var(--success)' : 'var(--gray)', display: 'flex', alignItems: 'center', gap: 5 }}>
              {contacts[active].online ? (
                <><span className="online-dot" style={{ width: 7, height: 7 }}></span> Online now</>
              ) : 'Offline'}
            </div>
          </div>
          <div className="d-flex gap-2">
            {['📞', '📹', 'ℹ️'].map((icon, i) => (
              <button
                key={i}
                style={{
                  width: 36, height: 36, borderRadius: 10,
                  border: '1px solid var(--border)', background: 'var(--bg)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', fontSize: '0.95rem',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--primary-light)'; e.currentTarget.style.borderColor = 'var(--primary)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
              >
                {icon}
              </button>
            ))}
          </div>
        </div>

        {/* Date label */}
        <div style={{ textAlign: 'center', padding: '12px 0 0', background: '#F8FAFF' }}>
          <span style={{ background: 'white', padding: '4px 14px', borderRadius: 99, fontSize: '0.75rem', color: 'var(--gray)', border: '1px solid var(--border)' }}>
            Today
          </span>
        </div>

        {/* Messages */}
        <div className="chat-messages" style={{ flex: 1 }}>
          {messages.map(msg => (
            <div
              key={msg.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: msg.from === 'me' ? 'flex-end' : 'flex-start',
              }}
            >
              <div className={`message-bubble ${msg.from === 'me' ? 'message-sent' : 'message-received'}`}>
                {msg.text}
                <span className="message-time">{msg.time}</span>
              </div>
            </div>
          ))}

          {typing && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div className={`avatar avatar-sm ${contacts[active].color}`}>{contacts[active].avatar}</div>
              <div className="typing-indicator">
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef}></div>
        </div>

        {/* Input */}
        <div className="chat-input-area">
          <button
            style={{
              width: 36, height: 36, borderRadius: 10,
              border: '1px solid var(--border)', background: 'var(--bg)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', fontSize: '1rem', flexShrink: 0,
            }}
          >
            📎
          </button>
          <input
            type="text"
            className="chat-input"
            placeholder="Type your message..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
          />
          <button
            onClick={sendMessage}
            className="chat-send-btn"
            disabled={!input.trim()}
            style={{ opacity: input.trim() ? 1 : 0.5 }}
          >
            ➤
          </button>
        </div>
      </div>
    </div>
  );
}