import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ActionOrchestrator from './ActionOrchestrator';

describe('ActionOrchestrator', () => {
  const mockActions = [
    {
      id: 'test_action_1',
      label: 'Test Action 1',
      description: 'Desc 1',
      requiresConfirmation: true,
      category: 'critical'
    },
    {
      id: 'test_action_2',
      label: 'Test Action 2',
      description: 'Desc 2',
      requiresConfirmation: false,
      category: 'low'
    }
  ];

  it('renders actions correctly', () => {
    render(<ActionOrchestrator actions={mockActions} urgency="high" />);
    expect(screen.getByText('Test Action 1')).toBeDefined();
    expect(screen.getByText('Test Action 2')).toBeDefined();
  });

  it('triggers confirmation modal for critical actions', () => {
    render(<ActionOrchestrator actions={mockActions} urgency="high" />);
    
    // Find the confirm button for the first action
    const confirmBtn = screen.getByLabelText('Confirm action: Test Action 1');
    fireEvent.click(confirmBtn);

    // Modal should appear
    expect(screen.getByText('Cancel')).toBeDefined();
    expect(screen.getByText('Confirm & Execute')).toBeDefined();
  });

  it('executes non-critical action without modal', () => {
    render(<ActionOrchestrator actions={mockActions} urgency="high" />);
    
    // Find the execute button for the second action
    const execBtn = screen.getByLabelText('Execute action: Test Action 2');
    fireEvent.click(execBtn);

    // Modal should NOT appear
    expect(screen.queryByText('Cancel')).toBeNull();
  });
});
