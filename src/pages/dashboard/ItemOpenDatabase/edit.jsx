import { useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router';
import { decrypt } from 'src/api/encryption';
import { paths } from 'src/routes/paths';
import { useParams } from 'src/routes/hooks';
import { ItemOpenDatabaseEditView } from 'src/sections/ItemOpenDatabase/view';


// ----------------------------------------------------------------------

export default function ItemOpenDatabaseEditPage() {
  const params = useParams();

  return (
    <>
      <Helmet>
        <title> Item Open Edit</title>
      </Helmet>

      <ItemOpenDatabaseEditView urlData={params} />
    </>
  );
}
