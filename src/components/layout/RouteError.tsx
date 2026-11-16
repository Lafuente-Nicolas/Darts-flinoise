import { Link, isRouteErrorResponse, useRouteError } from 'react-router';

/** Affiché si une page plante ou si le code de l'espace admin ne se charge pas. */
export function RouteError() {
  const error = useRouteError();
  const notFound = isRouteErrorResponse(error) && error.status === 404;

  return (
    <div className="container section stack" role="alert">
      <title>Erreur · Darts Flinoise</title>
      <p className="eyebrow">Oups</p>
      <h1 className="display display-lg">
        {notFound ? 'Page introuvable' : 'Cette page n’a pas pu s’afficher'}
      </h1>
      <p className="lead">
        {notFound
          ? 'Le lien est peut-être ancien.'
          : 'Rechargez la page. Si le problème continue, revenez à l’accueil.'}
      </p>
      <div className="btn-row">
        <Link className="btn btn-primary" to="/">
          Retour à l’accueil
        </Link>
      </div>
    </div>
  );
}
