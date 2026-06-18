import { useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router';
import { decrypt } from 'src/api/encryption';
import { paths } from 'src/routes/paths';
import { useParams } from 'src/routes/hooks';

import { PiEditView } from 'src/sections/pi/view';

// ----------------------------------------------------------------------

export default function PiEditPage() {
  const params = useParams();

  return (
    <>
      <Helmet>
        <title> PI Edit</title>
      </Helmet>

      <PiEditView urlData={params} />
    </>
  );
}
