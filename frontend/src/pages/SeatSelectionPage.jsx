import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Building, Calendar, Clock, AlertTriangle, ArrowRight, ArrowLeft } from 'lucide-react';
import { getSeatsByShow, getShowById, getMovieById, getShows } from '../api';

const MAX_SEATS = 5;
const ROWS = ['A','B','C','D','E','F','G','H','I','J'];

// Generate next 3 days
const getDates = () => {
  const days  = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return Array.from({ length: 3 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : days[d.getDay()],
      dateNum: d.getDate(),
      month: months[d.getMonth()],
      isoDate: d.toISOString().split('T')[0],
    };
  });
};

export default function SeatSelectionPage() {
  const { showId }  = useParams();
  const navigate    = useNavigate();
  const location    = useLocation();

  const [seats,    setSeats]    = useState([]);
  const [selected, setSelected] = useState([]);   // array of seat objects
  const [show,     setShow]     = useState(location.state?.show || null);
  const [movie,    setMovie]    = useState(location.state?.movie || null);
  const [loading,  setLoading]  = useState(true);

  // Generate next 3 days
  const dates = getDates();
  const [selDate, setSelDate] = useState(null);
  const [showsForDate, setShowsForDate] = useState([]);
  const [loadingShows, setLoadingShows] = useState(false);

  useEffect(() => {
    setSelected([]); // Clear selected seats when changing show
    loadSeats();
    loadShow(); // Always reload show details when showId changes to ensure fresh data
  }, [showId]);

  useEffect(() => {
    if (show) {
      const matchedDate = dates.find(d => d.isoDate === show.showDate) || dates[0];
      setSelDate(matchedDate);
    }
  }, [show?.showDate]);

  useEffect(() => {
    if (show && selDate) {
      loadShowsForDate(selDate.isoDate);
    }
  }, [show?.movieId, show?.theaterId, selDate]);

  const loadShowsForDate = async (dateIso) => {
    if (!show) return;
    setLoadingShows(true);
    try {
      const res = await getShows(show.movieId, show.theaterId, dateIso);
      setShowsForDate(res.data);
    } catch {
      toast.error('Failed to load shows for this date.');
    } finally {
      setLoadingShows(false);
    }
  };

  const loadSeats = async () => {
    setLoading(true);
    try {
      const res = await getSeatsByShow(showId);
      setSeats(res.data);
    } catch {
      toast.error('Failed to load seats.');
    } finally {
      setLoading(false);
    }
  };

  const loadShow = async () => {
    try {
      const res = await getShowById(showId);
      setShow(res.data);
      if (!movie) {
        const movieRes = await getMovieById(res.data.movieId);
        setMovie(movieRes.data);
      }
    } catch {}
  };

  const toggleSeat = (seat) => {
    if (seat.booked) return;

    const isSelected = selected.some(s => s.id === seat.id);

    if (!isSelected && selected.length >= MAX_SEATS) {
      toast.error(`You can select a maximum of ${MAX_SEATS} seats.`);
      return;
    }

    setSelected(prev =>
      isSelected ? prev.filter(s => s.id !== seat.id) : [...prev, seat]
    );
  };

  const getSeatClass = (seat) => {
    if (seat.booked) return 'seat seat-booked';
    const isSelected = selected.some(s => s.id === seat.id);
    if (isSelected) {
      return seat.seatType === 'PREMIUM' ? 'seat seat-premium-selected' : 'seat seat-selected';
    }
    return seat.seatType === 'PREMIUM' ? 'seat seat-premium-available' : 'seat seat-available';
  };

  // Group seats by row
  const seatsByRow = ROWS.reduce((acc, row) => {
    acc[row] = seats.filter(s => s.rowName === row).sort((a,b) => a.seatNumber - b.seatNumber);
    return acc;
  }, {});

  // Calculate price
  const totalPrice = selected.reduce((sum, s) => {
    const price = s.seatType === 'PREMIUM'
      ? parseFloat(show?.pricePremium || 0)
      : parseFloat(show?.priceStandard || 0);
    return sum + price;
  }, 0);

  const handleProceed = () => {
    if (selected.length === 0) { toast.error('Please select at least one seat'); return; }
    navigate('/payment', { state: { show, movie, selectedSeats: selected, totalPrice } });
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    try {
      return new Date('2000-01-01T' + timeStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch { return timeStr; }
  };

  if (loading) return (
    <div className="loading-screen" style={{ minHeight: '80vh' }}>
      <div className="spinner" />
      <p>Loading seat map...</p>
    </div>
  );

  return (
    <main className="page-enter">
      <div className="container">
        {/* Page header */}
        <div style={{ padding: 'var(--sp-xl) 0 0' }}>
          <button onClick={() => navigate(-1)} style={{ color:'var(--clr-text-muted)', marginBottom:'var(--sp-md)', background:'none', border:'none', cursor:'pointer', fontSize:'0.9rem', display:'flex', alignItems:'center', gap:'6px' }}>
            <ArrowLeft size={14} /> Back to Theaters
          </button>
          <h1 style={{ fontSize:'1.5rem', fontWeight:800, marginBottom:'4px' }}>
            {movie?.title || 'Select Seats'}
          </h1>
          {show && (
            <p style={{ color:'var(--clr-text-muted)', fontSize:'0.9rem', display:'flex', flexWrap:'wrap', alignItems:'center', gap:'4px' }}>
              <Building size={14} /> <span>{show.theaterName}</span>
              <span style={{ margin: '0 8px', color: 'rgba(255,255,255,0.15)' }}>•</span>
              <Calendar size={14} /> <span>{show.showDate}</span>
              <span style={{ margin: '0 8px', color: 'rgba(255,255,255,0.15)' }}>•</span>
              <Clock size={14} /> <span>{formatTime(show.showTime)}</span>
            </p>
          )}
        </div>

        {/* Date & Showtime Quick Changer */}
        {show && selDate && (
          <div className="glass-card quick-change-bar">
            <div className="quick-change-section">
              <span className="quick-change-label">Change Date:</span>
              <div className="quick-date-selector">
                {dates.map(d => (
                  <button
                    key={d.isoDate}
                    className={`quick-date-pill ${selDate.isoDate === d.isoDate ? 'active' : ''}`}
                    onClick={() => setSelDate(d)}
                  >
                    <span className="day">{d.label}</span>
                    <span className="date-num">{d.dateNum}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="quick-change-divider" />

            <div className="quick-change-section" style={{ flex: 1 }}>
              <span className="quick-change-label">Available Showtimes:</span>
              {loadingShows ? (
                <span className="quick-change-status">Loading shows...</span>
              ) : showsForDate.length === 0 ? (
                <span className="quick-change-status" style={{ color: 'var(--clr-text-muted)' }}>No shows on this date</span>
              ) : (
                <div className="quick-showtimes">
                  {showsForDate.map(s => {
                    const isActive = s.id === show.id;
                    return (
                      <button
                        key={s.id}
                        className={`quick-time-chip ${isActive ? 'active' : ''}`}
                        onClick={() => {
                          if (!isActive) {
                            navigate(`/show/${s.id}/seats`, { state: { show: s, movie } });
                          }
                        }}
                      >
                        {formatTime(s.showTime)}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="seat-page">
          {/* LEFT — Seat Map */}
          <div className="glass-card" style={{ padding: 'var(--sp-2xl) var(--sp-xl) var(--sp-xl)' }}>
            {/* Seat grid */}
            <div className="seat-grid-wrap">
              {ROWS.map(row => (
                <div key={row} className="seat-row">
                  <div className="row-label">{row}</div>
                  {/* Left block (seats 1-5) */}
                  {(seatsByRow[row] || []).slice(0, 5).map(seat => (
                    <div
                      key={seat.id}
                      className={getSeatClass(seat)}
                      onClick={() => toggleSeat(seat)}
                      title={`${seat.seatLabel} — ${seat.seatType} ${seat.booked ? '(Booked)' : ''}`}
                    />
                  ))}
                  <div className="seat-gap" />
                  {/* Right block (seats 6-10) */}
                  {(seatsByRow[row] || []).slice(5, 10).map(seat => (
                    <div
                      key={seat.id}
                      className={getSeatClass(seat)}
                      onClick={() => toggleSeat(seat)}
                      title={`${seat.seatLabel} — ${seat.seatType} ${seat.booked ? '(Booked)' : ''}`}
                    />
                  ))}
                  <div className="row-label">{row}</div>
                </div>
              ))}
            </div>

            {/* Screen */}
            <div className="screen-indicator" style={{ marginTop: 'var(--sp-xl)', marginBottom: 0 }}>
              <div className="screen-bar" />
              <p className="screen-label">Screen — All eyes this way</p>
            </div>

            {/* Legend */}
            <div className="seat-legend" style={{ marginTop: 'var(--sp-xl)' }}>
              <div className="legend-item">
                <div className="legend-box" style={{ background:'rgba(59,130,246,0.1)', borderColor:'rgba(59,130,246,0.5)' }} />
                Standard Available
              </div>
              <div className="legend-item">
                <div className="legend-box" style={{ background:'rgba(168,85,247,0.1)', borderColor:'rgba(168,85,247,0.5)' }} />
                Premium Available
              </div>
              <div className="legend-item">
                <div className="legend-box" style={{ background:'rgba(255,214,10,0.2)', borderColor:'var(--clr-gold)' }} />
                Selected
              </div>
              <div className="legend-item">
                <div className="legend-box" style={{ background:'rgba(255,255,255,0.03)', borderColor:'rgba(255,255,255,0.08)', opacity:0.5 }} />
                Booked
              </div>
            </div>
          </div>

          {/* RIGHT — Booking Summary */}
          <div className="glass-card booking-sidebar">
            <h3>Booking Summary</h3>

            <div className="booking-detail-row">
              <span className="booking-detail-label">Movie</span>
              <span className="booking-detail-value">{movie?.title || '—'}</span>
            </div>
            <div className="booking-detail-row">
              <span className="booking-detail-label">Theater</span>
              <span className="booking-detail-value">{show?.theaterName || '—'}</span>
            </div>
            <div className="booking-detail-row">
              <span className="booking-detail-label">Date & Time</span>
              <span className="booking-detail-value">{show?.showDate} {formatTime(show?.showTime)}</span>
            </div>

            <div style={{ margin:'var(--sp-md) 0 8px', fontSize:'0.8rem', color:'var(--clr-text-muted)', textTransform:'uppercase', letterSpacing:'0.06em' }}>
              Selected Seats ({selected.length}/{MAX_SEATS})
            </div>

            {selected.length === 0 ? (
              <p style={{ color:'var(--clr-text-dim)', fontSize:'0.85rem', marginBottom:'var(--sp-md)' }}>No seats selected yet</p>
            ) : (
              <div className="selected-seats-wrap">
                {selected.map(s => (
                  <span key={s.id} className="selected-seat-tag">{s.seatLabel}</span>
                ))}
              </div>
            )}

            {selected.length === MAX_SEATS && (
              <div className="max-seat-warning" style={{ display:'flex', alignItems:'center', gap:'6px' }}>
                <AlertTriangle size={14} />
                <span>Maximum {MAX_SEATS} seats per booking</span>
              </div>
            )}

            {/* Price breakdown */}
            {selected.length > 0 && (
              <div className="price-breakdown">
                {selected.map(s => {
                  const price = s.seatType === 'PREMIUM'
                    ? parseFloat(show?.pricePremium || 0)
                    : parseFloat(show?.priceStandard || 0);
                  return (
                    <div key={s.id} className="price-row">
                      <span>{s.seatLabel} ({s.seatType})</span>
                      <span>₹{price.toFixed(0)}</span>
                    </div>
                  );
                })}
                <div className="price-row">
                  <span>Convenience Fee</span>
                  <span>₹{(selected.length * 25).toFixed(0)}</span>
                </div>
                <div className="price-total">
                  <span>Total</span>
                  <span className="text-gold">₹{(totalPrice + selected.length * 25).toFixed(0)}</span>
                </div>
              </div>
            )}

            <button
              className="btn btn-primary"
              style={{ width:'100%', padding:'14px', marginTop:'8px', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px' }}
              onClick={handleProceed}
              disabled={selected.length === 0}
            >
              <span>Proceed to Pay</span>
              <ArrowRight size={16} />
            </button>

            <p style={{ fontSize:'0.75rem', color:'var(--clr-text-dim)', textAlign:'center', marginTop:'8px' }}>
              Seats will be confirmed on payment
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
