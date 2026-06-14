import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Film, User, LogOut, ChevronDown, Ticket, Menu, X } from 'lucide-react';

export default function Navbar() {
  const navigate  = useNavigate();
  const userStr   = localStorage.getItem('movieflix_user');
  const user      = userStr ? JSON.parse(userStr) : null;
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navRef   = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setOpen(false);
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('movieflix_user');
    setOpen(false);
    setMenuOpen(false);
    navigate('/login');
  };

  const initials = user
    ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : '';

  return (
    <nav className="navbar" ref={navRef}>
      {/* Logo */}
      <Link to="/" className="navbar-logo" onClick={() => setMenuOpen(false)}>
        <div className="logo-icon"><Film size={20} /></div>
        <span className="text-gradient">MovieFlix</span>
      </Link>

      {/* Nav links */}
      <ul className="navbar-nav">
        <li><Link to="/">Movies</Link></li>
        <li><a href="#">Offers</a></li>
        <li><a href="#">Gift Cards</a></li>
      </ul>

      {/* Right side */}
      <div className="navbar-right">
        {user ? (
          <div className="user-dropdown-wrap">
            {/* Chip — opens dropdown */}
            <div
              className="user-chip"
              onClick={() => setOpen(o => !o)}
              title="Account menu"
            >
              <div className="user-avatar">{initials}</div>
              <span>{user.name.split(' ')[0]}</span>
              <ChevronDown
                size={14}
                style={{
                  color: 'var(--clr-text-muted)',
                  transition: 'transform 0.15s',
                  transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
                }}
              />
            </div>

            {/* Dropdown panel */}
            {open && (
              <div className="user-dropdown">
                {/* Header */}
                <div className="user-dropdown-header">
                  <div className="user-dropdown-avatar">{initials}</div>
                  <div>
                    <div className="user-dropdown-name">{user.name}</div>
                    <div className="user-dropdown-email">{user.email}</div>
                  </div>
                </div>

                <div className="user-dropdown-divider" />

                <Link
                  to="/profile"
                  className="user-dropdown-item"
                  onClick={() => setOpen(false)}
                >
                  <User size={15} /> My Profile
                </Link>
                <Link
                  to="/profile?tab=bookings"
                  className="user-dropdown-item"
                  onClick={() => setOpen(false)}
                >
                  <Ticket size={15} /> My Bookings
                </Link>

                <div className="user-dropdown-divider" />

                <button
                  className="user-dropdown-item user-dropdown-logout"
                  onClick={handleLogout}
                >
                  <LogOut size={15} /> Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <Link to="/login"    className="btn btn-ghost navbar-btn">Sign In</Link>
            <Link to="/register" className="btn btn-primary navbar-btn">Register</Link>
          </>
        )}
      </div>

      {/* Mobile Toggle Button */}
      <button
        className="navbar-toggle"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle navigation menu"
      >
        {menuOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* Mobile Navigation Panel */}
      {menuOpen && (
        <div className="navbar-mobile-menu">
          <ul className="mobile-nav-links">
            <li><Link to="/" onClick={() => setMenuOpen(false)}>Movies</Link></li>
            <li><a href="#" onClick={() => setMenuOpen(false)}>Offers</a></li>
            <li><a href="#" onClick={() => setMenuOpen(false)}>Gift Cards</a></li>
          </ul>
          <div className="mobile-nav-actions">
            {user ? (
              <>
                <div className="mobile-user-info">
                  <div className="user-avatar">{initials}</div>
                  <div className="user-details">
                    <div className="user-name">{user.name}</div>
                    <div className="user-email">{user.email}</div>
                  </div>
                </div>
                <Link to="/profile" className="mobile-menu-item" onClick={() => setMenuOpen(false)}>
                  <User size={16} /> My Profile
                </Link>
                <Link to="/profile?tab=bookings" className="mobile-menu-item" onClick={() => setMenuOpen(false)}>
                  <Ticket size={16} /> My Bookings
                </Link>
                <button className="mobile-menu-item mobile-logout-btn-nav" onClick={handleLogout}>
                  <LogOut size={16} /> Sign Out
                </button>
              </>
            ) : (
              <div className="mobile-auth-buttons">
                <Link to="/login" className="btn btn-ghost navbar-btn" onClick={() => setMenuOpen(false)}>Sign In</Link>
                <Link to="/register" className="btn btn-primary navbar-btn" onClick={() => setMenuOpen(false)}>Register</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
