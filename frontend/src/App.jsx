import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { PrivateRoute } from './components/common/PrivateRoute';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Dashboard } from './pages/Dashboard';
import { WorkLogForm } from './pages/WorkLogForm';
import { AllWorkLogs } from './pages/AllWorkLogs';
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
          <Route path="/worklogs" element={<PrivateRoute><AllWorkLogs /></PrivateRoute>} />
          <Route path="/worklogs/new" element={<PrivateRoute><WorkLogForm /></PrivateRoute>} />
          <Route path="/worklogs/:id/edit" element={<PrivateRoute><WorkLogForm /></PrivateRoute>} />
          <Route path="/features" element={<PrivateRoute><FeaturesPage /></PrivateRoute>} />
          <Route path="/admin" element={<PrivateRoute requireAdmin><Navigate to="/dashboard" replace /></PrivateRoute>} />
          <Route path="/admin/analytics" element={<PrivateRoute requireAdmin><AnalyticsPage /></PrivateRoute>} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
