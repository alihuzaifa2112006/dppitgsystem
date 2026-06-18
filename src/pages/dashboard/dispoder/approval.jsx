import { useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router';
import { decrypt } from 'src/api/encryption';
import { paths } from 'src/routes/paths';
import { useParams } from 'src/routes/hooks';
import { DispoderApprovalView } from 'src/sections/dispoder/view';


// ----------------------------------------------------------------------

export default function DispoderApprovalPage() {
  const params = useParams();

  return (
    <>
      <Helmet>
        <title> Dispoder Approval</title>
      </Helmet>

      <DispoderApprovalView urlData={params} />
    </>
  );
}
