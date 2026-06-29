import { lazy, Suspense } from 'react';
import { Outlet } from 'react-router-dom';

import { AuthGuard } from 'src/auth/guard';
import DashboardLayout from 'src/layouts/dashboard';

import { LoadingScreen } from 'src/components/loading-screen';
import RoleGuard from 'src/auth/guard/RoleGuard';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import SupplierListPage from 'src/pages/dashboard/Supplier/list';
import SupplierNewPage from 'src/pages/dashboard/Supplier/new';
import SupplierEditPage from 'src/pages/dashboard/Supplier/edit';

// ----------------------------------------------------------------------

// Lazy-loaded components
const SupplierPublicOnboardingPage = lazy(() => import('src/pages/SupplierForm'));
const IndexPage = lazy(() => import('src/pages/dashboard/app'));

// const UserAccountPage = lazy(() => import('src/pages/dashboard/user/account'));


export const dashboardRoutes = [

  {
    path: 'supplier-onboarding',
    element: (
      <Suspense fallback={<LoadingScreen />}>
        <SupplierPublicOnboardingPage />
      </Suspense>
    ),
  },
  {
    path: 'app',
    element: (
      <AuthGuard>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DashboardLayout>
            <Suspense fallback={<LoadingScreen />}>
              <Outlet />
            </Suspense>
          </DashboardLayout>
        </LocalizationProvider>
      </AuthGuard>
    ),
    children: [
      {
        element: (
          <Suspense fallback={<LoadingScreen />}>
            <IndexPage />
          </Suspense>
        ),
        index: true,
      },
      {
        path: 'onboarding/suppliers',
        children: [
          {
            element: (
              <Suspense fallback={<LoadingScreen />}>
                <SupplierListPage />
              </Suspense>
            ),
            index: true,
          },
          {
            path: 'new',
            element: (
              <Suspense fallback={<LoadingScreen />}>
                <SupplierNewPage />
              </Suspense>
            ),
          },
          {
            path: 'edit/:GRNID',
            element: (
              <Suspense fallback={<LoadingScreen />}>
                <SupplierEditPage />
              </Suspense>
            ),
          },

        ],
      },

      // admin
      // {
      //   path: 'admin',
      //   element: (
      //     <RoleGuard allowedRoles={[70, 80, 898]}>
      //       <Outlet />
      //     </RoleGuard>
      //   ),
      //   children: [

      //     {
      //       path: 'vendor',
      //       element: (
      //         <RoleGuard
      //           allowedRoles={[63, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 66, 70]}
      //         >
      //           <Outlet />
      //         </RoleGuard>
      //       ),
      //       children: [
      //         {
      //           element: (
      //             <Suspense fallback={<LoadingScreen />}>
      //               <VendorListPage />
      //             </Suspense>
      //           ),
      //           index: true,
      //         },
      //         {
      //           path: 'new',
      //           element: (
      //             <Suspense fallback={<LoadingScreen />}>
      //               <VendorNewPage />
      //             </Suspense>
      //           ),
      //         },
      //         {
      //           path: 'edit/:vendorID/',
      //           element: (
      //             <Suspense fallback={<LoadingScreen />}>
      //               <VendorEditPage />
      //             </Suspense>
      //           ),
      //         },
      //       ],
      //     },
      //     {
      //       path: 'user',
      //       children: [
      //         {
      //           element: (
      //             <Suspense fallback={<LoadingScreen />}>
      //               <UserListPage />
      //             </Suspense>
      //           ),
      //           index: true,
      //         },
      //         {
      //           path: 'new',
      //           element: (
      //             <Suspense fallback={<LoadingScreen />}>
      //               <UserCreatePage />
      //             </Suspense>
      //           ),
      //         },
      //         {
      //           path: ':id/edit',
      //           element: (
      //             <Suspense fallback={<LoadingScreen />}>
      //               <UserEditPage />
      //             </Suspense>
      //           ),
      //         },
      //         {
      //           path: 'profile',
      //           element: (
      //             <Suspense fallback={<LoadingScreen />}>
      //               <UserProfilePage />
      //             </Suspense>
      //           ),
      //         },
      //         {
      //           path: 'cards',
      //           element: (
      //             <Suspense fallback={<LoadingScreen />}>
      //               <UserCardsPage />
      //             </Suspense>
      //           ),
      //         },
      //         {
      //           path: 'account',
      //           element: (
      //             <Suspense fallback={<LoadingScreen />}>
      //               <UserAccountPage />
      //             </Suspense>
      //           ),
      //         },
      //       ],
      //     },
      //   ]},

    ],
  },
];
