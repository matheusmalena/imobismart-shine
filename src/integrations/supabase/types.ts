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
  public: {
    Tables: {
      ai_chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          role: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      documents: {
        Row: {
          category: Database["public"]["Enums"]["document_category"]
          created_at: string
          file_size: number | null
          file_type: string | null
          file_url: string
          id: string
          name: string
          organization_id: string | null
          property_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: Database["public"]["Enums"]["document_category"]
          created_at?: string
          file_size?: number | null
          file_type?: string | null
          file_url: string
          id?: string
          name: string
          organization_id?: string | null
          property_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: Database["public"]["Enums"]["document_category"]
          created_at?: string
          file_size?: number | null
          file_type?: string | null
          file_url?: string
          id?: string
          name?: string
          organization_id?: string | null
          property_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      lease_contracts: {
        Row: {
          contract_file_url: string | null
          created_at: string
          deposit_amount: number | null
          end_date: string
          id: string
          monthly_rent: number
          notes: string | null
          organization_id: string | null
          payment_due_day: number | null
          property_id: string
          start_date: string
          status: string
          tenant_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          contract_file_url?: string | null
          created_at?: string
          deposit_amount?: number | null
          end_date: string
          id?: string
          monthly_rent?: number
          notes?: string | null
          organization_id?: string | null
          payment_due_day?: number | null
          property_id: string
          start_date: string
          status?: string
          tenant_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          contract_file_url?: string | null
          created_at?: string
          deposit_amount?: number | null
          end_date?: string
          id?: string
          monthly_rent?: number
          notes?: string | null
          organization_id?: string | null
          payment_due_day?: number | null
          property_id?: string
          start_date?: string
          status?: string
          tenant_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lease_contracts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lease_contracts_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lease_contracts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_invitations: {
        Row: {
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string
          organization_id: string
          role: Database["public"]["Enums"]["org_member_role"]
          token: string
        }
        Insert: {
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          invited_by: string
          organization_id: string
          role?: Database["public"]["Enums"]["org_member_role"]
          token?: string
        }
        Update: {
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string
          organization_id?: string
          role?: Database["public"]["Enums"]["org_member_role"]
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_invitations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_members: {
        Row: {
          accepted_at: string | null
          created_at: string
          id: string
          invited_at: string
          invited_by: string | null
          organization_id: string
          role: Database["public"]["Enums"]["org_member_role"]
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          id?: string
          invited_at?: string
          invited_by?: string | null
          organization_id: string
          role?: Database["public"]["Enums"]["org_member_role"]
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          id?: string
          invited_at?: string
          invited_by?: string | null
          organization_id?: string
          role?: Database["public"]["Enums"]["org_member_role"]
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          id: string
          max_members: number
          name: string
          owner_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          max_members?: number
          name: string
          owner_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          max_members?: number
          name?: string
          owner_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      plan_audit_logs: {
        Row: {
          action: string
          changed_by: string
          changes: Json
          created_at: string
          id: string
          plan_id: string
          previous_values: Json | null
        }
        Insert: {
          action: string
          changed_by: string
          changes?: Json
          created_at?: string
          id?: string
          plan_id: string
          previous_values?: Json | null
        }
        Update: {
          action?: string
          changed_by?: string
          changes?: Json
          created_at?: string
          id?: string
          plan_id?: string
          previous_values?: Json | null
        }
        Relationships: []
      }
      plans: {
        Row: {
          created_at: string
          description: string | null
          features: Json
          id: string
          is_active: boolean
          is_highlighted: boolean
          name: string
          price: number
          price_label: string
          property_limit: number
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          features?: Json
          id: string
          is_active?: boolean
          is_highlighted?: boolean
          name: string
          price?: number
          price_label?: string
          property_limit?: number
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          features?: Json
          id?: string
          is_active?: boolean
          is_highlighted?: boolean
          name?: string
          price?: number
          price_label?: string
          property_limit?: number
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          mobile_number: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          mobile_number?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          mobile_number?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      properties: {
        Row: {
          acquisition_date: string | null
          address_city: string | null
          address_complement: string | null
          address_neighborhood: string | null
          address_number: string | null
          address_state: string | null
          address_street: string | null
          address_zip: string | null
          area_sqm: number | null
          bathrooms: number | null
          bedrooms: number | null
          condominium_fee: number | null
          created_at: string
          description: string | null
          floor_number: number | null
          has_balcony: boolean | null
          has_barbecue: boolean | null
          has_elevator: boolean | null
          has_gym: boolean | null
          has_pool: boolean | null
          id: string
          iptu_fee: number | null
          is_archived: boolean | null
          is_furnished: boolean | null
          maintenance_fee: number | null
          monthly_revenue: number | null
          name: string
          occupancy_rate: number | null
          organization_id: string | null
          other_costs: number | null
          parking_spots: number | null
          performance:
            | Database["public"]["Enums"]["property_performance"]
            | null
          photo_url: string | null
          property_type: Database["public"]["Enums"]["property_type"]
          property_value: number | null
          status: Database["public"]["Enums"]["property_status"]
          suites: number | null
          updated_at: string
          user_id: string
          year_built: number | null
        }
        Insert: {
          acquisition_date?: string | null
          address_city?: string | null
          address_complement?: string | null
          address_neighborhood?: string | null
          address_number?: string | null
          address_state?: string | null
          address_street?: string | null
          address_zip?: string | null
          area_sqm?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          condominium_fee?: number | null
          created_at?: string
          description?: string | null
          floor_number?: number | null
          has_balcony?: boolean | null
          has_barbecue?: boolean | null
          has_elevator?: boolean | null
          has_gym?: boolean | null
          has_pool?: boolean | null
          id?: string
          iptu_fee?: number | null
          is_archived?: boolean | null
          is_furnished?: boolean | null
          maintenance_fee?: number | null
          monthly_revenue?: number | null
          name: string
          occupancy_rate?: number | null
          organization_id?: string | null
          other_costs?: number | null
          parking_spots?: number | null
          performance?:
            | Database["public"]["Enums"]["property_performance"]
            | null
          photo_url?: string | null
          property_type?: Database["public"]["Enums"]["property_type"]
          property_value?: number | null
          status?: Database["public"]["Enums"]["property_status"]
          suites?: number | null
          updated_at?: string
          user_id: string
          year_built?: number | null
        }
        Update: {
          acquisition_date?: string | null
          address_city?: string | null
          address_complement?: string | null
          address_neighborhood?: string | null
          address_number?: string | null
          address_state?: string | null
          address_street?: string | null
          address_zip?: string | null
          area_sqm?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          condominium_fee?: number | null
          created_at?: string
          description?: string | null
          floor_number?: number | null
          has_balcony?: boolean | null
          has_barbecue?: boolean | null
          has_elevator?: boolean | null
          has_gym?: boolean | null
          has_pool?: boolean | null
          id?: string
          iptu_fee?: number | null
          is_archived?: boolean | null
          is_furnished?: boolean | null
          maintenance_fee?: number | null
          monthly_revenue?: number | null
          name?: string
          occupancy_rate?: number | null
          organization_id?: string | null
          other_costs?: number | null
          parking_spots?: number | null
          performance?:
            | Database["public"]["Enums"]["property_performance"]
            | null
          photo_url?: string | null
          property_type?: Database["public"]["Enums"]["property_type"]
          property_value?: number | null
          status?: Database["public"]["Enums"]["property_status"]
          suites?: number | null
          updated_at?: string
          user_id?: string
          year_built?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "properties_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      property_gallery: {
        Row: {
          caption: string | null
          created_at: string
          display_order: number | null
          id: string
          image_url: string
          property_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          caption?: string | null
          created_at?: string
          display_order?: number | null
          id?: string
          image_url: string
          property_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          caption?: string | null
          created_at?: string
          display_order?: number | null
          id?: string
          image_url?: string
          property_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_gallery_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      rate_limits: {
        Row: {
          action: string
          created_at: string | null
          id: string
          ip_address: string | null
          request_count: number | null
          user_id: string | null
          window_start: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          request_count?: number | null
          user_id?: string | null
          window_start?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          request_count?: number | null
          user_id?: string | null
          window_start?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          mp_payer_email: string | null
          mp_subscription_id: string | null
          payment_method: string | null
          plan: Database["public"]["Enums"]["subscription_plan"]
          started_at: string
          status: Database["public"]["Enums"]["subscription_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          mp_payer_email?: string | null
          mp_subscription_id?: string | null
          payment_method?: string | null
          plan?: Database["public"]["Enums"]["subscription_plan"]
          started_at?: string
          status?: Database["public"]["Enums"]["subscription_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          mp_payer_email?: string | null
          mp_subscription_id?: string | null
          payment_method?: string | null
          plan?: Database["public"]["Enums"]["subscription_plan"]
          started_at?: string
          status?: Database["public"]["Enums"]["subscription_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      tenants: {
        Row: {
          address: string | null
          cpf: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          notes: string | null
          organization_id: string | null
          phone: string | null
          rg: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          cpf?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          organization_id?: string | null
          phone?: string | null
          rg?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          cpf?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          organization_id?: string | null
          phone?: string | null
          rg?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenants_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      whatsapp_messages: {
        Row: {
          contract_id: string | null
          created_at: string
          error_message: string | null
          id: string
          message_content: string
          message_type: string
          organization_id: string | null
          phone_number: string
          property_id: string
          sent_at: string | null
          status: string
          tenant_id: string
          user_id: string
        }
        Insert: {
          contract_id?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          message_content: string
          message_type?: string
          organization_id?: string | null
          phone_number: string
          property_id: string
          sent_at?: string | null
          status?: string
          tenant_id: string
          user_id: string
        }
        Update: {
          contract_id?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          message_content?: string
          message_type?: string
          organization_id?: string | null
          phone_number?: string
          property_id?: string
          sent_at?: string | null
          status?: string
          tenant_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_messages_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "lease_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_messages_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_messages_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_messages_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_scheduled: {
        Row: {
          contract_id: string
          created_at: string
          days_before_due: number
          id: string
          message_id: string | null
          organization_id: string | null
          scheduled_date: string
          status: string
          user_id: string
        }
        Insert: {
          contract_id: string
          created_at?: string
          days_before_due: number
          id?: string
          message_id?: string | null
          organization_id?: string | null
          scheduled_date: string
          status?: string
          user_id: string
        }
        Update: {
          contract_id?: string
          created_at?: string
          days_before_due?: number
          id?: string
          message_id?: string | null
          organization_id?: string | null
          scheduled_date?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_scheduled_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "lease_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_scheduled_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_scheduled_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_settings: {
        Row: {
          created_at: string
          days_before_due: number[] | null
          evolution_api_key: string | null
          evolution_api_url: string | null
          evolution_instance_name: string | null
          id: string
          is_enabled: boolean
          message_template: string | null
          organization_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          days_before_due?: number[] | null
          evolution_api_key?: string | null
          evolution_api_url?: string | null
          evolution_instance_name?: string | null
          id?: string
          is_enabled?: boolean
          message_template?: string | null
          organization_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          days_before_due?: number[] | null
          evolution_api_key?: string | null
          evolution_api_url?: string | null
          evolution_instance_name?: string | null
          id?: string
          is_enabled?: boolean
          message_template?: string | null
          organization_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_settings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_manage_org: {
        Args: { _org_id: string; _user_id: string }
        Returns: boolean
      }
      check_rate_limit: {
        Args: {
          _action: string
          _max_requests?: number
          _user_id: string
          _window_minutes?: number
        }
        Returns: boolean
      }
      cleanup_expired_invitations: { Args: never; Returns: undefined }
      cleanup_rate_limits: { Args: never; Returns: undefined }
      get_org_role: {
        Args: { _org_id: string; _user_id: string }
        Returns: Database["public"]["Enums"]["org_member_role"]
      }
      get_user_org_id: { Args: { _user_id: string }; Returns: string }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_org_member: {
        Args: { _org_id: string; _user_id: string }
        Returns: boolean
      }
      validate_invitation_token: {
        Args: { _token: string }
        Returns: {
          email: string
          expires_at: string
          id: string
          organization_id: string
          organization_name: string
          role: Database["public"]["Enums"]["org_member_role"]
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "user"
      document_category: "matricula" | "iptu" | "contrato" | "laudo" | "outro"
      org_member_role: "owner" | "admin" | "financial" | "operator"
      property_performance: "alta" | "media" | "baixa"
      property_status: "alugado" | "vago" | "em_reforma" | "a_venda"
      property_type:
        | "apartamento"
        | "casa"
        | "comercial"
        | "terreno"
        | "galpao"
        | "sala"
        | "loja"
        | "outro"
      subscription_plan: "starter" | "pro" | "enterprise" | "plus"
      subscription_status: "active" | "inactive" | "cancelled" | "trial"
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
      app_role: ["admin", "user"],
      document_category: ["matricula", "iptu", "contrato", "laudo", "outro"],
      org_member_role: ["owner", "admin", "financial", "operator"],
      property_performance: ["alta", "media", "baixa"],
      property_status: ["alugado", "vago", "em_reforma", "a_venda"],
      property_type: [
        "apartamento",
        "casa",
        "comercial",
        "terreno",
        "galpao",
        "sala",
        "loja",
        "outro",
      ],
      subscription_plan: ["starter", "pro", "enterprise", "plus"],
      subscription_status: ["active", "inactive", "cancelled", "trial"],
    },
  },
} as const
