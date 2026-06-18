import { Container } from '@mui/system';
import { Helmet } from 'react-helmet-async';
import { JwtRegisterBranchView } from 'src/sections/auth/jwt';


// ----------------------------------------------------------------------

export default function RegisterPage() {
  return (
    <>
      <Helmet>
        <title> Jwt: Register Branch</title>
      </Helmet>

      <Container  maxWidth="sm">
      <JwtRegisterBranchView />
      </Container>
    </>
  );
}
