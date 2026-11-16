import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

export type AppSupabaseClient = SupabaseClient<Database>;

const url = import.meta.env.VITE_SUPABASE_URL;
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

/**
 * Client Supabase unique de l'application.
 * `null` tant que les variables d'environnement ne sont pas renseignées : le site reste
 * consultable (pages statiques, fléchette 3D) et les blocs de données affichent un message clair.
 */
export const supabase: AppSupabaseClient | null =
  url && publishableKey
    ? createClient<Database>(url, publishableKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: false,
        },
      })
    : null;

export const isSupabaseConfigured = supabase !== null;

export class SupabaseNotConfiguredError extends Error {
  constructor() {
    super(
      'Supabase n’est pas configuré : renseignez VITE_SUPABASE_URL et VITE_SUPABASE_PUBLISHABLE_KEY.',
    );
    this.name = 'SupabaseNotConfiguredError';
  }
}

export function requireSupabase(): AppSupabaseClient {
  if (!supabase) {
    throw new SupabaseNotConfiguredError();
  }
  return supabase;
}
