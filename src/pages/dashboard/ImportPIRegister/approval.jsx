import { useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router';
import { decrypt } from 'src/api/encryption';
import { paths } from 'src/routes/paths';
import { useParams } from 'src/routes/hooks';

import { QuotationApprovalView } from 'src/sections/quotation/view';

// ----------------------------------------------------------------------

export default function QuotationApprovalPage() {
  const params = useParams();

  return (
    <>
      <Helmet>
        <title> Quotation Approval</title>
      </Helmet>

      <QuotationApprovalView urlData={params} />
    </>
  );
}
