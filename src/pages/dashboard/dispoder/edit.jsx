import { useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router';
import { decrypt } from 'src/api/encryption';
import { paths } from 'src/routes/paths';
import { useParams } from 'src/routes/hooks';

import { DispoderEditView } from 'src/sections/dispoder/view';

// ----------------------------------------------------------------------

export default function DispoderEditPage() {
  const params = useParams();

  return (
    <>
      <Helmet>
        <title> Dispoder Edit</title>
      </Helmet>

      <DispoderEditView urlData={params} />
    </>
  );
}
