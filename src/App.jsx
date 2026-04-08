import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import PrivateRoute from './components/PrivateRoute';

// Lazy load pages for performance
const LandingPage = lazy(() => import('./pages/LandingPage'));
const JoinForm = lazy(() => import('./pages/JoinForm'));
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const MembersList = lazy(() => import('./pages/MembersList'));
const MemberDetail = lazy(() => import('./pages/MemberDetail'));
const Settings = lazy(() => import('./pages/Settings'));
const BackupRedirect = lazy(() => import('./pages/BackupRedirect'));

// Basic Loading Component
const LoadingUI = () => (
    <div className="flex items-center justify-center h-screen bg-warm-white">
        <div className="animate-spin md:h-12 md:w-12 h-10 w-10 border-t-2 border-b-2 border-lalabapa-red"></div>
    </div>
);

function App() {
  return (
    <Router>
      <Suspense fallback={<LoadingUI />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/join" element={<JoinForm />} />
          
          {/* Admin Routes (Protected) */}
          <Route path="/pap/login" element={<AdminLogin />} />
          
          <Route path="/pap" element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />
          <Route path="/pap/members" element={<PrivateRoute><MembersList /></PrivateRoute>} />
          <Route path="/pap/members/:id" element={<PrivateRoute><MemberDetail /></PrivateRoute>} />
          <Route path="/pap/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
          
          {/* Internal/Backup Control */}
          <Route path="/backup" element={<BackupRedirect />} />
          
          {/* 404 Redirect or Not Found */}
          <Route path="*" element={<div className="p-10 text-center">404 - Not Found</div>} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
