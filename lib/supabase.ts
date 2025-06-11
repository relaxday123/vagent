import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          wallet_address: string
          email: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          wallet_address: string
          email?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          wallet_address?: string
          email?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      credit_scores: {
        Row: {
          id: string
          user_id: string
          score: number
          score_breakdown: any
          calculated_at: string
          version: number
        }
        Insert: {
          id?: string
          user_id: string
          score: number
          score_breakdown: any
          calculated_at?: string
          version?: number
        }
        Update: {
          id?: string
          user_id?: string
          score?: number
          score_breakdown?: any
          calculated_at?: string
          version?: number
        }
      }
      wallet_data: {
        Row: {
          id: string
          user_id: string
          wallet_address: string
          blockchain: string
          balance: number | null
          transaction_count: number | null
          first_transaction_date: string | null
          last_transaction_date: string | null
          defi_protocols: any
          token_holdings: any
          created_at: string
        }
      }
      off_chain_data: {
        Row: {
          id: string
          user_id: string
          kyc_verified: boolean | null
          social_score: number | null
          credit_history_score: number | null
          risk_flags: any
          created_at: string
        }
      }
    }
  }
}
