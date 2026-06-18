import { useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useParams } from 'react-router';
import { decrypt } from 'src/api/encryption';
import { paths } from 'src/routes/paths';

import ProductRpdfView from 'src/sections/ProductRequest/view/ProductRequest-pdf-view';

// ----------------------------------------------------------------------

export default function PrPdfPage() {
  const params = useParams();

  return (
    <>
      <Helmet>
        <title> Departmental Request: PDF</title>
      </Helmet>

      <ProductRpdfView urlData={params} />
    </>
  );
}
