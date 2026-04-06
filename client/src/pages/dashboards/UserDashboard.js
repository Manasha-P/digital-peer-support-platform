import React,{ useState, useEffect, useRef } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import Sidebar from '../../components/Sidebar/Sidebar';
import { Avatar, StatusBadge, ProgressBar, EmptyState, Spinner } from '../../components/common';
import PencilIcon from '../../components/common/PencilIcon';
import { theme } from '../../styles/theme';
import { sessionAPI, userAPI, messageAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { USER_TYPES, TOPICS_BY_USER_TYPE, FILE_UPLOAD } from '../../utils/constants';
import { BarChart, Bar, AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const NAV = [
  { path: '/dashboard', icon: 'dashboard', label: 'Dashboard', end: true },
  { path: '/dashboard/find', icon: 'find', label: 'Find Support' },
  { path: '/dashboard/sessions', icon: 'sessions', label: 'My Sessions' },
  { path: '/dashboard/messages', icon: 'messages', label: 'Messages' },
  { path: '/dashboard/notifications', icon: 'notifications', label: 'Notifications' },
  { path: '/dashboard/settings', icon: 'settings', label: 'Settings' },
];

// Helper function to determine session status
function getSessionStatus(s) {
  if (s.status === 'upcoming') {
    const dt = new Date(`${s.date.split('T')[0]}T${s.time}`);
    const end = new Date(dt.getTime() + s.duration * 60000);
    const now = new Date();
    if (now >= dt && now <= end) return 'live';
    if (now > end) return 'awaiting';
  }
  if (s.status === 'live') return 'live';
  if (s.status === 'ended') return 'ended';
  return s.status;
}

// ==================== SESSION EXTENSION MODAL (UPDATED) ====================
function SessionExtensionModal({ session, onClose, onExtend, onEnd }) {
  const [selectedDuration, setSelectedDuration] = useState(15);
  const [loading, setLoading] = useState(false);
  const [remainingTime, setRemainingTime] = useState(null);

  useEffect(() => {
    const fetchRemainingTime = async () => {
      try {
        const response = await sessionAPI.getLiveSessionStatus(session._id);
        setRemainingTime(response.data.remainingMinutes);
      } catch (error) {
        console.error('Failed to fetch remaining time:', error);
      }
    };
    fetchRemainingTime();
    const interval = setInterval(fetchRemainingTime, 10000);
    return () => clearInterval(interval);
  }, [session._id]);

  const extensionOptions = [
    { minutes: 15, price: 'Free' },
    { minutes: 30, price: 'Free' },
    { minutes: 45, price: 'Free' }
  ];

  const handleExtend = async () => {
    setLoading(true);
    try {
      await onExtend(selectedDuration);
      toast.success(`Extension request sent for ${selectedDuration} minutes! Waiting for supporter approval.`);
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to request extension');
    } finally {
      setLoading(false);
    }
  };

  const handleEnd = async () => {
    setLoading(true);
    try {
      await onEnd();
      toast.success('Session ended. Supporter will mark it as complete.');
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to end session');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      animation: 'fadeIn 0.2s'
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: theme.colors.white,
        borderRadius: theme.borderRadius.xl,
        padding: '32px',
        maxWidth: '400px',
        width: '90%',
        animation: 'slideUp 0.3s'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            margin: '0 auto 16px',
            background: `${theme.colors.warning}15`,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <PencilIcon name="clock" size={32} color={theme.colors.warning} />
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: theme.colors.primary, margin: '0 0 8px' }}>
            Session Time is Almost Over!
          </h2>
          <p style={{ fontSize: '14px', color: theme.colors.gray600 }}>
            Your session has <strong>{remainingTime || session.remainingMinutes || 5}</strong> minutes remaining.
            Would you like to extend or end the session?
          </p>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: 500,
            color: theme.colors.gray700,
            marginBottom: '12px'
          }}>
            Extend by:
          </label>
          <div style={{ display: 'flex', gap: '12px' }}>
            {extensionOptions.map(opt => (
              <button
                key={opt.minutes}
                onClick={() => setSelectedDuration(opt.minutes)}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: theme.borderRadius.md,
                  border: `2px solid ${selectedDuration === opt.minutes ? theme.colors.primary : theme.colors.gray300}`,
                  background: selectedDuration === opt.minutes ? `${theme.colors.primary}10` : theme.colors.white,
                  color: selectedDuration === opt.minutes ? theme.colors.primary : theme.colors.gray700,
                  fontWeight: selectedDuration === opt.minutes ? 600 : 400,
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                +{opt.minutes} min
                <div style={{ fontSize: '11px', color: theme.colors.success }}>{opt.price}</div>
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={handleEnd}
            disabled={loading}
            style={{
              flex: 1,
              padding: '14px',
              background: theme.colors.gray100,
              color: theme.colors.gray700,
              border: 'none',
              borderRadius: theme.borderRadius.md,
              fontSize: '15px',
              fontWeight: 500,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Processing...' : 'End Session'}
          </button>
          <button
            onClick={handleExtend}
            disabled={loading}
            style={{
              flex: 1,
              padding: '14px',
              background: loading ? theme.colors.gray300 : theme.colors.primary,
              color: theme.colors.white,
              border: 'none',
              borderRadius: theme.borderRadius.md,
              fontSize: '15px',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            {loading ? 'Requesting...' : (
              <>
                <PencilIcon name="clock" size={16} color={theme.colors.white} />
                Request Extension
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ==================== QR CODE FEEDBACK MODAL (UPDATED) ====================
function QRFeedbackModal({ session, onClose, onFeedbackSubmitted }) {
  const [qrCodeUrl, setQrCodeUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showQR, setShowQR] = useState(true);

  useEffect(() => {
    const fetchQRCode = async () => {
      try {
        const response = await sessionAPI.getFeedbackQRCode(session._id);
        setQrCodeUrl(response.data.qrCodeUrl || response.data.qrCode);
      } catch (error) {
        console.error('Failed to fetch QR code:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchQRCode();
  }, [session._id]);

  const submitFeedback = async () => {
    if (!score) {
      toast.error('Please select a rating');
      return;
    }

    setSubmitting(true);
    try {
      await sessionAPI.rateSession(session._id, { score, comment });
      setFeedbackSubmitted(true);
      setShowQR(false);
      onFeedbackSubmitted();
      toast.success('Thank you for your feedback!');
      setTimeout(() => onClose(), 2000);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit feedback');
    } finally {
      setSubmitting(false);
    }
  };

  const labels = ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent!'];

  if (loading) return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{ background: theme.colors.white, borderRadius: theme.borderRadius.xl, padding: '32px' }}>
        <Spinner />
      </div>
    </div>
  );

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      animation: 'fadeIn 0.2s'
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: theme.colors.white,
        borderRadius: theme.borderRadius.xl,
        padding: '32px',
        maxWidth: '480px',
        width: '90%',
        maxHeight: '90vh',
        overflow: 'auto',
        animation: 'slideUp 0.3s'
      }}>
        {feedbackSubmitted ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '64px',
              height: '64px',
              margin: '0 auto 16px',
              background: `${theme.colors.success}15`,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <PencilIcon name="check" size={32} color={theme.colors.success} />
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: theme.colors.primary, marginBottom: '8px' }}>
              Thank You!
            </h2>
            <p style={{ fontSize: '14px', color: theme.colors.gray600 }}>
              Your feedback helps us improve and helps other users find the right supporters.
            </p>
          </div>
        ) : showQR ? (
          <>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{
                width: '64px',
                height: '64px',
                margin: '0 auto 16px',
                background: `${theme.colors.primary}10`,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <PencilIcon name="qr" size={32} color={theme.colors.primary} />
              </div>
              <h2 style={{ fontSize: '20px', fontWeight: 700, color: theme.colors.primary, margin: '0 0 8px' }}>
                Scan to Give Feedback
              </h2>
              <p style={{ fontSize: '14px', color: theme.colors.gray600, marginBottom: '20px' }}>
                Scan the QR code below to rate your session with {session.supporter?.name}
              </p>
              
              {qrCodeUrl && (
                <div style={{
                  background: theme.colors.white,
                  padding: '20px',
                  borderRadius: theme.borderRadius.lg,
                  display: 'inline-block',
                  border: `1px solid ${theme.colors.gray200}`,
                  marginBottom: '20px'
                }}>
                  <a href={session.feedbackLink} target="_blank" rel="noreferrer" style={{ cursor: 'pointer' }}>
                    <img 
                      src={qrCodeUrl} 
                      alt="Feedback QR Code" 
                      style={{ width: '200px', height: '200px', cursor: 'pointer' }}
                    />
                  </a>
                </div>
              )}
              
              <p style={{ fontSize: '12px', color: theme.colors.gray500 }}>
                Or click below to rate directly
              </p>
            </div>
            
            <button
              onClick={() => setShowQR(false)}
              style={{
                width: '100%',
                padding: '12px',
                background: theme.colors.primary,
                color: theme.colors.white,
                border: 'none',
                borderRadius: theme.borderRadius.md,
                fontSize: '15px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Rate Now
            </button>
          </>
        ) : (
          <>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{
                width: '64px',
                height: '64px',
                margin: '0 auto 16px',
                background: `${theme.colors.primary}10`,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <PencilIcon name="star" size={32} color={theme.colors.primary} />
              </div>
              <h2 style={{ fontSize: '20px', fontWeight: 700, color: theme.colors.primary, margin: '0 0 8px' }}>
                Rate Your Session
              </h2>
              <p style={{ fontSize: '14px', color: theme.colors.gray600 }}>
                How was your session with {session.supporter?.name}?
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
              {[1, 2, 3, 4, 5].map(i => (
                <button
                  key={i}
                  onClick={() => setScore(i)}
                  onMouseEnter={() => setHover(i)}
                  onMouseLeave={() => setHover(0)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '36px',
                    lineHeight: 1,
                    transition: 'transform 0.1s',
                    transform: (hover || score) >= i ? 'scale(1.2)' : 'scale(1)',
                    color: (hover || score) >= i ? '#fbbf24' : theme.colors.gray300
                  }}
                >
                  ★
                </button>
              ))}
            </div>
            <div style={{
              textAlign: 'center',
              fontSize: '14px',
              fontWeight: 600,
              color: theme.colors.primary,
              marginBottom: '20px',
              height: '20px'
            }}>
              {labels[hover || score] || ''}
            </div>

            <textarea
              rows={3}
              placeholder="Share your experience (optional)"
              value={comment}
              onChange={e => setComment(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: `1px solid ${theme.colors.gray300}`,
                borderRadius: theme.borderRadius.md,
                fontSize: '14px',
                resize: 'vertical'
              }}
            />

            <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
              <button
                onClick={onClose}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: theme.colors.gray100,
                  color: theme.colors.gray700,
                  border: 'none',
                  borderRadius: theme.borderRadius.md,
                  fontSize: '15px',
                  fontWeight: 500,
                  cursor: 'pointer'
                }}
              >
                Later
              </button>
              <button
                onClick={submitFeedback}
                disabled={submitting || !score}
                style={{
                  flex: 2,
                  padding: '12px',
                  background: submitting || !score ? theme.colors.gray300 : theme.colors.primary,
                  color: theme.colors.white,
                  border: 'none',
                  borderRadius: theme.borderRadius.md,
                  fontSize: '15px',
                  fontWeight: 600,
                  cursor: submitting || !score ? 'not-allowed' : 'pointer'
                }}
              >
                {submitting ? 'Submitting...' : 'Submit Rating'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ==================== FEEDBACK MODAL (Original) ====================
function FeedbackModal({ session, onClose, onDone }) {
  const [score, setScore] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const labels = ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent!'];

  async function submit() {
    if (!score) {
      toast.error('Please select a rating');
      return;
    }

    setLoading(true);
    try {
      await sessionAPI.rateSession(session._id, { score, comment });
      toast.success('Thank you for your feedback!');
      onDone();
      onClose();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to submit feedback');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      animation: 'fadeIn 0.2s'
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: theme.colors.white,
        borderRadius: theme.borderRadius.xl,
        padding: '32px',
        maxWidth: '420px',
        width: '90%',
        animation: 'slideUp 0.3s'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            margin: '0 auto 16px',
            background: `${theme.colors.warning}15`,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <PencilIcon name="star" size={32} color={theme.colors.warning} />
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: theme.colors.primary, margin: '0 0 4px' }}>
            Rate Your Session
          </h2>
          <p style={{ fontSize: '14px', color: theme.colors.gray600, margin: 0 }}>
            with {session.supporter?.name}
          </p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
          {[1, 2, 3, 4, 5].map(i => (
            <button
              key={i}
              onClick={() => setScore(i)}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(0)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '32px',
                lineHeight: 1,
                transition: 'transform 0.1s',
                transform: (hover || score) >= i ? 'scale(1.2)' : 'scale(1)',
                color: (hover || score) >= i ? '#fbbf24' : theme.colors.gray300
              }}
            >
              ★
            </button>
          ))}
        </div>

        <div style={{
          textAlign: 'center',
          fontSize: '14px',
          fontWeight: 600,
          color: theme.colors.primary,
          marginBottom: '20px',
          height: '20px'
        }}>
          {labels[hover || score] || ''}
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{
            display: 'block',
            fontSize: '13px',
            fontWeight: 500,
            color: theme.colors.gray700,
            marginBottom: '6px'
          }}>
            Share your experience (optional)
          </label>
          <textarea
            rows={3}
            placeholder="What did you like about the session? Any suggestions?"
            value={comment}
            onChange={e => setComment(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              border: `1px solid ${theme.colors.gray300}`,
              borderRadius: theme.borderRadius.md,
              fontSize: '14px',
              resize: 'vertical'
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: '12px',
              background: theme.colors.gray100,
              color: theme.colors.gray700,
              border: 'none',
              borderRadius: theme.borderRadius.md,
              fontSize: '15px',
              fontWeight: 500,
              cursor: 'pointer'
            }}
          >
            Skip
          </button>
          <button
            onClick={submit}
            disabled={loading || score === 0}
            style={{
              flex: 2,
              padding: '12px',
              background: loading || score === 0 ? theme.colors.gray300 : theme.colors.primary,
              color: theme.colors.white,
              border: 'none',
              borderRadius: theme.borderRadius.md,
              fontSize: '15px',
              fontWeight: 600,
              cursor: loading || score === 0 ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Submitting...' : 'Submit Rating'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ==================== BOOK MODAL ====================
function BookModal({ supporter, onClose, onBooked }) {
  const { user } = useAuth();
  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({
    topic: '',
    date: today,
    time: '',
    duration: 45,
    notes: ''
  });
  const [loading, setLoading] = useState(false);

  const fallbackTopics = TOPICS_BY_USER_TYPE[user?.userType || 'Other'] || TOPICS_BY_USER_TYPE['Other'];
  const topics = supporter.topics && supporter.topics.length > 0 ? supporter.topics : fallbackTopics;

  async function submit() {
    if (!form.topic) {
      toast.error('Please select a topic');
      return;
    }
    if (!form.time) {
      toast.error('Please select a time');
      return;
    }

    setLoading(true);
    try {
      await sessionAPI.bookSession({ 
        supporterId: supporter._id, 
        ...form 
      });
      toast.success(`Session request sent to ${supporter.name}`);
      onBooked();
      onClose();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to book session');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      animation: 'fadeIn 0.2s'
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: theme.colors.white,
        borderRadius: theme.borderRadius.xl,
        padding: '32px',
        maxWidth: '480px',
        width: '90%',
        maxHeight: '90vh',
        overflow: 'auto',
        animation: 'slideUp 0.3s'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px'
        }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <Avatar name={supporter.name} color={theme.colors.primary} size={56} />
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 700, color: theme.colors.primary, margin: '0 0 4px' }}>
                Book Session
              </h2>
              <p style={{ fontSize: '14px', color: theme.colors.gray600, margin: 0 }}>
                with {supporter.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '28px',
              cursor: 'pointer',
              color: theme.colors.gray500
            }}
          >
            ×
          </button>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: 500,
            color: theme.colors.gray700,
            marginBottom: '6px'
          }}>
            Select Topic
          </label>
          <select
            value={form.topic}
            onChange={e => setForm({ ...form, topic: e.target.value })}
            style={{
              width: '100%',
              padding: '12px',
              border: `1px solid ${theme.colors.gray300}`,
              borderRadius: theme.borderRadius.md,
              fontSize: '14px',
              background: theme.colors.white
            }}
          >
            <option value="">Choose a topic...</option>
            {topics.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px',
          marginBottom: '20px'
        }}>
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: 500,
              color: theme.colors.gray700,
              marginBottom: '6px'
            }}>
              Date
            </label>
            <input
              type="date"
              value={form.date}
              min={today}
              onChange={e => setForm({ ...form, date: e.target.value })}
              style={{
                width: '100%',
                padding: '12px',
                border: `1px solid ${theme.colors.gray300}`,
                borderRadius: theme.borderRadius.md,
                fontSize: '14px'
              }}
            />
          </div>
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: 500,
              color: theme.colors.gray700,
              marginBottom: '6px'
            }}>
              Time
            </label>
            <input
              type="time"
              value={form.time}
              onChange={e => setForm({ ...form, time: e.target.value })}
              style={{
                width: '100%',
                padding: '12px',
                border: `1px solid ${theme.colors.gray300}`,
                borderRadius: theme.borderRadius.md,
                fontSize: '14px'
              }}
            />
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
            Duration
          </label>
          <div style={{ display: 'flex', gap: '12px' }}>
            {[30, 45, 60].map(d => (
              <button
                key={d}
                onClick={() => setForm({ ...form, duration: d })}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: theme.borderRadius.md,
                  border: `2px solid ${form.duration === d ? theme.colors.primary : theme.colors.gray300}`,
                  background: form.duration === d ? `${theme.colors.primary}10` : theme.colors.white,
                  color: form.duration === d ? theme.colors.primary : theme.colors.gray700,
                  fontWeight: form.duration === d ? 600 : 400,
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                {d} min
              </button>
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
            Notes (optional)
          </label>
          <textarea
            rows={3}
            value={form.notes}
            onChange={e => setForm({ ...form, notes: e.target.value })}
            placeholder="Any specific concerns or topics you'd like to discuss..."
            style={{
              width: '100%',
              padding: '12px',
              border: `1px solid ${theme.colors.gray300}`,
              borderRadius: theme.borderRadius.md,
              fontSize: '14px',
              resize: 'vertical'
            }}
          />
        </div>

        {form.topic && form.time && (
          <div style={{
            marginBottom: '24px',
            padding: '16px',
            background: `${theme.colors.primary}10`,
            borderRadius: theme.borderRadius.md,
            fontSize: '14px',
            color: theme.colors.primary,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <PencilIcon name="calendar" size={16} color={theme.colors.primary} />
            <span>
              <strong>Session Summary:</strong> {form.topic} •{' '}
              {new Date(form.date).toLocaleDateString('en-US', { 
                weekday: 'short', 
                month: 'short', 
                day: 'numeric' 
              })} at {form.time} • {form.duration} minutes
            </span>
          </div>
        )}

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: '14px',
              background: theme.colors.gray100,
              color: theme.colors.gray700,
              border: 'none',
              borderRadius: theme.borderRadius.md,
              fontSize: '15px',
              fontWeight: 500,
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={loading || !form.topic || !form.time}
            style={{
              flex: 2,
              padding: '14px',
              background: loading || !form.topic || !form.time ? theme.colors.gray300 : theme.colors.primary,
              color: theme.colors.white,
              border: 'none',
              borderRadius: theme.borderRadius.md,
              fontSize: '15px',
              fontWeight: 600,
              cursor: loading || !form.topic || !form.time ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            {loading ? 'Sending...' : (
              <>
                <PencilIcon name="book" size={16} color={theme.colors.white} />
                Send Request
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ==================== FIND SUPPORT SECTION ====================
function FindSupport({ onBook }) {
  const { user } = useAuth();
  const [supporters, setSupporters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

  const userTopics = TOPICS_BY_USER_TYPE[user?.userType || 'Other'] || TOPICS_BY_USER_TYPE['Other'];

  useEffect(() => {
    fetchSupporters();
  }, []);

  const fetchSupporters = async () => {
    setLoading(true);
    try {
      const response = await sessionAPI.getAvailableSupporters({ search, topic: filter !== 'all' ? filter : undefined });
      setSupporters(response.data.supporters || []);
    } catch (error) {
      console.error('Failed to fetch supporters:', error);
      // Create predefined fallback supporters tailored to the user's specific topics
      const predefinedSupporters = [
        {
          _id: '1',
          name: 'Alex Johnson',
          specialty: 'Peer Counselor & Guide',
          bio: 'Experienced in helping peers navigate common challenges and succeed.',
          topics: [userTopics[0], userTopics[1], userTopics[2]].filter(Boolean),
          rating: { average: 4.9, count: 124 },
          experience: '3 years',
          avatar: ''
        },
        {
          _id: '2',
          name: 'Sarah Williams',
          specialty: 'Academic & Career Mentor',
          bio: 'Experienced mentor focused on helping individuals balance their goals and mental health.',
          topics: [userTopics[3], userTopics[4], userTopics[0]].filter(Boolean),
          rating: { average: 4.8, count: 98 },
          experience: '5 years',
          avatar: ''
        },
        {
          _id: '3',
          name: 'Dr. Michael Chen',
          specialty: 'Mental Health Specialist',
          bio: 'Licensed professional specializing in deeper challenges and long-term wellness.',
          topics: [userTopics[2], userTopics[5] || 'Stress', 'Relationships'],
          rating: { average: 5.0, count: 215 },
          experience: '8 years',
          avatar: ''
        }
      ];

      // If a text search or specific filter is active, filter the mock dataset
      const filteredSupporters = predefinedSupporters.filter(s => {
        const matchesSearch = search ? (s.name.toLowerCase().includes(search.toLowerCase()) || s.specialty.toLowerCase().includes(search.toLowerCase())) : true;
        const matchesFilter = filter !== 'all' ? s.topics.includes(filter) : true;
        return matchesSearch && matchesFilter;
      });

      setSupporters(filteredSupporters);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSupporters();
    }, 500);
    return () => clearTimeout(timer);
  }, [search, filter]);

  if (loading) return (
    <div style={{ padding: '24px', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
      <Spinner />
    </div>
  );

  return (
    <div style={{ padding: '24px', background: theme.colors.gray50, minHeight: '100vh' }}>
      <div style={{
        background: theme.colors.white,
        borderRadius: theme.borderRadius.lg,
        padding: '20px 24px',
        marginBottom: '24px',
        border: `1px solid ${theme.colors.gray200}`
      }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: theme.colors.primary, margin: 0 }}>
          Find Support
        </h1>
        <p style={{ fontSize: '14px', color: theme.colors.gray600, marginTop: '4px' }}>
          {supporters.length} supporters available
        </p>
      </div>

      <div style={{
        background: theme.colors.white,
        borderRadius: theme.borderRadius.lg,
        padding: '20px',
        marginBottom: '24px',
        border: `1px solid ${theme.colors.gray200}`
      }}>
        <div style={{ position: 'relative', marginBottom: '16px' }}>
          <div style={{
            position: 'absolute',
            left: '14px',
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 1
          }}>
            <PencilIcon name="find" size={18} color={theme.colors.gray500} />
          </div>
          <input
            placeholder="Search by name, specialty, or topic..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '14px 14px 14px 45px',
              border: `1px solid ${theme.colors.gray300}`,
              borderRadius: theme.borderRadius.md,
              fontSize: '14px',
              background: theme.colors.white
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setFilter('all')}
            style={{
              padding: '8px 16px',
              borderRadius: theme.borderRadius.full,
              fontSize: '13px',
              fontWeight: 500,
              background: filter === 'all' ? theme.colors.primary : theme.colors.white,
              color: filter === 'all' ? theme.colors.white : theme.colors.gray700,
              border: filter === 'all' ? 'none' : `1px solid ${theme.colors.gray300}`,
              cursor: 'pointer'
            }}
          >
            All
          </button>
          {userTopics.slice(0, 5).map(topic => (
            <button
              key={topic}
              onClick={() => setFilter(topic)}
              style={{
                padding: '8px 16px',
                borderRadius: theme.borderRadius.full,
                fontSize: '13px',
                fontWeight: 500,
                background: filter === topic ? theme.colors.primary : theme.colors.white,
                color: filter === topic ? theme.colors.white : theme.colors.gray700,
                border: filter === topic ? 'none' : `1px solid ${theme.colors.gray300}`,
                cursor: 'pointer'
              }}
            >
              {topic}
            </button>
          ))}
        </div>
      </div>

      {supporters.length === 0 ? (
        <div style={{
          background: theme.colors.white,
          borderRadius: theme.borderRadius.lg,
          padding: '60px',
          textAlign: 'center',
          border: `1px solid ${theme.colors.gray200}`
        }}>
          <PencilIcon name="empty" size={48} color={theme.colors.gray400} />
          <h3 style={{ fontSize: '18px', fontWeight: 600, color: theme.colors.gray800, margin: '16px 0 8px' }}>
            No supporters found
          </h3>
          <p style={{ color: theme.colors.gray600, fontSize: '14px', marginBottom: '20px' }}>
            Try adjusting your search or filters
          </p>
          <button
            onClick={() => { setSearch(''); setFilter('all'); }}
            style={{
              padding: '10px 20px',
              background: theme.colors.primary,
              color: theme.colors.white,
              border: 'none',
              borderRadius: theme.borderRadius.md,
              fontSize: '13px',
              cursor: 'pointer'
            }}
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: '20px'
        }}>
          {supporters.map(s => (
            <div key={s._id} style={{
              background: theme.colors.white,
              borderRadius: theme.borderRadius.lg,
              padding: '24px',
              border: `1px solid ${theme.colors.gray200}`,
              transition: 'all 0.2s',
              cursor: 'pointer'
            }}
            onClick={() => onBook(s)}
            >
              <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                <Avatar name={s.name} color={theme.colors.primary} size={64} />
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 600, color: theme.colors.gray800, margin: '0 0 4px' }}>
                    {s.name}
                  </h3>
                  <p style={{ fontSize: '13px', color: theme.colors.gray600, margin: '0 0 6px' }}>
                    {s.specialty || 'Peer Supporter'}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                      {[1, 2, 3, 4, 5].map(star => (
                        <span key={star} style={{
                          fontSize: '14px',
                          color: star <= Math.floor(s.rating?.average || 0) ? '#fbbf24' : theme.colors.gray300
                        }}>
                          ★
                        </span>
                      ))}
                      <span style={{ fontSize: '12px', color: theme.colors.gray600, marginLeft: '4px' }}>
                        ({s.rating?.count || 0})
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <p style={{
                fontSize: '13px',
                color: theme.colors.gray700,
                lineHeight: 1.6,
                margin: '0 0 16px 0'
              }}>
                {s.bio}
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
                {(s.topics || []).slice(0, 4).map(t => (
                  <span key={t} style={{
                    background: theme.colors.gray100,
                    padding: '4px 12px',
                    borderRadius: theme.borderRadius.full,
                    fontSize: '12px',
                    color: theme.colors.gray700
                  }}>
                    {t}
                  </span>
                ))}
              </div>

              <div style={{
                display: 'flex',
                gap: '12px',
                marginBottom: '16px',
                padding: '12px',
                background: theme.colors.gray50,
                borderRadius: theme.borderRadius.md,
                fontSize: '12px',
                color: theme.colors.gray600
              }}>
                <span>⭐ {s.rating?.average?.toFixed(1) || 'New'}</span>
                <span>📅 {s.experience || 'N/A'}</span>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onBook(s);
                  }}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: theme.colors.primary,
                    color: theme.colors.white,
                    border: 'none',
                    borderRadius: theme.borderRadius.md,
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Book Session
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('/dashboard/messages', {
                      state: { partnerId: s._id, partnerName: s.name }
                    });
                  }}
                  style={{
                    padding: '12px 20px',
                    background: theme.colors.gray100,
                    color: theme.colors.gray700,
                    border: `1px solid ${theme.colors.gray300}`,
                    borderRadius: theme.borderRadius.md,
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  <PencilIcon name="messages" size={16} color={theme.colors.gray600} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ==================== OVERVIEW SECTION ====================
function Overview({ sessions }) {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    total: 0,
    upcoming: 0,
    completed: 0,
    pending: 0
  });

  useEffect(() => {
    if (sessions) {
      setStats({
        total: sessions.length,
        upcoming: sessions.filter(s => s.status === 'upcoming').length,
        completed: sessions.filter(s => s.status === 'completed').length,
        pending: sessions.filter(s => s.status === 'pending').length
      });
    }
  }, [sessions]);

  const liveSession = sessions.find(s => {
    if (s.status === 'upcoming') {
      const dt = new Date(`${s.date.split('T')[0]}T${s.time}`);
      const end = new Date(dt.getTime() + s.duration * 60000);
      const now = new Date();
      return now >= dt && now <= end;
    }
    if (s.status === 'live') return true;
    return false;
  });

  const chartData = React.useMemo(() => {
    const data = [
      { name: 'Week 1', solved: 0, active: 0 },
      { name: 'Week 2', solved: 0, active: 0 },
      { name: 'Week 3', solved: 0, active: 0 },
      { name: 'Week 4', solved: 0, active: 0 }
    ];
    
    const now = new Date();
    
    sessions.forEach(s => {
      if (!s.date && !s.createdAt) return;
      const sDate = new Date(s.date || s.createdAt);
      // Calculate days difference
      const diffTime = now - sDate;
      const diffDays = diffTime >= 0 ? Math.ceil(diffTime / (1000 * 60 * 60 * 24)) : 0;
      
      let weekIndex = 3; // Latest week
      if (diffDays > 21) weekIndex = 0;
      else if (diffDays > 14) weekIndex = 1;
      else if (diffDays > 7) weekIndex = 2;
      
      if (s.status === 'completed') data[weekIndex].solved += 1;
      else if (['upcoming', 'pending'].includes(s.status)) data[weekIndex].active += 1;
    });
    
    return data;
  }, [sessions]);

  const StatCard = ({ icon, value, label, color }) => (
    <div style={{
      background: theme.colors.white,
      borderRadius: theme.borderRadius.lg,
      padding: '20px',
      boxShadow: theme.shadows.md,
      border: `1px solid ${theme.colors.gray200}`,
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{
        position: 'absolute',
        top: '16px',
        right: '16px',
        opacity: 0.1,
        color: color
      }}>
        <PencilIcon name={icon} size={48} color={color} />
      </div>
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ fontSize: '32px', fontWeight: 700, color: color, lineHeight: 1.2, marginBottom: '4px' }}>
          {value}
        </div>
        <div style={{ fontSize: '13px', color: theme.colors.gray600, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {label}
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ 
      padding: '24px',
      background: theme.colors.gray50,
      minHeight: '100vh'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        background: theme.colors.white,
        padding: '20px 24px',
        borderRadius: theme.borderRadius.lg,
        border: `1px solid ${theme.colors.gray200}`
      }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: theme.colors.primary, margin: '0 0 4px 0' }}>
            My Dashboard
          </h1>
          <p style={{ fontSize: '14px', color: theme.colors.gray600, margin: 0 }}>
            Track your wellness journey and sessions
          </p>
        </div>
        <button
          onClick={() => navigate('/dashboard/find')}
          style={{
            padding: '12px 24px',
            background: theme.colors.primary,
            color: theme.colors.white,
            border: 'none',
            borderRadius: theme.borderRadius.md,
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <PencilIcon name="find" size={16} color={theme.colors.white} />
          Find Support
        </button>
      </div>

      {liveSession && (
        <div style={{
          background: '#fee2e2',
          borderRadius: theme.borderRadius.lg,
          padding: '16px 24px',
          marginBottom: '24px',
          border: '1px solid #fecaca',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: theme.borderRadius.md,
              background: theme.colors.danger,
              color: theme.colors.white,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <PencilIcon name="live" size={24} color={theme.colors.white} />
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#991b1b', margin: '0 0 4px' }}>
                Session Live Now!
              </h3>
              <p style={{ fontSize: '14px', color: '#b91c1c', margin: 0 }}>
                {liveSession.topic} with {liveSession.supporter?.name}
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/dashboard/messages', { 
              state: { partnerId: liveSession.supporter._id, partnerName: liveSession.supporter.name, sessionId: liveSession._id }
            })}
            style={{
              padding: '10px 20px',
              background: theme.colors.danger,
              color: theme.colors.white,
              border: 'none',
              borderRadius: theme.borderRadius.md,
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Join Session →
          </button>
        </div>
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '20px',
        marginBottom: '24px'
      }}>
        <StatCard icon="total" value={stats.total} label="TOTAL SESSIONS" color={theme.colors.primary} />
        <StatCard icon="upcoming" value={stats.upcoming} label="UPCOMING" color={theme.colors.success} />
        <StatCard icon="completed" value={stats.completed} label="COMPLETED" color={theme.colors.info} />
        <StatCard icon="pending" value={stats.pending} label="PENDING" color={theme.colors.warning} />
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.5fr 1fr',
        gap: '20px',
        marginBottom: '20px'
      }}>
        <div style={{
          background: theme.colors.white,
          borderRadius: theme.borderRadius.lg,
          padding: '24px',
          border: `1px solid ${theme.colors.gray200}`
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px'
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600, color: theme.colors.primary, margin: 0 }}>
              Upcoming Sessions
            </h2>
            <span 
              onClick={() => navigate('/dashboard/sessions')}
              style={{ fontSize: '14px', color: theme.colors.primary, cursor: 'pointer' }}
            >
              View All →
            </span>
          </div>

          {sessions.filter(s => ['upcoming', 'pending'].includes(s.status)).length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <PencilIcon name="empty" size={48} color={theme.colors.gray400} />
              <p style={{ color: theme.colors.gray600, fontSize: '14px', margin: '16px 0' }}>
                No upcoming sessions
              </p>
              <button
                onClick={() => navigate('/dashboard/find')}
                style={{
                  padding: '10px 20px',
                  background: theme.colors.primary,
                  color: theme.colors.white,
                  border: 'none',
                  borderRadius: theme.borderRadius.md,
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Find a Supporter
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {sessions.filter(s => ['upcoming', 'pending'].includes(s.status)).slice(0, 5).map(s => (
                <div key={s._id} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '16px',
                  background: theme.colors.gray50,
                  borderRadius: theme.borderRadius.md,
                  border: `1px solid ${theme.colors.gray200}`
                }}>
                  <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                    <Avatar name={s.supporter?.name || 'S'} color={theme.colors.primary} size={48} />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '15px', color: theme.colors.gray800 }}>
                        {s.supporter?.name}
                      </div>
                      <div style={{ fontSize: '13px', color: theme.colors.gray600, marginTop: '2px' }}>
                        {s.topic} • {new Date(s.date).toLocaleDateString()} at {s.time}
                      </div>
                    </div>
                  </div>
                  <StatusBadgeSmall status={getSessionStatus(s)} />
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{
          background: theme.colors.white,
          borderRadius: theme.borderRadius.lg,
          padding: '24px',
          border: `1px solid ${theme.colors.gray200}`
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: theme.colors.primary, marginBottom: '24px' }}>
            Support Journey & Issues
          </h2>

          <div style={{ height: '240px', width: '100%', marginBottom: '20px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 20, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorSolved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.6}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.05}/>
                  </linearGradient>
                  <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.6}/>
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.05}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.colors.gray200} />
                <XAxis dataKey="name" tick={{ fontSize: 13, fill: theme.colors.gray500, fontWeight: 500 }} axisLine={false} tickLine={false} dy={10} />
                <YAxis tick={{ fontSize: 13, fill: theme.colors.gray500, fontWeight: 500 }} axisLine={false} tickLine={false} allowDecimals={false} dx={-10} />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: '1px solid rgba(255,255,255,0.2)', 
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(8px)',
                    fontWeight: 600
                  }}
                  itemStyle={{ fontWeight: 700 }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '13px', fontWeight: 600, paddingTop: '15px' }} />
                <Area 
                  type="monotone" 
                  dataKey="active" 
                  name="Active Issues" 
                  stroke="#0ea5e9" 
                  strokeWidth={4} 
                  fillOpacity={1} 
                  fill="url(#colorActive)" 
                  activeDot={{ r: 8, strokeWidth: 0, fill: '#0ea5e9' }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="solved" 
                  name="Total Solved" 
                  stroke="#8b5cf6" 
                  strokeWidth={4} 
                  fillOpacity={1} 
                  fill="url(#colorSolved)" 
                  activeDot={{ r: 8, strokeWidth: 0, fill: '#8b5cf6' }} 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{
              flex: 1,
              padding: '16px',
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(139, 92, 246, 0.05) 100%)',
              border: '1px solid rgba(139, 92, 246, 0.2)',
              borderRadius: theme.borderRadius.lg,
              textAlign: 'center',
              boxShadow: '0 4px 6px -1px rgba(139, 92, 246, 0.05)'
            }}>
              <div style={{ fontSize: '28px', fontWeight: 800, color: '#8b5cf6', marginBottom: '4px' }}>
                {sessions.filter(s => s.status === 'completed').length}
              </div>
              <div style={{ fontSize: '13px', color: theme.colors.gray600, fontWeight: 600 }}>
                Total Solved
              </div>
            </div>
            <div style={{
              flex: 1,
              padding: '16px',
              background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.1) 0%, rgba(14, 165, 233, 0.05) 100%)',
              border: '1px solid rgba(14, 165, 233, 0.2)',
              borderRadius: theme.borderRadius.lg,
              textAlign: 'center',
              boxShadow: '0 4px 6px -1px rgba(14, 165, 233, 0.05)'
            }}>
              <div style={{ fontSize: '28px', fontWeight: 800, color: '#0ea5e9', marginBottom: '4px' }}>
                {sessions.filter(s => ['upcoming', 'pending'].includes(s.status)).length}
              </div>
              <div style={{ fontSize: '13px', color: theme.colors.gray600, fontWeight: 600 }}>
                Currently Active
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{
        background: theme.colors.white,
        borderRadius: theme.borderRadius.lg,
        padding: '24px',
        border: `1px solid ${theme.colors.gray200}`
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: theme.colors.primary, margin: 0 }}>
            Recent Activity
          </h2>
          <span style={{ fontSize: '14px', color: theme.colors.primary, cursor: 'pointer' }}>
            View All
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {sessions.slice(0, 3).map((s, index) => {
            const status = getSessionStatus(s);
            return (
              <div key={s._id} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '12px',
                background: theme.colors.gray50,
                borderRadius: theme.borderRadius.md
              }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: theme.borderRadius.md,
                  background: status === 'completed' ? '#dcfce7' : '#dbeafe',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <PencilIcon 
                    name={status === 'completed' ? 'completed' : 'upcoming'} 
                    size={22} 
                    color={status === 'completed' ? '#166534' : '#1e40af'} 
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '14px', color: theme.colors.gray800 }}>
                    {status === 'completed' ? 'Session completed' : 'Session scheduled'}
                  </div>
                  <div style={{ fontSize: '13px', color: theme.colors.gray600 }}>
                    {s.topic} with {s.supporter?.name}
                  </div>
                </div>
                <span style={{ fontSize: '12px', color: theme.colors.gray500 }}>
                  {index === 0 ? '2 hours ago' : index === 1 ? 'Yesterday' : '2 days ago'}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ==================== STATUS BADGE SMALL ====================
function StatusBadgeSmall({ status }) {
  const styles = {
    pending: { bg: '#fef3c7', color: '#92400e', label: 'Pending', icon: 'pending' },
    upcoming: { bg: '#dbeafe', color: '#1e40af', label: 'Scheduled', icon: 'upcoming' },
    live: { bg: '#fee2e2', color: '#991b1b', label: 'Live Now', icon: 'live' },
    awaiting: { bg: '#ede9fe', color: '#5b21b6', label: 'Awaiting', icon: 'clock' },
    ended: { bg: '#fef3c7', color: '#92400e', label: 'Ended', icon: 'clock' },
    completed: { bg: '#dcfce7', color: '#166534', label: 'Completed', icon: 'completed' },
    rejected: { bg: '#fee2e2', color: '#991b1b', label: 'Rejected', icon: 'cross' },
    cancelled: { bg: '#f3f4f6', color: '#4b5563', label: 'Cancelled', icon: 'cross' }
  };

  const style = styles[status] || styles.pending;

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      padding: '4px 10px',
      borderRadius: theme.borderRadius.full,
      fontSize: '11px',
      fontWeight: 600,
      background: style.bg,
      color: style.color,
      whiteSpace: 'nowrap'
    }}>
      <PencilIcon name={style.icon} size={10} color={style.color} />
      {style.label}
    </span>
  );
}

// ==================== MY SESSIONS SECTION (UPDATED) ====================
function MySessions({ sessions, onRefresh }) {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const [ratingModal, setRatingModal] = useState(null);
  const [extensionModal, setExtensionModal] = useState(null);
  const [qrFeedbackModal, setQrFeedbackModal] = useState(null);
  const [liveSessionId, setLiveSessionId] = useState(null);

  const filteredSessions = sessions.filter(s => {
    if (filter === 'all') return true;
    if (filter === 'live') return getSessionStatus(s) === 'live';
    return s.status === filter;
  });

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return { bg: '#fef3c7', color: '#92400e' };
      case 'upcoming': return { bg: '#dbeafe', color: '#1e40af' };
      case 'live': return { bg: '#fee2e2', color: '#991b1b' };
      case 'ended': return { bg: '#fef3c7', color: '#92400e' };
      case 'completed': return { bg: '#dcfce7', color: '#166534' };
      case 'rejected': return { bg: '#fee2e2', color: '#991b1b' };
      case 'cancelled': return { bg: '#f3f4f6', color: '#4b5563' };
      default: return { bg: '#f3f4f6', color: '#4b5563' };
    }
  };

  const getTimeRemaining = (s) => {
    const dt = new Date(`${s.date.split('T')[0]}T${s.time}`);
    const now = new Date();
    const diffMinutes = Math.round((dt - now) / 60000);
    
    if (diffMinutes < 0) return null;
    if (diffMinutes < 60) return `in ${diffMinutes} minutes`;
    if (diffMinutes < 1440) return `in ${Math.round(diffMinutes / 60)} hours`;
    return `in ${Math.round(diffMinutes / 1440)} days`;
  };

  const handleExtendSession = async (sessionId, additionalMinutes) => {
    try {
      await sessionAPI.extendSession(sessionId, { minutes: additionalMinutes });
      toast.success(`Extension request sent for ${additionalMinutes} minutes! Waiting for supporter approval.`);
      onRefresh();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to request extension');
    }
  };

  const handleEndSession = async (sessionId) => {
    try {
      await sessionAPI.endSessionEarly(sessionId);
      toast.success('Session ended. Supporter will mark it as complete.');
      onRefresh();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to end session');
    }
  };

  return (
    <div style={{ padding: '24px', background: theme.colors.gray50, minHeight: '100vh' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        background: theme.colors.white,
        padding: '20px 24px',
        borderRadius: theme.borderRadius.lg,
        border: `1px solid ${theme.colors.gray200}`
      }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: theme.colors.primary, margin: '0 0 4px 0' }}>
            My Sessions
          </h1>
          <p style={{ fontSize: '14px', color: theme.colors.gray600, margin: 0 }}>
            {sessions.length} total sessions • {sessions.filter(s => s.status === 'completed').length} completed
          </p>
        </div>
        <button
          onClick={() => navigate('/dashboard/find')}
          style={{
            padding: '12px 24px',
            background: theme.colors.primary,
            color: theme.colors.white,
            border: 'none',
            borderRadius: theme.borderRadius.md,
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          + New Session
        </button>
      </div>

      <div style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '24px',
        flexWrap: 'wrap'
      }}>
        {['all', 'upcoming', 'live', 'pending', 'completed'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '8px 20px',
              borderRadius: theme.borderRadius.full,
              fontSize: '13px',
              fontWeight: 500,
              background: filter === f ? theme.colors.primary : theme.colors.white,
              color: filter === f ? theme.colors.white : theme.colors.gray700,
              border: filter === f ? 'none' : `1px solid ${theme.colors.gray300}`,
              cursor: 'pointer'
            }}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {filteredSessions.length === 0 ? (
        <div style={{
          background: theme.colors.white,
          borderRadius: theme.borderRadius.lg,
          padding: '60px',
          textAlign: 'center',
          border: `1px solid ${theme.colors.gray200}`
        }}>
          <PencilIcon name="empty" size={48} color={theme.colors.gray400} />
          <h3 style={{ fontSize: '18px', fontWeight: 600, color: theme.colors.gray800, margin: '16px 0 8px' }}>
            No {filter !== 'all' ? filter : ''} sessions found
          </h3>
          <p style={{ color: theme.colors.gray600, fontSize: '14px', marginBottom: '20px' }}>
            {filter !== 'all' ? 'Try a different filter' : 'Book your first session to get started'}
          </p>
          {filter !== 'all' ? (
            <button
              onClick={() => setFilter('all')}
              style={{
                padding: '10px 20px',
                background: theme.colors.primary,
                color: theme.colors.white,
                border: 'none',
                borderRadius: theme.borderRadius.md,
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              View All Sessions
            </button>
          ) : (
            <button
              onClick={() => navigate('/dashboard/find')}
              style={{
                padding: '10px 20px',
                background: theme.colors.primary,
                color: theme.colors.white,
                border: 'none',
                borderRadius: theme.borderRadius.md,
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              Find a Supporter
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredSessions.map(s => {
            const status = getSessionStatus(s);
            const statusStyle = getStatusColor(status);
            const timeRemaining = status === 'upcoming' ? getTimeRemaining(s) : null;
            
            return (
              <div key={s._id} style={{
                background: theme.colors.white,
                borderRadius: theme.borderRadius.lg,
                padding: '24px',
                border: `1px solid ${theme.colors.gray200}`,
                borderLeft: `4px solid ${statusStyle.color}`
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <Avatar name={s.supporter?.name || 'S'} color={theme.colors.primary} size={56} />
                    <div>
                      <h3 style={{ fontSize: '18px', fontWeight: 600, color: theme.colors.gray800, margin: '0 0 4px' }}>
                        {s.topic}
                      </h3>
                      <p style={{ fontSize: '14px', color: theme.colors.gray600, margin: 0 }}>
                        with {s.supporter?.name}
                      </p>
                    </div>
                  </div>
                  <StatusBadgeSmall status={status} />
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '16px',
                  marginBottom: '20px',
                  padding: '16px',
                  background: theme.colors.gray50,
                  borderRadius: theme.borderRadius.md
                }}>
                  <div>
                    <div style={{ fontSize: '12px', color: theme.colors.gray600, marginBottom: '4px' }}>Date</div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: theme.colors.gray800 }}>
                      {new Date(s.date).toLocaleDateString()}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: theme.colors.gray600, marginBottom: '4px' }}>Time</div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: theme.colors.gray800 }}>{s.time}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: theme.colors.gray600, marginBottom: '4px' }}>Duration</div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: theme.colors.gray800 }}>{s.duration} min</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: theme.colors.gray600, marginBottom: '4px' }}>Rating</div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: theme.colors.gray800 }}>
                      {s.rating?.score ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <PencilIcon name="star" size={14} color="#fbbf24" />
                          {s.rating.score}/5
                        </span>
                      ) : status === 'completed' ? (
                        <span style={{ color: theme.colors.warning, cursor: 'pointer' }}>Rate Now</span>
                      ) : (
                        '—'
                      )}
                    </div>
                  </div>
                </div>

                {timeRemaining && (
                  <div style={{
                    marginBottom: '16px',
                    padding: '8px 16px',
                    background: '#dbeafe',
                    borderRadius: theme.borderRadius.md,
                    fontSize: '13px',
                    color: '#1e40af',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <PencilIcon name="clock" size={14} color="#1e40af" />
                    {timeRemaining}
                  </div>
                )}

                {s.rating?.comment && (
                  <div style={{
                    marginBottom: '16px',
                    padding: '16px',
                    background: theme.colors.gray50,
                    borderRadius: theme.borderRadius.md,
                    fontSize: '14px',
                    color: theme.colors.gray700,
                    fontStyle: 'italic'
                  }}>
                    "{s.rating.comment}"
                  </div>
                )}

                <div style={{ display: 'flex', gap: '12px' }}>
                  {status === 'upcoming' && (
                    <>
                      <button
                        onClick={() => navigate('/dashboard/messages', {
                          state: { partnerId: s.supporter._id, partnerName: s.supporter.name, sessionId: s._id }
                        })}
                        style={{
                          flex: 1,
                          padding: '12px',
                          background: theme.colors.primary,
                          color: theme.colors.white,
                          border: 'none',
                          borderRadius: theme.borderRadius.md,
                          fontSize: '14px',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        Message
                      </button>
                      <button
                        onClick={() => {/* Cancel */}}
                        style={{
                          flex: 1,
                          padding: '12px',
                          background: theme.colors.white,
                          color: theme.colors.danger,
                          border: `1px solid ${theme.colors.danger}`,
                          borderRadius: theme.borderRadius.md,
                          fontSize: '14px',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        Cancel
                      </button>
                    </>
                  )}
                  {status === 'live' && (
                    <button
                      onClick={() => {
                        setLiveSessionId(s._id);
                        navigate('/dashboard/messages', {
                          state: { partnerId: s.supporter._id, partnerName: s.supporter.name, sessionId: s._id }
                        });
                      }}
                      style={{
                        flex: 1,
                        padding: '12px',
                        background: theme.colors.danger,
                        color: theme.colors.white,
                        border: 'none',
                        borderRadius: theme.borderRadius.md,
                        fontSize: '14px',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Join Live
                    </button>
                  )}
                  {status === 'ended' && (
                    <div style={{
                      flex: 1,
                      padding: '12px',
                      background: '#fef3c7',
                      color: '#92400e',
                      borderRadius: theme.borderRadius.md,
                      fontSize: '14px',
                      textAlign: 'center'
                    }}>
                      Waiting for supporter to complete
                    </div>
                  )}
                  {status === 'pending' && (
                    <div style={{
                      flex: 1,
                      padding: '12px',
                      background: '#fef3c7',
                      color: '#92400e',
                      borderRadius: theme.borderRadius.md,
                      fontSize: '14px',
                      textAlign: 'center'
                    }}>
                      Awaiting response
                    </div>
                  )}
                  {status === 'completed' && !s.rating && (
                    <button
                      onClick={() => setQrFeedbackModal(s)}
                      style={{
                        flex: 1,
                        padding: '12px',
                        background: theme.colors.warning,
                        color: theme.colors.white,
                        border: 'none',
                        borderRadius: theme.borderRadius.md,
                        fontSize: '14px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                      }}
                    >
                      <PencilIcon name="star" size={16} color={theme.colors.white} />
                      Rate Session
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {ratingModal && (
        <FeedbackModal
          session={ratingModal}
          onClose={() => setRatingModal(null)}
          onDone={onRefresh}
        />
      )}
      {extensionModal && (
        <SessionExtensionModal
          session={extensionModal}
          onClose={() => setExtensionModal(null)}
          onExtend={(minutes) => handleExtendSession(extensionModal._id, minutes)}
          onEnd={() => handleEndSession(extensionModal._id)}
        />
      )}
      {qrFeedbackModal && (
        <QRFeedbackModal
          session={qrFeedbackModal}
          onClose={() => setQrFeedbackModal(null)}
          onFeedbackSubmitted={onRefresh}
        />
      )}
      {liveSessionId && (
        <LiveSessionTimer
          sessionId={liveSessionId}
          onExtensionNeeded={() => {
            const liveSession = sessions.find(s => s._id === liveSessionId);
            if (liveSession) setExtensionModal(liveSession);
          }}
          onSessionEnded={onRefresh}
        />
      )}
    </div>
  );
}

// ==================== LIVE SESSION TIMER ====================
function LiveSessionTimer({ sessionId, onExtensionNeeded, onSessionEnded }) {
  const [remainingMinutes, setRemainingMinutes] = useState(null);
  const [showExtensionPrompt, setShowExtensionPrompt] = useState(false);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await sessionAPI.getLiveSessionStatus(sessionId);
        const data = response.data;
        if (data.isLive) {
          setRemainingMinutes(data.remainingMinutes);
          if (data.needsExtensionPrompt && !showExtensionPrompt) {
            setShowExtensionPrompt(true);
            onExtensionNeeded && onExtensionNeeded();
          }
        } else {
          onSessionEnded && onSessionEnded();
        }
      } catch (error) {
        console.error('Failed to fetch live status:', error);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, [sessionId]);

  if (remainingMinutes === null) return null;

  const formatTime = (minutes) => {
    if (minutes <= 0) return 'Ending now';
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '80px',
      right: '20px',
      background: theme.colors.white,
      borderRadius: theme.borderRadius.lg,
      padding: '12px 20px',
      boxShadow: theme.shadows.lg,
      border: `1px solid ${theme.colors.gray200}`,
      zIndex: 100,
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    }}>
      <div style={{
        width: '10px',
        height: '10px',
        borderRadius: '50%',
        background: '#10b981',
        animation: 'pulse 1.5s infinite'
      }} />
      <span style={{ fontSize: '13px', color: theme.colors.gray600 }}>Session ends:</span>
      <span style={{ fontSize: '15px', fontWeight: 700, color: theme.colors.primary }}>{formatTime(remainingMinutes)}</span>
    </div>
  );
}

// ==================== MESSAGES SECTION ====================
function Messages() {
  const { user } = useAuth();
  const location = useLocation();
  const bottomRef = useRef(null);
  const fileInputRef = useRef(null);
  const [convs, setConvs] = useState([]);
  const [active, setActive] = useState(null);
  const [msgs, setMsgs] = useState([]);
  const [txt, setTxt] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [downloadedFiles, setDownloadedFiles] = useState({});
  const [sessionId, setSessionId] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);

  const handleContextMenu = (e, msg) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, message: msg });
  };
  
  const closeContextMenu = () => setContextMenu(null);

  const handleDeleteMessage = async (msgId) => {
    try {
      await messageAPI.deleteMessage(msgId);
      setMsgs(prev => prev.map(m => m._id === msgId ? { ...m, isDeleted: true, text: '', file: null, attachments: [] } : m));
      toast.success('Message deleted');
    } catch (e) {
      toast.error('Failed to delete message');
    }
    closeContextMenu();
  };

  const handleCopyMessage = (text) => {
    if(text) {
      navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard');
    }
    closeContextMenu();
  };

  useEffect(() => {
    if (location.state?.sessionId) {
      setSessionId(location.state.sessionId);
    }
  }, [location.state]);

  useEffect(() => {
    const startLiveSession = async () => {
      if (sessionId) {
        try {
          await sessionAPI.startLiveSession(sessionId);
          console.log('Live session started');
        } catch (error) {
          console.error('Failed to start live session:', error);
        }
      }
    };
    startLiveSession();
  }, [sessionId]);

  const loadConversations = async () => {
    try {
      const response = await messageAPI.getConversations();
      setConvs(response.data.conversations || []);
      
      if (location.state?.partnerId) {
        const existing = response.data.conversations?.find(
          c => c.partner._id === location.state.partnerId
        );
        setActive(existing || { 
          partner: { 
            _id: location.state.partnerId, 
            name: location.state.partnerName 
          } 
        });
      }
    } catch (error) {
      console.error('Failed to load conversations:', error);
    }
  };

  useEffect(() => {
    loadConversations();
  }, [location.state]);

  useEffect(() => {
    if (!active?.partner?._id) return;
    
    const loadMessages = async () => {
      setLoading(true);
      try {
        const response = await messageAPI.getConversation(active.partner._id);
        setMsgs(response.data.messages || []);
      } catch (error) {
        console.error('Failed to load messages:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadMessages();
  }, [active]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs]);

  const sendMessage = async () => {
    if (!txt.trim() || !active || sending) return;

    const tempId = Date.now();
    const tempMessage = {
      _id: tempId,
      sender: { _id: user._id },
      text: txt.trim(),
      createdAt: new Date(),
      temp: true
    };

    setMsgs(prev => [...prev, tempMessage]);
    setTxt('');
    setSending(true);

    try {
      const response = await messageAPI.sendMessage({
        recipientId: active.partner._id,
        text: tempMessage.text
      });

      setMsgs(prev => 
        prev.map(msg => 
          msg._id === tempId ? response.data.message : msg
        )
      );
      
      loadConversations();
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message');
      setMsgs(prev => prev.filter(msg => msg._id !== tempId));
    } finally {
      setSending(false);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file || !active) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error('File type not supported. Please upload images, PDF, DOC, or TXT files.');
      return;
    }

    setUploading(true);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('recipientId', active.partner._id);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/messages/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        setMsgs(prev => [...prev, data.message]);
        loadConversations();
        toast.success('File uploaded successfully');
      } else {
        toast.error(data.message || 'File upload failed');
      }
    } catch (error) {
      console.error('File upload error:', error);
      toast.error('Failed to connect to server. Please try again.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileDownload = (fileId, fileUrl) => {
    setDownloadedFiles(prev => ({ ...prev, [fileId]: true }));
    window.open(fileUrl, '_blank');
    toast.success('File downloaded');
  };

  const getFileIcon = (fileType) => {
    if (fileType?.startsWith('image/')) return 'image';
    if (fileType === 'application/pdf') return 'pdf';
    if (fileType?.includes('word')) return 'doc';
    if (fileType === 'text/plain') return 'text';
    return 'file';
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div style={{ 
      padding: '24px', 
      background: theme.colors.gray50, 
      height: 'calc(100vh - 100px)',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{
        display: 'flex',
        height: '100%',
        background: theme.colors.white,
        borderRadius: theme.borderRadius.lg,
        border: `1px solid ${theme.colors.gray200}`,
        overflow: 'hidden',
        boxShadow: theme.shadows.md
      }}>
        <div style={{
          width: '320px',
          borderRight: `1px solid ${theme.colors.gray200}`,
          display: 'flex',
          flexDirection: 'column',
          background: theme.colors.white
        }}>
          <div style={{
            padding: '20px',
            borderBottom: `1px solid ${theme.colors.gray200}`,
            background: theme.colors.white
          }}>
            <h3 style={{ 
              fontSize: '16px', 
              fontWeight: 600, 
              color: theme.colors.primary, 
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <PencilIcon name="messages" size={18} color={theme.colors.primary} />
              Conversations
            </h3>
          </div>
          
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {convs.length === 0 ? (
              <div style={{ 
                padding: '40px 20px', 
                textAlign: 'center', 
                color: theme.colors.gray500 
              }}>
                <PencilIcon name="messages" size={32} color={theme.colors.gray400} />
                <p style={{ marginTop: '12px', fontSize: '13px' }}>
                  No conversations yet
                </p>
                <p style={{ fontSize: '11px', marginTop: '4px' }}>
                  Start by messaging a supporter
                </p>
              </div>
            ) : (
              convs.map(c => (
                <div
                  key={c.partner._id}
                  onClick={() => setActive(c)}
                  style={{
                    display: 'flex',
                    gap: '12px',
                    padding: '16px 20px',
                    cursor: 'pointer',
                    borderBottom: `1px solid ${theme.colors.gray200}`,
                    background: active?.partner?._id === c.partner._id 
                      ? `${theme.colors.primary}08` 
                      : 'transparent',
                    transition: 'background 0.2s'
                  }}
                >
                  <Avatar name={c.partner.name} size={44} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '4px'
                    }}>
                      <span style={{
                        fontSize: '14px',
                        fontWeight: 600,
                        color: theme.colors.gray800
                      }}>
                        {c.partner.name}
                      </span>
                      {c.lastMessage && (
                        <span style={{
                          fontSize: '10px',
                          color: theme.colors.gray500
                        }}>
                          {new Date(c.lastMessage.createdAt).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                      )}
                    </div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <span style={{
                        fontSize: '12px',
                        color: theme.colors.gray600,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        maxWidth: '180px'
                      }}>
                        {c.lastMessage?.text || 'No messages yet'}
                      </span>
                      {c.unread > 0 && (
                        <span style={{
                          width: '18px',
                          height: '18px',
                          borderRadius: '50%',
                          background: theme.colors.warning,
                          color: theme.colors.white,
                          fontSize: '10px',
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          {c.unread}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div style={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column',
          background: theme.colors.white
        }}>
          {!active ? (
            <div style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: theme.colors.white,
              padding: '40px'
            }}>
              <PencilIcon name="messages" size={64} color={theme.colors.gray300} />
              <h3 style={{ 
                fontSize: '18px', 
                fontWeight: 600, 
                color: theme.colors.gray700,
                marginTop: '20px',
                marginBottom: '8px'
              }}>
                Your Messages
              </h3>
              <p style={{ 
                fontSize: '14px', 
                color: theme.colors.gray500,
                textAlign: 'center',
                maxWidth: '300px'
              }}>
                Select a conversation from the left to start chatting
              </p>
            </div>
          ) : (
            <>
              <div style={{
                padding: '16px 24px',
                borderBottom: `1px solid ${theme.colors.gray200}`,
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                background: theme.colors.white
              }}>
                <Avatar name={active.partner.name} size={44} />
                <div>
                  <h4 style={{ 
                    fontSize: '16px', 
                    fontWeight: 600, 
                    color: theme.colors.gray800, 
                    margin: 0 
                  }}>
                    {active.partner.name}
                  </h4>
                  <span style={{ 
                    fontSize: '12px', 
                    color: theme.colors.success,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    marginTop: '2px'
                  }}>
                    <span style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: theme.colors.success,
                      display: 'inline-block'
                    }} />
                    Online
                  </span>
                </div>
              </div>

              <div style={{
                flex: 1,
                padding: '24px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                background: theme.colors.gray50
              }}>
                {loading ? (
                  <div style={{ textAlign: 'center', padding: '40px' }}>
                    <Spinner />
                  </div>
                ) : msgs.length === 0 ? (
                  <div style={{ 
                    textAlign: 'center', 
                    padding: '40px',
                    background: theme.colors.white,
                    borderRadius: theme.borderRadius.lg,
                    border: `1px solid ${theme.colors.gray200}`
                  }}>
                    <PencilIcon name="messages" size={32} color={theme.colors.gray400} />
                    <p style={{ 
                      color: theme.colors.gray500, 
                      marginTop: '12px',
                      fontSize: '14px'
                    }}>
                      No messages yet. Say hello!
                    </p>
                  </div>
                ) : (
                  msgs.map((m, index) => {
                    const isMe = m.sender?._id === user._id;
                    const showDate = index === 0 || 
                      new Date(m.createdAt).toDateString() !== new Date(msgs[index - 1].createdAt).toDateString();
                    const fileData = m.file || (m.attachments && m.attachments[0]);
                    
                    return (
                      <React.Fragment key={m._id}>
                        {showDate && (
                          <div style={{
                            textAlign: 'center',
                            margin: '8px 0'
                          }}>
                            <span style={{
                              fontSize: '11px',
                              color: theme.colors.gray500,
                              background: theme.colors.white,
                              padding: '4px 12px',
                              borderRadius: theme.borderRadius.full,
                              border: `1px solid ${theme.colors.gray200}`
                            }}>
                              {new Date(m.createdAt).toLocaleDateString('en-US', { 
                                weekday: 'long', 
                                month: 'short', 
                                day: 'numeric' 
                              })}
                            </span>
                          </div>
                        )}
                        
                        {m.isDeleted ? (
                          <div
                            onContextMenu={(e) => handleContextMenu(e, m)}
                            style={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: isMe ? 'flex-end' : 'flex-start'
                            }}
                          >
                            <div style={{
                              maxWidth: '70%',
                              padding: '12px 16px',
                              borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                              background: isMe ? `${theme.colors.primary}10` : `${theme.colors.gray100}`,
                              color: theme.colors.gray500,
                              fontStyle: 'italic',
                              fontSize: '14px',
                              border: `1px solid ${theme.colors.gray200}`,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px'
                            }}>
                              <span style={{ fontSize: '14px' }}>🚫</span>
                              {isMe ? 'You deleted this message' : 'This message was deleted'}
                            </div>
                            <span style={{
                              fontSize: '10px',
                              color: theme.colors.gray500,
                              marginTop: '4px',
                              marginLeft: isMe ? 0 : '8px',
                              marginRight: isMe ? '8px' : 0
                            }}>
                              {new Date(m.createdAt).toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </span>
                          </div>
                        ) : fileData ? (
                          <div 
                            onContextMenu={(e) => handleContextMenu(e, m)}
                            style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: isMe ? 'flex-end' : 'flex-start'
                          }}>
                            <div style={{
                              maxWidth: '70%',
                              padding: '16px',
                              borderRadius: isMe 
                                ? '16px 16px 4px 16px' 
                                : '16px 16px 16px 4px',
                              background: isMe ? theme.colors.primary : theme.colors.white,
                              color: isMe ? theme.colors.white : theme.colors.gray800,
                              boxShadow: theme.shadows.sm,
                              border: isMe ? 'none' : `1px solid ${theme.colors.gray200}`
                            }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{
                                  width: '40px',
                                  height: '40px',
                                  borderRadius: '8px',
                                  background: isMe ? 'rgba(255,255,255,0.2)' : theme.colors.gray100,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}>
                                  <PencilIcon 
                                    name={getFileIcon(fileData.type)} 
                                    size={20} 
                                    color={isMe ? theme.colors.white : theme.colors.primary} 
                                  />
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div style={{ 
                                    fontSize: '13px', 
                                    fontWeight: 600,
                                    color: isMe ? theme.colors.white : theme.colors.gray800,
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
                                  }}>
                                    {fileData.name}
                                  </div>
                                  <div style={{ 
                                    fontSize: '10px',
                                    color: isMe ? 'rgba(255,255,255,0.7)' : theme.colors.gray500,
                                    marginTop: '2px'
                                  }}>
                                    {formatFileSize(fileData.size)}
                                  </div>
                                </div>
                                <a
                                  href={fileData.url.startsWith('http') 
                                    ? fileData.url 
                                    : `${process.env.REACT_APP_API_URL.replace('/api', '')}${fileData.url}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{
                                    color: isMe ? theme.colors.white : theme.colors.primary,
                                    textDecoration: 'none',
                                    position: 'relative'
                                  }}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    handleFileDownload(m._id, fileData.url.startsWith('http') 
                                      ? fileData.url 
                                      : `${process.env.REACT_APP_API_URL.replace('/api', '')}${fileData.url}`);
                                  }}
                                >
                                  <PencilIcon 
                                    name={downloadedFiles[m._id] ? 'check' : 'download'} 
                                    size={18} 
                                    color={isMe ? theme.colors.white : theme.colors.primary} 
                                  />
                                  {downloadedFiles[m._id] && (
                                    <span style={{
                                      position: 'absolute',
                                      top: -8,
                                      right: -8,
                                      fontSize: '10px',
                                      color: '#10b981',
                                      background: 'white',
                                      borderRadius: '50%',
                                      width: '14px',
                                      height: '14px',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      border: '1px solid #10b981'
                                    }}>
                                      ✓
                                    </span>
                                  )}
                                </a>
                              </div>
                            </div>
                            <span style={{
                              fontSize: '10px',
                              color: theme.colors.gray500,
                              marginTop: '4px',
                              marginLeft: isMe ? 0 : '8px',
                              marginRight: isMe ? '8px' : 0,
                              display: 'flex',
                              alignItems: 'center'
                            }}>
                              {new Date(m.createdAt).toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                              {isMe && (
                                <span style={{ 
                                  marginLeft: '4px',
                                  fontSize: '12px',
                                  color: (m.status === 'read' || m.read) ? '#3b82f6' : '#9ca3af',
                                  letterSpacing: '-3px',
                                  display: 'inline-block'
                                }}>
                                  {(m.status === 'read' || m.read || m.status === 'delivered') ? '✓✓' : '✓'}
                                </span>
                              )}
                            </span>
                          </div>
                        ) : (
                          <div 
                            onContextMenu={(e) => handleContextMenu(e, m)}
                            style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: isMe ? 'flex-end' : 'flex-start'
                          }}>
                            <div style={{
                              maxWidth: '70%',
                              padding: '12px 16px',
                              borderRadius: isMe 
                                ? '16px 16px 4px 16px' 
                                : '16px 16px 16px 4px',
                              background: isMe ? theme.colors.primary : theme.colors.white,
                              color: isMe ? theme.colors.white : theme.colors.gray800,
                              fontSize: '14px',
                              lineHeight: 1.5,
                              boxShadow: theme.shadows.sm,
                              border: isMe ? 'none' : `1px solid ${theme.colors.gray200}`
                            }}>
                              {m.text}
                            </div>
                            <span style={{
                              fontSize: '10px',
                              color: theme.colors.gray500,
                              marginTop: '4px',
                              marginLeft: isMe ? 0 : '8px',
                              marginRight: isMe ? '8px' : 0,
                              display: 'flex',
                              alignItems: 'center'
                            }}>
                              {new Date(m.createdAt).toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                              {isMe && (
                                <span style={{ 
                                  marginLeft: '4px',
                                  fontSize: '12px',
                                  color: (m.status === 'read' || m.read) ? '#3b82f6' : '#9ca3af',
                                  letterSpacing: '-3px',
                                  display: 'inline-block'
                                }}>
                                  {(m.status === 'read' || m.read || m.status === 'delivered') ? '✓✓' : '✓'}
                                </span>
                              )}
                            </span>
                          </div>
                        )}
                      </React.Fragment>
                    );
                  })
                )}
                <div ref={bottomRef} />
              </div>

              <div style={{
                padding: '20px 24px',
                borderTop: `1px solid ${theme.colors.gray200}`,
                display: 'flex',
                gap: '12px',
                background: theme.colors.white,
                alignItems: 'center'
              }}>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                  accept="image/*,.pdf,.doc,.docx,.txt"
                />
                
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading || !active}
                  style={{
                    padding: '12px',
                    background: uploading ? theme.colors.gray300 : theme.colors.gray100,
                    color: theme.colors.gray700,
                    border: `1px solid ${theme.colors.gray300}`,
                    borderRadius: theme.borderRadius.md,
                    cursor: uploading || !active ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s'
                  }}
                  title="Attach file"
                >
                  {uploading ? (
                    <Spinner size={18} />
                  ) : (
                    <PencilIcon name="attachment" size={18} color={theme.colors.gray600} />
                  )}
                </button>

                <input
                  placeholder="Type your message..."
                  value={txt}
                  onChange={e => setTxt(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                  disabled={sending || uploading}
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    border: `1px solid ${theme.colors.gray300}`,
                    borderRadius: theme.borderRadius.md,
                    fontSize: '14px',
                    background: theme.colors.gray50
                  }}
                />

                <button
                  onClick={sendMessage}
                  disabled={!txt.trim() || sending || uploading}
                  style={{
                    padding: '12px 24px',
                    background: !txt.trim() || sending || uploading ? theme.colors.gray300 : theme.colors.primary,
                    color: theme.colors.white,
                    border: 'none',
                    borderRadius: theme.borderRadius.md,
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: !txt.trim() || sending || uploading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.2s'
                  }}
                >
                  <PencilIcon name="send" size={16} color={theme.colors.white} />
                  Send
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      {contextMenu && (
        <>
          <div 
            onClick={closeContextMenu}
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9998 }}
          />
          <div style={{
            position: 'fixed',
            top: contextMenu.y,
            left: contextMenu.x,
            background: theme.colors.white,
            boxShadow: theme.shadows.lg,
            borderRadius: theme.borderRadius.md,
            padding: '8px 0',
            zIndex: 9999,
            border: `1px solid ${theme.colors.gray200}`,
            minWidth: '150px'
          }}>
            {contextMenu.message.text && (
              <button
                onClick={() => handleCopyMessage(contextMenu.message.text)}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '8px 16px',
                  textAlign: 'left',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '14px',
                  color: theme.colors.gray700
                }}
                onMouseOver={(e) => e.target.style.background = theme.colors.gray50}
                onMouseOut={(e) => e.target.style.background = 'transparent'}
              >
                Copy Message
              </button>
            )}
            {contextMenu.message.sender?._id === user._id && !contextMenu.message.isDeleted && (
              <button
                onClick={() => handleDeleteMessage(contextMenu.message._id)}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '8px 16px',
                  textAlign: 'left',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '14px',
                  color: theme.colors.danger
                }}
                onMouseOver={(e) => e.target.style.background = theme.colors.gray50}
                onMouseOut={(e) => e.target.style.background = 'transparent'}
              >
                Delete Message
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ==================== NOTIFICATIONS SECTION ====================
function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await userAPI.getNotifications();
      setNotifications(response.data.notifications || []);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAllAsRead = async () => {
    try {
      await userAPI.markAllNotificationsRead();
      setNotifications(prev => 
        prev.map(n => ({ ...n, read: true }))
      );
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Failed to mark notifications as read:', error);
    }
  };

  const markAsRead = async (id) => {
    try {
      await userAPI.markNotificationRead(id);
      setNotifications(prev =>
        prev.map(n => n._id === id ? { ...n, read: true } : n)
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) return <div style={{ padding: '24px' }}><Spinner /></div>;

  return (
    <div style={{ padding: '24px', background: theme.colors.gray50, minHeight: '100vh' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        background: theme.colors.white,
        padding: '20px 24px',
        borderRadius: theme.borderRadius.lg,
        border: `1px solid ${theme.colors.gray200}`
      }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: theme.colors.primary, margin: '0 0 4px 0' }}>
            Notifications
          </h1>
          <p style={{ fontSize: '14px', color: theme.colors.gray600, margin: 0 }}>
            {unreadCount} unread {unreadCount === 1 ? 'notification' : 'notifications'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            style={{
              padding: '8px 16px',
              background: theme.colors.white,
              color: theme.colors.gray700,
              border: `1px solid ${theme.colors.gray300}`,
              borderRadius: theme.borderRadius.md,
              fontSize: '13px',
              cursor: 'pointer'
            }}
          >
            Mark all as read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div style={{
          background: theme.colors.white,
          borderRadius: theme.borderRadius.lg,
          padding: '60px',
          textAlign: 'center',
          border: `1px solid ${theme.colors.gray200}`
        }}>
          <PencilIcon name="notifications" size={48} color={theme.colors.gray400} />
          <h3 style={{ fontSize: '18px', fontWeight: 600, color: theme.colors.gray800, margin: '16px 0 8px' }}>
            No notifications
          </h3>
          <p style={{ color: theme.colors.gray600, fontSize: '14px' }}>
            You're all caught up!
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {notifications.map(n => (
            <div
              key={n._id}
              onClick={() => !n.read && markAsRead(n._id)}
              style={{
                display: 'flex',
                gap: '16px',
                padding: '20px',
                background: theme.colors.white,
                borderRadius: theme.borderRadius.md,
                border: `1px solid ${theme.colors.gray200}`,
                borderLeft: n.read ? `1px solid ${theme.colors.gray200}` : `4px solid ${theme.colors.primary}`,
                cursor: n.read ? 'default' : 'pointer',
                opacity: n.read ? 0.8 : 1
              }}
            >
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: theme.borderRadius.md,
                background: n.read ? theme.colors.gray100 : `${theme.colors.primary}10`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <PencilIcon 
                  name={
                    n.type === 'session_request' ? 'sessions' :
                    n.type === 'session_update' ? 'calendar' :
                    n.type === 'approval' ? 'check' : 'notifications'
                  } 
                  size={20} 
                  color={n.read ? theme.colors.gray500 : theme.colors.primary} 
                />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ 
                  fontSize: '14px', 
                  color: theme.colors.gray800,
                  marginBottom: '4px'
                }}>
                  {n.message}
                </p>
                <span style={{ fontSize: '11px', color: theme.colors.gray500 }}>
                  {new Date(n.createdAt).toLocaleString()}
                </span>
              </div>
              {!n.read && (
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: theme.colors.primary,
                  alignSelf: 'center'
                }} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ==================== SETTINGS SECTION ====================
function Settings() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    userType: user?.userType || 'College Student',
    bio: user?.bio || '',
    topics: user?.topics || []
  });
  const [loading, setLoading] = useState(false);

  const userTypes = [
    'College Student',
    'High School Student',
    'Working Professional',
    'Graduate Student',
    'Other'
  ];

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await userAPI.updateProfile(form);
      updateUser(response.data.user);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px', background: theme.colors.gray50, minHeight: '100vh' }}>
      <div style={{
        background: theme.colors.white,
        borderRadius: theme.borderRadius.lg,
        padding: '32px',
        maxWidth: '600px',
        margin: '0 auto',
        border: `1px solid ${theme.colors.gray200}`
      }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: theme.colors.primary, marginBottom: '24px' }}>
          Account Settings
        </h1>

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
            onChange={e => setForm({ ...form, name: e.target.value })}
            style={{
              width: '100%',
              padding: '12px',
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
            Email
          </label>
          <input
            value={form.email}
            disabled
            style={{
              width: '100%',
              padding: '12px',
              border: `1px solid ${theme.colors.gray300}`,
              borderRadius: theme.borderRadius.md,
              fontSize: '14px',
              background: theme.colors.gray100,
              color: theme.colors.gray600
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
            I am a...
          </label>
          <select
            value={form.userType}
            onChange={e => setForm({ ...form, userType: e.target.value })}
            style={{
              width: '100%',
              padding: '12px',
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

        <button
          onClick={handleSave}
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
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}

// ==================== MAIN USER DASHBOARD ====================
export default function UserDashboard() {
  const [sessions, setSessions] = useState([]);
  const [notifCount, setNotifCount] = useState(0);
  const [bookTarget, setBookTarget] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [sessionsRes, notifRes] = await Promise.all([
        sessionAPI.getMySessions(),
        userAPI.getNotifications()
      ]);
      
      setSessions(sessionsRes.data.sessions || []);
      setNotifCount(
        notifRes.data.notifications?.filter(n => !n.read).length || 0
      );
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: theme.colors.gray50
      }}>
        <Spinner size={50} />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar navItems={NAV} notifCount={notifCount} />
      <main style={{ flex: 1, overflow: 'auto', background: theme.colors.gray50 }}>
        <Routes>
          <Route index element={<Overview sessions={sessions} />} />
          <Route path="find" element={<FindSupport onBook={setBookTarget} />} />
          <Route path="sessions" element={<MySessions sessions={sessions} onRefresh={loadData} />} />
          <Route path="messages" element={<Messages />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </main>
      {bookTarget && (
        <BookModal
          supporter={bookTarget}
          onClose={() => setBookTarget(null)}
          onBooked={loadData}
        />
      )}
    </div>
  );
}