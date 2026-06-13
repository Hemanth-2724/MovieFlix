import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Star, Clock, Building, MapPin } from 'lucide-react';
import { getMovieById, getTheatersForMovie, getShows } from '../api';

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

export default function TheaterPage() {
  const { movieId } = useParams();
  const navigate    = useNavigate();

  const [movie,     setMovie]     = useState(null);
  const [theaters,  setTheaters]  = useState([]);
  const [showMap,   setShowMap]   = useState({});  // theaterId → [shows]
  const [selDate,   setSelDate]   = useState(getDates()[0]);
  const [loading,   setLoading]   = useState(true);
  const dates = getDates();

  useEffect(() => {
    loadData(selDate.isoDate);
  }, [movieId, selDate]);

  const loadData = async (date) => {
    setLoading(true);
    try {
      const [movieRes, theaterRes] = await Promise.all([
        getMovieById(movieId),
        getTheatersForMovie(movieId, date),
      ]);
      setMovie(movieRes.data);
      const theaterList = theaterRes.data;
      setTheaters(theaterList);

      // Fetch shows for each theater
      const showResults = await Promise.all(
        theaterList.map(t => getShows(movieId, t.id, date))
      );
      const map = {};
      theaterList.forEach((t, i) => { map[t.id] = showResults[i].data; });
      setShowMap(map);
    } catch {
      toast.error('Failed to load theater data.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectShow = (show) => {
    const user = localStorage.getItem('movieflix_user');
    if (!user) { toast.error('Please sign in first'); navigate('/login'); return; }
    navigate(`/show/${show.id}/seats`, { state: { show, movie } });
  };

  if (!movie && !loading) return <div className="loading-screen"><p>Movie not found</p></div>;

  return (
    <main className="page-enter">
      {/* Movie Banner */}
      {movie && (
        <div className="movie-banner">
          <img className="movie-banner-img" src={movie.posterUrl} alt={movie.title}
            onError={e => { e.target.style.display='none'; }} />
          <div className="movie-banner-overlay">
            <div className="movie-banner-content container">
              <img className="banner-poster" src={movie.posterUrl} alt={movie.title}
                onError={e => { e.target.src=''; e.target.style.display='none'; }} />
              <div className="banner-info">
                <h1>{movie.title}</h1>
                <div className="banner-badges" style={{ display:'flex', flexWrap:'wrap', alignItems:'center', gap:'8px' }}>
                  <span className="badge badge-rating" style={{ display:'flex', alignItems:'center', gap:'4px' }}>
                    <Star size={12} fill="currentColor" style={{ color:'var(--clr-gold)' }} />
                    <span>{movie.rating}</span>
                  </span>
                  <span className="badge badge-genre">{movie.genre}</span>
                  <span className="badge badge-lang">{movie.language}</span>
                  <span className="badge" style={{background:'rgba(255,255,255,0.08)',color:'var(--clr-text-muted)', display:'flex', alignItems:'center', gap:'4px'}}>
                    <Clock size={12} />
                    <span>{Math.floor(movie.durationMin/60)}h {movie.durationMin%60}m</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="container" style={{ paddingBottom: 'var(--sp-3xl)' }}>
        {/* Date Selector */}
        <div className="date-selector">
          {dates.map(d => (
            <button
              key={d.isoDate}
              className={`date-pill ${selDate.isoDate === d.isoDate ? 'active' : ''}`}
              onClick={() => setSelDate(d)}
            >
              <div className="day">{d.label}</div>
              <div className="date-num">{d.dateNum}</div>
              <div className="month">{d.month}</div>
            </button>
          ))}
        </div>

        <div className="section-header">
          <h2 className="section-title">
            Select Theater &amp; Showtime
            <span style={{ fontSize:'0.9rem',fontWeight:400,color:'var(--clr-text-muted)',marginLeft:12 }}>
              {theaters.length} theaters available
            </span>
          </h2>
        </div>

        {loading ? (
          <div className="loading-screen"><div className="spinner" /><p>Loading showtimes...</p></div>
        ) : theaters.length === 0 ? (
          <div className="loading-screen">
            <Building size={48} style={{ color:'var(--clr-text-muted)', marginBottom:'16px' }} />
            <p>No theaters found for this date. Try another date.</p>
          </div>
        ) : (
          theaters.map((theater, idx) => (
            <div key={theater.id} className="glass-card theater-card" style={{ animationDelay: `${idx * 80}ms` }}>
              <div className="theater-card-header">
                <div>
                  <h3 className="theater-name" style={{ display:'flex', alignItems:'center', gap:'6px' }}>
                    <Building size={16} style={{ color:'var(--clr-primary)' }} />
                    <span>{theater.name}</span>
                  </h3>
                  <p className="theater-location" style={{ display:'flex', alignItems:'center', gap:'4px', marginTop:'4px' }}>
                    <MapPin size={12} />
                    <span>{theater.city} • {theater.address}</span>
                  </p>
                </div>
                <span style={{ fontSize:'0.78rem', color:'var(--clr-text-muted)', whiteSpace:'nowrap' }}>
                  {theater.totalScreens} screens
                </span>
              </div>

              {/* Showtimes */}
              <div className="showtimes-grid">
                {(showMap[theater.id] || []).length === 0 ? (
                  <p style={{ color:'var(--clr-text-dim)', fontSize:'0.85rem' }}>No shows on this date</p>
                ) : (
                  (showMap[theater.id] || []).map(show => (
                    <button
                      key={show.id}
                      className="showtime-chip"
                      onClick={() => handleSelectShow(show)}
                    >
                      <div className="time">
                        {new Date('2000-01-01T' + (show.showTime || '10:00:00')).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })}
                      </div>
                      <div className="price">from ₹{show.priceStandard}</div>
                    </button>
                  ))
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  );
}
