import { useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router';
import { decrypt } from 'src/api/encryption';
import { paths } from 'src/routes/paths';
import { useParams } from 'src/routes/hooks';

import ProductionPDFView from 'src/sections/ProductionReport/view/Production-pdf-view';

// ----------------------------------------------------------------------

export default function ItemReceivePdfPage() {
  const params = useParams();

  return (
    <>
      <Helmet>
        <title> Production Report PDF : View PDF</title>
      </Helmet>

      <ProductionPDFView urlData={params} />
    </>
  );
}
