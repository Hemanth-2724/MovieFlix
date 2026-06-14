import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import TheaterPage from './pages/TheaterPage';
import SeatSelectionPage from './pages/SeatSelectionPage';
import PaymentPage from './pages/PaymentPage';
import ConfirmationPage from './pages/ConfirmationPage';
import ProfilePage from './pages/ProfilePage';
import './index.css';
import './App.css';

// Route wrapper for pages that require authentication
function ProtectedRoute({ children }) {
  const user = localStorage.getItem('movieflix_user');

  useEffect(() => {
    if (!user) {
      toast.error('Please sign in to access this page.');
    }
  }, [user]);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

// Route wrapper to prevent authenticated users from accessing login/register
function GuestRoute({ children }) {
  const user = localStorage.getItem('movieflix_user');
  if (user) {
    return <Navigate to="/" replace />;
  }
  return children;
}

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ScrollToTop />
      {/* Toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          className: 'toast-custom',
          duration: 3500,
          style: {
            background: '#0d1220',
            color: '#f0f0f0',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '12px',
            fontFamily: 'Inter, sans-serif',
          },
          success: { iconTheme: { primary: '#22c55e', secondary: '#fff' } },
          error:   { iconTheme: { primary: '#e63946', secondary: '#fff' } },
        }}
      />

      <Routes>
        {/* Auth routes — no navbar */}
        <Route path="/login"    element={<GuestRoute><LoginPage /></GuestRoute>} />
        <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />

        {/* Protected app routes — with navbar */}
        <Route path="/" element={
          <>
            <Navbar />
            <HomePage />
          </>
        } />
        <Route path="/movie/:movieId/theaters" element={
          <ProtectedRoute>
            <Navbar />
            <TheaterPage />
          </ProtectedRoute>
        } />
        <Route path="/show/:showId/seats" element={
          <ProtectedRoute>
            <Navbar />
            <SeatSelectionPage />
          </ProtectedRoute>
        } />
        <Route path="/payment" element={
          <ProtectedRoute>
            <Navbar />
            <PaymentPage />
          </ProtectedRoute>
        } />
        <Route path="/confirmation/:bookingRef" element={
          <ProtectedRoute>
            <Navbar />
            <ConfirmationPage />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <Navbar />
            <ProfilePage />
          </ProtectedRoute>
        } />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
