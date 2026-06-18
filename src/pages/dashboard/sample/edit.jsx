import { useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router';
import { decrypt } from 'src/api/encryption';
import { paths } from 'src/routes/paths';
import { useParams } from 'src/routes/hooks';

import { SampleEditView } from 'src/sections/sample/view';

// ----------------------------------------------------------------------

export default function SampleEditPage() {
  const params = useParams();

  return (
    <>
      <Helmet>
        <title> Sample Request Edit</title>
      </Helmet>

      <SampleEditView urlData={params} />
    </>
  );
}
