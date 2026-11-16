import { createBrowserRouter } from 'react-router';
import { AppLayout } from '@/components/layout/AppLayout';
import { RouteError } from '@/components/layout/RouteError';
import { ClubPage } from '@/pages/ClubPage';
import { HomePage } from '@/pages/HomePage';
import { NewsPage } from '@/pages/NewsPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { RankingPage } from '@/pages/RankingPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    errorElement: <RouteError />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'actus', element: <NewsPage /> },
      { path: 'classement', element: <RankingPage /> },
      { path: 'club', element: <ClubPage /> },
      {
        // L'espace admin (connexion, import Excel) n'est téléchargé que s'il est ouvert.
        path: 'admin',
        lazy: async () => {
          const { AdminPage } = await import('@/pages/AdminPage');
          return { Component: AdminPage };
        },
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
