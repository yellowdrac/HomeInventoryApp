import { describe, it, expect } from 'vitest';
import { getLocationErrorMessage } from '@features/Locations/lib/locationErrors';

interface FakeAxiosError {
  isAxiosError: true;
  response?: { status: number; data?: { title?: string; detail?: string } };
}

function axiosError(
  status: number,
  data?: { title?: string; detail?: string },
): FakeAxiosError {
  return {
    isAxiosError: true,
    response: data ? { status, data } : { status },
  };
}

describe('getLocationErrorMessage', () => {
  it('maps the has-children code to its specific message', () => {
    const error = axiosError(409, { title: 'Location.HasChildren' });
    expect(getLocationErrorMessage(error)).toBe(
      'This location has nested locations. Move or delete them first.',
    );
  });

  it('maps the has-stock code to its specific message', () => {
    const error = axiosError(409, { title: 'Location.HasStock' });
    expect(getLocationErrorMessage(error)).toBe(
      'This location still holds items. Move or remove them before deleting it.',
    );
  });

  it('maps the circular-reference code', () => {
    const error = axiosError(400, { title: 'Location.CircularReference' });
    expect(getLocationErrorMessage(error)).toBe(
      'A location cannot be moved inside itself or one of its descendants.',
    );
  });

  it('falls back to a status-based message for an unknown code', () => {
    expect(getLocationErrorMessage(axiosError(500))).toBe(
      'The server encountered an error. Please try again later.',
    );
  });

  it('reports a connectivity issue when there is no response', () => {
    expect(getLocationErrorMessage({ isAxiosError: true })).toBe(
      'Connection error. Please check your network and try again.',
    );
  });
});
