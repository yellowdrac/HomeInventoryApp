import { describe, it, expect } from 'vitest';
import { getHouseholdErrorMessage } from '@features/Household/lib/householdErrors';

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

describe('getHouseholdErrorMessage', () => {
  it('maps an invalid join code to its specific message', () => {
    const error = axiosError(404, { title: 'Household.InvalidJoinCode' });
    expect(getHouseholdErrorMessage(error)).toBe(
      'That join code did not match any household. Double-check it and try again.',
    );
  });

  it('maps the already-in-household code', () => {
    const error = axiosError(409, { title: 'Household.AlreadyInHousehold' });
    expect(getHouseholdErrorMessage(error)).toBe(
      'You already belong to a household.',
    );
  });

  it('maps the not-owner code', () => {
    const error = axiosError(403, { title: 'Household.NotOwner' });
    expect(getHouseholdErrorMessage(error)).toBe(
      'Only the household owner can perform this action.',
    );
  });

  it('falls back to a status-based message for an unknown code', () => {
    expect(getHouseholdErrorMessage(axiosError(500))).toBe(
      'The server encountered an error. Please try again later.',
    );
  });

  it('reports a connectivity issue when there is no response', () => {
    expect(getHouseholdErrorMessage({ isAxiosError: true })).toBe(
      'Connection error. Please check your network and try again.',
    );
  });
});
