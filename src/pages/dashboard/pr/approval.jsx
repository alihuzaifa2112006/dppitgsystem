import { useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useParams } from 'react-router';
import { decrypt } from 'src/api/encryption';
import { paths } from 'src/routes/paths';
import PrApprovalView from 'src/sections/pr/view/pr-approval-view';


// ----------------------------------------------------------------------

export default function PrApprovalPage() {
  const params = useParams();

  return (
    <>
      <Helmet>
        <title> Purchase Request: Approval</title>
      </Helmet>

      <PrApprovalView urlData={params} />
    </>
  );
}
