import { useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router';
import { decrypt } from 'src/api/encryption';
import { paths } from 'src/routes/paths';
import { useParams } from 'src/routes/hooks';

import {ImportInvoiceEntryEditView} from 'src/sections/Import_InvoiceEntry/view';

// ----------------------------------------------------------------------

export default function ImportInvoiceEntryEditPage() {
  const params = useParams();

  return (
    <>
      <Helmet>
        <title> Import Invoice Entry Edit</title>
      </Helmet>

      <ImportInvoiceEntryEditView urlData={params} />
    </>
  );
}
