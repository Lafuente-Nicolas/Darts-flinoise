import { useQuery } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { AdminDashboard } from '@/features/admin/AdminDashboard';
import { LoginForm } from '@/features/admin/LoginForm';
import { SignOutButton } from '@/features/admin/SignOutButton';
import { isAdminQuery } from '@/features/auth/api';
import { AuthProvider } from '@/features/auth/AuthProvider';
import { useAuth } from '@/features/auth/useAuth';
import styles from '@/features/admin/Admin.module.css';

export function AdminPage() {
  return (
    <div className="container">
      <title>Administration · Darts Flinoise</title>
      <meta name="robots" content="noindex, nofollow" />
      <PageHeader eyebrow="Espace réservé" title="Administration" />
      <AuthProvider>
        <AdminGate />
      </AuthProvider>
    </div>
  );
}

function AdminGate() {
  const { status, user } = useAuth();
  const isAdmin = useQuery(isAdminQuery(user?.id));

  if (status === 'unconfigured') {
    return (
      <Notice title="Connexion indisponible">
        La base de données du club n’est pas encore branchée à ce site.
      </Notice>
    );
  }

  if (status === 'loading' || (user && isAdmin.isPending)) {
    return (
      <div className={styles.loading} aria-busy="true">
        <span className="spinner" aria-hidden="true" />
        <span>Vérification de votre compte…</span>
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  if (isAdmin.isError) {
    return (
      <Notice title="Vérification impossible" action={<SignOutButton />}>
        Les droits de ce compte n’ont pas pu être vérifiés. Rechargez la page.
      </Notice>
    );
  }

  if (!isAdmin.data) {
    return (
      <Notice title="Accès refusé" action={<SignOutButton />}>
        Le compte {user.email} n’est pas administrateur du club.
      </Notice>
    );
  }

  return <AdminDashboard email={user.email ?? ''} />;
}

function Notice({
  title,
  children,
  action,
}: {
  title: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <section className={`card stack ${styles.narrow}`} role="status">
      <h2 className="display display-md">{title}</h2>
      <p className="lead">{children}</p>
      {action && <div className="btn-row">{action}</div>}
    </section>
  );
}
