import { useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router';
import { decrypt } from 'src/api/encryption';
import { paths } from 'src/routes/paths';
import {ImportInvoiceEntryGridView} from 'src/sections/Import_InvoiceEntry/view';


// ----------------------------------------------------------------------

export default function ImportInvoiceEntryListPage() {
  return (
    <>
      <Helmet>
        <title> Import Invoice Entry View</title>
      </Helmet>

      {/* <ImportLCListView /> */}
      <ImportInvoiceEntryGridView />
    </>
  );
}
