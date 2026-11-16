import type { ReactNode } from 'react';
import { getErrorMessage } from '@/lib/errors';

interface QueryStateProps<T> {
  data: T | undefined;
  error: unknown;
  isPending: boolean;
  isEmpty: (data: T) => boolean;
  loadingLabel: string;
  emptyLabel: string;
  children: (data: T) => ReactNode;
}

/** Gère les états chargement / erreur / vide d'une requête, et délègue l'affichage des données. */
export function QueryState<T>({
  data,
  error,
  isPending,
  isEmpty,
  loadingLabel,
  emptyLabel,
  children,
}: QueryStateProps<T>) {
  if (isPending) {
    return (
      <p className="empty-state" aria-busy="true">
        {loadingLabel}
      </p>
    );
  }
  if (error || data === undefined) {
    return (
      <p className="empty-state" role="status">
        {getErrorMessage(error)}
      </p>
    );
  }
  if (isEmpty(data)) {
    return <p className="empty-state">{emptyLabel}</p>;
  }
  return <>{children(data)}</>;
}
