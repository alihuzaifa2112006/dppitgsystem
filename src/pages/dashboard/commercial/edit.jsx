import { useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';

import { useParams } from 'src/routes/hooks';
import ExportInvoiceEditView from '../../../sections/commercial/view/ei-edit-view';



// ----------------------------------------------------------------------

export default function EIEditPage() {
  const params = useParams();

  return (
    <>
      <Helmet>
        <title>Export Invoice: Edit</title>
      </Helmet>

      <ExportInvoiceEditView urlData={params} />
    </>
  );
}
