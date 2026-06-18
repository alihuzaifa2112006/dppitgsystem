import { useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router';
import { decrypt } from 'src/api/encryption';
import { paths } from 'src/routes/paths';
import { useParams } from 'src/routes/hooks';

import {ImportLCBillPaymentEditView} from 'src/sections/ImportLCBillPayment/view';

// ----------------------------------------------------------------------

export default function ImportLCBillPaymentEditPage() {
  const params = useParams();

  return (
    <>
      <Helmet>
        <title> Import LC Bill Payment Edit</title>
      </Helmet>

      <ImportLCBillPaymentEditView urlData={params} />
    </>
  );
}
