import { formatPoints } from '@/lib/format';
import type { RankingLine } from './parseRankingSheet';
import styles from './Ranking.module.css';

interface RankingTableProps {
  lines: readonly RankingLine[];
  caption: string;
}

export function RankingTable({ lines, caption }: RankingTableProps) {
  const showPlayed = lines.some((l) => l.played !== null);
  const showWins = lines.some((l) => l.wins !== null);

  return (
    <div className={styles.tableBox}>
      <table className={styles.table}>
        <caption className="visually-hidden">{caption}</caption>
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">Joueur</th>
            <th scope="col" className={styles.num}>
              Pts
            </th>
            {showPlayed && (
              <th scope="col" className={styles.num}>
                Matchs
              </th>
            )}
            {showWins && (
              <th scope="col" className={styles.num}>
                <abbr title="Victoires">Vict.</abbr>
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {lines.map((line, i) => (
            <tr key={`${line.name}-${i}`}>
              <td className={styles.rank}>{line.position}</td>
              <th scope="row" className={styles.player}>
                {line.name}
              </th>
              <td className={`${styles.num} ${styles.points}`}>{formatPoints(line.points)}</td>
              {showPlayed && <td className={styles.num}>{line.played ?? '—'}</td>}
              {showWins && <td className={styles.num}>{line.wins ?? '—'}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
