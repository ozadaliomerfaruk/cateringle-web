// ============================================================
// MESSAGING TYPES — Add to src/types/database.ts
// ============================================================
//
// Option 1: Run Supabase CLI to regenerate all types:
//   npx supabase gen types typescript --project-id <your-project-id> > src/types/database.ts
//
// Option 2: Manually merge these definitions into your existing database.ts
//
// ============================================================

// ------------------------------------------------------------
// ADD TO: Database["public"]["Tables"]
// ------------------------------------------------------------

/*
Add this inside the Tables interface:

    vendor_lead_messages: {
      Row: {
        id: string
        vendor_lead_id: string
        sender_id: string
        sender_type: "vendor" | "customer"
        content: string
        is_read: boolean
        created_at: string
        deleted_at: string | null
      }
      Insert: {
        id?: string
        vendor_lead_id: string
        sender_id: string
        sender_type: "vendor" | "customer"
        content: string
        is_read?: boolean
        created_at?: string
        deleted_at?: string | null
      }
      Update: {
        id?: string
        vendor_lead_id?: string
        sender_id?: string
        sender_type?: "vendor" | "customer"
        content?: string
        is_read?: boolean
        created_at?: string
        deleted_at?: string | null
      }
      Relationships: [
        {
          foreignKeyName: "vendor_lead_messages_vendor_lead_id_fkey"
          columns: ["vendor_lead_id"]
          isOneToOne: false
          referencedRelation: "vendor_leads"
          referencedColumns: ["id"]
        },
        {
          foreignKeyName: "vendor_lead_messages_sender_id_fkey"
          columns: ["sender_id"]
          isOneToOne: false
          referencedRelation: "users"
          referencedColumns: ["id"]
        }
      ]
    }
*/

// ------------------------------------------------------------
// ADD TO: Database["public"]["Tables"]["vendor_leads"]
// ------------------------------------------------------------

/*
Add this column to vendor_leads.Row, Insert, and Update:

    last_message_at: string | null
*/

// ------------------------------------------------------------
// ADD TO: Database["public"]["Functions"]
// ------------------------------------------------------------

/*
Add these inside the Functions interface:

    can_send_message_to_vendor_lead: {
      Args: {
        p_vendor_lead_id: string
      }
      Returns: boolean
    }
    
    get_message_conversations: {
      Args: {
        p_limit?: number
        p_offset?: number
      }
      Returns: Json
    }
    
    get_unread_message_count: {
      Args: Record<PropertyKey, never>
      Returns: Json
    }
    
    get_vendor_lead_messages: {
      Args: {
        p_vendor_lead_id: string
        p_limit?: number
        p_offset?: number
      }
      Returns: Json
    }
    
    mark_messages_read: {
      Args: {
        p_vendor_lead_id: string
      }
      Returns: Json
    }
    
    send_vendor_lead_message: {
      Args: {
        p_vendor_lead_id: string
        p_content: string
      }
      Returns: Json
    }
*/

// ============================================================
// STANDALONE TYPE DEFINITIONS (use alongside database.ts)
// ============================================================

// Message sender type
export type MessageSenderType = "vendor" | "customer";

// Message type
export type MessageType = "text" | "quote";

// Quote status with valid transitions
export type QuoteStatus = "draft" | "sent" | "viewed" | "accepted" | "rejected" | "expired" | "cancelled";

// Valid quote status transitions (for client-side validation)
export const QUOTE_STATUS_TRANSITIONS: Record<QuoteStatus, QuoteStatus[]> = {
  draft: ["sent", "cancelled"],
  sent: ["viewed", "accepted", "rejected", "expired", "cancelled"],
  viewed: ["accepted", "rejected", "expired", "cancelled"],
  accepted: [], // terminal
  rejected: [], // terminal
  expired: [], // terminal
  cancelled: [], // terminal
};

// Helper to check if status transition is valid
export function isValidQuoteTransition(from: QuoteStatus, to: QuoteStatus): boolean {
  return QUOTE_STATUS_TRANSITIONS[from]?.includes(to) ?? false;
}

