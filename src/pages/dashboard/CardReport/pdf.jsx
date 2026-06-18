import { useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router';
import { decrypt } from 'src/api/encryption';
import { paths } from 'src/routes/paths';
import { useParams } from 'src/routes/hooks';
import CardReportPDFView from 'src/sections/CardReport/view/CardReport-pdf-view';

// ----------------------------------------------------------------------

export default function ItemReceivePdfPage() {
  const params = useParams();

  return (
    <>
      <Helmet>
        <title>  Carding Report PDF : View PDF</title>
      </Helmet>

      <CardReportPDFView urlData={params} />
    </>
  );
}
