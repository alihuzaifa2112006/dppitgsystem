import { Helmet } from 'react-helmet-async';
import { JwtRegisterOrgView } from 'src/sections/auth/jwt';


// ----------------------------------------------------------------------

export default function RegisterPage() {
  return (
    <>
      <Helmet>
        <title>Registration | Digital Product Passport</title>
      </Helmet>

      <JwtRegisterOrgView />
    </>
  );
}
