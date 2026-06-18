import { useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router';
import { decrypt } from 'src/api/encryption';
import { paths } from 'src/routes/paths';
import { useParams } from 'src/routes/hooks';
import { ItemOpenEditView } from 'src/sections/ItemOpen/view';


// ----------------------------------------------------------------------

export default function ItemOpenEditPage() {
  const params = useParams();

  return (
    <>
      <Helmet>
        <title> Item Open Edit</title>
      </Helmet>

      <ItemOpenEditView urlData={params} />
    </>
  );
}
