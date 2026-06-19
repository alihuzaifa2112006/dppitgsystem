import { lazy, Suspense } from 'react';
import { Outlet } from 'react-router-dom';

import { GuestGuard } from 'src/auth/guard';
import AuthClassicLayout from 'src/layouts/auth/classic';

import { SplashScreen } from 'src/components/loading-screen';
import MainLayout from 'src/layouts/main';

// ----------------------------------------------------------------------

// JWT
const JwtForgotPage = lazy(() => import('src/pages/auth/jwt/forget'));
const JwtVerifyPage = lazy(() => import('src/pages/auth/jwt/verify'));
const JwtNewPasswordPage = lazy(() => import('src/pages/auth/jwt/new-password'));
const JwtLoginPage = lazy(() => import('src/pages/auth/jwt/login'));
const JwtRegisterOrgPage = lazy(() => import('src/pages/auth/jwt/registerOrg'));
const JwtRegisterBranchPage = lazy(() => import('src/pages/auth/jwt/registerBranch'));

// ----------------------------------------------------------------------

const authJwt = {
  path: 'jwt',
  element: (
    <Suspense fallback={<SplashScreen />}>
      <Outlet />
    </Suspense>
  ),
  children: [
    {
      path: 'forgot',
      element: (
        <GuestGuard>
          <AuthClassicLayout>
            <JwtForgotPage />
          </AuthClassicLayout>
        </GuestGuard>
      ),
    },
    {
      path: 'verify',
      element: (
        <GuestGuard>
          <AuthClassicLayout>
            <JwtVerifyPage />
          </AuthClassicLayout>
        </GuestGuard>
      ),
    },
    {
      path: 'new-password',
      element: (
        <GuestGuard>
          <AuthClassicLayout>
            <JwtNewPasswordPage />
          </AuthClassicLayout>
        </GuestGuard>
      ),
    },
    {
      path: 'login',
      element: (
        <GuestGuard>
          <AuthClassicLayout>
            <JwtLoginPage />
          </AuthClassicLayout>
        </GuestGuard>
      ),
    },
    {
      path: 'registerOrg',
      element: (
        <GuestGuard>
          <AuthClassicLayout title="Digital Product Passport System - Company Registration">
            <JwtRegisterOrgPage />
          </AuthClassicLayout>
        </GuestGuard>
      ),
    },
    {
      path: 'registerBranch',
      element: (
        <GuestGuard>
          <MainLayout title="Manage the job more effectively with ITG">
            <JwtRegisterBranchPage />
          </MainLayout>
        </GuestGuard>
      ),
    },
  ],
};

export const authRoutes = [
  {
    path: 'auth',
    children: [authJwt],
  },
];
