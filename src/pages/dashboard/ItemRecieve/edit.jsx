import { useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router';
import { decrypt } from 'src/api/encryption';
import { paths } from 'src/routes/paths';
import { useParams } from 'src/routes/hooks';

import { ItemRecieveEditView } from 'src/sections/ItemRecieve/view';

// ----------------------------------------------------------------------

export default function ItemRecieveEditPage() {
  const params = useParams();

  return (
    <>
      <Helmet>
        <title> ItemRecieve Edit</title>
      </Helmet>

      <ItemRecieveEditView urlData={params} />
    </>
  );
}
