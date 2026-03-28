import { describe, it, expect } from 'vitest';
import { runDecisionEngine } from './decisionEngine';

describe('Decision Engine', () => {
  it('escalates to critical if critical symptoms are present', () => {
    const input = {
      urgency: 'low',
      confidence: 0.9,
      entities: {
        symptoms_or_issues: ['patient is unconscious and has chest pain']
      },
      suggested_actions: ['call_emergency_services']
    };

    const result = runDecisionEngine(input, null);
    expect(result.urgency).toBe('critical');
    expect(result.ruleOverridden).toBe(true);
  });

  it('preserves urgency if no rules are triggered', () => {
    const input = {
      urgency: 'low',
      confidence: 0.8,
      entities: {
        symptoms_or_issues: ['minor scrape on knee']
      },
      suggested_actions: ['document_incident']
    };

    const result = runDecisionEngine(input, null);
    expect(result.urgency).toBe('low');
    expect(result.ruleOverridden).toBe(false);
  });

  it('always includes document_incident action', () => {
    const input = {
        urgency: 'medium',
        confidence: 0.9,
        entities: { symptoms_or_issues: [] },
        suggested_actions: []
    };
    const result = runDecisionEngine(input, null);
    expect(result.actions.find(a => a.id === 'document_incident')).toBeDefined();
  });
});
