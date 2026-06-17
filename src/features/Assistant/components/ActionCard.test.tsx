import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MockAdapter from 'axios-mock-adapter';
import { apiClient } from '@/core/api/client';
import { ActionCard } from '@features/Assistant/components/ActionCard';
import { AssistantView } from '@features/Assistant/views/AssistantView';
import type { ProposedAction } from '@features/Assistant/types';

let mock: MockAdapter;

beforeEach(() => {
  mock = new MockAdapter(apiClient);
});

afterEach(() => {
  mock.restore();
});

function renderCard(actions: ProposedAction[]) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <ActionCard actions={actions} />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

const singleAction: ProposedAction = {
  type: 'CreateItem',
  missingEntities: [],
  summary: 'Create item "AA Batteries"',
  hasDuplicateWarning: false,
  itemName: 'AA Batteries',
  itemCategory: 'Electronics',
};

describe('ActionCard', () => {
  it('renders the action summary with Confirm and Cancel buttons', () => {
    renderCard([singleAction]);

    expect(screen.getByText('Create item "AA Batteries"')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Confirm proposed action' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Cancel proposed action' }),
    ).toBeInTheDocument();
  });

  it('calls /execute on Confirm and shows created entity links on success', async () => {
    mock.onPost('/api/assistant/execute').reply(200, {
      createdEntities: [{ kind: 0, id: 'item-abc', name: 'AA Batteries' }],
    });

    const user = userEvent.setup();
    renderCard([singleAction]);

    await user.click(
      screen.getByRole('button', { name: 'Confirm proposed action' }),
    );

    const link = await screen.findByRole('link', { name: /AA Batteries/ });
    expect(link).toHaveAttribute('href', '/items/item-abc');
    expect(mock.history.post).toHaveLength(1);
    expect(JSON.parse(mock.history.post[0].data as string)).toMatchObject({
      actions: [
        expect.objectContaining({ summary: 'Create item "AA Batteries"' }),
      ],
    });
  });

  it('removes the card without calling /execute when Cancel is clicked', async () => {
    const user = userEvent.setup();
    renderCard([singleAction]);

    await user.click(
      screen.getByRole('button', { name: 'Cancel proposed action' }),
    );

    expect(
      screen.queryByRole('region', { name: /Proposed action/ }),
    ).not.toBeInTheDocument();
    expect(mock.history.post).toHaveLength(0);
  });

  it('shows all steps for a multi-step proposal', () => {
    const step1: ProposedAction = {
      type: 'CreateLocation',
      missingEntities: [],
      summary: 'Create location "Garage"',
      hasDuplicateWarning: false,
      locationName: 'Garage',
    };
    const step2: ProposedAction = {
      type: 'AddStock',
      missingEntities: [{ kind: 'Location', name: 'Garage' }],
      summary: 'Add 2 Drill to Garage',
      hasDuplicateWarning: false,
      resolvedItemId: 'item-drill',
      unresolvedLocationName: 'Garage',
      quantity: 2,
    };

    renderCard([step1, step2]);

    expect(screen.getByText('Create location "Garage"')).toBeInTheDocument();
    expect(screen.getByText('Add 2 Drill to Garage')).toBeInTheDocument();
  });

  it('renders clarification quick-reply buttons when the chat response has a question', async () => {
    mock.onPost('/api/assistant/chat').reply(200, {
      answer: 'Which batteries did you mean?',
      clarificationQuestion: {
        text: 'Please select one:',
        options: ['AA Batteries', 'AAA Batteries'],
      },
    });

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
    const user = userEvent.setup();
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AssistantView />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await user.type(
      screen.getByLabelText('Ask the assistant'),
      'Add batteries',
    );
    await user.click(screen.getByRole('button', { name: 'Send message' }));

    expect(await screen.findByText('Please select one:')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Select: AA Batteries' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Select: AAA Batteries' }),
    ).toBeInTheDocument();
  });
});
