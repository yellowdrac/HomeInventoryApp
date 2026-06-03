/**
 * Request/response DTOs for the household flows, mirroring the backend contract
 * under `/api/households`.
 */

/** Read model describing the current user's household. */
export interface HouseholdResponse {
  id: string;
  name: string;
  joinCode: string;
  ownerUserId: string;
  isOwner: boolean;
}

export interface CreateHouseholdRequest {
  name: string;
}

export interface JoinHouseholdRequest {
  joinCode: string;
}
