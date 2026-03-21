import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from "@/components/ui/sonner";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

// Pages
import OTPLogin from './pages/Auth/OTPLogin';
import OTPVerification from './pages/Auth/OTPVerification';
import Analyze from './pages/Analyze/Analyze';
import AnalysisResults from './pages/Analyze/AnalysisResults';
import Dashboard from './pages/Dashboard/Dashboard';
import MyPapers from './pages/Papers/MyPapers';
import Profile from './pages/Profile/Profile';
import SharedAnalysis from './pages/Shared/SharedAnalysis';
import Layout from './components/layout/Layout';

function ProtectedRoute({ children, session }) {
  const isGuest = localStorage.getItem('guestMode') === 'true';
  if (!session && !isGuest) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return null; // Or a loading spinner
  }

  return (
    <Router>
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={session ? <Navigate to="/" replace /> : <OTPLogin />} />
        <Route path="/verify" element={session ? <Navigate to="/" replace /> : <OTPVerification />} />

        {/* Protected Routes */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute session={session}>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/analyze" 
          element={
            <ProtectedRoute session={session}>
              <Layout>
                <Analyze />
              </Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/analyze/:id" 
          element={
            <ProtectedRoute session={session}>
              <Layout>
                <AnalysisResults />
              </Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/papers" 
          element={
            <ProtectedRoute session={session}>
              <Layout>
                <MyPapers />
              </Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute session={session}>
              <Layout>
                <Profile />
              </Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/shared/:id" 
          element={<SharedAnalysis />} 
        />
        {/* Placeholder for other routes to build later */}
      </Routes>
      <Toaster />
    </Router>
  );
}

export default App;
