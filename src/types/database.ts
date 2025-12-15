export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action: string
          actor_id: string | null
          actor_type: string
          created_at: string | null
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: unknown
          metadata: Json | null
          request_id: string | null
          user_agent: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          actor_type?: string
          created_at?: string | null
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          request_id?: string | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          actor_type?: string
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          request_id?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author_id: string | null
          content: string
          cover_image_url: string | null
          created_at: string | null
          excerpt: string | null
          id: string
          published_at: string | null
          slug: string
          status: string
          title: string
          updated_at: string | null
        }
        Insert: {
          author_id?: string | null
          content: string
          cover_image_url?: string | null
          created_at?: string | null
          excerpt?: string | null
          id?: string
          published_at?: string | null
          slug: string
          status?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          author_id?: string | null
          content?: string
          cover_image_url?: string | null
          created_at?: string | null
          excerpt?: string | null
          id?: string
          published_at?: string | null
          slug?: string
          status?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "blog_posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "user_profiles_with_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      cities: {
        Row: {
          id: number
          name: string
          slug: string
        }
        Insert: {
          id?: number
          name: string
          slug: string
        }
        Update: {
          id?: number
          name?: string
          slug?: string
        }
        Relationships: []
      }
      conversation_read_state: {
        Row: {
          created_at: string
          last_read_at: string
          user_id: string
          vendor_lead_id: string
        }
        Insert: {
          created_at?: string
          last_read_at?: string
          user_id: string
          vendor_lead_id: string
        }
        Update: {
          created_at?: string
          last_read_at?: string
          user_id?: string
          vendor_lead_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_read_state_vendor_lead_id_fkey"
            columns: ["vendor_lead_id"]
            isOneToOne: false
            referencedRelation: "vendor_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      cuisine_types: {
        Row: {
          category: string | null
          description: string | null
          icon: string | null
          id: number
          is_active: boolean
          name: string
          slug: string
          sort_order: number | null
        }
        Insert: {
          category?: string | null
          description?: string | null
          icon?: string | null
          id?: number
          is_active?: boolean
          name: string
          slug: string
          sort_order?: number | null
        }
        Update: {
          category?: string | null
          description?: string | null
          icon?: string | null
          id?: number
          is_active?: boolean
          name?: string
          slug?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      customer_segments: {
        Row: {
          created_at: string | null
          description: string | null
          icon: string | null
          id: number
          is_active: boolean | null
          name: string
          slug: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: number
          is_active?: boolean | null
          name: string
          slug: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: number
          is_active?: boolean | null
          name?: string
          slug?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      delivery_models: {
        Row: {
          created_at: string | null
          description: string | null
          icon: string | null
          id: number
          is_active: boolean | null
          name: string
          slug: string
          sort_order: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: number
          is_active?: boolean | null
          name: string
          slug: string
          sort_order?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: number
          is_active?: boolean | null
          name?: string
          slug?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      districts: {
        Row: {
          city_id: number
          id: number
          name: string
          slug: string
        }
        Insert: {
          city_id: number
          id?: number
          name: string
          slug: string
        }
        Update: {
          city_id?: number
          id?: number
          name?: string
          slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "districts_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
        ]
      }
      email_logs: {
        Row: {
          created_at: string | null
          email_type: string
          error_message: string | null
          id: string
          recipient_id: string | null
          related_entity_id: string | null
          related_entity_type: string | null
          sent_at: string | null
          status: string
        }
        Insert: {
          created_at?: string | null
          email_type: string
          error_message?: string | null
          id?: string
          recipient_id?: string | null
          related_entity_id?: string | null
          related_entity_type?: string | null
          sent_at?: string | null
          status?: string
        }
        Update: {
          created_at?: string | null
          email_type?: string
          error_message?: string | null
          id?: string
          recipient_id?: string | null
          related_entity_id?: string | null
          related_entity_type?: string | null
          sent_at?: string | null
          status?: string
        }
        Relationships: []
      }
      favorites: {
        Row: {
          created_at: string | null
          id: string
          user_id: string
          vendor_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          user_id: string
          vendor_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          user_id?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles_with_roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorites_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendor_full_profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorites_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      idempotency_keys: {
        Row: {
          created_at: string | null
          entity_id: string
          entity_type: string
          expires_at: string | null
          key: string
          scope: string
        }
        Insert: {
          created_at?: string | null
          entity_id: string
          entity_type: string
          expires_at?: string | null
          key: string
          scope: string
        }
        Update: {
          created_at?: string | null
          entity_id?: string
          entity_type?: string
          expires_at?: string | null
          key?: string
          scope?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          budget_max: number | null
          budget_min: number | null
          city_id: number | null
          created_at: string
          cuisine_preference: string | null
          customer_email: string
          customer_name: string
          customer_phone: string | null
          customer_profile_id: string | null
          deleted_at: string | null
          delivery_model: string | null
          dietary_requirements: string[] | null
          dietary_restrictions: string | null
          district_id: number | null
          event_date: string | null
          event_type: string | null
          guest_count: number | null
          id: string
          is_delivery_only_ok: boolean | null
          is_on_site_service_required: boolean | null
          main_service_category_id: number | null
          menu_notes: string | null
          needs_bartender: boolean | null
          needs_buffet_setup: boolean | null
          needs_chef_on_site: boolean | null
          needs_cleanup: boolean | null
          needs_service_staff: boolean | null
          needs_tables_chairs: boolean | null
          no_tableware_needed: boolean | null
          notes: string | null
          segment_id: number | null
          service_place_type:
            | Database["public"]["Enums"]["service_place_type"]
            | null
          service_style: Database["public"]["Enums"]["service_style"] | null
          source: Database["public"]["Enums"]["lead_source"]
          special_requests: string | null
          tableware_notes: string | null
          wants_disposable_tableware: boolean | null
          wants_real_tableware: boolean | null
        }
        Insert: {
          budget_max?: number | null
          budget_min?: number | null
          city_id?: number | null
          created_at?: string
          cuisine_preference?: string | null
          customer_email: string
          customer_name: string
          customer_phone?: string | null
          customer_profile_id?: string | null
          deleted_at?: string | null
          delivery_model?: string | null
          dietary_requirements?: string[] | null
          dietary_restrictions?: string | null
          district_id?: number | null
          event_date?: string | null
          event_type?: string | null
          guest_count?: number | null
          id?: string
          is_delivery_only_ok?: boolean | null
          is_on_site_service_required?: boolean | null
          main_service_category_id?: number | null
          menu_notes?: string | null
          needs_bartender?: boolean | null
          needs_buffet_setup?: boolean | null
          needs_chef_on_site?: boolean | null
          needs_cleanup?: boolean | null
          needs_service_staff?: boolean | null
          needs_tables_chairs?: boolean | null
          no_tableware_needed?: boolean | null
          notes?: string | null
          segment_id?: number | null
          service_place_type?:
            | Database["public"]["Enums"]["service_place_type"]
            | null
          service_style?: Database["public"]["Enums"]["service_style"] | null
          source?: Database["public"]["Enums"]["lead_source"]
          special_requests?: string | null
          tableware_notes?: string | null
          wants_disposable_tableware?: boolean | null
          wants_real_tableware?: boolean | null
        }
        Update: {
          budget_max?: number | null
          budget_min?: number | null
          city_id?: number | null
          created_at?: string
          cuisine_preference?: string | null
          customer_email?: string
          customer_name?: string
          customer_phone?: string | null
          customer_profile_id?: string | null
          deleted_at?: string | null
          delivery_model?: string | null
          dietary_requirements?: string[] | null
          dietary_restrictions?: string | null
          district_id?: number | null
          event_date?: string | null
          event_type?: string | null
          guest_count?: number | null
          id?: string
          is_delivery_only_ok?: boolean | null
          is_on_site_service_required?: boolean | null
          main_service_category_id?: number | null
          menu_notes?: string | null
          needs_bartender?: boolean | null
          needs_buffet_setup?: boolean | null
          needs_chef_on_site?: boolean | null
          needs_cleanup?: boolean | null
          needs_service_staff?: boolean | null
          needs_tables_chairs?: boolean | null
          no_tableware_needed?: boolean | null
          notes?: string | null
          segment_id?: number | null
          service_place_type?:
            | Database["public"]["Enums"]["service_place_type"]
            | null
          service_style?: Database["public"]["Enums"]["service_style"] | null
          source?: Database["public"]["Enums"]["lead_source"]
          special_requests?: string | null
          tableware_notes?: string | null
          wants_disposable_tableware?: boolean | null
          wants_real_tableware?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_customer_profile_id_fkey"
            columns: ["customer_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_customer_profile_id_fkey"
            columns: ["customer_profile_id"]
            isOneToOne: false
            referencedRelation: "user_profiles_with_roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_main_service_category_id_fkey"
            columns: ["main_service_category_id"]
            isOneToOne: false
            referencedRelation: "categories_with_segments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_main_service_category_id_fkey"
            columns: ["main_service_category_id"]
            isOneToOne: false
            referencedRelation: "category_vendor_counts"
            referencedColumns: ["category_id"]
          },
          {
            foreignKeyName: "leads_main_service_category_id_fkey"
            columns: ["main_service_category_id"]
            isOneToOne: false
            referencedRelation: "corporate_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_main_service_category_id_fkey"
            columns: ["main_service_category_id"]
            isOneToOne: false
            referencedRelation: "individual_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_main_service_category_id_fkey"
            columns: ["main_service_category_id"]
            isOneToOne: false
            referencedRelation: "service_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_segment_id_fkey"
            columns: ["segment_id"]
            isOneToOne: false
            referencedRelation: "customer_segments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_segment_id_fkey"
            columns: ["segment_id"]
            isOneToOne: false
            referencedRelation: "segment_vendor_counts"
            referencedColumns: ["segment_id"]
          },
        ]
      }
      menu_categories: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          sort_order: number | null
          vendor_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          sort_order?: number | null
          vendor_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          sort_order?: number | null
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "menu_categories_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendor_full_profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "menu_categories_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_items: {
        Row: {
          category_id: string
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          min_order_count: number | null
          name: string
          price_per_person: number | null
          sort_order: number | null
          updated_at: string | null
          vendor_id: string
        }
        Insert: {
          category_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          min_order_count?: number | null
          name: string
          price_per_person?: number | null
          sort_order?: number | null
          updated_at?: string | null
          vendor_id: string
        }
        Update: {
          category_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          min_order_count?: number | null
          name?: string
          price_per_person?: number | null
          sort_order?: number | null
          updated_at?: string | null
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "menu_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "menu_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "menu_items_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendor_full_profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "menu_items_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          booking_reminder_email: boolean | null
          booking_reminder_inapp: boolean | null
          created_at: string | null
          id: string
          lead_new_email: boolean | null
          lead_new_inapp: boolean | null
          message_new_email: boolean | null
          message_new_inapp: boolean | null
          quote_accepted_email: boolean | null
          quote_accepted_inapp: boolean | null
          quote_received_email: boolean | null
          quote_received_inapp: boolean | null
          quote_rejected_email: boolean | null
          quote_rejected_inapp: boolean | null
          review_new_email: boolean | null
          review_new_inapp: boolean | null
          system_email: boolean | null
          system_inapp: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          booking_reminder_email?: boolean | null
          booking_reminder_inapp?: boolean | null
          created_at?: string | null
          id?: string
          lead_new_email?: boolean | null
          lead_new_inapp?: boolean | null
          message_new_email?: boolean | null
          message_new_inapp?: boolean | null
          quote_accepted_email?: boolean | null
          quote_accepted_inapp?: boolean | null
          quote_received_email?: boolean | null
          quote_received_inapp?: boolean | null
          quote_rejected_email?: boolean | null
          quote_rejected_inapp?: boolean | null
          review_new_email?: boolean | null
          review_new_inapp?: boolean | null
          system_email?: boolean | null
          system_inapp?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          booking_reminder_email?: boolean | null
          booking_reminder_inapp?: boolean | null
          created_at?: string | null
          id?: string
          lead_new_email?: boolean | null
          lead_new_inapp?: boolean | null
          message_new_email?: boolean | null
          message_new_inapp?: boolean | null
          quote_accepted_email?: boolean | null
          quote_accepted_inapp?: boolean | null
          quote_received_email?: boolean | null
          quote_received_inapp?: boolean | null
          quote_rejected_email?: boolean | null
          quote_rejected_inapp?: boolean | null
          review_new_email?: boolean | null
          review_new_inapp?: boolean | null
          system_email?: boolean | null
          system_inapp?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          action_url: string | null
          created_at: string | null
          deleted_at: string | null
          entity_id: string | null
          entity_type: string | null
          id: string
          is_read: boolean | null
          message: string | null
          metadata: Json | null
          read_at: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string | null
          deleted_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          is_read?: boolean | null
          message?: string | null
          metadata?: Json | null
          read_at?: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Update: {
          action_url?: string | null
          created_at?: string | null
          deleted_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          is_read?: boolean | null
          message?: string | null
          metadata?: Json | null
          read_at?: string | null
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string
        }
        Relationships: []
      }
      packages: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          includes: string[] | null
          is_active: boolean | null
          max_guest_count: number | null
          min_guest_count: number | null
          name: string
          price_per_person: number
          sort_order: number | null
          updated_at: string | null
          vendor_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          includes?: string[] | null
          is_active?: boolean | null
          max_guest_count?: number | null
          min_guest_count?: number | null
          name: string
          price_per_person: number
          sort_order?: number | null
          updated_at?: string | null
          vendor_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          includes?: string[] | null
          is_active?: boolean | null
          max_guest_count?: number | null
          min_guest_count?: number | null
          name?: string
          price_per_person?: number
          sort_order?: number | null
          updated_at?: string | null
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "packages_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendor_full_profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "packages_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      popular_filters: {
        Row: {
          created_at: string | null
          filter_key: string
          filter_type: string
          icon: string | null
          id: number
          is_active: boolean | null
          label: string
          sort_order: number | null
        }
        Insert: {
          created_at?: string | null
          filter_key: string
          filter_type: string
          icon?: string | null
          id?: number
          is_active?: boolean | null
          label: string
          sort_order?: number | null
        }
        Update: {
          created_at?: string | null
          filter_key?: string
          filter_type?: string
          icon?: string | null
          id?: number
          is_active?: boolean | null
          label?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          deleted_at: string | null
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
      quote_revisions: {
        Row: {
          change_note: string | null
          change_type: string
          changed_by: string | null
          created_at: string | null
          exclusions: string | null
          id: string
          inclusions: string | null
          message: string | null
          price_per_person: number | null
          quote_id: string
          revision_number: number
          terms: string | null
          total_price: number
          valid_until: string | null
        }
        Insert: {
          change_note?: string | null
          change_type: string
          changed_by?: string | null
          created_at?: string | null
          exclusions?: string | null
          id?: string
          inclusions?: string | null
          message?: string | null
          price_per_person?: number | null
          quote_id: string
          revision_number?: number
          terms?: string | null
          total_price: number
          valid_until?: string | null
        }
        Update: {
          change_note?: string | null
          change_type?: string
          changed_by?: string | null
          created_at?: string | null
          exclusions?: string | null
          id?: string
          inclusions?: string | null
          message?: string | null
          price_per_person?: number | null
          quote_id?: string
          revision_number?: number
          terms?: string | null
          total_price?: number
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quote_revisions_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      quote_templates: {
        Row: {
          created_at: string | null
          default_price_per_person: number | null
          deposit_percentage: number | null
          description: string | null
          exclusions: string | null
          id: string
          inclusions: string | null
          is_default: boolean | null
          message: string | null
          name: string
          terms: string | null
          title: string | null
          updated_at: string | null
          usage_count: number | null
          valid_days: number | null
          vendor_id: string
        }
        Insert: {
          created_at?: string | null
          default_price_per_person?: number | null
          deposit_percentage?: number | null
          description?: string | null
          exclusions?: string | null
          id?: string
          inclusions?: string | null
          is_default?: boolean | null
          message?: string | null
          name: string
          terms?: string | null
          title?: string | null
          updated_at?: string | null
          usage_count?: number | null
          valid_days?: number | null
          vendor_id: string
        }
        Update: {
          created_at?: string | null
          default_price_per_person?: number | null
          deposit_percentage?: number | null
          description?: string | null
          exclusions?: string | null
          id?: string
          inclusions?: string | null
          is_default?: boolean | null
          message?: string | null
          name?: string
          terms?: string | null
          title?: string | null
          updated_at?: string | null
          usage_count?: number | null
          valid_days?: number | null
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quote_templates_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendor_full_profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quote_templates_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      quotes: {
        Row: {
          counter_offer_by: string | null
          counter_offer_note: string | null
          created_at: string
          customer_response_note: string | null
          deleted_at: string | null
          deposit_amount: number | null
          deposit_percentage: number | null
          exclusions: string | null
          id: string
          inclusions: string | null
          is_counter_offer: boolean | null
          message: string | null
          parent_quote_id: string | null
          price_per_person: number | null
          responded_at: string | null
          sent_at: string | null
          status: Database["public"]["Enums"]["quote_status"]
          terms: string | null
          title: string | null
          total_price: number
          updated_at: string
          valid_until: string | null
          vendor_lead_id: string
          viewed_at: string | null
        }
        Insert: {
          counter_offer_by?: string | null
          counter_offer_note?: string | null
          created_at?: string
          customer_response_note?: string | null
          deleted_at?: string | null
          deposit_amount?: number | null
          deposit_percentage?: number | null
          exclusions?: string | null
          id?: string
          inclusions?: string | null
          is_counter_offer?: boolean | null
          message?: string | null
          parent_quote_id?: string | null
          price_per_person?: number | null
          responded_at?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["quote_status"]
          terms?: string | null
          title?: string | null
          total_price: number
          updated_at?: string
          valid_until?: string | null
          vendor_lead_id: string
          viewed_at?: string | null
        }
        Update: {
          counter_offer_by?: string | null
          counter_offer_note?: string | null
          created_at?: string
          customer_response_note?: string | null
          deleted_at?: string | null
          deposit_amount?: number | null
          deposit_percentage?: number | null
          exclusions?: string | null
          id?: string
          inclusions?: string | null
          is_counter_offer?: boolean | null
          message?: string | null
          parent_quote_id?: string | null
          price_per_person?: number | null
          responded_at?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["quote_status"]
          terms?: string | null
          title?: string | null
          total_price?: number
          updated_at?: string
          valid_until?: string | null
          vendor_lead_id?: string
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quotes_parent_quote_id_fkey"
            columns: ["parent_quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_vendor_lead_id_fkey"
            columns: ["vendor_lead_id"]
            isOneToOne: false
            referencedRelation: "vendor_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      review_replies: {
        Row: {
          created_at: string | null
          id: string
          reply_text: string
          review_id: string
          updated_at: string | null
          vendor_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          reply_text: string
          review_id: string
          updated_at?: string | null
          vendor_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          reply_text?: string
          review_id?: string
          updated_at?: string | null
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_replies_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: true
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_replies_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendor_full_profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_replies_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      review_votes: {
        Row: {
          created_at: string | null
          id: string
          is_helpful: boolean
          review_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_helpful: boolean
          review_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_helpful?: boolean
          review_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_votes_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string | null
          customer_email: string | null
          customer_id: string | null
          customer_name: string
          deleted_at: string | null
          event_date: string | null
          event_type: string | null
          guest_count: number | null
          helpful_count: number | null
          id: string
          is_approved: boolean | null
          is_verified: boolean | null
          not_helpful_count: number | null
          rating: number
          updated_at: string | null
          vendor_id: string
          vendor_reply: string | null
          vendor_reply_at: string | null
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          customer_email?: string | null
          customer_id?: string | null
          customer_name: string
          deleted_at?: string | null
          event_date?: string | null
          event_type?: string | null
          guest_count?: number | null
          helpful_count?: number | null
          id?: string
          is_approved?: boolean | null
          is_verified?: boolean | null
          not_helpful_count?: number | null
          rating: number
          updated_at?: string | null
          vendor_id: string
          vendor_reply?: string | null
          vendor_reply_at?: string | null
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          customer_email?: string | null
          customer_id?: string | null
          customer_name?: string
          deleted_at?: string | null
          event_date?: string | null
          event_type?: string | null
          guest_count?: number | null
          helpful_count?: number | null
          id?: string
          is_approved?: boolean | null
          is_verified?: boolean | null
          not_helpful_count?: number | null
          rating?: number
          updated_at?: string | null
          vendor_id?: string
          vendor_reply?: string | null
          vendor_reply_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "user_profiles_with_roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendor_full_profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          created_at: string | null
          description: string | null
          id: number
          name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: number
          name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: number
          name?: string
        }
        Relationships: []
      }
      service_categories: {
        Row: {
          created_at: string | null
          description: string | null
          icon: string | null
          id: number
          is_active: boolean | null
          name: string
          segment_id: number | null
          slug: string
          sort_order: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: never
          is_active?: boolean | null
          name: string
          segment_id?: number | null
          slug: string
          sort_order?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: never
          is_active?: boolean | null
          name?: string
          segment_id?: number | null
          slug?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "service_categories_segment_id_fkey"
            columns: ["segment_id"]
            isOneToOne: false
            referencedRelation: "customer_segments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_categories_segment_id_fkey"
            columns: ["segment_id"]
            isOneToOne: false
            referencedRelation: "segment_vendor_counts"
            referencedColumns: ["segment_id"]
          },
        ]
      }
      service_groups: {
        Row: {
          created_at: string | null
          icon: string | null
          id: number
          is_active: boolean | null
          name: string
          slug: string
          sort_order: number | null
        }
        Insert: {
          created_at?: string | null
          icon?: string | null
          id?: never
          is_active?: boolean | null
          name: string
          slug: string
          sort_order?: number | null
        }
        Update: {
          created_at?: string | null
          icon?: string | null
          id?: never
          is_active?: boolean | null
          name?: string
          slug?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      services: {
        Row: {
          created_at: string | null
          group_id: number
          icon: string | null
          id: number
          is_active: boolean | null
          name: string
          slug: string
          sort_order: number | null
        }
        Insert: {
          created_at?: string | null
          group_id: number
          icon?: string | null
          id?: never
          is_active?: boolean | null
          name: string
          slug: string
          sort_order?: number | null
        }
        Update: {
          created_at?: string | null
          group_id?: number
          icon?: string | null
          id?: never
          is_active?: boolean | null
          name?: string
          slug?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "services_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "service_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      site_settings: {
        Row: {
          created_at: string | null
          description: string | null
          id: number
          key: string
          updated_at: string | null
          value: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: number
          key: string
          updated_at?: string | null
          value?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: number
          key?: string
          updated_at?: string | null
          value?: string | null
        }
        Relationships: []
      }
      tag_groups: {
        Row: {
          created_at: string | null
          description: string | null
          icon: string | null
          id: number
          is_active: boolean | null
          name: string
          slug: string
          sort_order: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: number
          is_active?: boolean | null
          name: string
          slug: string
          sort_order?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: number
          is_active?: boolean | null
          name?: string
          slug?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      tags: {
        Row: {
          created_at: string | null
          description: string | null
          group_id: number
          icon: string | null
          id: number
          is_active: boolean | null
          name: string
          slug: string
          sort_order: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          group_id: number
          icon?: string | null
          id?: number
          is_active?: boolean | null
          name: string
          slug: string
          sort_order?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          group_id?: number
          icon?: string | null
          id?: number
          is_active?: boolean | null
          name?: string
          slug?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "tags_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "tag_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          granted_at: string | null
          granted_by: string | null
          id: string
          is_active: boolean | null
          role_id: number
          user_id: string
        }
        Insert: {
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          is_active?: boolean | null
          role_id: number
          user_id: string
        }
        Update: {
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          is_active?: boolean | null
          role_id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_applications: {
        Row: {
          applicant_user_id: string | null
          business_name: string
          city_text: string | null
          contact_email: string
          contact_name: string
          contact_phone: string | null
          created_at: string
          created_user_id: string | null
          created_vendor_id: string | null
          district_text: string | null
          id: string
          instagram_handle: string | null
          main_service_categories: string | null
          max_guest_count: number | null
          min_guest_count: number | null
          notes: string | null
          offers_cleanup: boolean | null
          offers_delivery_only: boolean | null
          offers_disposable_tableware: boolean | null
          offers_on_site_service: boolean | null
          offers_real_tableware: boolean | null
          offers_service_staff: boolean | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          target_segments: number[] | null
          website_url: string | null
        }
        Insert: {
          applicant_user_id?: string | null
          business_name: string
          city_text?: string | null
          contact_email: string
          contact_name: string
          contact_phone?: string | null
          created_at?: string
          created_user_id?: string | null
          created_vendor_id?: string | null
          district_text?: string | null
          id?: string
          instagram_handle?: string | null
          main_service_categories?: string | null
          max_guest_count?: number | null
          min_guest_count?: number | null
          notes?: string | null
          offers_cleanup?: boolean | null
          offers_delivery_only?: boolean | null
          offers_disposable_tableware?: boolean | null
          offers_on_site_service?: boolean | null
          offers_real_tableware?: boolean | null
          offers_service_staff?: boolean | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          target_segments?: number[] | null
          website_url?: string | null
        }
        Update: {
          applicant_user_id?: string | null
          business_name?: string
          city_text?: string | null
          contact_email?: string
          contact_name?: string
          contact_phone?: string | null
          created_at?: string
          created_user_id?: string | null
          created_vendor_id?: string | null
          district_text?: string | null
          id?: string
          instagram_handle?: string | null
          main_service_categories?: string | null
          max_guest_count?: number | null
          min_guest_count?: number | null
          notes?: string | null
          offers_cleanup?: boolean | null
          offers_delivery_only?: boolean | null
          offers_disposable_tableware?: boolean | null
          offers_on_site_service?: boolean | null
          offers_real_tableware?: boolean | null
          offers_service_staff?: boolean | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          target_segments?: number[] | null
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vendor_applications_created_vendor_id_fkey"
            columns: ["created_vendor_id"]
            isOneToOne: false
            referencedRelation: "vendor_full_profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_applications_created_vendor_id_fkey"
            columns: ["created_vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_applications_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_applications_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "user_profiles_with_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_availability: {
        Row: {
          created_at: string | null
          day_of_week: number
          end_time: string | null
          id: string
          is_available: boolean | null
          max_events_per_day: number | null
          start_time: string | null
          updated_at: string | null
          vendor_id: string
        }
        Insert: {
          created_at?: string | null
          day_of_week: number
          end_time?: string | null
          id?: string
          is_available?: boolean | null
          max_events_per_day?: number | null
          start_time?: string | null
          updated_at?: string | null
          vendor_id: string
        }
        Update: {
          created_at?: string | null
          day_of_week?: number
          end_time?: string | null
          id?: string
          is_available?: boolean | null
          max_events_per_day?: number | null
          start_time?: string | null
          updated_at?: string | null
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_availability_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendor_full_profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_availability_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_blocked_dates: {
        Row: {
          blocked_date: string
          created_at: string | null
          id: string
          note: string | null
          reason: string | null
          vendor_id: string
        }
        Insert: {
          blocked_date: string
          created_at?: string | null
          id?: string
          note?: string | null
          reason?: string | null
          vendor_id: string
        }
        Update: {
          blocked_date?: string
          created_at?: string | null
          id?: string
          note?: string | null
          reason?: string | null
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_blocked_dates_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendor_full_profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_blocked_dates_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_bookings: {
        Row: {
          cancelled_at: string | null
          completed_at: string | null
          created_at: string | null
          customer_email: string | null
          customer_name: string
          customer_phone: string | null
          event_address: string | null
          event_city: string | null
          event_date: string
          event_district: string | null
          event_end_time: string | null
          event_start_time: string | null
          event_type: string | null
          guest_count: number | null
          id: string
          internal_note: string | null
          lead_id: string | null
          quote_id: string | null
          status: string | null
          updated_at: string | null
          vendor_id: string
        }
        Insert: {
          cancelled_at?: string | null
          completed_at?: string | null
          created_at?: string | null
          customer_email?: string | null
          customer_name: string
          customer_phone?: string | null
          event_address?: string | null
          event_city?: string | null
          event_date: string
          event_district?: string | null
          event_end_time?: string | null
          event_start_time?: string | null
          event_type?: string | null
          guest_count?: number | null
          id?: string
          internal_note?: string | null
          lead_id?: string | null
          quote_id?: string | null
          status?: string | null
          updated_at?: string | null
          vendor_id: string
        }
        Update: {
          cancelled_at?: string | null
          completed_at?: string | null
          created_at?: string | null
          customer_email?: string | null
          customer_name?: string
          customer_phone?: string | null
          event_address?: string | null
          event_city?: string | null
          event_date?: string
          event_district?: string | null
          event_end_time?: string | null
          event_start_time?: string | null
          event_type?: string | null
          guest_count?: number | null
          id?: string
          internal_note?: string | null
          lead_id?: string | null
          quote_id?: string | null
          status?: string | null
          updated_at?: string | null
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_bookings_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_bookings_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_bookings_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendor_full_profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_bookings_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_categories: {
        Row: {
          category_id: number
          created_at: string | null
          id: string
          vendor_id: string
        }
        Insert: {
          category_id: number
          created_at?: string | null
          id?: string
          vendor_id: string
        }
        Update: {
          category_id?: number
          created_at?: string | null
          id?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories_with_segments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "category_vendor_counts"
            referencedColumns: ["category_id"]
          },
          {
            foreignKeyName: "vendor_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "corporate_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "individual_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "service_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_categories_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendor_full_profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_categories_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_cuisines: {
        Row: {
          created_at: string | null
          cuisine_type_id: number
          id: string
          vendor_id: string
        }
        Insert: {
          created_at?: string | null
          cuisine_type_id: number
          id?: string
          vendor_id: string
        }
        Update: {
          created_at?: string | null
          cuisine_type_id?: number
          id?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_cuisines_cuisine_type_id_fkey"
            columns: ["cuisine_type_id"]
            isOneToOne: false
            referencedRelation: "cuisine_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_cuisines_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendor_full_profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_cuisines_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_delivery_models: {
        Row: {
          created_at: string | null
          delivery_model_id: number
          id: string
          vendor_id: string
        }
        Insert: {
          created_at?: string | null
          delivery_model_id: number
          id?: string
          vendor_id: string
        }
        Update: {
          created_at?: string | null
          delivery_model_id?: number
          id?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_delivery_models_delivery_model_id_fkey"
            columns: ["delivery_model_id"]
            isOneToOne: false
            referencedRelation: "delivery_models"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_delivery_models_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendor_full_profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_delivery_models_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_images: {
        Row: {
          created_at: string | null
          id: string
          image_url: string
          is_primary: boolean
          sort_order: number | null
          vendor_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          image_url: string
          is_primary?: boolean
          sort_order?: number | null
          vendor_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          image_url?: string
          is_primary?: boolean
          sort_order?: number | null
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vendor_images_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendor_full_profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_images_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_lead_messages: {
        Row: {
          content: string
          created_at: string
          deleted_at: string | null
          id: string
          is_read: boolean
          message_type: string | null
          quote_id: string | null
          sender_id: string
          sender_type: string
          vendor_lead_id: string
        }
        Insert: {
          content: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          is_read?: boolean
          message_type?: string | null
          quote_id?: string | null
          sender_id: string
          sender_type: string
          vendor_lead_id: string
        }
        Update: {
          content?: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          is_read?: boolean
          message_type?: string | null
          quote_id?: string | null
          sender_id?: string
          sender_type?: string
          vendor_lead_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_lead_messages_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_lead_messages_vendor_lead_id_fkey"
            columns: ["vendor_lead_id"]
            isOneToOne: false
            referencedRelation: "vendor_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_leads: {
        Row: {
          created_at: string
          deleted_at: string | null
          id: string
          last_message_at: string | null
          lead_id: string
          responded_at: string | null
          status: Database["public"]["Enums"]["vendor_lead_status"]
          updated_at: string
          vendor_id: string
          vendor_note: string | null
          viewed_at: string | null
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          last_message_at?: string | null
          lead_id: string
          responded_at?: string | null
          status?: Database["public"]["Enums"]["vendor_lead_status"]
          updated_at?: string
          vendor_id: string
          vendor_note?: string | null
          viewed_at?: string | null
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          last_message_at?: string | null
          lead_id?: string
          responded_at?: string | null
          status?: Database["public"]["Enums"]["vendor_lead_status"]
          updated_at?: string
          vendor_id?: string
          vendor_note?: string | null
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vendor_leads_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_leads_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendor_full_profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_leads_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_packages: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          max_guest_count: number | null
          min_guest_count: number | null
          name: string
          price_per_person: number | null
          sort_order: number
          updated_at: string
          vendor_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          max_guest_count?: number | null
          min_guest_count?: number | null
          name: string
          price_per_person?: number | null
          sort_order?: number
          updated_at?: string
          vendor_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          max_guest_count?: number | null
          min_guest_count?: number | null
          name?: string
          price_per_person?: number | null
          sort_order?: number
          updated_at?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_packages_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendor_full_profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_packages_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_segments: {
        Row: {
          created_at: string | null
          id: string
          segment_id: number
          vendor_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          segment_id: number
          vendor_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          segment_id?: number
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_segments_segment_id_fkey"
            columns: ["segment_id"]
            isOneToOne: false
            referencedRelation: "customer_segments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_segments_segment_id_fkey"
            columns: ["segment_id"]
            isOneToOne: false
            referencedRelation: "segment_vendor_counts"
            referencedColumns: ["segment_id"]
          },
          {
            foreignKeyName: "vendor_segments_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendor_full_profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_segments_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_service_areas: {
        Row: {
          city_id: number
          created_at: string | null
          district_id: number | null
          id: number
          vendor_id: string
        }
        Insert: {
          city_id: number
          created_at?: string | null
          district_id?: number | null
          id?: number
          vendor_id: string
        }
        Update: {
          city_id?: number
          created_at?: string | null
          district_id?: number | null
          id?: number
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_service_areas_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_service_areas_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_service_areas_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendor_full_profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_service_areas_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_services: {
        Row: {
          created_at: string | null
          id: string
          service_id: number
          vendor_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          service_id: number
          vendor_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          service_id?: number
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_services_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_services_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendor_full_profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_services_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_tags: {
        Row: {
          created_at: string | null
          id: string
          tag_id: number
          vendor_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          tag_id: number
          vendor_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          tag_id?: number
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_tags_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendor_full_profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_tags_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      vendors: {
        Row: {
          accepts_last_minute: boolean | null
          address_text: string | null
          available_24_7: boolean | null
          avg_price_per_person: number | null
          business_name: string
          city_id: number | null
          created_at: string
          deleted_at: string | null
          delivery_base_fee: number | null
          delivery_notes: string | null
          delivery_pricing_type: string | null
          description: string | null
          district_id: number | null
          email: string | null
          free_delivery: boolean | null
          free_tasting: boolean | null
          halal_certified: boolean | null
          has_refrigerated_vehicle: boolean | null
          holiday_surcharge_percent: number | null
          id: string
          lead_time_hours: number | null
          lead_time_type: string | null
          logo_url: string | null
          max_guest_count: number | null
          min_guest_count: number | null
          owner_id: string | null
          phone: string | null
          serves_outside_city: boolean | null
          slug: string
          status: Database["public"]["Enums"]["vendor_status"]
          updated_at: string
          website_url: string | null
          weekend_surcharge_percent: number | null
          whatsapp: string | null
        }
        Insert: {
          accepts_last_minute?: boolean | null
          address_text?: string | null
          available_24_7?: boolean | null
          avg_price_per_person?: number | null
          business_name: string
          city_id?: number | null
          created_at?: string
          deleted_at?: string | null
          delivery_base_fee?: number | null
          delivery_notes?: string | null
          delivery_pricing_type?: string | null
          description?: string | null
          district_id?: number | null
          email?: string | null
          free_delivery?: boolean | null
          free_tasting?: boolean | null
          halal_certified?: boolean | null
          has_refrigerated_vehicle?: boolean | null
          holiday_surcharge_percent?: number | null
          id?: string
          lead_time_hours?: number | null
          lead_time_type?: string | null
          logo_url?: string | null
          max_guest_count?: number | null
          min_guest_count?: number | null
          owner_id?: string | null
          phone?: string | null
          serves_outside_city?: boolean | null
          slug: string
          status?: Database["public"]["Enums"]["vendor_status"]
          updated_at?: string
          website_url?: string | null
          weekend_surcharge_percent?: number | null
          whatsapp?: string | null
        }
        Update: {
          accepts_last_minute?: boolean | null
          address_text?: string | null
          available_24_7?: boolean | null
          avg_price_per_person?: number | null
          business_name?: string
          city_id?: number | null
          created_at?: string
          deleted_at?: string | null
          delivery_base_fee?: number | null
          delivery_notes?: string | null
          delivery_pricing_type?: string | null
          description?: string | null
          district_id?: number | null
          email?: string | null
          free_delivery?: boolean | null
          free_tasting?: boolean | null
          halal_certified?: boolean | null
          has_refrigerated_vehicle?: boolean | null
          holiday_surcharge_percent?: number | null
          id?: string
          lead_time_hours?: number | null
          lead_time_type?: string | null
          logo_url?: string | null
          max_guest_count?: number | null
          min_guest_count?: number | null
          owner_id?: string | null
          phone?: string | null
          serves_outside_city?: boolean | null
          slug?: string
          status?: Database["public"]["Enums"]["vendor_status"]
          updated_at?: string
          website_url?: string | null
          weekend_surcharge_percent?: number | null
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vendors_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendors_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendors_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendors_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "user_profiles_with_roles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      abuse_metrics: {
        Row: {
          action: string | null
          hour: string | null
          ip_address: unknown
          request_count: number | null
          unique_actors: number | null
        }
        Relationships: []
      }
      categories_with_segments: {
        Row: {
          description: string | null
          icon: string | null
          id: number | null
          is_active: boolean | null
          name: string | null
          segment_id: number | null
          segment_name: string | null
          segment_slug: string | null
          slug: string | null
          sort_order: number | null
        }
        Relationships: [
          {
            foreignKeyName: "service_categories_segment_id_fkey"
            columns: ["segment_id"]
            isOneToOne: false
            referencedRelation: "customer_segments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_categories_segment_id_fkey"
            columns: ["segment_id"]
            isOneToOne: false
            referencedRelation: "segment_vendor_counts"
            referencedColumns: ["segment_id"]
          },
        ]
      }
      category_vendor_counts: {
        Row: {
          category_id: number | null
          category_name: string | null
          category_slug: string | null
          category_sort_order: number | null
          segment_slug: string | null
          segment_sort_order: number | null
          vendor_count: number | null
        }
        Relationships: []
      }
      corporate_categories: {
        Row: {
          description: string | null
          icon: string | null
          id: number | null
          name: string | null
          slug: string | null
          sort_order: number | null
        }
        Relationships: []
      }
      email_stats_daily: {
        Row: {
          count: number | null
          date: string | null
          email_type: string | null
          status: string | null
        }
        Relationships: []
      }
      individual_categories: {
        Row: {
          description: string | null
          icon: string | null
          id: number | null
          name: string | null
          slug: string | null
          sort_order: number | null
        }
        Relationships: []
      }
      review_stats: {
        Row: {
          approved_reviews: number | null
          avg_rating: number | null
          five_star: number | null
          four_star: number | null
          one_star: number | null
          replied_reviews: number | null
          three_star: number | null
          total_reviews: number | null
          two_star: number | null
          vendor_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendor_full_profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      segment_vendor_counts: {
        Row: {
          segment_id: number | null
          segment_name: string | null
          segment_slug: string | null
          vendor_count: number | null
        }
        Relationships: []
      }
      user_profiles_with_roles: {
        Row: {
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string | null
          is_admin: boolean | null
          is_customer: boolean | null
          is_vendor: boolean | null
          phone: string | null
          roles: Json | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string | null
          is_admin?: never
          is_customer?: never
          is_vendor?: never
          phone?: string | null
          roles?: never
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string | null
          is_admin?: never
          is_customer?: never
          is_vendor?: never
          phone?: string | null
          roles?: never
          updated_at?: string | null
        }
        Relationships: []
      }
      vendor_full_profile: {
        Row: {
          accepts_last_minute: boolean | null
          address_text: string | null
          available_24_7: boolean | null
          avg_price_per_person: number | null
          business_name: string | null
          city_id: number | null
          city_name: string | null
          created_at: string | null
          cuisines: Json | null
          delivery_base_fee: number | null
          delivery_models: Json | null
          delivery_notes: string | null
          delivery_pricing_type: string | null
          description: string | null
          district_id: number | null
          district_name: string | null
          email: string | null
          has_refrigerated_vehicle: boolean | null
          holiday_surcharge_percent: number | null
          id: string | null
          lead_time_hours: number | null
          lead_time_type: string | null
          logo_url: string | null
          max_guest_count: number | null
          min_guest_count: number | null
          owner_id: string | null
          phone: string | null
          serves_outside_city: boolean | null
          service_categories: Json | null
          services: Json | null
          slug: string | null
          status: Database["public"]["Enums"]["vendor_status"] | null
          tags: Json | null
          updated_at: string | null
          website_url: string | null
          weekend_surcharge_percent: number | null
          whatsapp: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vendors_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendors_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendors_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendors_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "user_profiles_with_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_ratings: {
        Row: {
          avg_rating: number | null
          review_count: number | null
          vendor_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendor_full_profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      add_user_role: {
        Args: { granter_id?: string; role_name: string; target_user_id: string }
        Returns: boolean
      }
      can_access_lead_as_vendor: {
        Args: { p_lead_id: string }
        Returns: boolean
      }
      can_access_vendor_lead: {
        Args: { p_vendor_id: string }
        Returns: boolean
      }
      can_send_message_to_vendor_lead: {
        Args: { p_vendor_lead_id: string }
        Returns: boolean
      }
      check_abuse_threshold: {
        Args: {
          p_action: string
          p_ip_address: unknown
          p_threshold?: number
          p_window_minutes?: number
        }
        Returns: boolean
      }
      check_email_rate_limit: {
        Args: {
          p_email_type: string
          p_max_count?: number
          p_user_id: string
          p_window?: unknown
        }
        Returns: boolean
      }
      check_vendor_availability: {
        Args: { p_date: string; p_vendor_id: string }
        Returns: Json
      }
      cleanup_expired_idempotency_keys: { Args: never; Returns: undefined }
      create_default_availability: {
        Args: { p_vendor_id: string }
        Returns: undefined
      }
      create_default_notification_preferences: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      create_lead_with_vendor: {
        Args: {
          p_budget_max?: number
          p_budget_min?: number
          p_cuisine_preference?: string
          p_customer_email?: string
          p_customer_name?: string
          p_customer_phone?: string
          p_customer_profile_id?: string
          p_delivery_model?: string
          p_dietary_requirements?: string[]
          p_event_date?: string
          p_event_type?: string
          p_guest_count?: number
          p_idempotency_key?: string
          p_needs_cleanup?: boolean
          p_needs_service_staff?: boolean
          p_needs_tables_chairs?: boolean
          p_notes?: string
          p_segment_id?: number
          p_service_style?: string
          p_vendor_id: string
          p_wants_disposable_tableware?: boolean
          p_wants_real_tableware?: boolean
        }
        Returns: string
      }
      create_notification: {
        Args: {
          p_action_url?: string
          p_entity_id?: string
          p_entity_type?: string
          p_message?: string
          p_metadata?: Json
          p_title: string
          p_type: Database["public"]["Enums"]["notification_type"]
          p_user_id: string
        }
        Returns: string
      }
      get_admin_analytics: { Args: { p_days?: number }; Returns: Json }
      get_categories_by_segment: {
        Args: { p_segment_slug: string }
        Returns: {
          description: string
          icon: string
          id: number
          name: string
          slug: string
          sort_order: number
          vendor_count: number
        }[]
      }
      get_menu_structure: { Args: never; Returns: Json }
      get_message_conversations: {
        Args: { p_limit?: number; p_offset?: number }
        Returns: Json
      }
      get_my_role: { Args: never; Returns: string }
      get_my_vendor_ids: { Args: never; Returns: string[] }
      get_public_reviews: {
        Args: {
          p_limit?: number
          p_offset?: number
          p_rating?: number
          p_sort?: string
          p_vendor_id: string
        }
        Returns: {
          comment: string
          created_at: string
          customer_name: string
          event_type: string
          guest_count: number
          helpful_count: number
          id: string
          is_verified: boolean
          not_helpful_count: number
          rating: number
          vendor_reply: string
          vendor_reply_at: string
        }[]
      }
      get_quote_with_history: { Args: { p_quote_id: string }; Returns: Json }
      get_unread_message_count: { Args: never; Returns: Json }
      get_unread_notification_count: {
        Args: { p_user_id: string }
        Returns: number
      }
      get_user_notifications: {
        Args: {
          p_limit?: number
          p_offset?: number
          p_unread_only?: boolean
          p_user_id: string
        }
        Returns: Json
      }
      get_user_role: {
        Args: never
        Returns: Database["public"]["Enums"]["user_role"]
      }
      get_user_roles: {
        Args: { check_user_id: string }
        Returns: {
          granted_at: string
          role_name: string
        }[]
      }
      get_vendor_analytics: {
        Args: { p_days?: number; p_vendor_id: string }
        Returns: Json
      }
      get_vendor_lead_messages: {
        Args: { p_limit?: number; p_offset?: number; p_vendor_lead_id: string }
        Returns: Json
      }
      get_vendor_monthly_availability: {
        Args: { p_month: number; p_vendor_id: string; p_year: number }
        Returns: Json
      }
      get_vendor_reviews: {
        Args: {
          p_limit?: number
          p_offset?: number
          p_rating?: number
          p_status?: string
          p_vendor_id: string
        }
        Returns: {
          comment: string
          created_at: string
          customer_email: string
          customer_name: string
          event_type: string
          guest_count: number
          helpful_count: number
          id: string
          is_approved: boolean
          is_verified: boolean
          not_helpful_count: number
          rating: number
          reply_created_at: string
          reply_text: string
        }[]
      }
      get_vendors_by_segment_and_category: {
        Args: {
          p_category_slug?: string
          p_city_id?: number
          p_limit?: number
          p_offset?: number
          p_segment_slug?: string
        }
        Returns: {
          avg_price_per_person: number
          avg_rating: number
          business_name: string
          city_name: string
          description: string
          district_name: string
          logo_url: string
          max_guest_count: number
          min_guest_count: number
          review_count: number
          slug: string
          vendor_id: string
        }[]
      }
      has_role: {
        Args: { check_role_name: string; check_user_id: string }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
      is_lead_customer: { Args: { p_lead_id: string }; Returns: boolean }
      is_vendor: { Args: never; Returns: boolean }
      log_activity: {
        Args: {
          p_action?: string
          p_actor_id?: string
          p_actor_type?: string
          p_entity_id?: string
          p_entity_type?: string
          p_ip_address?: unknown
          p_metadata?: Json
          p_request_id?: string
          p_user_agent?: string
        }
        Returns: string
      }
      mark_messages_read: { Args: { p_vendor_lead_id: string }; Returns: Json }
      mark_notifications_read: {
        Args: { p_notification_ids?: string[]; p_user_id: string }
        Returns: number
      }
      restore_deleted: {
        Args: { p_id: string; p_table_name: string }
        Returns: boolean
      }
      search_vendors: {
        Args: {
          p_accepts_last_minute?: boolean
          p_available_24_7?: boolean
          p_category_id?: number
          p_city_id?: number
          p_cuisine_ids?: number[]
          p_delivery_model_ids?: number[]
          p_district_id?: number
          p_free_delivery?: boolean
          p_free_tasting?: boolean
          p_halal_certified?: boolean
          p_has_refrigerated?: boolean
          p_lead_time_types?: string[]
          p_max_guest?: number
          p_max_price?: number
          p_min_guest?: number
          p_min_price?: number
          p_page?: number
          p_page_size?: number
          p_search_query?: string
          p_segment_id?: number
          p_serves_outside_city?: boolean
          p_service_ids?: number[]
          p_sort_by?: string
          p_tag_ids?: number[]
        }
        Returns: Json
      }
      send_vendor_lead_message: {
        Args: { p_content: string; p_vendor_lead_id: string }
        Returns: Json
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
      soft_delete: {
        Args: { p_id: string; p_table_name: string }
        Returns: boolean
      }
    }
    Enums: {
      customer_segment_type: "corporate" | "individual"
      lead_source: "website_form" | "vendor_page_form" | "admin_manual"
      notification_type:
        | "lead_new"
        | "lead_updated"
        | "quote_received"
        | "quote_accepted"
        | "quote_rejected"
        | "message_new"
        | "review_new"
        | "review_approved"
        | "vendor_approved"
        | "vendor_rejected"
        | "vendor_suspended"
        | "booking_confirmed"
        | "booking_reminder"
        | "system"
      quote_status:
        | "draft"
        | "sent"
        | "viewed"
        | "accepted"
        | "rejected"
        | "expired"
        | "cancelled"
      service_place_type: "home" | "office" | "venue" | "outdoor" | "other"
      service_style:
        | "open_buffet"
        | "cocktail"
        | "plated"
        | "coffee_break"
        | "lunchbox"
        | "self_service"
        | "seated"
        | "buffet"
        | "standing"
        | "mixed"
      user_role: "admin" | "vendor_owner" | "customer"
      vendor_lead_status:
        | "sent"
        | "seen"
        | "contacted"
        | "quoted"
        | "won"
        | "lost"
      vendor_status: "pending" | "approved" | "rejected" | "suspended"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      customer_segment_type: ["corporate", "individual"],
      lead_source: ["website_form", "vendor_page_form", "admin_manual"],
      notification_type: [
        "lead_new",
        "lead_updated",
        "quote_received",
        "quote_accepted",
        "quote_rejected",
        "message_new",
        "review_new",
        "review_approved",
        "vendor_approved",
        "vendor_rejected",
        "vendor_suspended",
        "booking_confirmed",
        "booking_reminder",
        "system",
      ],
      quote_status: [
        "draft",
        "sent",
        "viewed",
        "accepted",
        "rejected",
        "expired",
        "cancelled",
      ],
      service_place_type: ["home", "office", "venue", "outdoor", "other"],
      service_style: [
        "open_buffet",
        "cocktail",
        "plated",
        "coffee_break",
        "lunchbox",
        "self_service",
        "seated",
        "buffet",
        "standing",
        "mixed",
      ],
      user_role: ["admin", "vendor_owner", "customer"],
      vendor_lead_status: [
        "sent",
        "seen",
        "contacted",
        "quoted",
        "won",
        "lost",
      ],
      vendor_status: ["pending", "approved", "rejected", "suspended"],
    },
  },
} as const
