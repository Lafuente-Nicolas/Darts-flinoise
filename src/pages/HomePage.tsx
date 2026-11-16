import { Link } from 'react-router';
import { club } from '@/content/club';
import { DartStage } from '@/features/dart/DartStage';
import { PostList } from '@/features/posts/PostList';
import { RankingBoard } from '@/features/ranking/RankingBoard';
import { formatHour } from '@/lib/format';
import styles from './HomePage.module.css';

export function HomePage() {
  const days = club.sessions.map((s) => s.day.toLowerCase()).join(' et le ');
  const [first] = club.sessions;
  const hours = first ? `de ${formatHour(first.start)} à ${formatHour(first.end)}` : '';

  return (
    <div className="container">
      <title>Darts Flinoise · Club de fléchettes</title>

      <section className={styles.hero} aria-labelledby="titre-accueil">
        <div className={styles.heroText}>
          <p className="eyebrow">{club.tagline}</p>
          <h1 id="titre-accueil" className="display display-xl">
            {club.name}
          </h1>
          <p className="lead">
            Le {days}, {hours}, à la {club.venue.name}. Débutants comme joueurs confirmés.
          </p>
        </div>
        <DartStage />
      </section>

      <ul className={styles.quick} aria-label="Infos pratiques">
        {club.sessions.map((session) => (
          <li key={session.day} className={styles.quickCard}>
            <span className={styles.quickLabel}>{session.day}</span>
            <strong className={styles.quickTitle}>Séance</strong>
            <span className={styles.quickValue}>
              {session.start} – {session.end}
            </span>
          </li>
        ))}
        <li>
          <Link to="/club" className={styles.quickCard}>
            <span className={styles.quickLabel}>Lieu</span>
            <strong className={styles.quickTitle}>{club.venue.name}</strong>
            <span className={styles.quickValue}>Infos pratiques →</span>
          </Link>
        </li>
        <li>
          <Link to="/classement" className={styles.quickCard}>
            <span className={styles.quickLabel}>Saison</span>
            <strong className={styles.quickTitle}>Classement</strong>
            <span className={styles.quickValue}>Voir tout →</span>
          </Link>
        </li>
      </ul>

      <div className={styles.columns}>
        <section className="section" aria-labelledby="titre-actus">
          <div className={styles.sectionHead}>
            <h2 id="titre-actus" className="display display-md">
              Dernières actus
            </h2>
            <Link to="/actus" className={styles.more}>
              Tout voir
            </Link>
          </div>
          <PostList limit={2} />
        </section>

        <section className="section" aria-labelledby="titre-podium">
          <div className={styles.sectionHead}>
            <h2 id="titre-podium" className="display display-md">
              Podium
            </h2>
            <Link to="/classement" className={styles.more}>
              Classement
            </Link>
          </div>
          <RankingBoard variant="podium" />
        </section>
      </div>
    </div>
  );
}
