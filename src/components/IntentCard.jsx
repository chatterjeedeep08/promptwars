import { useState } from 'react';
import { ChevronDown, ChevronUp, Brain, AlertTriangle } from 'lucide-react';

const INTENT_LABELS = {
  medical_emergency: { label: 'Medical Emergency', emoji: '🚨', color: 'var(--critical)' },
  disaster_response: { label: 'Disaster Response', emoji: '🌊', color: 'var(--critical)' },
  accident_response: { label: 'Accident Response', emoji: '🚗', color: 'var(--high)' },
  medication_parsing: { label: 'Medication Parsing', emoji: '💊', color: 'var(--medium)' },
  legal_assistance: { label: 'Legal Assistance', emoji: '⚖️', color: 'var(--medium)' },
  mental_health: { label: 'Mental Health', emoji: '🧠', color: 'var(--medium)' },
  infrastructure: { label: 'Infrastructure', emoji: '🏗️', color: 'var(--low)' },
  general: { label: 'General Inquiry', emoji: '💬', color: 'var(--low)' },
};

export default function IntentCard({ geminiOutput, decisionOutput }) {
  const [expanded, setExpanded] = useState(false);
  if (!geminiOutput) return null;

  const intentMeta = INTENT_LABELS[geminiOutput.intent] || INTENT_LABELS.general;
  const urgency = decisionOutput?.urgency || geminiOutput.urgency;
  const confidence = geminiOutput.confidence || 0;

  const urgencyColors = {
    critical: 'var(--critical)',
    high: 'var(--high)',
    medium: 'var(--medium)',
    low: 'var(--low)',
  };
  const urgencyColor = urgencyColors[urgency] || 'var(--low)';

  return (
    <div className="glass-card animate-fade-in-up" style={{ padding: '24px', borderColor: `${urgencyColor}33` }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 20 }}>
        <div style={{
          width: 52, height: 52, borderRadius: 14,
          background: `${urgencyColor}15`,
          border: `1px solid ${urgencyColor}33`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 24, flexShrink: 0,
          boxShadow: `0 0 20px ${urgencyColor}20`,
        }}>
          {intentMeta.emoji}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700 }}>{intentMeta.label}</h3>
            <span className={`badge badge-${urgency}`}>
              {urgency === 'critical' ? '🔴' : urgency === 'high' ? '🟠' : urgency === 'medium' ? '🟡' : '🟢'}
              {' '}{urgency}
            </span>
            {decisionOutput?.ruleOverridden && (
              <span className="badge" style={{ background: 'rgba(234,179,8,0.1)', color: 'var(--medium)', border: '1px solid rgba(234,179,8,0.3)', fontSize: 10 }}>
                ⚡ Rule Override
              </span>
            )}
          </div>

          {/* Confidence Bar */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>AI Confidence</span>
              <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: urgencyColor, fontWeight: 600 }}>
                {(confidence * 100).toFixed(0)}%
              </span>
            </div>
            <div className="progress-bar-track">
              <div
                className="progress-bar-fill"
                style={{
                  width: `${confidence * 100}%`,
                  background: confidence > 0.85 ? `linear-gradient(90deg, ${urgencyColor}, ${urgencyColor}aa)` : `linear-gradient(90deg, var(--medium), var(--medium)aa)`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Risk Score */}
      {decisionOutput && (
        <div style={{
          display: 'flex', gap: 12, marginBottom: 20,
        }}>
          <div style={{
            flex: 1, padding: '12px 16px',
            background: `${urgencyColor}0d`,
            border: `1px solid ${urgencyColor}22`,
            borderRadius: 'var(--radius-sm)',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: urgencyColor, lineHeight: 1 }}>
              {decisionOutput.riskScore}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Risk Score / 100</div>
          </div>
          <div style={{
            flex: 2, padding: '12px 16px',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
          }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Risk Assessment</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              {geminiOutput.risk_assessment}
            </div>
          </div>
        </div>
      )}

      {/* Entities */}
      {geminiOutput.entities && (
        <div style={{ marginBottom: 16 }}>
          <div className="section-label" style={{ marginBottom: 10 }}>Extracted Entities</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {geminiOutput.entities.subject && (
              <span className="tag">👤 {geminiOutput.entities.subject}</span>
            )}
            {(geminiOutput.entities.symptoms_or_issues || []).map((s, i) => (
              <span key={i} className="tag" style={{ borderColor: `${urgencyColor}33`, color: 'var(--text-secondary)' }}>
                {s}
              </span>
            ))}
            {geminiOutput.entities.location_hint && (
              <span className="tag">📍 {geminiOutput.entities.location_hint}</span>
            )}
            {geminiOutput.entities.time_sensitivity && (
              <span className="tag">⏱ {geminiOutput.entities.time_sensitivity}</span>
            )}
          </div>
        </div>
      )}

      <hr className="divider" />

      {/* Expandable: Reasoning + Raw */}
      <button
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0',
          color: 'var(--text-secondary)', fontSize: 13,
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Brain size={14} />
          AI Reasoning & Raw Output
        </span>
        {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {expanded && (
        <div className="animate-fade-in" style={{ marginTop: 12 }}>
          {geminiOutput.reasoning && (
            <div style={{
              padding: '12px 14px',
              background: 'rgba(255,255,255,0.03)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border)',
              fontSize: 13, lineHeight: 1.6,
              color: 'var(--text-secondary)',
              marginBottom: 10,
            }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>REASONING</div>
              {geminiOutput.reasoning}
            </div>
          )}

          {/* Safeguards */}
          {decisionOutput?.safeguards && decisionOutput.safeguards.length > 0 && (
            <div style={{
              padding: '10px 14px',
              background: 'rgba(234,179,8,0.05)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid rgba(234,179,8,0.15)',
              marginBottom: 10,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 6, fontSize: 11, color: 'var(--medium)' }}>
                <AlertTriangle size={12} /> SAFEGUARDS APPLIED
              </div>
              {decisionOutput.safeguards.map((s, i) => (
                <div key={i} style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{s}</div>
              ))}
            </div>
          )}

          <div style={{
            padding: '12px 14px',
            background: 'rgba(255,255,255,0.02)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border)',
          }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>RAW GEMINI JSON</div>
            <pre style={{
              fontFamily: 'var(--font-mono)', fontSize: 11,
              color: 'var(--text-secondary)', overflow: 'auto',
              maxHeight: 200, lineHeight: 1.6,
              whiteSpace: 'pre-wrap', wordBreak: 'break-all',
            }}>
              {JSON.stringify(geminiOutput, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
