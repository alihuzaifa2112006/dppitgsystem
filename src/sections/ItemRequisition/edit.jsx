import { useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router';
import { decrypt } from 'src/api/encryption';
import { paths } from 'src/routes/paths';
import { useParams } from 'src/routes/hooks';

import { ItemRequisitionEditView } from 'src/sections/ItemRequisition/view';

// ----------------------------------------------------------------------

export default function ItemRequisitionEditPage() {
  const params = useParams();

  return (
    <>
      <Helmet>
        <title> ItemRequisition Edit</title>
      </Helmet>

      <ItemRequisitionEditView urlData={params} />
    </>
  );
}
