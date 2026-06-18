import { lazy, Suspense } from 'react';
import { Outlet } from 'react-router-dom';

import MainLayout from 'src/layouts/main';
import SimpleLayout from 'src/layouts/simple';
import CompactLayout from 'src/layouts/compact';

import { SplashScreen } from 'src/components/loading-screen';
import DashboardLayout from 'src/layouts/dashboard';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

// ----------------------------------------------------------------------
const Page500 = lazy(() => import('src/pages/500'));
const Page403 = lazy(() => import('src/pages/403'));
const Page404 = lazy(() => import('src/pages/404'));

const CustomerOnboardingPage = lazy(() => import('src/pages/dashboard/CustomerOnboardingPage'));
const CertificateUploadPage = lazy(() => import('src/pages/dashboard/CertificateUploadPage'));

const ComplaintRegistrationPage = lazy(() => import('src/pages/customer-complaint-page'));

// ----------------------------------------------------------------------

export const mainRoutes = [
  {
    element: (
      <SimpleLayout>
        <Suspense fallback={<SplashScreen />}>
          <Outlet />
        </Suspense>
      </SimpleLayout>
    ),
    children: [{ path: 'complaint-registration-form/:id', element: <ComplaintRegistrationPage /> }],
  },
  {
    element: (
      <CompactLayout>
        <Suspense fallback={<SplashScreen />}>
          <Outlet />
        </Suspense>
      </CompactLayout>
    ),
    children: [
      { path: '500', element: <Page500 /> },
      { path: '404', element: <Page404 /> },
      { path: '403', element: <Page403 /> },
    ],
  },
  {
    element: (
      <MainLayout>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Suspense fallback={<SplashScreen />}>
            <Outlet />
          </Suspense>
        </LocalizationProvider>
      </MainLayout>
    ),
    children: [
      { path: 'customer-onboarding/:id/', element: <CustomerOnboardingPage /> },
      { path: 'customer-certificate/:id/', element: <CertificateUploadPage /> },
    ],
  },
];
