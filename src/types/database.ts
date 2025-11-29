export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5";
  };
  public: {
    Tables: {
      blog_posts: {
        Row: {
          author_id: string | null;
          content: string;
          cover_image_url: string | null;
          created_at: string | null;
          excerpt: string | null;
          id: string;
          published_at: string | null;
          slug: string;
          status: string;
          title: string;
          updated_at: string | null;
        };
        Insert: {
          author_id?: string | null;
          content: string;
          cover_image_url?: string | null;
          created_at?: string | null;
          excerpt?: string | null;
          id?: string;
          published_at?: string | null;
          slug: string;
          status?: string;
          title: string;
          updated_at?: string | null;
        };
        Update: {
          author_id?: string | null;
          content?: string;
          cover_image_url?: string | null;
          created_at?: string | null;
          excerpt?: string | null;
          id?: string;
          published_at?: string | null;
          slug?: string;
          status?: string;
          title?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "blog_posts_author_id_fkey";
            columns: ["author_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      cities: {
        Row: {
          id: number;
          name: string;
          slug: string;
        };
        Insert: {
          id?: number;
          name: string;
          slug: string;
        };
        Update: {
          id?: number;
          name?: string;
          slug?: string;
        };
        Relationships: [];
      };
      customer_segments: {
        Row: {
          id: number;
          name: string;
          slug: string;
          description: string | null;
          icon: string | null;
          sort_order: number | null;
          is_active: boolean | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: never;
          name: string;
          slug: string;
          description?: string | null;
          icon?: string | null;
          sort_order?: number | null;
          is_active?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: never;
          name?: string;
          slug?: string;
          description?: string | null;
          icon?: string | null;
          sort_order?: number | null;
          is_active?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      cuisine_types: {
        Row: {
          id: number;
          is_active: boolean;
          name: string;
          slug: string;
        };
        Insert: {
          id?: number;
          is_active?: boolean;
          name: string;
          slug: string;
        };
        Update: {
          id?: number;
          is_active?: boolean;
          name?: string;
          slug?: string;
        };
        Relationships: [];
      };
      districts: {
        Row: {
          city_id: number;
          id: number;
          name: string;
          slug: string;
        };
        Insert: {
          city_id: number;
          id?: number;
          name: string;
          slug: string;
        };
        Update: {
          city_id?: number;
          id?: number;
          name?: string;
          slug?: string;
        };
        Relationships: [
          {
            foreignKeyName: "districts_city_id_fkey";
            columns: ["city_id"];
            isOneToOne: false;
            referencedRelation: "cities";
            referencedColumns: ["id"];
          }
        ];
      };
      favorites: {
        Row: {
          created_at: string | null;
          id: string;
          user_id: string;
          vendor_id: string;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          user_id: string;
          vendor_id: string;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          user_id?: string;
          vendor_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "favorites_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "favorites_vendor_id_fkey";
            columns: ["vendor_id"];
            isOneToOne: false;
            referencedRelation: "vendors";
            referencedColumns: ["id"];
          }
        ];
      };
      leads: {
        Row: {
          budget_max: number | null;
          budget_min: number | null;
          city_id: number | null;
          created_at: string;
          customer_email: string;
          customer_name: string;
          customer_phone: string | null;
          customer_profile_id: string | null;
          dietary_restrictions: string | null;
          district_id: number | null;
          event_date: string | null;
          guest_count: number | null;
          id: string;
          is_delivery_only_ok: boolean | null;
          is_on_site_service_required: boolean | null;
          main_service_category_id: number | null;
          menu_notes: string | null;
          needs_bartender: boolean | null;
          needs_buffet_setup: boolean | null;
          needs_chef_on_site: boolean | null;
          needs_cleanup: boolean | null;
          needs_service_staff: boolean | null;
          needs_tables_chairs: boolean | null;
          no_tableware_needed: boolean | null;
          notes: string | null;
          segment_id: number | null;
          service_place_type:
            | Database["public"]["Enums"]["service_place_type"]
            | null;
          service_style: Database["public"]["Enums"]["service_style"] | null;
          source: Database["public"]["Enums"]["lead_source"];
          special_requests: string | null;
          tableware_notes: string | null;
          wants_disposable_tableware: boolean | null;
          wants_real_tableware: boolean | null;
        };
        Insert: {
          budget_max?: number | null;
          budget_min?: number | null;
          city_id?: number | null;
          created_at?: string;
          customer_email: string;
          customer_name: string;
          customer_phone?: string | null;
          customer_profile_id?: string | null;
          dietary_restrictions?: string | null;
          district_id?: number | null;
          event_date?: string | null;
          guest_count?: number | null;
          id?: string;
          is_delivery_only_ok?: boolean | null;
          is_on_site_service_required?: boolean | null;
          main_service_category_id?: number | null;
          menu_notes?: string | null;
          needs_bartender?: boolean | null;
          needs_buffet_setup?: boolean | null;
          needs_chef_on_site?: boolean | null;
          needs_cleanup?: boolean | null;
          needs_service_staff?: boolean | null;
          needs_tables_chairs?: boolean | null;
          no_tableware_needed?: boolean | null;
          notes?: string | null;
          segment_id?: number | null;
          service_place_type?:
            | Database["public"]["Enums"]["service_place_type"]
            | null;
          service_style?: Database["public"]["Enums"]["service_style"] | null;
          source?: Database["public"]["Enums"]["lead_source"];
          special_requests?: string | null;
          tableware_notes?: string | null;
          wants_disposable_tableware?: boolean | null;
          wants_real_tableware?: boolean | null;
        };
        Update: {
          budget_max?: number | null;
          budget_min?: number | null;
          city_id?: number | null;
          created_at?: string;
          customer_email?: string;
          customer_name?: string;
          customer_phone?: string | null;
          customer_profile_id?: string | null;
          dietary_restrictions?: string | null;
          district_id?: number | null;
          event_date?: string | null;
          guest_count?: number | null;
          id?: string;
          is_delivery_only_ok?: boolean | null;
          is_on_site_service_required?: boolean | null;
          main_service_category_id?: number | null;
          menu_notes?: string | null;
          needs_bartender?: boolean | null;
          needs_buffet_setup?: boolean | null;
          needs_chef_on_site?: boolean | null;
          needs_cleanup?: boolean | null;
          needs_service_staff?: boolean | null;
          needs_tables_chairs?: boolean | null;
          no_tableware_needed?: boolean | null;
          notes?: string | null;
          segment_id?: number | null;
          service_place_type?:
            | Database["public"]["Enums"]["service_place_type"]
            | null;
          service_style?: Database["public"]["Enums"]["service_style"] | null;
          source?: Database["public"]["Enums"]["lead_source"];
          special_requests?: string | null;
          tableware_notes?: string | null;
          wants_disposable_tableware?: boolean | null;
          wants_real_tableware?: boolean | null;
        };
        Relationships: [
          {
            foreignKeyName: "leads_city_id_fkey";
            columns: ["city_id"];
            isOneToOne: false;
            referencedRelation: "cities";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "leads_customer_profile_id_fkey";
            columns: ["customer_profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "leads_district_id_fkey";
            columns: ["district_id"];
            isOneToOne: false;
            referencedRelation: "districts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "leads_segment_id_fkey";
            columns: ["segment_id"];
            isOneToOne: false;
            referencedRelation: "customer_segments";
            referencedColumns: ["id"];
          }
        ];
      };
      menu_categories: {
        Row: {
          created_at: string | null;
          description: string | null;
          id: string;
          name: string;
          sort_order: number | null;
          vendor_id: string;
        };
        Insert: {
          created_at?: string | null;
          description?: string | null;
          id?: string;
          name: string;
          sort_order?: number | null;
          vendor_id: string;
        };
        Update: {
          created_at?: string | null;
          description?: string | null;
          id?: string;
          name?: string;
          sort_order?: number | null;
          vendor_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "menu_categories_vendor_id_fkey";
            columns: ["vendor_id"];
            isOneToOne: false;
            referencedRelation: "vendors";
            referencedColumns: ["id"];
          }
        ];
      };
      menu_items: {
        Row: {
          category_id: string;
          created_at: string | null;
          description: string | null;
          id: string;
          image_url: string | null;
          is_active: boolean | null;
          min_order_count: number | null;
          name: string;
          price_per_person: number | null;
          sort_order: number | null;
          updated_at: string | null;
          vendor_id: string;
        };
        Insert: {
          category_id: string;
          created_at?: string | null;
          description?: string | null;
          id?: string;
          image_url?: string | null;
          is_active?: boolean | null;
          min_order_count?: number | null;
          name: string;
          price_per_person?: number | null;
          sort_order?: number | null;
          updated_at?: string | null;
          vendor_id: string;
        };
        Update: {
          category_id?: string;
          created_at?: string | null;
          description?: string | null;
          id?: string;
          image_url?: string | null;
          is_active?: boolean | null;
          min_order_count?: number | null;
          name?: string;
          price_per_person?: number | null;
          sort_order?: number | null;
          updated_at?: string | null;
          vendor_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "menu_items_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "menu_categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "menu_items_vendor_id_fkey";
            columns: ["vendor_id"];
            isOneToOne: false;
            referencedRelation: "vendors";
            referencedColumns: ["id"];
          }
        ];
      };
      packages: {
        Row: {
          created_at: string | null;
          description: string | null;
          id: string;
          image_url: string | null;
          includes: string[] | null;
          is_active: boolean | null;
          max_guest_count: number | null;
          min_guest_count: number | null;
          name: string;
          price_per_person: number;
          sort_order: number | null;
          updated_at: string | null;
          vendor_id: string;
        };
        Insert: {
          created_at?: string | null;
          description?: string | null;
          id?: string;
          image_url?: string | null;
          includes?: string[] | null;
          is_active?: boolean | null;
          max_guest_count?: number | null;
          min_guest_count?: number | null;
          name: string;
          price_per_person: number;
          sort_order?: number | null;
          updated_at?: string | null;
          vendor_id: string;
        };
        Update: {
          created_at?: string | null;
          description?: string | null;
          id?: string;
          image_url?: string | null;
          includes?: string[] | null;
          is_active?: boolean | null;
          max_guest_count?: number | null;
          min_guest_count?: number | null;
          name?: string;
          price_per_person?: number;
          sort_order?: number | null;
          updated_at?: string | null;
          vendor_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "packages_vendor_id_fkey";
            columns: ["vendor_id"];
            isOneToOne: false;
            referencedRelation: "vendors";
            referencedColumns: ["id"];
          }
        ];
      };
      profiles: {
        Row: {
          created_at: string;
          email: string | null;
          full_name: string | null;
          id: string;
          phone: string | null;
          role: Database["public"]["Enums"]["user_role"];
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          email?: string | null;
          full_name?: string | null;
          id: string;
          phone?: string | null;
          role?: Database["public"]["Enums"]["user_role"];
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          email?: string | null;
          full_name?: string | null;
          id?: string;
          phone?: string | null;
          role?: Database["public"]["Enums"]["user_role"];
          updated_at?: string;
        };
        Relationships: [];
      };
      reviews: {
        Row: {
          comment: string | null;
          created_at: string | null;
          customer_email: string | null;
          customer_id: string | null;
          customer_name: string;
          id: string;
          is_approved: boolean | null;
          is_verified: boolean | null;
          rating: number;
          updated_at: string | null;
          vendor_id: string;
        };
        Insert: {
          comment?: string | null;
          created_at?: string | null;
          customer_email?: string | null;
          customer_id?: string | null;
          customer_name: string;
          id?: string;
          is_approved?: boolean | null;
          is_verified?: boolean | null;
          rating: number;
          updated_at?: string | null;
          vendor_id: string;
        };
        Update: {
          comment?: string | null;
          created_at?: string | null;
          customer_email?: string | null;
          customer_id?: string | null;
          customer_name?: string;
          id?: string;
          is_approved?: boolean | null;
          is_verified?: boolean | null;
          rating?: number;
          updated_at?: string | null;
          vendor_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "reviews_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "reviews_vendor_id_fkey";
            columns: ["vendor_id"];
            isOneToOne: false;
            referencedRelation: "vendors";
            referencedColumns: ["id"];
          }
        ];
      };
      service_categories: {
        Row: {
          created_at: string | null;
          description: string | null;
          icon: string | null;
          id: number;
          is_active: boolean | null;
          name: string;
          segment_id: number | null;
          slug: string;
          sort_order: number | null;
        };
        Insert: {
          created_at?: string | null;
          description?: string | null;
          icon?: string | null;
          id?: never;
          is_active?: boolean | null;
          name: string;
          segment_id?: number | null;
          slug: string;
          sort_order?: number | null;
        };
        Update: {
          created_at?: string | null;
          description?: string | null;
          icon?: string | null;
          id?: never;
          is_active?: boolean | null;
          name?: string;
          segment_id?: number | null;
          slug?: string;
          sort_order?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "service_categories_segment_id_fkey";
            columns: ["segment_id"];
            isOneToOne: false;
            referencedRelation: "customer_segments";
            referencedColumns: ["id"];
          }
        ];
      };
      service_groups: {
        Row: {
          created_at: string | null;
          icon: string | null;
          id: number;
          is_active: boolean | null;
          name: string;
          slug: string;
          sort_order: number | null;
        };
        Insert: {
          created_at?: string | null;
          icon?: string | null;
          id?: never;
          is_active?: boolean | null;
          name: string;
          slug: string;
          sort_order?: number | null;
        };
        Update: {
          created_at?: string | null;
          icon?: string | null;
          id?: never;
          is_active?: boolean | null;
          name?: string;
          slug?: string;
          sort_order?: number | null;
        };
        Relationships: [];
      };
      services: {
        Row: {
          created_at: string | null;
          group_id: number;
          icon: string | null;
          id: number;
          is_active: boolean | null;
          name: string;
          slug: string;
          sort_order: number | null;
        };
        Insert: {
          created_at?: string | null;
          group_id: number;
          icon?: string | null;
          id?: never;
          is_active?: boolean | null;
          name: string;
          slug: string;
          sort_order?: number | null;
        };
        Update: {
          created_at?: string | null;
          group_id?: number;
          icon?: string | null;
          id?: never;
          is_active?: boolean | null;
          name?: string;
          slug?: string;
          sort_order?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "services_group_id_fkey";
            columns: ["group_id"];
            isOneToOne: false;
            referencedRelation: "service_groups";
            referencedColumns: ["id"];
          }
        ];
      };
      vendor_applications: {
        Row: {
          applicant_user_id: string | null;
          business_name: string;
          city_text: string | null;
          contact_email: string;
          contact_name: string;
          contact_phone: string | null;
          created_at: string;
          created_user_id: string | null;
          created_vendor_id: string | null;
          district_text: string | null;
          id: string;
          instagram_handle: string | null;
          main_service_categories: string | null;
          max_guest_count: number | null;
          min_guest_count: number | null;
          notes: string | null;
          offers_cleanup: boolean | null;
          offers_delivery_only: boolean | null;
          offers_disposable_tableware: boolean | null;
          offers_on_site_service: boolean | null;
          offers_real_tableware: boolean | null;
          offers_service_staff: boolean | null;
          reviewed_at: string | null;
          reviewed_by: string | null;
          status: string;
          target_segments: number[] | null;
          website_url: string | null;
        };
        Insert: {
          applicant_user_id?: string | null;
          business_name: string;
          city_text?: string | null;
          contact_email: string;
          contact_name: string;
          contact_phone?: string | null;
          created_at?: string;
          created_user_id?: string | null;
          created_vendor_id?: string | null;
          district_text?: string | null;
          id?: string;
          instagram_handle?: string | null;
          main_service_categories?: string | null;
          max_guest_count?: number | null;
          min_guest_count?: number | null;
          notes?: string | null;
          offers_cleanup?: boolean | null;
          offers_delivery_only?: boolean | null;
          offers_disposable_tableware?: boolean | null;
          offers_on_site_service?: boolean | null;
          offers_real_tableware?: boolean | null;
          offers_service_staff?: boolean | null;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          status?: string;
          target_segments?: number[] | null;
          website_url?: string | null;
        };
        Update: {
          applicant_user_id?: string | null;
          business_name?: string;
          city_text?: string | null;
          contact_email?: string;
          contact_name?: string;
          contact_phone?: string | null;
          created_at?: string;
          created_user_id?: string | null;
          created_vendor_id?: string | null;
          district_text?: string | null;
          id?: string;
          instagram_handle?: string | null;
          main_service_categories?: string | null;
          max_guest_count?: number | null;
          min_guest_count?: number | null;
          notes?: string | null;
          offers_cleanup?: boolean | null;
          offers_delivery_only?: boolean | null;
          offers_disposable_tableware?: boolean | null;
          offers_on_site_service?: boolean | null;
          offers_real_tableware?: boolean | null;
          offers_service_staff?: boolean | null;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          status?: string;
          target_segments?: number[] | null;
          website_url?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "vendor_applications_created_vendor_id_fkey";
            columns: ["created_vendor_id"];
            isOneToOne: false;
            referencedRelation: "vendors";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "vendor_applications_reviewed_by_fkey";
            columns: ["reviewed_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      vendor_categories: {
        Row: {
          category_id: number;
          created_at: string | null;
          id: string;
          vendor_id: string;
        };
        Insert: {
          category_id: number;
          created_at?: string | null;
          id?: string;
          vendor_id: string;
        };
        Update: {
          category_id?: number;
          created_at?: string | null;
          id?: string;
          vendor_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "vendor_categories_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "service_categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "vendor_categories_vendor_id_fkey";
            columns: ["vendor_id"];
            isOneToOne: false;
            referencedRelation: "vendors";
            referencedColumns: ["id"];
          }
        ];
      };
      vendor_images: {
        Row: {
          created_at: string | null;
          id: string;
          image_url: string;
          sort_order: number | null;
          vendor_id: string | null;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          image_url: string;
          sort_order?: number | null;
          vendor_id?: string | null;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          image_url?: string;
          sort_order?: number | null;
          vendor_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "vendor_images_vendor_id_fkey";
            columns: ["vendor_id"];
            isOneToOne: false;
            referencedRelation: "vendors";
            referencedColumns: ["id"];
          }
        ];
      };
      vendor_leads: {
        Row: {
          created_at: string;
          id: string;
          lead_id: string;
          status: Database["public"]["Enums"]["vendor_lead_status"];
          updated_at: string;
          vendor_id: string;
          vendor_note: string | null;
          viewed_at: string | null;
          responded_at: string | null;
        };
        Insert: {
          created_at?: string;
          id?: string;
          lead_id: string;
          status?: Database["public"]["Enums"]["vendor_lead_status"];
          updated_at?: string;
          vendor_id: string;
          vendor_note?: string | null;
          viewed_at?: string | null;
          responded_at?: string | null;
        };
        Update: {
          created_at?: string;
          id?: string;
          lead_id?: string;
          status?: Database["public"]["Enums"]["vendor_lead_status"];
          updated_at?: string;
          vendor_id?: string;
          vendor_note?: string | null;
          viewed_at?: string | null;
          responded_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "vendor_leads_lead_id_fkey";
            columns: ["lead_id"];
            isOneToOne: false;
            referencedRelation: "leads";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "vendor_leads_vendor_id_fkey";
            columns: ["vendor_id"];
            isOneToOne: false;
            referencedRelation: "vendors";
            referencedColumns: ["id"];
          }
        ];
      };
      quotes: {
        Row: {
          id: string;
          vendor_lead_id: string;
          price_per_person: number | null;
          total_price: number;
          deposit_amount: number | null;
          deposit_percentage: number | null;
          title: string | null;
          message: string | null;
          inclusions: string | null;
          exclusions: string | null;
          terms: string | null;
          status: Database["public"]["Enums"]["quote_status"];
          valid_until: string | null;
          sent_at: string | null;
          viewed_at: string | null;
          responded_at: string | null;
          customer_response_note: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          vendor_lead_id: string;
          price_per_person?: number | null;
          total_price: number;
          deposit_amount?: number | null;
          deposit_percentage?: number | null;
          title?: string | null;
          message?: string | null;
          inclusions?: string | null;
          exclusions?: string | null;
          terms?: string | null;
          status?: Database["public"]["Enums"]["quote_status"];
          valid_until?: string | null;
          sent_at?: string | null;
          viewed_at?: string | null;
          responded_at?: string | null;
          customer_response_note?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          vendor_lead_id?: string;
          price_per_person?: number | null;
          total_price?: number;
          deposit_amount?: number | null;
          deposit_percentage?: number | null;
          title?: string | null;
          message?: string | null;
          inclusions?: string | null;
          exclusions?: string | null;
          terms?: string | null;
          status?: Database["public"]["Enums"]["quote_status"];
          valid_until?: string | null;
          sent_at?: string | null;
          viewed_at?: string | null;
          responded_at?: string | null;
          customer_response_note?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "quotes_vendor_lead_id_fkey";
            columns: ["vendor_lead_id"];
            isOneToOne: false;
            referencedRelation: "vendor_leads";
            referencedColumns: ["id"];
          }
        ];
      };
      vendor_segments: {
        Row: {
          id: string;
          vendor_id: string;
          segment_id: number;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          vendor_id: string;
          segment_id: number;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          vendor_id?: string;
          segment_id?: number;
          created_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "vendor_segments_vendor_id_fkey";
            columns: ["vendor_id"];
            isOneToOne: false;
            referencedRelation: "vendors";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "vendor_segments_segment_id_fkey";
            columns: ["segment_id"];
            isOneToOne: false;
            referencedRelation: "customer_segments";
            referencedColumns: ["id"];
          }
        ];
      };
      vendor_packages: {
        Row: {
          created_at: string;
          description: string | null;
          id: string;
          is_active: boolean;
          max_guest_count: number | null;
          min_guest_count: number | null;
          name: string;
          price_per_person: number | null;
          sort_order: number;
          updated_at: string;
          vendor_id: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          id?: string;
          is_active?: boolean;
          max_guest_count?: number | null;
          min_guest_count?: number | null;
          name: string;
          price_per_person?: number | null;
          sort_order?: number;
          updated_at?: string;
          vendor_id: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          id?: string;
          is_active?: boolean;
          max_guest_count?: number | null;
          min_guest_count?: number | null;
          name?: string;
          price_per_person?: number | null;
          sort_order?: number;
          updated_at?: string;
          vendor_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "vendor_packages_vendor_id_fkey";
            columns: ["vendor_id"];
            isOneToOne: false;
            referencedRelation: "vendors";
            referencedColumns: ["id"];
          }
        ];
      };
      vendor_services: {
        Row: {
          created_at: string | null;
          id: string;
          service_id: number;
          vendor_id: string;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          service_id: number;
          vendor_id: string;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          service_id?: number;
          vendor_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "vendor_services_service_id_fkey";
            columns: ["service_id"];
            isOneToOne: false;
            referencedRelation: "services";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "vendor_services_vendor_id_fkey";
            columns: ["vendor_id"];
            isOneToOne: false;
            referencedRelation: "vendors";
            referencedColumns: ["id"];
          }
        ];
      };
      vendors: {
        Row: {
          address_text: string | null;
          avg_price_per_person: number | null;
          business_name: string;
          city_id: number | null;
          created_at: string;
          description: string | null;
          district_id: number | null;
          email: string | null;
          id: string;
          logo_url: string | null;
          max_guest_count: number | null;
          min_guest_count: number | null;
          owner_id: string | null;
          phone: string | null;
          slug: string;
          status: Database["public"]["Enums"]["vendor_status"];
          updated_at: string;
          website_url: string | null;
          whatsapp: string | null;
        };
        Insert: {
          address_text?: string | null;
          avg_price_per_person?: number | null;
          business_name: string;
          city_id?: number | null;
          created_at?: string;
          description?: string | null;
          district_id?: number | null;
          email?: string | null;
          id?: string;
          logo_url?: string | null;
          max_guest_count?: number | null;
          min_guest_count?: number | null;
          owner_id?: string | null;
          phone?: string | null;
          slug: string;
          status?: Database["public"]["Enums"]["vendor_status"];
          updated_at?: string;
          website_url?: string | null;
          whatsapp?: string | null;
        };
        Update: {
          address_text?: string | null;
          avg_price_per_person?: number | null;
          business_name?: string;
          city_id?: number | null;
          created_at?: string;
          description?: string | null;
          district_id?: number | null;
          email?: string | null;
          id?: string;
          logo_url?: string | null;
          max_guest_count?: number | null;
          min_guest_count?: number | null;
          owner_id?: string | null;
          phone?: string | null;
          slug?: string;
          status?: Database["public"]["Enums"]["vendor_status"];
          updated_at?: string;
          website_url?: string | null;
          whatsapp?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "vendors_city_id_fkey";
            columns: ["city_id"];
            isOneToOne: false;
            referencedRelation: "cities";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "vendors_district_id_fkey";
            columns: ["district_id"];
            isOneToOne: false;
            referencedRelation: "districts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "vendors_owner_id_fkey";
            columns: ["owner_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      vendor_ratings: {
        Row: {
          avg_rating: number | null;
          review_count: number | null;
          vendor_id: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "reviews_vendor_id_fkey";
            columns: ["vendor_id"];
            isOneToOne: false;
            referencedRelation: "vendors";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      lead_source: "website_form" | "vendor_page_form" | "admin_manual";
      service_place_type: "home" | "office" | "venue" | "outdoor" | "other";
      service_style:
        | "open_buffet"
        | "cocktail"
        | "plated"
        | "coffee_break"
        | "lunchbox"
        | "self_service";
      user_role: "admin" | "vendor_owner" | "customer";
      vendor_lead_status:
        | "sent"
        | "seen"
        | "contacted"
        | "quoted"
        | "won"
        | "lost";
      vendor_status: "pending" | "approved" | "rejected" | "suspended";
      quote_status:
        | "draft"
        | "sent"
        | "viewed"
        | "accepted"
        | "rejected"
        | "expired"
        | "cancelled";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
      DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] &
      DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R;
    }
    ? R
    : never
  : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Insert: infer I;
    }
    ? I
    : never
  : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Update: infer U;
    }
    ? U
    : never
  : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never;

export const Constants = {
  public: {
    Enums: {
      lead_source: ["website_form", "vendor_page_form", "admin_manual"],
      service_place_type: ["home", "office", "venue", "outdoor", "other"],
      service_style: [
        "open_buffet",
        "cocktail",
        "plated",
        "coffee_break",
        "lunchbox",
        "self_service",
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
      quote_status: [
        "draft",
        "sent",
        "viewed",
        "accepted",
        "rejected",
        "expired",
        "cancelled",
      ],
    },
  },
} as const;
