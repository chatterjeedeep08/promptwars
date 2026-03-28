import { useEffect, useState } from 'react';
import { CheckCircle2, Circle, Loader2 } from 'lucide-react';

const PIPELINE_STAGES = [
  {
    id: 'input',
    label: 'Input Processing',
    sublabel: 'Normalizing & formatting raw input',
    icon: '📥',
    duration: 600,
  },
  {
    id: 'gemini',
    label: 'Gemini AI Layer',
    sublabel: 'Multimodal understanding & entity extraction',
    icon: '✨',
    duration: 2000,
  },
  {
    id: 'intent',
    label: 'Intent Engine',
    sublabel: 'Classifying intent & assigning urgency',
    icon: '🎯',
    duration: 500,
  },
  {
    id: 'context',
    label: 'Context Enrichment',
    sublabel: 'Adding GPS, services & real-world data',
    icon: '🌐',
    duration: 700,
  },
  {
    id: 'decision',
    label: 'Decision Engine',
    sublabel: 'Risk assessment & rule validation',
    icon: '⚖️',
    duration: 600,
  },
  {
    id: 'action',
    label: 'Action Orchestrator',
    sublabel: 'Mapping decisions to real-world actions',
    icon: '⚡',
    duration: 500,
  },
  {
    id: 'output',
    label: 'Output Layer',
    sublabel: 'Rendering structured response & alerts',
    icon: '📤',
    duration: 400,
  },
];

export default function PipelineVisualizer({ isProcessing, currentStage, completedStages }) {
  const [visibleStages, setVisibleStages] = useState([]);

  useEffect(() => {
    if (!isProcessing && completedStages.length === 0) {
      setVisibleStages([]);
      return;
    }
    setVisibleStages(PIPELINE_STAGES.map(s => s.id));
  }, [isProcessing, completedStages]);

  const getStageStatus = (stageId) => {
    if (completedStages.includes(stageId)) return 'done';
    if (currentStage === stageId) return 'active';
    if (isProcessing) return 'pending';
    return 'idle';
  };

  const getStageColor = (status) => {
    switch (status) {
      case 'done': return 'var(--accent-emerald)';
      case 'active': return 'var(--accent-primary)';
      case 'pending': return 'rgba(255,255,255,0.2)';
      default: return 'rgba(255,255,255,0.15)';
    }
  };

  if (!isProcessing && completedStages.length === 0) {
    return (
      <div className="glass-card" style={{ padding: '24px' }}>
        <div className="section-label">Pipeline</div>
        <div style={{ textAlign: 'center', padding: '32px 0' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>⚡</div>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
            Pipeline activates when you submit an input
          </p>
        </div>
        {/* Static pipeline preview */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {PIPELINE_STAGES.map((stage, idx) => (
            <div key={stage.id}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', opacity: 0.4 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid var(--border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, flexShrink: 0,
                }}>
                  {stage.icon}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>{stage.label}</div>
                </div>
              </div>
              {idx < PIPELINE_STAGES.length - 1 && (
                <div style={{ width: 1, height: 8, background: 'var(--border)', marginLeft: 31 }} />
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card" style={{ padding: '24px' }}>
      <div className="section-label">Live Pipeline</div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {PIPELINE_STAGES.map((stage, idx) => {
          const status = getStageStatus(stage.id);
          const color = getStageColor(status);
          const isActive = status === 'active';
          const isDone = status === 'done';

          return (
            <div key={stage.id} className={isDone || isActive ? 'animate-fade-in' : ''}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 12px',
                borderRadius: 'var(--radius-sm)',
                background: isActive ? 'rgba(99,102,241,0.08)' : 'transparent',
                border: `1px solid ${isActive ? 'rgba(99,102,241,0.2)' : 'transparent'}`,
                transition: 'all 0.3s',
              }}>
                {/* Status Icon */}
                <div style={{ flexShrink: 0 }}>
                  {isDone ? (
                    <CheckCircle2 size={20} color="var(--accent-emerald)" />
                  ) : isActive ? (
                    <Loader2 size={20} color="var(--accent-primary)" style={{ animation: 'spin 0.8s linear infinite' }} />
                  ) : (
                    <Circle size={20} color={color} />
                  )}
                </div>

                {/* Stage emoji */}
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: isDone ? 'rgba(16,185,129,0.1)' : isActive ? 'rgba(99,102,241,0.1)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${isDone ? 'rgba(16,185,129,0.2)' : isActive ? 'rgba(99,102,241,0.2)' : 'var(--border)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, flexShrink: 0,
                  transition: 'all 0.3s',
                }}>
                  {stage.icon}
                </div>

                {/* Text */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 13, fontWeight: 600,
                    color: isDone ? 'var(--accent-emerald)' : isActive ? 'var(--accent-primary)' : 'var(--text-muted)',
                    transition: 'color 0.3s',
                  }}>
                    {stage.label}
                  </div>
                  {(isActive || isDone) && (
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                      {stage.sublabel}
                    </div>
                  )}
                </div>

                {/* Done badge */}
                {isDone && (
                  <span style={{ fontSize: 10, color: 'var(--accent-emerald)', fontWeight: 600 }}>✓ Done</span>
                )}
                {isActive && (
                  <span style={{ fontSize: 10, color: 'var(--accent-primary)', fontWeight: 600 }}>Processing</span>
                )}
              </div>

              {/* Connector line */}
              {idx < PIPELINE_STAGES.length - 1 && (
                <div style={{
                  width: 2, height: 12,
                  background: isDone ? 'var(--accent-emerald)' : 'var(--border)',
                  marginLeft: 20 + 16 + 5,
                  transition: 'background 0.5s',
                  opacity: isDone ? 0.6 : 0.3,
                }} />
              )}
            </div>
          );
        })}
      </div>

      {/* Overall progress */}
      {(isProcessing || completedStages.length > 0) && (
        <div style={{ marginTop: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Overall Progress</span>
            <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
              {completedStages.length}/{PIPELINE_STAGES.length}
            </span>
          </div>
          <div className="progress-bar-track">
            <div
              className="progress-bar-fill"
              style={{
                width: `${(completedStages.length / PIPELINE_STAGES.length) * 100}%`,
                background: completedStages.length === PIPELINE_STAGES.length
                  ? 'linear-gradient(90deg, var(--accent-emerald), #34d399)'
                  : 'linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))',
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export { PIPELINE_STAGES };
