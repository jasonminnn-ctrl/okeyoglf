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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      consultant_requests: {
        Row: {
          assigned_to: string | null
          consultant_note: string | null
          created_at: string
          id: string
          org_id: string
          request_note: string | null
          request_type: Database["public"]["Enums"]["consultant_request_type"]
          result_id: string | null
          status: Database["public"]["Enums"]["consultant_status"]
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          consultant_note?: string | null
          created_at?: string
          id?: string
          org_id: string
          request_note?: string | null
          request_type?: Database["public"]["Enums"]["consultant_request_type"]
          result_id?: string | null
          status?: Database["public"]["Enums"]["consultant_status"]
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          consultant_note?: string | null
          created_at?: string
          id?: string
          org_id?: string
          request_note?: string | null
          request_type?: Database["public"]["Enums"]["consultant_request_type"]
          result_id?: string | null
          status?: Database["public"]["Enums"]["consultant_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "consultant_requests_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consultant_requests_result_id_fkey"
            columns: ["result_id"]
            isOneToOne: false
            referencedRelation: "saved_results"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_ledger: {
        Row: {
          actor_id: string | null
          actor_type: string
          amount_delta: number
          balance_after: number
          created_at: string
          id: string
          org_id: string
          reason: string
          related_module: string | null
          related_result_id: string | null
          type: Database["public"]["Enums"]["ledger_type"]
          wallet_id: string
        }
        Insert: {
          actor_id?: string | null
          actor_type?: string
          amount_delta: number
          balance_after: number
          created_at?: string
          id?: string
          org_id: string
          reason?: string
          related_module?: string | null
          related_result_id?: string | null
          type: Database["public"]["Enums"]["ledger_type"]
          wallet_id: string
        }
        Update: {
          actor_id?: string | null
          actor_type?: string
          amount_delta?: number
          balance_after?: number
          created_at?: string
          id?: string
          org_id?: string
          reason?: string
          related_module?: string | null
          related_result_id?: string | null
          type?: Database["public"]["Enums"]["ledger_type"]
          wallet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "credit_ledger_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credit_ledger_related_result_id_fkey"
            columns: ["related_result_id"]
            isOneToOne: false
            referencedRelation: "saved_results"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credit_ledger_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "credit_wallets"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_wallets: {
        Row: {
          balance: number
          id: string
          lifetime_granted: number
          lifetime_used: number
          org_id: string
          updated_at: string
        }
        Insert: {
          balance?: number
          id?: string
          lifetime_granted?: number
          lifetime_used?: number
          org_id: string
          updated_at?: string
        }
        Update: {
          balance?: number
          id?: string
          lifetime_granted?: number
          lifetime_used?: number
          org_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "credit_wallets_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      feature_overrides: {
        Row: {
          created_at: string
          created_by: string | null
          custom_credit_cost: number | null
          enabled: boolean
          feature_key: string
          id: string
          membership_code: Database["public"]["Enums"]["membership_code"] | null
          org_id: string | null
          reason: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          custom_credit_cost?: number | null
          enabled?: boolean
          feature_key: string
          id?: string
          membership_code?:
            | Database["public"]["Enums"]["membership_code"]
            | null
          org_id?: string | null
          reason?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          custom_credit_cost?: number | null
          enabled?: boolean
          feature_key?: string
          id?: string
          membership_code?:
            | Database["public"]["Enums"]["membership_code"]
            | null
          org_id?: string | null
          reason?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "feature_overrides_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          branch_code: string | null
          business_type: string
          created_at: string
          id: string
          membership_code: Database["public"]["Enums"]["membership_code"]
          name: string
          parent_org_id: string | null
          settings: Json | null
          updated_at: string
        }
        Insert: {
          branch_code?: string | null
          business_type?: string
          created_at?: string
          id?: string
          membership_code?: Database["public"]["Enums"]["membership_code"]
          name: string
          parent_org_id?: string | null
          settings?: Json | null
          updated_at?: string
        }
        Update: {
          branch_code?: string | null
          business_type?: string
          created_at?: string
          id?: string
          membership_code?: Database["public"]["Enums"]["membership_code"]
          name?: string
          parent_org_id?: string | null
          settings?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "organizations_parent_org_id_fkey"
            columns: ["parent_org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      research_requests: {
        Row: {
          completed_at: string | null
          error_message: string | null
          id: string
          org_id: string
          query: string
          request_payload: Json | null
          requested_at: string
          research_type: string
          result_data: Json | null
          result_id: string | null
          result_payload: Json | null
          status: Database["public"]["Enums"]["research_status"]
        }
        Insert: {
          completed_at?: string | null
          error_message?: string | null
          id?: string
          org_id: string
          query: string
          request_payload?: Json | null
          requested_at?: string
          research_type?: string
          result_data?: Json | null
          result_id?: string | null
          result_payload?: Json | null
          status?: Database["public"]["Enums"]["research_status"]
        }
        Update: {
          completed_at?: string | null
          error_message?: string | null
          id?: string
          org_id?: string
          query?: string
          request_payload?: Json | null
          requested_at?: string
          research_type?: string
          result_data?: Json | null
          result_id?: string | null
          result_payload?: Json | null
          status?: Database["public"]["Enums"]["research_status"]
        }
        Relationships: [
          {
            foreignKeyName: "research_requests_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "research_requests_result_id_fkey"
            columns: ["result_id"]
            isOneToOne: false
            referencedRelation: "saved_results"
            referencedColumns: ["id"]
          },
        ]
      }
      result_attachments: {
        Row: {
          created_at: string
          file_name: string
          file_size_bytes: number | null
          file_type: string
          id: string
          org_id: string
          result_id: string
          storage_path: string | null
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string
          file_name: string
          file_size_bytes?: number | null
          file_type?: string
          id?: string
          org_id: string
          result_id: string
          storage_path?: string | null
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string
          file_name?: string
          file_size_bytes?: number | null
          file_type?: string
          id?: string
          org_id?: string
          result_id?: string
          storage_path?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "result_attachments_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "result_attachments_result_id_fkey"
            columns: ["result_id"]
            isOneToOne: false
            referencedRelation: "saved_results"
            referencedColumns: ["id"]
          },
        ]
      }
      result_deliveries: {
        Row: {
          created_at: string
          file_name: string | null
          id: string
          metadata: Json | null
          method: Database["public"]["Enums"]["delivery_method"]
          note: string | null
          org_id: string
          recipient: string | null
          result_id: string
          status: string
        }
        Insert: {
          created_at?: string
          file_name?: string | null
          id?: string
          metadata?: Json | null
          method: Database["public"]["Enums"]["delivery_method"]
          note?: string | null
          org_id: string
          recipient?: string | null
          result_id: string
          status?: string
        }
        Update: {
          created_at?: string
          file_name?: string | null
          id?: string
          metadata?: Json | null
          method?: Database["public"]["Enums"]["delivery_method"]
          note?: string | null
          org_id?: string
          recipient?: string | null
          result_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "result_deliveries_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "result_deliveries_result_id_fkey"
            columns: ["result_id"]
            isOneToOne: false
            referencedRelation: "saved_results"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_results: {
        Row: {
          business_type: string
          category: string
          context_summary: Json | null
          created_at: string
          deleted_at: string | null
          id: string
          metadata: Json | null
          module: string | null
          org_id: string
          output_format: string | null
          plain_text: string | null
          reference_id: string | null
          reference_note: string | null
          regenerated_from_id: string | null
          sections: Json
          source_menu: string | null
          source_note: string | null
          source_tool: string | null
          status: Database["public"]["Enums"]["result_status"]
          subtool: string | null
          tags: string[] | null
          title: string
          type: Database["public"]["Enums"]["result_type"]
          updated_at: string
          version: number
        }
        Insert: {
          business_type?: string
          category?: string
          context_summary?: Json | null
          created_at?: string
          deleted_at?: string | null
          id?: string
          metadata?: Json | null
          module?: string | null
          org_id: string
          output_format?: string | null
          plain_text?: string | null
          reference_id?: string | null
          reference_note?: string | null
          regenerated_from_id?: string | null
          sections?: Json
          source_menu?: string | null
          source_note?: string | null
          source_tool?: string | null
          status?: Database["public"]["Enums"]["result_status"]
          subtool?: string | null
          tags?: string[] | null
          title: string
          type?: Database["public"]["Enums"]["result_type"]
          updated_at?: string
          version?: number
        }
        Update: {
          business_type?: string
          category?: string
          context_summary?: Json | null
          created_at?: string
          deleted_at?: string | null
          id?: string
          metadata?: Json | null
          module?: string | null
          org_id?: string
          output_format?: string | null
          plain_text?: string | null
          reference_id?: string | null
          reference_note?: string | null
          regenerated_from_id?: string | null
          sections?: Json
          source_menu?: string | null
          source_note?: string | null
          source_tool?: string | null
          status?: Database["public"]["Enums"]["result_status"]
          subtool?: string | null
          tags?: string[] | null
          title?: string
          type?: Database["public"]["Enums"]["result_type"]
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "saved_results_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_results_regenerated_from_id_fkey"
            columns: ["regenerated_from_id"]
            isOneToOne: false
            referencedRelation: "saved_results"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      deduct_credit: {
        Args: {
          _amount: number
          _module?: string
          _org_id: string
          _reason: string
          _result_id?: string
          _type: Database["public"]["Enums"]["ledger_type"]
        }
        Returns: boolean
      }
      grant_credit: {
        Args: {
          _amount: number
          _org_id: string
          _reason: string
          _type: Database["public"]["Enums"]["ledger_type"]
        }
        Returns: boolean
      }
    }
    Enums: {
      consultant_request_type:
        | "request"
        | "ppt"
        | "analysis"
        | "review"
        | "custom"
      consultant_status: "requested" | "in_progress" | "completed" | "cancelled"
      delivery_method:
        | "email"
        | "kakao"
        | "sms"
        | "internal"
        | "link"
        | "copy_text"
        | "export_pdf"
        | "export_doc"
        | "export_ppt"
        | "export_csv"
        | "export_txt"
      ledger_type:
        | "generate"
        | "regenerate"
        | "export"
        | "research"
        | "consultant"
        | "manual_grant"
        | "manual_deduct"
        | "auto_grant"
        | "refund"
        | "bonus"
        | "expire"
        | "admin_adjust"
      membership_code: "trial" | "standard" | "pro" | "enterprise"
      research_status:
        | "requested"
        | "processing"
        | "completed"
        | "consultant_handoff"
        | "failed"
      result_status: "draft" | "review" | "done" | "delivered" | "archived"
      result_type: "generation" | "research" | "consultant" | "manual"
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
      consultant_request_type: [
        "request",
        "ppt",
        "analysis",
        "review",
        "custom",
      ],
      consultant_status: ["requested", "in_progress", "completed", "cancelled"],
      delivery_method: [
        "email",
        "kakao",
        "sms",
        "internal",
        "link",
        "copy_text",
        "export_pdf",
        "export_doc",
        "export_ppt",
        "export_csv",
        "export_txt",
      ],
      ledger_type: [
        "generate",
        "regenerate",
        "export",
        "research",
        "consultant",
        "manual_grant",
        "manual_deduct",
        "auto_grant",
        "refund",
        "bonus",
        "expire",
        "admin_adjust",
      ],
      membership_code: ["trial", "standard", "pro", "enterprise"],
      research_status: [
        "requested",
        "processing",
        "completed",
        "consultant_handoff",
        "failed",
      ],
      result_status: ["draft", "review", "done", "delivered", "archived"],
      result_type: ["generation", "research", "consultant", "manual"],
    },
  },
} as const
