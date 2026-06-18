import { useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router';
import { decrypt } from 'src/api/encryption';
import { paths } from 'src/routes/paths';
import { useParams } from 'src/routes/hooks';

import { YarnContractEditView } from 'src/sections/yarn-contract/view';

// ----------------------------------------------------------------------

export default function YarnContractEditPage() {
  const params = useParams();

  return (
    <>
      <Helmet>
        <title> Yarn Module: Yarn Contract Edit</title>
      </Helmet>

      <YarnContractEditView urlData={params} />
    </>
  );
}
