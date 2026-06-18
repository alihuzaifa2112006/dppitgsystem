import { Helmet } from 'react-helmet-async';
import { useParams } from 'react-router';

import { JWTVerifyView } from 'src/sections/auth/jwt';

// ----------------------------------------------------------------------

export default function LoginPage() {
  const params = useParams();

  return (
    <>
      <Helmet>
        <title> Jwt: Verify</title>
      </Helmet>

      <JWTVerifyView urlData={params} />
    </>
  );
}
