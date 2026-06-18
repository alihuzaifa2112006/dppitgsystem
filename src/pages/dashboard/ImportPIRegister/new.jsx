import { useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router';
import { decrypt } from 'src/api/encryption';
import { paths } from 'src/routes/paths';
import { PIRegisterNewView } from 'src/sections/PIRegister/view';

// ----------------------------------------------------------------------

export default function PIRegisterNewPage() {

  return (
    <>
      <Helmet>
        <title> PI Register Add</title>
      </Helmet>

      <PIRegisterNewView />
    </>
  );
}
