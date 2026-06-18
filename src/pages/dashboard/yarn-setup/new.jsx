import { useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router';
import { decrypt } from 'src/api/encryption';
import { paths } from 'src/routes/paths';
import { YarnSetupNewView } from 'src/sections/yarn-setup/view';

// ----------------------------------------------------------------------

export default function YarnSetupNewPage() {

  return (
    <>
      <Helmet>
        <title> Yarn Module: Yarn Setup Add</title>
      </Helmet>

      <YarnSetupNewView />
    </>
  );
}
