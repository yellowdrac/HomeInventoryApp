import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MockAdapter from 'axios-mock-adapter';
import { apiClient } from '@/core/api/client';
import { AssistantView } from '@features/Assistant/views/AssistantView';

let mock: MockAdapter;

beforeEach(() => {
  mock = new MockAdapter(apiClient);
});

afterEach(() => {
  mock.restore();
});

function renderView() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <AssistantView />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

async function ask(question: string) {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText('Ask the assistant'), question);
  await user.click(screen.getByRole('button', { name: 'Send message' }));
  return user;
}

describe('AssistantView', () => {
  it('shows the user message and renders the assistant answer', async () => {
    mock.onPost('/api/assistant/chat').reply(200, {
      answer: 'Your batteries are in the Garage.',
    });

    renderView();
    await ask('Where are my batteries?');

    expect(
      await screen.findByText('Where are my batteries?'),
    ).toBeInTheDocument();
    expect(
      await screen.findByText('Your batteries are in the Garage.'),
    ).toBeInTheDocument();
  });

  it('prefills the composer when an example is clicked', async () => {
    const user = userEvent.setup();
    renderView();

    await user.click(
      screen.getByRole('button', { name: "What's expiring soon?" }),
    );

    expect(screen.getByLabelText('Ask the assistant')).toHaveValue(
      "What's expiring soon?",
    );
  });

  it('shows a typing indicator while awaiting the answer', async () => {
    // Never resolves, so the mutation stays pending.
    mock.onPost('/api/assistant/chat').reply(() => new Promise(() => {}));

    renderView();
    await ask('How much coffee do I have?');

    expect(await screen.findByText(/typing/i)).toBeInTheDocument();
  });

  it('shows an error when the backend fails', async () => {
    mock.onPost('/api/assistant/chat').reply(500);

    renderView();
    await ask('Where is the rice?');

    expect(await screen.findByRole('alert')).toBeInTheDocument();
  });

  it('renders references as links to the cited item and location', async () => {
    mock.onPost('/api/assistant/chat').reply(200, {
      answer: 'Found them.',
      references: [
        { type: 0, id: 'i1', name: 'AA Batteries' },
        { type: 1, id: 'loc1', name: 'Garage' },
      ],
    });

    renderView();
    await ask('Where are my batteries?');

    const itemLink = await screen.findByRole('link', { name: /AA Batteries/ });
    expect(itemLink).toHaveAttribute('href', '/items/i1');

    const locationLink = screen.getByRole('link', { name: /Garage/ });
    expect(locationLink).toHaveAttribute('href', '/locations?location=loc1');
  });
});
