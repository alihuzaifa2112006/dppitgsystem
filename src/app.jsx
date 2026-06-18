/* eslint-disable perfectionist/sort-imports */
import 'src/global.css';

// i18n
import 'src/locales/i18n';

// ----------------------------------------------------------------------
// import { SpeedInsights } from '@vercel/speed-insights/react';

import Router from 'src/routes/sections';

import ThemeProvider from 'src/theme';

import { LocalizationProvider } from 'src/locales';
import { useRouter } from 'src/routes/hooks';

import { useScrollToTop } from 'src/hooks/use-scroll-to-top';

import ProgressBar from 'src/components/progress-bar';
import { MotionLazy } from 'src/components/animate/motion-lazy';
import SnackbarProvider from 'src/components/snackbar/snackbar-provider';
import { SettingsDrawer, SettingsProvider } from 'src/components/settings';

import { AuthProvider } from 'src/auth/context/jwt';
import { useEffect, useMemo } from 'react';

import { ModuleRegistry } from 'ag-grid-community';
import { AllEnterpriseModule, LicenseManager } from 'ag-grid-enterprise';
import { useLocation, useNavigate } from 'react-router';
import { Get } from './api/apibasemethods';
import { paths } from './routes/paths';
import { useAuthContext } from './auth/hooks';
import { decodeJWT } from 'aws-amplify/auth';

const loginPaths = {
  jwt: paths.auth.jwt.login,
};
// ----------------------------------------------------------------------

export default function App() {
  const router = useRouter();
  // const method = 'jwt';

  // const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);

  // const checkExpiry = () => {
  //   const loginTime = localStorage.getItem('loginTime');
  //   if (loginTime) {
  //     const currentTime = new Date().getTime();
  //     const timeDifference = currentTime - loginTime;
  //     const hoursDifference = timeDifference / (1000 * 60 * 60);
  //     if (hoursDifference >= 24) {
  //       router.replace('/auth/jwt/login');
  //       localStorage.removeItem('UserData');
  //       localStorage.removeItem('loginTime');
  //     }
  //   }
  // };

  // const checkExpiry = () => {
  //   if (userData) {
  //     const token = userData?.token;
  //     const parsedToken = decodeJWT(token);
  //     const exp = parsedToken?.payload?.exp;
  //     let shouldLogout = false;

  //     if (exp) {
  //       const currentTimeInSeconds = Math.floor(Date.now() / 1000);
  //       if (currentTimeInSeconds >= exp) {
  //         shouldLogout = true; // token expired
  //       } else {
  //         shouldLogout = false;
  //       }
  //     }
  //     if (shouldLogout) {
  //       const searchParams = new URLSearchParams({
  //         returnTo: window.location.pathname,
  //       }).toString();

  //       const loginPath = loginPaths[method];
  //       const href = `${loginPath}?${searchParams}`;
  //       router.replace(href);
  //       localStorage.removeItem('UserData');
  //       localStorage.removeItem('loginTime');
  //     }
  //   }
  // };

  ModuleRegistry.registerModules([AllEnterpriseModule]);
  LicenseManager.setLicenseKey(
    'Using_this_{AG_Grid}_Enterprise_key_{AG-074500}_in_excess_of_the_licence_granted_is_not_permitted___Please_report_misuse_to_legal@ag-grid.com___For_help_with_changing_this_key_please_contact_info@ag-grid.com___{ITG}_is_granted_a_{Single_Application}_Developer_License_for_the_application_{INTEGRAB2B}_only_for_{1}_Front-End_JavaScript_developer___All_Front-End_JavaScript_developers_working_on_{INTEGRAB2B}_need_to_be_licensed___{INTEGRAB2B}_has_not_been_granted_a_Deployment_License_Add-on___This_key_works_with_{AG_Grid}_Enterprise_versions_released_before_{7_January_2026}____[v3]_[01]_MTc2Nzc0NDAwMDAwMA==5178de3a49766a37d49cd920c9c41fd7'
  );

  useScrollToTop();

  const location = useLocation();
  const navigate = useNavigate();

  // useEffect(() => {
  //   checkExpiry();
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [location.pathname]);

  return (
    <AuthProvider>
      <LocalizationProvider>
        <SettingsProvider
          defaultSettings={{
            themeMode: 'light', // 'light' | 'dark'
            themeDirection: 'ltr', //  'rtl' | 'ltr'
            themeContrast: 'default', // 'default' | 'bold'
            themeLayout: 'vertical', // 'vertical' | 'horizontal' | 'mini'
            themeColorPresets: 'default', // 'default' | 'cyan' | 'purple' | 'blue' | 'orange' | 'red'
            themeStretch: true,
          }}
        >
          <ThemeProvider>
            <MotionLazy>
              <SnackbarProvider>
                <SettingsDrawer />
                <ProgressBar />
                <Router />
                {/* <SpeedInsights /> */}
              </SnackbarProvider>
            </MotionLazy>
          </ThemeProvider>
        </SettingsProvider>
      </LocalizationProvider>
    </AuthProvider>
  );
}
