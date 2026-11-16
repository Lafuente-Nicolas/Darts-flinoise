import { Outlet, ScrollRestoration } from 'react-router';
import { Footer } from './Footer';
import { Header } from './Header';
import { TabBar } from './TabBar';
import styles from './AppLayout.module.css';

export function AppLayout() {
  return (
    <>
      <a className="skip-link" href="#contenu">
        Aller au contenu
      </a>
      <Header />
      <main id="contenu" className={styles.main} tabIndex={-1}>
        <Outlet />
      </main>
      <Footer />
      <TabBar />
      <ScrollRestoration />
    </>
  );
}
