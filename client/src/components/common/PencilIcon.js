import React from 'react';

// Hand-drawn style SVG icons
const PencilIcon = ({ name, size = 24, color = 'currentColor', strokeWidth = 1.5 }) => {
  const icons = {
    // Dashboard & Navigation
    dashboard: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 4H10V10H4V4Z" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <path d="M14 4H20V10H14V4Z" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <path d="M4 14H10V20H4V14Z" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <path d="M14 14H20V20H14V14Z" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      </svg>
    ),
    
    find: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="11" cy="11" r="7" stroke={color} strokeWidth={strokeWidth} fill="none"/>
        <path d="M16 16L21 21" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
      </svg>
    ),
    
    sessions: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="4" width="18" height="16" rx="2" stroke={color} strokeWidth={strokeWidth} fill="none"/>
        <path d="M8 2V6" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
        <path d="M16 2V6" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
        <path d="M3 10H21" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
        <circle cx="12" cy="15" r="1" fill={color} />
        <circle cx="16" cy="15" r="1" fill={color} />
        <circle cx="8" cy="15" r="1" fill={color} />
      </svg>
    ),
    
    messages: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      </svg>
    ),
    
    notifications: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <path d="M9 17V18C9 18.7956 9.31607 19.5587 9.87868 20.1213C10.4413 20.6839 11.2044 21 12 21C12.7956 21 13.5587 20.6839 14.1213 20.1213C14.6839 19.5587 15 18.7956 15 18V17" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      </svg>
    ),
    
    settings: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="3" stroke={color} strokeWidth={strokeWidth} fill="none"/>
        <path d="M19.4 15C19.1126 15.6266 18.9512 16.0334 19.4 16.6L19.5 16.7C19.8655 17.1531 20.0691 17.7162 20.0771 18.3001C20.0852 18.884 19.8974 19.4527 19.5444 19.916C19.1914 20.3794 18.6962 20.7091 18.1332 20.8482C17.5702 20.9873 16.976 20.9272 16.45 20.677L16.1 20.5C15.4734 20.2126 15.0666 20.0512 14.5 20.5H14.4C13.8334 20.9488 13.4266 20.7874 12.8 20.5L12.5 20.3C11.9 19.9 11.5 19.9 10.9 20.3L10.6 20.5C9.97343 20.7874 9.56657 20.9488 9 20.5H8.9C8.33343 20.0512 7.92657 20.2126 7.3 20.5L6.95 20.7C6.4286 20.953 5.83732 21.0149 5.27569 20.876C4.71406 20.7371 4.22033 20.4059 3.86977 19.9398C3.51922 19.4737 3.33583 18.9017 3.3516 18.3174C3.36737 17.7331 3.58136 17.1717 3.956 16.725L4.1 16.5C4.4 15.9 4.4 15.5 4.1 14.9L3.9 14.5C3.6 13.9 3.6 13.5 3.9 12.9L4.1 12.5C4.4 11.9 4.4 11.5 4.1 10.9L3.9 10.5C3.6 9.9 3.6 9.5 3.9 8.9L4.1 8.5C4.4 7.9 4.4 7.5 4.1 6.9L3.9 6.5C3.6 5.9 3.6 5.5 3.9 4.9L4.1 4.5C4.4 3.9 4.8 3.5 5.4 3.2L5.8 3C6.4 2.7 6.8 2.7 7.4 3L7.8 3.2C8.4 3.5 8.8 3.5 9.4 3.2L9.8 3C10.4 2.7 10.8 2.7 11.4 3L11.8 3.2C12.4 3.5 12.8 3.5 13.4 3.2L13.8 3C14.4 2.7 14.8 2.7 15.4 3L15.8 3.2C16.4 3.5 16.8 3.9 17.1 4.5L17.3 4.9C17.6 5.5 17.6 5.9 17.3 6.5L17.1 6.9C16.8 7.5 16.8 7.9 17.1 8.5L17.3 8.9C17.6 9.5 17.6 9.9 17.3 10.5L17.1 10.9C16.8 11.5 16.8 11.9 17.1 12.5L17.3 12.9C17.6 13.5 17.6 13.9 17.3 14.5L17.1 14.9C16.8 15.5 16.8 15.9 17.1 16.5L17.3 16.9C17.6 17.5 17.6 17.9 17.3 18.5L17.1 18.9" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" fill="none"/>
      </svg>
    ),
    
    // Stats icons
    total: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="3" width="18" height="18" rx="2" stroke={color} strokeWidth={strokeWidth} fill="none"/>
        <path d="M8 16V8" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
        <path d="M12 16V12" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
        <path d="M16 16V10" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
      </svg>
    ),
    
    upcoming: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="4" width="18" height="16" rx="2" stroke={color} strokeWidth={strokeWidth} fill="none"/>
        <path d="M3 10H21" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
        <path d="M8 2V6" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
        <path d="M16 2V6" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
        <circle cx="12" cy="16" r="2" stroke={color} strokeWidth={strokeWidth} fill="none"/>
      </svg>
    ),
    
    completed: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="9" stroke={color} strokeWidth={strokeWidth} fill="none"/>
        <path d="M8 12L11 15L16 9" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    
    pending: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="9" stroke={color} strokeWidth={strokeWidth} fill="none"/>
        <path d="M12 7V12L15 15" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
      </svg>
    ),
    
    // Session icons
    calendar: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="4" width="18" height="16" rx="2" stroke={color} strokeWidth={strokeWidth} fill="none"/>
        <path d="M3 10H21" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
        <path d="M8 2V6" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
        <path d="M16 2V6" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
      </svg>
    ),
    
    clock: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="9" stroke={color} strokeWidth={strokeWidth} fill="none"/>
        <path d="M12 7V12L15 15" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
      </svg>
    ),
    
    duration: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="9" stroke={color} strokeWidth={strokeWidth} fill="none"/>
        <path d="M12 7V12H17" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
      </svg>
    ),
    
    // Action icons
    book: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="4" width="18" height="16" rx="2" stroke={color} strokeWidth={strokeWidth} fill="none"/>
        <path d="M12 8V16" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
        <path d="M8 12H16" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
      </svg>
    ),
    
    message: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      </svg>
    ),
    
    cancel: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="9" stroke={color} strokeWidth={strokeWidth} fill="none"/>
        <path d="M15 9L9 15" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
        <path d="M9 9L15 15" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
      </svg>
    ),
    
    check: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 6L9 17L4 12" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    
    cross: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M18 6L6 18" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
        <path d="M6 6L18 18" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
      </svg>
    ),
    
    // Wellness icons
    mood: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="9" stroke={color} strokeWidth={strokeWidth} fill="none"/>
        <circle cx="9" cy="9" r="1" fill={color} />
        <circle cx="15" cy="9" r="1" fill={color} />
        <path d="M8 14C8 14 10 16 12 16C14 16 16 14 16 14" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
      </svg>
    ),
    
    stress: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="9" stroke={color} strokeWidth={strokeWidth} fill="none"/>
        <path d="M8 9L10 11L8 13" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
        <path d="M16 9L14 11L16 13" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
        <path d="M12 15V17" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
      </svg>
    ),
    
    sleep: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="9" stroke={color} strokeWidth={strokeWidth} fill="none"/>
        <path d="M17 12C17 9.23858 14.7614 7 12 7C9.23858 7 7 9.23858 7 12" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
        <circle cx="9" cy="15" r="1" fill={color} />
        <circle cx="15" cy="15" r="1" fill={color} />
      </svg>
    ),
    
    wellness: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.27 2 8.5C2 5.41 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.08C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.41 22 8.5C22 12.27 18.6 15.36 13.45 20.03L12 21.35Z" stroke={color} strokeWidth={strokeWidth} fill="none"/>
      </svg>
    ),
    
    // Rating icons
    star: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      </svg>
    ),
    
    // Empty state
    empty: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="9" stroke={color} strokeWidth={strokeWidth} fill="none" strokeDasharray="2 2"/>
        <circle cx="9" cy="9" r="1" fill={color} />
        <circle cx="15" cy="9" r="1" fill={color} />
        <path d="M8 14C8 14 10 16 12 16C14 16 16 14 16 14" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
      </svg>
    ),
    
    // Navigation icons
    'arrow-left': (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M19 12H5" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
        <path d="M12 5L5 12L12 19" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    
    'arrow-right': (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M5 12H19" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
        <path d="M12 5L19 12L12 19" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    
    logout: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M16 17L21 12L16 7" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M21 12H9" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
      </svg>
    ),
    
    // Academic icons
    academic: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 4L3 8L12 12L21 8L12 4Z" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M18 10V16C18 16 15 18 12 18C9 18 6 16 6 16V10" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M20 12V16" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
      </svg>
    ),
    
    school: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 9L12 3L21 9L12 15L3 9Z" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M9 12L12 14L15 12" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M7 17V12L12 15L17 12V17" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    
    graduate: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M22 10V16" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
        <path d="M2 10L12 4L22 10L12 16L2 10Z" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M6 12V16C6 16 8 18 12 18C16 18 18 16 18 16V12" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M18 16V20" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
      </svg>
    ),
    
    career: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="7" width="20" height="14" rx="2" stroke={color} strokeWidth={strokeWidth} fill="none"/>
        <path d="M16 21V19C16 17.8954 15.1046 17 14 17H10C8.89543 17 8 17.8954 8 19V21" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
        <path d="M12 11V13" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
        <path d="M8 7V5C8 3.89543 8.89543 3 10 3H14C15.1046 3 16 3.89543 16 5V7" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
      </svg>
    ),
    
    other: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="9" stroke={color} strokeWidth={strokeWidth} fill="none"/>
        <circle cx="9" cy="9" r="1.5" fill={color} />
        <circle cx="15" cy="9" r="1.5" fill={color} />
        <path d="M9 15C9 15 10.5 17 12 17C13.5 17 15 15 15 15" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
      </svg>
    ),
    
    // Alert icons
    warning: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 9V13" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
        <path d="M12 17H12.01" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
        <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke={color} strokeWidth={strokeWidth}/>
      </svg>
    ),
    
    info: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="9" stroke={color} strokeWidth={strokeWidth} fill="none"/>
        <path d="M12 8V12" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
        <path d="M12 16H12.01" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
      </svg>
    ),
    
    danger: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="9" stroke={color} strokeWidth={strokeWidth} fill="none"/>
        <path d="M15 9L9 15" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
        <path d="M9 9L15 15" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
      </svg>
    ),
    
    eye: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke={color} strokeWidth={strokeWidth} fill="none"/>
        <circle cx="12" cy="12" r="3" stroke={color} strokeWidth={strokeWidth} fill="none"/>
      </svg>
    ),
    
    'eye-off': (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M2 2L22 22" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
        <path d="M6.71277 6.7226C3.66479 8.79527 2 12 2 12C2 12 5.63636 19 12 19C14.0503 19 15.8174 18.2734 17.2711 17.2884" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
        <path d="M9.87868 9.87868C9.33579 10.4216 9 11.1716 9 12C9 13.6569 10.3431 15 12 15C12.8284 15 13.5784 14.6642 14.1213 14.1213" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
      </svg>
    ),
  };

  return icons[name] || null;
};

export default PencilIcon;