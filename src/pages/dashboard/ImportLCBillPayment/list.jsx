import { useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router';
import { decrypt } from 'src/api/encryption';
import { paths } from 'src/routes/paths';
import {ImportLCBillPaymentGridView} from 'src/sections/ImportLCBillPayment/view';


// ----------------------------------------------------------------------

export default function ImportLCBillPaymentListPage() {
  return (
    <>
      <Helmet>
        <title> Import LC Bill Payment View</title>
      </Helmet>

      {/* <ImportLCListView /> */}
      <ImportLCBillPaymentGridView />
    </>
  );
}
