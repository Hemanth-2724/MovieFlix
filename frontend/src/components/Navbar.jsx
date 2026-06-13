import { Link, useNavigate } from 'react-router-dom';
import { Film } from 'lucide-react';

export default function Navbar() {
  const navigate  = useNavigate();
  const userStr   = localStorage.getItem('movieflix_user');
  const user      = userStr ? JSON.parse(userStr) : null;

  const handleLogout = () => {
    localStorage.removeItem('movieflix_user');
    navigate('/login');
  };

  const initials = user ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2) : '';

  return (
    <nav className="navbar">
      {/* Logo */}
      <Link to="/" className="navbar-logo">
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
          <>
            <div className="user-chip" onClick={handleLogout} title="Click to logout">
              <div className="user-avatar">{initials}</div>
              <span>{user.name.split(' ')[0]}</span>
            </div>
          </>
        ) : (
          <>
            <Link to="/login"    className="btn btn-ghost" style={{padding:'8px 18px',fontSize:'0.85rem'}}>Sign In</Link>
            <Link to="/register" className="btn btn-primary" style={{padding:'8px 18px',fontSize:'0.85rem'}}>Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}
