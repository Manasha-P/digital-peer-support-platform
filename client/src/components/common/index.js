import React,{useState} from 'react';
import PencilIcon from './PencilIcon';
import { theme } from '../../styles/theme';

// ==================== AVATAR COMPONENT ====================
export const Avatar = ({ name, color = theme.colors.primary, size = 40, src }) => {
  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        style={{
          width: size,
          height: size,
          borderRadius: theme.borderRadius.md,
          objectFit: 'cover',
          border: `2px solid ${theme.colors.white}`,
          boxShadow: theme.shadows.sm
        }}
      />
    );
  }

  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: theme.borderRadius.md,
      background: color,
      color: theme.colors.white,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: size * 0.4,
      fontWeight: 600,
      border: `2px solid ${theme.colors.white}`,
      boxShadow: theme.shadows.sm
    }}>
      {getInitials(name)}
    </div>
  );
};

// ==================== STATUS BADGE COMPONENT ====================
export const StatusBadge = ({ status }) => {
  const getStatusStyle = () => {
    switch (status) {
      case 'online':
      case 'active':
      case 'completed':
        return { bg: '#d1fae5', color: '#065f46', icon: 'check' };
      case 'away':
      case 'pending':
        return { bg: '#fef3c7', color: '#92400e', icon: 'pending' };
      case 'offline':
      case 'inactive':
      case 'rejected':
      case 'cancelled':
        return { bg: '#fee2e2', color: '#991b1b', icon: 'cross' };
      case 'upcoming':
      case 'scheduled':
        return { bg: '#dbeafe', color: '#1e40af', icon: 'calendar' };
      case 'in_session':
      case 'live':
        return { bg: '#fee2e2', color: '#991b1b', icon: 'live' };
      default:
        return { bg: '#f3f4f6', color: '#4b5563', icon: 'circle' };
    }
  };

  const style = getStatusStyle();

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      padding: '4px 12px',
      borderRadius: theme.borderRadius.full,
      background: style.bg,
      color: style.color,
      fontSize: '12px',
      fontWeight: 600
    }}>
      <PencilIcon name={style.icon} size={12} color={style.color} />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

// ==================== PROGRESS BAR COMPONENT ====================
export const ProgressBar = ({ label, value, color = theme.colors.primary, showValue = true }) => {
  const getColor = () => {
    if (value >= 80) return theme.colors.success;
    if (value >= 60) return theme.colors.info;
    if (value >= 40) return theme.colors.warning;
    return theme.colors.danger;
  };

  const barColor = color === 'auto' ? getColor() : color;

  return (
    <div style={{ marginBottom: '16px' }}>
      {label && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '6px',
          fontSize: '13px'
        }}>
          <span style={{ color: theme.colors.gray700 }}>{label}</span>
          {showValue && (
            <span style={{ color: barColor, fontWeight: 600 }}>{value}%</span>
          )}
        </div>
      )}
      <div style={{
        width: '100%',
        height: '8px',
        background: theme.colors.gray200,
        borderRadius: theme.borderRadius.full,
        overflow: 'hidden'
      }}>
        <div style={{
          width: `${value}%`,
          height: '100%',
          background: barColor,
          borderRadius: theme.borderRadius.full,
          transition: 'width 0.3s ease'
        }} />
      </div>
    </div>
  );
};

