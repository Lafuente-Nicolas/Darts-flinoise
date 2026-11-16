import { Link } from 'react-router';
import { LockIcon } from '@/components/icons';
import { club } from '@/content/club';
import styles from './Footer.module.css';

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <p>
          © {new Date().getFullYear()} {club.name} · {club.tagline} · {club.venue.name}
        </p>
        <Link to="/admin" className={styles.admin} aria-label="Espace administrateur">
          <LockIcon className={styles.icon} />
          Admin
        </Link>
      </div>
    </footer>
  );
}
