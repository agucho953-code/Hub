// Tipos placeholder. Regenerar con `npm run db:types` cuando supabase local
// esté corriendo y la migración aplicada.
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type TenantRole = 'owner' | 'cashier' | 'waiter' | 'kitchen'
export type CustomerSource = 'qr' | 'manual' | 'import'
export type VisitSource = 'cashier' | 'import'
export type PointsRuleType = 'per_amount' | 'per_item'
export type RedemptionStatus = 'pending' | 'delivered' | 'cancelled'
export type EventStatus = 'draft' | 'published' | 'finished' | 'cancelled'
export type ReservationStatus =
  | 'confirmed'
  | 'waitlist'
  | 'cancelled'
  | 'checked_in'
  | 'no_show'
export type ChannelType = 'whatsapp' | 'instagram'
export type ChannelStatus = 'connected' | 'disconnected' | 'error'
export type TemplateStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'disabled'
export type MessageDirection = 'inbound' | 'outbound'
export type MessageStatus = 'queued' | 'sent' | 'delivered' | 'read' | 'failed'
export type BroadcastStatus =
  | 'draft'
  | 'scheduled'
  | 'sending'
  | 'sent'
  | 'failed'
  | 'cancelled'
export type RecipientStatus =
  | 'pending'
  | 'sent'
  | 'delivered'
  | 'read'
  | 'replied'
  | 'failed'
export type FlowTriggerType =
  | 'customer_inactive'
  | 'birthday'
  | 'after_visit'
  | 'event_starting'
  | 'tag_added'
