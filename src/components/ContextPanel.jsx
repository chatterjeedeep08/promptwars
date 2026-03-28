import { MapPin, Clock, Phone, CloudSun, Shield } from 'lucide-react';

export default function ContextPanel({ contextData, urgency }) {
  if (!contextData) return null;

  const urgencyColors = {
    critical: 'var(--critical)',
    high: 'var(--high)',
    medium: 'var(--medium)',
    low: 'var(--low)',
  };
  const color = urgencyColors[urgency] || 'var(--accent-primary)';

  return (
    <div className="glass-card animate-fade-in-up" style={{ padding: '24px' }}>
      <div className="section-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span>Context Enrichment</span>
        {contextData.user_location && (
          <span style={{ color: 'var(--text-secondary)', textTransform: 'none', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 }}>
            <MapPin size={12} color="var(--accent-primary)" />
            {contextData.user_location}
          </span>
        )}
      </div>

      {/* Primary Service */}
      <div style={{
        padding: '16px',
        background: `${color}0d`,
        border: `1px solid ${color}22`,
        borderRadius: 'var(--radius-md)',
        marginBottom: 16,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
          <div>
            <h4 style={{ fontSize: 15, fontWeight: 700, marginBottom: 2 }}>{contextData.nearest_service}</h4>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{contextData.service_type}</span>
          </div>
          <span style={{
            fontSize: 11, fontWeight: 600, padding: '3px 10px',
            background: 'rgba(34,197,94,0.1)', color: 'var(--low)',
            border: '1px solid rgba(34,197,94,0.2)', borderRadius: 20,
          }}>
            ● {contextData.status}
          </span>
        </div>

        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-secondary)' }}>
            <MapPin size={14} color={color} />
            {contextData.distance_km} km away
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-secondary)' }}>
            <Clock size={14} color={color} />
            ETA: ~{contextData.eta_mins} mins
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-secondary)' }}>
            <Phone size={14} color={color} />
            {contextData.contact}
          </div>
        </div>
      </div>

      {/* Additional Grid */}
      {contextData.additional && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
          {contextData.additional.map((item, i) => (
            <div
              key={i}
              className="glass-card-inset"
              style={{ padding: '12px 14px' }}
            >
              <div style={{ fontSize: 18, marginBottom: 4 }}>{item.icon}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>{item.label}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{item.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Backup Service */}
      <div style={{
        padding: '10px 14px',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-sm)',
        display: 'flex', alignItems: 'center', gap: 8,
        marginBottom: 10,
      }}>
        <Shield size={14} color="var(--text-muted)" />
        <div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Backup Service</div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{contextData.backup_service}</div>
        </div>
      </div>

      {/* Weather Note */}
      <div style={{
        padding: '10px 14px',
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-sm)',
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <CloudSun size={14} color="var(--text-muted)" />
        <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{contextData.weather_impact}</span>
      </div>
    </div>
  );
}
