/**
 * Request/response DTOs for the Assistant feature, mirroring the backend
 * contract under `/api/assistant`.
 *
 * The chat is stateless on the server: the recent conversation history is kept
 * on the client and replayed with every request.
 */

export type ChatRole = 'user' | 'assistant';

/**
 * Kind of entity an answer can cite. Mirrors the backend
 * `AssistantReferenceType` enum; values match the C# declaration order, which
 * is how System.Text.Json serializes the enum by default (numeric).
 */
export const ReferenceType = {
  Item: 0,
  Location: 1,
} as const;

export type ReferenceType = (typeof ReferenceType)[keyof typeof ReferenceType];

/** An item or location cited by the assistant, linkable to its detail page. */
export interface ChatReference {
  type: ReferenceType;
  id: string;
  name: string;
}

/** A single chat turn, as kept in the client-side history. */
export interface ChatMessage {
  role: ChatRole;
  content: string;
  /** Present on assistant turns that cite inventory entities. */
  references?: ChatReference[];
}

/** A history turn sent to the backend (role + content only). */
export interface ChatHistoryEntry {
  role: ChatRole;
  content: string;
}

/** Payload for `POST /api/assistant/chat`. */
export interface AssistantChatRequest {
  message: string;
  history: ChatHistoryEntry[];
}

/** Response from `POST /api/assistant/chat`. */
export interface ChatResponse {
  answer: string;
  references?: ChatReference[];
}
