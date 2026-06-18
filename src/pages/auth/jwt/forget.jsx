import { Helmet } from 'react-helmet-async';
import { useParams } from 'react-router';

import { JWTForgotPasswordView } from 'src/sections/auth/jwt';

// ----------------------------------------------------------------------

export default function LoginPage() {
    const params = useParams();
  
  return (
    <>
      <Helmet>
        <title> Jwt: Forgot Password</title>
      </Helmet>

      <JWTForgotPasswordView urlData={params} />
    </>
  );
}
