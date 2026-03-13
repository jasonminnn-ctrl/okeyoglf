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
      assistant_campaigns: {
        Row: {
          benefit: string | null
          channel: string | null
          created_at: string
          design_needs: string | null
          end_date: string | null
          id: string
          linked_result_id: string | null
          memo: string | null
          org_id: string
          purpose: string | null
          source_type: string
          start_date: string | null
          status: string
          target_segment: string | null
          title: string
          updated_at: string
        }
        Insert: {
          benefit?: string | null
          channel?: string | null
          created_at?: string
          design_needs?: string | null
          end_date?: string | null
          id?: string
          linked_result_id?: string | null
          memo?: string | null
          org_id: string
          purpose?: string | null
          source_type?: string
          start_date?: string | null
          status?: string
          target_segment?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          benefit?: string | null
          channel?: string | null
          created_at?: string
          design_needs?: string | null
          end_date?: string | null
          id?: string
          linked_result_id?: string | null
          memo?: string | null
          org_id?: string
          purpose?: string | null
          source_type?: string
          start_date?: string | null
          status?: string
          target_segment?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assistant_campaigns_linked_result_id_fkey"
            columns: ["linked_result_id"]
            isOneToOne: false
            referencedRelation: "saved_results"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assistant_campaigns_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      assistant_checklist_items: {
        Row: {
          assignee_name: string | null
          checked_at: string | null
          checklist_id: string
          completed_by_name: string | null
          completed_by_user_id: string | null
          created_at: string
          id: string
          is_checked: boolean
          label: string
          memo: string | null
          org_id: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          assignee_name?: string | null
          checked_at?: string | null
          checklist_id: string
          completed_by_name?: string | null
          completed_by_user_id?: string | null
          created_at?: string
          id?: string
          is_checked?: boolean
          label: string
          memo?: string | null
          org_id: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          assignee_name?: string | null
          checked_at?: string | null
          checklist_id?: string
          completed_by_name?: string | null
          completed_by_user_id?: string | null
          created_at?: string
          id?: string
          is_checked?: boolean
          label?: string
          memo?: string | null
          org_id?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assistant_checklist_items_checklist_id_fkey"
            columns: ["checklist_id"]
            isOneToOne: false
            referencedRelation: "assistant_checklists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assistant_checklist_items_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      assistant_checklists: {
        Row: {
          checklist_type: string
          created_at: string
          focus_area: string | null
          id: string
          linked_result_id: string | null
          memo: string | null
          org_id: string
          source_type: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          checklist_type?: string
          created_at?: string
          focus_area?: string | null
          id?: string
          linked_result_id?: string | null
          memo?: string | null
          org_id: string
          source_type?: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          checklist_type?: string
          created_at?: string
          focus_area?: string | null
          id?: string
          linked_result_id?: string | null
          memo?: string | null
          org_id?: string
          source_type?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assistant_checklists_linked_result_id_fkey"
            columns: ["linked_result_id"]
            isOneToOne: false
            referencedRelation: "saved_results"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assistant_checklists_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      assistant_reminders: {
        Row: {
          created_at: string
          due_date: string | null
          id: string
          is_recurring: boolean
          linked_result_id: string | null
          memo: string | null
          org_id: string
          recurrence_rule: string | null
          reminder_type: string
          source_type: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          due_date?: string | null
          id?: string
          is_recurring?: boolean
          linked_result_id?: string | null
          memo?: string | null
          org_id: string
          recurrence_rule?: string | null
          reminder_type?: string
          source_type?: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          due_date?: string | null
          id?: string
          is_recurring?: boolean
          linked_result_id?: string | null
          memo?: string | null
          org_id?: string
          recurrence_rule?: string | null
          reminder_type?: string
          source_type?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assistant_reminders_linked_result_id_fkey"
            columns: ["linked_result_id"]
            isOneToOne: false
            referencedRelation: "saved_results"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assistant_reminders_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      assistant_tasks: {
        Row: {
          assignee: string | null
          category: string
          completed_at: string | null
          completed_by_name: string | null
          completed_by_user_id: string | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          linked_result_id: string | null
          memo: string | null
          org_id: string
          priority: string
          risk_source: string
          source_type: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          assignee?: string | null
          category?: string
          completed_at?: string | null
          completed_by_name?: string | null
          completed_by_user_id?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          linked_result_id?: string | null
          memo?: string | null
          org_id: string
          priority?: string
          risk_source?: string
          source_type?: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          assignee?: string | null
          category?: string
          completed_at?: string | null
          completed_by_name?: string | null
          completed_by_user_id?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          linked_result_id?: string | null
          memo?: string | null
          org_id?: string
          priority?: string
          risk_source?: string
          source_type?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assistant_tasks_linked_result_id_fkey"
            columns: ["linked_result_id"]
            isOneToOne: false
            referencedRelation: "saved_results"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assistant_tasks_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
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
          access_mode: string
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
          access_mode?: string
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
          access_mode?: string
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
      imweb_member_links: {
        Row: {
          created_at: string
          email: string | null
          external_member_id: string
          external_provider: string
          first_linked_at: string | null
          id: string
          last_synced_at: string | null
          link_status: string
          linked_profile_id: string | null
          member_name: string | null
          note: string | null
          org_id: string
          phone: string | null
          site_connection_id: string
          sync_status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          external_member_id: string
          external_provider?: string
          first_linked_at?: string | null
          id?: string
          last_synced_at?: string | null
          link_status?: string
          linked_profile_id?: string | null
          member_name?: string | null
          note?: string | null
          org_id: string
          phone?: string | null
          site_connection_id: string
          sync_status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          external_member_id?: string
          external_provider?: string
          first_linked_at?: string | null
          id?: string
          last_synced_at?: string | null
          link_status?: string
          linked_profile_id?: string | null
          member_name?: string | null
          note?: string | null
          org_id?: string
          phone?: string | null
          site_connection_id?: string
          sync_status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "imweb_member_links_linked_profile_id_fkey"
            columns: ["linked_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "imweb_member_links_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "imweb_member_links_site_connection_id_fkey"
            columns: ["site_connection_id"]
            isOneToOne: false
            referencedRelation: "imweb_site_connections"
            referencedColumns: ["id"]
          },
        ]
      }
      imweb_order_events: {
        Row: {
          created_at: string
          currency_code: string
          event_type: string
          external_member_id: string | null
          external_order_id: string | null
          external_product_code: string | null
          external_product_name: string | null
          external_provider: string
          id: string
          idempotency_key: string | null
          order_status: string | null
          ordered_at: string | null
          org_id: string
          paid_amount: number | null
          payload: Json
          processed_at: string | null
          processed_by: string | null
          processing_error: string | null
          processing_status: string
          retry_count: number
          site_connection_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency_code?: string
          event_type: string
          external_member_id?: string | null
          external_order_id?: string | null
          external_product_code?: string | null
          external_product_name?: string | null
          external_provider?: string
          id?: string
          idempotency_key?: string | null
          order_status?: string | null
          ordered_at?: string | null
          org_id: string
          paid_amount?: number | null
          payload?: Json
          processed_at?: string | null
          processed_by?: string | null
          processing_error?: string | null
          processing_status?: string
          retry_count?: number
          site_connection_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency_code?: string
          event_type?: string
          external_member_id?: string | null
          external_order_id?: string | null
          external_product_code?: string | null
          external_product_name?: string | null
          external_provider?: string
          id?: string
          idempotency_key?: string | null
          order_status?: string | null
          ordered_at?: string | null
          org_id?: string
          paid_amount?: number | null
          payload?: Json
          processed_at?: string | null
          processed_by?: string | null
          processing_error?: string | null
          processing_status?: string
          retry_count?: number
          site_connection_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "imweb_order_events_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "imweb_order_events_site_connection_id_fkey"
            columns: ["site_connection_id"]
            isOneToOne: false
            referencedRelation: "imweb_site_connections"
            referencedColumns: ["id"]
          },
        ]
      }
      imweb_point_credit_mappings: {
        Row: {
          created_at: string
          created_by: string | null
          external_point_product_code: string
          external_point_product_name: string
          grant_mode: string
          id: string
          is_active: boolean
          mapped_credit_amount: number
          note: string | null
          org_id: string
          site_connection_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          external_point_product_code: string
          external_point_product_name: string
          grant_mode?: string
          id?: string
          is_active?: boolean
          mapped_credit_amount: number
          note?: string | null
          org_id: string
          site_connection_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          external_point_product_code?: string
          external_point_product_name?: string
          grant_mode?: string
          id?: string
          is_active?: boolean
          mapped_credit_amount?: number
          note?: string | null
          org_id?: string
          site_connection_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "imweb_point_credit_mappings_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "imweb_point_credit_mappings_site_connection_id_fkey"
            columns: ["site_connection_id"]
            isOneToOne: false
            referencedRelation: "imweb_site_connections"
            referencedColumns: ["id"]
          },
        ]
      }
      imweb_product_membership_mappings: {
        Row: {
          created_at: string
          created_by: string | null
          external_product_code: string
          external_product_name: string
          id: string
          is_active: boolean
          mapped_membership_code: Database["public"]["Enums"]["membership_code"]
          mapped_membership_label: string | null
          note: string | null
          org_id: string
          site_connection_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          external_product_code: string
          external_product_name: string
          id?: string
          is_active?: boolean
          mapped_membership_code: Database["public"]["Enums"]["membership_code"]
          mapped_membership_label?: string | null
          note?: string | null
          org_id: string
          site_connection_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          external_product_code?: string
          external_product_name?: string
          id?: string
          is_active?: boolean
          mapped_membership_code?: Database["public"]["Enums"]["membership_code"]
          mapped_membership_label?: string | null
          note?: string | null
          org_id?: string
          site_connection_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "imweb_product_membership_mappings_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "imweb_product_membership_mappings_site_connection_id_fkey"
            columns: ["site_connection_id"]
            isOneToOne: false
            referencedRelation: "imweb_site_connections"
            referencedColumns: ["id"]
          },
        ]
      }
      imweb_site_connections: {
        Row: {
          connection_status: string
          created_at: string
          external_provider: string
          id: string
          last_error: string | null
          last_event_at: string | null
          last_event_type: string | null
          last_synced_at: string | null
          note: string | null
          org_id: string
          site_code: string
          updated_at: string
          webhook_registered: boolean
          webhook_url: string | null
        }
        Insert: {
          connection_status?: string
          created_at?: string
          external_provider?: string
          id?: string
          last_error?: string | null
          last_event_at?: string | null
          last_event_type?: string | null
          last_synced_at?: string | null
          note?: string | null
          org_id: string
          site_code: string
          updated_at?: string
          webhook_registered?: boolean
          webhook_url?: string | null
        }
        Update: {
          connection_status?: string
          created_at?: string
          external_provider?: string
          id?: string
          last_error?: string | null
          last_event_at?: string | null
          last_event_type?: string | null
          last_synced_at?: string | null
          note?: string | null
          org_id?: string
          site_code?: string
          updated_at?: string
          webhook_registered?: boolean
          webhook_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "imweb_site_connections_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      operational_attachments: {
        Row: {
          created_at: string
          entity_id: string
          entity_type: string
          file_name: string
          file_path: string
          file_size_bytes: number | null
          id: string
          mime_type: string | null
          org_id: string
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string
          entity_id: string
          entity_type: string
          file_name: string
          file_path: string
          file_size_bytes?: number | null
          id?: string
          mime_type?: string | null
          org_id: string
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string
          entity_id?: string
          entity_type?: string
          file_name?: string
          file_path?: string
          file_size_bytes?: number | null
          id?: string
          mime_type?: string | null
          org_id?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "operational_attachments_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      operator_notices: {
        Row: {
          body: string | null
          created_at: string
          created_by: string | null
          expires_at: string | null
          id: string
          important: boolean
          is_active: boolean
          link_label: string | null
          link_url: string | null
          notice_type: string
          org_id: string | null
          priority: number
          published_at: string | null
          summary: string | null
          target_business_types: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          important?: boolean
          is_active?: boolean
          link_label?: string | null
          link_url?: string | null
          notice_type?: string
          org_id?: string | null
          priority?: number
          published_at?: string | null
          summary?: string | null
          target_business_types?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          body?: string | null
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          important?: boolean
          is_active?: boolean
          link_label?: string | null
          link_url?: string | null
          notice_type?: string
          org_id?: string | null
          priority?: number
          published_at?: string | null
          summary?: string | null
          target_business_types?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      operator_recommendations: {
        Row: {
          category: string
          created_at: string
          created_by: string | null
          description: string | null
          end_date: string | null
          id: string
          is_active: boolean
          link_label: string | null
          link_url: string | null
          memo: string | null
          priority: string
          recommendation_type: string
          start_date: string | null
          target_branch_code: string | null
          target_business_types: string[] | null
          target_org_id: string | null
          target_user_ids: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean
          link_label?: string | null
          link_url?: string | null
          memo?: string | null
          priority?: string
          recommendation_type?: string
          start_date?: string | null
          target_branch_code?: string | null
          target_business_types?: string[] | null
          target_org_id?: string | null
          target_user_ids?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean
          link_label?: string | null
          link_url?: string | null
          memo?: string | null
          priority?: string
          recommendation_type?: string
          start_date?: string | null
          target_branch_code?: string | null
          target_business_types?: string[] | null
          target_org_id?: string | null
          target_user_ids?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "operator_recommendations_target_org_id_fkey"
            columns: ["target_org_id"]
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
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          org_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id: string
          org_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          org_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_org_id_fkey"
            columns: ["org_id"]
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
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_access_feature_override: {
        Args: { _org_id: string }
        Returns: boolean
      }
      can_access_org: { Args: { _org_id: string }; Returns: boolean }
      current_profile_org_id: { Args: never; Returns: string }
      deduct_credit: {
        Args: {
          _actor_type?: string
          _amount: number
          _module?: string
          _org_id: string
          _reason: string
          _result_id?: string
          _type: Database["public"]["Enums"]["ledger_type"]
        }
        Returns: boolean
      }
      get_my_org_id: { Args: never; Returns: string }
      grant_credit: {
        Args: {
          _amount: number
          _org_id: string
          _reason: string
          _type: Database["public"]["Enums"]["ledger_type"]
        }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_operator_user: { Args: never; Returns: boolean }
    }
    Enums: {
      app_role: "customer" | "operator"
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
      app_role: ["customer", "operator"],
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