// ==================== EMPTY STATE COMPONENT ====================
export const EmptyState = ({ icon, title, subtitle, action }) => (
  <div style={{
    textAlign: 'center',
    padding: '48px 24px',
    background: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    border: `1px solid ${theme.colors.gray200}`
  }}>
    <div style={{
      width: '80px',
      height: '80px',
      margin: '0 auto 20px',
      background: `${theme.colors.primary}10`,
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      {typeof icon === 'string' ? (
        <PencilIcon name={icon} size={40} color={theme.colors.primary} />
      ) : (
        icon
      )}
    </div>
    <h3 style={{
      fontSize: '18px',
      fontWeight: 600,
      color: theme.colors.primary,
      marginBottom: '8px'
    }}>
      {title}
    </h3>
    {subtitle && (
      <p style={{
        fontSize: '14px',
        color: theme.colors.gray600,
        marginBottom: action ? '20px' : 0
      }}>
        {subtitle}
      </p>
    )}
    {action && action}
  </div>
);

// ==================== SPINNER COMPONENT ====================
export const Spinner = ({ size = 40, color = theme.colors.primary }) => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px'
  }}>
    <div style={{
      width: size,
      height: size,
      border: `3px solid ${theme.colors.gray200}`,
      borderTopColor: color,
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }} />
    <style>{`
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

// ==================== STARS COMPONENT ====================
export const Stars = ({ rating, size = 16, onRate, editable = false }) => {
  const [hover, setHover] = useState(null);

  return (
    <div style={{ display: 'flex', gap: '2px' }}>
      {[1, 2, 3, 4, 5].map(star => (
        <span
          key={star}
          onClick={() => editable && onRate?.(star)}
          onMouseEnter={() => editable && setHover(star)}
          onMouseLeave={() => editable && setHover(null)}
          style={{
            fontSize: size,
            color: (hover || rating) >= star ? '#fbbf24' : theme.colors.gray300,
            cursor: editable ? 'pointer' : 'default',
            transition: 'transform 0.1s',
            transform: editable && hover >= star ? 'scale(1.2)' : 'scale(1)'
          }}
        >
          ★
        </span>
      ))}
    </div>
  );
};

// ==================== CARD COMPONENT ====================
export const Card = ({ children, padding = '24px', onClick, hoverable = false }) => (
  <div
    onClick={onClick}
    style={{
      background: theme.colors.white,
      borderRadius: theme.borderRadius.lg,
      padding,
      border: `1px solid ${theme.colors.gray200}`,
      boxShadow: theme.shadows.sm,
      transition: 'all 0.2s',
      cursor: onClick ? 'pointer' : 'default',
      ...(hoverable && {
        ':hover': {
          transform: 'translateY(-2px)',
          boxShadow: theme.shadows.lg
        }
      })
    }}
  >
    {children}
  </div>
);

// ==================== MODAL COMPONENT ====================
export const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;

  const sizes = {
    sm: { maxWidth: '400px' },
    md: { maxWidth: '500px' },
    lg: { maxWidth: '600px' },
    xl: { maxWidth: '800px' }
  };

  return (
    <div
      style={{
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
      }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background: theme.colors.white,
        borderRadius: theme.borderRadius.xl,
        padding: '24px',
        ...sizes[size],
        width: '90%',
        maxHeight: '90vh',
        overflow: 'auto',
        animation: 'slideUp 0.3s'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: 600,
            color: theme.colors.primary,
            margin: 0
          }}>
            {title}
          </h3>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: theme.colors.gray500,
              lineHeight: 1
            }}
          >
            ×
          </button>
        </div>
        {children}
      </div>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

// ==================== TOOLTIP COMPONENT ====================
export const Tooltip = ({ children, text, position = 'top' }) => {
  const [visible, setVisible] = useState(false);

  const positions = {
    top: { bottom: '100%', left: '50%', transform: 'translateX(-50%) translateY(-8px)' },
    bottom: { top: '100%', left: '50%', transform: 'translateX(-50%) translateY(8px)' },
    left: { right: '100%', top: '50%', transform: 'translateY(-50%) translateX(-8px)' },
    right: { left: '100%', top: '50%', transform: 'translateY(-50%) translateX(8px)' }
  };

  return (
    <div
      style={{ position: 'relative', display: 'inline-block' }}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div style={{
          position: 'absolute',
          ...positions[position],
          background: theme.colors.gray800,
          color: theme.colors.white,
          padding: '6px 12px',
          borderRadius: theme.borderRadius.sm,
          fontSize: '12px',
          whiteSpace: 'nowrap',
          zIndex: 1000,
          pointerEvents: 'none'
        }}>
          {text}
          <div style={{
            position: 'absolute',
            ...(position === 'top' && {
              bottom: '-4px',
              left: '50%',
              transform: 'translateX(-50%) rotate(45deg)'
            }),
            ...(position === 'bottom' && {
              top: '-4px',
              left: '50%',
              transform: 'translateX(-50%) rotate(45deg)'
            }),
            ...(position === 'left' && {
              right: '-4px',
              top: '50%',
              transform: 'translateY(-50%) rotate(45deg)'
            }),
            ...(position === 'right' && {
              left: '-4px',
              top: '50%',
              transform: 'translateY(-50%) rotate(45deg)'
            }),
            width: '8px',
            height: '8px',
            background: theme.colors.gray800
          }} />
        </div>
      )}
    </div>
  );
};

// ==================== ALERT COMPONENT ====================
export const Alert = ({ type = 'info', message, onClose }) => {
  const styles = {
    success: {
      bg: '#d1fae5',
      border: '#059669',
      color: '#065f46',
      icon: 'check'
    },
    warning: {
      bg: '#fef3c7',
      border: '#d97706',
      color: '#92400e',
      icon: 'warning'
    },
    danger: {
      bg: '#fee2e2',
      border: '#dc2626',
      color: '#991b1b',
      icon: 'danger'
    },
    info: {
      bg: '#dbeafe',
      border: '#2563eb',
      color: '#1e40af',
      icon: 'info'
    }
  };

  const style = styles[type];

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '12px 16px',
      background: style.bg,
      border: `1px solid ${style.border}`,
      borderRadius: theme.borderRadius.md,
      color: style.color,
      marginBottom: '16px'
    }}>
      <PencilIcon name={style.icon} size={18} color={style.color} />
      <span style={{ flex: 1, fontSize: '14px' }}>{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: style.color,
            cursor: 'pointer',
            fontSize: '18px',
            lineHeight: 1
          }}
        >
          ×
        </button>
      )}
    </div>
  );
};