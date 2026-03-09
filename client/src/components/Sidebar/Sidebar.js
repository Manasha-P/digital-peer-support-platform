import { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import PencilIcon from '../common/PencilIcon';
import { theme } from '../../styles/theme';

export default function Sidebar({ navItems, notifCount = 0 }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Get user initials for avatar
  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Get user role badge color
  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return { bg: '#fee2e2', color: '#b91c1c' };
      case 'supporter':
        return { bg: '#dcfce7', color: '#166534' };
      default:
        return { bg: '#dbeafe', color: '#1e40af' };
    }
  };

  const roleStyle = getRoleColor(user?.role);

  return (
    <aside style={{
      width: collapsed ? '80px' : '280px',
      height: '100vh',
      background: theme.colors.primary,
      color: theme.colors.white,
      position: 'sticky',
      top: 0,
      left: 0,
      transition: 'width 0.3s',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: theme.shadows.lg,
      zIndex: 100
    }}>
      {/* Logo */}
      <div style={{
        padding: collapsed ? '20px 0' : '24px 20px',
        borderBottom: `1px solid ${theme.colors.primaryLight}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            background: theme.colors.white,
            borderRadius: theme.borderRadius.md,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <PencilIcon name="messages" size={22} color={theme.colors.primary} />
          </div>
          {!collapsed && (
            <span style={{
              fontSize: '18px',
              fontWeight: 700,
              color: theme.colors.white
            }}>
              PeerBridge
            </span>
          )}
        </div>
        
        {!collapsed && (
          <button
            onClick={() => setCollapsed(true)}
            style={{
              background: 'none',
              border: 'none',
              color: theme.colors.white,
              cursor: 'pointer',
              opacity: 0.7,
              padding: '4px'
            }}
          >
            <PencilIcon name="arrow-left" size={18} color={theme.colors.white} />
          </button>
        )}
        
        {collapsed && (
          <button
            onClick={() => setCollapsed(false)}
            style={{
              background: 'none',
              border: 'none',
              color: theme.colors.white,
              cursor: 'pointer',
              opacity: 0.7,
              padding: '4px',
              position: 'absolute',
              right: '-10px',
              backgroundColor: theme.colors.primary,
              borderRadius: '50%',
              width: '24px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: theme.shadows.md
            }}
          >
            <PencilIcon name="arrow-right" size={14} color={theme.colors.white} />
          </button>
        )}
      </div>

      {/* User Info */}
      {!collapsed && (
        <div style={{
          padding: '20px',
          borderBottom: `1px solid ${theme.colors.primaryLight}`,
          display: 'flex',
          gap: '12px',
          alignItems: 'center'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: theme.borderRadius.md,
            background: theme.colors.white,
            color: theme.colors.primary,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px',
            fontWeight: 600
          }}>
            {getInitials(user?.name)}
          </div>
          <div>
            <div style={{
              fontWeight: 600,
              fontSize: '14px',
              color: theme.colors.white,
              marginBottom: '2px'
            }}>
              {user?.name || 'User'}
            </div>
            <div style={{
              fontSize: '12px',
              color: 'rgba(255,255,255,0.7)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <span style={{
                padding: '2px 8px',
                background: roleStyle.bg,
                color: roleStyle.color,
                borderRadius: theme.borderRadius.full,
                fontSize: '10px',
                fontWeight: 600
              }}>
                {user?.role || 'user'}
              </span>
              <span className="status-dot online" />
            </div>
          </div>
        </div>
      )}

      {/* Navigation Items */}
      <nav style={{
        flex: 1,
        overflowY: 'auto',
        padding: collapsed ? '20px 0' : '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px'
      }}>
        {navItems.map((item) => {
          // Determine if this item is active based on current location
          const isActive = location.pathname === item.path || 
                          (item.end ? false : location.pathname.startsWith(item.path));
          
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              style={({ isActive: navLinkActive }) => {
                // Use either navLinkActive from NavLink OR our own isActive check
                const active = navLinkActive || isActive;
                
                return {
                  display: 'flex',
                  alignItems: 'center',
                  gap: collapsed ? '0' : '12px',
                  padding: collapsed ? '12px 0' : '12px 16px',
                  borderRadius: theme.borderRadius.md,
                  color: active ? theme.colors.white : 'rgba(255,255,255,0.7)',
                  background: active ? 'rgba(255,255,255,0.1)' : 'transparent',
                  textDecoration: 'none',
                  transition: 'all 0.2s',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  position: 'relative'
                };
              }}
            >
              <PencilIcon 
                name={item.icon} 
                size={20} 
                color={isActive ? theme.colors.white : 'rgba(255,255,255,0.7)'} 
              />
              {!collapsed && (
                <>
                  <span style={{
                    fontSize: '14px',
                    fontWeight: isActive ? 600 : 400
                  }}>
                    {item.label}
                  </span>
                  {item.path.includes('notifications') && notifCount > 0 && (
                    <span style={{
                      marginLeft: 'auto',
                      background: theme.colors.warning,
                      color: theme.colors.white,
                      padding: '2px 8px',
                      borderRadius: theme.borderRadius.full,
                      fontSize: '11px',
                      fontWeight: 600
                    }}>
                      {notifCount}
                    </span>
                  )}
                </>
              )}
              {collapsed && item.path.includes('notifications') && notifCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '4px',
                  right: '4px',
                  width: '16px',
                  height: '16px',
                  background: theme.colors.warning,
                  borderRadius: '50%',
                  color: theme.colors.white,
                  fontSize: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {notifCount}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div style={{
        padding: collapsed ? '20px 0' : '20px',
        borderTop: `1px solid ${theme.colors.primaryLight}`
      }}>
        <button
          onClick={handleLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: collapsed ? '0' : '12px',
            padding: collapsed ? '12px 0' : '12px 16px',
            width: '100%',
            borderRadius: theme.borderRadius.md,
            color: 'rgba(255,255,255,0.7)',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            justifyContent: collapsed ? 'center' : 'flex-start'
          }}
        >
          <PencilIcon name="logout" size={20} color="rgba(255,255,255,0.7)" />
          {!collapsed && <span style={{ fontSize: '14px' }}>Logout</span>}
        </button>
      </div>
    </aside>
  );
}