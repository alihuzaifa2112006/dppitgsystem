import { useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router';
import { decrypt } from 'src/api/encryption';
import { paths } from 'src/routes/paths';
import { useParams } from 'src/routes/hooks';
import { ExportEditViewMain } from 'src/sections/export/view';




// ----------------------------------------------------------------------

export default function PiEditPage() {
  const params = useParams();

  return (
    <>
      <Helmet>
        <title>L/C Tagging : Edit</title>
      </Helmet>

      <ExportEditViewMain urlData={params} />
    </>
  );
}
