import { useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router';
import { decrypt } from 'src/api/encryption';
import { paths } from 'src/routes/paths';
import { useParams } from 'src/routes/hooks';
import { SamplePDFView } from 'src/sections/sample/view';


// ----------------------------------------------------------------------

export default function SamplePdfPage() {
  const params = useParams();

  return (
    <>
      <Helmet>
        <title> Sample Request Edit</title>
      </Helmet>

      <SamplePDFView urlData={params} />
    </>
  );
}
