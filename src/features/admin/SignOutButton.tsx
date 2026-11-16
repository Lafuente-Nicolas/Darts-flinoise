import { useMutation, useQueryClient } from '@tanstack/react-query';
import { signOut } from '@/features/auth/api';

export function SignOutButton() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: signOut,
    onSettled: () => queryClient.removeQueries({ queryKey: ['auth'] }),
  });

  return (
    <button
      type="button"
      className="btn btn-ghost"
      onClick={() => mutation.mutate()}
      disabled={mutation.isPending}
    >
      {mutation.isPending ? 'Déconnexion…' : 'Se déconnecter'}
    </button>
  );
}
