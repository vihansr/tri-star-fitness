import React, { useState, useEffect } from 'react';
import { QrCode, ShieldCheck, Clock, RefreshCw } from 'lucide-react';

export default function MemberQRAccess({ memberName = "Chahal Kashyap", membershipId = "TSF-8892" }) {
  const [qrToken, setQrToken] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0); // 15 seconds
  const [isActive, setIsActive] = useState(false);

  // 15-Second Timer Logic
  useEffect(() => {
    let timer;
    if (isActive && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      setQrToken(null);
    }
    return () => clearInterval(timer);
  }, [isActive, timeLeft]);

  // QR Generate Button Handler (Valid for 15 Seconds)
  const generateQRCode = () => {
    const randomHash = Math.random().toString(36).substring(2, 10).toUpperCase();
    const tokenData = `TRISTAR-PASS-${membershipId}-${randomHash}-${Date.now()}`;
    
    setQrToken(tokenData);
    setTimeLeft(15);
    setIsActive(true);
  };

  // Format seconds into MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="dashboard-card" style={{ marginBottom: '1.5rem', position: 'relative', overflow: 'hidden' }}>
      <div className="card-header-flex" style={{ alignItems: 'flex-start' }}>
        <div>
          <span className="section-label" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            <ShieldCheck size={14} /> SECURE GATE ACCESS
          </span>
          <h3 className="card-title" style={{ marginTop: '0.25rem' }}>Turnstile Entry Pass</h3>
          <p className="card-desc" style={{ marginTop: '0.25rem', maxWidth: '450px' }}>
            Generate your secure gate pass for Location A or Location B. Auto-expires in <strong style={{ color: 'var(--plate-red)' }}>15 seconds</strong>.
          </p>
          
          {/* Member ID and Member Name in black */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', marginTop: '0.85rem', fontSize: '0.9rem', color: 'var(--muted)' }}>
            <div>ID: <strong style={{ color: 'var(--plate-red)' }}>{membershipId}</strong></div>
            <div>Member: <strong style={{ color: '#000' }}>{memberName}</strong></div>
          </div>
        </div>

        {/* Right Side: QR Action & Display Box */}
        <div style={{ background: '#14161b', border: '1px solid rgba(255,255,255,0.1)', padding: '1rem', borderRadius: '12px', minWidth: '220px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          {!isActive ? (
            <button
              type="button"
              className="btn-solid btn-red btn-pulse"
              style={{ width: '100%', padding: '0.75rem 1rem', fontSize: '0.95rem', justifyContent: 'center' }}
              onClick={generateQRCode}
            >
              <QrCode size={18} /> Generate Entry QR
            </button>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', width: '100%' }}>
              {/* Real Generated QR Code Image */}
              <div style={{ background: '#fff', padding: '8px', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=130x130&data=${encodeURIComponent(qrToken || 'TRISTAR-PASS')}`} 
                  alt="Turnstile QR Pass" 
                  style={{ width: '110px', height: '110px', display: 'block' }}
                />
                <span style={{ fontSize: '8px', fontFamily: 'monospace', color: '#333', fontWeight: 700, marginTop: '4px', letterSpacing: '1px' }}>SECURE TOKEN</span>
              </div>

              {/* Countdown Timer */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem', fontFamily: 'monospace', fontWeight: 700, color: timeLeft <= 5 ? 'var(--plate-red)' : 'var(--plate-yellow)', background: timeLeft <= 5 ? 'rgba(220,38,38,0.15)' : 'rgba(234,179,8,0.1)', padding: '0.35rem 0.75rem', borderRadius: '6px', width: '100%', justifyContent: 'center' }}>
                <Clock size={13} /> {timeLeft <= 5 ? 'Expiring Fast:' : 'Expires in:'} {formatTime(timeLeft)}
              </div>

              <button
                type="button"
                onClick={generateQRCode}
                style={{ background: 'transparent', border: 'none', color: 'var(--muted)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' }}
              >
                <RefreshCw size={12} /> Regenerate Pass
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}