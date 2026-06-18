import { useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useParams } from 'react-router';
import { decrypt } from 'src/api/encryption';
import { paths } from 'src/routes/paths';
import { PoEditView } from 'src/sections/po/view';


// ----------------------------------------------------------------------

export default function PoEditPage() {
  const params = useParams();

  return (
    <>
      <Helmet>
        <title> Purchase Order: Edit</title>
      </Helmet>

      <PoEditView urlData={params} />
    </>
  );
}
