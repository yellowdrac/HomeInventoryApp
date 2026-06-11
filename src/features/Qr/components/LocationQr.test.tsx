import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

// Replace the QR renderer with a stub that exposes the encoded value so the test
// can assert the deep-link URL without depending on the SVG module internals.
vi.mock('qrcode.react', () => ({
  QRCodeSVG: ({ value, title }: { value: string; title?: string }) => (
    <svg data-testid="qr" data-value={value} aria-label={title} />
  ),
}));

import { LocationQr } from '@features/Qr/components/LocationQr';

describe('LocationQr', () => {
  it('encodes the location deep-link URL (/l/{slug})', () => {
    render(<LocationQr slug="box-3" name="Box 3" />);

    const qr = screen.getByTestId('qr');
    expect(qr.getAttribute('data-value')).toBe(
      `${window.location.origin}/l/box-3`,
    );
  });

  it('exposes an accessible label naming the location', () => {
    render(<LocationQr slug="box-3" name="Box 3" />);
    expect(screen.getByLabelText('QR code for Box 3')).toBeInTheDocument();
  });
});
