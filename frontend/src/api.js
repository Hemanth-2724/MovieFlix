import axios from 'axios';

// Base URL for the Java backend running on Tomcat (proxied via Vite to avoid CORS)
const BASE_URL = '/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// ── AUTH ─────────────────────────────────────────────────────────────
export const registerUser  = (data) => api.post('/users/register', data);
export const loginUser     = (data) => api.post('/users/login', data);
export const getUserById   = (id)   => api.get(`/users/${id}`);

// ── MOVIES ───────────────────────────────────────────────────────────
export const getMovies     = ()        => api.get('/movies');
export const getMovieById  = (id)      => api.get(`/movies/${id}`);
export const searchMovies  = (query)   => api.get(`/movies?search=${encodeURIComponent(query)}`);

// ── THEATERS ─────────────────────────────────────────────────────────
export const getTheatersForMovie = (movieId, date) =>
  api.get(`/theaters?movieId=${movieId}${date ? `&date=${date}` : ''}`);

// ── SHOWS ────────────────────────────────────────────────────────────
export const getShows = (movieId, theaterId, date) => {
  const params = new URLSearchParams();
  if (movieId)   params.append('movieId',   movieId);
  if (theaterId) params.append('theaterId', theaterId);
  if (date)      params.append('date',      date);
  return api.get(`/shows?${params.toString()}`);
};
export const getShowById = (id) => api.get(`/shows/${id}`);

// ── SEATS ────────────────────────────────────────────────────────────
export const getSeatsByShow = (showId) => api.get(`/seats?showId=${showId}`);

// ── BOOKINGS ─────────────────────────────────────────────────────────
export const createBooking    = (data) => api.post('/bookings', data);
export const getBookingById   = (id)   => api.get(`/bookings/${id}`);
export const getBookingByRef  = (ref)  => api.get(`/bookings?ref=${ref}`);

export default api;
