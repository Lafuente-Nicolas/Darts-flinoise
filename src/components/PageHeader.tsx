import type { ReactNode } from 'react';
import styles from './PageHeader.module.css';

interface PageHeaderProps {
  eyebrow: string;
  title: string;
  children?: ReactNode;
}

export function PageHeader({ eyebrow, title, children }: PageHeaderProps) {
  return (
    <header className={styles.header}>
      <p className="eyebrow">{eyebrow}</p>
      <h1 className="display display-lg">{title}</h1>
      {children}
    </header>
  );
}
