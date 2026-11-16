import { useId, useRef, useState, type KeyboardEvent } from 'react';
import { PostEditor } from './PostEditor';
import { PostsManager } from './PostsManager';
import { RankingImport } from './RankingImport';
import { SignOutButton } from './SignOutButton';
import styles from './Admin.module.css';

const TABS = [
  { key: 'publish', label: 'Publier' },
  { key: 'posts', label: 'Gérer les actus' },
  { key: 'ranking', label: 'Classement' },
] as const;

type TabKey = (typeof TABS)[number]['key'];

export function AdminDashboard({ email }: { email: string }) {
  const id = useId();
  const [active, setActive] = useState<TabKey>('publish');
  const tabRefs = useRef<Partial<Record<TabKey, HTMLButtonElement | null>>>({});

  // Navigation au clavier entre les onglets (flèches, Début, Fin).
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const index = TABS.findIndex((t) => t.key === active);
    const moves: Record<string, number> = {
      ArrowRight: (index + 1) % TABS.length,
      ArrowLeft: (index - 1 + TABS.length) % TABS.length,
      Home: 0,
      End: TABS.length - 1,
    };
    const next = TABS[moves[event.key] ?? -1];
    if (!next) return;
    event.preventDefault();
    setActive(next.key);
    tabRefs.current[next.key]?.focus();
  };

  return (
    <div className="stack">
      <div className={styles.session}>
        <p>
          Connecté : <strong>{email}</strong>
        </p>
        <SignOutButton />
      </div>

      <div
        className={styles.tabs}
        role="tablist"
        aria-label="Outils d’administration"
        onKeyDown={onKeyDown}
      >
        {TABS.map((tab) => (
          <button
            key={tab.key}
            ref={(el) => {
              tabRefs.current[tab.key] = el;
            }}
            id={`${id}-tab-${tab.key}`}
            type="button"
            role="tab"
            aria-selected={active === tab.key}
            aria-controls={`${id}-panel-${tab.key}`}
            tabIndex={active === tab.key ? 0 : -1}
            className={styles.tab}
            onClick={() => setActive(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {TABS.map((tab) => (
        <div
          key={tab.key}
          id={`${id}-panel-${tab.key}`}
          role="tabpanel"
          aria-labelledby={`${id}-tab-${tab.key}`}
          hidden={active !== tab.key}
          className={styles.panel}
        >
          {active === tab.key && tab.key === 'publish' && <PostEditor />}
          {active === tab.key && tab.key === 'posts' && <PostsManager />}
          {active === tab.key && tab.key === 'ranking' && <RankingImport />}
        </div>
      ))}
    </div>
  );
}
