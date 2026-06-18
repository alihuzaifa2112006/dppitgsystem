import { useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router';
import { decrypt } from 'src/api/encryption';
import { paths } from 'src/routes/paths';
import {ImportLCBillPaymentNewView} from 'src/sections/ImportLCBillPayment/view';

// ----------------------------------------------------------------------

export default function ImportLCBillPaymentNewPage() {

  return (
    <>
      <Helmet>
        <title> Import LC Bill Payment Add</title>
      </Helmet>

      <ImportLCBillPaymentNewView />
    </>
  );
}
