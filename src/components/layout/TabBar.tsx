import { NavLink } from 'react-router';
import { NAV_ITEMS } from '@/app/navigation';
import styles from './TabBar.module.css';

/** Barre d'onglets fixée en bas de l'écran, à portée de pouce sur téléphone. */
export function TabBar() {
  return (
    <nav className={styles.tabbar} aria-label="Menu principal">
      <ul className={styles.list}>
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <li key={to}>
            <NavLink to={to} end={end} className={styles.tab}>
              <Icon className={styles.icon} />
              <span>{label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
