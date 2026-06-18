import { useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router';
import { decrypt } from 'src/api/encryption';
import { paths } from 'src/routes/paths';
import { OpportunityNewView } from 'src/sections/opportunity/view';

// ----------------------------------------------------------------------

export default function OpportunityNewPage() {

  return (
    <>
      <Helmet>
        <title> Opportunity Add</title>
      </Helmet>

      <OpportunityNewView />
    </>
  );
}
