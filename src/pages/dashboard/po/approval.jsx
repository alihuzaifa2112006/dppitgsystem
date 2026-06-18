import { useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useParams } from 'react-router';
import { decrypt } from 'src/api/encryption';
import { paths } from 'src/routes/paths';
import PoApprovalView from 'src/sections/po/view/po-approval-view';


// ----------------------------------------------------------------------

export default function PoApprovalPage() {
  const params = useParams();

  return (
    <>
      <Helmet>
        <title> Purchase Order: Approval</title>
      </Helmet>

      <PoApprovalView urlData={params} />
    </>
  );
}
