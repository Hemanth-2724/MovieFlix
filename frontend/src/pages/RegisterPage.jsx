import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Film, User, Mail, Smartphone, Lock, Eye, EyeOff, Check, X, UserPlus, ArrowRight } from 'lucide-react';
import { registerUser } from '../api';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => {
    if (!form.name.trim())          { toast.error('Full name is required');          return false; }
    if (!form.email.trim())         { toast.error('Email is required');               return false; }
    if (!/\S+@\S+\.\S+/.test(form.email)) { toast.error('Enter a valid email');      return false; }
    if (form.password.length < 6)   { toast.error('Password must be ≥ 6 characters'); return false; }
    if (form.password !== form.confirmPassword) { toast.error('Passwords do not match'); return false; }
    return true;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const payload = { name: form.name, email: form.email, password: form.password, phone: form.phone };
      await registerUser(payload);
      toast.success('Account created! Please sign in');
      navigate('/login');
    } catch (err) {
      const msg = err.response?.data?.error || 'Registration failed. Try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Password strength
  const strengthScore = (pass) => {
    let s = 0;
    if (pass.length >= 6)  s++;
    if (pass.length >= 10) s++;
    if (/[A-Z]/.test(pass)) s++;
    if (/[0-9]/.test(pass)) s++;
    if (/[^A-Za-z0-9]/.test(pass)) s++;
    return s;
  };
  const score = strengthScore(form.password);
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'][score];
  const strengthColor = ['', '#e63946', '#f59e0b', '#3b82f6', '#22c55e', '#22c55e'][score];

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: 480 }}>
        <div className="auth-logo">
          <div className="auth-logo-icon" style={{ display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Film size={36} />
          </div>
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">Join MovieFlix — book tickets in seconds</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {/* Full Name */}
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <div className="input-wrapper">
              <span className="input-icon-left" style={{ display:'flex', alignItems:'center', justifyContent:'center' }}><User size={16} style={{ color:'var(--clr-text-dim)' }} /></span>
              <input className="form-input input-icon" type="text" name="name"
                placeholder="John Doe" value={form.name} onChange={handleChange} required />
            </div>
          </div>

          {/* Email */}
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="input-wrapper">
              <span className="input-icon-left" style={{ display:'flex', alignItems:'center', justifyContent:'center' }}><Mail size={16} style={{ color:'var(--clr-text-dim)' }} /></span>
              <input className="form-input input-icon" type="email" name="email"
                placeholder="you@example.com" value={form.email} onChange={handleChange} required />
            </div>
          </div>

          {/* Phone */}
          <div className="form-group">
            <label className="form-label">Phone <span style={{color:'var(--clr-text-dim)'}}>Optional</span></label>
            <div className="input-wrapper">
              <span className="input-icon-left" style={{ display:'flex', alignItems:'center', justifyContent:'center' }}><Smartphone size={16} style={{ color:'var(--clr-text-dim)' }} /></span>
              <input className="form-input input-icon" type="tel" name="phone"
                placeholder="9876543210" value={form.phone} onChange={handleChange} />
            </div>
          </div>

          {/* Password */}
          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-wrapper">
              <span className="input-icon-left" style={{ display:'flex', alignItems:'center', justifyContent:'center' }}><Lock size={16} style={{ color:'var(--clr-text-dim)' }} /></span>
              <input className="form-input input-icon" type="text" name="password"
                placeholder="Min. 6 characters" value={form.password} onChange={handleChange}
                required style={{
                  paddingRight: '48px',
                  WebkitTextSecurity: showPass ? 'none' : 'disc',
                  textSecurity: showPass ? 'none' : 'disc'
                }} />
              <button type="button" className="search-clear" onClick={() => setShowPass(p => !p)} style={{ right: 14, display:'flex', alignItems:'center', justifyContent:'center' }}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {/* Strength bar */}
            {form.password && (
              <div style={{ marginTop: 6 }}>
                <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                  {[1,2,3,4,5].map(i => (
                    <div key={i} style={{
                      flex: 1, height: 3, borderRadius: 2,
                      background: i <= score ? strengthColor : 'var(--clr-border)',
                      transition: 'background 0.3s',
                    }} />
                  ))}
                </div>
                <span style={{ fontSize: '0.75rem', color: strengthColor }}>{strengthLabel}</span>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <div className="input-wrapper">
              <span className="input-icon-left" style={{ display:'flex', alignItems:'center', justifyContent:'center' }}><Lock size={16} style={{ color:'var(--clr-text-dim)' }} /></span>
              <input className="form-input input-icon" type="text" name="confirmPassword"
                placeholder="Re-enter password" value={form.confirmPassword} onChange={handleChange} required
                style={{
                  paddingRight: '48px',
                  WebkitTextSecurity: 'disc',
                  textSecurity: 'disc'
                }} />
              {form.confirmPassword && (
                <span style={{ position:'absolute', right:14, top:'50%', transform:'translateY(-50%)', display:'flex', alignItems:'center', justifyContent:'center', pointerEvents: 'none' }}>
                  {form.password === form.confirmPassword ? <Check size={16} className="text-success" /> : <X size={16} className="text-danger" />}
                </span>
              )}
            </div>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}
            style={{ marginTop: '4px', padding: '14px', fontSize: '1rem', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px' }}>
            {loading ? (
              <><span className="spinner" style={{width:20,height:20,borderWidth:2}} /> Creating account...</>
            ) : (
              <><UserPlus size={18} /> Create Account</>
            )}
          </button>
        </form>

        <div className="divider" style={{ margin: '20px 0' }}>already a member?</div>
        <p className="auth-switch">
          <Link to="/login" style={{ display:'inline-flex', alignItems:'center', gap:'6px' }}>Sign in to your account <ArrowRight size={14} /></Link>
        </p>
      </div>
    </div>
  );
}
