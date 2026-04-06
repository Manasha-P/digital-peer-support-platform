import axios from 'axios';
import { toast } from 'react-toastify';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 60000
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      toast.error('Request timeout. Please check your connection.');
    } else if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      toast.error('Session expired. Please login again.');
    } else if (error.response?.status === 403) {
      toast.error(error.response.data?.message || 'You do not have permission');
    } else if (error.response?.status === 404) {
      console.log('API 404:', error.config.url);
    } else if (error.response?.status === 500) {
      toast.error('Server error. Please try again later.');
    }
    return Promise.reject(error);
  }
);

// ==================== AUTH API ====================
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  googleAuth: (data) => api.post('/auth/google', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
  setRole: (role) => api.put('/auth/set-role', { role }),
  setUserType: (userType) => api.put('/auth/set-user-type', { userType }),
};

// ==================== USER API ====================
export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  getNotifications: () => api.get('/users/notifications'),
  markNotificationRead: (id) => api.put(`/users/notifications/${id}/read`),
  markAllNotificationsRead: () => api.put('/users/notifications/read-all'),
  getSupporters: () => api.get('/users/supporters')
};

// ==================== SESSION API ====================
export const sessionAPI = {
  // User endpoints
  getMySessions: () => api.get('/sessions'),
  bookSession: (data) => api.post('/sessions', data),
  rateSession: (id, data) => api.post(`/sessions/${id}/rate`, data),
  
  // NEW: Live Session Management
  startLiveSession: (id) => api.put(`/sessions/${id}/start-live`),
  extendSession: (id, data) => api.post(`/sessions/${id}/extend`, data),
  endSessionEarly: (id) => api.post(`/sessions/${id}/end-session`),
  getLiveSessionStatus: (id) => api.get(`/sessions/${id}/live-status`),
  getFeedbackQRCode: (id) => api.get(`/sessions/${id}/feedback-qr`),
  submitFeedbackByToken: (token, data) => api.post(`/sessions/feedback/${token}`, data),
  
  // Supporter endpoints
  getPendingSessions: () => api.get('/sessions/pending'),
  acceptSession: (id) => api.put(`/sessions/${id}/accept`),
  rejectSession: (id) => api.put(`/sessions/${id}/reject`),
  completeSession: (id) => api.put(`/sessions/${id}/complete`),
  
  // NEW: Extension Management (Supporter)
  approveExtension: (id, data) => api.post(`/sessions/${id}/approve-extension`, data),
  rejectExtension: (id) => api.post(`/sessions/${id}/reject-extension`),
  
  // Common endpoints
  getSupporters: () => api.get('/sessions/supporters'),
  getAvailableSupporters: (params) => api.get('/sessions/available-supporters', { params }),
  getSessionDetails: (id) => api.get(`/sessions/${id}`),
  updateStatus: (id, status) => api.put(`/sessions/${id}/status`, { status })
};

// ==================== MESSAGE API ====================
export const messageAPI = {
  getConversations: () => api.get('/messages/conversations'),
  getConversation: (userId) => api.get(`/messages/conversation/${userId}`),
  sendMessage: (data) => api.post('/messages', data),
  markAsRead: (messageId) => api.put(`/messages/${messageId}/read`),
  deleteMessage: (messageId) => api.delete(`/messages/${messageId}`)
};

// ==================== ADMIN API ====================
export const adminAPI = {
  // Dashboard
  getStats: () => api.get('/admin/stats'),
  getRecentActivities: () => api.get('/admin/activities'),
  
  // Supporter management
  getPendingSupporters: () => api.get('/admin/supporters/pending'),
  approveSupporter: (id) => api.put(`/admin/supporters/${id}/approve`),
  rejectSupporter: (id) => api.put(`/admin/supporters/${id}/reject`),
  
  // User management
  getUsers: (params) => api.get('/admin/users', { params }),
  toggleUserActive: (id) => api.put(`/admin/users/${id}/toggle`),
  
  // Session management
  getAllSessions: () => api.get('/admin/sessions'),
  getSessionStats: (period) => api.get('/admin/sessions/stats', { params: { period } }),
  
  // Settings
  getSettings: () => api.get('/admin/settings'),
  updateSettings: (data) => api.put('/admin/settings', data)
};

export default api;