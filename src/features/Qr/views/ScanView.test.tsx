import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router';

// Mock the camera scanner: expose buttons that drive the onScan/onError props so
// the result handling can be tested without a real camera.
vi.mock('@yudiel/react-qr-scanner', () => ({
  Scanner: ({
    onScan,
    onError,
  }: {
    onScan: (codes: { rawValue: string }[]) => void;
    onError: (err: { kind: string; message: string; cause: unknown }) => void;
  }) => (
    <div>
      <button
        type="button"
        onClick={() =>
          onScan([{ rawValue: 'https://home.example/l/box-3' }])
        }
      >
        emit valid
      </button>
      <button
        type="button"
        onClick={() => onScan([{ rawValue: 'https://home.example/items/x' }])}
      >
        emit invalid
      </button>
      <button
        type="button"
        onClick={() =>
          onError({ kind: 'permission-denied', message: 'no', cause: null })
        }
      >
        emit error
      </button>
    </div>
  ),
}));

import { ScanView } from '@features/Qr/views/ScanView';

function LocationProbe() {
  const location = useLocation();
  return <div data-testid="location">{location.pathname}</div>;
}

function renderApp() {
  return render(
    <MemoryRouter initialEntries={['/scan']}>
      <LocationProbe />
      <Routes>
        <Route path="/scan" element={<ScanView />} />
        <Route path="/l/:slug" element={<div>location page</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('ScanView', () => {
  it('navigates to the location deep link when a valid code is scanned', async () => {
    const user = userEvent.setup();
    renderApp();

    await user.click(screen.getByRole('button', { name: 'emit valid' }));

    expect(screen.getByText('location page')).toBeInTheDocument();
    expect(screen.getByTestId('location')).toHaveTextContent('/l/box-3');
  });

  it('warns when the scanned code is not a location', async () => {
    const user = userEvent.setup();
    renderApp();

    await user.click(screen.getByRole('button', { name: 'emit invalid' }));

    expect(
      screen.getByText(/not a HomeInventory location/i),
    ).toBeInTheDocument();
    expect(screen.getByTestId('location')).toHaveTextContent('/scan');
  });

  it('shows an accessible message when camera permission is denied', async () => {
    const user = userEvent.setup();
    renderApp();

    await user.click(screen.getByRole('button', { name: 'emit error' }));

    expect(screen.getByText(/camera access was blocked/i)).toBeInTheDocument();
  });
});
