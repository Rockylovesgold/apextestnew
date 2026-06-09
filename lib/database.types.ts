export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          display_name: string | null
          avatar_url: string | null
          role: 'member' | 'manager' | 'admin'
          account_balance: number
          risk_percentage: number
          referral_code: string | null
          referred_by: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          display_name?: string | null
          avatar_url?: string | null
          role?: 'member' | 'manager' | 'admin'
          account_balance?: number
          risk_percentage?: number
          referral_code?: string | null
          referred_by?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          display_name?: string | null
          avatar_url?: string | null
          role?: 'member' | 'manager' | 'admin'
          account_balance?: number
          risk_percentage?: number
          referral_code?: string | null
          referred_by?: string | null
          is_active?: boolean
          updated_at?: string
        }
      }
      trades: {
        Row: {
          id: string
          user_id: string
          instrument: string
          direction: 'buy' | 'sell'
          entry_price: number
          exit_price: number | null
          stop_loss: number | null
          take_profit: number | null
          lot_size: number
          pips: number | null
          profit_loss: number | null
          status: 'open' | 'closed' | 'cancelled'
          session: 'london' | 'new_york' | 'asian' | 'overlap' | null
          strategy: string | null
          notes: string | null
          opened_at: string
          closed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          instrument?: string
          direction: 'buy' | 'sell'
          entry_price: number
          exit_price?: number | null
          stop_loss?: number | null
          take_profit?: number | null
          lot_size: number
          pips?: number | null
          profit_loss?: number | null
          status?: 'open' | 'closed' | 'cancelled'
          session?: 'london' | 'new_york' | 'asian' | 'overlap' | null
          strategy?: string | null
          notes?: string | null
          opened_at?: string
          closed_at?: string | null
        }
        Update: {
          instrument?: string
          direction?: 'buy' | 'sell'
          entry_price?: number
          exit_price?: number | null
          stop_loss?: number | null
          take_profit?: number | null
          lot_size?: number
          pips?: number | null
          profit_loss?: number | null
          status?: 'open' | 'closed' | 'cancelled'
          session?: 'london' | 'new_york' | 'asian' | 'overlap' | null
          strategy?: string | null
          notes?: string | null
          opened_at?: string
          closed_at?: string | null
          updated_at?: string
        }
      }
      referral_codes: {
        Row: {
          id: string
          code: string
          created_by: string
          assigned_to: string | null
          max_uses: number
          current_uses: number
          is_active: boolean
          expires_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          code: string
          created_by: string
          assigned_to?: string | null
          max_uses?: number
          current_uses?: number
          is_active?: boolean
          expires_at?: string | null
        }
        Update: {
          code?: string
          assigned_to?: string | null
          max_uses?: number
          current_uses?: number
          is_active?: boolean
          expires_at?: string | null
        }
      }
      referral_uses: {
        Row: {
          id: string
          code_id: string
          used_by: string
          used_at: string
        }
        Insert: {
          id?: string
          code_id: string
          used_by: string
          used_at?: string
        }
        Update: never
      }
      tickets: {
        Row: {
          id: string
          user_id: string
          assigned_to: string | null
          subject: string
          category: 'technical' | 'billing' | 'trading' | 'account' | 'other'
          priority: 'low' | 'medium' | 'high' | 'urgent'
          status: 'open' | 'in_progress' | 'resolved' | 'closed'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          assigned_to?: string | null
          subject: string
          category: 'technical' | 'billing' | 'trading' | 'account' | 'other'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          status?: 'open' | 'in_progress' | 'resolved' | 'closed'
        }
        Update: {
          assigned_to?: string | null
          subject?: string
          category?: 'technical' | 'billing' | 'trading' | 'account' | 'other'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          status?: 'open' | 'in_progress' | 'resolved' | 'closed'
          updated_at?: string
        }
      }
      ticket_messages: {
        Row: {
          id: string
          ticket_id: string
          user_id: string
          message: string
          is_staff: boolean
          created_at: string
        }
        Insert: {
          id?: string
          ticket_id: string
          user_id: string
          message: string
          is_staff?: boolean
        }
        Update: never
      }
      education_modules: {
        Row: {
          id: string
          title: string
          description: string | null
          thumbnail_url: string | null
          order_index: number
          difficulty: 'beginner' | 'intermediate' | 'advanced'
          estimated_minutes: number
          is_published: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          thumbnail_url?: string | null
          order_index: number
          difficulty?: 'beginner' | 'intermediate' | 'advanced'
          estimated_minutes?: number
          is_published?: boolean
        }
        Update: {
          title?: string
          description?: string | null
          thumbnail_url?: string | null
          order_index?: number
          difficulty?: 'beginner' | 'intermediate' | 'advanced'
          estimated_minutes?: number
          is_published?: boolean
          updated_at?: string
        }
      }
      education_questions: {
        Row: {
          id: string
          module_id: string
          question: string
          question_type: 'multiple_choice' | 'true_false' | 'tap_reveal'
          options: Json | null
          correct_answer: string
          explanation: string | null
          order_index: number
          created_at: string
        }
        Insert: {
          id?: string
          module_id: string
          question: string
          question_type: 'multiple_choice' | 'true_false' | 'tap_reveal'
          options?: Json | null
          correct_answer: string
          explanation?: string | null
          order_index: number
        }
        Update: {
          question?: string
          question_type?: 'multiple_choice' | 'true_false' | 'tap_reveal'
          options?: Json | null
          correct_answer?: string
          explanation?: string | null
          order_index?: number
        }
      }
      education_progress: {
        Row: {
          id: string
          user_id: string
          module_id: string
          questions_answered: number
          questions_correct: number
          is_completed: boolean
          completed_at: string | null
          started_at: string
        }
        Insert: {
          id?: string
          user_id: string
          module_id: string
          questions_answered?: number
          questions_correct?: number
          is_completed?: boolean
          completed_at?: string | null
        }
        Update: {
          questions_answered?: number
          questions_correct?: number
          is_completed?: boolean
          completed_at?: string | null
        }
      }
    }
    Views: {
      leaderboard: {
        Row: {
          user_id: string
          display_name: string | null
          avatar_url: string | null
          total_trades: number
          winning_trades: number
          win_rate: number
          total_pnl: number
          total_pips: number
          profit_factor: number
        }
      }
    }
    Functions: {
      get_leaderboard: {
        Args: { time_filter: string }
        Returns: {
          user_id: string
          display_name: string
          avatar_url: string | null
          total_trades: number
          winning_trades: number
          win_rate: number
          total_pnl: number
          total_pips: number
          profit_factor: number
        }[]
      }
    }
  }
}

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Trade = Database['public']['Tables']['trades']['Row']
export type ReferralCode = Database['public']['Tables']['referral_codes']['Row']
export type ReferralUse = Database['public']['Tables']['referral_uses']['Row']
export type Ticket = Database['public']['Tables']['tickets']['Row']
export type TicketMessage = Database['public']['Tables']['ticket_messages']['Row']
export type EducationModule = Database['public']['Tables']['education_modules']['Row']
export type EducationQuestion = Database['public']['Tables']['education_questions']['Row']
export type EducationProgress = Database['public']['Tables']['education_progress']['Row']
