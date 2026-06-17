/**
 * Request/response DTOs for the Assistant feature, mirroring the backend
 * contract under `/api/assistant`.
 *
 * The chat is stateless on the server: the recent conversation history is kept
 * on the client and replayed with every request.
 */

export type ChatRole = 'user' | 'assistant';

/**
 * Kind of entity an answer can cite / that was created. Mirrors the backend
 * `AssistantReferenceKind` enum; values match the C# declaration order, which
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

/** An entity created or affected by the execute step; shape matches ChatReference for link reuse. */
export interface ExecutedEntityRef {
  kind: ReferenceType;
  id: string;
  name: string;
}

/** A single chat turn, as kept in the client-side history. */
export interface ChatMessage {
  role: ChatRole;
  content: string;
  /** Present on assistant turns that cite inventory entities. */
  references?: ChatReference[];
  /** Write actions the AI proposed; shown as confirmation cards. */
  proposedActions?: ProposedAction[];
  /** Disambiguation question when entity names are ambiguous; shown as quick-reply buttons. */
  clarificationQuestion?: ClarificationQuestion;
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
  proposedActions?: ProposedAction[];
  clarificationQuestion?: ClarificationQuestion;
}

export type ProposedActionType =
  | 'CreateLocation'
  | 'CreateItem'
  | 'AddStock'
  | 'MoveStock';

/** An entity that must be created as a sub-step before the main action runs. */
export interface MissingEntity {
  kind: string;
  name: string;
}

/**
 * A write action proposed by the AI. Sent back to `POST /api/assistant/execute`
 * after user confirmation — the server re-validates everything before executing.
 */
export interface ProposedAction {
  type: ProposedActionType;
  missingEntities: MissingEntity[];
  summary: string;
  hasDuplicateWarning: boolean;
  // CreateLocation
  locationName?: string;
  locationTypeName?: string;
  parentLocationId?: string;
  parentLocationName?: string;
  // CreateItem
  itemName?: string;
  itemCategory?: string;
  itemTrackingTypeName?: string;
  itemUnit?: string;
  // AddStock / MoveStock – item reference
  resolvedItemId?: string;
  unresolvedItemName?: string;
  // AddStock – destination location
  resolvedLocationId?: string;
  unresolvedLocationName?: string;
  quantity?: number;
  expirationDate?: string;
  // MoveStock – source / destination
  resolvedFromLocationId?: string;
  unresolvedFromLocationName?: string;
  resolvedToLocationId?: string;
  unresolvedToLocationName?: string;
}

/** Disambiguation question: shown as quick-reply buttons in the chat. */
export interface ClarificationQuestion {
  text: string;
  options: string[];
}

/** Payload for `POST /api/assistant/execute`. */
export interface ExecuteActionRequest {
  actions: ProposedAction[];
}

/** Response from `POST /api/assistant/execute`. */
export interface ExecuteActionResult {
  createdEntities: ExecutedEntityRef[];
}
