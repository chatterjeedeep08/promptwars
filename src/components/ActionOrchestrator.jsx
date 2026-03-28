import { useState } from 'react';
import { CheckCircle2, Clock, AlertTriangle, ChevronRight, Lock } from 'lucide-react';

export default function ActionOrchestrator({ actions, urgency }) {
  const [confirmedActions, setConfirmedActions] = useState(new Set());
  const [executedActions, setExecutedActions] = useState(new Set());
  const [pendingConfirm, setPendingConfirm] = useState(null);

  if (!actions || actions.length === 0) return null;

  const urgencyColors = {
    critical: 'var(--critical)',
    high: 'var(--high)',
    medium: 'var(--medium)',
    low: 'var(--low)',
  };

  const categoryColors = {
    critical: { bg: 'var(--critical-bg)', border: 'rgba(239,68,68,0.2)', color: 'var(--critical)' },
    high: { bg: 'var(--high-bg)', border: 'rgba(249,115,22,0.2)', color: 'var(--high)' },
    medium: { bg: 'var(--medium-bg)', border: 'rgba(234,179,8,0.2)', color: 'var(--medium)' },
    low: { bg: 'rgba(255,255,255,0.03)', border: 'var(--border)', color: 'var(--text-muted)' },
  };

  const handleActionClick = (action) => {
    if (action.requiresConfirmation && !confirmedActions.has(action.id)) {
      setPendingConfirm(action);
      return;
    }
    setExecutedActions(prev => new Set([...prev, action.id]));
  };

  const confirmAction = () => {
    if (!pendingConfirm) return;
    setConfirmedActions(prev => new Set([...prev, pendingConfirm.id]));
    setExecutedActions(prev => new Set([...prev, pendingConfirm.id]));
    setPendingConfirm(null);
  };

  return (
    <div className="glass-card animate-fade-in-up" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div className="section-label" style={{ marginBottom: 0 }}>Action Orchestrator</div>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          {executedActions.size}/{actions.length} executed
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {actions.map((action, idx) => {
          const isExecuted = executedActions.has(action.id);
          const cat = categoryColors[action.category] || categoryColors.low;
          const needsConfirm = action.requiresConfirmation && !confirmedActions.has(action.id);

          return (
            <div
              key={action.id}
              className="animate-fade-in-up"
              style={{
                '--delay': `${idx * 80}ms`,
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '14px 16px',
                background: isExecuted ? 'rgba(16,185,129,0.06)' : cat.bg,
                border: `1px solid ${isExecuted ? 'rgba(16,185,129,0.2)' : cat.border}`,
                borderRadius: 'var(--radius-md)',
                transition: 'all 0.3s',
                opacity: isExecuted ? 0.7 : 1,
              }}
            >
              {/* Status */}
              <div style={{ flexShrink: 0 }}>
                {isExecuted
                  ? <CheckCircle2 size={18} color="var(--accent-emerald)" />
                  : <div style={{ fontSize: 20 }}>{action.icon}</div>
                }
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 2 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: isExecuted ? 'var(--accent-emerald)' : 'var(--text-primary)' }}>
                    {isExecuted ? '✓ ' : ''}{action.label}
                  </span>
                  {needsConfirm && (
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 3,
                      fontSize: 10, color: 'var(--medium)',
                      background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.2)',
                      padding: '1px 7px', borderRadius: 20,
                    }}>
                      <Lock size={9} /> Confirm Required
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.4 }}>
                  {action.description}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4, fontSize: 11, color: 'var(--text-muted)' }}>
                  <Clock size={10} />
                  {action.estimatedTime}
                </div>
              </div>

              {/* Action Button */}
              {!isExecuted && (
                <button
                  className="btn btn-sm"
                  onClick={() => handleActionClick(action)}
                  style={{
                    flexShrink: 0,
                    background: needsConfirm ? 'rgba(234,179,8,0.1)' : `${cat.color}15`,
                    color: needsConfirm ? 'var(--medium)' : cat.color,
                    border: `1px solid ${needsConfirm ? 'rgba(234,179,8,0.3)' : cat.border}`,
                  }}
                >
                  {needsConfirm ? <><AlertTriangle size={12} /> Confirm</> : <><ChevronRight size={12} /> Execute</>}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Confirmation Modal */}
      {pendingConfirm && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 500,
          background: 'rgba(8,11,20,0.8)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 24,
        }}>
          <div className="glass-card animate-fade-in-up" style={{ padding: '32px', maxWidth: 440, width: '100%' }}>
            <div style={{ fontSize: 36, marginBottom: 16, textAlign: 'center' }}>{pendingConfirm.icon}</div>
            <h3 style={{ fontSize: 20, fontWeight: 700, textAlign: 'center', marginBottom: 8 }}>
              {pendingConfirm.label}
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, textAlign: 'center', lineHeight: 1.6, marginBottom: 8 }}>
              {pendingConfirm.description}
            </p>
            <div style={{
              padding: '10px 14px', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)',
              borderRadius: 'var(--radius-sm)', marginBottom: 20, textAlign: 'center',
            }}>
              <AlertTriangle size={14} color="var(--critical)" style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
              <span style={{ fontSize: 13, color: 'var(--critical)' }}>
                This is a critical action requiring human confirmation. BridgeAI will not proceed without your explicit approval.
              </span>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center' }}
                onClick={() => setPendingConfirm(null)}>
                Cancel
              </button>
              <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}
                onClick={confirmAction}>
                <CheckCircle2 size={14} /> Confirm & Execute
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
