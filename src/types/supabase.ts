export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      accomplishments: {
        Row: {
          id: string
          created_at: string
          title: string
          description: string
          date: string
          user_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          title: string
          description: string
          date: string
          user_id: string
        }
        Update: {
          id?: string
          created_at?: string
          title?: string
          description?: string
          date?: string
          user_id?: string
        }
      }
      profiles: {
        Row: {
          id: string
          created_at: string
          email: string
          name: string | null
        }
        Insert: {
          id: string
          created_at?: string
          email: string
          name?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          email?: string
          name?: string | null
        }
      }
    }
  }
}