// Conversation read state (per-user, per-conversation)
export interface ConversationReadState {
  vendor_lead_id: string;
  user_id: string;
  last_read_at: string;
  created_at: string;
}

// vendor_lead_messages table row
export interface VendorLeadMessage {
  id: string;
  vendor_lead_id: string;
  sender_id: string;
  sender_type: MessageSenderType;
  content: string;
  message_type: MessageType;
  quote_id: string | null;
  created_at: string;
  deleted_at: string | null;
}

// Insert type for vendor_lead_messages
export interface VendorLeadMessageInsert {
  id?: string;
  vendor_lead_id: string;
  sender_id: string;
  sender_type: MessageSenderType;
  content: string;
  message_type?: MessageType;
  quote_id?: string | null;
  created_at?: string;
  deleted_at?: string | null;
}

// Update type for vendor_lead_messages
export interface VendorLeadMessageUpdate {
  id?: string;
  vendor_lead_id?: string;
  sender_id?: string;
  sender_type?: MessageSenderType;
  content?: string;
  message_type?: MessageType;
  quote_id?: string | null;
  created_at?: string;
  deleted_at?: string | null;
}

// ============================================================
// RPC RESPONSE TYPES
// ============================================================

// Generic API response wrapper
export interface ApiResponse<T> {
  ok: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

// Quote data embedded in message
export interface EmbeddedQuote {
  id: string;
  total_price: number;
  price_per_person: number | null;
  message: string | null;
  status: QuoteStatus;
  valid_until: string | null;
  created_at: string;
}

// Message with sender info (returned by get_vendor_lead_messages)
export interface MessageWithSender {
  id: string;
  sender_id: string;
  sender_type: MessageSenderType;
  content: string;
  message_type: MessageType;
  is_read: boolean;
  created_at: string;
  sender_name: string | null;
  is_own: boolean;
  quote: EmbeddedQuote | null;
}

// get_vendor_lead_messages response
export interface GetMessagesResponse {
  messages: MessageWithSender[];
  total_count: number;
  unread_count: number;
  has_more: boolean;
}

// Last message preview (for conversation list)
export interface LastMessagePreview {
  content: string;
  sender_type: MessageSenderType;
  created_at: string;
  is_read: boolean;
}

// Conversation item (returned by get_message_conversations)
export interface ConversationItem {
  vendor_lead_id: string;
  last_message_at: string;
  vendor_id: string;
  business_name: string;
  logo_url: string | null;
  lead_id: string;
  customer_name: string;
  event_date: string | null;
  last_message: LastMessagePreview | null;
  unread_count: number;
  user_role: MessageSenderType;
}

// get_message_conversations response
export interface GetConversationsResponse {
  conversations: ConversationItem[];
  total_count: number;
  has_more: boolean;
}

// send_vendor_lead_message response
export interface SendMessageResponse {
  message_id: string;
  recipient_id: string;
  sender_type: MessageSenderType;
  vendor_lead_id: string;
}

// mark_messages_read response
export interface MarkReadResponse {
  marked_count: number;
}

// get_unread_message_count response
export interface UnreadCountResponse {
  unread_count: number;
}

// ============================================================
// TYPE GUARDS
// ============================================================

export function isApiSuccess<T>(
  response: ApiResponse<T>
): response is ApiResponse<T> & { ok: true; data: T } {
  return response.ok === true && response.data !== undefined;
}

export function isApiError<T>(
  response: ApiResponse<T>
): response is ApiResponse<T> & { ok: false; error: { code: string; message: string } } {
  return response.ok === false && response.error !== undefined;
}

// ============================================================
// CONVERSATION CONTEXT (for lib/messages.ts)
// ============================================================

export interface ConversationContext {
  vendorLeadId: string;
  vendorId: string;
  leadId: string;
  status: string;
  vendor: {
    id: string;
    owner_id: string;
    business_name: string;
    logo_url: string | null;
  };
  lead: {
    id: string;
    customer_profile_id: string | null;
    customer_name: string;
    customer_email: string;
    event_date: string | null;
  };
}
