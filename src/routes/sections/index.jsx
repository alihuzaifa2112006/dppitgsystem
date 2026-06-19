import { lazy, Suspense } from 'react';
import { Navigate, useRoutes } from 'react-router-dom';

import { SplashScreen } from 'src/components/loading-screen';
import { PATH_AFTER_LOGIN } from 'src/config-global';
import { authRoutes } from './auth';
import { dashboardRoutes } from './dashboard';
import { mainRoutes } from './main';

// ----------------------------------------------------------------------

const LandingPage = lazy(() => import('src/pages/landing'));

export default function Router() {
  return useRoutes([
    // SET INDEX PAGE WITH HOME PAGE
    {
      path: '/',
      element: (
        <Suspense fallback={<SplashScreen />}>
          <LandingPage />
        </Suspense>
      ),
    },

    // ----------------------------------------------------------------------

    // SET INDEX PAGE WITH HOME PAGE
    // {
    //   path: '/',
    //   element: (
    //     <MainLayout>
    //       <HomePage />
    //     </MainLayout>
    //   ),
    // },

    // Auth routes
    ...authRoutes,

    // Dashboard routes
    ...dashboardRoutes,

    // Main routes
    ...mainRoutes,

    // No match 404
    { path: '*', element: <Navigate to="/404" replace /> },
  ]);
}
