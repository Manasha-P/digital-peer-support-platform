import { useState, useEffect, useRef } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import Sidebar from '../../components/Sidebar/Sidebar';
import { Avatar, StatusBadge, ProgressBar, EmptyState, Spinner } from '../../components/common';
import PencilIcon from '../../components/common/PencilIcon';
import { theme } from '../../styles/theme';
import { sessionAPI, messageAPI, authAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

const NAV = [
  { path: '/supporter', icon: 'dashboard', label: 'Dashboard', end: true },
  { path: '/supporter/sessions', icon: 'sessions', label: 'Sessions' },
  { path: '/supporter/clients', icon: 'users', label: 'My Clients' },
  { path: '/supporter/messages', icon: 'messages', label: 'Messages' },
  { path: '/supporter/notifications', icon: 'notifications', label: 'Session Requests' },
  { path: '/supporter/settings', icon: 'settings', label: 'Settings' },
];

const TOPICS = [
  'Anxiety', 'Depression', 'Stress', 'Relationships', 'Academic', 
  'Career', 'Loneliness', 'Grief', 'Self-esteem', 'Mindfulness', 
  'Family', 'Burnout'
];

// ==================== ACCEPT/REJECT BUTTONS ====================
function AcceptReject({ session, onRefresh }) {
  const [loading, setLoading] = useState(false);

  async function handle(status) {
    setLoading(true);
    try {
      if (status === 'upcoming') {
        await sessionAPI.acceptSession(session._id);
        toast.success('Session accepted!');
      } else {
        await sessionAPI.rejectSession(session._id);
        toast.success('Session rejected');
      }
      onRefresh();
    } catch (error) {
      console.error('Failed to update session:', error);
      toast.error(error.response?.data?.message || 'Failed to update session');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: 'flex', gap: '8px' }}>
      <button
        onClick={() => handle('upcoming')}
        disabled={loading}
        style={{
          padding: '8px 16px',
          background: loading ? theme.colors.gray300 : theme.colors.success,
          color: theme.colors.white,
          border: 'none',
          borderRadius: theme.borderRadius.md,
          fontSize: '13px',
          fontWeight: 600,
          cursor: loading ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          opacity: loading ? 0.7 : 1,
          transition: 'all 0.2s'
        }}
      >
        <PencilIcon name="check" size={16} color={theme.colors.white} />
        {loading ? 'Processing...' : 'Accept'}
      </button>
      <button
        onClick={() => handle('rejected')}
        disabled={loading}
        style={{
          padding: '8px 16px',
          background: loading ? theme.colors.gray300 : theme.colors.white,
          color: theme.colors.danger,
          border: `1px solid ${theme.colors.danger}20`,
          borderRadius: theme.borderRadius.md,
          fontSize: '13px',
          fontWeight: 600,
          cursor: loading ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          opacity: loading ? 0.7 : 1,
          transition: 'all 0.2s'
        }}
      >
        <PencilIcon name="cross" size={16} color={theme.colors.danger} />
        {loading ? 'Processing...' : 'Reject'}
      </button>
    </div>
  );
}

// ==================== MARK COMPLETE BUTTON ====================
function MarkCompleteBtn({ session, onRefresh }) {
  const [loading, setLoading] = useState(false);
  const dt = new Date(`${session.date.split('T')[0]}T${session.time}`);
  const ended = new Date() > new Date(dt.getTime() + session.duration * 60000);

  if (session.status !== 'upcoming') return null;

  async function mark() {
    setLoading(true);
    try {
      await sessionAPI.completeSession(session._id);
      toast.success('Session marked as complete');
      onRefresh();
    } catch (error) {
      console.error('Failed to mark complete:', error);
      toast.error(error.response?.data?.message || 'Failed to mark complete');
    } finally { 
      setLoading(false); 
    }
  }

  const buttonStyle = ended ? {
    background: theme.colors.success,
    color: theme.colors.white,
    border: 'none',
    cursor: 'pointer'
  } : {
    background: theme.colors.gray200,
    color: theme.colors.gray500,
    border: 'none',
    cursor: 'not-allowed'
  };

  return (
    <button
      onClick={mark}
      disabled={loading || !ended}
      style={{
        padding: '8px 16px',
        borderRadius: theme.borderRadius.md,
        fontSize: '13px',
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        opacity: loading ? 0.7 : 1,
        transition: 'all 0.2s',
        ...buttonStyle
      }}
    >
      {loading ? 'Saving...' : ended ? (
        <>
          <PencilIcon name="check" size={16} color={theme.colors.white} />
          Mark Complete
        </>
      ) : (
        <>
          <PencilIcon name="clock" size={16} color={theme.colors.gray500} />
          Not ended yet
        </>
      )}
    </button>
  );
}

