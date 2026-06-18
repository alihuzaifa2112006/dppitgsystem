import { useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useParams } from 'react-router';
import { decrypt } from 'src/api/encryption';
import { paths } from 'src/routes/paths';
import { PrEditView } from 'src/sections/pr/view';


// ----------------------------------------------------------------------

export default function PrEditPage() {
  const params = useParams();

  return (
    <>
      <Helmet>
        <title> Purchase Request: Edit</title>
      </Helmet>

      <PrEditView urlData={params} />
    </>
  );
}
