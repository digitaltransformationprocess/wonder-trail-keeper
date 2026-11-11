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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          parent_id: string | null
          slug: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          parent_id?: string | null
          slug: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          parent_id?: string | null
          slug?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      change_events: {
        Row: {
          detected_at: string
          field_key: string
          id: string
          new_value: string | null
          old_value: string | null
          review_note: string | null
          review_status: string
          reviewed_at: string | null
          reviewed_by: string | null
          source_id: string | null
          tool_id: string | null
        }
        Insert: {
          detected_at?: string
          field_key: string
          id?: string
          new_value?: string | null
          old_value?: string | null
          review_note?: string | null
          review_status?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          source_id?: string | null
          tool_id?: string | null
        }
        Update: {
          detected_at?: string
          field_key?: string
          id?: string
          new_value?: string | null
          old_value?: string | null
          review_note?: string | null
          review_status?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          source_id?: string | null
          tool_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "change_events_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "change_events_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "tools"
            referencedColumns: ["id"]
          },
        ]
      }
      collection_items: {
        Row: {
          collection_id: string
          created_at: string
          position: number
          tool_id: string
        }
        Insert: {
          collection_id: string
          created_at?: string
          position?: number
          tool_id: string
        }
        Update: {
          collection_id?: string
          created_at?: string
          position?: number
          tool_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "collection_items_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collection_items_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "tools"
            referencedColumns: ["id"]
          },
        ]
      }
      collections: {
        Row: {
          created_at: string
          id: string
          name: string
          slug: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          slug: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          slug?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      favorites: {
        Row: {
          created_at: string
          tool_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          tool_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          tool_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "tools"
            referencedColumns: ["id"]
          },
        ]
      }
      ingestion_candidates: {
        Row: {
          candidate_url: string
          confidence: number | null
          created_at: string
          dedupe_key: string
          discovered_at: string
          error: string | null
          extracted_payload: Json
          id: string
          raw_markdown: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          source_type: Database["public"]["Enums"]["ingestion_source_type"]
          status: Database["public"]["Enums"]["ingestion_candidate_status"]
          tool_id: string | null
          updated_at: string
        }
        Insert: {
          candidate_url: string
          confidence?: number | null
          created_at?: string
          dedupe_key: string
          discovered_at?: string
          error?: string | null
          extracted_payload?: Json
          id?: string
          raw_markdown?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          source_type?: Database["public"]["Enums"]["ingestion_source_type"]
          status?: Database["public"]["Enums"]["ingestion_candidate_status"]
          tool_id?: string | null
          updated_at?: string
        }
        Update: {
          candidate_url?: string
          confidence?: number | null
          created_at?: string
          dedupe_key?: string
          discovered_at?: string
          error?: string | null
          extracted_payload?: Json
          id?: string
          raw_markdown?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          source_type?: Database["public"]["Enums"]["ingestion_source_type"]
          status?: Database["public"]["Enums"]["ingestion_candidate_status"]
          tool_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ingestion_candidates_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ingestion_candidates_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "tools"
            referencedColumns: ["id"]
          },
        ]
      }
      ingestion_runs: {
        Row: {
          created_at: string
          error: string | null
          finished_at: string | null
          id: string
          kind: Database["public"]["Enums"]["ingestion_run_kind"]
          started_at: string
          stats: Json
        }
        Insert: {
          created_at?: string
          error?: string | null
          finished_at?: string | null
          id?: string
          kind: Database["public"]["Enums"]["ingestion_run_kind"]
          started_at?: string
          stats?: Json
        }
        Update: {
          created_at?: string
          error?: string | null
          finished_at?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["ingestion_run_kind"]
          started_at?: string
          stats?: Json
        }
        Relationships: []
      }
      news_items: {
        Row: {
          body: string | null
          created_at: string
          event_type: string | null
          id: string
          kind: string
          published_at: string
          slug: string | null
          solution_slug: string | null
          source_url: string
          status: Database["public"]["Enums"]["news_status"]
          summary: string
          title: string
          updated_at: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          event_type?: string | null
          id?: string
          kind: string
          published_at: string
          slug?: string | null
          solution_slug?: string | null
          source_url: string
          status?: Database["public"]["Enums"]["news_status"]
          summary: string
          title: string
          updated_at?: string
        }
        Update: {
          body?: string | null
          created_at?: string
          event_type?: string | null
          id?: string
          kind?: string
          published_at?: string
          slug?: string | null
          solution_slug?: string | null
          source_url?: string
          status?: Database["public"]["Enums"]["news_status"]
          summary?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      news_tool_links: {
        Row: {
          news_item_id: string
          tool_id: string
        }
        Insert: {
          news_item_id: string
          tool_id: string
        }
        Update: {
          news_item_id?: string
          tool_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "news_tool_links_news_item_id_fkey"
            columns: ["news_item_id"]
            isOneToOne: false
            referencedRelation: "news_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "news_tool_links_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "tools"
            referencedColumns: ["id"]
          },
        ]
      }
      platforms: {
        Row: {
          created_at: string
          id: string
          key: string
          label: string
        }
        Insert: {
          created_at?: string
          id?: string
          key: string
          label: string
        }
        Update: {
          created_at?: string
          id?: string
          key?: string
          label?: string
        }
        Relationships: []
      }
      pricing_plans: {
        Row: {
          billing_period: string | null
          created_at: string
          currency: string | null
          id: string
          limits_json: Json
          plan_name: string
          price_amount: number | null
          pricing_model: string | null
          source_id: string | null
          tool_id: string
          verified_at: string | null
        }
        Insert: {
          billing_period?: string | null
          created_at?: string
          currency?: string | null
          id?: string
          limits_json?: Json
          plan_name: string
          price_amount?: number | null
          pricing_model?: string | null
          source_id?: string | null
          tool_id: string
          verified_at?: string | null
        }
        Update: {
          billing_period?: string | null
          created_at?: string
          currency?: string | null
          id?: string
          limits_json?: Json
          plan_name?: string
          price_amount?: number | null
          pricing_model?: string | null
          source_id?: string | null
          tool_id?: string
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pricing_plans_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pricing_plans_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "tools"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Relationships: []
      }
      publishers: {
        Row: {
          country_code: string | null
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
          website_url: string | null
        }
        Insert: {
          country_code?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          country_code?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
          website_url?: string | null
        }
        Relationships: []
      }
      runtime_secrets: {
        Row: {
          key: string
          updated_at: string
          value: string
        }
        Insert: {
          key: string
          updated_at?: string
          value: string
        }
        Update: {
          key?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      search_logs: {
        Row: {
          constraints: Json
          created_at: string
          id: string
          latency_ms: number | null
          query: string
          result_count: number
          source: string
        }
        Insert: {
          constraints?: Json
          created_at?: string
          id?: string
          latency_ms?: number | null
          query: string
          result_count?: number
          source?: string
        }
        Update: {
          constraints?: Json
          created_at?: string
          id?: string
          latency_ms?: number | null
          query?: string
          result_count?: number
          source?: string
        }
        Relationships: []
      }
      solution_types: {
        Row: {
          created_at: string
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      sources: {
        Row: {
          created_at: string
          id: string
          publisher: string | null
          reliability_level: Database["public"]["Enums"]["reliability_level"]
          source_type: string
          terms_notes: string | null
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          publisher?: string | null
          reliability_level?: Database["public"]["Enums"]["reliability_level"]
          source_type?: string
          terms_notes?: string | null
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          publisher?: string | null
          reliability_level?: Database["public"]["Enums"]["reliability_level"]
          source_type?: string
          terms_notes?: string | null
          url?: string
        }
        Relationships: []
      }
      tool_categories: {
        Row: {
          category_id: string
          is_primary: boolean
          tool_id: string
        }
        Insert: {
          category_id: string
          is_primary?: boolean
          tool_id: string
        }
        Update: {
          category_id?: string
          is_primary?: boolean
          tool_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tool_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tool_categories_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "tools"
            referencedColumns: ["id"]
          },
        ]
      }
      tool_platforms: {
        Row: {
          notes: string | null
          platform_id: string
          status: string
          tool_id: string
        }
        Insert: {
          notes?: string | null
          platform_id: string
          status?: string
          tool_id: string
        }
        Update: {
          notes?: string | null
          platform_id?: string
          status?: string
          tool_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tool_platforms_platform_id_fkey"
            columns: ["platform_id"]
            isOneToOne: false
            referencedRelation: "platforms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tool_platforms_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "tools"
            referencedColumns: ["id"]
          },
        ]
      }
      tool_relations: {
        Row: {
          explanation: string | null
          relation_type: string
          source_tool_id: string
          target_tool_id: string
        }
        Insert: {
          explanation?: string | null
          relation_type?: string
          source_tool_id: string
          target_tool_id: string
        }
        Update: {
          explanation?: string | null
          relation_type?: string
          source_tool_id?: string
          target_tool_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tool_relations_source_tool_id_fkey"
            columns: ["source_tool_id"]
            isOneToOne: false
            referencedRelation: "tools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tool_relations_target_tool_id_fkey"
            columns: ["target_tool_id"]
            isOneToOne: false
            referencedRelation: "tools"
            referencedColumns: ["id"]
          },
        ]
      }
      tool_sources: {
        Row: {
          captured_at: string
          claim_key: string
          source_id: string
          tool_id: string
          verified_at: string | null
        }
        Insert: {
          captured_at?: string
          claim_key?: string
          source_id: string
          tool_id: string
          verified_at?: string | null
        }
        Update: {
          captured_at?: string
          claim_key?: string
          source_id?: string
          tool_id?: string
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tool_sources_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tool_sources_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "tools"
            referencedColumns: ["id"]
          },
        ]
      }
      tool_types: {
        Row: {
          is_primary: boolean
          solution_type_id: string
          tool_id: string
        }
        Insert: {
          is_primary?: boolean
          solution_type_id: string
          tool_id: string
        }
        Update: {
          is_primary?: boolean
          solution_type_id?: string
          tool_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tool_types_solution_type_id_fkey"
            columns: ["solution_type_id"]
            isOneToOne: false
            referencedRelation: "solution_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tool_types_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "tools"
            referencedColumns: ["id"]
          },
        ]
      }
      tools: {
        Row: {
          api_available: boolean | null
          audience: string[]
          created_at: string
          description: string
          id: string
          keywords: string[]
          last_verified_at: string | null
          limits: string[]
          local_available: boolean
          logo_url: string | null
          name: string
          official_url: string
          open_source: boolean
          price_display: string | null
          pricing_model: string | null
          publisher_id: string | null
          slug: string
          status: Database["public"]["Enums"]["tool_status"]
          strengths: string[]
          summary: string
          updated_at: string
        }
        Insert: {
          api_available?: boolean | null
          audience?: string[]
          created_at?: string
          description: string
          id?: string
          keywords?: string[]
          last_verified_at?: string | null
          limits?: string[]
          local_available?: boolean
          logo_url?: string | null
          name: string
          official_url: string
          open_source?: boolean
          price_display?: string | null
          pricing_model?: string | null
          publisher_id?: string | null
          slug: string
          status?: Database["public"]["Enums"]["tool_status"]
          strengths?: string[]
          summary: string
          updated_at?: string
        }
        Update: {
          api_available?: boolean | null
          audience?: string[]
          created_at?: string
          description?: string
          id?: string
          keywords?: string[]
          last_verified_at?: string | null
          limits?: string[]
          local_available?: boolean
          logo_url?: string | null
          name?: string
          official_url?: string
          open_source?: boolean
          price_display?: string | null
          pricing_model?: string | null
          publisher_id?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["tool_status"]
          strengths?: string[]
          summary?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tools_publisher_id_fkey"
            columns: ["publisher_id"]
            isOneToOne: false
            referencedRelation: "publishers"
            referencedColumns: ["id"]
          },
        ]
      }
      watch_state: {
        Row: {
          id: string
          last_result: string | null
          last_run_at: string | null
          locked_until: string | null
          paused_reason: string | null
        }
        Insert: {
          id: string
          last_result?: string | null
          last_run_at?: string | null
          locked_until?: string | null
          paused_reason?: string | null
        }
        Update: {
          id?: string
          last_result?: string | null
          last_run_at?: string | null
          locked_until?: string | null
          paused_reason?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      current_role: {
        Args: never
        Returns: Database["public"]["Enums"]["app_role"]
      }
      is_staff: { Args: never; Returns: boolean }
      search_published_tools: {
        Args: {
          q: string
          want_api?: boolean
          want_free?: boolean
          want_local?: boolean
          want_oss?: boolean
          result_limit?: number
        }
        Returns: {
          id: string
          name: string
          rank: number
          slug: string
          summary: string
        }[]
      }
    }
    Enums: {
      app_role:
        | "visitor"
        | "user"
        | "contributor"
        | "editor"
        | "admin"
        | "owner"
      ingestion_candidate_status:
        | "pending"
        | "approved"
        | "rejected"
        | "duplicate"
      ingestion_run_kind: "manual_ingest" | "daily_discover" | "change_watch"
      ingestion_source_type: "manual_url" | "daily_search"
      news_status: "draft" | "published" | "archived"
      reliability_level: "A" | "B" | "C" | "D"
      tool_status:
        | "discovered"
        | "pending_review"
        | "published"
        | "needs_update"
        | "archived"
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
      app_role: ["visitor", "user", "contributor", "editor", "admin", "owner"],
      ingestion_candidate_status: [
        "pending",
        "approved",
        "rejected",
        "duplicate",
      ],
      ingestion_run_kind: ["manual_ingest", "daily_discover"],
      ingestion_source_type: ["manual_url", "daily_search"],
      news_status: ["draft", "published", "archived"],
      reliability_level: ["A", "B", "C", "D"],
      tool_status: [
        "discovered",
        "pending_review",
        "published",
        "needs_update",
        "archived",
      ],
    },
  },
} as const
