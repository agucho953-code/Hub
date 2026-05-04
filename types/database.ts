// Tipos placeholder. Regenerar con `npm run db:types` cuando supabase local
// esté corriendo y la migración aplicada.
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type TenantRole = 'owner' | 'cashier' | 'waiter'

export type Database = {
  public: {
    Tables: {
      tenants: {
        Row: {
          id: string
          name: string
          slug: string
          timezone: string
          currency: string
          logo_url: string | null
          settings: Json
          created_at: string
          updated_at: string
        }
        Insert: Partial<Database['public']['Tables']['tenants']['Row']> & {
          name: string
          slug: string
        }
        Update: Partial<Database['public']['Tables']['tenants']['Row']>
      }
      memberships: {
        Row: {
          id: string
          tenant_id: string
          user_id: string
          role: TenantRole
          created_at: string
        }
        Insert: Omit<
          Database['public']['Tables']['memberships']['Row'],
          'id' | 'created_at'
        > & { id?: string; created_at?: string }
        Update: Partial<Database['public']['Tables']['memberships']['Row']>
      }
      invitations: {
        Row: {
          id: string
          tenant_id: string
          email: string
          role: TenantRole
          token: string
          invited_by: string
          expires_at: string
          accepted_at: string | null
          created_at: string
        }
        Insert: Pick<
          Database['public']['Tables']['invitations']['Row'],
          'tenant_id' | 'email' | 'role' | 'invited_by'
        > & {
          id?: string
          token?: string
          expires_at?: string
          accepted_at?: string | null
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['invitations']['Row']>
      }
      audit_log: {
        Row: {
          id: string
          tenant_id: string
          user_id: string | null
          action: string
          entity: string
          entity_id: string | null
          payload: Json
          created_at: string
        }
        Insert: Pick<
          Database['public']['Tables']['audit_log']['Row'],
          'tenant_id' | 'action' | 'entity'
        > & {
          id?: string
          user_id?: string | null
          entity_id?: string | null
          payload?: Json
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['audit_log']['Row']>
      }
      user_active_tenant: {
        Row: { user_id: string; tenant_id: string; updated_at: string }
        Insert: { user_id: string; tenant_id: string; updated_at?: string }
        Update: Partial<Database['public']['Tables']['user_active_tenant']['Row']>
      }
    }
    Views: Record<string, never>
    Functions: {
      create_tenant_with_owner: {
        Args: { p_name: string; p_slug: string }
        Returns: Database['public']['Tables']['tenants']['Row']
      }
      accept_invitation: {
        Args: { p_token: string }
        Returns: Database['public']['Tables']['memberships']['Row']
      }
      set_active_tenant: {
        Args: { p_tenant: string }
        Returns: void
      }
      check_slug_available: {
        Args: { p_slug: string }
        Returns: boolean
      }
      get_invitation_preview: {
        Args: { p_token: string }
        Returns: {
          email: string
          role: TenantRole
          tenant_name: string
          expired: boolean
        }[]
      }
      user_tenant_ids: {
        Args: Record<string, never>
        Returns: string[]
      }
      user_role_in_tenant: {
        Args: { p_tenant: string }
        Returns: TenantRole
      }
      active_tenant_id: {
        Args: Record<string, never>
        Returns: string | null
      }
    }
    Enums: { tenant_role: TenantRole }
    CompositeTypes: Record<string, never>
  }
}
