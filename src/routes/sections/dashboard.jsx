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
import RegulationsListPage from 'src/pages/dashboard/Regulations/list';
import RegulationsNewPage from 'src/pages/dashboard/Regulations/new';
import CustomerListPage from '../../pages/dashboard/Customer/list';
import CustomerNewPage from '../../pages/dashboard/Customer/new';
import CustomerDetailPage from 'src/pages/dashboard/Customer/view';
import CustomerEditPage from 'src/pages/dashboard/Customer/edit';

// ----------------------------------------------------------------------

// Lazy-loaded components
const SupplierPublicOnboardingPage = lazy(() => import('src/pages/SupplierForm'));
const IndexPage = lazy(() => import('src/pages/dashboard/app'));
const CompanyDatabaseNewPage = lazy(() => import('src/pages/dashboard/CompanyDatabase/new'));
const SettingsPage = lazy(() => import('src/pages/dashboard/Settings/index'));

// const UserAccountPage = lazy(() => import('src/pages/dashboard/user/account'));


const OfficeListPage = lazy(() => import('src/pages/dashboard/Powertool/Office/list'));
const OfficeNewPage = lazy(() => import('src/pages/dashboard/Powertool/Office/new'));
const OfficeEditPage = lazy(() => import('src/pages/dashboard/Powertool/Office/edit'));
const FactoryListPage = lazy(() => import('src/pages/dashboard/Powertool/Factory/list'));
const FactoryNewPage = lazy(() => import('src/pages/dashboard/Powertool/Factory/new'));
const FactoryEditPage = lazy(() => import('src/pages/dashboard/Powertool/Factory/edit'));
const TransactionTypeListPage = lazy(() => import('src/pages/dashboard/Powertool/TransactionType/list'));
const TransactionTypeNewPage = lazy(() => import('src/pages/dashboard/Powertool/TransactionType/new'));
const TransactionTypeEditPage = lazy(() => import('src/pages/dashboard/Powertool/TransactionType/edit'));
const PaymentTermListPage = lazy(() => import('src/pages/dashboard/Powertool/PaymentTerm/list'));
const PaymentTermNewPage = lazy(() => import('src/pages/dashboard/Powertool/PaymentTerm/new'));
const PaymentTermEditPage = lazy(() => import('src/pages/dashboard/Powertool/PaymentTerm/edit'));
const PaymentModeListPage = lazy(() => import('src/pages/dashboard/Powertool/PaymentMode/list'));
const PaymentModeNewPage = lazy(() => import('src/pages/dashboard/Powertool/PaymentMode/new'));
const PaymentModeEditPage = lazy(() => import('src/pages/dashboard/Powertool/PaymentMode/edit'));
const IncotermListPage = lazy(() => import('src/pages/dashboard/Powertool/Incoterm/list'));
const IncotermNewPage = lazy(() => import('src/pages/dashboard/Powertool/Incoterm/new'));
const IncotermEditPage = lazy(() => import('src/pages/dashboard/Powertool/Incoterm/edit'));
const TransportModeListPage = lazy(() => import('src/pages/dashboard/Powertool/TransportMode/list'));
const TransportModeNewPage = lazy(() => import('src/pages/dashboard/Powertool/TransportMode/new'));
const TransportModeEditPage = lazy(() => import('src/pages/dashboard/Powertool/TransportMode/edit'));
const CompositionListPage = lazy(() => import('src/pages/dashboard/Powertool/Composition/list'));
const CompositionNewPage = lazy(() => import('src/pages/dashboard/Powertool/Composition/new'));
const CompositionEditPage = lazy(() => import('src/pages/dashboard/Powertool/Composition/edit'));
const BankListPage = lazy(() => import('src/pages/dashboard/Powertool/Bank/list'));
const BankNewPage = lazy(() => import('src/pages/dashboard/Powertool/Bank/new'));
const BankEditPage = lazy(() => import('src/pages/dashboard/Powertool/Bank/edit'));
const LocationListPage = lazy(() => import('src/pages/dashboard/Powertool/Location/list'));
const LocationNewPage = lazy(() => import('src/pages/dashboard/Powertool/Location/new'));
const LocationEditPage = lazy(() => import('src/pages/dashboard/Powertool/Location/edit'));
const BuyingDepartmentListPage = lazy(() => import('src/pages/dashboard/Powertool/BuyingDepartment/list'));
const BuyingDepartmentNewPage = lazy(() => import('src/pages/dashboard/Powertool/BuyingDepartment/new'));
const BuyingDepartmentEditPage = lazy(() => import('src/pages/dashboard/Powertool/BuyingDepartment/edit'));

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
      {
        path: 'powertool/customers',
        children: [
          {
            element: (
              <Suspense fallback={<LoadingScreen />}>
                <CustomerListPage />
              </Suspense>
            ),
            index: true,
          },
          {
            path: 'new',
            element: (
              <Suspense fallback={<LoadingScreen />}>
                <CustomerNewPage />
              </Suspense>
            ),
          },
          {
            path: 'view/:id',
            element: (
              <Suspense fallback={<LoadingScreen />}>
                <CustomerDetailPage />
              </Suspense>
            ),
          },
          {
            path: 'edit/:id',
            element: (
              <Suspense fallback={<LoadingScreen />}>
                <CustomerEditPage />
              </Suspense>
            ),
          },
        ],
      },
      {
        path: 'powertool/offices',
        children: [
          {
            element: (
              <Suspense fallback={<LoadingScreen />}>
                <OfficeListPage />
              </Suspense>
            ),
            index: true,
          },
          {
            path: 'new',
            element: (
              <Suspense fallback={<LoadingScreen />}>
                <OfficeNewPage />
              </Suspense>
            ),
          },
          {
            path: 'edit/:id',
            element: (
              <Suspense fallback={<LoadingScreen />}>
                <OfficeEditPage />
              </Suspense>
            ),
          },
        ],
      },
      {
        path: 'powertool/factories',
        children: [
          {
            element: (
              <Suspense fallback={<LoadingScreen />}>
                <FactoryListPage />
              </Suspense>
            ),
            index: true,
          },
          {
            path: 'new',
            element: (
              <Suspense fallback={<LoadingScreen />}>
                <FactoryNewPage />
              </Suspense>
            ),
          },
          {
            path: 'edit/:id',
            element: (
              <Suspense fallback={<LoadingScreen />}>
                <FactoryEditPage />
              </Suspense>
            ),
          },
        ],
      },
      {
        path: 'powertool/transaction-types',
        children: [
          {
            element: (
              <Suspense fallback={<LoadingScreen />}>
                <TransactionTypeListPage />
              </Suspense>
            ),
            index: true,
          },
          {
            path: 'new',
            element: (
              <Suspense fallback={<LoadingScreen />}>
                <TransactionTypeNewPage />
              </Suspense>
            ),
          },
          {
            path: 'edit/:id',
            element: (
              <Suspense fallback={<LoadingScreen />}>
                <TransactionTypeEditPage />
              </Suspense>
            ),
          },
        ],
      },
      {
        path: 'powertool/payment-terms',
        children: [
          {
            element: (
              <Suspense fallback={<LoadingScreen />}>
                <PaymentTermListPage />
              </Suspense>
            ),
            index: true,
          },
          {
            path: 'new',
            element: (
              <Suspense fallback={<LoadingScreen />}>
                <PaymentTermNewPage />
              </Suspense>
            ),
          },
          {
            path: 'edit/:id',
            element: (
              <Suspense fallback={<LoadingScreen />}>
                <PaymentTermEditPage />
              </Suspense>
            ),
          },
        ],
      },
      {
        path: 'powertool/payment-modes',
        children: [
          {
            element: (
              <Suspense fallback={<LoadingScreen />}>
                <PaymentModeListPage />
              </Suspense>
            ),
            index: true,
          },
          {
            path: 'new',
            element: (
              <Suspense fallback={<LoadingScreen />}>
                <PaymentModeNewPage />
              </Suspense>
            ),
          },
          {
            path: 'edit/:id',
            element: (
              <Suspense fallback={<LoadingScreen />}>
                <PaymentModeEditPage />
              </Suspense>
            ),
          },
        ],
      },
      {
        path: 'powertool/incoterms',
        children: [
          {
            element: (
              <Suspense fallback={<LoadingScreen />}>
                <IncotermListPage />
              </Suspense>
            ),
            index: true,
          },
          {
            path: 'new',
            element: (
              <Suspense fallback={<LoadingScreen />}>
                <IncotermNewPage />
              </Suspense>
            ),
          },
          {
            path: 'edit/:id',
            element: (
              <Suspense fallback={<LoadingScreen />}>
                <IncotermEditPage />
              </Suspense>
            ),
          },
        ],
      },
      {
        path: 'powertool/transport-modes',
        children: [
          {
            element: (
              <Suspense fallback={<LoadingScreen />}>
                <TransportModeListPage />
              </Suspense>
            ),
            index: true,
          },
          {
            path: 'new',
            element: (
              <Suspense fallback={<LoadingScreen />}>
                <TransportModeNewPage />
              </Suspense>
            ),
          },
          {
            path: 'edit/:id',
            element: (
              <Suspense fallback={<LoadingScreen />}>
                <TransportModeEditPage />
              </Suspense>
            ),
          },
        ],
      },
      {
        path: 'powertool/composition',
        children: [
          {
            element: (
              <Suspense fallback={<LoadingScreen />}>
                <CompositionListPage />
              </Suspense>
            ),
            index: true,
          },
          {
            path: 'new',
            element: (
              <Suspense fallback={<LoadingScreen />}>
                <CompositionNewPage />
              </Suspense>
            ),
          },
          {
            path: 'edit/:id',
            element: (
              <Suspense fallback={<LoadingScreen />}>
                <CompositionEditPage />
              </Suspense>
            ),
          },
        ],
      },
        {
        path: 'powertool/locations',
        children: [
          {
            element: (
              <Suspense fallback={<LoadingScreen />}>
                <LocationListPage />
              </Suspense>
            ),
            index: true,
          },
          {
            path: 'new',
            element: (
              <Suspense fallback={<LoadingScreen />}>
                <LocationNewPage />
              </Suspense>
            ),
          },
          {
            path: 'edit/:id',
            element: (
              <Suspense fallback={<LoadingScreen />}>
                <LocationEditPage />
              </Suspense>
            ),
          },
        ],
      },
      {
        path: 'powertool/buying-departments',
        children: [
          {
            element: (
              <Suspense fallback={<LoadingScreen />}>
                <BuyingDepartmentListPage />
              </Suspense>
            ),
            index: true,
          },
          {
            path: 'new',
            element: (
              <Suspense fallback={<LoadingScreen />}>
                <BuyingDepartmentNewPage />
              </Suspense>
            ),
          },
          {
            path: 'edit/:id',
            element: (
              <Suspense fallback={<LoadingScreen />}>
                <BuyingDepartmentEditPage />
              </Suspense>
            ),
          },
        ],
      },
      {
        path: 'powertool/banks',
        children: [
          {
            element: (
              <Suspense fallback={<LoadingScreen />}>
                <BankListPage />
              </Suspense>
            ),
            index: true,
          },
          {
            path: 'new',
            element: (
              <Suspense fallback={<LoadingScreen />}>
                <BankNewPage />
              </Suspense>
            ),
          },
          {
            path: 'edit/:id',
            element: (
              <Suspense fallback={<LoadingScreen />}>
                <BankEditPage />
              </Suspense>
            ),
          },
        ],
      },
      {
        path: 'regulations',
        children: [
          {
            element: (
              <Suspense fallback={<LoadingScreen />}>
                <RegulationsListPage />
              </Suspense>
            ),
            index: true,
          },
          {
            path: 'new',
            element: (
              <Suspense fallback={<LoadingScreen />}>
                <RegulationsNewPage />
              </Suspense>
            ),
          },
        ],
      },
      {
        path: 'company-database',
        children: [
          {
            path: 'new',
            element: (
              <Suspense fallback={<LoadingScreen />}>
                <CompanyDatabaseNewPage />
              </Suspense>
            ),
          },
        ],
      },
      {
        path: 'settings',
        element: (
          <Suspense fallback={<LoadingScreen />}>
            <SettingsPage />
          </Suspense>
        ),
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
