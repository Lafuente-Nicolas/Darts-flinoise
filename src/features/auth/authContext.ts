import { createContext } from 'react';
import type { Session, User } from '@supabase/supabase-js';

export type AuthStatus = 'unconfigured' | 'loading' | 'signed-out' | 'signed-in';

export interface AuthValue {
  status: AuthStatus;
  session: Session | null;
  user: User | null;
}

export const AuthContext = createContext<AuthValue | null>(null);
