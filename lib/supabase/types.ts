export type Database = {
  public: {
    Tables: {
      user_roles: {
        Row: {
          id: string
          user_id: string
          role: "admin" | "user"
          assigned_by: string | null
          assigned_at: string
        }
        Insert: {
          id?: string
          user_id: string
          role: "admin" | "user"
          assigned_by?: string | null
          assigned_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          role?: "admin" | "user"
          assigned_by?: string | null
          assigned_at?: string
        }
      }
      user_profiles: {
        Row: {
          id: string
          user_id: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      audit_logs: {
        Row: {
          id: string
          user_id: string | null
          action: string
          resource: string | null
          details: any | null
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          action: string
          resource?: string | null
          details?: any | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          action?: string
          resource?: string | null
          details?: any | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
      }
    }
    Functions: {
      user_has_role: {
        Args: {
          user_uuid: string
          role_name: string
        }
        Returns: boolean
      }
      get_user_roles: {
        Args: {
          user_uuid: string
        }
        Returns: {
          role: string
        }[]
      }
      log_admin_action: {
        Args: {
          action_type: string
          resource_type?: string
          action_details?: any
          client_ip?: string
          client_user_agent?: string
        }
        Returns: string
      }
    }
  }
}

export type UserRole = "admin" | "user"

export interface UserProfile {
  id: string
  user_id: string
  full_name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface AuditLog {
  id: string
  user_id: string | null
  action: string
  resource: string | null
  details: any | null
  ip_address: string | null
  user_agent: string | null
  created_at: string
}
