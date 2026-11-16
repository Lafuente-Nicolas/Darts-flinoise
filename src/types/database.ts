// Types de la base Supabase, alignés sur supabase/migrations.
// À régénérer après chaque migration : `npm run db:types` (projet lié avec `supabase link`).

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      admins: {
        Row: {
          user_id: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      posts: {
        Row: {
          id: string;
          title: string;
          body: string;
          category: Database['public']['Enums']['post_category'];
          pinned: boolean;
          author_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          body: string;
          category?: Database['public']['Enums']['post_category'];
          pinned?: boolean;
          author_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          body?: string;
          category?: Database['public']['Enums']['post_category'];
          pinned?: boolean;
          author_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      ranking_entries: {
        Row: {
          id: number;
          position: number;
          player_name: string;
          points: number;
          matches_played: number | null;
          wins: number | null;
        };
        Insert: {
          id?: never;
          position: number;
          player_name: string;
          points: number;
          matches_played?: number | null;
          wins?: number | null;
        };
        Update: {
          id?: never;
          position?: number;
          player_name?: string;
          points?: number;
          matches_played?: number | null;
          wins?: number | null;
        };
        Relationships: [];
      };
      ranking_imports: {
        Row: {
          id: number;
          file_name: string;
          row_count: number;
          imported_by: string | null;
          imported_at: string;
        };
        Insert: {
          id?: never;
          file_name: string;
          row_count: number;
          imported_by?: string | null;
          imported_at?: string;
        };
        Update: {
          id?: never;
          file_name?: string;
          row_count?: number;
          imported_by?: string | null;
          imported_at?: string;
        };
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      replace_ranking: {
        Args: { p_file_name: string; p_rows: Json };
        Returns: number;
      };
    };
    Enums: {
      post_category: 'info' | 'tournoi' | 'resultats' | 'annonce';
    };
    CompositeTypes: { [_ in never]: never };
  };
};

type PublicSchema = Database['public'];

export type TableRow<T extends keyof PublicSchema['Tables']> = PublicSchema['Tables'][T]['Row'];
export type TableInsert<T extends keyof PublicSchema['Tables']> =
  PublicSchema['Tables'][T]['Insert'];
export type TableUpdate<T extends keyof PublicSchema['Tables']> =
  PublicSchema['Tables'][T]['Update'];
export type DbEnum<T extends keyof PublicSchema['Enums']> = PublicSchema['Enums'][T];
