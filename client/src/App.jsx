import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout       from './components/Layout';
import LoginPage    from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage   from './pages/DashboardPage';
import KidProfilePage  from './pages/KidProfilePage';
import ActivitiesPage  from './pages/ActivitiesPage';
import ProfilePage     from './pages/ProfilePage';
import './index.css';

function Guard({ auth, children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="loading-screen">
      <div className="spinner" /><p>Loading KidPoints…</p>
    </div>
  );
  if (auth && !user) return <Navigate to="/login" replace />;
  if (!auth && user) return <Navigate to="/dashboard" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login"    element={<Guard auth={false}><LoginPage /></Guard>} />
      <Route path="/register" element={<Guard auth={false}><RegisterPage /></Guard>} />
      <Route path="/" element={<Guard auth={true}><Layout /></Guard>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard"  element={<DashboardPage />} />
        <Route path="kids/:id"   element={<KidProfilePage />} />
        <Route path="activities" element={<ActivitiesPage />} />
        <Route path="profile"    element={<ProfilePage />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster position="top-center"
          toastOptions={{ style: { fontFamily:'Nunito,sans-serif', fontWeight:700, borderRadius:12, fontSize:14 },
            success: { iconTheme:{ primary:'#00b894', secondary:'#fff' } },
            error:   { iconTheme:{ primary:'#e17055', secondary:'#fff' } } }} />
      </BrowserRouter>
    </AuthProvider>
  );
}
