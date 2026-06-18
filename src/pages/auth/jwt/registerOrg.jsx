import { Helmet } from 'react-helmet-async';
import { JwtRegisterOrgView } from 'src/sections/auth/jwt';


// ----------------------------------------------------------------------

export default function RegisterPage() {
  return (
    <>
      <Helmet>
        <title> Jwt: Register Org</title>
      </Helmet>

      <JwtRegisterOrgView />
    </>
  );
}
