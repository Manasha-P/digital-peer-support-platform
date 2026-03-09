import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Context
import { AuthProvider } from './context/AuthContext';

// Auth Pages
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import RoleSelectPage from './pages/Auth/RoleSelectPage';
import UserTypePage from './pages/Auth/UserTypePage';
import WaitingApprovalPage from './pages/Auth/WaitingApprovalPage';

// Dashboard Pages
import AdminDashboard from './pages/dashboards/AdminDashboard';
import SupporterDashboard from './pages/dashboards/SupporterDashboard';
import UserDashboard from './pages/dashboards/UserDashboard';

// Other Pages
import LandingPage from './pages/LandingPage';

// Components
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/role-select" element={<RoleSelectPage />} />
          <Route path="/register/user" element={<RegisterPage />} />
          <Route path="/register/supporter" element={<RegisterPage />} />
          <Route path="/user-type" element={<UserTypePage />} />
          <Route path="/waiting-approval" element={<WaitingApprovalPage />} />

          {/* Protected Routes */}
          <Route path="/dashboard/*" element={
            <PrivateRoute allowedRoles={['user']}>
              <UserDashboard />
            </PrivateRoute>
          } />
          
          <Route path="/supporter/*" element={
            <PrivateRoute allowedRoles={['supporter']}>
              <SupporterDashboard />
            </PrivateRoute>
          } />
          
          <Route path="/admin/*" element={
            <PrivateRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </PrivateRoute>
          } />

          {/* Fallback Route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
        />
      </div>
    </AuthProvider>
  );
}

export default App;