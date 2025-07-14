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
      admin_quotes: {
        Row: {
          admin_fee: number
          admin_id: string
          admin_notes: string | null
          created_at: string
          exchange_rate: number
          expires_at: string
          from_amount: number
          from_currency: string
          id: string
          net_amount: number
          quote_type: string
          special_rate_reason: string | null
          status: string
          to_amount: number
          to_currency: string
          total_fee: number
          updated_at: string
          user_id: string
          withdrawal_fee: number
        }
        Insert: {
          admin_fee?: number
          admin_id: string
          admin_notes?: string | null
          created_at?: string
          exchange_rate: number
          expires_at: string
          from_amount: number
          from_currency: string
          id?: string
          net_amount: number
          quote_type: string
          special_rate_reason?: string | null
          status?: string
          to_amount: number
          to_currency: string
          total_fee?: number
          updated_at?: string
          user_id: string
          withdrawal_fee?: number
        }
        Update: {
          admin_fee?: number
          admin_id?: string
          admin_notes?: string | null
          created_at?: string
          exchange_rate?: number
          expires_at?: string
          from_amount?: number
          from_currency?: string
          id?: string
          net_amount?: number
          quote_type?: string
          special_rate_reason?: string | null
          status?: string
          to_amount?: number
          to_currency?: string
          total_fee?: number
          updated_at?: string
          user_id?: string
          withdrawal_fee?: number
        }
        Relationships: [
          {
            foreignKeyName: "admin_quotes_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_quotes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_settings: {
        Row: {
          created_at: string
          description: string | null
          id: string
          setting_key: string
          setting_value: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          setting_key: string
          setting_value: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          setting_key?: string
          setting_value?: string
          updated_at?: string
        }
        Relationships: []
      }
      bank_accounts: {
        Row: {
          account_holder_name: string
          account_number: string
          account_type: string
          bank_name: string
          branch_code: string | null
          created_at: string
          currency: string
          id: string
          is_verified: boolean
          proof_document_path: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          account_holder_name: string
          account_number: string
          account_type: string
          bank_name: string
          branch_code?: string | null
          created_at?: string
          currency?: string
          id?: string
          is_verified?: boolean
          proof_document_path?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          account_holder_name?: string
          account_number?: string
          account_type?: string
          bank_name?: string
          branch_code?: string | null
          created_at?: string
          currency?: string
          id?: string
          is_verified?: boolean
          proof_document_path?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bank_accounts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      crypto_wallets: {
        Row: {
          created_at: string
          currency: string
          exchange_name: string | null
          id: string
          is_verified: boolean
          updated_at: string
          user_id: string
          wallet_address: string
          wallet_type: string
        }
        Insert: {
          created_at?: string
          currency: string
          exchange_name?: string | null
          id?: string
          is_verified?: boolean
          updated_at?: string
          user_id: string
          wallet_address: string
          wallet_type: string
        }
        Update: {
          created_at?: string
          currency?: string
          exchange_name?: string | null
          id?: string
          is_verified?: boolean
          updated_at?: string
          user_id?: string
          wallet_address?: string
          wallet_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "crypto_wallets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      currencies: {
        Row: {
          code: string
          created_at: string
          decimals: number
          id: string
          is_active: boolean
          name: string
          symbol: string | null
          type: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          decimals?: number
          id?: string
          is_active?: boolean
          name: string
          symbol?: string | null
          type: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          decimals?: number
          id?: string
          is_active?: boolean
          name?: string
          symbol?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      document_statuses: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      document_types: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          required: boolean
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          required?: boolean
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          required?: boolean
        }
        Relationships: []
      }
      exchange_rates: {
        Row: {
          base_rate: number
          buy_markup: number
          created_at: string
          final_buy_rate: number
          final_sell_rate: number
          from_currency: string
          id: string
          last_updated: string
          sell_markup: number
          to_currency: string
        }
        Insert: {
          base_rate: number
          buy_markup?: number
          created_at?: string
          final_buy_rate: number
          final_sell_rate: number
          from_currency: string
          id?: string
          last_updated?: string
          sell_markup?: number
          to_currency: string
        }
        Update: {
          base_rate?: number
          buy_markup?: number
          created_at?: string
          final_buy_rate?: number
          final_sell_rate?: number
          from_currency?: string
          id?: string
          last_updated?: string
          sell_markup?: number
          to_currency?: string
        }
        Relationships: []
      }
      kyc_documents: {
        Row: {
          created_at: string
          document_type: string
          document_type_id: string | null
          file_path: string
          id: string
          status_id: string | null
          submission_id: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          created_at?: string
          document_type: string
          document_type_id?: string | null
          file_path: string
          id?: string
          status_id?: string | null
          submission_id: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          created_at?: string
          document_type?: string
          document_type_id?: string | null
          file_path?: string
          id?: string
          status_id?: string | null
          submission_id?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "kyc_documents_document_type_id_fkey"
            columns: ["document_type_id"]
            isOneToOne: false
            referencedRelation: "document_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kyc_documents_status_id_fkey"
            columns: ["status_id"]
            isOneToOne: false
            referencedRelation: "document_statuses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kyc_documents_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "kyc_submissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kyc_documents_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      kyc_submissions: {
        Row: {
          address: string
          city: string
          country: string
          created_at: string
          email: string
          first_name: string
          id: string
          id_type: string
          national_id_number: string | null
          other_source_description: string | null
          phone: string
          postal_code: string
          rejection_reason: string | null
          source_of_funds: string
          status: string
          surname: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          address: string
          city: string
          country: string
          created_at?: string
          email: string
          first_name: string
          id?: string
          id_type: string
          national_id_number?: string | null
          other_source_description?: string | null
          phone: string
          postal_code: string
          rejection_reason?: string | null
          source_of_funds: string
          status?: string
          surname: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          address?: string
          city?: string
          country?: string
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          id_type?: string
          national_id_number?: string | null
          other_source_description?: string | null
          phone?: string
          postal_code?: string
          rejection_reason?: string | null
          source_of_funds?: string
          status?: string
          surname?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "kyc_submissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      otc_orders: {
        Row: {
          admin_notes: string | null
          bank_account_id: string | null
          created_at: string
          crypto_wallet_id: string | null
          exchange_rate: number
          from_amount: number
          from_currency: string
          id: string
          net_amount: number
          order_type: string
          payment_proof_path: string | null
          quote_id: string
          status: string
          to_amount: number
          to_currency: string
          total_fee: number
          transaction_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          bank_account_id?: string | null
          created_at?: string
          crypto_wallet_id?: string | null
          exchange_rate: number
          from_amount: number
          from_currency: string
          id?: string
          net_amount: number
          order_type: string
          payment_proof_path?: string | null
          quote_id: string
          status?: string
          to_amount: number
          to_currency: string
          total_fee: number
          transaction_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          bank_account_id?: string | null
          created_at?: string
          crypto_wallet_id?: string | null
          exchange_rate?: number
          from_amount?: number
          from_currency?: string
          id?: string
          net_amount?: number
          order_type?: string
          payment_proof_path?: string | null
          quote_id?: string
          status?: string
          to_amount?: number
          to_currency?: string
          total_fee?: number
          transaction_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "otc_orders_bank_account_id_fkey"
            columns: ["bank_account_id"]
            isOneToOne: false
            referencedRelation: "bank_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "otc_orders_crypto_wallet_id_fkey"
            columns: ["crypto_wallet_id"]
            isOneToOne: false
            referencedRelation: "crypto_wallets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "otc_orders_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "otc_quotes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "otc_orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      otc_quotes: {
        Row: {
          admin_fee: number
          created_at: string
          exchange_rate: number
          expires_at: string
          from_amount: number
          from_currency: string
          id: string
          net_amount: number
          quote_type: string
          status: string
          to_amount: number
          to_currency: string
          total_fee: number
          updated_at: string
          user_id: string
          withdrawal_fee: number
        }
        Insert: {
          admin_fee?: number
          created_at?: string
          exchange_rate: number
          expires_at: string
          from_amount: number
          from_currency: string
          id?: string
          net_amount: number
          quote_type: string
          status?: string
          to_amount: number
          to_currency: string
          total_fee?: number
          updated_at?: string
          user_id: string
          withdrawal_fee?: number
        }
        Update: {
          admin_fee?: number
          created_at?: string
          exchange_rate?: number
          expires_at?: string
          from_amount?: number
          from_currency?: string
          id?: string
          net_amount?: number
          quote_type?: string
          status?: string
          to_amount?: number
          to_currency?: string
          total_fee?: number
          updated_at?: string
          user_id?: string
          withdrawal_fee?: number
        }
        Relationships: [
          {
            foreignKeyName: "otc_quotes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          bank_reference: string | null
          created_at: string
          currency: string
          fee: number
          id: string
          net_amount: number
          order_id: string
          status: string
          transaction_hash: string | null
          transaction_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          bank_reference?: string | null
          created_at?: string
          currency: string
          fee?: number
          id?: string
          net_amount: number
          order_id: string
          status?: string
          transaction_hash?: string | null
          transaction_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          bank_reference?: string | null
          created_at?: string
          currency?: string
          fee?: number
          id?: string
          net_amount?: number
          order_id?: string
          status?: string
          transaction_hash?: string | null
          transaction_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "otc_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          created_at: string
          id: string
          is_super_user: boolean
          super_user_notes: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_super_user?: boolean
          super_user_notes?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_super_user?: boolean
          super_user_notes?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string
          email: string
          email_confirmed_at: string | null
          first_name: string | null
          id: string
          is_active: boolean
          last_sign_in_at: string | null
          phone: string | null
          surname: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          email_confirmed_at?: string | null
          first_name?: string | null
          id?: string
          is_active?: boolean
          last_sign_in_at?: string | null
          phone?: string | null
          surname?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          email_confirmed_at?: string | null
          first_name?: string | null
          id?: string
          is_active?: boolean
          last_sign_in_at?: string | null
          phone?: string | null
          surname?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const