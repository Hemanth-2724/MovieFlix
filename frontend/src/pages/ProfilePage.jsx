import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  User, Mail, Phone, Calendar, Ticket, Film,
  LogOut, Edit3, CheckCircle, Clock, MapPin, Star
} from 'lucide-react';
import { getBookingsByUserId } from '../api';

export default function ProfilePage() {
  const navigate        = useNavigate();
  const [params]        = useSearchParams();
  const initialTab      = params.get('tab') === 'bookings' ? 'bookings' : 'profile';
  const [activeTab, setActiveTab] = useState(initialTab);

  const userStr = localStorage.getItem('movieflix_user');
  const user    = userStr ? JSON.parse(userStr) : null;

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Redirect to login if not authenticated and load bookings
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchBookings = async () => {
      try {
        const res = await getBookingsByUserId(user.id);
        setBookings(res.data || []);
      } catch (err) {
        console.error("Failed to load bookings", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, [user?.id]);

  if (!user) return null;

  const initials = user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  const memberSince = new Date(user.created_at || Date.now()).toLocaleDateString('en-IN', {
    month: 'long', year: 'numeric'
  });

  const handleLogout = () => {
    localStorage.removeItem('movieflix_user');
    navigate('/login');
  };

  return (
    <div className="profile-page">
      {/* ── Hero Banner ─────────────────────────────────────────── */}
      <div className="profile-hero">
        <div className="profile-hero-bg" />
        <div className="profile-hero-content">
          <div className="profile-avatar-lg">{initials}</div>
          <div>
            <h1 className="profile-hero-name">{user.name}</h1>
            <p className="profile-hero-meta">
              <Mail size={14} /> {user.email}
            </p>
            {user.phone && (
              <p className="profile-hero-meta">
                <Phone size={14} /> {user.phone}
              </p>
            )}
            <p className="profile-hero-meta">
              <Calendar size={14} /> Member since {memberSince}
            </p>
          </div>
          <button className="btn btn-ghost profile-logout-btn" onClick={handleLogout}>
            <LogOut size={15} /> Sign Out
          </button>
        </div>
      </div>

      {/* ── Tab Bar ─────────────────────────────────────────────── */}
      <div className="profile-tabs-bar">
        <button
          className={`profile-tab ${activeTab === 'profile'  ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          <User size={15} /> Profile
        </button>
        <button
          className={`profile-tab ${activeTab === 'bookings' ? 'active' : ''}`}
          onClick={() => setActiveTab('bookings')}
        >
          <Ticket size={15} /> My Bookings
        </button>
      </div>

      {/* ── Content ─────────────────────────────────────────────── */}
      <div className="profile-content">
        {activeTab === 'profile' && <ProfileTab user={user} bookings={bookings} />}
        {activeTab === 'bookings' && <BookingsTab bookings={bookings} loading={loading} />}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   Profile Tab
   ────────────────────────────────────────────────────────────── */
function ProfileTab({ user, bookings }) {
  const uniqueMoviesCount = new Set(bookings.map(b => b.movieTitle).filter(Boolean)).size;
  const loyaltyPoints = bookings.length * 10;

  return (
    <div className="profile-section">
      <h2 className="profile-section-title">
        <User size={18} /> Personal Information
      </h2>
      <div className="profile-info-grid">
        <InfoRow icon={<User size={16} />}     label="Full Name"     value={user.name} />
        <InfoRow icon={<Mail size={16} />}     label="Email Address" value={user.email} />
        <InfoRow icon={<Phone size={16} />}    label="Phone Number"  value={user.phone || '—'} />
        <InfoRow icon={<Calendar size={16} />} label="Member Since"  value={new Date(user.created_at || Date.now()).toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' })} />
      </div>

      <div className="profile-stats-row">
        <StatCard icon={<Film size={20} />}   label="Movies Watched" value={uniqueMoviesCount} />
        <StatCard icon={<Ticket size={20} />} label="Total Bookings" value={bookings.length} />
        <StatCard icon={<Star size={20} />}   label="Loyalty Points" value={loyaltyPoints} />
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <div className="profile-info-row">
      <div className="profile-info-icon">{icon}</div>
      <div>
        <div className="profile-info-label">{label}</div>
        <div className="profile-info-value">{value}</div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className="profile-stat-card">
      <div className="profile-stat-icon">{icon}</div>
      <div className="profile-stat-value">{value}</div>
      <div className="profile-stat-label">{label}</div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   Bookings Tab
   ────────────────────────────────────────────────────────────── */
function BookingsTab({ bookings, loading }) {
  if (loading) {
    return (
      <div className="profile-section" style={{ textAlign: 'center', padding: '60px 0', color: 'var(--clr-text-muted)' }}>
        <Clock size={32} style={{ marginBottom: 12 }} />
        <p>Loading bookings…</p>
      </div>
    );
  }

  if (!bookings.length) {
    return (
      <div className="profile-section profile-empty-state">
        <Ticket size={48} />
        <h3>No bookings yet</h3>
        <p>Book your first movie and it will appear here.</p>
        <a href="/" className="btn btn-primary" style={{ marginTop: 16 }}>Browse Movies</a>
      </div>
    );
  }

  return (
    <div className="profile-section">
      <h2 className="profile-section-title">
        <Ticket size={18} /> Recent Bookings
      </h2>
      {bookings.map((b, i) => (
        <BookingCard key={i} booking={b} />
      ))}
    </div>
  );
}

function BookingCard({ booking }) {
  return (
    <div className="booking-card">
      <div className="booking-card-header">
        <CheckCircle size={18} style={{ color: 'var(--clr-success, #22c55e)' }} />
        <span className="booking-ref">Ref: {booking.bookingReference}</span>
        <span className="booking-badge confirmed">{booking.paymentStatus || 'Confirmed'}</span>
      </div>
      {booking.movieTitle && (
        <div className="booking-meta-row">
          <Film size={14} /> <strong>{booking.movieTitle}</strong>
        </div>
      )}
      {booking.theaterName && (
        <div className="booking-meta-row">
          <MapPin size={14} /> {booking.theaterName}
        </div>
      )}
      {booking.showDate && (
        <div className="booking-meta-row">
          <Calendar size={14} /> {booking.showDate} {booking.showTime ? `at ${booking.showTime}` : ''}
        </div>
      )}
      {booking.seatLabels && (
        <div className="booking-meta-row">
          <Ticket size={14} /> Seats: {Array.isArray(booking.seatLabels) ? booking.seatLabels.join(', ') : booking.seatLabels}
        </div>
      )}
    </div>
  );
}
