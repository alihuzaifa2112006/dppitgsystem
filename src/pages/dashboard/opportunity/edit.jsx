import { useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router';
import { decrypt } from 'src/api/encryption';
import { paths } from 'src/routes/paths';
import { useParams } from 'src/routes/hooks';

import { OpportunityEditView } from 'src/sections/opportunity/view';

// ----------------------------------------------------------------------

export default function OpportunityEditPage() {
  const params = useParams();

  return (
    <>
      <Helmet>
        <title> Opportunity Edit</title>
      </Helmet>

      <OpportunityEditView urlData={params} />
    </>
  );
}
