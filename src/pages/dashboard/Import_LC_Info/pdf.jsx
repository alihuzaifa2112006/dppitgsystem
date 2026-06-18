import { useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router';
import { decrypt } from 'src/api/encryption';
import { paths } from 'src/routes/paths';
import { useParams } from 'src/routes/hooks';
import ImportLCPDFView from 'src/sections/Import_LC_Info/view';


// ----------------------------------------------------------------------

export default function ImportLCPdfPage() {
  const params = useParams();

  return (
    <>
      <Helmet>
        <title> Import LC PDF</title>
      </Helmet>

      <ImportLCPDFView urlData={params} />
    </>
  );
}
