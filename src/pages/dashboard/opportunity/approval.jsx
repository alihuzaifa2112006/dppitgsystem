import { useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router';
import { decrypt } from 'src/api/encryption';
import { paths } from 'src/routes/paths';
import { useParams } from 'src/routes/hooks';
import { OpportunityApprovalView } from 'src/sections/opportunity/view';


// ----------------------------------------------------------------------

export default function OpportunityApprovalPage() {
  const params = useParams();

  return (
    <>
      <Helmet>
        <title> Opportunity Approval</title>
      </Helmet>

      <OpportunityApprovalView urlData={params} />
    </>
  );
}
