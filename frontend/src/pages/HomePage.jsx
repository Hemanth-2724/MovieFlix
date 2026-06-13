import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Search, Film, Star, Play, Clock, ArrowRight } from 'lucide-react';
import { getMovies, searchMovies } from '../api';

const GENRES = ['All', 'Action', 'Sci-Fi', 'Drama', 'Horror', 'Comedy', 'Thriller', 'Biographical'];

// Format duration e.g. 181 → "3h 1m"
const formatDuration = (min) => `${Math.floor(min/60)}h ${min%60}m`;

export default function HomePage() {
  const navigate = useNavigate();
  const [movies,  setMovies]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');
  const [genre,   setGenre]   = useState('All');
  const [imgErrors, setImgErrors] = useState({});

  useEffect(() => {
    loadMovies();
  }, []);

  const loadMovies = async () => {
    setLoading(true);
    try {
      const res = await getMovies();
      setMovies(res.data);
    } catch {
      toast.error('Failed to load movies. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (q) => {
    setSearch(q);
    if (q.trim().length < 2) { loadMovies(); return; }
    try {
      const res = await searchMovies(q.trim());
      setMovies(res.data);
    } catch {}
  };

  const handleBookNow = (movie) => {
    const user = localStorage.getItem('movieflix_user');
    if (!user) {
      toast.error('Please sign in to book tickets');
      navigate('/login');
      return;
    }
    navigate(`/movie/${movie.id}/theaters`);
  };

  // Filter by genre client-side
  const filtered = genre === 'All'
    ? movies
    : movies.filter(m => m.genre.toLowerCase().includes(genre.toLowerCase()));

  return (
    <main className="page-enter">
      {/* Hero Section */}
      <section className="home-hero">
        <div className="container">
          <h1 className="home-hero-title">
            Book Your Next<br />
            <span className="text-gradient">Cinematic Experience</span>
          </h1>
          <p className="home-hero-sub">
            Discover the latest blockbusters, pick your seats, and enjoy the show.
          </p>

          {/* Search */}
          <div className="search-bar">
            <span className="search-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Search size={18} /></span>
            <input
              className="search-input"
              type="text"
              placeholder="Search movies, genres, languages..."
              value={search}
              onChange={e => handleSearch(e.target.value)}
            />
            {search && (
              <button className="search-clear" onClick={() => { setSearch(''); loadMovies(); }}>✕</button>
            )}
          </div>

          {/* Genre Filter */}
          <div className="genre-filters">
            {GENRES.map(g => (
              <button
                key={g}
                className={`genre-pill ${genre === g ? 'active' : ''}`}
                onClick={() => setGenre(g)}
              >
                {g}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Movies Grid */}
      <section style={{ paddingBottom: 'var(--sp-3xl)' }}>
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">
              {search ? `Results for "${search}"` : 'Now Showing'}
              <span style={{ fontSize:'0.9rem', fontWeight:400, color:'var(--clr-text-muted)', marginLeft:12 }}>
                {filtered.length} movies
              </span>
            </h2>
          </div>

          {loading ? (
            <div className="loading-screen">
              <div className="spinner" />
              <p>Loading movies...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="loading-screen">
              <Film size={48} style={{ color: 'var(--clr-text-muted)', marginBottom: '16px' }} />
              <p>No movies found. Try a different search.</p>
            </div>
          ) : (
            <div className="grid-auto">
              {filtered.map((movie, idx) => (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  idx={idx}
                  onBook={() => handleBookNow(movie)}
                  imgError={imgErrors[movie.id]}
                  onImgError={() => setImgErrors(prev => ({ ...prev, [movie.id]: true }))}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function MovieCard({ movie, idx, onBook, imgError, onImgError }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="movie-card"
      style={{ animationDelay: `${idx * 60}ms` }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="movie-poster-wrap">
        {imgError ? (
          <div style={{
            width:'100%', height:'100%', display:'flex', flexDirection:'column',
            alignItems:'center', justifyContent:'center', gap:8,
            background:'linear-gradient(135deg,#1a1a2e,#0f3460)',
            color:'var(--clr-text-muted)', fontSize:'0.8rem', padding:16, textAlign:'center',
          }}>
            <Film size={40} style={{ color: 'var(--clr-text-muted)' }} />
            <span>{movie.title}</span>
          </div>
        ) : (
          <img
            className="movie-poster"
            src={movie.posterUrl}
            alt={movie.title}
            loading="lazy"
            onError={onImgError}
          />
        )}

        {/* Rating badge */}
        <div className="movie-rating-badge" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Star size={12} fill="currentColor" style={{ color: 'var(--clr-gold)' }} />
          <span>{movie.rating}</span>
        </div>

        {/* Hover overlay */}
        <div className="movie-poster-overlay">
          <div className="movie-play-btn" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Play size={18} fill="currentColor" /></div>
        </div>
      </div>

      <div className="movie-info">
        <h3 className="movie-title">{movie.title}</h3>
        <div className="movie-meta">
          <span className="badge badge-genre">{movie.genre.split('/')[0].trim()}</span>
          <span className="badge badge-lang">{movie.language}</span>
        </div>
        <p className="movie-duration" style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Clock size={14} />
          <span>{formatDuration(movie.durationMin)}</span>
        </p>
        <button className="movie-book-btn" onClick={onBook} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
          Book Tickets <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
