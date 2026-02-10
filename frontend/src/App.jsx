import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { PrivateRoute } from './components/common/PrivateRoute';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Dashboard } from './pages/Dashboard';
import { WorkLogForm } from './pages/WorkLogForm';
import { MyWorkLogs } from './pages/MyWorkLogs';
import { AdminDashboard } from './pages/AdminDashboard';
import { FilterWorkLogs } from './pages/FilterWorkLogs';
import { AdminProjects } from './pages/AdminProjects';
import { FeaturesPage } from './pages/FeaturesPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/worklogs" element={<PrivateRoute><MyWorkLogs /></PrivateRoute>} />
          <Route path="/worklogs/new" element={<PrivateRoute><WorkLogForm /></PrivateRoute>} />
          <Route path="/worklogs/:id/edit" element={<PrivateRoute><WorkLogForm /></PrivateRoute>} />
          <Route path="/features" element={<PrivateRoute><FeaturesPage /></PrivateRoute>} />
          <Route path="/admin" element={<PrivateRoute requireAdmin><AdminDashboard /></PrivateRoute>} />
          <Route path="/admin/worklogs" element={<PrivateRoute requireAdmin><FilterWorkLogs /></PrivateRoute>} />
          <Route path="/admin/analytics" element={<PrivateRoute requireAdmin><AnalyticsPage /></PrivateRoute>} />
          <Route path="/admin/projects" element={<PrivateRoute requireAdmin><AdminProjects /></PrivateRoute>} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
