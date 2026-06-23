import { useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation, useNavigate } from 'react-router';
import { decrypt } from 'src/api/encryption';
import { paths } from 'src/routes/paths';

import { OverviewAppView } from 'src/sections/overview/app/view';
import { decodeJWT } from 'aws-amplify/auth';
import { useRouter } from 'src/routes/hooks';

const loginPaths = {
  jwt: paths.auth.jwt.login,
};
// ----------------------------------------------------------------------

export default function OverviewAppPage() {
  const method = 'jwt';

  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);
  const location = useLocation();
  const router = useRouter();


  const checkExpiry = () => {
    if (userData) {
      const token = userData?.token || userData?.accessToken;
      if (!token) return; // Prevent crashing if token doesn't exist

      try {
        const parsedToken = decodeJWT(token);
        const exp = parsedToken?.payload?.exp;
        let shouldLogout = false;

        if (exp) {
          const currentTimeInSeconds = Math.floor(Date.now() / 1000);
          if (currentTimeInSeconds >= exp) {
            shouldLogout = true; // token expired
          } else {
            shouldLogout = false;
          }
        }
        if (shouldLogout) {
          const searchParams = new URLSearchParams({
            returnTo: window.location.pathname,
          }).toString();

          const loginPath = loginPaths[method];
          const href = `${loginPath}?${searchParams}`;
          router.replace(href);
          localStorage.removeItem('UserData');
          localStorage.removeItem('loginTime');
        }
      } catch (error) {
        console.error('Invalid token format:', error);
      }
    }
  };
  useEffect(() => {
    checkExpiry();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);
  return (
    <>
      <Helmet>
        <title>DDP | Digital Product Passport</title>
      </Helmet>

      <OverviewAppView />
    </>
  );
}
