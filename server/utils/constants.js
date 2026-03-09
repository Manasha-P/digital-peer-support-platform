// User Roles
const ROLES = { 
  USER: 'user', 
  SUPPORTER: 'supporter', 
  ADMIN: 'admin' 
};

// Session Status
const SESSION_STATUS = {
  PENDING: 'pending', 
  UPCOMING: 'upcoming', 
  COMPLETED: 'completed',
  REJECTED: 'rejected', 
  CANCELLED: 'cancelled'
};

// User Types for Registration
const USER_TYPES = [
  'College Student',
  'High School Student',
  'Working Professional',
  'Graduate Student',
  'Other'
];

// Support Topics for Supporters
const SUPPORT_TOPICS = [
  'Anxiety', 
  'Depression', 
  'Stress', 
  'Relationships', 
  'Academic',
  'Career', 
  'Loneliness', 
  'Grief', 
  'Self-esteem', 
  'Mindfulness', 
  'Family', 
  'Burnout'
];

// Notification Types
const NOTIFICATION_TYPES = {
  SESSION_REQUEST: 'session_request', 
  SESSION_UPDATE: 'session_update',
  MESSAGE: 'message', 
  APPROVAL: 'approval', 
  SUPPORTER_APPLICATION: 'supporter_application'
};

// Message Events for Socket.io
const MESSAGE_EVENTS = {
  CONNECT: 'connection',
  DISCONNECT: 'disconnect',
  JOIN: 'join',
  SEND_MESSAGE: 'sendMessage',
  RECEIVE_MESSAGE: 'receiveMessage',
  TYPING: 'typing',
  STOP_TYPING: 'stopTyping',
  READ: 'read'
};

// Pagination Defaults
const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100
};

// Time Constants (in milliseconds)
const TIME = {
  ONE_MINUTE: 60 * 1000,
  ONE_HOUR: 60 * 60 * 1000,
  ONE_DAY: 24 * 60 * 60 * 1000,
  ONE_WEEK: 7 * 24 * 60 * 60 * 1000,
  ONE_MONTH: 30 * 24 * 60 * 60 * 1000
};

// Session Durations (in minutes)
const SESSION_DURATIONS = [30, 45, 60];

// Rating Scale
const RATING = {
  MIN: 1,
  MAX: 5,
  DEFAULT: 0
};

// Export all constants
module.exports = { 
  ROLES, 
  SESSION_STATUS, 
  USER_TYPES, 
  SUPPORT_TOPICS, 
  NOTIFICATION_TYPES,
  MESSAGE_EVENTS,
  PAGINATION,
  TIME,
  SESSION_DURATIONS,
  RATING
};