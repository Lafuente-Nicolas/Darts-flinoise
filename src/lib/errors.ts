import { SupabaseNotConfiguredError } from '@/lib/supabase';

/** Message lisible par un visiteur, quelle que soit l'origine de l'erreur. */
export function getErrorMessage(error: unknown): string {
  if (error instanceof SupabaseNotConfiguredError) {
    return 'Les données du club ne sont pas encore branchées.';
  }
  if (error instanceof TypeError && /fetch|network/i.test(error.message)) {
    return 'Impossible de joindre le serveur. Vérifiez votre connexion puis réessayez.';
  }
  if (isPostgrestError(error) && error.code === '42501') {
    return 'Cette action est réservée aux administrateurs.';
  }
  return 'Une erreur est survenue. Réessayez dans un instant.';
}

function isPostgrestError(error: unknown): error is { code: string; message: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof (error as { code: unknown }).code === 'string'
  );
}
