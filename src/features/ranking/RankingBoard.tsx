import { useQuery } from '@tanstack/react-query';
import { QueryState } from '@/components/QueryState';
import { formatDateTime } from '@/lib/format';
import { Podium } from './Podium';
import { rankingQuery } from './queries';
import { RankingTable } from './RankingTable';
import styles from './Ranking.module.css';

interface RankingBoardProps {
  /** `podium` : uniquement les trois premiers (accueil). */
  variant?: 'full' | 'podium';
}

export function RankingBoard({ variant = 'full' }: RankingBoardProps) {
  const { data, error, isPending } = useQuery(rankingQuery);

  return (
    <QueryState
      data={data}
      error={error}
      isPending={isPending}
      isEmpty={(ranking) => ranking.lines.length === 0}
      loadingLabel="Chargement du classement…"
      emptyLabel="Le classement démarre bientôt."
    >
      {(ranking) => (
        <div className="stack">
          <Podium lines={ranking.lines} />
          {variant === 'full' && (
            <>
              <RankingTable lines={ranking.lines} caption="Classement complet du club" />
              {ranking.updatedAt && (
                <p className={styles.updated}>Mis à jour le {formatDateTime(ranking.updatedAt)}</p>
              )}
            </>
          )}
        </div>
      )}
    </QueryState>
  );
}
