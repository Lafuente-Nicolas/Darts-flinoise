import { formatPoints } from '@/lib/format';
import type { RankingLine } from './parseRankingSheet';
import styles from './Ranking.module.css';

const PLACE_CLASS = [styles.gold, styles.silver, styles.bronze];

export function Podium({ lines }: { lines: readonly RankingLine[] }) {
  const top = lines.slice(0, 3);

  return (
    <ol className={styles.podium} aria-label="Podium">
      {top.map((line, i) => (
        <li key={`${line.name}-${i}`} className={`${styles.step} ${PLACE_CLASS[i] ?? ''}`}>
          <span className={styles.medal} aria-label={`${line.position}e`}>
            {line.position}
          </span>
          <strong className={styles.stepName}>{line.name}</strong>
          <span className={styles.stepPoints}>{formatPoints(line.points)} pts</span>
        </li>
      ))}
    </ol>
  );
}
