import { useMutation } from '@tanstack/react-query';
import { useId, useState, type FormEvent } from 'react';
import { LockIcon } from '@/components/icons';
import { getSignInErrorMessage, signIn } from '@/features/auth/api';
import styles from './Admin.module.css';

export function LoginForm() {
  const id = useId();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const mutation = useMutation({ mutationFn: signIn });

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    mutation.mutate({ email, password });
  };

  return (
    <form className={`card stack ${styles.narrow}`} onSubmit={onSubmit}>
      <div className={styles.lockBadge} aria-hidden="true">
        <LockIcon />
      </div>
      <h2 className="display display-md">Connexion</h2>
      <p className="lead">Réservé aux administrateurs du club.</p>

      <label className="field" htmlFor={`${id}-email`}>
        E-mail
        <input
          id={`${id}-email`}
          className="input"
          type="email"
          inputMode="email"
          autoComplete="username"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </label>

      <label className="field" htmlFor={`${id}-password`}>
        Mot de passe
        <input
          id={`${id}-password`}
          className="input"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </label>

      <div className="btn-row">
        <button className="btn btn-primary" type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? 'Connexion…' : 'Se connecter'}
        </button>
      </div>

      <p className="status-text is-error" role="alert">
        {mutation.isError ? getSignInErrorMessage(mutation.error) : ''}
      </p>
    </form>
  );
}
