import { Link } from 'react-router';

export function NotFoundPage() {
  return (
    <div className="container section stack">
      <title>Page introuvable · Darts Flinoise</title>
      <meta name="robots" content="noindex" />
      <p className="eyebrow">Raté</p>
      <h1 className="display display-lg">Hors de la cible</h1>
      <p className="lead">Cette page n’existe pas ou plus.</p>
      <div className="btn-row">
        <Link className="btn btn-primary" to="/">
          Retour à l’accueil
        </Link>
      </div>
    </div>
  );
}
