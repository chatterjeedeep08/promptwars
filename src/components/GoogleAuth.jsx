import { useState } from 'react';
import { Shield, ArrowRight, Loader2 } from 'lucide-react';
import { loginWithGoogle } from '../services/firebase';

export default function GoogleAuth({ onLogin }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignIn = async () => {
    setLoading(true);
    setError('');
    
    try {
      const user = await loginWithGoogle();
      if (user) {
        onLogin(user);
      }
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setError('Failed to authenticate with Google. Please try again or verify your Firebase Domain settings.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'var(--bg-card)', zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24,
    }}>
      <div className="bg-grid" />
      <div className="bg-orb bg-orb-1" style={{ opacity: 0.15 }} />

      <div className="glass-card animate-scale-in" style={{
        maxWidth: 420, width: '100%',
        padding: '40px 32px',
        textAlign: 'center',
        position: 'relative',
        boxShadow: '0 20px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)',
      }}>
        <div style={{
          width: 56, height: 56,
          background: 'rgba(99,102,241,0.1)',
          border: '1px solid rgba(99,102,241,0.3)',
          borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 24px',
        }}>
          <Shield size={28} color="var(--accent-primary)" />
        </div>

        <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>Secured Access</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.6, marginBottom: 32 }}>
          BridgeAI strictly requires Google Authentication to prevent spam abuse and verify emergency responders.
        </p>

        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.1)', color: 'var(--critical)',
            padding: '12px 14px', borderRadius: 'var(--radius-sm)',
            fontSize: 13, marginBottom: 20, textAlign: 'left',
          }}>
            {error}
          </div>
        )}

        <button
          onClick={handleSignIn}
          disabled={loading}
          className="btn btn-primary btn-lg"
          style={{ width: '100%', justifyContent: 'center', height: 48 }}
        >
          {loading ? (
            <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
          ) : (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google <ArrowRight size={16} />
            </>
          )}
        </button>

        <p style={{ marginTop: 24, fontSize: 13, color: 'var(--text-muted)' }}>
          By continuing, you agree to our Terms of Service & Data Privacy policies regarding Emergency Action mapping.
        </p>
      </div>
    </div>
  );
}
