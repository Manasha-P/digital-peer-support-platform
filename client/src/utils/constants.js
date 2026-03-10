// User Types
export const USER_TYPES = [
  'College Student',
  'High School Student',
  'Working Professional',
  'Graduate Student',
  'Other'
];

// Topics by User Type
export const TOPICS_BY_USER_TYPE = {
  'College Student': [
    'Academic Stress', 
    'Exam Anxiety', 
    'Placement Preparation', 
    'Coding/Programming',
    'Project Guidance', 
    'Time Management', 
    'Hostel Life', 
    'Peer Pressure',
    'Career Confusion', 
    'Internship Search', 
    'CGPA Improvement', 
    'Study Techniques',
    'College Relationships', 
    'Financial Stress', 
    'Future Planning'
  ],
  'High School Student': [
    'Board Exam Stress', 
    'Career Selection', 
    'Subject Difficulty', 
    'Parental Pressure',
    'Study Motivation', 
    'Time Management', 
    'Peer Comparison', 
    'College Admissions',
    'Entrance Exams', 
    'Self-esteem', 
    'Bullying', 
    'Future Anxiety',
    'Learning Techniques', 
    'School Relationships', 
    'Extracurricular Balance'
  ],
  'Working Professional': [
    'Work Stress', 
    'Burnout', 
    'Career Growth', 
    'Work-Life Balance',
    'Job Satisfaction', 
    'Office Politics', 
    'Salary Negotiation', 
    'Job Switch',
    'Workplace Relationships', 
    'Imposter Syndrome', 
    'Skill Development',
    'Remote Work Challenges', 
    'Work Anxiety', 
    'Professional Boundaries', 
    'Leadership Pressure'
  ],
  'Graduate Student': [
    'Research Stress', 
    'Thesis Anxiety', 
    'Publication Pressure', 
    'PhD Challenges',
    'Lab Work', 
    'Supervisor Issues', 
    'Funding Worries', 
    'Academic Burnout',
    'Future in Academia', 
    'Work-Study Balance', 
    'Research Isolation', 
    'Conference Prep',
    'Networking Stress', 
    'Post-grad Plans', 
    'Imposter Syndrome'
  ],
  'Other': [
    'Anxiety', 
    'Depression', 
    'Stress', 
    'Relationships', 
    'Family Issues',
    'Self-esteem', 
    'Grief', 
    'Loneliness', 
    'Life Transitions', 
    'Personal Growth',
    'Mindfulness', 
    'Motivation', 
    'Identity', 
    'Purpose', 
    'General Support'
  ]
};

// File upload constants
export const FILE_UPLOAD = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: [
    'image/jpeg', 
    'image/png', 
    'image/gif', 
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ]
};

// Session status constants
export const SESSION_STATUS = {
  PENDING: 'pending',
  UPCOMING: 'upcoming',
  COMPLETED: 'completed',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled'
};

// Notification types
export const NOTIFICATION_TYPES = {
  SESSION_REQUEST: 'session_request',
  SESSION_UPDATE: 'session_update',
  MESSAGE: 'message',
  APPROVAL: 'approval',
  SUPPORTER_APPLICATION: 'supporter_application'
};

// Message Events for Socket.io
export const MESSAGE_EVENTS = {
  CONNECT: 'connection',
  DISCONNECT: 'disconnect',
  JOIN: 'join',
  SEND_MESSAGE: 'sendMessage',
  RECEIVE_MESSAGE: 'receiveMessage',
  TYPING: 'typing',
  STOP_TYPING: 'stopTyping',
  READ: 'read'
};

// Session Durations (in minutes)
export const SESSION_DURATIONS = [30, 45, 60];

// Rating Scale
export const RATING = {
  MIN: 1,
  MAX: 5,
  DEFAULT: 0
};