import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Ticket, PartyPopper, Check, CreditCard, Calendar, Clock, Armchair, DollarSign, User, Mail, Info, Printer, Film } from 'lucide-react';
import { getBookingByRef } from '../api';

// Confetti burst on mount
function Confetti() {
  const colors = ['#e63946','#ffd60a','#22c55e','#3b82f6','#a855f7','#f59e0b'];
  const dots = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    color: colors[i % colors.length],
    left: Math.random() * 100,
    delay: Math.random() * 1.5,
    duration: 2 + Math.random() * 2,
  }));

  return (
    <>
      {dots.map(d => (
        <div key={d.id} className="confetti-dot" style={{
          background: d.color,
          left: `${d.left}%`,
          animationDuration: `${d.duration}s`,
          animationDelay: `${d.delay}s`,
          top: 0,
        }} />
      ))}
    </>
  );
}

export default function ConfirmationPage() {
  const { bookingRef } = useParams();
  const navigate       = useNavigate();
  const location       = useLocation();

  const [booking, setBooking] = useState(location.state?.booking || null);
  const [movie,   setMovie]   = useState(location.state?.movie || null);
  const [loading, setLoading] = useState(!booking);
  const [confetti, setConfetti] = useState(true);

  useEffect(() => {
    if (!booking && bookingRef) loadBooking();
    const t = setTimeout(() => setConfetti(false), 4000);
    return () => clearTimeout(t);
  }, []);

  const loadBooking = async () => {
    try {
      const res = await getBookingByRef(bookingRef);
      setBooking(res.data);
    } catch {
      setBooking(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="loading-screen" style={{ minHeight:'80vh' }}>
      <div className="spinner" /><p>Loading your ticket...</p>
    </div>
  );

  if (!booking) return (
    <div className="loading-screen" style={{ minHeight:'80vh' }}>
      <Ticket size={48} style={{ color:'var(--clr-text-muted)', marginBottom:'16px' }} />
      <p>Booking not found.</p>
      <button className="btn btn-primary" onClick={() => navigate('/')}>Go Home</button>
    </div>
  );

  return (
    <main className="page-enter" style={{ paddingBottom:'var(--sp-3xl)' }}>
      {confetti && <Confetti />}

      <div className="container">
        <div className="confirmation-page">
          {/* Header */}
          <div style={{ textAlign:'center', padding:'var(--sp-2xl) 0 var(--sp-xl)' }}>
            <div style={{
              width:72, height:72,
              background:'rgba(34,197,94,0.15)',
              border:'2px solid var(--clr-success)',
              borderRadius:'50%',
              display:'flex', alignItems:'center', justifyContent:'center',
              margin:'0 auto var(--sp-md)',
              color:'var(--clr-success)',
              animation:'successPop 0.6s cubic-bezier(0.34,1.56,0.64,1) forwards',
            }}>
              <PartyPopper size={36} />
            </div>
            <h1 style={{ fontFamily:'var(--font-heading)', fontSize:'2rem', fontWeight:900, marginBottom:8 }}>
              Booking <span className="text-gradient">Confirmed!</span>
            </h1>
            <p style={{ color:'var(--clr-text-muted)' }}>
              Your tickets have been booked successfully.
            </p>
          </div>

          {/* Ticket Card */}
          <div className="glass-card ticket-card">
            {/* Ticket Header (red band) */}
            <div className="ticket-header">
              {movie?.posterUrl && (
                <img className="ticket-movie-poster" src={movie.posterUrl} alt={booking.movieTitle}
                  onError={e => e.target.style.display='none'} />
              )}
              <div className="ticket-movie-info">
                <h2>{booking.movieTitle}</h2>
                <p style={{ fontSize:'0.9rem', opacity:0.85 }}>{booking.theaterName}</p>
                <div style={{ display:'flex', gap:8, marginTop:8, alignItems:'center' }}>
                  <span style={{ background:'rgba(34,197,94,0.2)', color:'var(--clr-success)', padding:'3px 10px', borderRadius:20, fontSize:'0.78rem', display:'flex', alignItems:'center', gap:'4px' }}>
                    <Check size={12} /> Confirmed
                  </span>
                  <span style={{ background:'rgba(255,255,255,0.15)', padding:'3px 10px', borderRadius:20, fontSize:'0.78rem', display:'flex', alignItems:'center', gap:'4px' }}>
                    <CreditCard size={12} /> {booking.paymentMode}
                  </span>
                </div>
              </div>
            </div>

            {/* Perforation line */}
            <div className="ticket-perforation" style={{ margin:'0 -0px' }}>
              <div className="ticket-hole" style={{ marginLeft:'-12px' }} />
              <div className="ticket-dash" />
              <div className="ticket-hole" style={{ marginRight:'-12px' }} />
            </div>

            {/* Ticket body */}
            <div className="ticket-body">
              {/* Booking reference */}
              <div className="booking-ref-box">
                <p style={{ fontSize:'0.72rem', color:'var(--clr-text-muted)', marginBottom:4, textTransform:'uppercase', letterSpacing:'0.06em' }}>
                  Booking Reference
                </p>
                <div className="booking-ref">{booking.bookingReference}</div>
              </div>

              {/* Info grid */}
              <div className="ticket-info-grid">
                <div className="ticket-info-item">
                  <div className="ticket-info-label" style={{ display:'flex', alignItems:'center', gap:'4px' }}><Calendar size={12} /> Date</div>
                  <div className="ticket-info-value">{booking.showDate}</div>
                </div>
                <div className="ticket-info-item">
                  <div className="ticket-info-label" style={{ display:'flex', alignItems:'center', gap:'4px' }}><Clock size={12} /> Time</div>
                  <div className="ticket-info-value">{booking.showTime}</div>
                </div>
                <div className="ticket-info-item">
                  <div className="ticket-info-label" style={{ display:'flex', alignItems:'center', gap:'4px' }}><Armchair size={12} /> Seats</div>
                  <div className="ticket-info-value">
                    {(booking.seatLabels || []).join(', ') || '—'}
                  </div>
                </div>
                <div className="ticket-info-item">
                  <div className="ticket-info-label" style={{ display:'flex', alignItems:'center', gap:'4px' }}><DollarSign size={12} /> Amount Paid</div>
                  <div className="ticket-info-value text-gold">₹{booking.totalAmount}</div>
                </div>
                <div className="ticket-info-item">
                  <div className="ticket-info-label" style={{ display:'flex', alignItems:'center', gap:'4px' }}><User size={12} /> Booked By</div>
                  <div className="ticket-info-value">{booking.userName}</div>
                </div>
                <div className="ticket-info-item">
                  <div className="ticket-info-label" style={{ display:'flex', alignItems:'center', gap:'4px' }}><Mail size={12} /> Email</div>
                  <div className="ticket-info-value" style={{ fontSize:'0.82rem', wordBreak:'break-all' }}>{booking.userEmail}</div>
                </div>
              </div>

              {/* Notice */}
              <div style={{
                padding:'12px 16px',
                background:'rgba(59,130,246,0.08)',
                border:'1px solid rgba(59,130,246,0.2)',
                borderRadius:'var(--r-md)',
                fontSize:'0.82rem',
                color:'#60a5fa',
                marginBottom:'var(--sp-xl)',
                display:'flex',
                alignItems:'center',
                gap:'8px',
              }}>
                <Info size={16} style={{ flexShrink:0 }} />
                <span>Please carry this booking reference or show your email confirmation at the theater.</span>
              </div>

              {/* Actions */}
              <div style={{ display:'flex', gap:'var(--sp-md)', flexWrap:'wrap' }}>
                <button className="btn btn-primary" style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:'8px' }} onClick={() => window.print()}>
                  <Printer size={16} /> Print Ticket
                </button>
                <button className="btn btn-ghost" style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:'8px' }} onClick={() => navigate('/')}>
                  <Film size={16} /> Book Another
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
