import { useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router';
import { decrypt } from 'src/api/encryption';
import { paths } from 'src/routes/paths';
import { useParams } from 'src/routes/hooks';
import { AssignEditView } from 'src/sections/assign/view';


// ----------------------------------------------------------------------

export default function AssignEditPage() {
  const params = useParams();

  return (
    <>
      <Helmet>
        <title> Assign Edit</title>
      </Helmet>

      <AssignEditView urlData={params} />
    </>
  );
}
