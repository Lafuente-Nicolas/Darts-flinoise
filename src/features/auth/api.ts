import { queryOptions } from '@tanstack/react-query';
import { requireSupabase } from '@/lib/supabase';

export async function signIn(credentials: { email: string; password: string }): Promise<void> {
  const { error } = await requireSupabase().auth.signInWithPassword({
    email: credentials.email.trim(),
    password: credentials.password,
  });
  if (error) throw error;
}

export async function signOut(): Promise<void> {
  const { error } = await requireSupabase().auth.signOut();
  if (error) throw error;
}

/** Le serveur décide : vrai seulement si le compte figure dans la table `admins`. */
export async function checkIsAdmin(): Promise<boolean> {
  const { data, error } = await requireSupabase().rpc('is_admin');
  if (error) throw error;
  return data === true;
}

export const isAdminQuery = (userId: string | undefined) =>
  queryOptions({
    queryKey: ['auth', 'is-admin', userId],
    queryFn: checkIsAdmin,
    enabled: Boolean(userId),
    staleTime: 5 * 60_000,
  });

/** Traduit les erreurs de connexion Supabase en message clair. */
export function getSignInErrorMessage(error: unknown): string {
  const { code, status } = (error ?? {}) as { code?: string; status?: number };
  if (code === 'invalid_credentials' || status === 400) {
    return 'E-mail ou mot de passe incorrect.';
  }
  if (code === 'over_request_rate_limit' || status === 429) {
    return 'Trop de tentatives. Patientez quelques minutes avant de réessayer.';
  }
  return 'Connexion impossible pour le moment. Vérifiez votre réseau et réessayez.';
}
