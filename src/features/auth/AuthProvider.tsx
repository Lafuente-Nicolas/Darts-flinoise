import { useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { AuthContext, type AuthStatus, type AuthValue } from './authContext';

/**
 * Session de l'administrateur. Monté uniquement dans l'espace admin :
 * les visiteurs ne se connectent jamais et ne chargent pas cette logique.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{ status: AuthStatus; session: Session | null }>(() => ({
    status: supabase ? 'loading' : 'unconfigured',
    session: null,
  }));

  useEffect(() => {
    if (!supabase) return;
    // Émet INITIAL_SESSION au démarrage, puis chaque connexion, déconnexion et rafraîchissement.
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setState({ status: session ? 'signed-in' : 'signed-out', session });
    });
    return () => data.subscription.unsubscribe();
  }, []);

  const value = useMemo<AuthValue>(
    () => ({ ...state, user: state.session?.user ?? null }),
    [state],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
