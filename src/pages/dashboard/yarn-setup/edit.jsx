import { useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router';
import { decrypt } from 'src/api/encryption';
import { paths } from 'src/routes/paths';
import { useParams } from 'src/routes/hooks';

import { YarnSetupEditView } from 'src/sections/yarn-setup/view';

// ----------------------------------------------------------------------

export default function YarnSetupEditPage() {

  const params = useParams();

  return (
    <>
      <Helmet>
        <title> Yarn Module: Yarn Setup Edit</title>
      </Helmet>

      <YarnSetupEditView urlData={params} />
    </>
  );
}
