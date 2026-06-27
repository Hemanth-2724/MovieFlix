import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Smartphone, CreditCard, Link, Lock, CheckCircle, ShieldCheck, Mail } from 'lucide-react';
import { createBooking } from '../api';

// Dummy QR pattern (7×7 grid)
const QR_PATTERN = [
  [1,1,1,1,1,1,1],
  [1,0,0,0,0,0,1],
  [1,0,1,1,1,0,1],
  [1,0,1,0,1,0,1],
  [1,0,1,1,1,0,1],
  [1,0,0,0,0,0,1],
  [1,1,1,1,1,1,1],
];

function QRCode() {
  return (
    <div className="qr-box">
      <div className="qr-pattern">
        {QR_PATTERN.map((row, ri) =>
          row.map((cell, ci) => (
            <div key={`${ri}-${ci}`} className={`qr-cell ${cell === 0 ? 'empty' : ''}`} />
          ))
        )}
      </div>
    </div>
  );
}

function CardVisual({ number, name, expiry }) {
  const displayNum = number.replace(/\s/g,'').replace(/(.{4})/g,'$1 ').trim() || '•••• •••• •••• ••••';
  return (
    <div className="credit-card-visual">
      <div className="card-chip" />
      <div className="card-number-display">
        {displayNum.length > 4 ? displayNum : '•••• •••• •••• ••••'}
      </div>
      <div className="card-footer-display">
        <div>
          <div className="card-label">Card Holder</div>
          <div className="card-value">{name || 'FULL NAME'}</div>
        </div>
        <div>
          <div className="card-label">Expires</div>
          <div className="card-value">{expiry || 'MM/YY'}</div>
        </div>
        <div className="card-brand">VISA</div>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  const navigate  = useNavigate();
  const location  = useLocation();

  const { show, movie, selectedSeats = [], totalPrice = 0 } = location.state || {};

  const [tab,     setTab]     = useState('UPI');    // 'UPI' | 'CARD'
  const [upiId,   setUpiId]   = useState('');
  const [card,    setCard]     = useState({ number:'', name:'', expiry:'', cvv:'' });
  const [paying,  setPaying]  = useState(false);
  const [success, setSuccess] = useState(false);

  const convFee    = (selectedSeats.length || 0) * 25;
  const grandTotal = totalPrice + convFee;

  const user = JSON.parse(localStorage.getItem('movieflix_user') || 'null');

  const handleCardChange = e => setCard({ ...card, [e.target.name]: e.target.value });

  const formatCardNum = (v) => v.replace(/\D/g,'').slice(0,16).replace(/(.{4})/g,'$1 ').trim();
  const formatExpiry  = (v) => {
    const digits = v.replace(/\D/g,'').slice(0,4);
    return digits.length > 2 ? `${digits.slice(0,2)}/${digits.slice(2)}` : digits;
  };

  const validatePayment = () => {
    if (tab === 'UPI') {
      if (!upiId.includes('@')) { toast.error('Enter a valid UPI ID (e.g. user@upi)'); return false; }
    } else {
      const rawNum = card.number.replace(/\s/g,'');
      if (rawNum.length < 16) { toast.error('Enter a valid 16-digit card number'); return false; }
      if (!card.name.trim())  { toast.error('Enter the cardholder name'); return false; }
      if (!card.expiry.match(/^\d{2}\/\d{2}$/)) { toast.error('Enter expiry as MM/YY'); return false; }
      if (card.cvv.length < 3) { toast.error('Enter a valid 3-digit CVV'); return false; }
    }
    return true;
  };

  const handlePay = async () => {
    if (!validatePayment()) return;
    if (!user)  { toast.error('Please log in first'); navigate('/login'); return; }
    if (!show)  { toast.error('Session expired. Please restart booking.'); navigate('/'); return; }

    setPaying(true);
    try {
      const payload = {
        userId:      user.id,
        showId:      show.id,
        seatIds:     selectedSeats.map(s => s.id),
        paymentMode: tab === 'UPI' ? 'UPI' : 'CREDIT_CARD',
      };
      const res = await createBooking(payload);
      setSuccess(true);
      setTimeout(() => navigate(`/confirmation/${res.data.bookingReference}`, { state: { booking: res.data, movie } }), 1500);
    } catch (err) {
      const msg = err.response?.data?.error || 'Payment failed. Please try again.';
      toast.error(msg);
      if (msg.includes('User session is invalid')) {
        localStorage.removeItem('movieflix_user');
        setTimeout(() => navigate('/login'), 2000);
      }
    } finally {
      setPaying(false);
    }
  };

  if (success) {
    return (
      <div className="loading-screen" style={{ minHeight:'80vh', gap:'var(--sp-lg)' }}>
        <div className="success-ring" style={{ display:'flex', alignItems:'center', justifyContent:'center' }}>
          <CheckCircle size={40} className="text-success" />
        </div>
        <h2 style={{ fontFamily:'var(--font-heading)', fontSize:'1.5rem' }}>Payment Successful!</h2>
        <p style={{ color:'var(--clr-text-muted)' }}>Generating your ticket...</p>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <main className="page-enter">
      <div className="container">
        <div className="payment-page">
          {/* LEFT — Payment form */}
          <div>
            <h1 style={{ fontFamily:'var(--font-heading)', fontSize:'1.5rem', fontWeight:800, marginBottom:'var(--sp-xl)', paddingTop:'var(--sp-xl)' }}>
              Complete Payment
            </h1>

            {/* Tabs */}
            <div className="payment-tabs">
              <button className={`payment-tab ${tab==='UPI'?'active':''}`} onClick={() => setTab('UPI')} style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'8px' }}>
                <Smartphone size={16} /> UPI
              </button>
              <button className={`payment-tab ${tab==='CARD'?'active':''}`} onClick={() => setTab('CARD')} style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'8px' }}>
                <CreditCard size={16} /> Credit / Debit Card
              </button>
            </div>

            {/* UPI Section */}
            {tab === 'UPI' && (
              <div className="glass-card" style={{ padding:'var(--sp-xl)' }}>
                <div className="upi-qr-wrap">
                  <QRCode />
                  <p style={{ fontSize:'0.85rem', color:'var(--clr-text-muted)', textAlign:'center' }}>
                    Scan with any UPI app<br />
                    <strong style={{color:'var(--clr-text)'}}>Google Pay, PhonePe, Paytm</strong>
                  </p>
                  <div className="upi-id-display" style={{ display:'flex', alignItems:'center', gap:'6px' }}>
                    <Link size={14} /> movieflix@upi
                  </div>
                  <p style={{ fontSize:'0.8rem', color:'var(--clr-text-dim)' }}>
                    Amount: <strong style={{ color:'var(--clr-gold)', fontSize:'1.1rem' }}>₹{grandTotal.toFixed(0)}</strong>
                  </p>
                </div>

                <div className="divider" style={{ margin:'var(--sp-lg) 0' }}>Or enter UPI ID manually</div>

                <div className="form-group">
                  <label className="form-label">Your UPI ID</label>
                  <div className="input-wrapper">
                    <span className="input-icon-left" style={{ display:'flex', alignItems:'center', justifyContent:'center' }}><Smartphone size={16} style={{ color:'var(--clr-text-dim)' }} /></span>
                    <input
                      className="form-input input-icon"
                      type="text"
                      placeholder="username@upi"
                      value={upiId}
                      onChange={e => setUpiId(e.target.value)}
                    />
                  </div>
                </div>

                <button
                  className="btn btn-primary"
                  style={{ width:'100%', padding:'16px', fontSize:'1rem', marginTop:'var(--sp-lg)', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px' }}
                  onClick={handlePay}
                  disabled={paying}
                >
                  {paying ? <><span className="spinner" style={{width:20,height:20,borderWidth:2}} /> Processing...</> : <><Lock size={16} /> Pay ₹{grandTotal.toFixed(0)}</>}
                </button>
              </div>
            )}

            {/* Card Section */}
            {tab === 'CARD' && (
              <div className="glass-card" style={{ padding:'var(--sp-xl)' }}>
                <CardVisual number={card.number} name={card.name} expiry={card.expiry} />

                <div className="card-form-grid">
                  {/* Card Number */}
                  <div className="form-group">
                    <label className="form-label">Card Number</label>
                    <input
                      className="form-input"
                      type="text"
                      inputMode="numeric"
                      placeholder="1234 5678 9012 3456"
                      value={card.number}
                      name="number"
                      maxLength={19}
                      onChange={e => setCard({ ...card, number: formatCardNum(e.target.value) })}
                    />
                  </div>

                  {/* Name */}
                  <div className="form-group" style={{ gridColumn:'1/-1' }}>
                    <label className="form-label">Cardholder Name</label>
                    <input
                      className="form-input"
                      type="text"
                      placeholder="As printed on card"
                      name="name"
                      value={card.name}
                      onChange={handleCardChange}
                    />
                  </div>

                  {/* Expiry */}
                  <div className="form-group">
                    <label className="form-label">Expiry (MM/YY)</label>
                    <input
                      className="form-input"
                      type="text"
                      inputMode="numeric"
                      placeholder="MM/YY"
                      value={card.expiry}
                      maxLength={5}
                      onChange={e => setCard({ ...card, expiry: formatExpiry(e.target.value) })}
                    />
                  </div>

                  {/* CVV */}
                  <div className="form-group">
                    <label className="form-label">CVV</label>
                    <input
                      className="form-input"
                      type="text"
                      inputMode="numeric"
                      placeholder="•••"
                      name="cvv"
                      maxLength={4}
                      value={card.cvv}
                      onChange={e => setCard({ ...card, cvv: e.target.value.replace(/\D/,'').slice(0,4) })}
                      style={{
                        WebkitTextSecurity: 'disc',
                        textSecurity: 'disc'
                      }}
                    />
                  </div>
                </div>

                {/* Security note */}
                <div style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 14px', background:'rgba(34,197,94,0.08)', border:'1px solid rgba(34,197,94,0.2)', borderRadius:'var(--r-md)', marginTop:'var(--sp-md)', fontSize:'0.8rem', color:'var(--clr-success)' }}>
                  <ShieldCheck size={16} /> Your payment is secured with 256-bit SSL encryption (Demo Mode)
                </div>

                <button
                  className="btn btn-primary"
                  style={{ width:'100%', padding:'16px', fontSize:'1rem', marginTop:'var(--sp-lg)', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px' }}
                  onClick={handlePay}
                  disabled={paying}
                >
                  {paying ? <><span className="spinner" style={{width:20,height:20,borderWidth:2}} /> Processing...</> : <><Lock size={16} /> Pay ₹{grandTotal.toFixed(0)}</>}
                </button>
              </div>
            )}
          </div>

          {/* RIGHT — Booking Summary */}
          <div>
            <div className="glass-card payment-summary-card" style={{ marginTop:'var(--sp-3xl)' }}>
              <h3 style={{ fontFamily:'var(--font-heading)', fontWeight:800, marginBottom:'var(--sp-md)', paddingBottom:'var(--sp-md)', borderBottom:'1px solid var(--clr-border)' }}>
                Order Summary
              </h3>

              {/* Movie info */}
              <div style={{ display:'flex', gap:'var(--sp-md)', marginBottom:'var(--sp-lg)', alignItems:'center' }}>
                {movie?.posterUrl && (
                  <img className="payment-summary-movie-poster" src={movie.posterUrl} alt={movie.title}
                    onError={e => e.target.style.display='none'} />
                )}
                <div>
                  <p style={{ fontWeight:700, marginBottom:4 }}>{movie?.title}</p>
                  <p style={{ fontSize:'0.8rem', color:'var(--clr-text-muted)' }}>{show?.theaterName}</p>
                  <p style={{ fontSize:'0.8rem', color:'var(--clr-text-muted)' }}>{show?.showDate}</p>
                </div>
              </div>

              {/* Seats */}
              <div style={{ marginBottom:'var(--sp-md)' }}>
                <p style={{ fontSize:'0.8rem', color:'var(--clr-text-muted)', marginBottom:6 }}>Seats:</p>
                <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                  {selectedSeats.map(s => (
                    <span key={s.id} className="selected-seat-tag">{s.seatLabel}</span>
                  ))}
                </div>
              </div>

              {/* Price breakdown */}
              <div className="price-breakdown">
                <div className="price-row">
                  <span>Tickets ({selectedSeats.length})</span>
                  <span>₹{totalPrice.toFixed(0)}</span>
                </div>
                <div className="price-row">
                  <span>Convenience fee</span>
                  <span>₹{convFee}</span>
                </div>
                <div className="price-total">
                  <span>Grand Total</span>
                  <span className="text-gold">₹{grandTotal.toFixed(0)}</span>
                </div>
              </div>

              <p style={{ fontSize:'0.75rem', color:'var(--clr-text-dim)', textAlign:'center', marginTop:'var(--sp-md)', display:'flex', alignItems:'center', justifyContent:'center', gap:'6px' }}>
                <Mail size={14} /> Tickets will be sent to your registered email
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
