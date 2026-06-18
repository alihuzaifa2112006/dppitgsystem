import { useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router';
import { decrypt } from 'src/api/encryption';
import { paths } from 'src/routes/paths';
import { useParams } from 'src/routes/hooks';

import ItemIssuePDFView from 'src/sections/ItemIssue/view/ItemIssue-pdf-view';

// ----------------------------------------------------------------------

export default function ItemIssuePdfPage() {
  const params = useParams();

  return (
    <>
      <Helmet>
        <title> Item Issue PDF : View PDF</title>
      </Helmet>

      <ItemIssuePDFView urlData={params} />
    </>
  );
}
