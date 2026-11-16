import { lazy, Suspense, useRef, useState } from 'react';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import logoUrl from '@/assets/logo.webp';
import { useInView } from '@/hooks/useInView';
import { usePageVisible } from '@/hooks/usePageVisible';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import styles from './DartStage.module.css';

// three.js (~150 ko compressés) n'est téléchargé qu'ici, après l'affichage de la page.
const DartScene = lazy(() => import('./DartScene'));

/** Les connexions en mode « économie de données » et les navigateurs sans WebGL voient le logo. */
function canRender3d(): boolean {
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  if (connection?.saveData) return false;
  return typeof WebGLRenderingContext !== 'undefined';
}

export function DartStage({ className = '' }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  const pageVisible = usePageVisible();
  const reducedMotion = usePrefersReducedMotion();
  const [enabled] = useState(canRender3d);

  const fallback = (
    <img
      className={styles.fallback}
      src={logoUrl}
      alt="Logo Darts Flinoise"
      width={512}
      height={500}
    />
  );

  return (
    <div ref={ref} className={`${styles.stage} ${className}`}>
      {enabled ? (
        <>
          <ErrorBoundary fallback={fallback}>
            <Suspense fallback={fallback}>
              <DartScene active={inView && pageVisible} reducedMotion={reducedMotion} />
            </Suspense>
          </ErrorBoundary>
          <p className={styles.hint} aria-hidden="true">
            Glissez pour faire tourner
          </p>
        </>
      ) : (
        fallback
      )}
    </div>
  );
}
