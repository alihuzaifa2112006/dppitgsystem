import { useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router';
import { decrypt } from 'src/api/encryption';
import { paths } from 'src/routes/paths';
import { useParams } from 'src/routes/hooks';


import ExportInvoice from 'src/sections/commercial/view/ExportInvoice';

// ----------------------------------------------------------------------

export default function PiEditPage() {
  const params = useParams();

  return (
    <>
      <Helmet>
        <title> Export Invoice </title>
      </Helmet>

      <ExportInvoice urlData={params} />
    </>
  );
}
