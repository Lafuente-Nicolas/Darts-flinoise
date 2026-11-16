import { Link, NavLink } from 'react-router';
import { NAV_ITEMS } from '@/app/navigation';
import logoUrl from '@/assets/logo.webp';
import { club } from '@/content/club';
import styles from './Header.module.css';

export function Header() {
  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        <Link to="/" className={styles.brand}>
          <img src={logoUrl} alt="" width={40} height={39} />
          <span>{club.name}</span>
        </Link>
        <nav className={styles.nav} aria-label="Menu principal">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={styles.link}>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
