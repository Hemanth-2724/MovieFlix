import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import TheaterPage from './pages/TheaterPage';
import SeatSelectionPage from './pages/SeatSelectionPage';
import PaymentPage from './pages/PaymentPage';
import ConfirmationPage from './pages/ConfirmationPage';
import './index.css';
import './App.css';

function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
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
        <Route path="/login"    element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected app routes — with navbar */}
        <Route path="/" element={
          <>
            <Navbar />
            <HomePage />
          </>
        } />
        <Route path="/movie/:movieId/theaters" element={
          <>
            <Navbar />
            <TheaterPage />
          </>
        } />
        <Route path="/show/:showId/seats" element={
          <>
            <Navbar />
            <SeatSelectionPage />
          </>
        } />
        <Route path="/payment" element={
          <>
            <Navbar />
            <PaymentPage />
          </>
        } />
        <Route path="/confirmation/:bookingRef" element={
          <>
            <Navbar />
            <ConfirmationPage />
          </>
        } />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
