import { useState } from 'react';
import { Key, Eye, EyeOff, Zap, AlertCircle } from 'lucide-react';

export default function ApiKeyPrompt({ onSave }) {
  const [key, setKey] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');

  const handleSave = () => {
    const trimmed = key.trim();
    if (!trimmed.startsWith('AIza')) {
      setError('That doesn\'t look like a valid Gemini API key (should start with "AIza")');
      return;
    }
    localStorage.setItem('bridge_ai_key', trimmed);
    onSave(trimmed);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(8, 11, 20, 0.95)',
      backdropFilter: 'blur(20px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px',
    }}>
      <div className="glass-card animate-fade-in-up" style={{ maxWidth: 480, width: '100%', padding: '40px' }}>
        {/* Icon */}
        <div style={{
          width: 60, height: 60,
          background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
          borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 24, boxShadow: '0 0 30px var(--accent-glow)',
        }}>
          <Zap size={28} color="white" />
        </div>

        <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8, letterSpacing: '-0.5px' }}>
          Connect Gemini AI
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6, marginBottom: 28 }}>
          BridgeAI uses Google Gemini for real-time multimodal intent analysis. Enter your API key to activate the full pipeline.
        </p>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>
            Gemini API Key
          </label>
          <div style={{ position: 'relative' }}>
            <Key size={16} style={{
              position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
              color: 'var(--text-muted)',
            }} />
            <input
              type={show ? 'text' : 'password'}
              value={key}
              onChange={e => { setKey(e.target.value); setError(''); }}
              onKeyDown={e => e.key === 'Enter' && handleSave()}
              placeholder="AIza..."
              style={{
                width: '100%', padding: '12px 44px 12px 40px',
                background: 'rgba(255,255,255,0.04)',
                border: `1px solid ${error ? 'var(--critical)' : 'var(--border)'}`,
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-mono)',
                fontSize: 14,
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--accent-primary)'}
              onBlur={e => e.target.style.borderColor = error ? 'var(--critical)' : 'var(--border)'}
              autoFocus
            />
            <button
              onClick={() => setShow(!show)}
              style={{
                position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--text-muted)', display: 'flex', alignItems: 'center',
              }}
            >
              {show ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, color: 'var(--critical)', fontSize: 13 }}>
              <AlertCircle size={14} />
              {error}
            </div>
          )}
        </div>

        <div style={{ padding: '12px 14px', background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 'var(--radius-sm)', marginBottom: 24 }}>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            🔒 Your key is stored only in your browser's localStorage and never sent to any server other than Google's API.
          </p>
        </div>

        <button
          className="btn btn-primary"
          style={{ width: '100%', justifyContent: 'center', padding: '14px' }}
          onClick={handleSave}
          disabled={!key.trim()}
        >
          <Zap size={16} />
          Activate BridgeAI
        </button>

        <p style={{ textAlign: 'center', marginTop: 16, fontSize: 12, color: 'var(--text-muted)' }}>
          Get a free key at{' '}
          <a href="https://aistudio.google.com" target="_blank" rel="noopener noreferrer"
            style={{ color: 'var(--accent-primary)', textDecoration: 'none' }}>
            aistudio.google.com
          </a>
        </p>
      </div>
    </div>
  );
}
