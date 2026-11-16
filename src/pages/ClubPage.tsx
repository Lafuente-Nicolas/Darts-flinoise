import { PageHeader } from '@/components/PageHeader';
import { club } from '@/content/club';
import styles from './ClubPage.module.css';

export function ClubPage() {
  return (
    <div className="container">
      <title>Le club · Darts Flinoise</title>
      <PageHeader eyebrow="Le club" title="Qui sommes-nous ?">
        {club.presentation.map((paragraph) => (
          <p key={paragraph} className="lead">
            {paragraph}
          </p>
        ))}
      </PageHeader>

      <section className="section" aria-labelledby="titre-horaires">
        <h2 id="titre-horaires" className={`display display-md ${styles.heading}`}>
          Horaires
        </h2>
        <ul className={styles.slots}>
          {club.sessions.map((session) => (
            <li key={session.day} className={styles.slot}>
              <strong>{session.day}</strong>
              <span>
                {session.start} – {session.end}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="section" aria-label="La vie du club">
        <div className={styles.pillars}>
          {club.pillars.map((pillar) => (
            <article key={pillar.title} className={styles.pillar}>
              <h3>{pillar.title}</h3>
              <p>{pillar.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <article className={`card stack ${styles.venue}`} aria-labelledby="titre-lieu">
          <p className="eyebrow">Où nous trouver</p>
          <h2 id="titre-lieu" className="display display-md">
            {club.venue.name}
          </h2>
          <address className={styles.address}>
            {club.venue.street}
            <br />
            {club.venue.city}
          </address>
          <div className="btn-row">
            <a className="btn btn-ghost" href={club.venue.mapsUrl} target="_blank" rel="noreferrer">
              Itinéraire
            </a>
          </div>
        </article>
      </section>
    </div>
  );
}
