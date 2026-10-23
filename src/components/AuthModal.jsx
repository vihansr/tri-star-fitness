import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

export default function AuthModal({ onLoginSuccess = () => {} }) {
  const { modalState, closeAuthModal, login, register } = useAuth();
  const { isOpen, tab: initialTab, role: initialRole } = modalState;

  const [activeTab, setActiveTab] = useState(initialTab || 'login'); // 'login' | 'signup'
  const [selectedRole, setSelectedRole] = useState(initialRole || 'user'); // 'user' | 'admin'

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [branch, setBranch] = useState('sapna_sangeeta');
  const [adminPin, setAdminPin] = useState('');

  // UI state
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync state when modal opened with specific params
  useEffect(() => {
    if (isOpen) {
      setActiveTab(modalState.tab || 'login');
      setSelectedRole(modalState.role || 'user');
      setErrorMsg('');
      if (modalState.role === 'admin' && !email) {
        setEmail('admin@tristar.com');
      } else if (modalState.role === 'user' && !email) {
        setEmail('arjun@tristar.com');
      }
    }
  }, [isOpen, modalState]);

  if (!isOpen) return null;

  const handleFillDemo = (type) => {
    setErrorMsg('');
    if (type === 'admin') {
      setSelectedRole('admin');
      setActiveTab('login');
      setEmail('admin@tristar.com');
      setPassword('admin123');
    } else {
      setSelectedRole('user');
      setActiveTab('login');
      setEmail('arjun@tristar.com');
      setPassword('user123');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    try {
      if (activeTab === 'login') {
        const res = await login(email, password, selectedRole);
        onLoginSuccess(res.user);
      } else {
        // Sign up
        if (selectedRole === 'admin' && !adminPin) {
          throw new Error('Please enter the Admin Security PIN (1234).');
        }
        const res = await register({
          name: name.trim(),
          email: email.trim(),
          password,
          role: selectedRole,
          branch,
          phone: phone.trim() || '+91 98260 00000',
          adminPin: selectedRole === 'admin' ? adminPin : undefined,
        });
        onLoginSuccess(res.user);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Authentication error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-modal-backdrop" onClick={closeAuthModal} role="dialog" aria-modal="true">
      <div className="auth-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="auth-modal-header">
          <div>
            <span className="minimal-caption">TRI-STAR FITNESS AUTHENTICATION</span>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.45rem', marginTop: '0.2rem' }}>
              {activeTab === 'login' ? 'Sign In to Your Account' : 'Create New Account'}
            </h3>
          </div>
          <button
            type="button"
            className="btn-outline-min"
            onClick={closeAuthModal}
            aria-label="Close authentication modal"
            style={{ padding: '0.35rem 0.65rem' }}
          >
            ✕
          </button>
        </div>

        {/* Role Selector Segmented Bar */}
        <div className="auth-role-tabs">
          <button
            type="button"
            className={`auth-role-btn ${selectedRole === 'user' ? 'active' : ''}`}
            onClick={() => {
              setSelectedRole('user');
              setErrorMsg('');
            }}
          >
            🏋️ Athlete / Member
          </button>
          <button
            type="button"
            className={`auth-role-btn ${selectedRole === 'admin' ? 'active' : ''}`}
            onClick={() => {
              setSelectedRole('admin');
              setErrorMsg('');
            }}
          >
            🛡️ Admin / Management
          </button>
        </div>

        {/* Sign In vs Sign Up Tabs */}
        <div className="auth-nav-tabs">
          <button
            type="button"
            className={`auth-nav-btn ${activeTab === 'login' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('login');
              setErrorMsg('');
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`auth-nav-btn ${activeTab === 'signup' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('signup');
              setErrorMsg('');
            }}
          >
            Sign Up
          </button>
        </div>

        {/* Error Notice */}
        {errorMsg && (
          <div className="auth-error-banner" role="alert">
            <span>⚠️</span>
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="auth-form-body">
          {activeTab === 'signup' && (
            <>
              <div className="form-group-min">
                <label className="form-label-min">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vikram Malhotra"
                  className="form-input-min"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="form-group-min">
                <label className="form-label-min">Home Gym Center *</label>
                <select
                  className="form-input-min"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                >
                  <option value="sapna_sangeeta">📍 Sapna Sangeeta (Flagship Center)</option>
                  <option value="manik_bagh">📍 Manik Bagh (South Indore Center)</option>
                  {selectedRole === 'admin' && (
                    <option value="combined">🌐 Combined (All Centers Management)</option>
                  )}
                </select>
              </div>

              <div className="form-group-min">
                <label className="form-label-min">Phone Number</label>
                <input
                  type="tel"
                  placeholder="+91 98260 00000"
                  className="form-input-min"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </>
          )}

          <div className="form-group-min">
            <label className="form-label-min">Email Address *</label>
            <input
              type="email"
              required
              placeholder={selectedRole === 'admin' ? 'admin@tristar.com' : 'athlete@tristar.com'}
              className="form-input-min"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group-min">
            <label className="form-label-min">Password *</label>
            <input
              type="password"
              required
              minLength={6}
              placeholder="••••••••"
              className="form-input-min"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {activeTab === 'signup' && selectedRole === 'admin' && (
            <div className="form-group-min" style={{ border: '1px solid var(--plate-yellow)', padding: '0.85rem', borderRadius: 'var(--radius-sm)' }}>
              <label className="form-label-min" style={{ color: 'var(--ink)' }}>
                🛡️ Admin Security PIN *
              </label>
              <input
                type="password"
                required
                placeholder="Enter 4-digit admin PIN (Default: 1234)"
                className="form-input-min"
                value={adminPin}
                onChange={(e) => setAdminPin(e.target.value)}
              />
              <span style={{ fontSize: '0.72rem', color: 'var(--muted)', display: 'block', marginTop: '0.25rem' }}>
                Gym owner security verification. Default PIN: <strong>1234</strong>
              </span>
            </div>
          )}

          <button
            type="submit"
            className="btn-solid-min"
            disabled={isSubmitting}
            style={{ width: '100%', marginTop: '0.5rem', padding: '0.75rem', justifyContent: 'center' }}
          >
            {isSubmitting
              ? 'Authenticating...'
              : activeTab === 'login'
              ? `Sign In as ${selectedRole === 'admin' ? 'Admin' : 'Athlete'}`
              : `Create ${selectedRole === 'admin' ? 'Admin' : 'Athlete'} Account`}
          </button>
        </form>

        {/* Quick Demo Credentials Fillers */}
        <div className="auth-quick-fill-box">
          <span className="minimal-caption" style={{ display: 'block', marginBottom: '0.45rem' }}>
            QUICK DEMO ONE-CLICK CREDENTIALS:
          </span>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn-outline-min"
              onClick={() => handleFillDemo('user')}
              style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
            >
              🏋️ Arjun (Athlete Demo)
            </button>
            <button
              type="button"
              className="btn-outline-min"
              onClick={() => handleFillDemo('admin')}
              style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
            >
              🛡️ Owner (Admin Demo)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
