import { QueryClient } from '@tanstack/react-query';
import { SupabaseNotConfiguredError } from '@/lib/supabase';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: (failureCount, error) =>
        !(error instanceof SupabaseNotConfiguredError) && failureCount < 2,
    },
  },
});
