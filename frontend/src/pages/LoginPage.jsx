import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Film, Mail, Lock, Eye, EyeOff, Info, LogIn } from 'lucide-react';
import { loginUser } from '../api';

export default function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm]       = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.email || !form.password) { toast.error('Please fill all fields'); return; }
    setLoading(true);
    try {
      const res = await loginUser(form);
      localStorage.setItem('movieflix_user', JSON.stringify(res.data.user));
      toast.success(`Welcome back, ${res.data.user.name.split(' ')[0]}!`);
      navigate('/');
    } catch (err) {
      const msg = err.response?.data?.error || 'Login failed. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Logo */}
        <div className="auth-logo">
          <div className="auth-logo-icon" style={{ display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Film size={36} />
          </div>
          <h1 className="auth-title"><span className="text-gradient">MovieFlix</span></h1>
          <p className="auth-subtitle">Sign in to book your next experience</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {/* Email */}
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="input-wrapper">
              <span className="input-icon-left" style={{ display:'flex', alignItems:'center', justifyContent:'center' }}><Mail size={16} style={{ color:'var(--clr-text-dim)' }} /></span>
              <input
                className="form-input input-icon"
                type="email"
                name="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-wrapper">
              <span className="input-icon-left" style={{ display:'flex', alignItems:'center', justifyContent:'center' }}><Lock size={16} style={{ color:'var(--clr-text-dim)' }} /></span>
              <input
                className="form-input input-icon"
                type={showPass ? 'text' : 'password'}
                name="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                autoComplete="current-password"
                required
                style={{ paddingRight: '48px' }}
              />
              <button
                type="button"
                className="search-clear"
                onClick={() => setShowPass(p => !p)}
                style={{ right: 14, display:'flex', alignItems:'center', justifyContent:'center' }}
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ marginTop: '4px', padding: '14px', fontSize: '1rem', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px' }}
          >
            {loading ? (
              <><span className="spinner" style={{width:20,height:20,borderWidth:2}} /> Signing in...</>
            ) : (
              <><LogIn size={18} /> Sign In</>
            )}
          </button>
        </form>

        <div className="divider" style={{ margin: '20px 0' }}>or</div>

        <p className="auth-switch">
          Don't have an account?{' '}
          <Link to="/register">Create one free</Link>
        </p>
      </div>
    </div>
  );
}
