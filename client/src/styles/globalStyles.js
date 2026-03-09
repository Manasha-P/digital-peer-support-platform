import { theme } from './theme';

export const globalStyles = {
  // Container styles
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 24px',
  },
  
  // Card styles
  card: {
    background: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: '24px',
    border: `1px solid ${theme.colors.gray200}`,
    boxShadow: theme.shadows.md,
  },
  
  // Button styles
  button: {
    primary: {
      background: theme.colors.primary,
      color: theme.colors.white,
      border: 'none',
      borderRadius: theme.borderRadius.md,
      padding: '12px 24px',
      fontSize: '14px',
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'all 0.2s',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
    },
    secondary: {
      background: theme.colors.white,
      color: theme.colors.primary,
      border: `1px solid ${theme.colors.primary}`,
      borderRadius: theme.borderRadius.md,
      padding: '12px 24px',
      fontSize: '14px',
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'all 0.2s',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
    },
    outline: {
      background: 'transparent',
      color: theme.colors.gray700,
      border: `1px solid ${theme.colors.gray300}`,
      borderRadius: theme.borderRadius.md,
      padding: '10px 20px',
      fontSize: '14px',
      cursor: 'pointer',
      transition: 'all 0.2s',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
    },
  },
  
  // Typography
  typography: {
    h1: {
      fontSize: '48px',
      fontWeight: 700,
      color: theme.colors.primary,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '36px',
      fontWeight: 700,
      color: theme.colors.primary,
      lineHeight: 1.3,
    },
    h3: {
      fontSize: '24px',
      fontWeight: 600,
      color: theme.colors.primary,
      lineHeight: 1.4,
    },
    body: {
      fontSize: '16px',
      color: theme.colors.gray700,
      lineHeight: 1.6,
    },
    small: {
      fontSize: '14px',
      color: theme.colors.gray600,
    },
  },
};