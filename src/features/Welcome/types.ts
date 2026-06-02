/**
 * Shape of the payload returned by the backend `GET /health` endpoint.
 *
 * Kept permissive on purpose: only `status` is required, everything else is
 * optional so the UI degrades gracefully if a field is missing.
 */
export interface HealthResponse {
  status: string;
  version?: string;
}
