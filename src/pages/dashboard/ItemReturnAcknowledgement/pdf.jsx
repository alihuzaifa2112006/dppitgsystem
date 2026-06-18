import { useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router';
import { decrypt } from 'src/api/encryption';
import { paths } from 'src/routes/paths';
import { useParams } from 'src/routes/hooks';

import ItemReturnAcknowledgementPDFView from 'src/sections/ItemReturnAcknowledgement/view/ItemReturnAcknowledgement-pdf-view';

// ----------------------------------------------------------------------

export default function ItemReturnAcknowledgementPdfPage() {
  const params = useParams();

  return (
    <>
      <Helmet>
        <title> Stock Acknowledgement PDF : View PDF</title>
      </Helmet>

      <ItemReturnAcknowledgementPDFView urlData={params} />
    </>
  );
}
