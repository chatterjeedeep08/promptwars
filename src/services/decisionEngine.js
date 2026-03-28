// Decision & Verification Engine — risk scoring, rule-based validation, and action generation

const CRITICAL_SYMPTOMS = [
  'chest pain', 'heart attack', 'cardiac arrest', 'not breathing', 'unconscious',
  'stroke', 'seizure', 'severe bleeding', 'drowning', 'trapped', 'fire',
  'explosion', 'cant breathe', "can't breathe", 'anaphylaxis', 'overdose',
];

const HIGH_RISK_KEYWORDS = [
  'flood', 'collapse', 'broken', 'bleeding', 'accident', 'crash', 'severe',
  'critical', 'emergency', 'urgent', 'pain', 'fall', 'injury', 'threat',
];

const ACTION_CATALOGUE = {
  call_emergency_services: {
    id: 'call_emergency_services',
    label: 'Call Emergency Services',
    description: 'Initiate a 911 / emergency services call with your location',
    icon: '🚨',
    category: 'critical',
    requiresConfirmation: true,
    estimatedTime: '< 30 seconds',
  },
  notify_family_contacts: {
    id: 'notify_family_contacts',
    label: 'Notify Emergency Contacts',
    description: 'Send SMS + location to your registered emergency contacts',
    icon: '📱',
    category: 'high',
    requiresConfirmation: true,
    estimatedTime: '< 10 seconds',
  },
  navigate_to_nearest_hospital: {
    id: 'navigate_to_nearest_hospital',
    label: 'Navigate to Nearest Hospital',
    description: 'Open turn-by-turn navigation to the nearest emergency department',
    icon: '🏥',
    category: 'high',
    requiresConfirmation: false,
    estimatedTime: 'Instant',
  },
  share_location: {
    id: 'share_location',
    label: 'Share Live Location',
    description: 'Broadcast your GPS location to emergency services and contacts',
    icon: '📍',
    category: 'high',
    requiresConfirmation: false,
    estimatedTime: 'Instant',
  },
  perform_cpr_guidance: {
    id: 'perform_cpr_guidance',
    label: 'Launch CPR Guidance',
    description: 'Step-by-step CPR instructions with metronome timing',
    icon: '❤️',
    category: 'critical',
    requiresConfirmation: false,
    estimatedTime: 'Immediate',
  },
  dispatch_rescue_team: {
    id: 'dispatch_rescue_team',
    label: 'Dispatch Rescue Team',
    description: 'Alert nearest disaster rescue squad with your coordinates',
    icon: '🚒',
    category: 'critical',
    requiresConfirmation: true,
    estimatedTime: '2–3 minutes',
  },
  send_flood_alert: {
    id: 'send_flood_alert',
    label: 'Broadcast Flood Alert',
    description: 'Send area-wide flood warning to nearby BridgeAI users',
    icon: '🌊',
    category: 'high',
    requiresConfirmation: false,
    estimatedTime: '< 5 seconds',
  },
  navigate_to_high_ground: {
    id: 'navigate_to_high_ground',
    label: 'Navigate to High Ground',
    description: 'Route to nearest elevated safe zone with real-time flood data',
    icon: '⛰️',
    category: 'high',
    requiresConfirmation: false,
    estimatedTime: 'Instant',
  },
  notify_emergency_contacts: {
    id: 'notify_emergency_contacts',
    label: 'Alert Emergency Network',
    description: 'Notify all registered contacts with situation summary',
    icon: '📢',
    category: 'medium',
    requiresConfirmation: false,
    estimatedTime: '< 15 seconds',
  },
  parse_prescription: {
    id: 'parse_prescription',
    label: 'Parse & Verify Prescription',
    description: 'Extract medication names, dosages, and flag interactions',
    icon: '💊',
    category: 'medium',
    requiresConfirmation: false,
    estimatedTime: '< 5 seconds',
  },
  connect_to_legal_aid: {
    id: 'connect_to_legal_aid',
    label: 'Connect to Legal Aid',
    description: 'Initiate consultation with available legal aid professional',
    icon: '⚖️',
    category: 'medium',
    requiresConfirmation: false,
    estimatedTime: '< 1 minute',
  },
  monitor_vitals: {
    id: 'monitor_vitals',
    label: 'Begin Vitals Monitoring',
    description: 'Start continuous health metric tracking if wearable connected',
    icon: '📊',
    category: 'medium',
    requiresConfirmation: false,
    estimatedTime: 'Instant',
  },
  document_incident: {
    id: 'document_incident',
    label: 'Document Incident',
    description: 'Auto-generate timestamped incident report for legal/insurance',
    icon: '📝',
    category: 'low',
    requiresConfirmation: false,
    estimatedTime: '< 10 seconds',
  },
  generate_report: {
    id: 'generate_report',
    label: 'Generate Action Report',
    description: 'Create structured report of all actions taken for records',
    icon: '📋',
    category: 'low',
    requiresConfirmation: false,
    estimatedTime: 'Instant',
  },
};

function checkRulesOverride(geminiIntent) {
  const issuesList = geminiIntent.entities?.symptoms_or_issues || [];
  const issuesText = issuesList.join(' ').toLowerCase();

  const isCritical = CRITICAL_SYMPTOMS.some(s => issuesText.includes(s));
  const isHigh = HIGH_RISK_KEYWORDS.some(k => issuesText.includes(k));

  if (isCritical && geminiIntent.urgency !== 'critical') {
    return { urgency: 'critical', ruleOverridden: true };
  }
  if (isHigh && geminiIntent.urgency === 'low') {
    return { urgency: 'high', ruleOverridden: true };
  }
  return { urgency: geminiIntent.urgency, ruleOverridden: false };
}

export function runDecisionEngine(geminiOutput, contextData) {
  const { urgency, ruleOverridden } = checkRulesOverride(geminiOutput);

  // Map suggested actions from Gemini to our catalogue
  const suggestedKeys = geminiOutput.suggested_actions || [];
  const mappedActions = suggestedKeys
    .map(key => ACTION_CATALOGUE[key])
    .filter(Boolean);

  // Always add document_incident as a low-priority action
  if (!mappedActions.find(a => a.id === 'document_incident')) {
    mappedActions.push(ACTION_CATALOGUE['document_incident']);
  }

  // Risk score (0–100)
  const urgencyScore = { critical: 95, high: 70, medium: 45, low: 20 };
  const baseScore = urgencyScore[urgency] || 40;
  const confidenceModifier = (geminiOutput.confidence - 0.5) * 20;
  const riskScore = Math.min(100, Math.max(0, Math.round(baseScore + confidenceModifier)));

  const safeguards = [
    ...(geminiOutput.safeguards_applied || []),
    ruleOverridden ? '⚡ Urgency escalated by deterministic rule engine' : null,
    geminiOutput.confidence < 0.75 ? '⚠️ Below 75% confidence — additional verification recommended' : null,
    urgency === 'critical' ? '🔒 Critical actions require human confirmation before execution' : null,
  ].filter(Boolean);

  return {
    urgency,
    riskScore,
    ruleOverridden,
    actions: mappedActions,
    safeguards,
    confidence: geminiOutput.confidence,
    meetsThreshold: geminiOutput.confidence >= 0.65,
    fallbackRequired: geminiOutput.confidence < 0.65,
  };
}

export { ACTION_CATALOGUE };
