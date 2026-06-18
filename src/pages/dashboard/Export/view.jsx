import { useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router';
import { decrypt } from 'src/api/encryption';
import { paths } from 'src/routes/paths';
import { useParams } from 'src/routes/hooks';
import { ExportEditView } from 'src/sections/export/view';




// ----------------------------------------------------------------------

export default function PiViewPage() {
  const params = useParams();

  return (
    <>
      <Helmet>
        <title>L/C Tagging View </title>
      </Helmet>

      <ExportEditView urlData={params} />
    </>
  );
}