export type FlowStepType = 'send_template' | 'wait' | 'condition' | 'add_tag'
export type FlowExecutionStatus = 'running' | 'completed' | 'failed' | 'cancelled'
export type JobStatus = 'pending' | 'processing' | 'done' | 'failed'

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
      customers: {
        Row: {
          id: string
          tenant_id: string
          phone: string
          first_name: string
          last_name: string
          birthdate: string | null
          opt_in_marketing: boolean
          opt_in_at: string | null
          opt_in_ip: string | null
          source: CustomerSource
          notes: string | null
          last_visit_at: string | null
          total_visits: number
          total_spent_cents: number
          points_balance: number
          deleted_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: Pick<
          Database['public']['Tables']['customers']['Row'],
          'tenant_id' | 'phone' | 'first_name' | 'last_name'
        > & {
          id?: string
          birthdate?: string | null
          opt_in_marketing?: boolean
          opt_in_at?: string | null
          opt_in_ip?: string | null
          source?: CustomerSource
          notes?: string | null
          last_visit_at?: string | null
          total_visits?: number
          total_spent_cents?: number
          points_balance?: number
          deleted_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['customers']['Row']>
      }
      customer_tags: {
        Row: {
          id: string
          tenant_id: string
          name: string
          color: string
          created_at: string
        }
        Insert: Pick<
          Database['public']['Tables']['customer_tags']['Row'],
          'tenant_id' | 'name'
        > & {
          id?: string
          color?: string
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['customer_tags']['Row']>
      }
      customer_tag_assignments: {
        Row: {
          customer_id: string
          tag_id: string
          assigned_at: string
        }
        Insert: { customer_id: string; tag_id: string; assigned_at?: string }
        Update: Partial<Database['public']['Tables']['customer_tag_assignments']['Row']>
      }
      customer_capture_links: {
        Row: {
          id: string
          tenant_id: string
          slug: string
          label: string
          active: boolean
          created_at: string
        }
        Insert: Pick<
          Database['public']['Tables']['customer_capture_links']['Row'],
          'tenant_id' | 'slug' | 'label'
        > & {
          id?: string
          active?: boolean
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['customer_capture_links']['Row']>
      }
      menu_categories: {
        Row: {
          id: string
          tenant_id: string
          name: string
          position: number
          active: boolean
          created_at: string
        }
        Insert: Pick<
          Database['public']['Tables']['menu_categories']['Row'],
          'tenant_id' | 'name'
        > & {
          id?: string
          position?: number
          active?: boolean
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['menu_categories']['Row']>
      }
      menu_items: {
        Row: {
          id: string
          tenant_id: string
          category_id: string
          name: string
          description: string | null
          price_cents: number
          points_override: number | null
          position: number
          active: boolean
          image_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: Pick<
          Database['public']['Tables']['menu_items']['Row'],
          'tenant_id' | 'category_id' | 'name' | 'price_cents'
        > & {
          id?: string
          description?: string | null
          points_override?: number | null
          position?: number
          active?: boolean
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['menu_items']['Row']>
      }
      visits: {
        Row: {
          id: string
          tenant_id: string
          customer_id: string
          visited_at: string
          total_amount_cents: number
          notes: string | null
          created_by: string | null
          source: VisitSource
          created_at: string
        }
        Insert: Pick<
          Database['public']['Tables']['visits']['Row'],
          'tenant_id' | 'customer_id'
        > & {
          id?: string
          visited_at?: string
          total_amount_cents?: number
          notes?: string | null
          created_by?: string | null
          source?: VisitSource
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['visits']['Row']>
      }
      visit_items: {
        Row: {
          id: string
          visit_id: string
          menu_item_id: string
          quantity: number
          unit_price_cents: number
          line_total_cents: number
          created_at: string
        }
        Insert: Pick<
          Database['public']['Tables']['visit_items']['Row'],
          'visit_id' | 'menu_item_id' | 'quantity' | 'unit_price_cents' | 'line_total_cents'
        > & { id?: string; created_at?: string }
        Update: Partial<Database['public']['Tables']['visit_items']['Row']>
      }
      points_rules: {
        Row: {
          id: string
          tenant_id: string
          type: PointsRuleType
          config: Json
          priority: number
          active: boolean
          created_at: string
        }
        Insert: Pick<
          Database['public']['Tables']['points_rules']['Row'],
          'tenant_id' | 'type' | 'config'
        > & {
          id?: string
          priority?: number
          active?: boolean
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['points_rules']['Row']>
      }
      points_transactions: {
        Row: {
          id: string
          tenant_id: string
          customer_id: string
          visit_id: string | null
          redemption_id: string | null
          delta: number
          reason: string
          payload: Json
          created_at: string
        }
        Insert: never
        Update: never
      }
      rewards: {
        Row: {
          id: string
          tenant_id: string
          name: string
          description: string | null
          cost_points: number
          stock: number | null
          active: boolean
          image_url: string | null
          created_at: string
        }
        Insert: Pick<
          Database['public']['Tables']['rewards']['Row'],
          'tenant_id' | 'name' | 'cost_points'
        > & {
          id?: string
          description?: string | null
          stock?: number | null
          active?: boolean
          image_url?: string | null
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['rewards']['Row']>
      }
      events: {
        Row: {
          id: string
          tenant_id: string
          name: string
          description: string | null
          starts_at: string
          ends_at: string
          capacity: number | null
          waitlist_enabled: boolean
          status: EventStatus
          cover_image_url: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: Pick<
          Database['public']['Tables']['events']['Row'],
          'tenant_id' | 'name' | 'starts_at' | 'ends_at'
        > & {
          id?: string
          description?: string | null
          capacity?: number | null
          waitlist_enabled?: boolean
          status?: EventStatus
          cover_image_url?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['events']['Row']>
      }
      reservations: {
        Row: {
          id: string
          tenant_id: string
          event_id: string
          customer_id: string
          guests_count: number
          status: ReservationStatus
          waitlist_position: number | null
          checked_in_at: string | null
          checked_in_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: never
        Update: Partial<Database['public']['Tables']['reservations']['Row']>
      }
      reward_redemptions: {
        Row: {
          id: string
          tenant_id: string
          customer_id: string
          reward_id: string
          points_spent: number
          redeemed_by: string | null
          redeemed_at: string
          status: RedemptionStatus
          notes: string | null
          created_at: string
        }
        Insert: never
        Update: Partial<Database['public']['Tables']['reward_redemptions']['Row']>
      }
      customer_capture_submissions: {
        Row: {
          id: string
          tenant_id: string
          link_id: string
          customer_id: string | null
          phone: string
          first_name: string
          last_name: string
          opt_in_marketing: boolean
          ip: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: Pick<
          Database['public']['Tables']['customer_capture_submissions']['Row'],
          'tenant_id' | 'link_id' | 'phone' | 'first_name' | 'last_name'
        > & {
          id?: string
          customer_id?: string | null
          opt_in_marketing?: boolean
          ip?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['customer_capture_submissions']['Row']>
      }
      channels: {
        Row: {
          id: string
          tenant_id: string
          type: ChannelType
          status: ChannelStatus
          external_account_id: string
          external_phone_number_id: string | null
          display_name: string | null
          encrypted_access_token: string | null
          token_expires_at: string | null
          last_error: string | null
          connected_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: Pick<
          Database['public']['Tables']['channels']['Row'],
          'tenant_id' | 'type' | 'external_account_id'
        > & {
          id?: string
          status?: ChannelStatus
          external_phone_number_id?: string | null
          display_name?: string | null
          encrypted_access_token?: string | null
          token_expires_at?: string | null
          last_error?: string | null
          connected_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['channels']['Row']>
      }
      message_templates: {
        Row: {
          id: string
          tenant_id: string
          channel_id: string
          meta_template_id: string | null
          name: string
          language: string
          category: string
          components: Json
          status: TemplateStatus
          last_synced_at: string | null
          created_at: string
        }
        Insert: Pick<
          Database['public']['Tables']['message_templates']['Row'],
          'tenant_id' | 'channel_id' | 'name' | 'language' | 'category'
        > & {
          id?: string
          meta_template_id?: string | null
          components?: Json
          status?: TemplateStatus
          last_synced_at?: string | null
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['message_templates']['Row']>
      }
      conversations: {
        Row: {
          id: string
          tenant_id: string
          channel_id: string
          customer_id: string | null
          external_user_id: string
          last_message_at: string | null
          unread_count: number
          created_at: string
        }
        Insert: Pick<
          Database['public']['Tables']['conversations']['Row'],
          'tenant_id' | 'channel_id' | 'external_user_id'
        > & {
          id?: string
          customer_id?: string | null
          last_message_at?: string | null
          unread_count?: number
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['conversations']['Row']>
      }
      audiences: {
        Row: {
          id: string
          tenant_id: string
          name: string
          filters: Json
          customer_count_cached: number
          last_calculated_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: Pick<Database['public']['Tables']['audiences']['Row'], 'tenant_id' | 'name'> & {
          id?: string
          filters?: Json
          customer_count_cached?: number
          last_calculated_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['audiences']['Row']>
      }
      broadcasts: {
        Row: {
          id: string
          tenant_id: string
          name: string
          channel_id: string
          template_id: string
          audience_id: string
          scheduled_at: string | null
          status: BroadcastStatus
          stats: Json
          started_at: string | null
          completed_at: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: Pick<
          Database['public']['Tables']['broadcasts']['Row'],
          'tenant_id' | 'name' | 'channel_id' | 'template_id' | 'audience_id'
        > & {
          id?: string
          scheduled_at?: string | null
          status?: BroadcastStatus
          stats?: Json
          started_at?: string | null
          completed_at?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['broadcasts']['Row']>
      }
      broadcast_recipients: {
        Row: {
          id: string
          broadcast_id: string
          customer_id: string
          status: RecipientStatus
          message_id: string | null
          error: string | null
          queued_at: string | null
          sent_at: string | null
        }
        Insert: Pick<
          Database['public']['Tables']['broadcast_recipients']['Row'],
          'broadcast_id' | 'customer_id'
        > & {
          id?: string
          status?: RecipientStatus
          message_id?: string | null
          error?: string | null
          queued_at?: string | null
          sent_at?: string | null
        }
        Update: Partial<Database['public']['Tables']['broadcast_recipients']['Row']>
      }
      flows: {
        Row: {
          id: string
          tenant_id: string
          name: string
          trigger_type: FlowTriggerType
          trigger_config: Json
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: Pick<
          Database['public']['Tables']['flows']['Row'],
          'tenant_id' | 'name' | 'trigger_type'
        > & {
          id?: string
          trigger_config?: Json
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['flows']['Row']>
      }
      flow_steps: {
        Row: {
          id: string
          flow_id: string
          position: number
          type: FlowStepType
          config: Json
          created_at: string
        }
        Insert: Pick<
          Database['public']['Tables']['flow_steps']['Row'],
          'flow_id' | 'position' | 'type'
        > & {
          id?: string
          config?: Json
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['flow_steps']['Row']>
      }
      flow_executions: {
        Row: {
          id: string
          tenant_id: string
          flow_id: string
          customer_id: string
          current_step: number
          status: FlowExecutionStatus
          next_run_at: string
          started_at: string
          completed_at: string | null
          error: string | null
          context: Json
        }
        Insert: Pick<
          Database['public']['Tables']['flow_executions']['Row'],
          'tenant_id' | 'flow_id' | 'customer_id'
        > & {
          id?: string
          current_step?: number
          status?: FlowExecutionStatus
          next_run_at?: string
          started_at?: string
          completed_at?: string | null
          error?: string | null
          context?: Json
        }
        Update: Partial<Database['public']['Tables']['flow_executions']['Row']>
      }
      job_queue: {
        Row: {
          id: string
          tenant_id: string
          kind: string
          payload: Json
          run_at: string
          attempts: number
          max_attempts: number
          locked_at: string | null
          status: JobStatus
          error: string | null
          created_at: string
        }
        Insert: Pick<
          Database['public']['Tables']['job_queue']['Row'],
          'tenant_id' | 'kind'
        > & {
          id?: string
          payload?: Json
          run_at?: string
          attempts?: number
          max_attempts?: number
          locked_at?: string | null
          status?: JobStatus
          error?: string | null
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['job_queue']['Row']>
      }
      messages: {
        Row: {
          id: string
          tenant_id: string
          conversation_id: string
          direction: MessageDirection
          content: string | null
          media: Json | null
          meta_message_id: string | null
          status: MessageStatus | null
          error: string | null
          sent_at: string | null
          delivered_at: string | null
          read_at: string | null
          broadcast_id: string | null
          flow_execution_id: string | null
          created_at: string
        }
        Insert: Pick<
          Database['public']['Tables']['messages']['Row'],
          'tenant_id' | 'conversation_id' | 'direction'
        > & {
          id?: string
          content?: string | null
          media?: Json | null
          meta_message_id?: string | null
          status?: MessageStatus | null
          error?: string | null
          sent_at?: string | null
          delivered_at?: string | null
          read_at?: string | null
          broadcast_id?: string | null
          flow_execution_id?: string | null
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['messages']['Row']>
      }
    }
    Views: {
      v_customer_stats: {
        Row: {
          customer_id: string
          tenant_id: string
          first_name: string
          last_name: string
          phone: string
          total_visits: number
          total_spent_cents: number
          avg_ticket_cents: number
          first_visit_at: string | null
          last_visit_at: string | null
          days_since_last_visit: number | null
          visit_frequency_days: number | null
          favorite_item_id: string | null
          favorite_item_name: string | null
          favorite_category_id: string | null
          favorite_category_name: string | null
          refreshed_at: string
        }
      }
      v_tenant_daily_metrics: {
        Row: {
          tenant_id: string
          day: string
          visits: number
          revenue_cents: number
          customers_active: number
          customers_new: number
          refreshed_at: string
        }
      }
      v_visit_heatmap: {
        Row: {
          tenant_id: string
          dow: number
          hour: number
          visit_count: number
        }
      }
      v_churn_risk: {
        Row: {
          tenant_id: string
          customer_id: string
          first_name: string
          last_name: string
          phone: string
          total_visits: number
          visit_frequency_days: number
          days_since_last_visit: number
          last_visit_at: string
          total_spent_cents: number
          favorite_item_name: string | null
        }
      }
    }
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
      submit_capture: {
        Args: {
          p_link_slug: string
          p_phone: string
          p_first_name: string
          p_last_name: string
          p_opt_in: boolean
          p_ip: string
          p_user_agent: string
        }
        Returns: { customer_id: string; was_new: boolean }[]
      }
      close_table: {
        Args: { p_customer_id: string; p_items: Json; p_notes?: string | null }
        Returns: { visit_id: string; points_awarded: number; breakdown: Json }[]
      }
      redeem_reward: {
        Args: { p_customer_id: string; p_reward_id: string }
        Returns: { redemption_id: string; balance_after: number }[]
      }
      reorder_menu_categories: {
        Args: { p_tenant_id: string; p_ordered_ids: string[] }
        Returns: void
      }
      reorder_menu_items: {
        Args: { p_category_id: string; p_ordered_ids: string[] }
        Returns: void
      }
      create_reservation: {
        Args: { p_event_id: string; p_customer_id: string; p_guests?: number }
        Returns: {
          reservation_id: string
          status: ReservationStatus
          waitlist_position: number | null
        }[]
      }
      cancel_reservation: {
        Args: { p_reservation_id: string }
        Returns: { promoted_id: string | null }[]
      }
      check_in_reservation: {
        Args: { p_reservation_id: string }
        Returns: void
      }
      cancel_event: {
        Args: { p_event_id: string }
        Returns: void
      }
      finish_past_events: {
        Args: Record<string, never>
        Returns: { finished_events: number; no_show_reservations: number }[]
      }
      encrypt_meta_token: {
        Args: { plaintext: string; key: string }
        Returns: string
      }
      decrypt_meta_token: {
        Args: { ciphertext: string; key: string }
        Returns: string
      }
      ingest_inbound_message: {
        Args: {
          p_tenant_id: string
          p_channel_id: string
          p_external_user_id: string
          p_meta_message_id: string
          p_content: string | null
          p_media: Json | null
          p_sent_at: string
          p_customer_id: string | null
        }
        Returns: { message_id: string | null; conversation_id: string; was_new: boolean }[]
      }
      update_message_status: {
        Args: {
          p_meta_message_id: string
          p_status: MessageStatus
          p_error: string | null
          p_timestamp: string
        }
        Returns: string | null
      }
      enqueue_job: {
        Args: {
          p_tenant_id: string
          p_kind: string
          p_payload: Json
          p_run_at?: string
          p_max_attempts?: number
        }
        Returns: string
      }
      claim_jobs: {
        Args: { p_kind?: string | null; p_limit?: number }
        Returns: Database['public']['Tables']['job_queue']['Row'][]
      }
      complete_job: {
        Args: { p_id: string }
        Returns: void
      }
      fail_job: {
        Args: { p_id: string; p_error: string; p_recoverable?: boolean }
        Returns: void
      }
      requeue_stuck_jobs: {
        Args: { p_threshold_seconds?: number }
        Returns: number
      }
      evaluate_audience_query: {
        Args: {
          p_tenant_id: string
          p_where: string
          p_params?: Json
          p_limit?: number | null
        }
        Returns: { customer_id: string; count_total: number }[]
      }
      customers_for_inactive_flow: {
        Args: { p_flow_id: string; p_days: number }
        Returns: { customer_id: string }[]
      }
      customers_for_birthday_flow: {
        Args: { p_flow_id: string }
        Returns: { customer_id: string }[]
      }
      start_flow_for_customer: {
        Args: { p_flow_id: string; p_customer_id: string; p_context?: Json }
        Returns: string | null
      }
      refresh_stats: {
        Args: Record<string, never>
        Returns: void
      }
    }
    Enums: {
      tenant_role: TenantRole
      customer_source: CustomerSource
      visit_source: VisitSource
      points_rule_type: PointsRuleType
      redemption_status: RedemptionStatus
      event_status: EventStatus
      reservation_status: ReservationStatus
      channel_type: ChannelType
      channel_status: ChannelStatus
      template_status: TemplateStatus
      message_direction: MessageDirection
      message_status: MessageStatus
      broadcast_status: BroadcastStatus
      recipient_status: RecipientStatus
      flow_trigger_type: FlowTriggerType
      flow_step_type: FlowStepType
      flow_execution_status: FlowExecutionStatus
      job_status: JobStatus
    }
    CompositeTypes: Record<string, never>
  }
}
