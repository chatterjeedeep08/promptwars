// Context Enrichment Service — simulates real-world context lookups based on intent

const CONTEXT_DB = {
  medical_emergency: {
    nearest_service: 'City General Hospital',
    service_type: 'Emergency & Trauma Center',
    distance_km: 1.2,
    eta_mins: 4,
    contact: '+1-911',
    status: 'Available',
    backup_service: 'St. Mary\'s Medical Center (2.8 km)',
    weather_impact: 'Clear — no weather delays',
    additional: [
      { label: 'Ambulance ETA', value: '3–5 minutes', icon: '🚑' },
      { label: 'ER Wait Time', value: '< 10 min (Priority)', icon: '🏥' },
      { label: 'Blood Bank', value: 'All types available', icon: '🩸' },
      { label: 'ICU Beds', value: '4 available', icon: '🛏️' },
    ],
  },
  disaster_response: {
    nearest_service: 'District Emergency Operations Center',
    service_type: 'Disaster Relief Hub',
    distance_km: 0.8,
    eta_mins: 6,
    contact: '+1-FEMA',
    status: 'Active — Relief in Progress',
    backup_service: 'Community Center Shelter (1.1 km)',
    weather_impact: '⚠️ Severe weather active — take caution',
    additional: [
      { label: 'Rescue Teams', value: '3 dispatched', icon: '🚒' },
      { label: 'Shelter Capacity', value: '400 available', icon: '🏠' },
      { label: 'Water Level', value: 'Rising — 4 inches/hour', icon: '🌊' },
      { label: 'Evacuation Route', value: 'NH-48 North (clear)', icon: '🛣️' },
    ],
  },
  accident_response: {
    nearest_service: 'Traffic Emergency Unit',
    service_type: 'Highway Patrol & EMS',
    distance_km: 2.1,
    eta_mins: 7,
    contact: '+1-911',
    status: 'Dispatching',
    backup_service: 'Nearest Hospital (3.4 km)',
    weather_impact: 'Wet roads — factor in braking distance',
    additional: [
      { label: 'Police ETA', value: '5–8 minutes', icon: '🚔' },
      { label: 'Tow Service', value: 'Dispatched', icon: '🔧' },
      { label: 'Traffic Alert', value: 'Sent to regional system', icon: '🚦' },
      { label: 'Trauma Center', value: '3.4 km away', icon: '🏥' },
    ],
  },
  medication_parsing: {
    nearest_service: 'PharmaCare 24/7',
    service_type: 'Pharmacy & Clinical Review',
    distance_km: 0.4,
    eta_mins: 2,
    contact: 'In-app consultation',
    status: 'Open 24/7',
    backup_service: 'HealthLine Telehealth (instant)',
    weather_impact: 'No impact',
    additional: [
      { label: 'Drug Database', value: 'Verified against FDA', icon: '💊' },
      { label: 'Interaction Check', value: 'Completed', icon: '✅' },
      { label: 'Pharmacist', value: 'Available now', icon: '👩‍⚕️' },
      { label: 'Refill Status', value: 'Check in progress', icon: '🔄' },
    ],
  },
  legal_assistance: {
    nearest_service: 'Legal Aid Society',
    service_type: 'Civil & Criminal Legal Aid',
    distance_km: 1.9,
    eta_mins: 0,
    contact: 'Virtual consultation',
    status: 'Available — Next slot: 15 mins',
    backup_service: 'Online Legal Helpline (immediate)',
    weather_impact: 'No impact — virtual service',
    additional: [
      { label: 'Lawyer Available', value: 'Yes — Civil law', icon: '⚖️' },
      { label: 'Document Review', value: 'In queue', icon: '📄' },
      { label: 'Case Type Match', value: 'Tenant rights', icon: '🏡' },
      { label: 'Court Date Check', value: 'No conflicts found', icon: '📅' },
    ],
  },
  mental_health: {
    nearest_service: 'Crisis Support Line',
    service_type: 'Mental Health First Response',
    distance_km: 0,
    eta_mins: 0,
    contact: '988',
    status: 'Available 24/7',
    backup_service: 'Certified Counselor (10 min wait)',
    weather_impact: 'No impact',
    additional: [
      { label: 'Counselor', value: 'On standby', icon: '🧠' },
      { label: 'Crisis Line', value: 'Immediate', icon: '📞' },
      { label: 'Safe Space', value: '0.7 km away', icon: '💙' },
      { label: 'Follow-up', value: 'Scheduled automatically', icon: '📋' },
    ],
  },
  general: {
    nearest_service: 'Information Services Hub',
    service_type: 'General Assistance',
    distance_km: 0,
    eta_mins: 0,
    contact: 'In-app',
    status: 'Active',
    backup_service: 'Community helpline',
    weather_impact: 'No impact',
    additional: [
      { label: 'Response Time', value: 'Immediate', icon: '⚡' },
      { label: 'Service Status', value: 'Online', icon: '✅' },
    ],
  },
};

export function getContext(intent) {
  const context = CONTEXT_DB[intent] || CONTEXT_DB['general'];

  // Simulate slight randomness in distance/ETA
  const eta_variation = Math.floor(Math.random() * 3) - 1;
  return {
    ...context,
    eta_mins: Math.max(1, context.eta_mins + eta_variation),
    location: {
      lat: 28.6139 + (Math.random() - 0.5) * 0.01,
      lng: 77.2090 + (Math.random() - 0.5) * 0.01,
      label: 'Your current location',
    },
    timestamp: new Date().toISOString(),
  };
}
