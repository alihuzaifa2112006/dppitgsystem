import { useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router';
import { decrypt } from 'src/api/encryption';
import { paths } from 'src/routes/paths';
import { useParams } from 'src/routes/hooks';
import RTReportPDFView from 'src/sections/RTReport/view/RTReport-pdf-view';

// ----------------------------------------------------------------------

export default function ItemReceivePdfPage() {
  const params = useParams();

  return (
    <>
      <Helmet>
        <title> Rag Tearinig Production ReporT PDF : View PDF</title>
      </Helmet>

      <RTReportPDFView urlData={params} />
    </>
  );
}
