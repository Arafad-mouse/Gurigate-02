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
    PostgrestVersion: "14.1"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      availability_blocks: {
        Row: {
          advance_booking_days: number | null
          block_type: Database["public"]["Enums"]["availability_block_type"]
          created_at: string | null
          created_by: string | null
          deleted_at: string | null
          deleted_by: string | null
          end_date: string
          id: string
          maximum_stay: number | null
          metadata: Json | null
          minimum_stay: number | null
          notes: string | null
          property_id: string
          reason: string | null
          start_date: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          advance_booking_days?: number | null
          block_type?: Database["public"]["Enums"]["availability_block_type"]
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          end_date: string
          id?: string
          maximum_stay?: number | null
          metadata?: Json | null
          minimum_stay?: number | null
          notes?: string | null
          property_id: string
          reason?: string | null
          start_date: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          advance_booking_days?: number | null
          block_type?: Database["public"]["Enums"]["availability_block_type"]
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          end_date?: string
          id?: string
          maximum_stay?: number | null
          metadata?: Json | null
          minimum_stay?: number | null
          notes?: string | null
          property_id?: string
          reason?: string | null
          start_date?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "availability_blocks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "pending_payment_review"
            referencedColumns: ["payee_id"]
          },
          {
            foreignKeyName: "availability_blocks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "availability_blocks_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "pending_payment_review"
            referencedColumns: ["payee_id"]
          },
          {
            foreignKeyName: "availability_blocks_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "availability_blocks_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "availability_blocks_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "property_availability_summary"
            referencedColumns: ["property_id"]
          },
          {
            foreignKeyName: "availability_blocks_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "pending_payment_review"
            referencedColumns: ["payee_id"]
          },
          {
            foreignKeyName: "availability_blocks_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          booking_type: Database["public"]["Enums"]["booking_type"]
          cancellation_reason: string | null
          cancelled_by: string | null
          check_in: string
          check_out: string
          created_at: string
          customer_id: string | null
          guest_id: string
          guest_note: string | null
          id: string
          nights: number | null
          property_id: string
          status: Database["public"]["Enums"]["booking_status"]
          total_price: number
          updated_at: string
        }
        Insert: {
          booking_type?: Database["public"]["Enums"]["booking_type"]
          cancellation_reason?: string | null
          cancelled_by?: string | null
          check_in: string
          check_out: string
          created_at?: string
          customer_id?: string | null
          guest_id: string
          guest_note?: string | null
          id?: string
          nights?: number | null
          property_id: string
          status?: Database["public"]["Enums"]["booking_status"]
          total_price: number
          updated_at?: string
        }
        Update: {
          booking_type?: Database["public"]["Enums"]["booking_type"]
          cancellation_reason?: string | null
          cancelled_by?: string | null
          check_in?: string
          check_out?: string
          created_at?: string
          customer_id?: string | null
          guest_id?: string
          guest_note?: string | null
          id?: string
          nights?: number | null
          property_id?: string
          status?: Database["public"]["Enums"]["booking_status"]
          total_price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_cancelled_by_fkey"
            columns: ["cancelled_by"]
            isOneToOne: false
            referencedRelation: "pending_payment_review"
            referencedColumns: ["payee_id"]
          },
          {
            foreignKeyName: "bookings_cancelled_by_fkey"
            columns: ["cancelled_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customer_metrics_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_guest_id_fkey"
            columns: ["guest_id"]
            isOneToOne: false
            referencedRelation: "pending_payment_review"
            referencedColumns: ["payee_id"]
          },
          {
            foreignKeyName: "bookings_guest_id_fkey"
            columns: ["guest_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "property_availability_summary"
            referencedColumns: ["property_id"]
          },
        ]
      }
      buildings: {
        Row: {
          address: string | null
          city: string | null
          created_at: string
          description: string | null
          district: string | null
          id: string
          image_url: string | null
          lat: number | null
          lng: number | null
          name: string
          owner_id: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string
          description?: string | null
          district?: string | null
          id?: string
          image_url?: string | null
          lat?: number | null
          lng?: number | null
          name: string
          owner_id: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string
          description?: string | null
          district?: string | null
          id?: string
          image_url?: string | null
          lat?: number | null
          lng?: number | null
          name?: string
          owner_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "buildings_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "pending_payment_review"
            referencedColumns: ["payee_id"]
          },
          {
            foreignKeyName: "buildings_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      contracts: {
        Row: {
          created_at: string
          deposit_amount: number
          document_url: string | null
          end_date: string
          id: string
          monthly_rent: number
          notes: string | null
          start_date: string
          status: Database["public"]["Enums"]["contract_status"]
          tenant_id: string
          unit_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          deposit_amount?: number
          document_url?: string | null
          end_date: string
          id?: string
          monthly_rent: number
          notes?: string | null
          start_date: string
          status?: Database["public"]["Enums"]["contract_status"]
          tenant_id: string
          unit_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          deposit_amount?: number
          document_url?: string | null
          end_date?: string
          id?: string
          monthly_rent?: number
          notes?: string | null
          start_date?: string
          status?: Database["public"]["Enums"]["contract_status"]
          tenant_id?: string
          unit_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contracts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "active_contracts_view"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "contracts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "active_contracts_view"
            referencedColumns: ["unit_id"]
          },
          {
            foreignKeyName: "contracts_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_participants: {
        Row: {
          conversation_id: string
          id: string
          is_admin: boolean | null
          is_muted: boolean | null
          joined_at: string | null
          last_read_at: string | null
          role: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          conversation_id: string
          id?: string
          is_admin?: boolean | null
          is_muted?: boolean | null
          joined_at?: string | null
          last_read_at?: string | null
          role?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          conversation_id?: string
          id?: string
          is_admin?: boolean | null
          is_muted?: boolean | null
          joined_at?: string | null
          last_read_at?: string | null
          role?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_participants_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversation_list_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_participants_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_participants_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "user_conversations_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "pending_payment_review"
            referencedColumns: ["payee_id"]
          },
          {
            foreignKeyName: "conversation_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          assigned_at: string | null
          assigned_to: string | null
          created_at: string | null
          created_by: string | null
          deleted_at: string | null
          deleted_by: string | null
          first_response_at: string | null
          id: string
          metadata: Json | null
          priority: Database["public"]["Enums"]["conversation_priority"]
          related_booking_id: string | null
          related_contract_id: string | null
          related_payment_id: string | null
          related_property_id: string | null
          related_tenant_id: string | null
          related_unit_id: string | null
          resolved_at: string | null
          status: Database["public"]["Enums"]["conversation_status"]
          subject: string | null
          type: Database["public"]["Enums"]["conversation_type"]
          updated_at: string | null
        }
        Insert: {
          assigned_at?: string | null
          assigned_to?: string | null
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          first_response_at?: string | null
          id?: string
          metadata?: Json | null
          priority?: Database["public"]["Enums"]["conversation_priority"]
          related_booking_id?: string | null
          related_contract_id?: string | null
          related_payment_id?: string | null
          related_property_id?: string | null
          related_tenant_id?: string | null
          related_unit_id?: string | null
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["conversation_status"]
          subject?: string | null
          type?: Database["public"]["Enums"]["conversation_type"]
          updated_at?: string | null
        }
        Update: {
          assigned_at?: string | null
          assigned_to?: string | null
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          first_response_at?: string | null
          id?: string
          metadata?: Json | null
          priority?: Database["public"]["Enums"]["conversation_priority"]
          related_booking_id?: string | null
          related_contract_id?: string | null
          related_payment_id?: string | null
          related_property_id?: string | null
          related_tenant_id?: string | null
          related_unit_id?: string | null
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["conversation_status"]
          subject?: string | null
          type?: Database["public"]["Enums"]["conversation_type"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversations_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "pending_payment_review"
            referencedColumns: ["payee_id"]
          },
          {
            foreignKeyName: "conversations_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "pending_payment_review"
            referencedColumns: ["payee_id"]
          },
          {
            foreignKeyName: "conversations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "pending_payment_review"
            referencedColumns: ["payee_id"]
          },
          {
            foreignKeyName: "conversations_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_related_booking_id_fkey"
            columns: ["related_booking_id"]
            isOneToOne: true
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_related_contract_id_fkey"
            columns: ["related_contract_id"]
            isOneToOne: false
            referencedRelation: "active_contracts_view"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "conversations_related_contract_id_fkey"
            columns: ["related_contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_related_payment_id_fkey"
            columns: ["related_payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_related_payment_id_fkey"
            columns: ["related_payment_id"]
            isOneToOne: false
            referencedRelation: "pending_payment_review"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_related_property_id_fkey"
            columns: ["related_property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_related_property_id_fkey"
            columns: ["related_property_id"]
            isOneToOne: false
            referencedRelation: "property_availability_summary"
            referencedColumns: ["property_id"]
          },
          {
            foreignKeyName: "conversations_related_tenant_id_fkey"
            columns: ["related_tenant_id"]
            isOneToOne: false
            referencedRelation: "active_contracts_view"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "conversations_related_tenant_id_fkey"
            columns: ["related_tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_related_unit_id_fkey"
            columns: ["related_unit_id"]
            isOneToOne: false
            referencedRelation: "active_contracts_view"
            referencedColumns: ["unit_id"]
          },
          {
            foreignKeyName: "conversations_related_unit_id_fkey"
            columns: ["related_unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          created_at: string | null
          created_by: string | null
          currency: string | null
          current_property_id: string | null
          customer_type: Database["public"]["Enums"]["customer_type"]
          deleted_at: string | null
          deleted_by: string | null
          id: string
          last_activity_at: string | null
          lifecycle_status: Database["public"]["Enums"]["lifecycle_status"]
          metadata: Json | null
          notes: string | null
          preferences: Json | null
          profile_id: string
          tags: Json | null
          total_bookings: number | null
          total_rent_paid: number | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          current_property_id?: string | null
          customer_type?: Database["public"]["Enums"]["customer_type"]
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          last_activity_at?: string | null
          lifecycle_status?: Database["public"]["Enums"]["lifecycle_status"]
          metadata?: Json | null
          notes?: string | null
          preferences?: Json | null
          profile_id: string
          tags?: Json | null
          total_bookings?: number | null
          total_rent_paid?: number | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          current_property_id?: string | null
          customer_type?: Database["public"]["Enums"]["customer_type"]
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          last_activity_at?: string | null
          lifecycle_status?: Database["public"]["Enums"]["lifecycle_status"]
          metadata?: Json | null
          notes?: string | null
          preferences?: Json | null
          profile_id?: string
          tags?: Json | null
          total_bookings?: number | null
          total_rent_paid?: number | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customers_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "pending_payment_review"
            referencedColumns: ["payee_id"]
          },
          {
            foreignKeyName: "customers_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customers_current_property_id_fkey"
            columns: ["current_property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customers_current_property_id_fkey"
            columns: ["current_property_id"]
            isOneToOne: false
            referencedRelation: "property_availability_summary"
            referencedColumns: ["property_id"]
          },
          {
            foreignKeyName: "customers_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "pending_payment_review"
            referencedColumns: ["payee_id"]
          },
          {
            foreignKeyName: "customers_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customers_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "pending_payment_review"
            referencedColumns: ["payee_id"]
          },
          {
            foreignKeyName: "customers_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customers_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "pending_payment_review"
            referencedColumns: ["payee_id"]
          },
          {
            foreignKeyName: "customers_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      locations: {
        Row: {
          country_code: string | null
          created_at: string
          id: string
          is_active: boolean
          name: string
          parent_id: string | null
          slug: string
          sort_order: number
          type: Database["public"]["Enums"]["location_type"]
          updated_at: string
        }
        Insert: {
          country_code?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          parent_id?: string | null
          slug: string
          sort_order?: number
          type: Database["public"]["Enums"]["location_type"]
          updated_at?: string
        }
        Update: {
          country_code?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          parent_id?: string | null
          slug?: string
          sort_order?: number
          type?: Database["public"]["Enums"]["location_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "locations_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      message_attachments: {
        Row: {
          created_at: string | null
          file_name: string
          file_size: number | null
          file_type: string | null
          file_url: string
          id: string
          message_id: string
          mime_type: string | null
          storage_bucket: string | null
          storage_path: string | null
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string | null
          file_name: string
          file_size?: number | null
          file_type?: string | null
          file_url: string
          id?: string
          message_id: string
          mime_type?: string | null
          storage_bucket?: string | null
          storage_path?: string | null
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string | null
          file_name?: string
          file_size?: number | null
          file_type?: string | null
          file_url?: string
          id?: string
          message_id?: string
          mime_type?: string | null
          storage_bucket?: string | null
          storage_path?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "message_attachments_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_attachments_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "pending_payment_review"
            referencedColumns: ["payee_id"]
          },
          {
            foreignKeyName: "message_attachments_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string | null
          deleted_at: string | null
          deleted_by: string | null
          id: string
          is_internal: boolean | null
          is_system: boolean | null
          metadata: Json | null
          search_vector: unknown
          sender_id: string
          type: Database["public"]["Enums"]["message_content_type"]
          updated_at: string | null
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          is_internal?: boolean | null
          is_system?: boolean | null
          metadata?: Json | null
          search_vector?: unknown
          sender_id: string
          type?: Database["public"]["Enums"]["message_content_type"]
          updated_at?: string | null
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          is_internal?: boolean | null
          is_system?: boolean | null
          metadata?: Json | null
          search_vector?: unknown
          sender_id?: string
          type?: Database["public"]["Enums"]["message_content_type"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversation_list_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "user_conversations_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "pending_payment_review"
            referencedColumns: ["payee_id"]
          },
          {
            foreignKeyName: "messages_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "pending_payment_review"
            referencedColumns: ["payee_id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      owner_payment_methods: {
        Row: {
          created_at: string
          id: string
          is_default: boolean
          label: string | null
          number: string
          owner_id: string
          type: Database["public"]["Enums"]["payment_method_type"]
        }
        Insert: {
          created_at?: string
          id?: string
          is_default?: boolean
          label?: string | null
          number: string
          owner_id: string
          type: Database["public"]["Enums"]["payment_method_type"]
        }
        Update: {
          created_at?: string
          id?: string
          is_default?: boolean
          label?: string | null
          number?: string
          owner_id?: string
          type?: Database["public"]["Enums"]["payment_method_type"]
        }
        Relationships: [
          {
            foreignKeyName: "owner_payment_methods_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "pending_payment_review"
            referencedColumns: ["payee_id"]
          },
          {
            foreignKeyName: "owner_payment_methods_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          due_date: string | null
          id: string
          method: Database["public"]["Enums"]["payment_method"]
          note: string | null
          payee_id: string
          payer_id: string
          proof_url: string | null
          reference_id: string
          reference_type: Database["public"]["Enums"]["payment_reference_type"]
          status: Database["public"]["Enums"]["payment_status"]
          updated_at: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          due_date?: string | null
          id?: string
          method: Database["public"]["Enums"]["payment_method"]
          note?: string | null
          payee_id: string
          payer_id: string
          proof_url?: string | null
          reference_id: string
          reference_type: Database["public"]["Enums"]["payment_reference_type"]
          status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          due_date?: string | null
          id?: string
          method?: Database["public"]["Enums"]["payment_method"]
          note?: string | null
          payee_id?: string
          payer_id?: string
          proof_url?: string | null
          reference_id?: string
          reference_type?: Database["public"]["Enums"]["payment_reference_type"]
          status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_payee_id_fkey"
            columns: ["payee_id"]
            isOneToOne: false
            referencedRelation: "pending_payment_review"
            referencedColumns: ["payee_id"]
          },
          {
            foreignKeyName: "payments_payee_id_fkey"
            columns: ["payee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_payer_id_fkey"
            columns: ["payer_id"]
            isOneToOne: false
            referencedRelation: "pending_payment_review"
            referencedColumns: ["payee_id"]
          },
          {
            foreignKeyName: "payments_payer_id_fkey"
            columns: ["payer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "pending_payment_review"
            referencedColumns: ["payee_id"]
          },
          {
            foreignKeyName: "payments_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
      properties: {
        Row: {
          address: string | null
          amenities: Json
          bathrooms: number | null
          bedrooms: number | null
          city: string | null
          city_location_id: string | null
          cleaning_fee: number | null
          country_location_id: string | null
          created_at: string
          description: string | null
          district: string | null
          district_location_id: string | null
          id: string
          is_approved: boolean
          is_featured: boolean
          is_pet_allowed: boolean
          lat: number | null
          lng: number | null
          max_adults: number
          max_children: number
          max_infants: number
          max_pets: number
          max_total_guests: number
          maximum_nights: number | null
          minimum_nights: number | null
          owner_id: string
          price: number
          price_unit: Database["public"]["Enums"]["price_unit"]
          price_unit_label: string
          purpose: Database["public"]["Enums"]["property_purpose"]
          rating_avg: number
          region_location_id: string | null
          review_count: number
          service_fee: number | null
          size_sqm: number | null
          status: Database["public"]["Enums"]["property_status"]
          title: string
          type: Database["public"]["Enums"]["property_type"]
          updated_at: string
          view_count: number
        }
        Insert: {
          address?: string | null
          amenities?: Json
          bathrooms?: number | null
          bedrooms?: number | null
          city?: string | null
          city_location_id?: string | null
          cleaning_fee?: number | null
          country_location_id?: string | null
          created_at?: string
          description?: string | null
          district?: string | null
          district_location_id?: string | null
          id?: string
          is_approved?: boolean
          is_featured?: boolean
          is_pet_allowed?: boolean
          lat?: number | null
          lng?: number | null
          max_adults?: number
          max_children?: number
          max_infants?: number
          max_pets?: number
          max_total_guests?: number
          maximum_nights?: number | null
          minimum_nights?: number | null
          owner_id: string
          price: number
          price_unit: Database["public"]["Enums"]["price_unit"]
          price_unit_label?: string
          purpose: Database["public"]["Enums"]["property_purpose"]
          rating_avg?: number
          region_location_id?: string | null
          review_count?: number
          service_fee?: number | null
          size_sqm?: number | null
          status?: Database["public"]["Enums"]["property_status"]
          title: string
          type: Database["public"]["Enums"]["property_type"]
          updated_at?: string
          view_count?: number
        }
        Update: {
          address?: string | null
          amenities?: Json
          bathrooms?: number | null
          bedrooms?: number | null
          city?: string | null
          city_location_id?: string | null
          cleaning_fee?: number | null
          country_location_id?: string | null
          created_at?: string
          description?: string | null
          district?: string | null
          district_location_id?: string | null
          id?: string
          is_approved?: boolean
          is_featured?: boolean
          is_pet_allowed?: boolean
          lat?: number | null
          lng?: number | null
          max_adults?: number
          max_children?: number
          max_infants?: number
          max_pets?: number
          max_total_guests?: number
          maximum_nights?: number | null
          minimum_nights?: number | null
          owner_id?: string
          price?: number
          price_unit?: Database["public"]["Enums"]["price_unit"]
          price_unit_label?: string
          purpose?: Database["public"]["Enums"]["property_purpose"]
          rating_avg?: number
          region_location_id?: string | null
          review_count?: number
          service_fee?: number | null
          size_sqm?: number | null
          status?: Database["public"]["Enums"]["property_status"]
          title?: string
          type?: Database["public"]["Enums"]["property_type"]
          updated_at?: string
          view_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "properties_city_location_id_fkey"
            columns: ["city_location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "properties_country_location_id_fkey"
            columns: ["country_location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "properties_district_location_id_fkey"
            columns: ["district_location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "properties_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "pending_payment_review"
            referencedColumns: ["payee_id"]
          },
          {
            foreignKeyName: "properties_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "properties_region_location_id_fkey"
            columns: ["region_location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      property_daily_availability: {
        Row: {
          available_date: string
          created_at: string
          id: string
          minimum_nights: number | null
          nightly_price: number | null
          property_id: string
          state: Database["public"]["Enums"]["daily_availability_state"]
          updated_at: string
        }
        Insert: {
          available_date: string
          created_at?: string
          id?: string
          minimum_nights?: number | null
          nightly_price?: number | null
          property_id: string
          state?: Database["public"]["Enums"]["daily_availability_state"]
          updated_at?: string
        }
        Update: {
          available_date?: string
          created_at?: string
          id?: string
          minimum_nights?: number | null
          nightly_price?: number | null
          property_id?: string
          state?: Database["public"]["Enums"]["daily_availability_state"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_daily_availability_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_daily_availability_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "property_availability_summary"
            referencedColumns: ["property_id"]
          },
        ]
      }
      property_images: {
        Row: {
          created_at: string
          id: string
          is_primary: boolean
          property_id: string
          sort_order: number
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_primary?: boolean
          property_id: string
          sort_order?: number
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          is_primary?: boolean
          property_id?: string
          sort_order?: number
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_images_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_images_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "property_availability_summary"
            referencedColumns: ["property_id"]
          },
        ]
      }
      property_monthly_availability: {
        Row: {
          available_nights_count: number
          created_at: string
          id: string
          is_month_available: boolean
          month: number
          property_id: string
          updated_at: string
          year: number
        }
        Insert: {
          available_nights_count?: number
          created_at?: string
          id?: string
          is_month_available?: boolean
          month: number
          property_id: string
          updated_at?: string
          year: number
        }
        Update: {
          available_nights_count?: number
          created_at?: string
          id?: string
          is_month_available?: boolean
          month?: number
          property_id?: string
          updated_at?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "property_monthly_availability_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_monthly_availability_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "property_availability_summary"
            referencedColumns: ["property_id"]
          },
        ]
      }
      property_reviews: {
        Row: {
          booking_id: string | null
          comment: string | null
          created_at: string
          id: string
          is_visible: boolean
          property_id: string
          rating: number
          reviewer_id: string
          updated_at: string
        }
        Insert: {
          booking_id?: string | null
          comment?: string | null
          created_at?: string
          id?: string
          is_visible?: boolean
          property_id: string
          rating: number
          reviewer_id: string
          updated_at?: string
        }
        Update: {
          booking_id?: string | null
          comment?: string | null
          created_at?: string
          id?: string
          is_visible?: boolean
          property_id?: string
          rating?: number
          reviewer_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_reviews_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_reviews_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_reviews_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "property_availability_summary"
            referencedColumns: ["property_id"]
          },
        ]
      }
      search_logs: {
        Row: {
          adults: number
          check_in: string | null
          check_out: string | null
          children: number
          created_at: string
          flexible_months: string[] | null
          flexible_type: string | null
          id: string
          infants: number
          location_id: string | null
          pets: number
          result_count: number | null
          search_mode: Database["public"]["Enums"]["search_mode"]
          search_text: string | null
          session_id: string | null
          stay_month: number | null
          stay_year: number | null
          user_id: string | null
        }
        Insert: {
          adults?: number
          check_in?: string | null
          check_out?: string | null
          children?: number
          created_at?: string
          flexible_months?: string[] | null
          flexible_type?: string | null
          id?: string
          infants?: number
          location_id?: string | null
          pets?: number
          result_count?: number | null
          search_mode: Database["public"]["Enums"]["search_mode"]
          search_text?: string | null
          session_id?: string | null
          stay_month?: number | null
          stay_year?: number | null
          user_id?: string | null
        }
        Update: {
          adults?: number
          check_in?: string | null
          check_out?: string | null
          children?: number
          created_at?: string
          flexible_months?: string[] | null
          flexible_type?: string | null
          id?: string
          infants?: number
          location_id?: string | null
          pets?: number
          result_count?: number | null
          search_mode?: Database["public"]["Enums"]["search_mode"]
          search_text?: string | null
          session_id?: string | null
          stay_month?: number | null
          stay_year?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "search_logs_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          created_at: string
          email: string | null
          full_name: string
          id: string
          id_number: string | null
          notes: string | null
          owner_id: string
          phone: string | null
          profile_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name: string
          id?: string
          id_number?: string | null
          notes?: string | null
          owner_id: string
          phone?: string | null
          profile_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          id_number?: string | null
          notes?: string | null
          owner_id?: string
          phone?: string | null
          profile_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenants_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "pending_payment_review"
            referencedColumns: ["payee_id"]
          },
          {
            foreignKeyName: "tenants_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenants_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "pending_payment_review"
            referencedColumns: ["payee_id"]
          },
          {
            foreignKeyName: "tenants_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      units: {
        Row: {
          building_id: string
          created_at: string
          description: string | null
          floor: number | null
          id: string
          rent_amount: number
          size_sqm: number | null
          status: Database["public"]["Enums"]["unit_status"]
          type: Database["public"]["Enums"]["unit_type"]
          unit_number: string
          updated_at: string
        }
        Insert: {
          building_id: string
          created_at?: string
          description?: string | null
          floor?: number | null
          id?: string
          rent_amount: number
          size_sqm?: number | null
          status?: Database["public"]["Enums"]["unit_status"]
          type: Database["public"]["Enums"]["unit_type"]
          unit_number: string
          updated_at?: string
        }
        Update: {
          building_id?: string
          created_at?: string
          description?: string | null
          floor?: number | null
          id?: string
          rent_amount?: number
          size_sqm?: number | null
          status?: Database["public"]["Enums"]["unit_status"]
          type?: Database["public"]["Enums"]["unit_type"]
          unit_number?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "units_building_id_fkey"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "active_contracts_view"
            referencedColumns: ["building_id"]
          },
          {
            foreignKeyName: "units_building_id_fkey"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "building_stats"
            referencedColumns: ["building_id"]
          },
          {
            foreignKeyName: "units_building_id_fkey"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "buildings"
            referencedColumns: ["id"]
          },
        ]
      }
      wishlists: {
        Row: {
          created_at: string
          id: string
          property_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          property_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          property_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlists_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wishlists_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "property_availability_summary"
            referencedColumns: ["property_id"]
          },
        ]
      }
    }
    Views: {
      active_availability_blocks: {
        Row: {
          advance_booking_days: number | null
          block_type:
            | Database["public"]["Enums"]["availability_block_type"]
            | null
          created_at: string | null
          created_by: string | null
          deleted_at: string | null
          deleted_by: string | null
          end_date: string | null
          id: string | null
          maximum_stay: number | null
          metadata: Json | null
          minimum_stay: number | null
          notes: string | null
          property_id: string | null
          property_status: Database["public"]["Enums"]["property_status"] | null
          property_title: string | null
          property_type: Database["public"]["Enums"]["property_type"] | null
          reason: string | null
          start_date: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Relationships: [
          {
            foreignKeyName: "availability_blocks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "pending_payment_review"
            referencedColumns: ["payee_id"]
          },
          {
            foreignKeyName: "availability_blocks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "availability_blocks_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "pending_payment_review"
            referencedColumns: ["payee_id"]
          },
          {
            foreignKeyName: "availability_blocks_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "availability_blocks_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "availability_blocks_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "property_availability_summary"
            referencedColumns: ["property_id"]
          },
          {
            foreignKeyName: "availability_blocks_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "pending_payment_review"
            referencedColumns: ["payee_id"]
          },
          {
            foreignKeyName: "availability_blocks_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      active_contracts_view: {
        Row: {
          building_id: string | null
          building_name: string | null
          contract_id: string | null
          deposit_amount: number | null
          end_date: string | null
          floor: number | null
          monthly_rent: number | null
          owner_id: string | null
          start_date: string | null
          status: Database["public"]["Enums"]["contract_status"] | null
          tenant_id: string | null
          tenant_name: string | null
          tenant_phone: string | null
          unit_id: string | null
          unit_number: string | null
          unit_type: Database["public"]["Enums"]["unit_type"] | null
        }
        Relationships: [
          {
            foreignKeyName: "buildings_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "pending_payment_review"
            referencedColumns: ["payee_id"]
          },
          {
            foreignKeyName: "buildings_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      building_stats: {
        Row: {
          building_id: string | null
          maintenance_units: number | null
          monthly_revenue: number | null
          name: string | null
          occupied_units: number | null
          owner_id: string | null
          total_units: number | null
          vacant_units: number | null
        }
        Relationships: [
          {
            foreignKeyName: "buildings_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "pending_payment_review"
            referencedColumns: ["payee_id"]
          },
          {
            foreignKeyName: "buildings_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_list_view: {
        Row: {
          created_at: string | null
          id: string | null
          last_message: string | null
          last_message_at: string | null
          participant_count: number | null
          related_booking_id: string | null
          related_contract_id: string | null
          related_payment_id: string | null
          related_property_id: string | null
          related_tenant_id: string | null
          related_unit_id: string | null
          status: Database["public"]["Enums"]["conversation_status"] | null
          subject: string | null
          type: Database["public"]["Enums"]["conversation_type"] | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string | null
          last_message?: never
          last_message_at?: never
          participant_count?: never
          related_booking_id?: string | null
          related_contract_id?: string | null
          related_payment_id?: string | null
          related_property_id?: string | null
          related_tenant_id?: string | null
          related_unit_id?: string | null
          status?: Database["public"]["Enums"]["conversation_status"] | null
          subject?: string | null
          type?: Database["public"]["Enums"]["conversation_type"] | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string | null
          last_message?: never
          last_message_at?: never
          participant_count?: never
          related_booking_id?: string | null
          related_contract_id?: string | null
          related_payment_id?: string | null
          related_property_id?: string | null
          related_tenant_id?: string | null
          related_unit_id?: string | null
          status?: Database["public"]["Enums"]["conversation_status"] | null
          subject?: string | null
          type?: Database["public"]["Enums"]["conversation_type"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversations_related_booking_id_fkey"
            columns: ["related_booking_id"]
            isOneToOne: true
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_related_contract_id_fkey"
            columns: ["related_contract_id"]
            isOneToOne: false
            referencedRelation: "active_contracts_view"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "conversations_related_contract_id_fkey"
            columns: ["related_contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_related_payment_id_fkey"
            columns: ["related_payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_related_payment_id_fkey"
            columns: ["related_payment_id"]
            isOneToOne: false
            referencedRelation: "pending_payment_review"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_related_property_id_fkey"
            columns: ["related_property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_related_property_id_fkey"
            columns: ["related_property_id"]
            isOneToOne: false
            referencedRelation: "property_availability_summary"
            referencedColumns: ["property_id"]
          },
          {
            foreignKeyName: "conversations_related_tenant_id_fkey"
            columns: ["related_tenant_id"]
            isOneToOne: false
            referencedRelation: "active_contracts_view"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "conversations_related_tenant_id_fkey"
            columns: ["related_tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_related_unit_id_fkey"
            columns: ["related_unit_id"]
            isOneToOne: false
            referencedRelation: "active_contracts_view"
            referencedColumns: ["unit_id"]
          },
          {
            foreignKeyName: "conversations_related_unit_id_fkey"
            columns: ["related_unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_metrics_view: {
        Row: {
          created_at: string | null
          currency: string | null
          customer_type: Database["public"]["Enums"]["customer_type"] | null
          id: string | null
          lifecycle_status:
            | Database["public"]["Enums"]["lifecycle_status"]
            | null
          profile_id: string | null
          total_bookings: number | null
          total_rent_paid: number | null
          updated_at: string | null
          user_name: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customers_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "pending_payment_review"
            referencedColumns: ["payee_id"]
          },
          {
            foreignKeyName: "customers_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pending_payment_review: {
        Row: {
          amount: number | null
          created_at: string | null
          due_date: string | null
          id: string | null
          method: Database["public"]["Enums"]["payment_method"] | null
          payee_id: string | null
          payer_name: string | null
          payer_phone: string | null
          proof_url: string | null
          reference_id: string | null
          reference_type:
            | Database["public"]["Enums"]["payment_reference_type"]
            | null
        }
        Relationships: []
      }
      property_availability_summary: {
        Row: {
          furthest_block_end: string | null
          maintenance_blocks: number | null
          manual_blocks: number | null
          next_block_start: string | null
          owner_use_blocks: number | null
          property_id: string | null
          seasonal_blocks: number | null
          status: Database["public"]["Enums"]["property_status"] | null
          system_blocks: number | null
          title: string | null
          total_blocks: number | null
        }
        Relationships: []
      }
      user_conversations_view: {
        Row: {
          created_at: string | null
          id: string | null
          last_message: string | null
          last_message_at: string | null
          last_read_at: string | null
          participant_count: number | null
          related_booking_id: string | null
          related_contract_id: string | null
          related_payment_id: string | null
          related_property_id: string | null
          related_tenant_id: string | null
          related_unit_id: string | null
          status: Database["public"]["Enums"]["conversation_status"] | null
          subject: string | null
          type: Database["public"]["Enums"]["conversation_type"] | null
          unread_count: number | null
          updated_at: string | null
          user_id: string | null
          user_is_admin: boolean | null
          user_role: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversation_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "pending_payment_review"
            referencedColumns: ["payee_id"]
          },
          {
            foreignKeyName: "conversation_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_related_booking_id_fkey"
            columns: ["related_booking_id"]
            isOneToOne: true
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_related_contract_id_fkey"
            columns: ["related_contract_id"]
            isOneToOne: false
            referencedRelation: "active_contracts_view"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "conversations_related_contract_id_fkey"
            columns: ["related_contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_related_payment_id_fkey"
            columns: ["related_payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_related_payment_id_fkey"
            columns: ["related_payment_id"]
            isOneToOne: false
            referencedRelation: "pending_payment_review"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_related_property_id_fkey"
            columns: ["related_property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_related_property_id_fkey"
            columns: ["related_property_id"]
            isOneToOne: false
            referencedRelation: "property_availability_summary"
            referencedColumns: ["property_id"]
          },
          {
            foreignKeyName: "conversations_related_tenant_id_fkey"
            columns: ["related_tenant_id"]
            isOneToOne: false
            referencedRelation: "active_contracts_view"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "conversations_related_tenant_id_fkey"
            columns: ["related_tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_related_unit_id_fkey"
            columns: ["related_unit_id"]
            isOneToOne: false
            referencedRelation: "active_contracts_view"
            referencedColumns: ["unit_id"]
          },
          {
            foreignKeyName: "conversations_related_unit_id_fkey"
            columns: ["related_unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      add_conversation_participant: {
        Args: {
          p_conversation_id: string
          p_is_admin?: boolean
          p_role?: string
          p_user_id: string
        }
        Returns: string
      }
      create_conversation: {
        Args: {
          p_created_by: string
          p_metadata?: Json
          p_related_booking_id?: string
          p_related_contract_id?: string
          p_related_payment_id?: string
          p_related_property_id?: string
          p_related_tenant_id?: string
          p_related_unit_id?: string
          p_subject: string
          p_type: Database["public"]["Enums"]["conversation_type"]
        }
        Returns: string
      }
      create_conversation_from_event: {
        Args: {
          p_created_by: string
          p_metadata?: Json
          p_priority?: Database["public"]["Enums"]["conversation_priority"]
          p_related_booking_id?: string
          p_related_payment_id?: string
          p_related_property_id?: string
          p_subject: string
          p_type: Database["public"]["Enums"]["conversation_type"]
        }
        Returns: string
      }
      get_advance_booking_days: {
        Args: { p_property_id: string }
        Returns: number
      }
      get_locations_for_dropdown: {
        Args: never
        Returns: {
          id: string
          name: string
          parent_name: string
          slug: string
          type: string
        }[]
      }
      get_maximum_stay: {
        Args: {
          p_end_date: string
          p_property_id: string
          p_start_date: string
        }
        Returns: number
      }
      get_minimum_stay: {
        Args: {
          p_end_date: string
          p_property_id: string
          p_start_date: string
        }
        Returns: number
      }
      get_unread_count: {
        Args: { p_conversation_id: string; p_user_id: string }
        Returns: number
      }
      is_property_available: {
        Args: {
          p_end_date: string
          p_property_id: string
          p_start_date: string
        }
        Returns: boolean
      }
      mark_conversation_read: {
        Args: { p_conversation_id: string; p_user_id: string }
        Returns: boolean
      }
      refresh_monthly_availability: {
        Args: { p_id: string; p_month: number; p_year: number }
        Returns: undefined
      }
      search_properties_by_month: {
        Args: {
          p_adults?: number
          p_children?: number
          p_infants?: number
          p_limit?: number
          p_location_id?: string
          p_month?: number
          p_offset?: number
          p_pets?: number
          p_purpose?: string
          p_year?: number
        }
        Returns: {
          available_nights_count: number
          bathrooms: number
          bedrooms: number
          city: string
          id: string
          is_pet_allowed: boolean
          lat: number
          lng: number
          price: number
          price_unit: string
          purpose: string
          title: string
        }[]
      }
      search_properties_exact_dates: {
        Args: {
          p_adults?: number
          p_check_in?: string
          p_check_out?: string
          p_children?: number
          p_infants?: number
          p_limit?: number
          p_location_id?: string
          p_offset?: number
          p_pets?: number
          p_purpose?: string
        }
        Returns: {
          available_nights: number
          bathrooms: number
          bedrooms: number
          city: string
          cleaning_fee: number
          district: string
          id: string
          is_pet_allowed: boolean
          lat: number
          lng: number
          max_adults: number
          max_children: number
          max_infants: number
          max_pets: number
          minimum_nights: number
          price: number
          price_unit: string
          purpose: string
          size_sqm: number
          title: string
        }[]
      }
      search_properties_flexible: {
        Args: {
          p_adults?: number
          p_candidate_months?: string[]
          p_children?: number
          p_flexible_type?: string
          p_infants?: number
          p_limit?: number
          p_location_id?: string
          p_offset?: number
          p_pets?: number
          p_purpose?: string
        }
        Returns: {
          bathrooms: number
          bedrooms: number
          city: string
          id: string
          is_pet_allowed: boolean
          lat: number
          lng: number
          price: number
          price_unit: string
          purpose: string
          title: string
          total_available_nights: number
        }[]
      }
      send_message: {
        Args: {
          p_content: string
          p_conversation_id: string
          p_is_internal?: boolean
          p_is_system?: boolean
          p_metadata?: Json
          p_sender_id: string
          p_type?: Database["public"]["Enums"]["message_content_type"]
        }
        Returns: string
      }
    }
    Enums: {
      availability_block_type:
        | "manual"
        | "maintenance"
        | "seasonal"
        | "owner_use"
        | "system"
      booking_status:
        | "pending"
        | "confirmed"
        | "ongoing"
        | "completed"
        | "cancelled"
      booking_type: "instant" | "request"
      contract_status: "active" | "expired" | "terminated"
      conversation_priority: "low" | "normal" | "high" | "urgent"
      conversation_status: "active" | "archived" | "closed"
      conversation_type:
        | "direct"
        | "booking"
        | "property"
        | "payment"
        | "support"
        | "system"
        | "rms_contract"
        | "rms_tenant"
        | "rms_unit"
      customer_type: "tenant" | "renter" | "buyer" | "guest"
      daily_availability_state: "available" | "blocked" | "booked"
      lifecycle_status: "lead" | "active" | "inactive" | "suspended"
      location_type: "country" | "region" | "city" | "district"
      message_content_type:
        | "text"
        | "image"
        | "document"
        | "property_reference"
        | "booking_reference"
        | "payment_reference"
        | "system"
      payment_method: "platform" | "zaad" | "edahab" | "cash"
      payment_method_type: "zaad" | "edahab" | "bank"
      payment_reference_type: "booking" | "rent"
      payment_status:
        | "pending"
        | "submitted"
        | "under_review"
        | "verified"
        | "completed"
        | "refunded"
        | "failed"
      price_unit: "total" | "per_night" | "per_month"
      property_purpose: "sale" | "long_rent" | "short_stay"
      property_status: "draft" | "pending_approval" | "active" | "archived"
      property_type:
        | "apartment"
        | "villa"
        | "room"
        | "shop"
        | "office"
        | "house"
      search_mode: "exact_dates" | "month" | "flexible"
      unit_status: "vacant" | "occupied" | "maintenance"
      unit_type: "room" | "apartment" | "shop" | "office"
      user_role: "guest" | "owner" | "building_manager" | "admin"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      availability_block_type: [
        "manual",
        "maintenance",
        "seasonal",
        "owner_use",
        "system",
      ],
      booking_status: [
        "pending",
        "confirmed",
        "ongoing",
        "completed",
        "cancelled",
      ],
      booking_type: ["instant", "request"],
      contract_status: ["active", "expired", "terminated"],
      conversation_priority: ["low", "normal", "high", "urgent"],
      conversation_status: ["active", "archived", "closed"],
      conversation_type: [
        "direct",
        "booking",
        "property",
        "payment",
        "support",
        "system",
        "rms_contract",
        "rms_tenant",
        "rms_unit",
      ],
      customer_type: ["tenant", "renter", "buyer", "guest"],
      daily_availability_state: ["available", "blocked", "booked"],
      lifecycle_status: ["lead", "active", "inactive", "suspended"],
      location_type: ["country", "region", "city", "district"],
      message_content_type: [
        "text",
        "image",
        "document",
        "property_reference",
        "booking_reference",
        "payment_reference",
        "system",
      ],
      payment_method: ["platform", "zaad", "edahab", "cash"],
      payment_method_type: ["zaad", "edahab", "bank"],
      payment_reference_type: ["booking", "rent"],
      payment_status: [
        "pending",
        "submitted",
        "under_review",
        "verified",
        "completed",
        "refunded",
        "failed",
      ],
      price_unit: ["total", "per_night", "per_month"],
      property_purpose: ["sale", "long_rent", "short_stay"],
      property_status: ["draft", "pending_approval", "active", "archived"],
      property_type: ["apartment", "villa", "room", "shop", "office", "house"],
      search_mode: ["exact_dates", "month", "flexible"],
      unit_status: ["vacant", "occupied", "maintenance"],
      unit_type: ["room", "apartment", "shop", "office"],
      user_role: ["guest", "owner", "building_manager", "admin"],
    },
  },
} as const