// ==================== OVERVIEW SECTION ====================
function Overview({ sessions, onRefresh }) {
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    scheduled: 0,
    completed: 0
  });

  useEffect(() => {
    if (sessions) {
      setStats({
        total: sessions.length,
        pending: sessions.filter(s => s.status === 'pending').length,
        scheduled: sessions.filter(s => s.status === 'upcoming').length,
        completed: sessions.filter(s => s.status === 'completed').length
      });
    }
  }, [sessions]);

  const pending = sessions.filter(s => s.status === 'pending');
  const needClose = sessions.filter(s => {
    if (s.status !== 'upcoming') return false;
    const dt = new Date(`${s.date.split('T')[0]}T${s.time}`);
    return new Date() > new Date(dt.getTime() + s.duration * 60000);
  });

  // Stat Card Component
  const StatCard = ({ icon, value, label, color }) => (
    <div style={{
      background: theme.colors.white,
      borderRadius: theme.borderRadius.lg,
      padding: '20px',
      boxShadow: theme.shadows.md,
      border: `1px solid ${theme.colors.gray200}`,
      display: 'flex',
      alignItems: 'center',
      gap: '16px'
    }}>
      <div style={{
        width: '48px',
        height: '48px',
        borderRadius: theme.borderRadius.md,
        background: `${color}15`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <PencilIcon name={icon} size={24} color={color} />
      </div>
      <div>
        <div style={{ fontSize: '24px', fontWeight: 700, color: color, lineHeight: 1.2 }}>
          {value}
        </div>
        <div style={{ fontSize: '13px', color: theme.colors.gray600, fontWeight: 500 }}>
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
      {/* Header */}
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
            Supporter Dashboard
          </h1>
          <p style={{ fontSize: '14px', color: theme.colors.gray600, margin: 0 }}>
            Welcome back! Manage your sessions and clients
          </p>
        </div>
        <div style={{
          background: `${theme.colors.success}15`,
          padding: '8px 16px',
          borderRadius: theme.borderRadius.full,
          fontSize: '14px',
          fontWeight: 600,
          color: theme.colors.success,
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <PencilIcon name="check" size={16} color={theme.colors.success} />
          Available for sessions
        </div>
      </div>

      {/* Stats Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '20px',
        marginBottom: '24px'
      }}>
        <StatCard icon="total" value={stats.total} label="Total Sessions" color={theme.colors.primary} />
        <StatCard icon="pending" value={stats.pending} label="Pending Requests" color={theme.colors.warning} />
        <StatCard icon="upcoming" value={stats.scheduled} label="Scheduled" color={theme.colors.info} />
        <StatCard icon="completed" value={stats.completed} label="Completed" color={theme.colors.success} />
      </div>

      {/* Main Content */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gap: '20px'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Pending Requests */}
          {pending.length > 0 && (
            <div style={{
              background: theme.colors.white,
              borderRadius: theme.borderRadius.lg,
              border: `1px solid ${theme.colors.gray200}`,
              overflow: 'hidden'
            }}>
              <div style={{
                padding: '16px 20px',
                background: `${theme.colors.warning}10`,
                borderBottom: `1px solid ${theme.colors.gray200}`,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <PencilIcon name="pending" size={20} color={theme.colors.warning} />
                <span style={{ fontWeight: 600, color: theme.colors.warning }}>
                  New Session Requests ({pending.length})
                </span>
              </div>
              <div>
                {pending.map(s => (
                  <div key={s._id} style={{
                    padding: '16px 20px',
                    borderBottom: `1px solid ${theme.colors.gray200}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <Avatar name={s.user?.name} size={40} />
                      <div>
                        <div style={{ fontWeight: 600, color: theme.colors.gray800 }}>
                          {s.user?.name}
                        </div>
                        <div style={{ fontSize: '13px', color: theme.colors.gray600 }}>
                          {s.topic} • {new Date(s.date).toLocaleDateString()} at {s.time} • {s.duration}m
                        </div>
                      </div>
                    </div>
                    <AcceptReject session={s} onRefresh={onRefresh} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Awaiting Completion */}
          {needClose.length > 0 && (
            <div style={{
              background: theme.colors.white,
              borderRadius: theme.borderRadius.lg,
              border: `1px solid ${theme.colors.gray200}`,
              overflow: 'hidden'
            }}>
              <div style={{
                padding: '16px 20px',
                background: `${theme.colors.info}10`,
                borderBottom: `1px solid ${theme.colors.gray200}`,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <PencilIcon name="clock" size={20} color={theme.colors.info} />
                <span style={{ fontWeight: 600, color: theme.colors.info }}>
                  Awaiting Completion ({needClose.length})
                </span>
              </div>
              <div>
                {needClose.map(s => (
                  <div key={s._id} style={{
                    padding: '16px 20px',
                    borderBottom: `1px solid ${theme.colors.gray200}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <Avatar name={s.user?.name} size={40} />
                      <div>
                        <div style={{ fontWeight: 600, color: theme.colors.gray800 }}>
                          {s.user?.name}
                        </div>
                        <div style={{ fontSize: '13px', color: theme.colors.gray600 }}>
                          {s.topic} • {new Date(s.date).toLocaleDateString()} at {s.time}
                        </div>
                      </div>
                    </div>
                    <MarkCompleteBtn session={s} onRefresh={onRefresh} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Performance Card */}
          <div style={{
            background: theme.colors.white,
            borderRadius: theme.borderRadius.lg,
            padding: '24px',
            border: `1px solid ${theme.colors.gray200}`
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: theme.colors.primary, marginBottom: '20px' }}>
              Your Performance
            </h3>
            <ProgressBar label="Response Rate" value={94} color="auto" />
            <ProgressBar label="Satisfaction Score" value={96} color="auto" />
            <ProgressBar label="Session Completion" value={89} color="auto" />
          </div>
        </div>

        {/* Quick Stats Sidebar */}
        <div style={{
          background: theme.colors.white,
          borderRadius: theme.borderRadius.lg,
          padding: '24px',
          border: `1px solid ${theme.colors.gray200}`,
          height: 'fit-content'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: 600, color: theme.colors.primary, marginBottom: '20px' }}>
            Quick Stats
          </h3>
          
          <div style={{ marginBottom: '24px' }}>
            <div style={{ 
              fontSize: '36px', 
              fontWeight: 700, 
              color: theme.colors.primary,
              marginBottom: '4px'
            }}>
              {sessions.filter(s => s.status === 'completed').length}
            </div>
            <div style={{ fontSize: '13px', color: theme.colors.gray600 }}>
              Total Completed Sessions
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <div style={{ 
              fontSize: '36px', 
              fontWeight: 700, 
              color: theme.colors.success,
              marginBottom: '4px'
            }}>
              {sessions.filter(s => s.user).length}
            </div>
            <div style={{ fontSize: '13px', color: theme.colors.gray600 }}>
              Unique Clients
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <div style={{ 
              fontSize: '36px', 
              fontWeight: 700, 
              color: theme.colors.warning,
              marginBottom: '4px'
            }}>
              {sessions.reduce((sum, s) => sum + (s.rating?.score || 0), 0) / 
               sessions.filter(s => s.rating?.score).length || 0}
            </div>
            <div style={{ fontSize: '13px', color: theme.colors.gray600 }}>
              Average Rating
            </div>
          </div>

          <div style={{
            padding: '16px',
            background: theme.colors.gray50,
            borderRadius: theme.borderRadius.md
          }}>
            <h4 style={{ fontSize: '14px', fontWeight: 600, color: theme.colors.gray700, marginBottom: '12px' }}>
              Quick Tips
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <PencilIcon name="check" size={14} color={theme.colors.success} />
                <span style={{ fontSize: '12px', color: theme.colors.gray600 }}>
                  Respond within 2 hours
                </span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <PencilIcon name="check" size={14} color={theme.colors.success} />
                <span style={{ fontSize: '12px', color: theme.colors.gray600 }}>
                  Mark sessions complete
                </span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <PencilIcon name="check" size={14} color={theme.colors.success} />
                <span style={{ fontSize: '12px', color: theme.colors.gray600 }}>
                  Check messages daily
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== SESSIONS SECTION ====================
function Sessions({ sessions, onRefresh }) {
  const [filter, setFilter] = useState('all');

  const filteredSessions = sessions.filter(s => {
    if (filter === 'all') return true;
    return s.status === filter;
  });

  const getStatusStyle = (status) => {
    switch(status) {
      case 'pending': return { bg: '#fef3c7', color: '#92400e', label: 'Pending' };
      case 'upcoming': return { bg: '#dbeafe', color: '#1e40af', label: 'Upcoming' };
      case 'completed': return { bg: '#dcfce7', color: '#166534', label: 'Completed' };
      case 'rejected': return { bg: '#fee2e2', color: '#991b1b', label: 'Rejected' };
      case 'cancelled': return { bg: '#f3f4f6', color: '#4b5563', label: 'Cancelled' };
      default: return { bg: '#f3f4f6', color: '#4b5563', label: status };
    }
  };

  return (
    <div style={{ padding: '24px', background: theme.colors.gray50, minHeight: '100vh' }}>
      {/* Header */}
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
            All Sessions
          </h1>
          <p style={{ fontSize: '14px', color: theme.colors.gray600, margin: 0 }}>
            {sessions.length} total sessions • {sessions.filter(s => s.status === 'completed').length} completed
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {['all', 'pending', 'upcoming', 'completed'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '8px 16px',
                borderRadius: theme.borderRadius.full,
                border: 'none',
                background: filter === f ? theme.colors.primary : theme.colors.white,
                color: filter === f ? theme.colors.white : theme.colors.gray700,
                fontSize: '13px',
                fontWeight: 500,
                cursor: 'pointer',
                border: filter === f ? 'none' : `1px solid ${theme.colors.gray300}`
              }}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Sessions List */}
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
            No sessions found
          </h3>
          <p style={{ color: theme.colors.gray600, fontSize: '14px' }}>
            {filter !== 'all' ? `No ${filter} sessions available` : 'Your sessions will appear here'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredSessions.map(s => {
            const style = getStatusStyle(s.status);
            
            return (
              <div key={s._id} style={{
                background: theme.colors.white,
                borderRadius: theme.borderRadius.lg,
                padding: '20px',
                border: `1px solid ${theme.colors.gray200}`,
                borderLeft: `4px solid ${style.color}`
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '16px'
                }}>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <Avatar name={s.user?.name} size={48} />
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: 600, color: theme.colors.gray800, margin: '0 0 4px' }}>
                        {s.user?.name}
                      </h3>
                      <div style={{ fontSize: '14px', color: theme.colors.gray600 }}>{s.topic}</div>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                    <div style={{ display: 'flex', gap: '16px', color: theme.colors.gray500, fontSize: '13px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <PencilIcon name="calendar" size={14} color={theme.colors.gray500} />
                        {new Date(s.date).toLocaleDateString()}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <PencilIcon name="clock" size={14} color={theme.colors.gray500} />
                        {s.time}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <PencilIcon name="duration" size={14} color={theme.colors.gray500} />
                        {s.duration}m
                      </span>
                    </div>
                    
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: theme.borderRadius.full,
                      fontSize: '12px',
                      fontWeight: 600,
                      background: style.bg,
                      color: style.color
                    }}>
                      {style.label}
                    </span>

                    {s.status === 'pending' && (
                      <AcceptReject session={s} onRefresh={onRefresh} />
                    )}
                    {s.status === 'upcoming' && (
                      <MarkCompleteBtn session={s} onRefresh={onRefresh} />
                    )}
                  </div>
                </div>

                {s.rating?.score && (
                  <div style={{
                    marginTop: '16px',
                    padding: '12px',
                    background: '#dcfce7',
                    borderRadius: theme.borderRadius.md,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '13px',
                    color: '#166534'
                  }}>
                    <PencilIcon name="star" size={16} color="#166534" />
                    <span>Rated {s.rating.score}/5</span>
                    {s.rating.comment && <span>• "{s.rating.comment}"</span>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ==================== CLIENTS SECTION ====================
function Clients({ sessions }) {
  const clients = [...new Map(sessions.filter(s => s.user).map(s => [s.user._id, s.user])).values()];

  const getClientStats = (clientId) => {
    const clientSessions = sessions.filter(s => s.user?._id === clientId);
    return {
      total: clientSessions.length,
      completed: clientSessions.filter(s => s.status === 'completed').length,
      upcoming: clientSessions.filter(s => s.status === 'upcoming').length
    };
  };

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
          My Clients
        </h1>
        <p style={{ fontSize: '14px', color: theme.colors.gray600, marginTop: '4px' }}>
          {clients.length} unique clients
        </p>
      </div>

      {clients.length === 0 ? (
        <div style={{
          background: theme.colors.white,
          borderRadius: theme.borderRadius.lg,
          padding: '60px',
          textAlign: 'center',
          border: `1px solid ${theme.colors.gray200}`
        }}>
          <PencilIcon name="users" size={48} color={theme.colors.gray400} />
          <h3 style={{ fontSize: '18px', fontWeight: 600, color: theme.colors.gray800, margin: '16px 0 8px' }}>
            No clients yet
          </h3>
          <p style={{ color: theme.colors.gray600, fontSize: '14px' }}>
            Your clients will appear here after you accept sessions
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '20px'
        }}>
          {clients.map(c => {
            const stats = getClientStats(c._id);
            
            return (
              <div key={c._id} style={{
                background: theme.colors.white,
                borderRadius: theme.borderRadius.lg,
                padding: '24px',
                border: `1px solid ${theme.colors.gray200}`,
                transition: 'all 0.2s',
                ':hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: theme.shadows.lg
                }
              }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '16px' }}>
                  <Avatar name={c.name} size={56} />
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 600, color: theme.colors.gray800, margin: '0 0 4px' }}>
                      {c.name}
                    </h3>
                    <p style={{ fontSize: '13px', color: theme.colors.gray600, margin: 0 }}>
                      {c.userType || 'Client'}
                    </p>
                  </div>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '12px',
                  marginBottom: '20px',
                  padding: '16px',
                  background: theme.colors.gray50,
                  borderRadius: theme.borderRadius.md,
                  textAlign: 'center'
                }}>
                  <div>
                    <div style={{ fontSize: '20px', fontWeight: 700, color: theme.colors.primary }}>
                      {stats.total}
                    </div>
                    <div style={{ fontSize: '11px', color: theme.colors.gray600 }}>Total</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '20px', fontWeight: 700, color: theme.colors.success }}>
                      {stats.completed}
                    </div>
                    <div style={{ fontSize: '11px', color: theme.colors.gray600 }}>Completed</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '20px', fontWeight: 700, color: theme.colors.info }}>
                      {stats.upcoming}
                    </div>
                    <div style={{ fontSize: '11px', color: theme.colors.gray600 }}>Upcoming</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => {/* View client details */}}
                    style={{
                      flex: 1,
                      padding: '10px',
                      background: theme.colors.primary,
                      color: theme.colors.white,
                      border: 'none',
                      borderRadius: theme.borderRadius.md,
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => {/* Message client */}}
                    style={{
                      padding: '10px 16px',
                      background: theme.colors.gray100,
                      color: theme.colors.gray700,
                      border: `1px solid ${theme.colors.gray300}`,
                      borderRadius: theme.borderRadius.md,
                      fontSize: '13px',
                      cursor: 'pointer'
                    }}
                  >
                    <PencilIcon name="messages" size={16} color={theme.colors.gray600} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ==================== MESSAGES SECTION ====================
function Messages() {
  const { user } = useAuth();
  const location = useLocation();
  const bottomRef = useRef(null);
  const [convs, setConvs] = useState([]);
  const [active, setActive] = useState(null);
  const [msgs, setMsgs] = useState([]);
  const [txt, setTxt] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

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

  return (
    <div style={{ padding: '24px', background: theme.colors.gray50, height: 'calc(100vh - 80px)' }}>
      <div style={{
        display: 'flex',
        height: '100%',
        background: theme.colors.white,
        borderRadius: theme.borderRadius.lg,
        border: `1px solid ${theme.colors.gray200}`,
        overflow: 'hidden'
      }}>
        {/* Conversations List */}
        <div style={{
          width: '300px',
          borderRight: `1px solid ${theme.colors.gray200}`,
          display: 'flex',
          flexDirection: 'column',
          background: theme.colors.gray50
        }}>
          <div style={{
            padding: '16px',
            borderBottom: `1px solid ${theme.colors.gray200}`,
            background: theme.colors.white
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: theme.colors.primary, margin: 0 }}>
              Conversations
            </h3>
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {convs.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: theme.colors.gray500 }}>
                <PencilIcon name="messages" size={32} color={theme.colors.gray400} />
                <p style={{ marginTop: '12px' }}>No conversations yet</p>
              </div>
            ) : (
              convs.map(c => (
                <div
                  key={c.partner._id}
                  onClick={() => setActive(c)}
                  style={{
                    display: 'flex',
                    gap: '12px',
                    padding: '12px 16px',
                    cursor: 'pointer',
                    borderBottom: `1px solid ${theme.colors.gray200}`,
                    background: active?.partner?._id === c.partner._id 
                      ? `${theme.colors.primary}10` 
                      : 'transparent',
                    transition: 'background 0.2s'
                  }}
                >
                  <Avatar name={c.partner.name} size={40} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: 600,
                      color: theme.colors.gray800,
                      marginBottom: '2px'
                    }}>
                      {c.partner.name}
                    </div>
                    {c.lastMessage && (
                      <div style={{
                        fontSize: '12px',
                        color: theme.colors.gray600,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {c.lastMessage.text}
                      </div>
                    )}
                  </div>
                  {c.unread > 0 && (
                    <div style={{
                      width: '20px',
                      height: '20px',
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
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {!active ? (
            <div style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: theme.colors.gray50
            }}>
              <PencilIcon name="messages" size={48} color={theme.colors.gray400} />
              <p style={{ marginTop: '16px', color: theme.colors.gray600 }}>
                Select a conversation to start messaging
              </p>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div style={{
                padding: '16px',
                borderBottom: `1px solid ${theme.colors.gray200}`,
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                background: theme.colors.white
              }}>
                <Avatar name={active.partner.name} size={40} />
                <div>
                  <h4 style={{ fontSize: '15px', fontWeight: 600, color: theme.colors.gray800, margin: 0 }}>
                    {active.partner.name}
                  </h4>
                  <span style={{ fontSize: '12px', color: theme.colors.success }}>● Online</span>
                </div>
              </div>

              {/* Messages */}
              <div style={{
                flex: 1,
                padding: '20px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                background: theme.colors.gray50
              }}>
                {loading ? (
                  <Spinner />
                ) : msgs.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px' }}>
                    <PencilIcon name="messages" size={32} color={theme.colors.gray400} />
                    <p style={{ color: theme.colors.gray500, marginTop: '12px' }}>
                      No messages yet. Say hello!
                    </p>
                  </div>
                ) : (
                  msgs.map(m => {
                    const isMe = m.sender?._id === user._id;
                    return (
                      <div
                        key={m._id}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: isMe ? 'flex-end' : 'flex-start'
                        }}
                      >
                        <div style={{
                          maxWidth: '70%',
                          padding: '12px 16px',
                          borderRadius: isMe 
                            ? '16px 16px 4px 16px' 
                            : '16px 16px 16px 4px',
                          background: isMe ? theme.colors.primary : theme.colors.white,
                          color: isMe ? theme.colors.white : theme.colors.gray800,
                          fontSize: '14px',
                          boxShadow: theme.shadows.sm
                        }}>
                          {m.text}
                        </div>
                        <span style={{
                          fontSize: '10px',
                          color: theme.colors.gray500,
                          marginTop: '2px'
                        }}>
                          {new Date(m.createdAt).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                      </div>
                    );
                  })
                )}
                <div ref={bottomRef} />
              </div>

              {/* Message Input */}
              <div style={{
                padding: '16px',
                borderTop: `1px solid ${theme.colors.gray200}`,
                display: 'flex',
                gap: '12px',
                background: theme.colors.white
              }}>
                <input
                  placeholder="Type your message..."
                  value={txt}
                  onChange={e => setTxt(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
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
                  disabled={!txt.trim() || sending}
                  style={{
                    padding: '12px 24px',
                    background: !txt.trim() || sending ? theme.colors.gray300 : theme.colors.primary,
                    color: theme.colors.white,
                    border: 'none',
                    borderRadius: theme.borderRadius.md,
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: !txt.trim() || sending ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
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
    </div>
  );
}

// ==================== NOTIFICATIONS SECTION ====================
function Notifications({ sessions, onRefresh }) {
  const pending = sessions.filter(s => s.status === 'pending');

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
          Session Requests
        </h1>
        <p style={{ fontSize: '14px', color: theme.colors.gray600, marginTop: '4px' }}>
          {pending.length} pending {pending.length === 1 ? 'request' : 'requests'}
        </p>
      </div>

      {pending.length === 0 ? (
        <div style={{
          background: theme.colors.white,
          borderRadius: theme.borderRadius.lg,
          padding: '60px',
          textAlign: 'center',
          border: `1px solid ${theme.colors.gray200}`
        }}>
          <PencilIcon name="check" size={48} color={theme.colors.success} />
          <h3 style={{ fontSize: '18px', fontWeight: 600, color: theme.colors.gray800, margin: '16px 0 8px' }}>
            All caught up!
          </h3>
          <p style={{ color: theme.colors.gray600, fontSize: '14px' }}>
            No pending session requests
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {pending.map(s => (
            <div key={s._id} style={{
              background: theme.colors.white,
              borderRadius: theme.borderRadius.lg,
              padding: '20px',
              border: `1px solid ${theme.colors.gray200}`,
              borderLeft: `4px solid ${theme.colors.warning}`
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '16px'
              }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <Avatar name={s.user?.name} size={48} />
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 600, color: theme.colors.gray800, margin: '0 0 4px' }}>
                      {s.user?.name}
                    </h3>
                    <div style={{ fontSize: '14px', color: theme.colors.gray600 }}>{s.topic}</div>
                    <div style={{ display: 'flex', gap: '16px', marginTop: '4px', color: theme.colors.gray500, fontSize: '12px' }}>
                      <span>{new Date(s.date).toLocaleDateString()} at {s.time}</span>
                      <span>{s.duration} minutes</span>
                    </div>
                  </div>
                </div>
                <AcceptReject session={s} onRefresh={onRefresh} />
              </div>
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
    bio: user?.bio || '',
    specialty: user?.specialty || '',
    topics: user?.topics || []
  });
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    try {
      const response = await authAPI.updateProfile(form);
      updateUser(response.data.user);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally { 
      setSaving(false); 
    }
  }

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
          Supporter Settings
        </h1>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: theme.colors.gray700, marginBottom: '6px' }}>
            Display Name
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
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: theme.colors.gray700, marginBottom: '6px' }}>
            Specialty
          </label>
          <input
            placeholder="e.g. Anxiety & Stress Specialist"
            value={form.specialty}
            onChange={e => setForm({ ...form, specialty: e.target.value })}
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
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: theme.colors.gray700, marginBottom: '6px' }}>
            Bio
          </label>
          <textarea
            rows={4}
            value={form.bio}
            onChange={e => setForm({ ...form, bio: e.target.value })}
            placeholder="Tell clients about yourself..."
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

        <div style={{ marginBottom: '28px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: theme.colors.gray700, marginBottom: '12px' }}>
            Areas of Expertise
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {TOPICS.map(t => (
              <span
                key={t}
                onClick={() => setForm(prev => ({
                  ...prev,
                  topics: prev.topics.includes(t)
                    ? prev.topics.filter(x => x !== t)
                    : [...prev.topics, t]
                }))}
                style={{
                  padding: '8px 16px',
                  borderRadius: theme.borderRadius.full,
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  background: form.topics.includes(t) ? theme.colors.primary : theme.colors.gray100,
                  color: form.topics.includes(t) ? theme.colors.white : theme.colors.gray700,
                  border: form.topics.includes(t) ? 'none' : `1px solid ${theme.colors.gray300}`,
                  transition: 'all 0.2s'
                }}
              >
                {t}
              </span>
            ))}
          </div>
        </div>

        <button
          onClick={save}
          disabled={saving}
          style={{
            width: '100%',
            padding: '14px',
            background: saving ? theme.colors.gray300 : theme.colors.primary,
            color: theme.colors.white,
            border: 'none',
            borderRadius: theme.borderRadius.md,
            fontSize: '16px',
            fontWeight: 600,
            cursor: saving ? 'not-allowed' : 'pointer'
          }}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}

// ==================== MAIN SUPPORTER DASHBOARD ====================
export default function SupporterDashboard() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadSessions = async () => {
    try {
      const response = await sessionAPI.getMySessions();
      setSessions(response.data.sessions || []);
    } catch (error) {
      console.error('Failed to load sessions:', error);
      // Fallback data for demo
      setSessions([
        {
          _id: '1',
          user: { _id: 'u1', name: 'Alice Johnson' },
          topic: 'Anxiety Management',
          date: new Date().toISOString().split('T')[0],
          time: '10:30',
          duration: 45,
          status: 'pending'
        },
        {
          _id: '2',
          user: { _id: 'u2', name: 'Bob Smith' },
          topic: 'Career Guidance',
          date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
          time: '14:00',
          duration: 60,
          status: 'upcoming'
        },
        {
          _id: '3',
          user: { _id: 'u3', name: 'Carol Davis' },
          topic: 'Stress Relief',
          date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
          time: '11:00',
          duration: 30,
          status: 'completed',
          rating: { score: 5, comment: 'Great session!' }
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  const pendingCount = sessions.filter(s => s.status === 'pending').length;

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
      <Sidebar navItems={NAV} notifCount={pendingCount} />
      <main style={{ flex: 1, overflow: 'auto', background: theme.colors.gray50 }}>
        <Routes>
          <Route index element={<Overview sessions={sessions} onRefresh={loadSessions} />} />
          <Route path="sessions" element={<Sessions sessions={sessions} onRefresh={loadSessions} />} />
          <Route path="clients" element={<Clients sessions={sessions} />} />
          <Route path="messages" element={<Messages />} />
          <Route path="notifications" element={<Notifications sessions={sessions} onRefresh={loadSessions} />} />
          <Route path="settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/supporter" />} />
        </Routes>
      </main>
    </div>
  );
}